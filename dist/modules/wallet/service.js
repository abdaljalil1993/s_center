"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWallet = getWallet;
exports.listWalletTransactions = listWalletTransactions;
exports.createTopupRequest = createTopupRequest;
exports.listMyTopupRequests = listMyTopupRequests;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../../config/data-source");
const TopupRequest_1 = require("../../entities/TopupRequest");
const Transaction_1 = require("../../entities/Transaction");
const enums_1 = require("../../entities/enums");
const User_1 = require("../../entities/User");
const AppError_1 = require("../../utils/AppError");
function toTransactionResponse(transaction) {
    return {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        balance_after: transaction.balanceAfter,
        description: transaction.description,
        reference_type: transaction.referenceType,
        reference_id: transaction.referenceId,
        created_at: transaction.createdAt,
    };
}
function toTopupRequestResponse(request) {
    return {
        id: request.id,
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
async function getWallet(userId) {
    const user = await data_source_1.AppDataSource.getRepository(User_1.User).findOne({ where: { id: userId } });
    if (!user) {
        throw new AppError_1.AppError(404, 'User not found');
    }
    return { balance: user.balance };
}
async function listWalletTransactions(userId, pagination) {
    const transactionRepository = data_source_1.AppDataSource.getRepository(Transaction_1.Transaction);
    const [transactions, total] = await transactionRepository.findAndCount({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC', id: 'DESC' },
        take: pagination.limit,
        skip: pagination.offset,
    });
    return {
        items: transactions.map(toTransactionResponse),
        total,
        limit: pagination.limit,
        offset: pagination.offset,
    };
}
async function createTopupRequest(userId, input) {
    const topupRequestRepository = data_source_1.AppDataSource.getRepository(TopupRequest_1.TopupRequest);
    const pendingCount = await topupRequestRepository.count({
        where: { user: { id: userId }, status: enums_1.TopupStatus.PENDING },
    });
    if (pendingCount >= 5) {
        throw new AppError_1.AppError(400, 'You already have 5 pending top-up requests');
    }
    try {
        const request = topupRequestRepository.create({
            user: { id: userId },
            amount: input.amount,
            method: input.method,
            referenceNumber: input.reference_number,
            senderName: input.sender_name,
            note: input.note ?? null,
            status: enums_1.TopupStatus.PENDING,
            rejectReason: null,
            reviewedBy: null,
            reviewedAt: null,
        });
        const saved = await topupRequestRepository.save(request);
        return toTopupRequestResponse(saved);
    }
    catch (error) {
        if (error instanceof typeorm_1.QueryFailedError) {
            const driverError = error.driverError;
            if (driverError?.errno === 1062 || driverError?.code === 'ER_DUP_ENTRY') {
                throw new AppError_1.AppError(409, 'This transfer was already submitted');
            }
        }
        throw error;
    }
}
async function listMyTopupRequests(userId, pagination) {
    const topupRequestRepository = data_source_1.AppDataSource.getRepository(TopupRequest_1.TopupRequest);
    const [requests, total] = await topupRequestRepository.findAndCount({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC', id: 'DESC' },
        take: pagination.limit,
        skip: pagination.offset,
    });
    return {
        items: requests.map(toTopupRequestResponse),
        total,
        limit: pagination.limit,
        offset: pagination.offset,
    };
}
