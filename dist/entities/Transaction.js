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
exports.Transaction = void 0;
const typeorm_1 = require("typeorm");
const BaseColumns_1 = require("./BaseColumns");
const enums_1 = require("./enums");
const User_1 = require("./User");
let Transaction = class Transaction extends BaseColumns_1.BaseColumns {
};
exports.Transaction = Transaction;
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.transactions, { onDelete: 'CASCADE', eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_1.User)
], Transaction.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.TransactionType }),
    __metadata("design:type", String)
], Transaction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", String)
], Transaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'balance_after', type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", String)
], Transaction.prototype, "balanceAfter", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Transaction.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reference_type', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], Transaction.prototype, "referenceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reference_id', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], Transaction.prototype, "referenceId", void 0);
exports.Transaction = Transaction = __decorate([
    (0, typeorm_1.Entity)({ name: 'transactions' })
], Transaction);
