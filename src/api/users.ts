import { gql } from '@apollo/client';
import { apolloClient } from './apollo';

// GraphQL-Typen
export interface User {
  id: string;
  username: string;
  role: "ADMIN" | "EMPLOYEE";
}

export interface CreateUserInput {
  username: string;
  password: string;
  role: "ADMIN" | "EMPLOYEE";
}

// GraphQL-Dokumente
const GET_USERS = gql`
  query GetUsers {
    users {
      id
      username
      role
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      username
      role
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

// Direkte Client-Methoden
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const { data } = await apolloClient.query({
      query: GET_USERS,
      fetchPolicy: 'network-only'
    });
    
    return data.users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const createUser = async (input: CreateUserInput): Promise<User | null> => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: CREATE_USER,
      variables: { input },
      refetchQueries: [{ query: GET_USERS }]
    });
    
    return data.createUser;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
};

export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: DELETE_USER,
      variables: { id },
      refetchQueries: [{ query: GET_USERS }]
    });
    
    return data.deleteUser;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
};