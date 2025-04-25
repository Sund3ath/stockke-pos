"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserRoleEnum1745534999481 = void 0;
class UpdateUserRoleEnum1745534999481 {
    constructor() {
        this.name = 'UpdateUserRoleEnum1745534999481';
    }
    async up(queryRunner) {
        // Aktualisiere bestehende 'user' Rollen zu 'employee'
        await queryRunner.query(`UPDATE users SET role = 'employee' WHERE role = 'user'`);
        // Ändere die Spalte zu einem ENUM
        await queryRunner.query(`ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'employee') NOT NULL DEFAULT 'employee'`);
    }
    async down(queryRunner) {
        // Setze die Spalte zurück zu einem String
        await queryRunner.query(`ALTER TABLE users MODIFY COLUMN role VARCHAR(255) NOT NULL DEFAULT 'user'`);
    }
}
exports.UpdateUserRoleEnum1745534999481 = UpdateUserRoleEnum1745534999481;
//# sourceMappingURL=1745534999481-UpdateUserRoleEnum.js.map