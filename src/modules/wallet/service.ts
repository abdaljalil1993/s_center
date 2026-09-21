import { QueryFailedError } from 'typeorm';

import { AppDataSource } from '../../config/data-source';
import { TopupRequest } from '../../entities/TopupRequest';
import { Transaction } from '../../entities/Transaction';
import { TopupMethod, TopupStatus, TransactionType } from '../../entities/enums';
import { User } from '../../entities/User';
import { AppError } from '../../utils/AppError';

function toTransactionResponse(transaction: Transaction) {
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

function toTopupRequestResponse(request: TopupRequest) {
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

export async function getWallet(userId: number) {
  const user = await AppDataSource.getRepository(User).findOne({ where: { id: userId } });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return { balance: user.balance };
}

export async function listWalletTransactions(userId: number, pagination: { limit: number; offset: number }) {
  const transactionRepository = AppDataSource.getRepository(Transaction);
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

export async function createTopupRequest(userId: number, input: { amount: string; method: TopupMethod; reference_number: string; sender_name: string; note?: string | null }) {
  const topupRequestRepository = AppDataSource.getRepository(TopupRequest);
  const pendingCount = await topupRequestRepository.count({
    where: { user: { id: userId }, status: TopupStatus.PENDING },
  });

  if (pendingCount >= 5) {
    throw new AppError(400, 'You already have 5 pending top-up requests');
  }

  try {
    const request = topupRequestRepository.create({
      user: { id: userId } as User,
      amount: input.amount,
      method: input.method,
      referenceNumber: input.reference_number,
      senderName: input.sender_name,
      note: input.note ?? null,
      status: TopupStatus.PENDING,
      rejectReason: null,
      reviewedBy: null,
      reviewedAt: null,
    });

    const saved = await topupRequestRepository.save(request);
    return toTopupRequestResponse(saved);
  } catch (error) {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as { errno?: number; code?: string } | undefined;
      if (driverError?.errno === 1062 || driverError?.code === 'ER_DUP_ENTRY') {
        throw new AppError(409, 'This transfer was already submitted');
      }
    }
    throw error;
  }
}

export async function listMyTopupRequests(userId: number, pagination: { limit: number; offset: number }) {
  const topupRequestRepository = AppDataSource.getRepository(TopupRequest);
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
