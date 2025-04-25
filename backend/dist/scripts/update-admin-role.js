"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const entity_1 = require("../entity");
async function updateAdminRole() {
    try {
        // Initialize database connection
        await database_1.AppDataSource.initialize();
        console.log('Database connection established');
        // Get user repository
        const userRepository = database_1.AppDataSource.getRepository(entity_1.User);
        // Find admin user
        const adminUser = await userRepository.findOne({ where: { username: 'admin' } });
        if (!adminUser) {
            console.log('Admin user not found');
            await database_1.AppDataSource.destroy();
            return;
        }
        // Update role to ADMIN
        adminUser.role = entity_1.UserRole.ADMIN;
        // Save changes
        await userRepository.save(adminUser);
        console.log('Admin role updated successfully');
        // Close database connection
        await database_1.AppDataSource.destroy();
    }
    catch (error) {
        console.error('Error updating admin role:', error);
    }
}
// Run the update
updateAdminRole();
//# sourceMappingURL=update-admin-role.js.map