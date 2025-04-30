import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs } from './typeDefs';
import { resolvers } from './resolvers';

// ... other imports ...

try {
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  // Debug logging
  console.log('Schema created successfully');
  const queryFields = schema.getQueryType()?.getFields();
  console.log('Available Query fields:', Object.keys(queryFields || {}));

  const server = new ApolloServer({
    schema,
    context: ({ req }) => {
      return { req };
    },
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return error;
    }
  });

  // ... rest of server setup ... 
} catch (error) {
  console.error('Error setting up Apollo Server:', error);
  throw error;
} 