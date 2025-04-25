"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryTypeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
exports.categoryTypeDefs = (0, apollo_server_express_1.gql) `
  type Category {
    id: ID!
    name: String!
    description: String
    products: [Product!]
    createdAt: String!
    updatedAt: String!
  }

  input CreateCategoryInput {
    name: String!
    description: String
  }

  input UpdateCategoryInput {
    name: String
    description: String
  }

  extend type Query {
    categories: [Category!]!
    category(id: ID!): Category
  }

  extend type Mutation {
    createCategory(input: CreateCategoryInput!): Category!
    updateCategory(id: ID!, input: UpdateCategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!
  }
`;
//# sourceMappingURL=category.schema.js.map