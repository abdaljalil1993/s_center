import { Router } from 'express';

import { authMiddleware } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/role';
import { validate } from '../../middlewares/validate';
import { UserRole } from '../../entities/enums';
import {
  adjustBalanceSchema,
  adminIdParamSchema,
  adminSalesStatsSchema,
  adminStatsRangeSchema,
  adminTeachersStatsSchema,
  adminTopCoursesStatsSchema,
  adminNotificationSchema,
  adminUsersQuerySchema,
  activeUserSchema,
  courseCreateSchema,
  courseUpdateSchema,
  lectureCreateSchema,
  lectureUpdateSchema,
  rejectTopupSchema,
  resetPasswordSchema,
  specializationCreateSchema,
  specializationUpdateSchema,
  teacherCreateSchema,
  teacherPayoutSchema,
  topupRequestsQuerySchema,
} from './schemas';
import {
  approveAdminTopupRequest,
  adjustAdminUserBalance,
  deleteAdminCourse,
  deleteAdminLecture,
  deleteAdminSpecialization,
  getAdminStatsBySpecialization,
  getAdminStatsOverview,
  getAdminStatsSales,
  getAdminStatsTeachers,
  getAdminStatsTopCourses,
  getAdminTeacherPayouts,
  getAdminCourses,
  getAdminLectures,
  getAdminSpecializations,
  getAdminTopupRequests,
  getAdminTeachers,
  getAdminUsers,
  patchAdminCourse,
  patchAdminLecture,
  patchAdminSpecialization,
  patchAdminUserActive,
  postAdminResetPassword,
  postAdminCourse,
  postAdminLecture,
  postAdminSpecialization,
  postAdminTeacher,
  postAdminTeacherPayout,
  rejectAdminTopupRequest,
  resetAdminUserDevice,
  sendAdminNotification,
} from './controller';

export const adminRoutes = Router();

adminRoutes.use(authMiddleware, requireRole(UserRole.ADMIN));

adminRoutes.get('/specializations', getAdminSpecializations);
adminRoutes.post('/specializations', validate({ body: specializationCreateSchema }), postAdminSpecialization);
adminRoutes.patch('/specializations/:id', validate({ params: adminIdParamSchema, body: specializationUpdateSchema }), patchAdminSpecialization);
adminRoutes.delete('/specializations/:id', validate({ params: adminIdParamSchema }), deleteAdminSpecialization);

adminRoutes.get('/courses', getAdminCourses);
adminRoutes.post('/courses', validate({ body: courseCreateSchema }), postAdminCourse);
adminRoutes.patch('/courses/:id', validate({ params: adminIdParamSchema, body: courseUpdateSchema }), patchAdminCourse);
adminRoutes.delete('/courses/:id', validate({ params: adminIdParamSchema }), deleteAdminCourse);

adminRoutes.get('/lectures', getAdminLectures);
adminRoutes.post('/lectures', validate({ body: lectureCreateSchema }), postAdminLecture);
adminRoutes.patch('/lectures/:id', validate({ params: adminIdParamSchema, body: lectureUpdateSchema }), patchAdminLecture);
adminRoutes.delete('/lectures/:id', validate({ params: adminIdParamSchema }), deleteAdminLecture);

adminRoutes.get('/topup-requests', validate({ query: topupRequestsQuerySchema }), getAdminTopupRequests);
adminRoutes.post('/topup-requests/:id/approve', validate({ params: adminIdParamSchema }), approveAdminTopupRequest);
adminRoutes.post('/topup-requests/:id/reject', validate({ params: adminIdParamSchema, body: rejectTopupSchema }), rejectAdminTopupRequest);

adminRoutes.get('/users', validate({ query: adminUsersQuerySchema }), getAdminUsers);
adminRoutes.patch('/users/:id/active', validate({ params: adminIdParamSchema, body: activeUserSchema }), patchAdminUserActive);
adminRoutes.post('/users/:id/reset-device', validate({ params: adminIdParamSchema }), resetAdminUserDevice);
adminRoutes.post('/users/:id/adjust-balance', validate({ params: adminIdParamSchema, body: adjustBalanceSchema }), adjustAdminUserBalance);
adminRoutes.post('/users/:id/reset-password', validate({ params: adminIdParamSchema, body: resetPasswordSchema }), postAdminResetPassword);

adminRoutes.post('/notifications', validate({ body: adminNotificationSchema }), sendAdminNotification);

adminRoutes.post('/teachers', validate({ body: teacherCreateSchema }), postAdminTeacher);
adminRoutes.get('/teachers', getAdminTeachers);
adminRoutes.post('/teachers/:id/payouts', validate({ params: adminIdParamSchema, body: teacherPayoutSchema }), postAdminTeacherPayout);
adminRoutes.get('/teachers/:id/payouts', validate({ params: adminIdParamSchema }), getAdminTeacherPayouts);

adminRoutes.get('/stats/overview', validate({ query: adminStatsRangeSchema }), getAdminStatsOverview);
adminRoutes.get('/stats/sales', validate({ query: adminSalesStatsSchema }), getAdminStatsSales);
adminRoutes.get('/stats/top-courses', validate({ query: adminTopCoursesStatsSchema }), getAdminStatsTopCourses);
adminRoutes.get('/stats/by-specialization', validate({ query: adminStatsRangeSchema }), getAdminStatsBySpecialization);
adminRoutes.get('/stats/teachers', validate({ query: adminTeachersStatsSchema }), getAdminStatsTeachers);
