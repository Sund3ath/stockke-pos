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

// Lade Umgebungsvariablen
dotenv.config();

// Definiere den Port
const PORT = process.env.PORT || 4000;

// Erstelle eine Express-Anwendung
const app = express();
const httpServer = http.createServer(app);

// Lade die GraphQL-Schemas
const loadSchemas = () => {
  const schemaPath = path.join(__dirname, 'graphql/schema');
  const schemaFiles = fs.readdirSync(schemaPath).filter(file => file.endsWith('.graphql'));
  
  let typeDefs = `#graphql
    type Query {
      _empty: String
    }
    
    type Mutation {
      _empty: String
    }
  `;
  
  for (const file of schemaFiles) {
    const schema = fs.readFileSync(path.join(schemaPath, file), 'utf8');
    typeDefs += '\n' + schema;
  }
  
  return typeDefs;
};

// Lade die GraphQL-Schemas
const typeDefs = loadSchemas();

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
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// Starte die Anwendung
async function startServer() {
  try {
    // Initialisiere die Datenbankverbindung
    await AppDataSource.initialize();
    console.log('Datenbankverbindung hergestellt');

    // Starte den Apollo-Server
    await server.start();
    console.log('Apollo-Server gestartet');

    // Konfiguriere Express-Middleware
    app.use(
      '/graphql',
      cors<cors.CorsRequest>({ origin: "https://pos.stockke.de", credentials: true }),
      json(),
      authMiddleware, // Authentifizierungs-Middleware hinzufügen
      expressMiddleware(server, {
        context: async ({ req }) => {
          // Benutzerkontext an den Apollo-Server übergeben
          const authReq = req as AuthRequest;
          return {
            user: authReq.user ? {
              id: authReq.user.id,
              username: authReq.user.username,
              role: authReq.user.role,
              parentUser: authReq.user.parentUser
            } : null
          };
        }
      }),
    );

    // Starte den HTTP-Server
    await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
    console.log(`🚀 Server bereit unter http://localhost:${PORT}/graphql`);
  } catch (error) {
    console.error('Fehler beim Starten des Servers:', error);
  }
}

// Starte den Server
startServer();