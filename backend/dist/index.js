"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const drainHttpServer_1 = require("@apollo/server/plugin/drainHttpServer");
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = require("body-parser");
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const auth_middleware_1 = require("./middleware/auth.middleware");
const user_resolver_1 = require("./graphql/resolvers/user.resolver");
const order_resolver_1 = require("./graphql/resolvers/order.resolver");
const product_resolver_1 = require("./graphql/resolvers/product.resolver");
const table_resolver_1 = require("./graphql/resolvers/table.resolver");
const settings_resolver_1 = require("./graphql/resolvers/settings.resolver");
const dailySales_resolver_1 = require("./graphql/resolvers/dailySales.resolver");
const category_1 = require("./graphql/resolvers/category");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Lade Umgebungsvariablen
dotenv_1.default.config();
// Definiere den Port
const PORT = process.env.PORT || 4000;
// Erstelle eine Express-Anwendung
const app = (0, express_1.default)();
const httpServer = http_1.default.createServer(app);
// Lade die GraphQL-Schemas
const loadSchemas = () => {
    const schemaPath = path_1.default.join(__dirname, 'graphql/schema');
    const schemaFiles = fs_1.default.readdirSync(schemaPath).filter(file => file.endsWith('.graphql'));
    let typeDefs = `#graphql
    type Query {
      _empty: String
    }
    
    type Mutation {
      _empty: String
    }
  `;
    for (const file of schemaFiles) {
        const schema = fs_1.default.readFileSync(path_1.default.join(schemaPath, file), 'utf8');
        typeDefs += '\n' + schema;
    }
    return typeDefs;
};
// Lade die GraphQL-Schemas
const typeDefs = loadSchemas();
// Kombiniere alle Resolver
const resolvers = {
    Query: {
        ...user_resolver_1.userResolvers.Query,
        ...order_resolver_1.orderResolvers.Query,
        ...product_resolver_1.productResolvers.Query,
        ...table_resolver_1.tableResolvers.Query,
        ...settings_resolver_1.settingsResolver.Query,
        ...dailySales_resolver_1.dailySalesResolver.Query,
        ...category_1.categoryResolvers.Query
    },
    Mutation: {
        ...user_resolver_1.userResolvers.Mutation,
        ...order_resolver_1.orderResolvers.Mutation,
        ...product_resolver_1.productResolvers.Mutation,
        ...table_resolver_1.tableResolvers.Mutation,
        ...settings_resolver_1.settingsResolver.Mutation,
        ...category_1.categoryResolvers.Mutation
    }
};
// Erstelle den Apollo-Server
const server = new server_1.ApolloServer({
    typeDefs,
    resolvers,
    plugins: [(0, drainHttpServer_1.ApolloServerPluginDrainHttpServer)({ httpServer })],
});
// Starte die Anwendung
async function startServer() {
    try {
        // Initialisiere die Datenbankverbindung
        await database_1.AppDataSource.initialize();
        console.log('Datenbankverbindung hergestellt');
        // Starte den Apollo-Server
        await server.start();
        console.log('Apollo-Server gestartet');
        // Konfiguriere Express-Middleware
        app.use('/graphql', (0, cors_1.default)(), (0, body_parser_1.json)(), auth_middleware_1.authMiddleware, // Authentifizierungs-Middleware hinzufügen
        (0, express4_1.expressMiddleware)(server, {
            context: async ({ req }) => {
                // Benutzerkontext an den Apollo-Server übergeben
                const authReq = req;
                return {
                    user: authReq.user ? {
                        id: authReq.user.id,
                        username: authReq.user.username,
                        role: authReq.user.role,
                        parentUser: authReq.user.parentUser
                    } : null
                };
            }
        }));
        // Starte den HTTP-Server
        await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
        console.log(`🚀 Server bereit unter http://localhost:${PORT}/graphql`);
    }
    catch (error) {
        console.error('Fehler beim Starten des Servers:', error);
    }
}
// Starte den Server
startServer();
//# sourceMappingURL=index.js.map