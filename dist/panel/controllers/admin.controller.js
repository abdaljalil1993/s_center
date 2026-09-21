"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.overviewPage = overviewPage;
exports.specializationsPage = specializationsPage;
exports.createSpecializationAction = createSpecializationAction;
exports.updateSpecializationAction = updateSpecializationAction;
exports.toggleSpecializationAction = toggleSpecializationAction;
exports.coursesPage = coursesPage;
exports.createCourseAction = createCourseAction;
exports.updateCourseAction = updateCourseAction;
exports.toggleCourseAction = toggleCourseAction;
exports.lecturesPage = lecturesPage;
exports.createLectureAction = createLectureAction;
exports.updateLectureAction = updateLectureAction;
exports.hideLectureAction = hideLectureAction;
exports.topupsPage = topupsPage;
exports.approveTopupAction = approveTopupAction;
exports.rejectTopupAction = rejectTopupAction;
exports.usersPage = usersPage;
exports.toggleUserActiveAction = toggleUserActiveAction;
exports.resetUserDeviceAction = resetUserDeviceAction;
exports.resetUserPasswordAction = resetUserPasswordAction;
exports.adjustUserBalanceAction = adjustUserBalanceAction;
exports.teachersPage = teachersPage;
exports.createTeacherAction = createTeacherAction;
exports.teacherPayoutAction = teacherPayoutAction;
exports.teacherPayoutsPage = teacherPayoutsPage;
exports.notificationsPage = notificationsPage;
exports.sendNotificationAction = sendNotificationAction;
exports.statsRedirect = statsRedirect;
const data_source_1 = require("../../config/data-source");
const User_1 = require("../../entities/User");
const AppError_1 = require("../../utils/AppError");
const service_1 = require("../../modules/admin/service");
const enums_1 = require("../../entities/enums");
const flash_1 = require("../middlewares/flash");
function paginate(items, page = 1, perPage = 20) {
    const total = items.length;
    const pageCount = Math.max(1, Math.ceil(total / perPage));
    const currentPage = Math.min(Math.max(page, 1), pageCount);
    const start = (currentPage - 1) * perPage;
    return {
        items: items.slice(start, start + perPage),
        total,
        page: currentPage,
        pageCount,
        perPage,
    };
}
async function loadAdminCommon() {
    const stats = await (0, service_1.overviewStats)();
    return { pendingTopupsCount: stats.pending_topups_count };
}
async function overviewPage(req, res) {
    const days = [7, 30, 90].includes(Number(req.query.days)) ? Number(req.query.days) : 30;
    const stats = await (0, service_1.overviewStats)();
    const sales = await (0, service_1.salesStats)(days);
    const topCourses = await (0, service_1.topCoursesStats)(10);
    const bySpec = await (0, service_1.bySpecializationStats)();
    const common = await loadAdminCommon();
    return res.render('admin/overview', {
        title: 'نظرة عامة',
        currentUser: req.user,
        flash: res.locals.flash,
        csrfToken: res.locals.csrfToken,
        days,
        statCards: [
            { label: 'الطلاب', value: stats.students_count },
            { label: 'المدرسون', value: stats.teachers_count },
            { label: 'الكورسات', value: stats.courses_count },
            { label: 'المشتريات', value: stats.purchases_count },
            { label: 'إجمالي المبيعات', value: stats.total_sales_amount },
            { label: 'إجمالي الشحن', value: stats.total_topups_amount },
            { label: 'طلبات قيد الانتظار', value: stats.pending_topups_count },
            { label: 'رصيد الطلاب', value: stats.total_students_balance },
        ],
        salesChart: {
            data: {
                labels: sales.map((row) => row.date),
                datasets: [{ label: 'المبيعات', data: sales.map((row) => Number(row.amount)), borderColor: '#184e77', backgroundColor: 'rgba(24, 78, 119, 0.2)', fill: true }],
            },
            options: { responsive: true, maintainAspectRatio: false },
        },
        topCoursesChart: {
            data: {
                labels: topCourses.map((row) => row.name),
                datasets: [{ label: 'عدد المشتريات', data: topCourses.map((row) => row.purchases_count), backgroundColor: '#184e77' }],
            },
            options: { responsive: true, maintainAspectRatio: false },
        },
        specializationSales: bySpec,
        ...common,
    });
}
async function specializationsPage(req, res) {
    const specializations = await (0, service_1.listSpecializations)();
    const common = await loadAdminCommon();
    return res.render('admin/specializations', {
        title: 'التخصصات',
        currentUser: req.user,
        flash: res.locals.flash,
        csrfToken: res.locals.csrfToken,
        specializations,
        ...common,
    });
}
async function createSpecializationAction(req, res) {
    await (0, service_1.createSpecialization)(req.body);
    (0, flash_1.setFlash)(res, 'success', 'تم حفظ التخصص بنجاح');
    return res.redirect('/panel/admin/specializations');
}
async function updateSpecializationAction(req, res) {
    await (0, service_1.updateSpecialization)(Number(req.params.id), req.body);
    (0, flash_1.setFlash)(res, 'success', 'تم تحديث التخصص بنجاح');
    return res.redirect('/panel/admin/specializations');
}
async function toggleSpecializationAction(req, res) {
    const nextValue = req.body.next_is_published === 'true';
    await (0, service_1.updateSpecialization)(Number(req.params.id), { is_published: nextValue });
    (0, flash_1.setFlash)(res, 'success', nextValue ? 'تم نشر التخصص' : 'تم إخفاء التخصص');
    return res.redirect('/panel/admin/specializations');
}
async function coursesPage(req, res) {
    const [coursesAll, specializations, teachers, common] = await Promise.all([
        (0, service_1.listCourses)(),
        (0, service_1.listSpecializations)(),
        (0, service_1.listTeachers)(),
        loadAdminCommon(),
    ]);
    const specializationId = req.query.specializationId ? Number(req.query.specializationId) : undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;
    const filtered = coursesAll.filter((course) => {
        if (specializationId && course.specialization_id !== specializationId)
            return false;
        if (year && course.year !== year)
            return false;
        return true;
    });
    const paged = paginate(filtered, Number(req.query.page) || 1, 20);
    return res.render('admin/courses', {
        title: 'الكورسات',
        currentUser: req.user,
        flash: res.locals.flash,
        csrfToken: res.locals.csrfToken,
        courses: paged.items,
        specializations,
        teachers,
        filters: { specializationId, year },
        page: paged.page,
        pageCount: paged.pageCount,
        baseUrl: '/panel/admin/courses',
        queryString: [specializationId ? `specializationId=${specializationId}` : '', year ? `year=${year}` : ''].filter(Boolean).join('&'),
        ...common,
    });
}
async function createCourseAction(req, res) {
    await (0, service_1.createCourse)(req.body);
    (0, flash_1.setFlash)(res, 'success', 'تم حفظ الكورس بنجاح');
    return res.redirect('/panel/admin/courses');
}
async function updateCourseAction(req, res) {
    await (0, service_1.updateCourse)(Number(req.params.id), req.body);
    (0, flash_1.setFlash)(res, 'success', 'تم تحديث الكورس بنجاح');
    return res.redirect('/panel/admin/courses');
}
async function toggleCourseAction(req, res) {
    const nextValue = req.body.next_is_published === 'true';
    await (0, service_1.updateCourse)(Number(req.params.id), { is_published: nextValue });
    (0, flash_1.setFlash)(res, 'success', nextValue ? 'تم نشر الكورس' : 'تم إخفاء الكورس');
    return res.redirect('/panel/admin/courses');
}
async function lecturesPage(req, res) {
    const [courses, lecturesAll, common] = await Promise.all([(0, service_1.listCourses)(), (0, service_1.listLectures)(), loadAdminCommon()]);
    const selectedCourseId = req.query.courseId ? Number(req.query.courseId) : undefined;
    const lectures = selectedCourseId ? lecturesAll.filter((item) => item.course_id === selectedCourseId) : [];
    return res.render('admin/lectures', {
        title: 'المحاضرات',
        currentUser: req.user,
        flash: res.locals.flash,
        csrfToken: res.locals.csrfToken,
        courses,
        lectures,
        selectedCourseId,
        ...common,
    });
}
async function createLectureAction(req, res) {
    await (0, service_1.createLecture)(req.user.id, req.body);
    (0, flash_1.setFlash)(res, 'success', 'تم حفظ المحاضرة بنجاح');
    return res.redirect('/panel/admin/lectures');
}
async function updateLectureAction(req, res) {
    await (0, service_1.updateLecture)(Number(req.params.id), req.body);
    (0, flash_1.setFlash)(res, 'success', 'تم تحديث المحاضرة بنجاح');
    return res.redirect('/panel/admin/lectures');
}
async function hideLectureAction(req, res) {
    await (0, service_1.archiveLecture)(Number(req.params.id));
    (0, flash_1.setFlash)(res, 'success', 'تم إخفاء المحاضرة');
    return res.redirect('/panel/admin/lectures');
}
async function topupsPage(req, res) {
    const status = req.query.status || enums_1.TopupStatus.PENDING;
    const requests = await (0, service_1.listTopupRequests)(status);
    const common = await loadAdminCommon();
    return res.render('admin/topups', {
        title: 'طلبات الشحن',
        currentUser: req.user,
        flash: res.locals.flash,
        csrfToken: res.locals.csrfToken,
        requests,
        status,
        ...common,
    });
}
async function approveTopupAction(req, res) {
    await (0, service_1.approveTopupRequest)(Number(req.params.id), req.user.id);
    (0, flash_1.setFlash)(res, 'success', 'تمت الموافقة على الطلب');
    return res.redirect('/panel/admin/topups?status=PENDING');
}
async function rejectTopupAction(req, res) {
    await (0, service_1.rejectTopupRequest)(Number(req.params.id), req.user.id, req.body.reason);
    (0, flash_1.setFlash)(res, 'success', 'تم رفض الطلب');
    return res.redirect('/panel/admin/topups?status=PENDING');
}
async function usersPage(req, res) {
    const search = typeof req.query.search === 'string' ? req.query.search : '';
    const users = await (0, service_1.listUsers)(search || undefined);
    const paged = paginate(users, Number(req.query.page) || 1, 20);
    const common = await loadAdminCommon();
    return res.render('admin/users', {
        title: 'المستخدمون',
        currentUser: req.user,
        flash: res.locals.flash,
        csrfToken: res.locals.csrfToken,
        users: paged.items,
        search,
        page: paged.page,
        pageCount: paged.pageCount,
        baseUrl: '/panel/admin/users',
        queryString: search ? `search=${encodeURIComponent(search)}` : '',
        ...common,
    });
}
async function toggleUserActiveAction(req, res) {
    await (0, service_1.setUserActive)(Number(req.params.id), req.body.is_active === 'true');
    (0, flash_1.setFlash)(res, 'success', 'تم تحديث حالة المستخدم');
    return res.redirect('/panel/admin/users');
}
async function resetUserDeviceAction(req, res) {
    await (0, service_1.resetUserDevice)(Number(req.params.id));
    (0, flash_1.setFlash)(res, 'success', 'تمت إعادة ضبط الجهاز');
    return res.redirect('/panel/admin/users');
}
async function resetUserPasswordAction(req, res) {
    await (0, service_1.resetPassword)(Number(req.params.id), req.body.new_password);
    (0, flash_1.setFlash)(res, 'success', 'تمت إعادة تعيين كلمة المرور');
    return res.redirect('/panel/admin/users');
}
async function adjustUserBalanceAction(req, res) {
    await (0, service_1.adjustBalance)(Number(req.params.id), req.body.amount, req.body.description);
    (0, flash_1.setFlash)(res, 'success', 'تم تعديل الرصيد');
    return res.redirect('/panel/admin/users');
}
async function teachersPage(req, res) {
    const teachers = await (0, service_1.listTeachers)();
    const common = await loadAdminCommon();
    return res.render('admin/teachers', {
        title: 'المدرسون',
        currentUser: req.user,
        flash: res.locals.flash,
        csrfToken: res.locals.csrfToken,
        teachers,
        ...common,
    });
}
async function createTeacherAction(req, res) {
    await (0, service_1.createTeacher)(req.body);
    (0, flash_1.setFlash)(res, 'success', 'تم إنشاء المدرس');
    return res.redirect('/panel/admin/teachers');
}
async function teacherPayoutAction(req, res) {
    await (0, service_1.payoutTeacher)(Number(req.params.id), req.user.id, req.body.amount, req.body.note || null);
    (0, flash_1.setFlash)(res, 'success', 'تم تسجيل الدفعة');
    return res.redirect(`/panel/admin/teachers/${req.params.id}/payouts`);
}
async function teacherPayoutsPage(req, res) {
    const teacherId = Number(req.params.id);
    const teachers = await (0, service_1.listTeachers)();
    const teacher = teachers.find((item) => item.teacher_id === teacherId);
    if (!teacher) {
        throw new AppError_1.AppError(404, 'Teacher not found');
    }
    const payouts = await (0, service_1.listTeacherPayouts)(teacherId);
    const summary = await (0, service_1.teachersStats)();
    const selected = summary.find((item) => item.teacher_id === teacherId) || {
        teacher_id: teacherId,
        earned: '0.00',
        paid: '0.00',
        remaining: '0.00',
        purchases_count: 0,
    };
    return res.render('admin/teacher-payouts', {
        title: 'سجل الدفعات',
        currentUser: req.user,
        flash: res.locals.flash,
        csrfToken: res.locals.csrfToken,
        teacher,
        payouts,
        summary: selected,
        pendingTopupsCount: (await (0, service_1.overviewStats)()).pending_topups_count,
    });
}
async function notificationsPage(req, res) {
    const common = await loadAdminCommon();
    return res.render('admin/notifications', {
        title: 'الإشعارات',
        currentUser: req.user,
        flash: res.locals.flash,
        csrfToken: res.locals.csrfToken,
        ...common,
    });
}
async function sendNotificationAction(req, res) {
    const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
    let payload;
    if (req.body.all === 'true') {
        payload = { all: true, title: req.body.title, body: req.body.body };
    }
    else if (username) {
        const user = await data_source_1.AppDataSource.getRepository(User_1.User).findOne({ where: { username } });
        if (!user) {
            throw new AppError_1.AppError(404, 'User not found');
        }
        payload = { user_id: user.id, title: req.body.title, body: req.body.body };
    }
    else {
        throw new AppError_1.AppError(400, 'يجب تحديد المستخدم أو اختيار الإرسال للجميع');
    }
    await (0, service_1.createNotifications)(payload);
    (0, flash_1.setFlash)(res, 'success', 'تم إرسال الإشعار');
    return res.redirect('/panel/admin/notifications');
}
async function statsRedirect(_req, res) {
    return res.redirect('/panel/admin/overview');
}
