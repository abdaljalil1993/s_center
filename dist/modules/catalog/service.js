"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSpecializations = listSpecializations;
exports.listCourses = listCourses;
exports.listLectures = listLectures;
const data_source_1 = require("../../config/data-source");
const Course_1 = require("../../entities/Course");
const Lecture_1 = require("../../entities/Lecture");
const Purchase_1 = require("../../entities/Purchase");
const Specialization_1 = require("../../entities/Specialization");
const enums_1 = require("../../entities/enums");
const AppError_1 = require("../../utils/AppError");
function isPurchasedCourse(purchasedCourseIds, courseId) {
    return purchasedCourseIds.has(courseId);
}
async function listSpecializations() {
    const specializations = await data_source_1.AppDataSource.getRepository(Specialization_1.Specialization).find({
        where: { isPublished: true },
        order: { sortOrder: 'ASC', id: 'ASC' },
    });
    return specializations.map((specialization) => ({
        id: specialization.id,
        name: specialization.name,
        is_published: specialization.isPublished,
        sort_order: specialization.sortOrder,
    }));
}
async function listCourses(userId, filters) {
    const courseRepository = data_source_1.AppDataSource.getRepository(Course_1.Course);
    const purchaseRepository = data_source_1.AppDataSource.getRepository(Purchase_1.Purchase);
    const purchasedCourses = await purchaseRepository.find({
        where: { user: { id: userId } },
        relations: { course: true },
    });
    const purchasedCourseIds = new Set(purchasedCourses.map((purchase) => purchase.course.id));
    const courses = await courseRepository.find({
        relations: { specialization: true, teacher: true },
        where: {
            isPublished: true,
            specialization: { isPublished: true, ...(filters.specializationId ? { id: filters.specializationId } : {}) },
            ...(filters.year ? { year: filters.year } : {}),
        },
        order: { sortOrder: 'ASC', id: 'ASC' },
    });
    return courses.map((course) => ({
        id: course.id,
        specialization_id: course.specialization.id,
        year: course.year,
        name: course.name,
        description: course.description,
        price: course.price,
        is_published: course.isPublished,
        sort_order: course.sortOrder,
        teacher_full_name: course.teacher ? course.teacher.fullName : null,
        purchased: isPurchasedCourse(purchasedCourseIds, course.id),
    }));
}
async function listLectures(user, courseId) {
    const course = await data_source_1.AppDataSource.getRepository(Course_1.Course).findOne({
        where: { id: courseId, isPublished: true, specialization: { isPublished: true } },
        relations: { specialization: true },
    });
    if (!course) {
        throw new AppError_1.AppError(404, 'Course not found');
    }
    const purchaseRepository = data_source_1.AppDataSource.getRepository(Purchase_1.Purchase);
    const purchased = user.role === enums_1.UserRole.ADMIN
        ? true
        : !!(await purchaseRepository.findOne({ where: { user: { id: user.id }, course: { id: course.id } } }));
    const lectures = await data_source_1.AppDataSource.getRepository(Lecture_1.Lecture).find({
        where: { course: { id: course.id }, isPublished: true },
        order: { sortOrder: 'ASC', id: 'ASC' },
    });
    if (purchased) {
        return lectures.map((lecture) => ({
            id: lecture.id,
            title: lecture.title,
            type: lecture.type,
            url: lecture.url,
            content: lecture.content,
            is_published: lecture.isPublished,
            sort_order: lecture.sortOrder,
        }));
    }
    return lectures.map((lecture) => ({
        id: lecture.id,
        title: lecture.title,
        type: lecture.type,
        url: null,
        content: null,
        is_published: lecture.isPublished,
        sort_order: lecture.sortOrder,
        locked: true,
    }));
}
