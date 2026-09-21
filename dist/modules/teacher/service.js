"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMyCourses = listMyCourses;
exports.listCourseLectures = listCourseLectures;
exports.createLectureForTeacher = createLectureForTeacher;
exports.updateTeacherLecture = updateTeacherLecture;
exports.archiveTeacherLecture = archiveTeacherLecture;
exports.getTeacherStats = getTeacherStats;
exports.listTeacherPayouts = listTeacherPayouts;
const data_source_1 = require("../../config/data-source");
const Course_1 = require("../../entities/Course");
const Lecture_1 = require("../../entities/Lecture");
const TeacherPayout_1 = require("../../entities/TeacherPayout");
const AppError_1 = require("../../utils/AppError");
const money_1 = require("../../utils/money");
function toNumber(value) {
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value === 'string') {
        return Number(value);
    }
    return 0;
}
function toMoney(value) {
    if (value === null || value === undefined || value === '') {
        return '0.00';
    }
    return String(value);
}
async function assertOwnedCourse(courseId, teacherId) {
    const course = await data_source_1.AppDataSource.getRepository(Course_1.Course).findOne({
        where: { id: courseId, teacher: { id: teacherId } },
        relations: { teacher: true, specialization: true },
    });
    if (!course) {
        throw new AppError_1.AppError(403, 'Access denied');
    }
    return course;
}
async function assertOwnedLecture(lectureId, teacherId) {
    const lecture = await data_source_1.AppDataSource.getRepository(Lecture_1.Lecture).findOne({
        where: { id: lectureId },
        relations: { course: { teacher: true, specialization: true }, createdBy: true },
    });
    if (!lecture || lecture.course.teacher?.id !== teacherId) {
        throw new AppError_1.AppError(403, 'Access denied');
    }
    return lecture;
}
function mapCourseRow(row) {
    return {
        course_id: toNumber(row.course_id),
        name: String(row.name ?? ''),
        year: toNumber(row.year),
        description: row.description === null ? null : row.description ?? null,
        price: toMoney(row.price),
        is_published: Boolean(row.is_published),
        sort_order: toNumber(row.sort_order),
        purchases_count: toNumber(row.purchases_count),
        earned: toMoney(row.earned),
    };
}
function mapLecture(lecture) {
    return {
        id: lecture.id,
        course_id: lecture.course.id,
        title: lecture.title,
        type: lecture.type,
        url: lecture.url,
        content: lecture.content,
        is_published: lecture.isPublished,
        sort_order: lecture.sortOrder,
        created_by: lecture.createdBy ? lecture.createdBy.id : null,
        created_at: lecture.createdAt,
        updated_at: lecture.updatedAt,
    };
}
function mapPayout(payout) {
    return {
        id: payout.id,
        amount: payout.amount,
        note: payout.note,
        created_by: payout.createdBy.id,
        created_at: payout.createdAt,
    };
}
async function listMyCourses(teacherId) {
    const rows = await data_source_1.AppDataSource.getRepository(Course_1.Course)
        .createQueryBuilder('course')
        .leftJoin('course.purchases', 'purchase')
        .select('course.id', 'course_id')
        .addSelect('course.name', 'name')
        .addSelect('course.year', 'year')
        .addSelect('course.description', 'description')
        .addSelect('course.price', 'price')
        .addSelect('course.isPublished', 'is_published')
        .addSelect('course.sortOrder', 'sort_order')
        .addSelect('COUNT(purchase.id)', 'purchases_count')
        .addSelect('COALESCE(SUM(purchase.teacherShare), 0)', 'earned')
        .where('course.teacher_id = :teacherId', { teacherId })
        .groupBy('course.id')
        .orderBy('course.sortOrder', 'ASC')
        .addOrderBy('course.id', 'ASC')
        .getRawMany();
    return rows.map(mapCourseRow);
}
async function listCourseLectures(teacherId, courseId) {
    await assertOwnedCourse(courseId, teacherId);
    const lectures = await data_source_1.AppDataSource.getRepository(Lecture_1.Lecture).find({
        where: { course: { id: courseId } },
        relations: { course: true, createdBy: true },
        order: { sortOrder: 'ASC', id: 'ASC' },
    });
    return lectures.map(mapLecture);
}
async function createLectureForTeacher(teacherId, courseId, input) {
    const course = await assertOwnedCourse(courseId, teacherId);
    const repository = data_source_1.AppDataSource.getRepository(Lecture_1.Lecture);
    const lecture = repository.create({
        course,
        createdBy: { id: teacherId },
        title: input.title,
        type: input.type,
        url: input.url ?? null,
        content: input.content ?? null,
        isPublished: true,
        sortOrder: input.sort_order ?? 0,
    });
    return mapLecture(await repository.save(lecture));
}
async function updateTeacherLecture(teacherId, lectureId, input) {
    const repository = data_source_1.AppDataSource.getRepository(Lecture_1.Lecture);
    const lecture = await assertOwnedLecture(lectureId, teacherId);
    if (input.title !== undefined)
        lecture.title = input.title;
    if (input.type !== undefined)
        lecture.type = input.type;
    if (input.url !== undefined)
        lecture.url = input.url;
    if (input.content !== undefined)
        lecture.content = input.content;
    if (input.sort_order !== undefined)
        lecture.sortOrder = input.sort_order;
    return mapLecture(await repository.save(lecture));
}
async function archiveTeacherLecture(teacherId, lectureId) {
    const repository = data_source_1.AppDataSource.getRepository(Lecture_1.Lecture);
    const lecture = await assertOwnedLecture(lectureId, teacherId);
    lecture.isPublished = false;
    return mapLecture(await repository.save(lecture));
}
async function getTeacherStats(teacherId) {
    const [courses, payoutRow] = await Promise.all([
        data_source_1.AppDataSource.getRepository(Course_1.Course)
            .createQueryBuilder('course')
            .leftJoin('course.purchases', 'purchase')
            .select('course.id', 'course_id')
            .addSelect('course.name', 'name')
            .addSelect('COUNT(purchase.id)', 'purchases_count')
            .addSelect('COALESCE(SUM(purchase.teacherShare), 0)', 'earned')
            .where('course.teacher_id = :teacherId', { teacherId })
            .groupBy('course.id')
            .orderBy('course.sortOrder', 'ASC')
            .addOrderBy('course.id', 'ASC')
            .getRawMany(),
        data_source_1.AppDataSource.getRepository(TeacherPayout_1.TeacherPayout)
            .createQueryBuilder('payout')
            .select('COALESCE(SUM(payout.amount), 0)', 'total_paid')
            .where('payout.teacher_id = :teacherId', { teacherId })
            .getRawOne(),
    ]);
    let totalPurchases = 0;
    let totalEarnedCents = 0n;
    const mappedCourses = courses.map((row) => {
        const purchasesCount = toNumber(row.purchases_count);
        const earned = toMoney(row.earned);
        totalPurchases += purchasesCount;
        totalEarnedCents += (0, money_1.toCents)(earned);
        return {
            course_id: toNumber(row.course_id),
            name: String(row.name ?? ''),
            purchases_count: purchasesCount,
            earned,
        };
    });
    const totalPaid = toMoney(payoutRow?.total_paid);
    const remaining = (0, money_1.centsToMoney)(totalEarnedCents - (0, money_1.toCents)(totalPaid));
    return {
        total_purchases: totalPurchases,
        total_earned: (0, money_1.centsToMoney)(totalEarnedCents),
        total_paid: totalPaid,
        remaining,
        courses: mappedCourses,
    };
}
async function listTeacherPayouts(teacherId) {
    const payouts = await data_source_1.AppDataSource.getRepository(TeacherPayout_1.TeacherPayout).find({
        where: { teacher: { id: teacherId } },
        relations: { createdBy: true },
        order: { createdAt: 'DESC', id: 'DESC' },
    });
    return payouts.map(mapPayout);
}
