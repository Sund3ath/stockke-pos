import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAdminUserToProducts1745533340877 implements MigrationInterface {
    name = 'AddAdminUserToProducts1745533340877'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` ADD CONSTRAINT \`FK_1d7cd44d18adb1f177655a0d31d\` FOREIGN KEY (\`adminUserId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` DROP FOREIGN KEY \`FK_1d7cd44d18adb1f177655a0d31d\``);
    }

}
