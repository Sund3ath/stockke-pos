import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { createYoga } from '@graphql-yoga/node';
import { makeExecutableSchema } from '@graphql-tools/schema';
import cors from 'cors';
import { json } from 'body-parser';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import { authMiddleware } from './middleware/auth.middleware';
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
import jwt from 'jsonwebtoken';
import { User } from './entity/User';

// Add this for __dirname support
declare const __dirname: string;

// Lade Umgebungsvariablen
dotenv.config();

// Definiere den Port
const PORT = process.env.PORT || 4000;

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
  },
  Subscription: orderResolvers.Subscription || {}
};

// Create schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Create HTTP server
const app = express();
const httpServer = createServer(app);

// Create GraphQL Yoga server options
const yoga = createYoga({
  schema,
  context: async ({ request }) => {
    try {
      const token = request.headers.get('authorization')?.split(' ')[1];
      
      if (!token) {
        console.log('No token provided');
        return { user: null, dataSource: AppDataSource };
      }

      const secret = process.env.JWT_SECRET || 'stockke_pos_very_secure_secret_key_change_in_production';
      const decoded = jwt.verify(token, secret) as { id: number };
      
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ 
        where: { id: decoded.id },
        relations: ['parentUser']
      });

      if (!user) {
        console.log('User not found');
        return { user: null, dataSource: AppDataSource };
      }

      console.log('User authenticated:', user.id);
      return { user, dataSource: AppDataSource };
    } catch (error) {
      console.error('Error in context:', error);
      return { user: null, dataSource: AppDataSource };
    }
  }
});

// Add this function to check if operation is public
const isPublicOperation = (req: Request) => {
  const operationName = req.body?.operationName;
  return operationName === 'GetProductsByUserId';
};

// Starte die Anwendung
async function startServer() {
  try {
    // Initialisiere die Datenbankverbindung
    await AppDataSource.initialize();
    console.log('Database connection established');

    // Configure Express middleware
    app.use(cors({
      origin: ["https://pos.stockke.de", "http://localhost:5173"],
      credentials: true
    }));
    app.use(json());
    
    // Auth middleware
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (isPublicOperation(req)) {
        return next();
      }
      return authMiddleware(req, res, next);
    });

    // Mount the Yoga middleware
    app.use('/graphql', yoga);

    // Starte den HTTP-Server
    await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    console.log(`🚀 WebSocket server ready at ws://localhost:${PORT}/graphql`);
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

// Starte den Server
startServer();