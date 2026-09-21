import { z } from 'zod';

import { TopupMethod } from '../../entities/enums';
import { positiveMoneySchema } from '../../utils/money';
import { paginationSchema } from '../../utils/requestSchemas';

export const walletPaginationSchema = paginationSchema;

export const topupRequestSchema = z
  .object({
    amount: positiveMoneySchema,
    method: z.nativeEnum(TopupMethod),
    reference_number: z.string().trim().min(1).max(100),
    sender_name: z.string().trim().min(1).max(150),
    note: z.string().trim().max(1000).optional().nullable(),
  })
  .strict();
