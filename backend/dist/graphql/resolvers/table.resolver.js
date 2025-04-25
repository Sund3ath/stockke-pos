"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tableResolvers = void 0;
const database_1 = require("../../config/database");
const entity_1 = require("../../entity");
// Repository
const tableRepository = database_1.AppDataSource.getRepository(entity_1.Table);
exports.tableResolvers = {
    Query: {
        // Alle Tische abrufen
        tables: async () => {
            try {
                return await tableRepository.find({
                    relations: ['orders']
                });
            }
            catch (error) {
                console.error('Fehler beim Abrufen der Tische:', error);
                throw new Error('Fehler beim Abrufen der Tische');
            }
        },
        // Tisch nach ID abrufen
        table: async (_, { id }) => {
            try {
                return await tableRepository.findOne({
                    where: { id },
                    relations: ['orders']
                });
            }
            catch (error) {
                console.error('Fehler beim Abrufen des Tisches:', error);
                throw new Error('Fehler beim Abrufen des Tisches');
            }
        }
    },
    Mutation: {
        // Tischstatus aktualisieren
        updateTableStatus: async (_, { id, occupied }) => {
            try {
                const table = await tableRepository.findOne({ where: { id } });
                if (!table) {
                    throw new Error('Tisch nicht gefunden');
                }
                table.occupied = occupied;
                return await tableRepository.save(table);
            }
            catch (error) {
                console.error('Fehler beim Aktualisieren des Tischstatus:', error);
                throw new Error('Fehler beim Aktualisieren des Tischstatus');
            }
        }
    }
};
//# sourceMappingURL=table.resolver.js.map