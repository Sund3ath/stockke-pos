"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const User_1 = require("../entity/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
/**
 * Skript zum Einfügen von Beispieldaten in die Datenbank
 */
async function seedData() {
    try {
        // Datenbankverbindung initialisieren
        await database_1.AppDataSource.initialize();
        console.log('Datenbankverbindung hergestellt');
        // Repository für Benutzer
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        // Prüfen, ob bereits Benutzer existieren
        const userCount = await userRepository.count();
        if (userCount > 0) {
            console.log('Datenbank enthält bereits Daten, Seeding wird übersprungen');
            await database_1.AppDataSource.destroy();
            return;
        }
        // Passwort hashen
        const adminPasswordHash = await bcrypt_1.default.hash('admin123', 10);
        const employeePasswordHash = await bcrypt_1.default.hash('employee123', 10);
        // Benutzer erstellen
        const adminUser = userRepository.create({
            username: 'admin',
            passwordHash: adminPasswordHash,
            role: User_1.UserRole.ADMIN
        });
        const employeeUser = userRepository.create({
            username: 'mitarbeiter',
            passwordHash: employeePasswordHash,
            role: User_1.UserRole.EMPLOYEE
        });
        // Benutzer speichern
        await userRepository.save([adminUser, employeeUser]);
        console.log('Beispielbenutzer erfolgreich erstellt');
        // Hier könnten weitere Beispieldaten für andere Entitäten eingefügt werden
        // z.B. Produkte, Kategorien, Einstellungen, etc.
        console.log('Seeding abgeschlossen');
        // Datenbankverbindung schließen
        await database_1.AppDataSource.destroy();
    }
    catch (error) {
        console.error('Fehler beim Seeding der Datenbank:', error);
    }
}
// Skript ausführen
seedData();
//# sourceMappingURL=seed-data.js.map