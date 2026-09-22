import type { Request, Response } from 'express';

import { asyncHandler } from '../../utils/asyncHandler';
import { executeIdempotent } from '../../services/idempotency';
import { createTopupRequest, getWallet, listMyTopupRequests, listWalletTransactions } from './service';

export const wallet = asyncHandler(async (req: Request, res: Response) => {
  const data = await getWallet(req.user!.id);
  res.status(200).json({ success: true, data });
});

export const transactions = asyncHandler(async (req: Request, res: Response) => {
  const data = await listWalletTransactions(req.user!.id, req.query as unknown as { limit: number; offset: number });
  res.status(200).json({ success: true, data });
});

export const createTopup = asyncHandler(async (req: Request, res: Response) => {
  const result = await executeIdempotent({
    actorId: req.user!.id,
    route: '/api/topup-requests',
    key: req.get('Idempotency-Key') ?? undefined,
    action: async () => {
      const data = await createTopupRequest(req.user!.id, req.body);
      return { status: 201, body: { success: true, data } };
    },
  });
  res.status(result.status).json(result.body);
});

export const topupRequests = asyncHandler(async (req: Request, res: Response) => {
  const data = await listMyTopupRequests(req.user!.id, req.query as unknown as { limit: number; offset: number });
  res.status(200).json({ success: true, data });
});
