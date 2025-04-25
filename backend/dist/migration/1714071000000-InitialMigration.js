"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialMigration1714071000000 = void 0;
class InitialMigration1714071000000 {
    constructor() {
        this.name = 'InitialMigration1714071000000';
    }
    async up(queryRunner) {
        // Diese Migration wird automatisch durch TypeORM generiert, wenn wir die Entitäten definiert haben
        // Für jetzt erstellen wir eine leere Migration, die später durch eine generierte ersetzt wird
        // Erstelle einen zusammengesetzten Index für category_sales
        await queryRunner.query(`
            CREATE INDEX IDX_CATEGORY_SALES_DATE_CATEGORY 
            ON category_sales (sale_date, category)
        `);
    }
    async down(queryRunner) {
        // Lösche den Index
        await queryRunner.query(`
            DROP INDEX IDX_CATEGORY_SALES_DATE_CATEGORY ON category_sales
        `);
    }
}
exports.InitialMigration1714071000000 = InitialMigration1714071000000;
//# sourceMappingURL=1714071000000-InitialMigration.js.map