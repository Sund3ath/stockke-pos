"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dailySalesTypeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
exports.dailySalesTypeDefs = (0, apollo_server_express_1.gql) `
  type DailySale {
    id: ID!
    date: String!
    totalSales: Float!
    numberOfTransactions: Int!
    averageTransactionValue: Float!
    createdAt: String!
    updatedAt: String!
  }

  input CreateDailySaleInput {
    date: String!
    totalSales: Float!
    numberOfTransactions: Int!
  }

  extend type Query {
    dailySales: [DailySale!]!
    dailySale(id: ID!): DailySale
    dailySaleByDate(date: String!): DailySale
  }

  extend type Mutation {
    createDailySale(input: CreateDailySaleInput!): DailySale!
    updateDailySale(id: ID!, input: CreateDailySaleInput!): DailySale!
    deleteDailySale(id: ID!): Boolean!
  }
`;
//# sourceMappingURL=dailySales.schema.js.map