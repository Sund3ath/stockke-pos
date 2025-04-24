import { AppDataSource } from '../../config/database';
import { Table } from '../../entity';

// Repository
const tableRepository = AppDataSource.getRepository(Table);

export const tableResolvers = {
  Query: {
    // Alle Tische abrufen
    tables: async () => {
      try {
        return await tableRepository.find({
          relations: ['orders']
        });
      } catch (error) {
        console.error('Fehler beim Abrufen der Tische:', error);
        throw new Error('Fehler beim Abrufen der Tische');
      }
    },
    
    // Tisch nach ID abrufen
    table: async (_: any, { id }: { id: number }) => {
      try {
        return await tableRepository.findOne({
          where: { id },
          relations: ['orders']
        });
      } catch (error) {
        console.error('Fehler beim Abrufen des Tisches:', error);
        throw new Error('Fehler beim Abrufen des Tisches');
      }
    }
  },
  
  Mutation: {
    // Tischstatus aktualisieren
    updateTableStatus: async (_: any, { id, occupied }: { id: number, occupied: boolean }) => {
      try {
        const table = await tableRepository.findOne({ where: { id } });
        
        if (!table) {
          throw new Error('Tisch nicht gefunden');
        }
        
        table.occupied = occupied;
        return await tableRepository.save(table);
      } catch (error) {
        console.error('Fehler beim Aktualisieren des Tischstatus:', error);
        throw new Error('Fehler beim Aktualisieren des Tischstatus');
      }
    }
  }
};