"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productTypeDefs = void 0;
const graphql_tag_1 = require("graphql-tag");
exports.productTypeDefs = (0, graphql_tag_1.gql) `
  type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    category: Category
    stock: Int!
    createdAt: String!
    updatedAt: String!
  }

  input CreateProductInput {
    name: String!
    description: String
    price: Float!
    categoryId: ID
    stock: Int!
  }

  input UpdateProductInput {
    name: String
    description: String
    price: Float
    categoryId: ID
    stock: Int
  }

  extend type Query {
    products: [Product!]!
    product(id: ID!): Product
  }

  extend type Mutation {
    createProduct(input: CreateProductInput!): Product!
    updateProduct(id: ID!, input: UpdateProductInput!): Product!
    deleteProduct(id: ID!): Boolean!
  }
`;
//# sourceMappingURL=product.schema.js.map