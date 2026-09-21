"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.panelAdminRoutes = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const enums_1 = require("../../entities/enums");
const role_1 = require("../../middlewares/role");
const validate_1 = require("../../middlewares/validate");
const asyncHandler_1 = require("../../utils/asyncHandler");
const schemas_1 = require("../../modules/admin/schemas");
const flash_1 = require("../middlewares/flash");
const panelAuth_1 = require("../middlewares/panelAuth");
const admin_controller_1 = require("../controllers/admin.controller");
exports.panelAdminRoutes = (0, express_1.Router)();
const togglePublishSchema = zod_1.z
    .object({
    next_is_published: zod_1.z.string().min(1),
})
    .strict();
const panelNotificationSchema = zod_1.z
    .object({
    all: zod_1.z.string().optional(),
    username: zod_1.z.string().trim().optional(),
    title: zod_1.z.string().trim().min(1).max(180),
    body: zod_1.z.string().trim().min(1).max(5000),
})
    .strict();
exports.panelAdminRoutes.use(flash_1.panelFlash, panelAuth_1.panelAuth, (0, role_1.requireRole)(enums_1.UserRole.ADMIN));
exports.panelAdminRoutes.get('/', (_req, res) => res.redirect('/panel/admin/overview'));
exports.panelAdminRoutes.get('/overview', (0, asyncHandler_1.asyncHandler)(admin_controller_1.overviewPage));
exports.panelAdminRoutes.get('/stats', admin_controller_1.statsRedirect);
exports.panelAdminRoutes.get('/specializations', (0, asyncHandler_1.asyncHandler)(admin_controller_1.specializationsPage));
exports.panelAdminRoutes.post('/specializations', (0, validate_1.validate)({ body: schemas_1.specializationCreateSchema }), (0, asyncHandler_1.asyncHandler)(admin_controller_1.createSpecializationAction));
exports.panelAdminRoutes.post('/specializations/:id', (0, validate_1.validate)({ params: schemas_1.adminIdParamSchema, body: schemas_1.specializationUpdateSchema }), (0, asyncHandler_1.asyncHandler)(admin_controller_1.updateSpecializationAction));
exports.panelAdminRoutes.post('/specializations/:id/toggle', (0, validate_1.validate)({ params: schemas_1.adminIdParamSchema, body: togglePublishSchema }), (0, asyncHandler_1.asyncHandler)(admin_controller_1.toggleSpecializationAction));
exports.panelAdminRoutes.get('/courses', (0, asyncHandler_1.asyncHandler)(admin_controller_1.coursesPage));
exports.panelAdminRoutes.post('/courses', (0, validate_1.validate)({ body: schemas_1.courseCreateSchema }), (0, asyncHandler_1.asyncHandler)(admin_controller_1.createCourseAction));
exports.panelAdminRoutes.post('/courses/:id', (0, validate_1.validate)({ params: schemas_1.adminIdParamSchema, body: schemas_1.courseUpdateSchema }), (0, asyncHandler_1.asyncHandler)(admin_controller_1.updateCourseAction));
exports.panelAdminRoutes.post('/courses/:id/toggle', (0, validate_1.validate)({ params: schemas_1.adminIdParamSchema, body: togglePublishSchema }), (0, asyncHandler_1.asyncHandler)(admin_controller_1.toggleCourseAction));
exports.panelAdminRoutes.get('/lectures', (0, asyncHandler_1.asyncHandler)(admin_controller_1.lecturesPage));
exports.panelAdminRoutes.post('/lectures', (0, validate_1.validate)({ body: schemas_1.lectureCreateSchema }), (0, asyncHandler_1.asyncHandler)(admin_controller_1.createLectureAction));
exports.panelAdminRoutes.post('/lectures/:id', (0, validate_1.validate)({ params: schemas_1.adminIdParamSchema, body: schemas_1.lectureUpdateSchema }), (0, asyncHandler_1.asyncHandler)(admin_controller_1.updateLectureAction));
exports.panelAdminRoutes.post('/lectures/:id/hide', (0, validate_1.validate)({ params: schemas_1.adminIdParamSchema }), (0, asyncHandler_1.asyncHandler)(admin_controller_1.hideLectureAction));
exports.panelAdminRoutes.get('/topups', (0, validate_1.validate)({ query: schemas_1.topupRequestsQuerySchema }), (0, asyncHandler_1.asyncHandler)(admin_controller_1.topupsPage));
exports.panelAdminRoutes.post('/topups/:id/approve', (0, validate_1.validate)({ params: schemas_1.adminIdParamSchema }), (0, asyncHandler_1.asyncHandler)(admin_controller_1.approveTopupAction));
exports.panelAdminRoutes.post('/topups/:id/reject', (0, validate_1.validate)({ params: schemas_1.adminIdParamSchema, body: schemas_1.rejectTopupSchema }), (0, asyncHandler_1.asyncHandler)(admin_controller_1.rejectTopupAction));
exports.panelAdminRoutes.get('/users', (0, validate_1.validate)({ query: schemas_1.adminUsersQuerySchema }), (0, asyncHandler_1.asyncHandler)(admin_controller_1.usersPage));
exports.panelAdminRoutes.post('/users/:id/active', (0, validate_1.validate)({ params: schemas_1.adminIdParamSchema, body: schemas_1.activeUserSchema }), (0, asyncHandler_1.asyncHandler)(admin_controller_1.toggleUserActiveAction));
exports.panelAdminRoutes.post('/users/:id/reset-device', (0, validate_1.validate)({ params: schemas_1.adminIdParamSchema }), (0, asyncHandler_1.asyncHandler)(admin_controller_1.resetUserDeviceAction));
exports.panelAdminRoutes.post('/users/:id/reset-password', (0, validate_1.validate)({ params: schemas_1.adminIdParamSchema, body: schemas_1.resetPasswordSchema }), (0, asyncHandler_1.asyncHandler)(admin_controller_1.resetUserPasswordAction));
exports.panelAdminRoutes.post('/users/:id/adjust-balance', (0, validate_1.validate)({ params: schemas_1.adminIdParamSchema, body: schemas_1.adjustBalanceSchema }), (0, asyncHandler_1.asyncHandler)(admin_controller_1.adjustUserBalanceAction));
exports.panelAdminRoutes.get('/teachers', (0, asyncHandler_1.asyncHandler)(admin_controller_1.teachersPage));
exports.panelAdminRoutes.post('/teachers', (0, validate_1.validate)({ body: schemas_1.teacherCreateSchema }), (0, asyncHandler_1.asyncHandler)(admin_controller_1.createTeacherAction));
exports.panelAdminRoutes.post('/teachers/:id/payouts', (0, validate_1.validate)({ params: schemas_1.adminIdParamSchema, body: schemas_1.teacherPayoutSchema }), (0, asyncHandler_1.asyncHandler)(admin_controller_1.teacherPayoutAction));
exports.panelAdminRoutes.get('/teachers/:id/payouts', (0, validate_1.validate)({ params: schemas_1.adminIdParamSchema }), (0, asyncHandler_1.asyncHandler)(admin_controller_1.teacherPayoutsPage));
exports.panelAdminRoutes.get('/notifications', (0, asyncHandler_1.asyncHandler)(admin_controller_1.notificationsPage));
exports.panelAdminRoutes.post('/notifications', (0, validate_1.validate)({ body: panelNotificationSchema }), (0, asyncHandler_1.asyncHandler)(admin_controller_1.sendNotificationAction));
