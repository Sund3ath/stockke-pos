export const productResolvers = {
  Query: {
    productsByUserId: async (_: any, { userId }: { userId: string }, context: any) => {
      try {
        // No authentication check here - this endpoint is public
        const products = await Product.find({ 
          adminUserId: userId,
          inStock: true // Only show in-stock items for public menu
        }).sort({ category: 1, name: 1 });
        
        return products;
      } catch (error) {
        console.error('Error fetching products by user ID:', error);
        throw new Error('Failed to fetch products');
      }
    },
  },
  // ... rest of resolvers ...
}; 