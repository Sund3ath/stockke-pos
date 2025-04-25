"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserRoleEnumToUppercase1745534999482 = void 0;
class UpdateUserRoleEnumToUppercase1745534999482 {
    async up(queryRunner) {
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
    async down(queryRunner) {
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
exports.UpdateUserRoleEnumToUppercase1745534999482 = UpdateUserRoleEnumToUppercase1745534999482;
//# sourceMappingURL=1745534999482-UpdateUserRoleEnumToUppercase.js.map