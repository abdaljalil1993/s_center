"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSpecializations = listSpecializations;
exports.createSpecialization = createSpecialization;
exports.updateSpecialization = updateSpecialization;
exports.archiveSpecialization = archiveSpecialization;
exports.listCourses = listCourses;
exports.createCourse = createCourse;
exports.updateCourse = updateCourse;
exports.archiveCourse = archiveCourse;
exports.listLectures = listLectures;
exports.createLecture = createLecture;
exports.updateLecture = updateLecture;
exports.archiveLecture = archiveLecture;
exports.listTopupRequests = listTopupRequests;
exports.approveTopupRequest = approveTopupRequest;
exports.rejectTopupRequest = rejectTopupRequest;
exports.listUsers = listUsers;
exports.setUserActive = setUserActive;
exports.resetUserDevice = resetUserDevice;
exports.adjustBalance = adjustBalance;
exports.createNotifications = createNotifications;
exports.getTopupRequestById = getTopupRequestById;
exports.createTeacher = createTeacher;
exports.listTeachers = listTeachers;
exports.payoutTeacher = payoutTeacher;
exports.listTeacherPayouts = listTeacherPayouts;
exports.resetPassword = resetPassword;
exports.overviewStats = overviewStats;
exports.salesStats = salesStats;
exports.topCoursesStats = topCoursesStats;
exports.bySpecializationStats = bySpecializationStats;
exports.teachersStats = teachersStats;
exports.teacherPayoutHistory = teacherPayoutHistory;
const bcrypt_1 = __importDefault(require("bcrypt"));
const typeorm_1 = require("typeorm");
const data_source_1 = require("../../config/data-source");
const Course_1 = require("../../entities/Course");
const Lecture_1 = require("../../entities/Lecture");
const Notification_1 = require("../../entities/Notification");
const Purchase_1 = require("../../entities/Purchase");
const TeacherPayout_1 = require("../../entities/TeacherPayout");
const Specialization_1 = require("../../entities/Specialization");
const TopupRequest_1 = require("../../entities/TopupRequest");
const enums_1 = require("../../entities/enums");
const Transaction_1 = require("../../entities/Transaction");
const User_1 = require("../../entities/User");
const enums_2 = require("../../entities/enums");
const AppError_1 = require("../../utils/AppError");
const money_1 = require("../../utils/money");
const service_1 = require("../notifications/service");
function mapSpecialization(specialization) {
    return {
        id: specialization.id,
        name: specialization.name,
        is_published: specialization.isPublished,
        sort_order: specialization.sortOrder,
        created_at: specialization.createdAt,
        updated_at: specialization.updatedAt,
    };
}
function mapCourse(course) {
    return {
        id: course.id,
        specialization_id: course.specialization.id,
        specialization_name: course.specialization.name,
        teacher_id: course.teacher ? course.teacher.id : null,
        teacher_full_name: course.teacher ? course.teacher.fullName : null,
        teacher_percent: course.teacherPercent,
        year: course.year,
        name: course.name,
        description: course.description,
        price: course.price,
        is_published: course.isPublished,
        sort_order: course.sortOrder,
        created_at: course.createdAt,
        updated_at: course.updatedAt,
    };
}
function mapLecture(lecture) {
    return {
        id: lecture.id,
        course_id: lecture.course.id,
        course_name: lecture.course.name,
        course_teacher_id: lecture.course.teacher ? lecture.course.teacher.id : null,
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
function mapUser(user) {
    return {
        id: user.id,
        username: user.username,
        full_name: user.fullName,
        role: user.role,
        is_active: user.isActive,
        balance: user.balance,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
    };
}
function mapTopupRequest(request) {
    return {
        id: request.id,
        user_id: request.user.id,
        username: request.user.username,
        full_name: request.user.fullName,
        amount: request.amount,
        method: request.method,
        reference_number: request.referenceNumber,
        sender_name: request.senderName,
        note: request.note,
        status: request.status,
        reject_reason: request.rejectReason,
        reviewed_by: request.reviewedBy ? request.reviewedBy.id : null,
        reviewed_at: request.reviewedAt,
        created_at: request.createdAt,
    };
}
function mapTeacherAggregate(row) {
    const earned = String(row.total_earned ?? '0.00');
    const paid = String(row.total_paid ?? '0.00');
    const remaining = (0, money_1.centsToMoney)((0, money_1.toCents)(earned) - (0, money_1.toCents)(paid));
    return {
        teacher_id: Number(row.teacher_id),
        username: String(row.username ?? ''),
        full_name: String(row.full_name ?? ''),
        purchases_count: Number(row.purchases_count ?? 0),
        earned,
        paid,
        remaining,
    };
}
function addDateFilter(qb, alias, from, to) {
    if (from) {
        qb.andWhere(`${alias}.created_at >= :from`, { from });
    }
    if (to) {
        qb.andWhere(`${alias}.created_at <= :to`, { to });
    }
}
async function requireTeacherUser(id) {
    const user = await data_source_1.AppDataSource.getRepository(User_1.User).findOne({ where: { id, role: enums_2.UserRole.TEACHER } });
    if (!user) {
        throw new AppError_1.AppError(400, 'teacher_id must reference a TEACHER user');
    }
    return user;
}
async function requireNonAdminUser(id) {
    const user = await data_source_1.AppDataSource.getRepository(User_1.User).findOne({ where: { id } });
    if (!user) {
        throw new AppError_1.AppError(404, 'User not found');
    }
    if (user.role === enums_2.UserRole.ADMIN) {
        throw new AppError_1.AppError(400, 'Admin users cannot be modified');
    }
    return user;
}
async function findSpecializationOrFail(id) {
    const specialization = await data_source_1.AppDataSource.getRepository(Specialization_1.Specialization).findOne({ where: { id } });
    if (!specialization) {
        throw new AppError_1.AppError(404, 'Specialization not found');
    }
    return specialization;
}
async function findCourseOrFail(id) {
    const course = await data_source_1.AppDataSource.getRepository(Course_1.Course).findOne({ where: { id }, relations: { specialization: true, teacher: true } });
    if (!course) {
        throw new AppError_1.AppError(404, 'Course not found');
    }
    return course;
}
async function findLectureOrFail(id) {
    const lecture = await data_source_1.AppDataSource.getRepository(Lecture_1.Lecture).findOne({ where: { id }, relations: { course: { specialization: true, teacher: true }, createdBy: true } });
    if (!lecture) {
        throw new AppError_1.AppError(404, 'Lecture not found');
    }
    return lecture;
}
async function findTopupRequestOrFail(id) {
    const request = await data_source_1.AppDataSource.getRepository(TopupRequest_1.TopupRequest).findOne({
        where: { id },
        relations: { user: true, reviewedBy: true },
    });
    if (!request) {
        throw new AppError_1.AppError(404, 'Top-up request not found');
    }
    return request;
}
async function listSpecializations() {
    const specializations = await data_source_1.AppDataSource.getRepository(Specialization_1.Specialization).find({ order: { sortOrder: 'ASC', id: 'ASC' } });
    return specializations.map(mapSpecialization);
}
async function createSpecialization(input) {
    const specialization = data_source_1.AppDataSource.getRepository(Specialization_1.Specialization).create({
        name: input.name,
        isPublished: input.is_published ?? true,
        sortOrder: input.sort_order ?? 0,
    });
    return mapSpecialization(await data_source_1.AppDataSource.getRepository(Specialization_1.Specialization).save(specialization));
}
async function updateSpecialization(id, input) {
    const repository = data_source_1.AppDataSource.getRepository(Specialization_1.Specialization);
    const specialization = await repository.findOne({ where: { id } });
    if (!specialization) {
        throw new AppError_1.AppError(404, 'Specialization not found');
    }
    if (input.name !== undefined)
        specialization.name = input.name;
    if (input.is_published !== undefined)
        specialization.isPublished = input.is_published;
    if (input.sort_order !== undefined)
        specialization.sortOrder = input.sort_order;
    return mapSpecialization(await repository.save(specialization));
}
async function archiveSpecialization(id) {
    const repository = data_source_1.AppDataSource.getRepository(Specialization_1.Specialization);
    const specialization = await repository.findOne({ where: { id } });
    if (!specialization) {
        throw new AppError_1.AppError(404, 'Specialization not found');
    }
    specialization.isPublished = false;
    return mapSpecialization(await repository.save(specialization));
}
async function listCourses() {
    const courses = await data_source_1.AppDataSource.getRepository(Course_1.Course).find({
        relations: { specialization: true, teacher: true },
        order: { sortOrder: 'ASC', id: 'ASC' },
    });
    return courses.map(mapCourse);
}
async function createCourse(input) {
    const specialization = await findSpecializationOrFail(input.specialization_id);
    const teacher = input.teacher_id ? await requireTeacherUser(input.teacher_id) : null;
    const course = data_source_1.AppDataSource.getRepository(Course_1.Course).create({
        specialization,
        teacher,
        year: input.year,
        name: input.name,
        description: input.description ?? null,
        price: input.price,
        isPublished: input.is_published ?? true,
        sortOrder: input.sort_order ?? 0,
        teacherPercent: input.teacher_percent ?? '0.00',
    });
    return mapCourse(await data_source_1.AppDataSource.getRepository(Course_1.Course).save(course));
}
async function updateCourse(id, input) {
    const repository = data_source_1.AppDataSource.getRepository(Course_1.Course);
    const course = await repository.findOne({ where: { id }, relations: { specialization: true, teacher: true } });
    if (!course) {
        throw new AppError_1.AppError(404, 'Course not found');
    }
    if (input.specialization_id !== undefined) {
        course.specialization = await findSpecializationOrFail(input.specialization_id);
    }
    if (input.teacher_id !== undefined) {
        course.teacher = input.teacher_id === null ? null : await requireTeacherUser(input.teacher_id);
    }
    if (input.year !== undefined)
        course.year = input.year;
    if (input.name !== undefined)
        course.name = input.name;
    if (input.description !== undefined)
        course.description = input.description;
    if (input.price !== undefined)
        course.price = input.price;
    if (input.teacher_percent !== undefined)
        course.teacherPercent = input.teacher_percent;
    if (input.is_published !== undefined)
        course.isPublished = input.is_published;
    if (input.sort_order !== undefined)
        course.sortOrder = input.sort_order;
    return mapCourse(await repository.save(course));
}
async function archiveCourse(id) {
    const repository = data_source_1.AppDataSource.getRepository(Course_1.Course);
    const course = await repository.findOne({ where: { id }, relations: { specialization: true, teacher: true } });
    if (!course) {
        throw new AppError_1.AppError(404, 'Course not found');
    }
    course.isPublished = false;
    return mapCourse(await repository.save(course));
}
async function listLectures() {
    const lectures = await data_source_1.AppDataSource.getRepository(Lecture_1.Lecture).find({
        relations: { course: { specialization: true, teacher: true }, createdBy: true },
        order: { sortOrder: 'ASC', id: 'ASC' },
    });
    return lectures.map(mapLecture);
}
async function createLecture(adminId, input) {
    const course = await findCourseOrFail(input.course_id);
    const lecture = data_source_1.AppDataSource.getRepository(Lecture_1.Lecture).create({
        course,
        createdBy: { id: adminId },
        title: input.title,
        type: input.type,
        url: input.url ?? null,
        content: input.content ?? null,
        isPublished: input.is_published ?? true,
        sortOrder: input.sort_order ?? 0,
    });
    return mapLecture(await data_source_1.AppDataSource.getRepository(Lecture_1.Lecture).save(lecture));
}
async function updateLecture(id, input) {
    const repository = data_source_1.AppDataSource.getRepository(Lecture_1.Lecture);
    const lecture = await repository.findOne({ where: { id }, relations: { course: { specialization: true, teacher: true }, createdBy: true } });
    if (!lecture) {
        throw new AppError_1.AppError(404, 'Lecture not found');
    }
    if (input.course_id !== undefined)
        lecture.course = await findCourseOrFail(input.course_id);
    if (input.title !== undefined)
        lecture.title = input.title;
    if (input.type !== undefined)
        lecture.type = input.type;
    if (input.url !== undefined)
        lecture.url = input.url;
    if (input.content !== undefined)
        lecture.content = input.content;
    if (input.is_published !== undefined)
        lecture.isPublished = input.is_published;
    if (input.sort_order !== undefined)
        lecture.sortOrder = input.sort_order;
    return mapLecture(await repository.save(lecture));
}
async function archiveLecture(id) {
    const repository = data_source_1.AppDataSource.getRepository(Lecture_1.Lecture);
    const lecture = await repository.findOne({ where: { id }, relations: { course: { specialization: true, teacher: true }, createdBy: true } });
    if (!lecture) {
        throw new AppError_1.AppError(404, 'Lecture not found');
    }
    lecture.isPublished = false;
    return mapLecture(await repository.save(lecture));
}
async function listTopupRequests(status) {
    const requests = await data_source_1.AppDataSource.getRepository(TopupRequest_1.TopupRequest).find({
        where: { status },
        relations: { user: true, reviewedBy: true },
        order: { createdAt: 'DESC', id: 'DESC' },
    });
    return requests.map(mapTopupRequest);
}
async function approveTopupRequest(topupRequestId, reviewerId) {
    return data_source_1.AppDataSource.transaction(async (manager) => {
        const requestRepository = manager.getRepository(TopupRequest_1.TopupRequest);
        const userRepository = manager.getRepository(User_1.User);
        const transactionRepository = manager.getRepository(Transaction_1.Transaction);
        const request = await requestRepository.findOne({
            where: { id: topupRequestId },
            relations: { user: true, reviewedBy: true },
            lock: { mode: 'pessimistic_write' },
        });
        if (!request) {
            throw new AppError_1.AppError(404, 'Top-up request not found');
        }
        if (request.status !== enums_1.TopupStatus.PENDING) {
            throw new AppError_1.AppError(400, 'Top-up request is not pending');
        }
        const user = await userRepository.findOne({
            where: { id: request.user.id },
            lock: { mode: 'pessimistic_write' },
        });
        if (!user) {
            throw new AppError_1.AppError(404, 'User not found');
        }
        const newBalance = (0, money_1.centsToMoney)((0, money_1.toCents)(user.balance) + (0, money_1.toCents)(request.amount));
        user.balance = newBalance;
        await userRepository.save(user);
        const transaction = transactionRepository.create({
            user: { id: user.id },
            type: enums_1.TransactionType.TOPUP,
            amount: request.amount,
            balanceAfter: newBalance,
            description: `Top-up request approved: ${request.referenceNumber}`,
            referenceType: 'TOPUP_REQUEST',
            referenceId: request.id,
        });
        await transactionRepository.save(transaction);
        request.status = enums_1.TopupStatus.APPROVED;
        request.reviewedBy = { id: reviewerId };
        request.reviewedAt = new Date();
        request.rejectReason = null;
        await requestRepository.save(request);
        await (0, service_1.notify)(user.id, 'Top-up approved', `Your balance was topped up by ${request.amount}`, manager);
        return {
            message: 'Top-up request approved',
            request_id: request.id,
        };
    });
}
async function rejectTopupRequest(topupRequestId, reviewerId, reason) {
    return data_source_1.AppDataSource.transaction(async (manager) => {
        const requestRepository = manager.getRepository(TopupRequest_1.TopupRequest);
        const request = await requestRepository.findOne({
            where: { id: topupRequestId },
            relations: { user: true, reviewedBy: true },
            lock: { mode: 'pessimistic_write' },
        });
        if (!request) {
            throw new AppError_1.AppError(404, 'Top-up request not found');
        }
        if (request.status !== enums_1.TopupStatus.PENDING) {
            throw new AppError_1.AppError(400, 'Top-up request is not pending');
        }
        request.status = enums_1.TopupStatus.REJECTED;
        request.reviewedBy = { id: reviewerId };
        request.reviewedAt = new Date();
        request.rejectReason = reason;
        await requestRepository.save(request);
        await (0, service_1.notify)(request.user.id, 'Top-up rejected', `Your top-up request was rejected: ${reason}`, manager);
        return {
            message: 'Top-up request rejected',
            request_id: request.id,
        };
    });
}
async function listUsers(search) {
    const repository = data_source_1.AppDataSource.getRepository(User_1.User);
    const users = await repository.find({
        where: search
            ? [
                { username: (0, typeorm_1.Like)(`%${search}%`) },
                { fullName: (0, typeorm_1.Like)(`%${search}%`) },
            ]
            : undefined,
        order: { createdAt: 'DESC', id: 'DESC' },
    });
    return users.map(mapUser);
}
async function setUserActive(userId, isActive) {
    const repository = data_source_1.AppDataSource.getRepository(User_1.User);
    const user = await requireNonAdminUser(userId);
    user.isActive = isActive;
    return mapUser(await repository.save(user));
}
async function resetUserDevice(userId) {
    const repository = data_source_1.AppDataSource.getRepository(User_1.User);
    const user = await requireNonAdminUser(userId);
    user.deviceId = null;
    return mapUser(await repository.save(user));
}
async function adjustBalance(userId, amount, description) {
    return data_source_1.AppDataSource.transaction(async (manager) => {
        const userRepository = manager.getRepository(User_1.User);
        const transactionRepository = manager.getRepository(Transaction_1.Transaction);
        const user = await userRepository.findOne({
            where: { id: userId },
            lock: { mode: 'pessimistic_write' },
        });
        if (!user) {
            throw new AppError_1.AppError(404, 'User not found');
        }
        const newBalanceCents = (0, money_1.toCents)(user.balance) + (0, money_1.toCents)(amount);
        if (newBalanceCents < 0n) {
            throw new AppError_1.AppError(400, 'Balance cannot go below zero');
        }
        const newBalance = (0, money_1.centsToMoney)(newBalanceCents);
        user.balance = newBalance;
        await userRepository.save(user);
        await transactionRepository.save(transactionRepository.create({
            user: { id: user.id },
            type: enums_1.TransactionType.TOPUP,
            amount,
            balanceAfter: newBalance,
            description,
            referenceType: 'ADMIN_ADJUSTMENT',
            referenceId: null,
        }));
        return {
            message: 'Balance updated successfully',
            balance: newBalance,
        };
    });
}
async function createNotifications(input) {
    return data_source_1.AppDataSource.transaction(async (manager) => {
        const userRepository = manager.getRepository(User_1.User);
        const notificationRepository = manager.getRepository(Notification_1.Notification);
        const targetUsers = input.all
            ? await userRepository.find({ select: { id: true } })
            : input.user_id
                ? await userRepository.find({ where: { id: input.user_id }, select: { id: true } })
                : [];
        if (!input.all && targetUsers.length === 0) {
            throw new AppError_1.AppError(404, 'User not found');
        }
        const notifications = targetUsers.map((user) => notificationRepository.create({
            user: { id: user.id },
            title: input.title,
            body: input.body,
            isRead: false,
        }));
        await notificationRepository.save(notifications);
        return {
            message: 'Notification sent successfully',
            count: notifications.length,
        };
    });
}
async function getTopupRequestById(id) {
    const request = await findTopupRequestOrFail(id);
    return mapTopupRequest(request);
}
async function createTeacher(input) {
    const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
    const existing = await userRepository.findOne({ where: { username: input.username } });
    if (existing) {
        throw new AppError_1.AppError(409, 'Username already exists');
    }
    const passwordHash = await bcrypt_1.default.hash(input.password, 12);
    const teacher = userRepository.create({
        username: input.username,
        fullName: input.full_name,
        passwordHash,
        role: enums_2.UserRole.TEACHER,
        isActive: true,
        balance: '0.00',
        deviceId: null,
    });
    const saved = await userRepository.save(teacher);
    return mapUser(saved);
}
function buildTeacherAggregateQuery(from, to) {
    const purchaseAgg = data_source_1.AppDataSource.createQueryBuilder()
        .from(Purchase_1.Purchase, 'purchase')
        .innerJoin('purchase.course', 'course')
        .select('course.teacher_id', 'teacher_id')
        .addSelect('COUNT(purchase.id)', 'purchases_count')
        .addSelect('COALESCE(SUM(purchase.teacher_share), 0)', 'total_earned')
        .where('course.teacher_id IS NOT NULL');
    const payoutAgg = data_source_1.AppDataSource.createQueryBuilder()
        .from(TeacherPayout_1.TeacherPayout, 'payout')
        .select('payout.teacher_id', 'teacher_id')
        .addSelect('COALESCE(SUM(payout.amount), 0)', 'total_paid');
    addDateFilter(purchaseAgg, 'purchase', from, to);
    addDateFilter(payoutAgg, 'payout', from, to);
    purchaseAgg.groupBy('course.teacher_id');
    payoutAgg.groupBy('payout.teacher_id');
    return { purchaseAgg, payoutAgg };
}
async function loadTeacherRows(from, to) {
    const { purchaseAgg, payoutAgg } = buildTeacherAggregateQuery(from, to);
    return data_source_1.AppDataSource.getRepository(User_1.User)
        .createQueryBuilder('teacher')
        .select('teacher.id', 'teacher_id')
        .addSelect('teacher.username', 'username')
        .addSelect('teacher.full_name', 'full_name')
        .addSelect('COALESCE(purchases.purchases_count, 0)', 'purchases_count')
        .addSelect('COALESCE(purchases.total_earned, 0)', 'total_earned')
        .addSelect('COALESCE(payouts.total_paid, 0)', 'total_paid')
        .leftJoin(`(${purchaseAgg.getQuery()})`, 'purchases', 'purchases.teacher_id = teacher.id')
        .leftJoin(`(${payoutAgg.getQuery()})`, 'payouts', 'payouts.teacher_id = teacher.id')
        .setParameters({ ...purchaseAgg.getParameters(), ...payoutAgg.getParameters() })
        .where('teacher.role = :role', { role: enums_2.UserRole.TEACHER })
        .orderBy('teacher.id', 'ASC')
        .getRawMany();
}
async function listTeachers() {
    return (await loadTeacherRows()).map(mapTeacherAggregate);
}
async function payoutTeacher(teacherId, createdById, amount, note) {
    return data_source_1.AppDataSource.transaction(async (manager) => {
        const userRepository = manager.getRepository(User_1.User);
        const payoutRepository = manager.getRepository(TeacherPayout_1.TeacherPayout);
        const teacher = await userRepository.findOne({
            where: { id: teacherId, role: enums_2.UserRole.TEACHER },
            lock: { mode: 'pessimistic_write' },
        });
        if (!teacher) {
            throw new AppError_1.AppError(404, 'Teacher not found');
        }
        const earnedRow = await manager
            .getRepository(Purchase_1.Purchase)
            .createQueryBuilder('purchase')
            .innerJoin('purchase.course', 'course')
            .select('COALESCE(SUM(purchase.teacher_share), 0)', 'total_earned')
            .where('course.teacher_id = :teacherId', { teacherId })
            .getRawOne();
        const paidRow = await manager
            .getRepository(TeacherPayout_1.TeacherPayout)
            .createQueryBuilder('payout')
            .select('COALESCE(SUM(payout.amount), 0)', 'total_paid')
            .where('payout.teacher_id = :teacherId', { teacherId })
            .getRawOne();
        const totalEarned = String(earnedRow?.total_earned ?? '0.00');
        const totalPaid = String(paidRow?.total_paid ?? '0.00');
        const remaining = (0, money_1.toCents)(totalEarned) - (0, money_1.toCents)(totalPaid);
        if ((0, money_1.toCents)(amount) > remaining) {
            throw new AppError_1.AppError(400, 'Payout amount exceeds remaining balance');
        }
        const payout = payoutRepository.create({
            teacher: { id: teacher.id },
            amount,
            note: note ?? null,
            createdBy: { id: createdById },
        });
        const saved = await payoutRepository.save(payout);
        return {
            id: saved.id,
            teacher_id: teacher.id,
            amount: saved.amount,
            note: saved.note,
            created_by: saved.createdBy.id,
            created_at: saved.createdAt,
        };
    });
}
async function listTeacherPayouts(teacherId) {
    const payouts = await data_source_1.AppDataSource.getRepository(TeacherPayout_1.TeacherPayout).find({
        where: { teacher: { id: teacherId } },
        relations: { createdBy: true },
        order: { createdAt: 'DESC', id: 'DESC' },
    });
    return payouts.map((payout) => ({
        id: payout.id,
        teacher_id: teacherId,
        amount: payout.amount,
        note: payout.note,
        created_by: payout.createdBy.id,
        created_at: payout.createdAt,
    }));
}
async function resetPassword(userId, newPassword) {
    const user = await requireNonAdminUser(userId);
    const passwordHash = await bcrypt_1.default.hash(newPassword, 12);
    user.passwordHash = passwordHash;
    await data_source_1.AppDataSource.getRepository(User_1.User).save(user);
    return { message: 'Password reset successfully' };
}
async function overviewStats(from, to) {
    const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
    const courseRepo = data_source_1.AppDataSource.getRepository(Course_1.Course);
    const purchaseRepo = data_source_1.AppDataSource.getRepository(Purchase_1.Purchase);
    const topupRepo = data_source_1.AppDataSource.getRepository(TopupRequest_1.TopupRequest);
    const studentsCountQuery = userRepo.createQueryBuilder('user').select('COUNT(user.id)', 'count').where('user.role = :role', { role: enums_2.UserRole.STUDENT });
    const teachersCountQuery = userRepo.createQueryBuilder('user').select('COUNT(user.id)', 'count').where('user.role = :role', { role: enums_2.UserRole.TEACHER });
    const coursesCountQuery = courseRepo.createQueryBuilder('course').select('COUNT(course.id)', 'count');
    const purchasesCountQuery = purchaseRepo.createQueryBuilder('purchase').select('COUNT(purchase.id)', 'count');
    const totalSalesQuery = purchaseRepo.createQueryBuilder('purchase').select('COALESCE(SUM(purchase.pricePaid), 0)', 'amount');
    const totalTopupsQuery = topupRepo.createQueryBuilder('request').select('COALESCE(SUM(request.amount), 0)', 'amount').where('request.status = :status', { status: enums_1.TopupStatus.APPROVED });
    const pendingTopupsQuery = topupRepo.createQueryBuilder('request').select('COUNT(request.id)', 'count').where('request.status = :status', { status: enums_1.TopupStatus.PENDING });
    const totalBalanceQuery = userRepo.createQueryBuilder('user').select('COALESCE(SUM(user.balance), 0)', 'amount').where('user.role = :role', { role: enums_2.UserRole.STUDENT });
    addDateFilter(studentsCountQuery, 'user', from, to);
    addDateFilter(teachersCountQuery, 'user', from, to);
    addDateFilter(coursesCountQuery, 'course', from, to);
    addDateFilter(purchasesCountQuery, 'purchase', from, to);
    addDateFilter(totalSalesQuery, 'purchase', from, to);
    if (from) {
        pendingTopupsQuery.andWhere('request.created_at >= :from', { from });
    }
    if (to) {
        pendingTopupsQuery.andWhere('request.created_at <= :to', { to });
    }
    if (from) {
        totalTopupsQuery.andWhere('request.reviewed_at >= :from', { from });
    }
    if (to) {
        totalTopupsQuery.andWhere('request.reviewed_at <= :to', { to });
    }
    addDateFilter(totalBalanceQuery, 'user', from, to);
    const [studentsCount, teachersCount, coursesCount, purchasesCount, salesRow, topupRow, pendingRow, balanceRow] = await Promise.all([
        studentsCountQuery.getRawOne(),
        teachersCountQuery.getRawOne(),
        coursesCountQuery.getRawOne(),
        purchasesCountQuery.getRawOne(),
        totalSalesQuery.getRawOne(),
        totalTopupsQuery.getRawOne(),
        pendingTopupsQuery.getRawOne(),
        totalBalanceQuery.getRawOne(),
    ]);
    return {
        students_count: Number(studentsCount?.count ?? 0),
        teachers_count: Number(teachersCount?.count ?? 0),
        courses_count: Number(coursesCount?.count ?? 0),
        purchases_count: Number(purchasesCount?.count ?? 0),
        total_sales_amount: String(salesRow?.amount ?? '0.00'),
        total_topups_amount: String(topupRow?.amount ?? '0.00'),
        pending_topups_count: Number(pendingRow?.count ?? 0),
        total_students_balance: String(balanceRow?.amount ?? '0.00'),
    };
}
function buildDateSeries(start, end) {
    const series = [];
    const current = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
    const finalDate = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
    while (current <= finalDate) {
        series.push(current.toISOString().slice(0, 10));
        current.setUTCDate(current.getUTCDate() + 1);
    }
    return series;
}
async function salesStats(days, from, to) {
    const endDate = to ? new Date(to) : new Date();
    const startDate = from ? new Date(from) : new Date(endDate);
    if (!from) {
        startDate.setUTCDate(startDate.getUTCDate() - (days - 1));
    }
    const rows = await data_source_1.AppDataSource.getRepository(Purchase_1.Purchase)
        .createQueryBuilder('purchase')
        .select("DATE_FORMAT(purchase.created_at, '%Y-%m-%d')", 'date')
        .addSelect('COUNT(purchase.id)', 'purchases_count')
        .addSelect('COALESCE(SUM(purchase.pricePaid), 0)', 'amount')
        .where('purchase.created_at >= :from', { from: startDate.toISOString() })
        .andWhere('purchase.created_at <= :to', { to: endDate.toISOString() })
        .groupBy('date')
        .orderBy('date', 'ASC')
        .getRawMany();
    const rowMap = new Map(rows.map((row) => [row.date, row]));
    return buildDateSeries(startDate, endDate).map((date) => {
        const row = rowMap.get(date);
        return {
            date,
            purchases_count: Number(row?.purchases_count ?? 0),
            amount: String(row?.amount ?? '0.00'),
        };
    });
}
async function topCoursesStats(limit, from, to) {
    const query = data_source_1.AppDataSource.getRepository(Purchase_1.Purchase)
        .createQueryBuilder('purchase')
        .innerJoin('purchase.course', 'course')
        .leftJoin('course.teacher', 'teacher')
        .select('course.id', 'course_id')
        .addSelect('course.name', 'name')
        .addSelect('teacher.full_name', 'teacher_name')
        .addSelect('COUNT(purchase.id)', 'purchases_count')
        .addSelect('COALESCE(SUM(purchase.pricePaid), 0)', 'revenue')
        .groupBy('course.id')
        .orderBy('purchases_count', 'DESC')
        .addOrderBy('course.id', 'ASC')
        .limit(limit);
    addDateFilter(query, 'purchase', from, to);
    const rows = await query.getRawMany();
    return rows.map((row) => ({
        course_id: Number(row.course_id),
        name: row.name,
        teacher_name: row.teacher_name,
        purchases_count: Number(row.purchases_count),
        revenue: String(row.revenue ?? '0.00'),
    }));
}
async function bySpecializationStats(from, to) {
    const query = data_source_1.AppDataSource.getRepository(Purchase_1.Purchase)
        .createQueryBuilder('purchase')
        .innerJoin('purchase.course', 'course')
        .innerJoin('course.specialization', 'specialization')
        .select('specialization.id', 'specialization_id')
        .addSelect('specialization.name', 'name')
        .addSelect('COUNT(purchase.id)', 'purchases_count')
        .addSelect('COALESCE(SUM(purchase.pricePaid), 0)', 'revenue')
        .groupBy('specialization.id')
        .orderBy('purchases_count', 'DESC')
        .addOrderBy('specialization.id', 'ASC');
    addDateFilter(query, 'purchase', from, to);
    const rows = await query.getRawMany();
    return rows.map((row) => ({
        specialization_id: Number(row.specialization_id),
        name: row.name,
        purchases_count: Number(row.purchases_count),
        revenue: String(row.revenue ?? '0.00'),
    }));
}
async function teachersStats(from, to) {
    return (await loadTeacherRows(from, to)).map(mapTeacherAggregate);
}
async function teacherPayoutHistory(teacherId) {
    return listTeacherPayouts(teacherId);
}
