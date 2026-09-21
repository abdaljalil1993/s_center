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
exports.Purchase = void 0;
const typeorm_1 = require("typeorm");
const BaseColumns_1 = require("./BaseColumns");
const Course_1 = require("./Course");
const User_1 = require("./User");
let Purchase = class Purchase extends BaseColumns_1.BaseColumns {
};
exports.Purchase = Purchase;
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.purchases, { onDelete: 'CASCADE', eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_1.User)
], Purchase.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Course_1.Course, (course) => course.purchases, { onDelete: 'RESTRICT', eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'course_id' }),
    __metadata("design:type", Course_1.Course)
], Purchase.prototype, "course", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: true, onDelete: 'SET NULL', eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'teacher_id' }),
    __metadata("design:type", Object)
], Purchase.prototype, "teacher", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'price_paid', type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", String)
], Purchase.prototype, "pricePaid", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'teacher_share', type: 'decimal', precision: 12, scale: 2, default: '0.00' }),
    __metadata("design:type", String)
], Purchase.prototype, "teacherShare", void 0);
exports.Purchase = Purchase = __decorate([
    (0, typeorm_1.Entity)({ name: 'purchases' }),
    (0, typeorm_1.Unique)('uq_purchase_user_course', ['user', 'course'])
], Purchase);
