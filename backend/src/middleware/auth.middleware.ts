import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entity';

// Interface für den dekodierten Token
interface DecodedToken {
  id: number;
  username: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Interface für den Request mit Benutzer
export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: UserRole;
    parentUser: {
      id: number;
      username: string;
      role: UserRole;
    } | null;
  };
}

/**
 * Middleware zur Authentifizierung von Anfragen mittels JWT
 */
export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
          const decoded = jwt.verify(token, secret) as DecodedToken;
          
          // Benutzer in den Request-Kontext setzen
          const userRepository = AppDataSource.getRepository(User);
          const user = await userRepository.findOne({ 
            where: { id: decoded.id },
            relations: ['parentUser']
          });
          
          if (!user) {
            // Benutzer existiert nicht mehr
            req.user = undefined;
          } else {
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
        } catch (error) {
          // Token ist ungültig oder abgelaufen
          req.user = undefined;
        }
      }
    }
    
    // Weiter zur nächsten Middleware oder Route
    next();
  } catch (error) {
    console.error('Fehler in der Auth-Middleware:', error);
    next();
  }
};

/**
 * Middleware zur Überprüfung, ob ein Benutzer authentifiziert ist
 */
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Nicht authentifiziert' });
  }
  
  next();
};

/**
 * Middleware zur Überprüfung, ob ein Benutzer Admin-Rechte hat
 */
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Nicht authentifiziert' });
  }
  
  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: 'Keine Berechtigung' });
  }
  
  next();
};