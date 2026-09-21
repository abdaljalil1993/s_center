"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coursesPage = coursesPage;
exports.lecturesPage = lecturesPage;
exports.createLectureAction = createLectureAction;
exports.updateLectureAction = updateLectureAction;
exports.hideLectureAction = hideLectureAction;
exports.earningsPage = earningsPage;
exports.rootTeacherRedirect = rootTeacherRedirect;
const AppError_1 = require("../../utils/AppError");
const service_1 = require("../../modules/teacher/service");
const flash_1 = require("../middlewares/flash");
async function loadTeacherCommon(teacherId) {
    const stats = await (0, service_1.getTeacherStats)(teacherId);
    return {
        pendingTopupsCount: 0,
        stats,
    };
}
async function coursesPage(req, res) {
    const courses = await (0, service_1.listMyCourses)(req.user.id);
    const common = await loadTeacherCommon(req.user.id);
    return res.render('teacher/courses', {
        title: 'كورساتي',
        currentUser: req.user,
        flash: res.locals.flash,
        csrfToken: res.locals.csrfToken,
        courses,
        ...common,
    });
}
async function lecturesPage(req, res) {
    const courses = await (0, service_1.listMyCourses)(req.user.id);
    const selectedCourseId = req.query.courseId ? Number(req.query.courseId) : undefined;
    const lectures = selectedCourseId ? await (0, service_1.listCourseLectures)(req.user.id, selectedCourseId) : [];
    return res.render('teacher/lectures', {
        title: 'محاضراتي',
        currentUser: req.user,
        flash: res.locals.flash,
        csrfToken: res.locals.csrfToken,
        courses,
        selectedCourseId,
        lectures,
    });
}
async function createLectureAction(req, res) {
    await (0, service_1.createLectureForTeacher)(req.user.id, Number(req.params.id), req.body);
    (0, flash_1.setFlash)(res, 'success', 'تم حفظ المحاضرة');
    return res.redirect(`/panel/teacher/courses/${req.params.id}/lectures`);
}
async function updateLectureAction(req, res) {
    await (0, service_1.updateTeacherLecture)(req.user.id, Number(req.params.id), req.body);
    (0, flash_1.setFlash)(res, 'success', 'تم تحديث المحاضرة');
    return res.redirect('/panel/teacher/lectures');
}
async function hideLectureAction(req, res) {
    await (0, service_1.archiveTeacherLecture)(req.user.id, Number(req.params.id));
    (0, flash_1.setFlash)(res, 'success', 'تم إخفاء المحاضرة');
    return res.redirect('/panel/teacher/lectures');
}
async function earningsPage(req, res) {
    const stats = await (0, service_1.getTeacherStats)(req.user.id);
    const payouts = await (0, service_1.listTeacherPayouts)(req.user.id);
    return res.render('teacher/earnings', {
        title: 'الأرباح',
        currentUser: req.user,
        flash: res.locals.flash,
        csrfToken: res.locals.csrfToken,
        stats,
        payouts,
    });
}
async function rootTeacherRedirect(req, res) {
    if (!req.user || req.user.role !== 'TEACHER') {
        throw new AppError_1.AppError(403, 'Access denied');
    }
    return res.redirect('/panel/teacher/courses');
}
