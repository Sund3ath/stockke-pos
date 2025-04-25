"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Lade Umgebungsvariablen aus .env-Datei
dotenv_1.default.config();
// Konfiguration für die Datenbankverbindung
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'Kuntay1992.',
    database: process.env.DB_DATABASE || 'stockke_pos',
    synchronize: true, // Temporär aktivieren, um die Änderungen zu synchronisieren
    logging: process.env.NODE_ENV !== 'production',
    entities: [path_1.default.join(__dirname, '../entity/**/*.{js,ts}')],
    migrations: [path_1.default.join(__dirname, '../migrations/**/*.{js,ts}')],
    subscribers: [path_1.default.join(__dirname, '../subscriber/**/*.{js,ts}')],
    charset: 'utf8mb4_unicode_ci',
});
//# sourceMappingURL=database.js.map