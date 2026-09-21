import type { Request, Response } from 'express';

import { asyncHandler } from '../../utils/asyncHandler';
import { listCourses, listLectures, listSpecializations } from './service';

export const getSpecializations = asyncHandler(async (_req: Request, res: Response) => {
  const data = await listSpecializations();
  res.status(200).json({ success: true, data });
});

export const getCourses = asyncHandler(async (req: Request, res: Response) => {
  const data = await listCourses(req.user!.id, req.query as { specializationId?: number; year?: number });
  res.status(200).json({ success: true, data });
});

export const getLectures = asyncHandler(async (req: Request, res: Response) => {
  const data = await listLectures(req.user!, Number(req.params.id));
  res.status(200).json({ success: true, data });
});
