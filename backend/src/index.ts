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
import { createPubSub } from 'graphql-yoga';
import { WebSocketServer } from 'ws';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';

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

// Create pubsub instance
const pubsub = createPubSub();

// Create HTTP server
const app = express();
const httpServer = createServer(app);

// Configure CORS
app.use(cors({
  origin: ["https://pos.stockke.de", "http://localhost:5173"],
  credentials: true
}));

// Create WebSocket server
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
  perMessageDeflate: {
    zlibDeflateOptions: {
      chunkSize: 1024,
      memLevel: 7,
      level: 3
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    clientNoContextTakeover: true,
    serverNoContextTakeover: true,
    serverMaxWindowBits: 10,
    concurrencyLimit: 10,
    threshold: 1024
  }
});

// Add error handling for WebSocket server
wsServer.on('error', (error: Error) => {
  console.error('WebSocket server error:', error);
});

// Create GraphQL Yoga server options
const yoga = createYoga({
  schema,
  context: async ({ request }) => {
    try {
      const token = request.headers.get('authorization')?.split(' ')[1];
      
      if (!token) {
        console.log('No token provided');
        return { user: null, dataSource: AppDataSource, pubsub };
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
        return { user: null, dataSource: AppDataSource, pubsub };
      }

      console.log('User authenticated:', user.id);
      return { user, dataSource: AppDataSource, pubsub };
    } catch (error) {
      console.error('Error in context:', error);
      return { user: null, dataSource: AppDataSource, pubsub };
    }
  },
});

// Mount the Yoga middleware
app.use('/graphql', yoga);

// Set up WebSocket server
SubscriptionServer.create(
  {
    schema,
    execute,
    subscribe,
    onConnect: async (connectionParams: any) => {
      try {
        const token = connectionParams?.authorization?.split(' ')[1];
        
        if (!token) {
          console.log('No token provided in WebSocket connection');
          return { user: null, dataSource: AppDataSource, pubsub };
        }

        const secret = process.env.JWT_SECRET || 'stockke_pos_very_secure_secret_key_change_in_production';
        const decoded = jwt.verify(token, secret) as { id: number };
        
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ 
          where: { id: decoded.id },
          relations: ['parentUser']
        });

        if (!user) {
          console.log('User not found in WebSocket connection');
          return { user: null, dataSource: AppDataSource, pubsub };
        }

        console.log('WebSocket user authenticated:', user.id);
        return { user, dataSource: AppDataSource, pubsub };
      } catch (error) {
        console.error('Error in WebSocket context:', error);
        return { user: null, dataSource: AppDataSource, pubsub };
      }
    },
    onDisconnect: () => {
      console.log('Client disconnected');
    }
  },
  wsServer
);

// Start the server
async function startServer() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('Database connection established');

    // Start the HTTP server
    await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    console.log(`🚀 WebSocket server ready at ws://localhost:${PORT}/graphql`);
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();