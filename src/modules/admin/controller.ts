import type { Request, Response } from 'express';

import { asyncHandler } from '../../utils/asyncHandler';
import {
  approveTopupRequest,
  archiveCourse,
  archiveLecture,
  archiveSpecialization,
  bySpecializationStats,
  createCourse,
  createLecture,
  createNotifications,
  createSpecialization,
  createTeacher,
  adjustBalance,
  getTopupRequestById,
  listTeacherPayouts,
  listTeachers,
  listCourses,
  listLectures,
  listSpecializations,
  listTopupRequests,
  listUsers,
  overviewStats,
  rejectTopupRequest,
  resetUserDevice,
  resetPassword,
  setUserActive,
  payoutTeacher,
  salesStats,
  teacherPayoutHistory,
  teachersStats,
  topCoursesStats,
  updateCourse,
  updateLecture,
  updateSpecialization,
} from './service';

export const getAdminSpecializations = asyncHandler(async (_req: Request, res: Response) => {
  const data = await listSpecializations();
  res.status(200).json({ success: true, data });
});

export const postAdminSpecialization = asyncHandler(async (req: Request, res: Response) => {
  const data = await createSpecialization(req.body);
  res.status(201).json({ success: true, data });
});

export const patchAdminSpecialization = asyncHandler(async (req: Request, res: Response) => {
  const data = await updateSpecialization(Number(req.params.id), req.body);
  res.status(200).json({ success: true, data });
});

export const deleteAdminSpecialization = asyncHandler(async (req: Request, res: Response) => {
  const data = await archiveSpecialization(Number(req.params.id));
  res.status(200).json({ success: true, data });
});

export const getAdminCourses = asyncHandler(async (_req: Request, res: Response) => {
  const data = await listCourses();
  res.status(200).json({ success: true, data });
});

export const postAdminCourse = asyncHandler(async (req: Request, res: Response) => {
  const data = await createCourse(req.body);
  res.status(201).json({ success: true, data });
});

export const patchAdminCourse = asyncHandler(async (req: Request, res: Response) => {
  const data = await updateCourse(Number(req.params.id), req.body);
  res.status(200).json({ success: true, data });
});

export const deleteAdminCourse = asyncHandler(async (req: Request, res: Response) => {
  const data = await archiveCourse(Number(req.params.id));
  res.status(200).json({ success: true, data });
});

export const getAdminLectures = asyncHandler(async (_req: Request, res: Response) => {
  const data = await listLectures();
  res.status(200).json({ success: true, data });
});

export const postAdminLecture = asyncHandler(async (req: Request, res: Response) => {
  const data = await createLecture(req.user!.id, req.body);
  res.status(201).json({ success: true, data });
});

export const patchAdminLecture = asyncHandler(async (req: Request, res: Response) => {
  const data = await updateLecture(Number(req.params.id), req.body);
  res.status(200).json({ success: true, data });
});

export const deleteAdminLecture = asyncHandler(async (req: Request, res: Response) => {
  const data = await archiveLecture(Number(req.params.id));
  res.status(200).json({ success: true, data });
});

export const getAdminTopupRequests = asyncHandler(async (req: Request, res: Response) => {
  const data = await listTopupRequests(req.query.status as unknown as import('../../entities/enums').TopupStatus);
  res.status(200).json({ success: true, data });
});

export const approveAdminTopupRequest = asyncHandler(async (req: Request, res: Response) => {
  const data = await approveTopupRequest(Number(req.params.id), req.user!.id);
  res.status(200).json({ success: true, data });
});

export const rejectAdminTopupRequest = asyncHandler(async (req: Request, res: Response) => {
  const data = await rejectTopupRequest(Number(req.params.id), req.user!.id, req.body.reason);
  res.status(200).json({ success: true, data });
});

export const getAdminUsers = asyncHandler(async (req: Request, res: Response) => {
  const data = await listUsers(req.query.search as string | undefined);
  res.status(200).json({ success: true, data });
});

export const patchAdminUserActive = asyncHandler(async (req: Request, res: Response) => {
  const data = await setUserActive(Number(req.params.id), req.body.is_active);
  res.status(200).json({ success: true, data });
});

export const resetAdminUserDevice = asyncHandler(async (req: Request, res: Response) => {
  const data = await resetUserDevice(Number(req.params.id));
  res.status(200).json({ success: true, data });
});

export const adjustAdminUserBalance = asyncHandler(async (req: Request, res: Response) => {
  const data = await adjustBalance(Number(req.params.id), req.body.amount, req.body.description);
  res.status(200).json({ success: true, data });
});

export const sendAdminNotification = asyncHandler(async (req: Request, res: Response) => {
  const data = await createNotifications(req.body);
  res.status(201).json({ success: true, data });
});

export const postAdminTeacher = asyncHandler(async (req: Request, res: Response) => {
  const data = await createTeacher(req.body);
  res.status(201).json({ success: true, data });
});

export const getAdminTeachers = asyncHandler(async (_req: Request, res: Response) => {
  const data = await listTeachers();
  res.status(200).json({ success: true, data });
});

export const postAdminTeacherPayout = asyncHandler(async (req: Request, res: Response) => {
  const data = await payoutTeacher(Number(req.params.id), req.user!.id, req.body.amount, req.body.note);
  res.status(201).json({ success: true, data });
});

export const getAdminTeacherPayouts = asyncHandler(async (req: Request, res: Response) => {
  const data = await teacherPayoutHistory(Number(req.params.id));
  res.status(200).json({ success: true, data });
});

export const postAdminResetPassword = asyncHandler(async (req: Request, res: Response) => {
  const data = await resetPassword(Number(req.params.id), req.body.new_password);
  res.status(200).json({ success: true, data });
});

export const getAdminStatsOverview = asyncHandler(async (req: Request, res: Response) => {
  const data = await overviewStats(req.query.from as string | undefined, req.query.to as string | undefined);
  res.status(200).json({ success: true, data });
});

export const getAdminStatsSales = asyncHandler(async (req: Request, res: Response) => {
  const data = await salesStats(Number(req.query.days), req.query.from as string | undefined, req.query.to as string | undefined);
  res.status(200).json({ success: true, data });
});

export const getAdminStatsTopCourses = asyncHandler(async (req: Request, res: Response) => {
  const data = await topCoursesStats(Number(req.query.limit), req.query.from as string | undefined, req.query.to as string | undefined);
  res.status(200).json({ success: true, data });
});

export const getAdminStatsBySpecialization = asyncHandler(async (req: Request, res: Response) => {
  const data = await bySpecializationStats(req.query.from as string | undefined, req.query.to as string | undefined);
  res.status(200).json({ success: true, data });
});

export const getAdminStatsTeachers = asyncHandler(async (req: Request, res: Response) => {
  const data = await teachersStats(req.query.from as string | undefined, req.query.to as string | undefined);
  res.status(200).json({ success: true, data });
});
