"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsTypeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
exports.settingsTypeDefs = (0, apollo_server_express_1.gql) `
  type Settings {
    id: ID!
    user: User!
    theme: String!
    language: String!
    notifications: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  input CreateSettingsInput {
    userId: ID!
    theme: String!
    language: String!
    notifications: Boolean!
  }

  extend type Query {
    settings: [Settings!]!
    settingsByUser(userId: ID!): Settings
  }

  extend type Mutation {
    createSettings(input: CreateSettingsInput!): Settings!
    updateSettings(id: ID!, input: CreateSettingsInput!): Settings!
    deleteSettings(id: ID!): Boolean!
  }
`;
//# sourceMappingURL=settings.schema.js.map