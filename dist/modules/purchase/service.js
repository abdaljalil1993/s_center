"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseCourse = purchaseCourse;
exports.listMyCourses = listMyCourses;
exports.listMyPayments = listMyPayments;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../../config/data-source");
const Course_1 = require("../../entities/Course");
const Purchase_1 = require("../../entities/Purchase");
const Transaction_1 = require("../../entities/Transaction");
const enums_1 = require("../../entities/enums");
const User_1 = require("../../entities/User");
const AppError_1 = require("../../utils/AppError");
const money_1 = require("../../utils/money");
const service_1 = require("../notifications/service");
function toPurchasedCourseResponse(purchase) {
    return {
        id: purchase.course.id,
        specialization_id: purchase.course.specialization.id,
        teacher_full_name: purchase.course.teacher ? purchase.course.teacher.fullName : null,
        year: purchase.course.year,
        name: purchase.course.name,
        description: purchase.course.description,
        price: purchase.course.price,
        price_paid: purchase.pricePaid,
        teacher_share: purchase.teacherShare,
        purchased_at: purchase.createdAt,
    };
}
function toPaymentResponse(transaction) {
    return {
        id: transaction.id,
        amount: transaction.amount,
        balance_after: transaction.balanceAfter,
        description: transaction.description,
        reference_type: transaction.referenceType,
        reference_id: transaction.referenceId,
        created_at: transaction.createdAt,
    };
}
async function purchaseCourse(userId, courseId) {
    try {
        const result = await data_source_1.AppDataSource.transaction(async (manager) => {
            const courseRepository = manager.getRepository(Course_1.Course);
            const userRepository = manager.getRepository(User_1.User);
            const purchaseRepository = manager.getRepository(Purchase_1.Purchase);
            const transactionRepository = manager.getRepository(Transaction_1.Transaction);
            const course = await courseRepository.findOne({
                where: { id: courseId, isPublished: true, specialization: { isPublished: true } },
                relations: { specialization: true, teacher: true },
            });
            if (!course) {
                throw new AppError_1.AppError(404, 'Course not found');
            }
            const user = await userRepository.findOne({
                where: { id: userId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!user) {
                throw new AppError_1.AppError(404, 'User not found');
            }
            const existingPurchase = await purchaseRepository.findOne({
                where: { user: { id: user.id }, course: { id: course.id } },
            });
            if (existingPurchase) {
                throw new AppError_1.AppError(409, 'You already purchased this course');
            }
            if ((0, money_1.toCents)(user.balance) < (0, money_1.toCents)(course.price)) {
                throw new AppError_1.AppError(400, 'Insufficient balance');
            }
            const purchase = purchaseRepository.create({
                user: { id: user.id },
                course: { id: course.id },
                pricePaid: course.price,
                teacher: course.teacher ? { id: course.teacher.id } : null,
                teacherShare: course.teacher ? (0, money_1.calculateMoneyShare)(course.price, course.teacherPercent) : '0.00',
            });
            const savedPurchase = await purchaseRepository.save(purchase);
            const balanceAfter = (0, money_1.centsToMoney)((0, money_1.toCents)(user.balance) - (0, money_1.toCents)(course.price));
            user.balance = balanceAfter;
            await userRepository.save(user);
            const transaction = transactionRepository.create({
                user: { id: user.id },
                type: enums_1.TransactionType.PURCHASE,
                amount: course.price,
                balanceAfter,
                description: `Purchased course: ${course.name}`,
                referenceType: 'PURCHASE',
                referenceId: savedPurchase.id,
            });
            await transactionRepository.save(transaction);
            await (0, service_1.notify)(user.id, 'Purchase successful', `You purchased ${course.name}`, manager);
            return {
                message: 'Course purchased successfully',
                purchase: {
                    id: savedPurchase.id,
                    course_id: course.id,
                    price_paid: savedPurchase.pricePaid,
                },
                balance: balanceAfter,
            };
        });
        return result;
    }
    catch (error) {
        if (error instanceof typeorm_1.QueryFailedError) {
            const driverError = error.driverError;
            if (driverError?.errno === 1062 || driverError?.code === 'ER_DUP_ENTRY') {
                throw new AppError_1.AppError(409, 'You already purchased this course');
            }
        }
        throw error;
    }
}
async function listMyCourses(userId) {
    const purchases = await data_source_1.AppDataSource.getRepository(Purchase_1.Purchase).find({
        where: { user: { id: userId } },
        relations: { course: { specialization: true, teacher: true } },
        order: { createdAt: 'DESC', id: 'DESC' },
    });
    return purchases.map(toPurchasedCourseResponse);
}
async function listMyPayments(userId) {
    const transactions = await data_source_1.AppDataSource.getRepository(Transaction_1.Transaction).find({
        where: { user: { id: userId }, type: enums_1.TransactionType.PURCHASE },
        order: { createdAt: 'DESC', id: 'DESC' },
    });
    return transactions.map(toPaymentResponse);
}
