"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailySales = void 0;
const typeorm_1 = require("typeorm");
const BaseEntity_1 = require("./BaseEntity");
let DailySales = class DailySales extends BaseEntity_1.BaseEntity {
};
exports.DailySales = DailySales;
__decorate([
    (0, typeorm_1.Column)({ name: 'sale_date', type: 'date', unique: true }),
    __metadata("design:type", Date)
], DailySales.prototype, "saleDate", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], DailySales.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'order_count' }),
    __metadata("design:type", Number)
], DailySales.prototype, "orderCount", void 0);
exports.DailySales = DailySales = __decorate([
    (0, typeorm_1.Entity)('daily_sales')
], DailySales);
//# sourceMappingURL=DailySales.js.map