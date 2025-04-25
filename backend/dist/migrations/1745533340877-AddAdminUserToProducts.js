"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAdminUserToProducts1745533340877 = void 0;
class AddAdminUserToProducts1745533340877 {
    constructor() {
        this.name = 'AddAdminUserToProducts1745533340877';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`products\` ADD CONSTRAINT \`FK_1d7cd44d18adb1f177655a0d31d\` FOREIGN KEY (\`adminUserId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`products\` DROP FOREIGN KEY \`FK_1d7cd44d18adb1f177655a0d31d\``);
    }
}
exports.AddAdminUserToProducts1745533340877 = AddAdminUserToProducts1745533340877;
//# sourceMappingURL=1745533340877-AddAdminUserToProducts.js.map