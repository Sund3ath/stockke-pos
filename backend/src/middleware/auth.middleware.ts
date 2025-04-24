import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entity';

// Interface für den dekodierten Token
interface DecodedToken {
  id: number;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

// Interface für den erweiterten Request mit Benutzer
export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
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
          req.user = {
            id: decoded.id,
            username: decoded.username,
            role: decoded.role
          };
          
          // Optional: Benutzer aus der Datenbank laden, um sicherzustellen, dass er noch existiert
          const userRepository = AppDataSource.getRepository(User);
          const user = await userRepository.findOne({ where: { id: decoded.id } });
          
          if (!user) {
            // Benutzer existiert nicht mehr
            req.user = undefined;
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
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Keine Berechtigung' });
  }
  
  next();
};