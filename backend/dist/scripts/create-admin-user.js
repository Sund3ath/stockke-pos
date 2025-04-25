"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const User_1 = require("../entity/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
/**
 * Skript zum Erstellen eines Admin-Benutzers in der Datenbank
 */
async function createAdminUser() {
    try {
        // Datenbankverbindung initialisieren
        await database_1.AppDataSource.initialize();
        console.log('Datenbankverbindung hergestellt');
        // Repository für Benutzer
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        // Prüfen, ob bereits ein Admin-Benutzer existiert
        const existingAdmin = await userRepository.findOne({ where: { username: 'admin' } });
        if (existingAdmin) {
            console.log('Admin-Benutzer existiert bereits');
            await database_1.AppDataSource.destroy();
            return;
        }
        // Passwort hashen
        const passwordHash = await bcrypt_1.default.hash('admin123', 10);
        // Admin-Benutzer erstellen
        const adminUser = userRepository.create({
            username: 'admin',
            passwordHash,
            role: User_1.UserRole.ADMIN
        });
        // Admin-Benutzer speichern
        await userRepository.save(adminUser);
        console.log('Admin-Benutzer erfolgreich erstellt');
        // Datenbankverbindung schließen
        await database_1.AppDataSource.destroy();
    }
    catch (error) {
        console.error('Fehler beim Erstellen des Admin-Benutzers:', error);
    }
}
// Skript ausführen
createAdminUser();
//# sourceMappingURL=create-admin-user.js.map