"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const user_resolver_1 = require("./user.resolver");
const product_resolver_1 = require("./product.resolver");
const order_resolver_1 = require("./order.resolver");
const table_resolver_1 = require("./table.resolver");
const settings_resolver_1 = require("./settings.resolver");
const dailySales_resolver_1 = require("./dailySales.resolver");
// Kombiniere alle Resolver
exports.resolvers = [
    user_resolver_1.userResolvers,
    product_resolver_1.productResolvers,
    order_resolver_1.orderResolvers,
    table_resolver_1.tableResolvers,
    settings_resolver_1.settingsResolver,
    dailySales_resolver_1.dailySalesResolver
];
//# sourceMappingURL=index.js.map