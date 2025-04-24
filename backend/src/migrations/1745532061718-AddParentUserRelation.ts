import { MigrationInterface, QueryRunner } from "typeorm";

export class AddParentUserRelation1745532061718 implements MigrationInterface {
    name = 'AddParentUserRelation1745532061718'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`settings\` ADD \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`parentUserId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`settings\` ADD CONSTRAINT \`FK_9175e059b0a720536f7726a88c7\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_134f8596098366a076af083de54\` FOREIGN KEY (\`parentUserId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_134f8596098366a076af083de54\``);
        await queryRunner.query(`ALTER TABLE \`settings\` DROP FOREIGN KEY \`FK_9175e059b0a720536f7726a88c7\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`parentUserId\``);
        await queryRunner.query(`ALTER TABLE \`settings\` DROP COLUMN \`userId\``);
    }

}
