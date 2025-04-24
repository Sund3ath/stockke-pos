import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1714071000000 implements MigrationInterface {
    name = 'InitialMigration1714071000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Diese Migration wird automatisch durch TypeORM generiert, wenn wir die Entitäten definiert haben
        // Für jetzt erstellen wir eine leere Migration, die später durch eine generierte ersetzt wird
        
        // Erstelle einen zusammengesetzten Index für category_sales
        await queryRunner.query(`
            CREATE INDEX IDX_CATEGORY_SALES_DATE_CATEGORY 
            ON category_sales (sale_date, category)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Lösche den Index
        await queryRunner.query(`
            DROP INDEX IDX_CATEGORY_SALES_DATE_CATEGORY ON category_sales
        `);
    }
}