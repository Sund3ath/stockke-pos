import { AppDataSource } from '../../config/database';
import { Product, User, UserRole } from '../../entity';

// Repository
const productRepository = AppDataSource.getRepository(Product);
const userRepository = AppDataSource.getRepository(User);

// Add interface for resolver context
interface ResolverContext {
  user?: {
    id: number;
    username: string;
    role: UserRole;
  };
  isPublicOperation?: boolean;
}

export const productResolvers = {
  Query: {
    products: async () => {
      return await productRepository.find();
    },
    product: async (_: any, { id }: { id: number }) => {
      return await productRepository.findOne({ where: { id } });
    },
    productsByUserId: async (_: any, { userId }: { userId: number }) => {
      try {
        const products = await productRepository.find({ 
          where: {
            adminUser: { id: userId },
            inStock: true 
          },
          relations: ['adminUser'],
          order: {
            category: 'ASC',
            name: 'ASC'
          }
        });
        return products;
      } catch (error) {
        console.error('Error fetching products by user ID:', error);
        throw new Error('Failed to fetch products');
      }
    }
  },
  Product: {
    adminUser: async (parent: Product) => {
      if (parent.adminUser) return parent.adminUser;
  
      return await userRepository.findOne({ 
        where: { id: parent.adminUserId }
      });
    }
  },
  Mutation: {
    // Neues Produkt erstellen
    createProduct: async (_: any, { input }: any, context: any) => {
      try {
        if (!context.user) {
          throw new Error('Nicht autorisiert');
        }

        // Nur Admins können Produkte erstellen
        if (context.user.role !== UserRole.ADMIN) {
          throw new Error('Nicht autorisiert - nur Admins können Produkte erstellen');
        }

        // Admin-Benutzer aus der Datenbank laden
        const adminUser = await userRepository.findOne({
          where: { id: context.user.id }
        });

        if (!adminUser) {
          throw new Error('Admin-Benutzer nicht gefunden');
        }

        // Neues Produkt erstellen
        const product = productRepository.create({
          name: input.name,
          price: input.price,
          category: input.category,
          image: input.image,
          description: input.description,
          inStock: input.inStock !== undefined ? input.inStock : true,
          taxRate: input.taxRate !== undefined ? input.taxRate : 19.0,
          adminUser: adminUser
        });
        
        // Produkt speichern
        const savedProduct = await productRepository.save(product);
        
        // Produkt mit Relationen zurückgeben
        return await productRepository.findOne({
          where: { id: savedProduct.id },
          relations: ['adminUser']
        });
      } catch (error) {
        console.error('Fehler beim Erstellen des Produkts:', error);
        throw error; // Originalen Fehler weiterwerfen
      }
    },
    
    // Produkt aktualisieren
    updateProduct: async (_: any, { id, input }: { id: number, input: any }, context: any) => {
      try {
        if (!context.user) {
          throw new Error('Nicht autorisiert');
        }

        const product = await productRepository.findOne({ 
          where: { id },
          relations: ['adminUser']
        });
        
        if (!product) {
          throw new Error('Produkt nicht gefunden');
        }

        // Nur der Admin, dem das Produkt gehört, kann es aktualisieren
        if (context.user.role !== UserRole.ADMIN || product.adminUser.id !== context.user.id) {
          throw new Error('Nicht autorisiert - nur der Besitzer kann das Produkt aktualisieren');
        }
        
        // Aktualisiere die Produktdaten
        if (input.name !== undefined) product.name = input.name;
        if (input.price !== undefined) product.price = input.price;
        if (input.category !== undefined) product.category = input.category;
        if (input.image !== undefined) product.image = input.image;
        if (input.description !== undefined) product.description = input.description;
        if (input.inStock !== undefined) product.inStock = input.inStock;
        if (input.taxRate !== undefined) product.taxRate = input.taxRate;
        
        return await productRepository.save(product);
      } catch (error) {
        console.error('Fehler beim Aktualisieren des Produkts:', error);
        throw new Error('Fehler beim Aktualisieren des Produkts');
      }
    },
    
    // Produkt löschen
    deleteProduct: async (_: any, { id }: { id: number }, context: any) => {
      try {
        if (!context.user) {
          throw new Error('Nicht autorisiert');
        }

        const product = await productRepository.findOne({ 
          where: { id },
          relations: ['adminUser']
        });
        
        if (!product) {
          throw new Error('Produkt nicht gefunden');
        }

        // Nur der Admin, dem das Produkt gehört, kann es löschen
        if (context.user.role !== UserRole.ADMIN || product.adminUser.id !== context.user.id) {
          throw new Error('Nicht autorisiert - nur der Besitzer kann das Produkt löschen');
        }
        
        await productRepository.remove(product);
        return true;
      } catch (error) {
        console.error('Fehler beim Löschen des Produkts:', error);
        throw new Error('Fehler beim Löschen des Produkts');
      }
    }
  }
};