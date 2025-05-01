import { AppDataSource } from '../../config/database';
import { Order, OrderItem, User, Table } from '../../entity';
import { FindOptionsWhere } from 'typeorm';
import { ExternalOrder, OrderStatus } from '../../entity/ExternalOrder';
import { DataSource } from 'typeorm';
import { Product } from '../../entity/Product';
import { PubSub } from 'graphql-subscriptions';
import { withFilter } from 'graphql-subscriptions';

// Repositories
const orderRepository = AppDataSource.getRepository(Order);
const orderItemRepository = AppDataSource.getRepository(OrderItem);
const userRepository = AppDataSource.getRepository(User);

// Constants
const EXTERNAL_ORDER_CREATED = 'EXTERNAL_ORDER_CREATED';

// Input types
interface CreateOrderInput {
  total: number;
  status: string;
  paymentMethod: string;
  cashReceived?: number;
  tableId?: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    taxRate: number;
  }>;
}

interface UpdateOrderInput {
  total?: number;
  status?: string;
  timestamp?: string;
  paymentMethod?: string;
  cashReceived?: number;
  tableId?: string;
  items?: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    taxRate: number;
  }>;
}

interface CreateExternalOrderInput {
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    taxRate: number;
  }>;
  total: number;
  adminUserId: string;
  customerNote?: string;
  customerName: string;
  customerTelephone: string;
}

interface Context {
  dataSource: DataSource;
}

interface ExternalOrderEvent {
  externalOrderCreated: ExternalOrder;
}

type PubSubEvent = {
  [key: string]: any;
};

const pubsub = new PubSub();

export const orderResolvers = {
  Query: {
    // Alle Bestellungen abrufen
    orders: async (_: any, __: any, context: any) => {
      try {
        const where: FindOptionsWhere<Order> = {};
        if (context.user) {
          where.user = { id: context.user.id };
        }
        
        return await orderRepository.find({
          where,
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
        const where: FindOptionsWhere<Order> = { id };
        if (context.user) {
          where.user = { id: context.user.id };
        }
        
        return await orderRepository.findOne({
          where,
          relations: ['items', 'user', 'table']
        });
      } catch (error) {
        console.error('Fehler beim Abrufen der Bestellung:', error);
        throw new Error('Fehler beim Abrufen der Bestellung');
      }
    },

    // External orders by user ID
    externalOrdersByUserId: async (_: any, { userId }: { userId: string }) => {
      try {
        const externalOrderRepository = AppDataSource.getRepository(ExternalOrder);
        return await externalOrderRepository.find({
          where: { adminUserId: userId },
          relations: ['items'],
          order: { createdAt: 'DESC' }
        });
      } catch (error) {
        console.error('Error fetching external orders:', error);
        throw new Error('Failed to fetch external orders');
      }
    }
  },
  
  Mutation: {
    // Neue Bestellung erstellen
    createOrder: async (_: any, { input }: { input: CreateOrderInput }, context: any) => {
      try {
        // Transaktion starten
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        
        try {
          console.log('Creating order with input:', JSON.stringify(input));
          
          // Neue Bestellung erstellen
          const order = new Order();
          order.total = input.total;
          order.status = input.status as any;
          order.timestamp = new Date().toISOString();
          order.paymentMethod = input.paymentMethod;
          if (input.cashReceived !== undefined) {
            order.cashReceived = input.cashReceived;
          }
          if (input.tableId !== undefined) {
            order.tableId = input.tableId;
          }
          
          // Tisch zuweisen, falls vorhanden
          if (input.tableId) {
            const tableRepository = AppDataSource.getRepository(Table);
            const table = await tableRepository.findOne({ where: { id: Number(input.tableId) } });
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
          
          // Hole alle Produkte auf einmal, um ihre Namen zu bekommen
          const productRepository = AppDataSource.getRepository(Product);
          const productIds = input.items.map(item => item.productId);
          console.log('Fetching products with IDs:', productIds);
          
          const products = await productRepository.findByIds(productIds);
          console.log('Found products:', products.map(p => ({ id: p.id, name: p.name })));
          
          // Erstelle eine Map von productId zu productName
          const productMap = products.reduce((acc, product) => {
            acc[product.id] = product.name;
            return acc;
          }, {} as { [key: string]: string });
          
          // Bestellpositionen erstellen und speichern
          const orderItems = input.items.map((item) => {
            const orderItem = new OrderItem();
            orderItem.productId = item.productId;
            
            // Hole den Produktnamen aus der Map
            const productName = productMap[item.productId];
            if (!productName) {
              throw new Error(`Produkt mit ID ${item.productId} nicht gefunden`);
            }
            orderItem.productName = productName;
            
            orderItem.quantity = item.quantity;
            orderItem.price = item.price;
            orderItem.taxRate = item.taxRate || 19; // Standardmäßig 19% MwSt.
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
        const where: FindOptionsWhere<Order> = { id };
        if (context.user) {
          where.user = { id: context.user.id };
        }
        
        const order = await orderRepository.findOne({
          where,
          relations: ['items', 'user', 'table']
        });
        
        if (!order) {
          throw new Error('Bestellung nicht gefunden');
        }
        
        order.status = status as any;
        await orderRepository.save(order);
        
        return order;
      } catch (error) {
        console.error('Fehler beim Aktualisieren des Bestellstatus:', error);
        throw new Error('Fehler beim Aktualisieren des Bestellstatus');
      }
    },
    
    // Bestellung aktualisieren
    updateOrder: async (_: any, { id, input }: { id: string, input: UpdateOrderInput }, context: any) => {
      try {
        const where: FindOptionsWhere<Order> = { id: Number(id) };
        if (context.user) {
          where.user = { id: context.user.id };
        }
        
        // Bestellung finden
        const order = await orderRepository.findOne({
          where,
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
          console.log('Updating order with input:', JSON.stringify(input));
          
          // Bestellung aktualisieren
          if (input.total !== undefined) order.total = input.total;
          if (input.status !== undefined) order.status = input.status as any;
          if (input.timestamp !== undefined) order.timestamp = input.timestamp;
          if (input.paymentMethod !== undefined) order.paymentMethod = input.paymentMethod;
          if (input.cashReceived !== undefined) order.cashReceived = input.cashReceived;
          
          // Tisch aktualisieren, falls angegeben
          if (input.tableId !== undefined) {
            order.tableId = input.tableId;
            if (input.tableId) {
              const tableRepository = AppDataSource.getRepository(Table);
              const table = await tableRepository.findOne({ where: { id: Number(input.tableId) } });
              if (table) {
                order.table = table;
              }
            } else {
              order.tableId = '';
            }
          }
          
          // Bestellung speichern
          await queryRunner.manager.save(order);
          
          // Bestellpositionen aktualisieren, falls angegeben
          if (input.items) {
            // Alte Bestellpositionen löschen
            await queryRunner.manager.delete(OrderItem, { order: { id: order.id } });
            
            // Stellt sicher, dass wir den Produkt-Namen für jedes Item haben
            const productRepository = AppDataSource.getRepository(Product);
            const productIds = input.items.map(item => item.productId);
            console.log('Fetching products with IDs:', productIds);
            
            const products = await productRepository.findByIds(productIds);
            console.log('Found products:', products.map(p => ({ id: p.id, name: p.name })));
            
            // Create product ID to name mapping
            const productMap = products.reduce((acc, product) => {
              acc[product.id] = product.name;
              return acc;
            }, {} as { [key: string]: string });
            
            // Neue Bestellpositionen erstellen und speichern
            const orderItems = input.items.map((item) => {
              const orderItem = new OrderItem();
              orderItem.productId = item.productId;
              
              // Produktnamen aus der Datenbank abrufen
              const productName = productMap[item.productId];
              if (!productName) {
                throw new Error(`Product with ID ${item.productId} not found`);
              }
              orderItem.productName = productName;
              
              orderItem.quantity = item.quantity;
              orderItem.price = item.price;
              orderItem.taxRate = item.taxRate || 19; // Standardwert für taxRate
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
    },

    createExternalOrder: async (_: any, { input }: { input: CreateExternalOrderInput }, { dataSource }: Context) => {
      try {
        const orderRepository = dataSource.getRepository(Order);
        const productRepository = dataSource.getRepository(Product);
        const externalOrderRepository = dataSource.getRepository(ExternalOrder);
        const userRepository = dataSource.getRepository(User);

        // Get the admin user - convert to number for User entity but keep original for external order
        const adminUser = await userRepository.findOne({ where: { id: Number(input.adminUserId) } });
        if (!adminUser) {
          throw new Error('Admin user not found');
        }

        // Create the order
        const orderData = {
          status: OrderStatus.PENDING,
          items: [],
          total: input.total,
          type: 'external',
          timestamp: new Date().toISOString(),
          customerNote: input.customerNote || '',
          paymentMethod: 'external',
          user: adminUser
        };

        const order = orderRepository.create(orderData);
        
        // Process items
        const items = await Promise.all(
          input.items.map(async (item) => {
            const product = await productRepository.findOne({ where: { id: parseInt(item.productId, 10) } });
            if (!product) {
              console.error(`Product not found: ${item.productId}`);
              return null;
            }

            return {
              product,
              quantity: item.quantity,
              price: item.price,
              taxRate: item.taxRate
            };
          })
        );

        // Filter out null items
        const validItems = items.filter((item): item is { product: Product; quantity: number; price: number; taxRate: number } => item !== null);

        // Create order items
        const orderItems = validItems.map(item => {
          const orderItem = new OrderItem();
          orderItem.productId = item.product.id.toString();
          orderItem.productName = item.product.name;
          orderItem.quantity = item.quantity;
          orderItem.price = item.price;
          orderItem.taxRate = item.taxRate;
          return orderItem;
        });

        order.items = orderItems;
        const savedOrder = await orderRepository.save(order);

        // Create external order
        const externalOrderData = {
          orderId: savedOrder.id.toString(),
          status: OrderStatus.PENDING,
          source: 'web',
          customerName: input.customerName,
          customerPhone: input.customerTelephone,
          adminUserId: input.adminUserId,
          items: orderItems,
          total: input.total,
          customerNote: input.customerNote || ''
        };

        const externalOrder = externalOrderRepository.create(externalOrderData);
        const savedExternalOrder = await externalOrderRepository.save(externalOrder);

        // Publish the new external order
        await pubsub.publish(EXTERNAL_ORDER_CREATED, {
          externalOrderCreated: savedExternalOrder
        });

        return savedExternalOrder;
      } catch (error) {
        console.error('Error creating external order:', error);
        throw new Error('Error creating external order');
      }
    },

    updateExternalOrderStatus: async (
      _: any,
      { id, status }: { id: string, status: OrderStatus },
      { dataSource }: Context
    ) => {
      try {
        console.log(`Updating external order ${id} status to ${status}`);
        const orderRepository = dataSource.getRepository(ExternalOrder);
        
        // Find the external order
        const order = await orderRepository.findOne({
          where: { id },
          relations: ['items']
        });
        
        if (!order) {
          console.error(`External order with ID ${id} not found`);
          throw new Error(`External order with ID ${id} not found`);
        }
        
        console.log(`Found order ${id} with current status ${order.status}`);
        
        // Update status
        order.status = status;
        
        // Save the updated order
        const updatedOrder = await orderRepository.save(order);
        console.log(`Successfully updated order ${id} status to ${updatedOrder.status}`);
        
        return updatedOrder;
      } catch (error) {
        console.error('Error updating external order status:', error);
        throw error;
      }
    }
  },
  Subscription: {
    externalOrderCreated: {
      subscribe: () => {
        try {
          return (pubsub as any).asyncIterator(EXTERNAL_ORDER_CREATED);
        } catch (error) {
          console.error('Error setting up subscription:', error);
          throw error;
        }
      }
    }
  }
};