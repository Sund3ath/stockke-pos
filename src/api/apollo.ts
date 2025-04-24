import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// HTTP-Link zum Backend-Server
const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
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

// Apollo Client erstellen
export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});