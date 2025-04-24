import { gql, useQuery, useMutation } from '@apollo/client';
import { Product } from '../types';

// GraphQL-Typen
export interface ProductsResponse {
  products: Product[];
}

export interface ProductResponse {
  product: Product;
}

export interface CreateProductInput {
  name: string;
  price: number;
  category: 'mains' | 'sides' | 'drinks';
  image?: string;
  description?: string;
  inStock: boolean;
  taxRate: number;
}

export interface UpdateProductInput {
  name?: string;
  price?: number;
  category?: 'mains' | 'sides' | 'drinks';
  image?: string;
  description?: string;
  inStock?: boolean;
  taxRate?: number;
}

// Queries
export const GET_PRODUCTS = gql`
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
      adminUser {
        id
        username
      }
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      price
      category
      image
      description
      inStock
      taxRate
      adminUser {
        id
        username
      }
    }
  }
`;

// Mutations
export const CREATE_PRODUCT = gql`
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
      adminUser {
        id
        username
      }
    }
  }
`;

export const UPDATE_PRODUCT = gql`
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
      adminUser {
        id
        username
      }
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

// Hooks
export const useProducts = () => {
  const { data, loading, error, refetch } = useQuery<ProductsResponse>(GET_PRODUCTS);
  
  return {
    products: data?.products || [],
    loading,
    error,
    refetch
  };
};

export const useProduct = (id: string) => {
  const { data, loading, error } = useQuery<ProductResponse>(GET_PRODUCT, {
    variables: { id }
  });
  
  return {
    product: data?.product,
    loading,
    error
  };
};

export const useCreateProduct = () => {
  const [createProductMutation, { loading, error }] = useMutation<
    { createProduct: Product },
    { input: CreateProductInput }
  >(CREATE_PRODUCT, {
    refetchQueries: [{ query: GET_PRODUCTS }]
  });
  
  const createProduct = async (input: CreateProductInput) => {
    try {
      const { data } = await createProductMutation({
        variables: { input }
      });
      
      return data?.createProduct;
    } catch (err) {
      console.error('Error creating product:', err);
      return null;
    }
  };
  
  return {
    createProduct,
    loading,
    error
  };
};

export const useUpdateProduct = () => {
  const [updateProductMutation, { loading, error }] = useMutation<
    { updateProduct: Product },
    { id: string; input: UpdateProductInput }
  >(UPDATE_PRODUCT, {
    refetchQueries: [{ query: GET_PRODUCTS }]
  });
  
  const updateProduct = async (id: string, input: UpdateProductInput) => {
    try {
      const { data } = await updateProductMutation({
        variables: { id, input }
      });
      
      return data?.updateProduct;
    } catch (err) {
      console.error('Error updating product:', err);
      return null;
    }
  };
  
  return {
    updateProduct,
    loading,
    error
  };
};

export const useDeleteProduct = () => {
  const [deleteProductMutation, { loading, error }] = useMutation<
    { deleteProduct: boolean },
    { id: string }
  >(DELETE_PRODUCT, {
    refetchQueries: [{ query: GET_PRODUCTS }]
  });
  
  const deleteProduct = async (id: string) => {
    try {
      const { data } = await deleteProductMutation({
        variables: { id }
      });
      
      return data?.deleteProduct || false;
    } catch (err) {
      console.error('Error deleting product:', err);
      return false;
    }
  };
  
  return {
    deleteProduct,
    loading,
    error
  };
};