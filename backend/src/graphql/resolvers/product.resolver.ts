import { AppDataSource } from '../../config/database';
import { Product, User, UserRole } from '../../entity';

// Repository
const productRepository = AppDataSource.getRepository(Product);
const userRepository = AppDataSource.getRepository(User);

export const productResolvers = {
  Query: {
    // Alle Produkte abrufen
    products: async (_: any, __: any, context: any) => {
      try {
        if (!context.user) {
          throw new Error('Nicht autorisiert');
        }

        // Admin sieht alle Produkte
        if (context.user.role === UserRole.ADMIN) {
          return await productRepository.find({
            relations: ['adminUser']
          });
        }

        // Mitarbeiter sieht nur die Produkte seines Parent-Users (Admin)
        const employee = await userRepository.findOne({
          where: { id: context.user.id },
          relations: ['parentUser']
        });

        if (!employee || !employee.parentUser) {
          throw new Error('Mitarbeiter ist keinem Admin zugeordnet');
        }

        // Produkte des Parent-Users laden
        return await productRepository.find({
          where: {
            adminUser: {
              id: employee.parentUser.id
            }
          },
          relations: ['adminUser']
        });
      } catch (error) {
        console.error('Fehler beim Abrufen der Produkte:', error);
        throw new Error('Fehler beim Abrufen der Produkte');
      }
    },
    
    // Produkt nach ID abrufen
    product: async (_: any, { id }: { id: number }, context: any) => {
      try {
        if (!context.user) {
          throw new Error('Nicht autorisiert');
        }

        // Admin kann alle Produkte sehen
        if (context.user.role === UserRole.ADMIN) {
          const product = await productRepository.findOne({
            where: { id },
            relations: ['adminUser']
          });

          if (!product) {
            throw new Error('Produkt nicht gefunden');
          }

          return product;
        }

        // Mitarbeiter sieht nur die Produkte seines Parent-Users (Admin)
        const employee = await userRepository.findOne({
          where: { id: context.user.id },
          relations: ['parentUser']
        });

        if (!employee || !employee.parentUser) {
          throw new Error('Mitarbeiter ist keinem Admin zugeordnet');
        }

        // Produkt mit Prüfung auf Parent-User laden
        const product = await productRepository.findOne({
          where: {
            id,
            adminUser: {
              id: employee.parentUser.id
            }
          },
          relations: ['adminUser']
        });

        if (!product) {
          throw new Error('Produkt nicht gefunden oder keine Berechtigung');
        }

        return product;
      } catch (error) {
        console.error('Fehler beim Abrufen des Produkts:', error);
        throw new Error('Fehler beim Abrufen des Produkts');
      }
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