"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../config/data-source");
const User_1 = require("../entity/User");
const User_2 = require("../entity/User");
const bcrypt = __importStar(require("bcrypt"));
/**
 * Skript zum Erstellen eines Admin-Benutzers in der Datenbank
 */
async function createAdminUser() {
    try {
        // Datenbankverbindung initialisieren
        await data_source_1.AppDataSource.initialize();
        console.log('Database connection established');
        // Repository für Benutzer
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        // Prüfen, ob bereits ein Admin-Benutzer existiert
        const existingAdmin = await userRepository.findOneBy({ role: User_2.UserRole.ADMIN });
        if (existingAdmin) {
            console.log('Admin user already exists');
            await data_source_1.AppDataSource.destroy();
            return;
        }
        // Passwort hashen
        const passwordHash = await bcrypt.hash('admin123', 10);
        // Admin-Benutzer erstellen
        const adminUser = userRepository.create({
            username: 'admin',
            passwordHash,
            role: User_2.UserRole.ADMIN
        });
        // Admin-Benutzer speichern
        await userRepository.save(adminUser);
        console.log('Admin user created successfully');
        // Datenbankverbindung schließen
        await data_source_1.AppDataSource.destroy();
    }
    catch (error) {
        console.error('Error creating admin user:', error);
        await data_source_1.AppDataSource.destroy();
    }
}
// Skript ausführen
createAdminUser();
//# sourceMappingURL=create-admin-user.js.map