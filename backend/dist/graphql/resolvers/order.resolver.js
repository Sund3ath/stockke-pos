"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderResolvers = void 0;
const database_1 = require("../../config/database");
const entity_1 = require("../../entity");
// Repositories
const orderRepository = database_1.AppDataSource.getRepository(entity_1.Order);
const orderItemRepository = database_1.AppDataSource.getRepository(entity_1.OrderItem);
const userRepository = database_1.AppDataSource.getRepository(entity_1.User);
exports.orderResolvers = {
    Query: {
        // Alle Bestellungen abrufen
        orders: async (_, __, context) => {
            try {
                const where = {};
                if (context.user) {
                    where.user = { id: context.user.id };
                }
                return await orderRepository.find({
                    where,
                    relations: ['items', 'user', 'table'],
                    order: { createdAt: 'DESC' }
                });
            }
            catch (error) {
                console.error('Fehler beim Abrufen der Bestellungen:', error);
                throw new Error('Fehler beim Abrufen der Bestellungen');
            }
        },
        // Bestellung nach ID abrufen
        order: async (_, { id }, context) => {
            try {
                const where = { id };
                if (context.user) {
                    where.user = { id: context.user.id };
                }
                return await orderRepository.findOne({
                    where,
                    relations: ['items', 'user', 'table']
                });
            }
            catch (error) {
                console.error('Fehler beim Abrufen der Bestellung:', error);
                throw new Error('Fehler beim Abrufen der Bestellung');
            }
        }
    },
    Mutation: {
        // Neue Bestellung erstellen
        createOrder: async (_, { input }, context) => {
            try {
                // Transaktion starten
                const queryRunner = database_1.AppDataSource.createQueryRunner();
                await queryRunner.connect();
                await queryRunner.startTransaction();
                try {
                    // Neue Bestellung erstellen
                    const order = new entity_1.Order();
                    order.total = input.total;
                    order.status = input.status;
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
                        const tableRepository = database_1.AppDataSource.getRepository(entity_1.Table);
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
                    // Bestellpositionen erstellen und speichern
                    const orderItems = input.items.map((item) => {
                        const orderItem = new entity_1.OrderItem();
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
                }
                catch (error) {
                    // Bei Fehler Transaktion zurückrollen
                    await queryRunner.rollbackTransaction();
                    console.error('Fehler beim Erstellen der Bestellung:', error);
                    throw new Error('Fehler beim Erstellen der Bestellung');
                }
                finally {
                    // QueryRunner freigeben
                    await queryRunner.release();
                }
            }
            catch (error) {
                console.error('Fehler beim Erstellen der Bestellung:', error);
                throw new Error('Fehler beim Erstellen der Bestellung');
            }
        },
        // Bestellstatus aktualisieren
        updateOrderStatus: async (_, { id, status }, context) => {
            try {
                const where = { id };
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
                order.status = status;
                await orderRepository.save(order);
                return order;
            }
            catch (error) {
                console.error('Fehler beim Aktualisieren des Bestellstatus:', error);
                throw new Error('Fehler beim Aktualisieren des Bestellstatus');
            }
        },
        // Bestellung aktualisieren
        updateOrder: async (_, { id, input }, context) => {
            try {
                const where = { id: Number(id) };
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
                const queryRunner = database_1.AppDataSource.createQueryRunner();
                await queryRunner.connect();
                await queryRunner.startTransaction();
                try {
                    // Bestellung aktualisieren
                    if (input.total !== undefined)
                        order.total = input.total;
                    if (input.status !== undefined)
                        order.status = input.status;
                    if (input.timestamp !== undefined)
                        order.timestamp = input.timestamp;
                    if (input.paymentMethod !== undefined)
                        order.paymentMethod = input.paymentMethod;
                    if (input.cashReceived !== undefined)
                        order.cashReceived = input.cashReceived;
                    // Tisch aktualisieren, falls angegeben
                    if (input.tableId !== undefined) {
                        order.tableId = input.tableId;
                        if (input.tableId) {
                            const tableRepository = database_1.AppDataSource.getRepository(entity_1.Table);
                            const table = await tableRepository.findOne({ where: { id: Number(input.tableId) } });
                            if (table) {
                                order.table = table;
                            }
                        }
                        else {
                            order.tableId = '';
                        }
                    }
                    // Bestellung speichern
                    await queryRunner.manager.save(order);
                    // Bestellpositionen aktualisieren, falls angegeben
                    if (input.items) {
                        // Alte Bestellpositionen löschen
                        await queryRunner.manager.delete(entity_1.OrderItem, { order: { id: order.id } });
                        // Neue Bestellpositionen erstellen und speichern
                        const orderItems = input.items.map((item) => {
                            const orderItem = new entity_1.OrderItem();
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
                }
                catch (error) {
                    // Bei Fehler Transaktion zurückrollen
                    await queryRunner.rollbackTransaction();
                    console.error('Fehler beim Aktualisieren der Bestellung:', error);
                    throw new Error('Fehler beim Aktualisieren der Bestellung');
                }
                finally {
                    // QueryRunner freigeben
                    await queryRunner.release();
                }
            }
            catch (error) {
                console.error('Fehler beim Aktualisieren der Bestellung:', error);
                throw new Error('Fehler beim Aktualisieren der Bestellung');
            }
        }
    }
};
//# sourceMappingURL=order.resolver.js.map