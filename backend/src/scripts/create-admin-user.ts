import { AppDataSource } from '../config/database';
import { User } from '../entity';
import bcrypt from 'bcrypt';

/**
 * Skript zum Erstellen eines Admin-Benutzers in der Datenbank
 */
async function createAdminUser() {
  try {
    // Datenbankverbindung initialisieren
    await AppDataSource.initialize();
    console.log('Datenbankverbindung hergestellt');

    // Repository für Benutzer
    const userRepository = AppDataSource.getRepository(User);

    // Prüfen, ob bereits ein Admin-Benutzer existiert
    const existingAdmin = await userRepository.findOne({ where: { username: 'admin' } });
    
    if (existingAdmin) {
      console.log('Admin-Benutzer existiert bereits');
      await AppDataSource.destroy();
      return;
    }

    // Passwort hashen
    const passwordHash = await bcrypt.hash('admin123', 10);

    // Admin-Benutzer erstellen
    const adminUser = userRepository.create({
      username: 'admin',
      passwordHash,
      role: 'admin'
    });

    // Admin-Benutzer speichern
    await userRepository.save(adminUser);
    console.log('Admin-Benutzer erfolgreich erstellt');

    // Datenbankverbindung schließen
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Fehler beim Erstellen des Admin-Benutzers:', error);
  }
}

// Skript ausführen
createAdminUser();