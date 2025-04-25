"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const category_schema_1 = require("./category.schema");
const product_schema_1 = require("./product.schema");
const dailySales_schema_1 = require("./dailySales.schema");
const settings_schema_1 = require("./settings.schema");
const baseTypeDefs = (0, apollo_server_express_1.gql) `
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;
exports.typeDefs = [
    baseTypeDefs,
    category_schema_1.categoryTypeDefs,
    product_schema_1.productTypeDefs,
    dailySales_schema_1.dailySalesTypeDefs,
    settings_schema_1.settingsTypeDefs,
];
//# sourceMappingURL=index.js.map