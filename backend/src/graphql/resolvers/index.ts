import { userResolvers } from './user.resolver';
import { productResolvers } from './product.resolver';
import { orderResolvers } from './order.resolver';
import { tableResolvers } from './table.resolver';
import { settingsResolver } from './settings.resolver';
import { dailySalesResolver } from './dailySales.resolver';
import { scalarResolvers } from './scalar.resolver';

// Kombiniere alle Resolver
export const resolvers = {
  ...scalarResolvers,
  Query: {
    ...orderResolvers.Query,
  },
  Mutation: {
    ...orderResolvers.Mutation,
  },
};