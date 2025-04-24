import { AppDataSource } from '../../config/database';
import { Order, OrderItem, User, Table } from '../../entity';

// Repositories
const orderRepository = AppDataSource.getRepository(Order);
const orderItemRepository = AppDataSource.getRepository(OrderItem);
const userRepository = AppDataSource.getRepository(User);

export const orderResolvers = {
  Query: {
    // Alle Bestellungen abrufen
    orders: async (_: any, __: any, context: any) => {
      try {
        return await orderRepository.find({
          relations: ['items', 'user', 'table'],
          order: { createdAt: 'DESC' }
        });
      } catch (error) {
        console.error('Fehler beim Abrufen der Bestellungen:', error);
        throw new Error('Fehler beim Abrufen der Bestellungen');
      }
    },
    
    // Bestellung nach ID abrufen
    order: async (_: any, { id }: { id: number }, context: any) => {
      try {
        return await orderRepository.findOne({
          where: { id },
          relations: ['items', 'user', 'table']
        });
      } catch (error) {
        console.error('Fehler beim Abrufen der Bestellung:', error);
        throw new Error('Fehler beim Abrufen der Bestellung');
      }
    }
  },
  
  Mutation: {
    // Neue Bestellung erstellen
    createOrder: async (_: any, { input }: any, context: any) => {
      try {
        // Transaktion starten
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        
        try {
          // Neue Bestellung erstellen
          const order = new Order();
          order.total = input.total;
          order.status = input.status;
          order.timestamp = new Date().toISOString(); // Immer aktuellen Zeitstempel setzen
          order.paymentMethod = input.paymentMethod;
          order.cashReceived = input.cashReceived;
          order.tableId = input.tableId;
          
          // Tisch zuweisen, falls vorhanden
          if (input.tableId) {
            const tableRepository = AppDataSource.getRepository(Table);
            const table = await tableRepository.findOne({ where: { id: input.tableId } });
            if (table) {
              order.table = table;
            }
          }
          
          // Benutzer muss vorhanden sein
          if (!context.user) {
            throw new Error('Ein Benutzer muss für die Bestellung angegeben werden');
          }
          
          const user = await userRepository.findOne({ where: { id: context.user.id } });
          if (!user) {
            throw new Error('Der angegebene Benutzer wurde nicht gefunden');
          }
          order.user = user;
          
          // Bestellung speichern
          const savedOrder = await queryRunner.manager.save(order);
          
          // Bestellpositionen erstellen und speichern
          const orderItems = input.items.map((item: any) => {
            const orderItem = new OrderItem();
            orderItem.productId = item.productId;
            orderItem.productName = item.productName;
            orderItem.quantity = item.quantity;
            orderItem.price = item.price;
            orderItem.taxRate = item.taxRate;
            orderItem.order = savedOrder;
            return orderItem;
          });
          
          await queryRunner.manager.save(orderItems);
          
          // Transaktion abschließen
          await queryRunner.commitTransaction();
          
          // Bestellung mit Bestellpositionen zurückgeben
          return await orderRepository.findOne({
            where: { id: savedOrder.id },
            relations: ['items', 'user', 'table']
          });
        } catch (error) {
          // Bei Fehler Transaktion zurückrollen
          await queryRunner.rollbackTransaction();
          console.error('Fehler beim Erstellen der Bestellung:', error);
          throw new Error('Fehler beim Erstellen der Bestellung');
        } finally {
          // QueryRunner freigeben
          await queryRunner.release();
        }
      } catch (error) {
        console.error('Fehler beim Erstellen der Bestellung:', error);
        throw new Error('Fehler beim Erstellen der Bestellung');
      }
    },
    
    // Bestellstatus aktualisieren
    updateOrderStatus: async (_: any, { id, status }: { id: number, status: string }, context: any) => {
      try {
        const order = await orderRepository.findOne({
          where: { id },
          relations: ['items', 'user', 'table']
        });
        
        if (!order) {
          throw new Error('Bestellung nicht gefunden');
        }
        
        order.status = status;
        await orderRepository.save(order);
        
        return order;
      } catch (error) {
        console.error('Fehler beim Aktualisieren des Bestellstatus:', error);
        throw new Error('Fehler beim Aktualisieren des Bestellstatus');
      }
    },
    
    // Bestellung aktualisieren
    updateOrder: async (_: any, { id, input }: { id: string, input: any }, context: any) => {
      try {
        // Bestellung finden
        const order = await orderRepository.findOne({
          where: { id: Number(id) },
          relations: ['items', 'user', 'table']
        });
        
        if (!order) {
          throw new Error(`Bestellung mit ID ${id} nicht gefunden`);
        }
        
        // Transaktion starten
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        
        try {
          // Bestellung aktualisieren
          if (input.total !== undefined) order.total = input.total;
          if (input.status !== undefined) order.status = input.status;
          if (input.timestamp !== undefined) order.timestamp = input.timestamp;
          if (input.paymentMethod !== undefined) order.paymentMethod = input.paymentMethod;
          if (input.cashReceived !== undefined) order.cashReceived = input.cashReceived;
          
          // Tisch aktualisieren, falls angegeben
          if (input.tableId !== undefined) {
            order.tableId = input.tableId;
            if (input.tableId) {
              const tableRepository = AppDataSource.getRepository(Table);
              const table = await tableRepository.findOne({ where: { id: input.tableId } });
              if (table) {
                order.table = table;
              }
            } else {
              // Tisch-Referenz entfernen, mit leerem String
              order.tableId = '';
            }
          }
          
          // Bestellung speichern
          await queryRunner.manager.save(order);
          
          // Bestellpositionen aktualisieren, falls angegeben
          if (input.items) {
            // Alte Bestellpositionen löschen
            await queryRunner.manager.delete(OrderItem, { order: { id: order.id } });
            
            // Neue Bestellpositionen erstellen und speichern
            const orderItems = input.items.map((item: any) => {
              const orderItem = new OrderItem();
              orderItem.productId = item.productId;
              orderItem.productName = item.productName;
              orderItem.quantity = item.quantity;
              orderItem.price = item.price;
              orderItem.taxRate = item.taxRate;
              orderItem.order = order;
              return orderItem;
            });
            
            await queryRunner.manager.save(orderItems);
          }
          
          // Transaktion abschließen
          await queryRunner.commitTransaction();
          
          // Aktualisierte Bestellung zurückgeben
          return await orderRepository.findOne({
            where: { id: order.id },
            relations: ['items', 'user', 'table']
          });
        } catch (error) {
          // Bei Fehler Transaktion zurückrollen
          await queryRunner.rollbackTransaction();
          console.error('Fehler beim Aktualisieren der Bestellung:', error);
          throw new Error('Fehler beim Aktualisieren der Bestellung');
        } finally {
          // QueryRunner freigeben
          await queryRunner.release();
        }
      } catch (error) {
        console.error('Fehler beim Aktualisieren der Bestellung:', error);
        throw new Error('Fehler beim Aktualisieren der Bestellung');
      }
    }
  }
};