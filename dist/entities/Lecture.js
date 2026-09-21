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
exports.Lecture = void 0;
const typeorm_1 = require("typeorm");
const BaseColumns_1 = require("./BaseColumns");
const Course_1 = require("./Course");
const enums_1 = require("./enums");
const User_1 = require("./User");
let Lecture = class Lecture extends BaseColumns_1.BaseColumns {
};
exports.Lecture = Lecture;
__decorate([
    (0, typeorm_1.ManyToOne)(() => Course_1.Course, (course) => course.lectures, { onDelete: 'RESTRICT', eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'course_id' }),
    __metadata("design:type", Course_1.Course)
], Lecture.prototype, "course", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: true, onDelete: 'SET NULL', eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", Object)
], Lecture.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150 }),
    __metadata("design:type", String)
], Lecture.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.LectureType }),
    __metadata("design:type", String)
], Lecture.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Lecture.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Lecture.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_published', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Lecture.prototype, "isPublished", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sort_order', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Lecture.prototype, "sortOrder", void 0);
exports.Lecture = Lecture = __decorate([
    (0, typeorm_1.Entity)({ name: 'lectures' })
], Lecture);
