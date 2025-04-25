"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
// Lade Umgebungsvariablen aus .env-Datei
dotenv_1.default.config();
/**
 * Skript zum Erstellen der Datenbank, falls sie noch nicht existiert
 */
async function createDatabase() {
    try {
        // Konfiguration für die Datenbankverbindung
        const host = process.env.DB_HOST || 'localhost';
        const port = parseInt(process.env.DB_PORT || '3306');
        const user = process.env.DB_USERNAME || 'root';
        const password = process.env.DB_PASSWORD || 'Kuntay1992.';
        const database = process.env.DB_DATABASE || 'stockke_pos';
        // Verbindung zur MySQL-Instanz herstellen (ohne Datenbank)
        const connection = await promise_1.default.createConnection({
            host,
            port,
            user,
            password
        });
        // Datenbank erstellen, falls sie noch nicht existiert
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
        console.log(`Datenbank '${database}' wurde erstellt oder existiert bereits.`);
        // Verbindung schließen
        await connection.end();
    }
    catch (error) {
        console.error('Fehler beim Erstellen der Datenbank:', error);
    }
}
// Skript ausführen
createDatabase();
//# sourceMappingURL=create-database.js.map