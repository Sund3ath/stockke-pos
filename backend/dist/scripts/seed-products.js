"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const entity_1 = require("../entity");
/**
 * Skript zum Einfügen von Beispielprodukten in die Datenbank
 */
async function seedProducts() {
    try {
        // Datenbankverbindung initialisieren
        await database_1.AppDataSource.initialize();
        console.log('Datenbankverbindung hergestellt');
        // Repository für Produkte
        const productRepository = database_1.AppDataSource.getRepository(entity_1.Product);
        // Prüfen, ob bereits Produkte existieren
        const productCount = await productRepository.count();
        if (productCount > 0) {
            console.log('Datenbank enthält bereits Produkte, Seeding wird übersprungen');
            await database_1.AppDataSource.destroy();
            return;
        }
        // Beispielprodukte erstellen
        const products = [
            {
                name: 'Pizza Margherita',
                price: 8.99,
                category: 'mains',
                description: 'Klassische Pizza mit Tomatensoße und Mozzarella',
                inStock: true,
                taxRate: 19.0
            },
            {
                name: 'Pizza Salami',
                price: 9.99,
                category: 'mains',
                description: 'Pizza mit Tomatensoße, Mozzarella und Salami',
                inStock: true,
                taxRate: 19.0
            },
            {
                name: 'Pasta Carbonara',
                price: 10.99,
                category: 'mains',
                description: 'Spaghetti mit Ei, Speck, Parmesan und Pfeffer',
                inStock: true,
                taxRate: 19.0
            },
            {
                name: 'Tiramisu',
                price: 5.99,
                category: 'desserts',
                description: 'Italienisches Dessert mit Mascarpone und Kaffee',
                inStock: true,
                taxRate: 19.0
            },
            {
                name: 'Cola',
                price: 2.99,
                category: 'drinks',
                description: 'Erfrischendes Getränk',
                inStock: true,
                taxRate: 19.0
            },
            {
                name: 'Wasser',
                price: 1.99,
                category: 'drinks',
                description: 'Mineralwasser',
                inStock: true,
                taxRate: 19.0
            },
            {
                name: 'Pommes',
                price: 3.99,
                category: 'sides',
                description: 'Knusprige Pommes Frites',
                inStock: true,
                taxRate: 19.0
            },
            {
                name: 'Salat',
                price: 4.99,
                category: 'sides',
                description: 'Gemischter Salat mit Dressing',
                inStock: true,
                taxRate: 19.0
            }
        ];
        // Produkte speichern
        for (const productData of products) {
            const product = productRepository.create(productData);
            await productRepository.save(product);
        }
        console.log(`${products.length} Beispielprodukte erfolgreich erstellt`);
        // Datenbankverbindung schließen
        await database_1.AppDataSource.destroy();
    }
    catch (error) {
        console.error('Fehler beim Seeding der Produkte:', error);
    }
}
// Skript ausführen
seedProducts();
//# sourceMappingURL=seed-products.js.map