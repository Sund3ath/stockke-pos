import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entity/User';
import bcrypt from 'bcrypt';

/**
 * Skript zum Einfügen von Beispieldaten in die Datenbank
 */
async function seedData() {
  try {
    // Datenbankverbindung initialisieren
    await AppDataSource.initialize();
    console.log('Datenbankverbindung hergestellt');

    // Repository für Benutzer
    const userRepository = AppDataSource.getRepository(User);

    // Prüfen, ob bereits Benutzer existieren
    const userCount = await userRepository.count();
    
    if (userCount > 0) {
      console.log('Datenbank enthält bereits Daten, Seeding wird übersprungen');
      await AppDataSource.destroy();
      return;
    }

    // Passwort hashen
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const employeePasswordHash = await bcrypt.hash('employee123', 10);

    // Benutzer erstellen
    const adminUser = userRepository.create({
      username: 'admin',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN
    });

    const employeeUser = userRepository.create({
      username: 'mitarbeiter',
      passwordHash: employeePasswordHash,
      role: UserRole.EMPLOYEE
    });

    // Benutzer speichern
    await userRepository.save([adminUser, employeeUser]);
    console.log('Beispielbenutzer erfolgreich erstellt');

    // Hier könnten weitere Beispieldaten für andere Entitäten eingefügt werden
    // z.B. Produkte, Kategorien, Einstellungen, etc.

    console.log('Seeding abgeschlossen');

    // Datenbankverbindung schließen
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Fehler beim Seeding der Datenbank:', error);
  }
}

// Skript ausführen
seedData();