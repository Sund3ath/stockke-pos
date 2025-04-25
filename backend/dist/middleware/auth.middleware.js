"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.requireAuth = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const entity_1 = require("../entity");
/**
 * Middleware zur Authentifizierung von Anfragen mittels JWT
 */
const authMiddleware = async (req, res, next) => {
    try {
        // Authorization-Header extrahieren
        const authHeader = req.headers.authorization;
        if (authHeader) {
            // Token aus dem Header extrahieren (Format: "Bearer TOKEN")
            const token = authHeader.split(' ')[1];
            if (token) {
                // JWT-Secret aus der Umgebungsvariable oder Fallback
                const secret = process.env.JWT_SECRET || 'stockke_pos_very_secure_secret_key_change_in_production';
                try {
                    // Token verifizieren
                    const decoded = jsonwebtoken_1.default.verify(token, secret);
                    // Benutzer in den Request-Kontext setzen
                    const userRepository = database_1.AppDataSource.getRepository(entity_1.User);
                    const user = await userRepository.findOne({
                        where: { id: decoded.id },
                        relations: ['parentUser']
                    });
                    if (!user) {
                        // Benutzer existiert nicht mehr
                        req.user = undefined;
                    }
                    else {
                        // Benutzer mit vollständigen Daten setzen
                        req.user = {
                            id: user.id,
                            username: user.username,
                            role: user.role,
                            parentUser: user.parentUser ? {
                                id: user.parentUser.id,
                                username: user.parentUser.username,
                                role: user.parentUser.role
                            } : null
                        };
                    }
                }
                catch (error) {
                    // Token ist ungültig oder abgelaufen
                    req.user = undefined;
                }
            }
        }
        // Weiter zur nächsten Middleware oder Route
        next();
    }
    catch (error) {
        console.error('Fehler in der Auth-Middleware:', error);
        next();
    }
};
exports.authMiddleware = authMiddleware;
/**
 * Middleware zur Überprüfung, ob ein Benutzer authentifiziert ist
 */
const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Nicht authentifiziert' });
    }
    next();
};
exports.requireAuth = requireAuth;
/**
 * Middleware zur Überprüfung, ob ein Benutzer Admin-Rechte hat
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Nicht authentifiziert' });
    }
    if (req.user.role !== entity_1.UserRole.ADMIN) {
        return res.status(403).json({ error: 'Keine Berechtigung' });
    }
    next();
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=auth.middleware.js.map