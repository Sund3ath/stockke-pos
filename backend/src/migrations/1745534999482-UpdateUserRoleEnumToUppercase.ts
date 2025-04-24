import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserRoleEnumToUppercase1745534999482 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE "user" 
            SET role = 'ADMIN' 
            WHERE role = 'admin'
        `);
        
        await queryRunner.query(`
            UPDATE "user" 
            SET role = 'EMPLOYEE' 
            WHERE role = 'employee'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE "user" 
            SET role = 'admin' 
            WHERE role = 'ADMIN'
        `);
        
        await queryRunner.query(`
            UPDATE "user" 
            SET role = 'employee' 
            WHERE role = 'EMPLOYEE'
        `);
    }
} 