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
exports.Course = void 0;
const typeorm_1 = require("typeorm");
const BaseColumns_1 = require("./BaseColumns");
const Lecture_1 = require("./Lecture");
const Purchase_1 = require("./Purchase");
const Specialization_1 = require("./Specialization");
const User_1 = require("./User");
let Course = class Course extends BaseColumns_1.BaseColumns {
};
exports.Course = Course;
__decorate([
    (0, typeorm_1.ManyToOne)(() => Specialization_1.Specialization, (specialization) => specialization.courses, { onDelete: 'RESTRICT', eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'specialization_id' }),
    __metadata("design:type", Specialization_1.Specialization)
], Course.prototype, "specialization", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.taughtCourses, { nullable: true, onDelete: 'SET NULL', eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'teacher_id' }),
    __metadata("design:type", Object)
], Course.prototype, "teacher", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Course.prototype, "year", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150 }),
    __metadata("design:type", String)
], Course.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Course.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", String)
], Course.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_published', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Course.prototype, "isPublished", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sort_order', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Course.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'teacher_percent', type: 'decimal', precision: 5, scale: 2, default: '0.00' }),
    __metadata("design:type", String)
], Course.prototype, "teacherPercent", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Lecture_1.Lecture, (lecture) => lecture.course),
    __metadata("design:type", Array)
], Course.prototype, "lectures", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Purchase_1.Purchase, (purchase) => purchase.course),
    __metadata("design:type", Array)
], Course.prototype, "purchases", void 0);
exports.Course = Course = __decorate([
    (0, typeorm_1.Entity)({ name: 'courses' }),
    (0, typeorm_1.Index)('idx_course_specialization_year', ['specialization', 'year'])
], Course);
