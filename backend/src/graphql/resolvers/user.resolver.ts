import { AppDataSource } from '../../config/database';
import { User, UserRole } from '../../entity';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Repository
const userRepository = AppDataSource.getRepository(User);

// Hilfsfunktion zum Generieren eines JWT-Tokens
const generateToken = (user: User): string => {
  const secret = process.env.JWT_SECRET || 'stockke_pos_very_secure_secret_key_change_in_production';
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
  
  const payload = { id: user.id, username: user.username, role: user.role };
  
  // Wir umgehen die Typisierung, indem wir das options-Objekt direkt übergeben
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

export const userResolvers = {
  Query: {
    // Aktueller Benutzer (basierend auf JWT-Token)
    me: async (_: any, __: any, context: any) => {
      if (!context.user) {
        return null;
      }
      
      return await userRepository.findOne({ 
        where: { id: context.user.id },
        relations: ['settings', 'parentUser', 'employees']
      });
    },
    
    // Alle Benutzer (nur für Admins)
    users: async (_: any, __: any, context: any) => {
      if (!context.user || context.user.role !== UserRole.ADMIN) {
        throw new Error('Nicht autorisiert');
      }
      
      return await userRepository.find({
        relations: ['parentUser', 'employees']
      });
    },
    
    // Benutzer nach ID (nur für Admins)
    user: async (_: any, { id }: { id: number }, context: any) => {
      if (!context.user || context.user.role !== UserRole.ADMIN) {
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
    login: async (_: any, { input }: { input: { username: string, password: string } }) => {
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
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
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
    createUser: async (_: any, { input }: { input: { username: string, password: string, role: UserRole, parentUserId?: number } }, context: any) => {
      if (!context.user || context.user.role !== UserRole.ADMIN) {
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
        if (!parentUser || parentUser.role !== UserRole.ADMIN) {
          throw new Error('Ungültiger Parent User');
        }
      }
      
      // Passwort hashen
      const passwordHash = await bcrypt.hash(password, 10);
      
      // Benutzer erstellen
      const user = userRepository.create({
        username,
        passwordHash,
        role: role || UserRole.EMPLOYEE,
        parentUser: parentUser || context.user // Wenn kein parentUserId angegeben ist, verwende den erstellenden Admin
      });
      
      return await userRepository.save(user);
    },
    
    // Benutzer aktualisieren (nur für Admins oder eigenen Account)
    updateUser: async (_: any, { id, input }: { id: number, input: { username?: string, password?: string, role?: UserRole, parentUserId?: number } }, context: any) => {
      if (!context.user) {
        throw new Error('Nicht autorisiert');
      }
      
      // Nur Admins können andere Benutzer bearbeiten
      if (context.user.id !== id && context.user.role !== UserRole.ADMIN) {
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
        user.passwordHash = await bcrypt.hash(input.password, 10);
      }
      
      // Nur Admins können die Rolle ändern
      if (input.role && context.user.role === UserRole.ADMIN) {
        user.role = input.role;
      }
      
      if (input.parentUserId && context.user.role === UserRole.ADMIN) {
        const newParentUser = await userRepository.findOne({ where: { id: input.parentUserId } });
        if (!newParentUser || newParentUser.role !== UserRole.ADMIN) {
          throw new Error('Ungültiger Parent User');
        }
        user.parentUser = newParentUser;
      }
      
      return await userRepository.save(user);
    },
    
    // Benutzer löschen (nur für Admins)
    deleteUser: async (_: any, { id }: { id: number }, context: any) => {
      if (!context.user || context.user.role !== UserRole.ADMIN) {
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