import { LessThan } from 'typeorm';

import { AppDataSource } from '../config/data-source';
import { IdempotencyKey } from '../entities/IdempotencyKey';
import { AppError } from '../utils/AppError';

const EXPIRY_MS = 48 * 60 * 60 * 1000;

export interface IdempotentResponse<T> {
  status: number;
  body: T;
}

export async function cleanupExpiredIdempotencyKeys() {
  if (!AppDataSource.isInitialized) {
    return;
  }

  const cutoff = new Date(Date.now() - EXPIRY_MS);
  try {
    await AppDataSource.getRepository(IdempotencyKey).delete({ createdAt: LessThan(cutoff) });
  } catch (error) {
    const maybeDriverError = error as { driverError?: { code?: string; errno?: number } };
    if (maybeDriverError.driverError?.code === 'ER_NO_SUCH_TABLE' || maybeDriverError.driverError?.errno === 1146) {
      return;
    }
    throw error;
  }
}

export async function executeIdempotent<T>(input: {
  actorId: number;
  route: string;
  key: string | undefined;
  action: () => Promise<IdempotentResponse<T>>;
}): Promise<IdempotentResponse<T>> {
  const normalizedKey = input.key?.trim();
  if (!normalizedKey) {
    return input.action();
  }

  if (normalizedKey.length < 8 || normalizedKey.length > 64) {
    throw new AppError(400, 'Invalid Idempotency-Key header', 'INVALID_IDEMPOTENCY_KEY');
  }

  const repository = AppDataSource.getRepository(IdempotencyKey);
  const existing = await repository.findOne({
    where: {
      actorId: input.actorId,
      key: normalizedKey,
      route: input.route,
    },
  });

  if (existing) {
    if (existing.isProcessing || existing.responseStatus === null || existing.responseBody === null) {
      throw new AppError(409, 'Request is already processing', 'IDEMPOTENCY_IN_PROGRESS');
    }

    return {
      status: existing.responseStatus,
      body: JSON.parse(existing.responseBody) as T,
    };
  }

  const record = await repository.save(
    repository.create({
      actorId: input.actorId,
      key: normalizedKey,
      route: input.route,
      responseStatus: null,
      responseBody: null,
      isProcessing: true,
    }),
  );

  try {
    const response = await input.action();
    record.responseStatus = response.status;
    record.responseBody = JSON.stringify(response.body);
    record.isProcessing = false;
    await repository.save(record);
    return response;
  } catch (error) {
    if (error instanceof AppError) {
      record.responseStatus = error.statusCode;
      record.responseBody = JSON.stringify({ success: false, message: error.message, code: error.code });
      record.isProcessing = false;
      await repository.save(record);
    } else {
      await repository.delete({ id: record.id });
    }
    throw error;
  }
}