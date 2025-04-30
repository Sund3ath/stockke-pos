import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Query {
    # Existing queries...
    products: [Product!]!
    product(id: ID!): Product
    # Add our new public query
    productsByUserId(userId: ID!): [Product!]!
  }

  type Product {
    id: ID!
    name: String!
    price: Float!
    category: ProductCategory!
    image: String
    description: String
    inStock: Boolean!
    taxRate: Float!
    adminUser: User!
    adminUserId: ID!
  }

  type User {
    id: ID!
    username: String!
  }

  enum ProductCategory {
    mains
    sides
    drinks
  }

  # ... rest of schema
`; 