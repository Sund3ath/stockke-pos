"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dailySalesResolver = void 0;
const database_1 = require("../../config/database");
const entity_1 = require("../../entity");
const date_fns_1 = require("date-fns");
const orderRepository = database_1.AppDataSource.getRepository(entity_1.Order);
exports.dailySalesResolver = {
    Query: {
        dailySales: async (_, { date }) => {
            try {
                const targetDate = new Date(date);
                const startDate = (0, date_fns_1.startOfDay)(targetDate);
                const endDate = (0, date_fns_1.endOfDay)(targetDate);
                // Get all completed orders for the given date with their items
                const orders = await orderRepository
                    .createQueryBuilder('order')
                    .leftJoinAndSelect('order.items', 'items')
                    .where('order.status = :status', { status: 'completed' })
                    .andWhere('order.timestamp >= :startDate', { startDate: startDate.toISOString() })
                    .andWhere('order.timestamp <= :endDate', { endDate: endDate.toISOString() })
                    .getMany();
                if (!orders || orders.length === 0) {
                    return {
                        date,
                        total: 0,
                        orderCount: 0,
                        items: []
                    };
                }
                // Calculate totals and aggregate items
                const total = orders.reduce((sum, order) => {
                    // Ensure we're working with numbers and not strings
                    const orderTotal = typeof order.total === 'string' ? parseFloat(order.total) : order.total;
                    return sum + (isNaN(orderTotal) ? 0 : orderTotal);
                }, 0);
                const orderCount = orders.length;
                // Aggregate items by product
                const itemsMap = new Map();
                orders.forEach(order => {
                    order.items.forEach(item => {
                        const key = item.productId;
                        if (!itemsMap.has(key)) {
                            itemsMap.set(key, {
                                productId: item.productId,
                                productName: item.productName,
                                quantity: 0,
                                total: 0,
                                taxRate: item.taxRate
                            });
                        }
                        const current = itemsMap.get(key);
                        const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                        current.quantity += item.quantity;
                        current.total += (isNaN(itemPrice) ? 0 : itemPrice) * item.quantity;
                    });
                });
                return {
                    date,
                    total: Number(total.toFixed(2)), // Ensure we return a number with 2 decimal places
                    orderCount,
                    items: Array.from(itemsMap.values()).map(item => ({
                        ...item,
                        total: Number(item.total.toFixed(2)) // Format item totals as well
                    }))
                };
            }
            catch (error) {
                console.error('Error fetching daily sales:', error);
                throw new Error('Error fetching daily sales');
            }
        }
    }
};
//# sourceMappingURL=dailySales.resolver.js.map