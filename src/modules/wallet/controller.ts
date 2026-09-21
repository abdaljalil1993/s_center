import type { Request, Response } from 'express';

import { asyncHandler } from '../../utils/asyncHandler';
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
  const data = await createTopupRequest(req.user!.id, req.body);
  res.status(201).json({ success: true, data });
});

export const topupRequests = asyncHandler(async (req: Request, res: Response) => {
  const data = await listMyTopupRequests(req.user!.id, req.query as unknown as { limit: number; offset: number });
  res.status(200).json({ success: true, data });
});
