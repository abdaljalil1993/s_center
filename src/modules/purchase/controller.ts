import type { Request, Response } from 'express';

import { asyncHandler } from '../../utils/asyncHandler';
import { listMyCourses, listMyPayments, purchaseCourse } from './service';

export const buyCourse = asyncHandler(async (req: Request, res: Response) => {
  const data = await purchaseCourse(req.user!.id, Number(req.params.id));
  res.status(200).json({ success: true, data });
});

export const myCourses = asyncHandler(async (req: Request, res: Response) => {
  const data = await listMyCourses(req.user!.id);
  res.status(200).json({ success: true, data });
});

export const myPayments = asyncHandler(async (req: Request, res: Response) => {
  const data = await listMyPayments(req.user!.id);
  res.status(200).json({ success: true, data });
});
