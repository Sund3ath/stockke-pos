import { Product } from './models/Product';  // Adjust import path as needed
import { User } from './models/User';  // Adjust import path as needed

export const resolvers = {
  Query: {
    // ... existing queries ...
    products: async () => {
      return await Product.find({});
    },
    product: async (_, { id }) => {
      return await Product.findById(id);
    },
    // Add the new query resolver
    productsByUserId: async (_, { userId }) => {
      try {
        const products = await Product.find({ 
          adminUserId: userId,
          inStock: true 
        }).sort({ category: 1, name: 1 });
        
        return products;
      } catch (error) {
        console.error('Error fetching products by user ID:', error);
        throw new Error('Failed to fetch products');
      }
    }
  },
  Product: {
    adminUser: async (parent) => {
      // Make sure this resolver exists to handle the adminUser field
      return await User.findById(parent.adminUserId);
    }
  },
  // ... rest of resolvers
}; 