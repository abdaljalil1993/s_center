import type { Request, Response } from 'express';

import { asyncHandler } from '../../utils/asyncHandler';
import {
  archiveTeacherLecture,
  createLectureForTeacher,
  getTeacherStats,
  listCourseLectures,
  listMyCourses,
  listTeacherPayouts,
  updateTeacherLecture,
} from './service';

export const getTeacherCourses = asyncHandler(async (req: Request, res: Response) => {
  const data = await listMyCourses(req.user!.id);
  res.status(200).json({ success: true, data });
});

export const getTeacherCourseLectures = asyncHandler(async (req: Request, res: Response) => {
  const data = await listCourseLectures(req.user!.id, Number(req.params.id));
  res.status(200).json({ success: true, data });
});

export const postTeacherLecture = asyncHandler(async (req: Request, res: Response) => {
  const data = await createLectureForTeacher(req.user!.id, Number(req.params.id), req.body);
  res.status(201).json({ success: true, data });
});

export const patchTeacherLecture = asyncHandler(async (req: Request, res: Response) => {
  const data = await updateTeacherLecture(req.user!.id, Number(req.params.id), req.body);
  res.status(200).json({ success: true, data });
});

export const deleteTeacherLecture = asyncHandler(async (req: Request, res: Response) => {
  const data = await archiveTeacherLecture(req.user!.id, Number(req.params.id));
  res.status(200).json({ success: true, data });
});

export const getTeacherStatsController = asyncHandler(async (req: Request, res: Response) => {
  const data = await getTeacherStats(req.user!.id);
  res.status(200).json({ success: true, data });
});

export const getTeacherPayouts = asyncHandler(async (req: Request, res: Response) => {
  const data = await listTeacherPayouts(req.user!.id);
  res.status(200).json({ success: true, data });
});
