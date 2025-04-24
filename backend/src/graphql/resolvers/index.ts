import { userResolver } from './user.resolver';
import { productResolver } from './product.resolver';
import { orderResolver } from './order.resolver';
import { tableResolver } from './table.resolver';
import { settingsResolver } from './settings.resolver';

// Kombiniere alle Resolver
export const resolvers = [
  userResolver,
  productResolver,
  orderResolver,
  tableResolver,
  settingsResolver
];