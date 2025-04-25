"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userResolvers = void 0;
const database_1 = require("../../config/database");
const entity_1 = require("../../entity");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Repository
const userRepository = database_1.AppDataSource.getRepository(entity_1.User);
// Hilfsfunktion zum Generieren eines JWT-Tokens
const generateToken = (user) => {
    const secret = process.env.JWT_SECRET || 'stockke_pos_very_secure_secret_key_change_in_production';
    const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
    const payload = { id: user.id, username: user.username, role: user.role };
    // Wir umgehen die Typisierung, indem wir das options-Objekt direkt übergeben
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
};
exports.userResolvers = {
    Query: {
        // Aktueller Benutzer (basierend auf JWT-Token)
        me: async (_, __, context) => {
            if (!context.user) {
                return null;
            }
            return await userRepository.findOne({
                where: { id: context.user.id },
                relations: ['settings', 'parentUser', 'employees']
            });
        },
        // Alle Benutzer (nur für Admins)
        users: async (_, __, context) => {
            if (!context.user || context.user.role !== entity_1.UserRole.ADMIN) {
                throw new Error('Nicht autorisiert');
            }
            return await userRepository.find({
                relations: ['parentUser', 'employees']
            });
        },
        // Benutzer nach ID (nur für Admins)
        user: async (_, { id }, context) => {
            if (!context.user || context.user.role !== entity_1.UserRole.ADMIN) {
                throw new Error('Nicht autorisiert');
            }
            return await userRepository.findOne({
                where: { id },
                relations: ['settings', 'parentUser', 'employees']
            });
        }
    },
    Mutation: {
        // Login
        login: async (_, { input }) => {
            const { username, password } = input;
            // Benutzer finden
            const user = await userRepository.findOne({
                where: { username },
                relations: ['parentUser', 'employees']
            });
            if (!user) {
                throw new Error('Ungültiger Benutzername oder Passwort');
            }
            // Passwort überprüfen
            const isPasswordValid = await bcrypt_1.default.compare(password, user.passwordHash);
            if (!isPasswordValid) {
                throw new Error('Ungültiger Benutzername oder Passwort');
            }
            // Token generieren
            const token = generateToken(user);
            return {
                token,
                user
            };
        },
        // Benutzer erstellen (nur für Admins)
        createUser: async (_, { input }, context) => {
            if (!context.user || context.user.role !== entity_1.UserRole.ADMIN) {
                throw new Error('Nicht autorisiert');
            }
            const { username, password, role, parentUserId } = input;
            // Prüfen, ob Benutzername bereits existiert
            const existingUser = await userRepository.findOne({ where: { username } });
            if (existingUser) {
                throw new Error('Benutzername bereits vergeben');
            }
            let parentUser = null;
            if (parentUserId) {
                parentUser = await userRepository.findOne({ where: { id: parentUserId } });
                if (!parentUser || parentUser.role !== entity_1.UserRole.ADMIN) {
                    throw new Error('Ungültiger Parent User');
                }
            }
            // Passwort hashen
            const passwordHash = await bcrypt_1.default.hash(password, 10);
            // Benutzer erstellen
            const user = userRepository.create({
                username,
                passwordHash,
                role: role || entity_1.UserRole.EMPLOYEE,
                parentUser: parentUser || context.user // Wenn kein parentUserId angegeben ist, verwende den erstellenden Admin
            });
            return await userRepository.save(user);
        },
        // Benutzer aktualisieren (nur für Admins oder eigenen Account)
        updateUser: async (_, { id, input }, context) => {
            if (!context.user) {
                throw new Error('Nicht autorisiert');
            }
            // Nur Admins können andere Benutzer bearbeiten
            if (context.user.id !== id && context.user.role !== entity_1.UserRole.ADMIN) {
                throw new Error('Nicht autorisiert');
            }
            // Benutzer finden
            const user = await userRepository.findOne({
                where: { id },
                relations: ['parentUser']
            });
            if (!user) {
                throw new Error('Benutzer nicht gefunden');
            }
            // Daten aktualisieren
            if (input.username) {
                user.username = input.username;
            }
            if (input.password) {
                user.passwordHash = await bcrypt_1.default.hash(input.password, 10);
            }
            // Nur Admins können die Rolle ändern
            if (input.role && context.user.role === entity_1.UserRole.ADMIN) {
                user.role = input.role;
            }
            if (input.parentUserId && context.user.role === entity_1.UserRole.ADMIN) {
                const newParentUser = await userRepository.findOne({ where: { id: input.parentUserId } });
                if (!newParentUser || newParentUser.role !== entity_1.UserRole.ADMIN) {
                    throw new Error('Ungültiger Parent User');
                }
                user.parentUser = newParentUser;
            }
            return await userRepository.save(user);
        },
        // Benutzer löschen (nur für Admins)
        deleteUser: async (_, { id }, context) => {
            if (!context.user || context.user.role !== entity_1.UserRole.ADMIN) {
                throw new Error('Nicht autorisiert');
            }
            // Benutzer finden
            const user = await userRepository.findOne({ where: { id } });
            if (!user) {
                throw new Error('Benutzer nicht gefunden');
            }
            // Admin-Benutzer kann nicht gelöscht werden
            if (user.username === 'admin') {
                throw new Error('Der Admin-Benutzer kann nicht gelöscht werden');
            }
            await userRepository.remove(user);
            return true;
        }
    }
};
//# sourceMappingURL=user.resolver.js.map