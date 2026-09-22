import type { Request, Response } from 'express';

import { asyncHandler } from '../../utils/asyncHandler';
import { executeIdempotent } from '../../services/idempotency';
import { listMyCourses, listMyPayments, purchaseCourse } from './service';

export const buyCourse = asyncHandler(async (req: Request, res: Response) => {
  const result = await executeIdempotent({
    actorId: req.user!.id,
    route: '/api/courses/:id/purchase',
    key: req.get('Idempotency-Key') ?? undefined,
    action: async () => {
      const data = await purchaseCourse(req.user!.id, Number(req.params.id));
      return { status: 200, body: { success: true, data } };
    },
  });
  res.status(result.status).json(result.body);
});

export const myCourses = asyncHandler(async (req: Request, res: Response) => {
  const data = await listMyCourses(req.user!.id);
  res.status(200).json({ success: true, data });
});

export const myPayments = asyncHandler(async (req: Request, res: Response) => {
  const data = await listMyPayments(req.user!.id);
  res.status(200).json({ success: true, data });
});
