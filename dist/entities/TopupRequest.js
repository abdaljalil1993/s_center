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
exports.TopupRequest = void 0;
const typeorm_1 = require("typeorm");
const BaseColumns_1 = require("./BaseColumns");
const enums_1 = require("./enums");
const User_1 = require("./User");
let TopupRequest = class TopupRequest extends BaseColumns_1.BaseColumns {
};
exports.TopupRequest = TopupRequest;
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.topupRequests, { onDelete: 'CASCADE', eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_1.User)
], TopupRequest.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", String)
], TopupRequest.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.TopupMethod }),
    __metadata("design:type", String)
], TopupRequest.prototype, "method", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reference_number', type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], TopupRequest.prototype, "referenceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sender_name', type: 'varchar', length: 150 }),
    __metadata("design:type", String)
], TopupRequest.prototype, "senderName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], TopupRequest.prototype, "note", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.TopupStatus, default: enums_1.TopupStatus.PENDING }),
    __metadata("design:type", String)
], TopupRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reject_reason', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], TopupRequest.prototype, "rejectReason", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.reviewedTopupRequests, { nullable: true, onDelete: 'SET NULL', eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'reviewed_by' }),
    __metadata("design:type", Object)
], TopupRequest.prototype, "reviewedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reviewed_at', type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], TopupRequest.prototype, "reviewedAt", void 0);
exports.TopupRequest = TopupRequest = __decorate([
    (0, typeorm_1.Entity)({ name: 'topup_requests' }),
    (0, typeorm_1.Unique)('uq_topup_method_reference', ['method', 'referenceNumber'])
], TopupRequest);
