"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserRoleEnum1745533959893 = void 0;
class UpdateUserRoleEnum1745533959893 {
    constructor() {
        this.name = 'UpdateUserRoleEnum1745533959893';
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
exports.UpdateUserRoleEnum1745533959893 = UpdateUserRoleEnum1745533959893;
//# sourceMappingURL=1745533959893-UpdateUserRoleEnum.js.map