"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminStatsTeachers = exports.getAdminStatsBySpecialization = exports.getAdminStatsTopCourses = exports.getAdminStatsSales = exports.getAdminStatsOverview = exports.postAdminResetPassword = exports.getAdminTeacherPayouts = exports.postAdminTeacherPayout = exports.getAdminTeachers = exports.postAdminTeacher = exports.sendAdminNotification = exports.adjustAdminUserBalance = exports.resetAdminUserDevice = exports.patchAdminUserActive = exports.getAdminUsers = exports.rejectAdminTopupRequest = exports.approveAdminTopupRequest = exports.getAdminTopupRequests = exports.deleteAdminLecture = exports.patchAdminLecture = exports.postAdminLecture = exports.getAdminLectures = exports.deleteAdminCourse = exports.patchAdminCourse = exports.postAdminCourse = exports.getAdminCourses = exports.deleteAdminSpecialization = exports.patchAdminSpecialization = exports.postAdminSpecialization = exports.getAdminSpecializations = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const service_1 = require("./service");
exports.getAdminSpecializations = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const data = await (0, service_1.listSpecializations)();
    res.status(200).json({ success: true, data });
});
exports.postAdminSpecialization = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.createSpecialization)(req.body);
    res.status(201).json({ success: true, data });
});
exports.patchAdminSpecialization = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.updateSpecialization)(Number(req.params.id), req.body);
    res.status(200).json({ success: true, data });
});
exports.deleteAdminSpecialization = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.archiveSpecialization)(Number(req.params.id));
    res.status(200).json({ success: true, data });
});
exports.getAdminCourses = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const data = await (0, service_1.listCourses)();
    res.status(200).json({ success: true, data });
});
exports.postAdminCourse = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.createCourse)(req.body);
    res.status(201).json({ success: true, data });
});
exports.patchAdminCourse = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.updateCourse)(Number(req.params.id), req.body);
    res.status(200).json({ success: true, data });
});
exports.deleteAdminCourse = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.archiveCourse)(Number(req.params.id));
    res.status(200).json({ success: true, data });
});
exports.getAdminLectures = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const data = await (0, service_1.listLectures)();
    res.status(200).json({ success: true, data });
});
exports.postAdminLecture = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.createLecture)(req.user.id, req.body);
    res.status(201).json({ success: true, data });
});
exports.patchAdminLecture = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.updateLecture)(Number(req.params.id), req.body);
    res.status(200).json({ success: true, data });
});
exports.deleteAdminLecture = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.archiveLecture)(Number(req.params.id));
    res.status(200).json({ success: true, data });
});
exports.getAdminTopupRequests = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.listTopupRequests)(req.query.status);
    res.status(200).json({ success: true, data });
});
exports.approveAdminTopupRequest = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.approveTopupRequest)(Number(req.params.id), req.user.id);
    res.status(200).json({ success: true, data });
});
exports.rejectAdminTopupRequest = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.rejectTopupRequest)(Number(req.params.id), req.user.id, req.body.reason);
    res.status(200).json({ success: true, data });
});
exports.getAdminUsers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.listUsers)(req.query.search);
    res.status(200).json({ success: true, data });
});
exports.patchAdminUserActive = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.setUserActive)(Number(req.params.id), req.body.is_active);
    res.status(200).json({ success: true, data });
});
exports.resetAdminUserDevice = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.resetUserDevice)(Number(req.params.id));
    res.status(200).json({ success: true, data });
});
exports.adjustAdminUserBalance = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.adjustBalance)(Number(req.params.id), req.body.amount, req.body.description);
    res.status(200).json({ success: true, data });
});
exports.sendAdminNotification = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.createNotifications)(req.body);
    res.status(201).json({ success: true, data });
});
exports.postAdminTeacher = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.createTeacher)(req.body);
    res.status(201).json({ success: true, data });
});
exports.getAdminTeachers = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const data = await (0, service_1.listTeachers)();
    res.status(200).json({ success: true, data });
});
exports.postAdminTeacherPayout = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.payoutTeacher)(Number(req.params.id), req.user.id, req.body.amount, req.body.note);
    res.status(201).json({ success: true, data });
});
exports.getAdminTeacherPayouts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.teacherPayoutHistory)(Number(req.params.id));
    res.status(200).json({ success: true, data });
});
exports.postAdminResetPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.resetPassword)(Number(req.params.id), req.body.new_password);
    res.status(200).json({ success: true, data });
});
exports.getAdminStatsOverview = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.overviewStats)(req.query.from, req.query.to);
    res.status(200).json({ success: true, data });
});
exports.getAdminStatsSales = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.salesStats)(Number(req.query.days), req.query.from, req.query.to);
    res.status(200).json({ success: true, data });
});
exports.getAdminStatsTopCourses = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.topCoursesStats)(Number(req.query.limit), req.query.from, req.query.to);
    res.status(200).json({ success: true, data });
});
exports.getAdminStatsBySpecialization = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.bySpecializationStats)(req.query.from, req.query.to);
    res.status(200).json({ success: true, data });
});
exports.getAdminStatsTeachers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.teachersStats)(req.query.from, req.query.to);
    res.status(200).json({ success: true, data });
});
