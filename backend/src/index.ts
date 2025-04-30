import 'reflect-metadata';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import http from 'http';
import cors from 'cors';
import { json } from 'body-parser';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import { authMiddleware, AuthRequest } from './middleware/auth.middleware';
import { userResolvers } from './graphql/resolvers/user.resolver';
import { orderResolvers } from './graphql/resolvers/order.resolver';
import { productResolvers } from './graphql/resolvers/product.resolver';
import { tableResolvers } from './graphql/resolvers/table.resolver';
import { settingsResolver } from './graphql/resolvers/settings.resolver';
import { dailySalesResolver } from './graphql/resolvers/dailySales.resolver';
import fs from 'fs';
import path from 'path';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { Context } from './types/context';

// Add this for __dirname support
declare const __dirname: string;

// Lade Umgebungsvariablen
dotenv.config();

// Definiere den Port
const PORT = process.env.PORT || 4000;

// Erstelle eine Express-Anwendung
const app = express();
const httpServer = http.createServer(app);

// Load all GraphQL schema files
const typesArray = loadFilesSync(path.join(process.cwd(), 'src/graphql/schema/**/*.graphql'));
const typeDefs = mergeTypeDefs(typesArray);

// Kombiniere alle Resolver
const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...orderResolvers.Query,
    ...productResolvers.Query,
    ...tableResolvers.Query,
    ...settingsResolver.Query,
    ...dailySalesResolver.Query
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...orderResolvers.Mutation,
    ...productResolvers.Mutation,
    ...tableResolvers.Mutation,
    ...settingsResolver.Mutation
  }
};

// Erstelle den Apollo-Server
const server = new ApolloServer<Context>({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// Add this function to check if operation is public
const isPublicOperation = (req: express.Request) => {
  const operationName = req.body?.operationName;
  return operationName === 'GetProductsByUserId';
};

// Starte die Anwendung
async function startServer() {
  try {
    // Initialisiere die Datenbankverbindung
    await AppDataSource.initialize();
    console.log('Database connection established');

    // Starte den Apollo-Server
    await server.start();
    console.log('Apollo Server started');

    // Konfiguriere Express-Middleware
    app.use(
      '/graphql',
      cors<cors.CorsRequest>({ 
        origin: ["https://pos.stockke.de", "http://localhost:5173"],
        credentials: true 
      }),
      json(),
      // Modify auth middleware to skip for public operations
      (req, res, next) => {
        if (isPublicOperation(req)) {
          return next();
        }
        return authMiddleware(req, res, next);
      },
      expressMiddleware(server, {
        context: async ({ req }): Promise<Context> => {
          if (isPublicOperation(req)) {
            return { 
              dataSource: AppDataSource,
              isPublicOperation: true,
              user: null
            };
          }
          const authReq = req as AuthRequest;
          return {
            dataSource: AppDataSource,
            user: authReq.user ? {
              id: authReq.user.id,
              username: authReq.user.username,
              role: authReq.user.role,
              parentUser: authReq.user.parentUser
            } : null,
            isPublicOperation: false
          };
        }
      }),
    );

    // Starte den HTTP-Server
    await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

// Starte den Server
startServer();