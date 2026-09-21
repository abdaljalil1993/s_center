"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeacherPayouts = exports.getTeacherStatsController = exports.deleteTeacherLecture = exports.patchTeacherLecture = exports.postTeacherLecture = exports.getTeacherCourseLectures = exports.getTeacherCourses = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const service_1 = require("./service");
exports.getTeacherCourses = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.listMyCourses)(req.user.id);
    res.status(200).json({ success: true, data });
});
exports.getTeacherCourseLectures = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.listCourseLectures)(req.user.id, Number(req.params.id));
    res.status(200).json({ success: true, data });
});
exports.postTeacherLecture = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.createLectureForTeacher)(req.user.id, Number(req.params.id), req.body);
    res.status(201).json({ success: true, data });
});
exports.patchTeacherLecture = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.updateTeacherLecture)(req.user.id, Number(req.params.id), req.body);
    res.status(200).json({ success: true, data });
});
exports.deleteTeacherLecture = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.archiveTeacherLecture)(req.user.id, Number(req.params.id));
    res.status(200).json({ success: true, data });
});
exports.getTeacherStatsController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.getTeacherStats)(req.user.id);
    res.status(200).json({ success: true, data });
});
exports.getTeacherPayouts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, service_1.listTeacherPayouts)(req.user.id);
    res.status(200).json({ success: true, data });
});
