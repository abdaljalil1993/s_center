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
exports.Specialization = void 0;
const typeorm_1 = require("typeorm");
const BaseColumns_1 = require("./BaseColumns");
const Course_1 = require("./Course");
let Specialization = class Specialization extends BaseColumns_1.BaseColumns {
};
exports.Specialization = Specialization;
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 120 }),
    __metadata("design:type", String)
], Specialization.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_published', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Specialization.prototype, "isPublished", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sort_order', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Specialization.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Course_1.Course, (course) => course.specialization),
    __metadata("design:type", Array)
], Specialization.prototype, "courses", void 0);
exports.Specialization = Specialization = __decorate([
    (0, typeorm_1.Entity)({ name: 'specializations' })
], Specialization);
