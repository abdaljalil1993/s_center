import { Router } from 'express';

import { authMiddleware } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { walletPaginationSchema, topupRequestSchema } from './schemas';
import { createTopup, topupRequests, transactions, wallet } from './controller';

export const walletRoutes = Router();

walletRoutes.get('/', authMiddleware, wallet);
walletRoutes.get('/transactions', authMiddleware, validate({ query: walletPaginationSchema }), transactions);
walletRoutes.post('/topup-requests', authMiddleware, validate({ body: topupRequestSchema }), createTopup);
walletRoutes.get('/topup-requests', authMiddleware, validate({ query: walletPaginationSchema }), topupRequests);
