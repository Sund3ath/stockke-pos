"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.salesTypeDefs = void 0;
const graphql_tag_1 = require("graphql-tag");
exports.salesTypeDefs = (0, graphql_tag_1.gql) `
  type Sale {
    id: ID!
    date: String!
    totalAmount: Float!
    items: [SaleItem!]!
    paymentMethod: String!
    createdAt: String!
    updatedAt: String!
  }

  type SaleItem {
    id: ID!
    product: Product!
    quantity: Int!
    price: Float!
    total: Float!
  }

  input CreateSaleInput {
    date: String!
    items: [CreateSaleItemInput!]!
    paymentMethod: String!
  }

  input CreateSaleItemInput {
    productId: ID!
    quantity: Int!
    price: Float!
  }

  extend type Query {
    sales: [Sale!]!
    sale(id: ID!): Sale
    salesByDate(date: String!): [Sale!]!
  }

  extend type Mutation {
    createSale(input: CreateSaleInput!): Sale!
    updateSale(id: ID!, input: CreateSaleInput!): Sale!
    deleteSale(id: ID!): Boolean!
  }
`;
//# sourceMappingURL=sales.schema.js.map