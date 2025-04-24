import { AppDataSource } from '../../config/database';
import { Product } from '../../entity';

// Repository
const productRepository = AppDataSource.getRepository(Product);

export const productResolvers = {
  Query: {
    // Alle Produkte abrufen
    products: async () => {
      try {
        return await productRepository.find();
      } catch (error) {
        console.error('Fehler beim Abrufen der Produkte:', error);
        throw new Error('Fehler beim Abrufen der Produkte');
      }
    },
    
    // Produkt nach ID abrufen
    product: async (_: any, { id }: { id: number }) => {
      try {
        return await productRepository.findOne({ where: { id } });
      } catch (error) {
        console.error('Fehler beim Abrufen des Produkts:', error);
        throw new Error('Fehler beim Abrufen des Produkts');
      }
    }
  },
  
  Mutation: {
    // Neues Produkt erstellen
    createProduct: async (_: any, { input }: any) => {
      try {
        const product = productRepository.create({
          name: input.name,
          price: input.price,
          category: input.category,
          image: input.image,
          description: input.description,
          inStock: input.inStock !== undefined ? input.inStock : true,
          taxRate: input.taxRate !== undefined ? input.taxRate : 19.0
        });
        
        return await productRepository.save(product);
      } catch (error) {
        console.error('Fehler beim Erstellen des Produkts:', error);
        throw new Error('Fehler beim Erstellen des Produkts');
      }
    },
    
    // Produkt aktualisieren
    updateProduct: async (_: any, { id, input }: { id: number, input: any }) => {
      try {
        const product = await productRepository.findOne({ where: { id } });
        
        if (!product) {
          throw new Error('Produkt nicht gefunden');
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
    deleteProduct: async (_: any, { id }: { id: number }) => {
      try {
        const product = await productRepository.findOne({ where: { id } });
        
        if (!product) {
          throw new Error('Produkt nicht gefunden');
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