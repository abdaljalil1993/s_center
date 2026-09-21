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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const BaseColumns_1 = require("./BaseColumns");
const enums_1 = require("./enums");
const Course_1 = require("./Course");
const Notification_1 = require("./Notification");
const Purchase_1 = require("./Purchase");
const TeacherPayout_1 = require("./TeacherPayout");
const TopupRequest_1 = require("./TopupRequest");
const Transaction_1 = require("./Transaction");
let User = class User extends BaseColumns_1.BaseColumns {
};
exports.User = User;
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30, unique: true }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'full_name', type: 'varchar', length: 120 }),
    __metadata("design:type", String)
], User.prototype, "fullName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'password_hash', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.UserRole, default: enums_1.UserRole.STUDENT }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: '0.00' }),
    __metadata("design:type", String)
], User.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'device_id', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "deviceId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Course_1.Course, (course) => course.teacher),
    __metadata("design:type", Array)
], User.prototype, "taughtCourses", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Purchase_1.Purchase, (purchase) => purchase.user),
    __metadata("design:type", Array)
], User.prototype, "purchases", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Transaction_1.Transaction, (transaction) => transaction.user),
    __metadata("design:type", Array)
], User.prototype, "transactions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => TopupRequest_1.TopupRequest, (topupRequest) => topupRequest.user),
    __metadata("design:type", Array)
], User.prototype, "topupRequests", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => TopupRequest_1.TopupRequest, (topupRequest) => topupRequest.reviewedBy),
    __metadata("design:type", Array)
], User.prototype, "reviewedTopupRequests", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Notification_1.Notification, (notification) => notification.user),
    __metadata("design:type", Array)
], User.prototype, "notifications", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => TeacherPayout_1.TeacherPayout, (payout) => payout.teacher),
    __metadata("design:type", Array)
], User.prototype, "teacherPayouts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => TeacherPayout_1.TeacherPayout, (payout) => payout.createdBy),
    __metadata("design:type", Array)
], User.prototype, "createdTeacherPayouts", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)({ name: 'users' })
], User);
