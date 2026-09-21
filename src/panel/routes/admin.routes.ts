import { Router } from 'express';
import { z } from 'zod';

import { UserRole } from '../../entities/enums';
import { requireRole } from '../../middlewares/role';
import { validate } from '../../middlewares/validate';
import {
	adminIdParamSchema,
	adjustBalanceSchema,
	activeUserSchema,
	adminNotificationSchema,
	adminSalesStatsSchema,
	adminStatsRangeSchema,
	adminTeachersStatsSchema,
	adminTopCoursesStatsSchema,
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
	adminUsersQuerySchema,
} from '../../modules/admin/schemas';
import { panelFlash } from '../middlewares/flash';
import { panelAuth } from '../middlewares/panelAuth';
import {
	approveTopupAction,
	adjustUserBalanceAction,
	coursesPage,
	createCourseAction,
	createLectureAction,
	createSpecializationAction,
	createTeacherAction,
	lecturesPage,
	notificationsPage,
	overviewPage,
	rejectTopupAction,
	resetUserDeviceAction,
	resetUserPasswordAction,
	sendNotificationAction,
	specializationsPage,
	statsRedirect,
	teacherPayoutAction,
	teacherPayoutsPage,
	teachersPage,
	topupsPage,
	toggleCourseAction,
	toggleSpecializationAction,
	toggleUserActiveAction,
	updateCourseAction,
	updateLectureAction,
	updateSpecializationAction,
	usersPage,
	hideLectureAction,
} from '../controllers/admin.controller';

export const panelAdminRoutes = Router();

const togglePublishSchema = z
	.object({
		next_is_published: z.string().min(1),
	})
	.strict();

const panelNotificationSchema = z
	.object({
		all: z.string().optional(),
		username: z.string().trim().optional(),
		title: z.string().trim().min(1).max(180),
		body: z.string().trim().min(1).max(5000),
	})
	.strict();

panelAdminRoutes.use(panelFlash, panelAuth, requireRole(UserRole.ADMIN));

panelAdminRoutes.get('/', (_req, res) => res.redirect('/panel/admin/overview'));
panelAdminRoutes.get('/overview', overviewPage);
panelAdminRoutes.get('/stats', statsRedirect);

panelAdminRoutes.get('/specializations', specializationsPage);
panelAdminRoutes.post('/specializations', validate({ body: specializationCreateSchema }), createSpecializationAction);
panelAdminRoutes.post('/specializations/:id', validate({ params: adminIdParamSchema, body: specializationUpdateSchema }), updateSpecializationAction);
panelAdminRoutes.post('/specializations/:id/toggle', validate({ params: adminIdParamSchema, body: togglePublishSchema }), toggleSpecializationAction);

panelAdminRoutes.get('/courses', coursesPage);
panelAdminRoutes.post('/courses', validate({ body: courseCreateSchema }), createCourseAction);
panelAdminRoutes.post('/courses/:id', validate({ params: adminIdParamSchema, body: courseUpdateSchema }), updateCourseAction);
panelAdminRoutes.post('/courses/:id/toggle', validate({ params: adminIdParamSchema, body: togglePublishSchema }), toggleCourseAction);

panelAdminRoutes.get('/lectures', lecturesPage);
panelAdminRoutes.post('/lectures', validate({ body: lectureCreateSchema }), createLectureAction);
panelAdminRoutes.post('/lectures/:id', validate({ params: adminIdParamSchema, body: lectureUpdateSchema }), updateLectureAction);
panelAdminRoutes.post('/lectures/:id/hide', validate({ params: adminIdParamSchema }), hideLectureAction);

panelAdminRoutes.get('/topups', validate({ query: topupRequestsQuerySchema }), topupsPage);
panelAdminRoutes.post('/topups/:id/approve', validate({ params: adminIdParamSchema }), approveTopupAction);
panelAdminRoutes.post('/topups/:id/reject', validate({ params: adminIdParamSchema, body: rejectTopupSchema }), rejectTopupAction);

panelAdminRoutes.get('/users', validate({ query: adminUsersQuerySchema }), usersPage);
panelAdminRoutes.post('/users/:id/active', validate({ params: adminIdParamSchema, body: activeUserSchema }), toggleUserActiveAction);
panelAdminRoutes.post('/users/:id/reset-device', validate({ params: adminIdParamSchema }), resetUserDeviceAction);
panelAdminRoutes.post('/users/:id/reset-password', validate({ params: adminIdParamSchema, body: resetPasswordSchema }), resetUserPasswordAction);
panelAdminRoutes.post('/users/:id/adjust-balance', validate({ params: adminIdParamSchema, body: adjustBalanceSchema }), adjustUserBalanceAction);

panelAdminRoutes.get('/teachers', teachersPage);
panelAdminRoutes.post('/teachers', validate({ body: teacherCreateSchema }), createTeacherAction);
panelAdminRoutes.post('/teachers/:id/payouts', validate({ params: adminIdParamSchema, body: teacherPayoutSchema }), teacherPayoutAction);
panelAdminRoutes.get('/teachers/:id/payouts', validate({ params: adminIdParamSchema }), teacherPayoutsPage);

panelAdminRoutes.get('/notifications', notificationsPage);
panelAdminRoutes.post('/notifications', validate({ body: panelNotificationSchema }), sendNotificationAction);
