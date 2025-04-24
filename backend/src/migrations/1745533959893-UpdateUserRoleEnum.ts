import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserRoleEnum1745533959893 implements MigrationInterface {
    name = 'UpdateUserRoleEnum1745533959893'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Aktualisiere bestehende 'user' Rollen zu 'employee'
        await queryRunner.query(`UPDATE users SET role = 'employee' WHERE role = 'user'`);
        
        // Ändere die Spalte zu einem ENUM
        await queryRunner.query(`ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'employee') NOT NULL DEFAULT 'employee'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Setze die Spalte zurück zu einem String
        await queryRunner.query(`ALTER TABLE users MODIFY COLUMN role VARCHAR(255) NOT NULL DEFAULT 'user'`);
    }
}
