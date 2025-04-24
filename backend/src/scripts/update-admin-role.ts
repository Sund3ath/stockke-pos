import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entity';

async function updateAdminRole() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('Database connection established');

    // Get user repository
    const userRepository = AppDataSource.getRepository(User);

    // Find admin user
    const adminUser = await userRepository.findOne({ where: { username: 'admin' } });
    
    if (!adminUser) {
      console.log('Admin user not found');
      await AppDataSource.destroy();
      return;
    }

    // Update role to ADMIN
    adminUser.role = UserRole.ADMIN;

    // Save changes
    await userRepository.save(adminUser);
    console.log('Admin role updated successfully');

    // Close database connection
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error updating admin role:', error);
  }
}

// Run the update
updateAdminRole(); 