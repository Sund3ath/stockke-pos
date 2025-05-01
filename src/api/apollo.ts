import { ApolloClient, InMemoryCache, split, createHttpLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';
import { setContext } from '@apollo/client/link/context';

// HTTP-Link zum Backend-Server
const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
  credentials: 'include'
});

// Create WebSocket link
const wsLink = new WebSocketLink({
  uri: 'ws://localhost:4000/graphql',
  options: {
    reconnect: true,
    lazy: true,
    reconnectionAttempts: 5,
    connectionParams: () => {
      const token = localStorage.getItem('token');
      return {
        authorization: token ? `Bearer ${token}` : ''
      };
    },
    timeout: 30000,
    inactivityTimeout: 30000
  }
});

// Auth-Link für JWT-Token
const authLink = setContext((_, { headers }) => {
  // Token aus dem localStorage holen
  const token = localStorage.getItem('token');
  
  // Headers zurückgeben mit Authorization, wenn Token vorhanden
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  };
});

// Split links for subscription and query/mutation
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

// Apollo Client erstellen
export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
    query: {
      fetchPolicy: 'network-only',
    },
    mutate: {
      fetchPolicy: 'no-cache',
    },
  },
});