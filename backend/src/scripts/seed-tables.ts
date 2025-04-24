import { AppDataSource } from '../config/database';
import { Table } from '../entity';

/**
 * Skript zum Einfügen von Beispieltischen in die Datenbank
 */
async function seedTables() {
  try {
    // Datenbankverbindung initialisieren
    await AppDataSource.initialize();
    console.log('Datenbankverbindung hergestellt');

    // Repository für Tische
    const tableRepository = AppDataSource.getRepository(Table);

    // Prüfen, ob bereits Tische existieren
    const tableCount = await tableRepository.count();
    
    if (tableCount > 0) {
      console.log('Datenbank enthält bereits Tische, Seeding wird übersprungen');
      await AppDataSource.destroy();
      return;
    }

    // Beispieltische erstellen
    const tables = Array.from({ length: 12 }, (_, i) => {
      const table = new Table();
      table.name = (i + 1).toString();
      table.occupied = false;
      return table;
    });

    // Tische speichern
    for (const table of tables) {
      await tableRepository.save(table);
    }

    console.log(`${tables.length} Beispieltische erfolgreich erstellt`);

    // Datenbankverbindung schließen
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Fehler beim Seeding der Tische:', error);
  }
}

// Skript ausführen
seedTables();