import { apolloClient } from './apollo';
import { gql } from '@apollo/client';
import { Product, Order, Customer, Settings } from '../types';

// GraphQL-Dokumente
const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      price
      category
      image
      description
      inStock
      taxRate
    }
  }
`;

const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      name
      price
      category
      image
      description
      inStock
      taxRate
    }
  }
`;

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      name
      price
      category
      image
      description
      inStock
      taxRate
    }
  }
`;

const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

// Direkte Client-Methoden
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const { data } = await apolloClient.query({
      query: GET_PRODUCTS,
      fetchPolicy: 'network-only'
    });
    
    return data.products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const createProduct = async (input: Omit<Product, 'id'>): Promise<Product | null> => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: CREATE_PRODUCT,
      variables: { input },
      refetchQueries: [{ query: GET_PRODUCTS }]
    });
    
    return data.createProduct;
  } catch (error) {
    console.error('Error creating product:', error);
    return null;
  }
};

export const updateProduct = async (id: string, input: Partial<Product>): Promise<Product | null> => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_PRODUCT,
      variables: { id, input },
      refetchQueries: [{ query: GET_PRODUCTS }]
    });
    
    return data.updateProduct;
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: DELETE_PRODUCT,
      variables: { id },
      refetchQueries: [{ query: GET_PRODUCTS }]
    });
    
    return data.deleteProduct;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
};