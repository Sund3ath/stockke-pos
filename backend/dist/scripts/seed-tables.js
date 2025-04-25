"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const entity_1 = require("../entity");
/**
 * Skript zum Einfügen von Beispieltischen in die Datenbank
 */
async function seedTables() {
    try {
        // Datenbankverbindung initialisieren
        await database_1.AppDataSource.initialize();
        console.log('Datenbankverbindung hergestellt');
        // Repository für Tische
        const tableRepository = database_1.AppDataSource.getRepository(entity_1.Table);
        // Prüfen, ob bereits Tische existieren
        const tableCount = await tableRepository.count();
        if (tableCount > 0) {
            console.log('Datenbank enthält bereits Tische, Seeding wird übersprungen');
            await database_1.AppDataSource.destroy();
            return;
        }
        // Beispieltische erstellen
        const tables = Array.from({ length: 12 }, (_, i) => {
            const table = new entity_1.Table();
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
        await database_1.AppDataSource.destroy();
    }
    catch (error) {
        console.error('Fehler beim Seeding der Tische:', error);
    }
}
// Skript ausführen
seedTables();
//# sourceMappingURL=seed-tables.js.map