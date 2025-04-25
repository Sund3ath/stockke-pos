"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAdminUserToProducts1710864000000 = void 0;
class AddAdminUserToProducts1710864000000 {
    async up(queryRunner) {
        // Finde den ersten Admin-Benutzer
        const adminUser = await queryRunner.query(`
            SELECT id FROM users 
            WHERE role = 'admin' 
            LIMIT 1
        `);
        if (adminUser && adminUser.length > 0) {
            const adminUserId = adminUser[0].id;
            // Aktualisiere alle bestehenden Produkte mit dem Admin-Benutzer
            await queryRunner.query(`
                UPDATE products 
                SET adminUserId = ?
                WHERE adminUserId IS NULL
            `, [adminUserId]);
        }
        // Füge den Foreign Key Constraint hinzu
        await queryRunner.query(`
            ALTER TABLE products 
            ADD CONSTRAINT FK_1d7cd44d18adb1f177655a0d31d 
            FOREIGN KEY (adminUserId) 
            REFERENCES users(id) 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);
    }
    async down(queryRunner) {
        // Entferne den Foreign Key Constraint
        await queryRunner.query(`
            ALTER TABLE products 
            DROP FOREIGN KEY FK_1d7cd44d18adb1f177655a0d31d
        `);
    }
}
exports.AddAdminUserToProducts1710864000000 = AddAdminUserToProducts1710864000000;
//# sourceMappingURL=1710864000000-AddAdminUserToProducts.js.map