import { userResolvers } from './user.resolver';
import { productResolvers } from './product.resolver';
import { orderResolvers } from './order.resolver';
import { tableResolvers } from './table.resolver';
import { settingsResolver } from './settings.resolver';
import { dailySalesResolver } from './dailySales.resolver';

// Kombiniere alle Resolver
export const resolvers = [
  userResolvers,
  productResolvers,
  orderResolvers,
  tableResolvers,
  settingsResolver,
  dailySalesResolver
];