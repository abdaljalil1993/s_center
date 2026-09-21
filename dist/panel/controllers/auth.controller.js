"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogin = getLogin;
exports.postLogin = postLogin;
exports.postLogout = postLogout;
exports.getPanelHome = getPanelHome;
const service_1 = require("../../modules/auth/service");
const enums_1 = require("../../entities/enums");
const env_1 = require("../../config/env");
const panelAuth_1 = require("../middlewares/panelAuth");
function cookieSecureFlag() {
    return env_1.env.NODE_ENV === 'production';
}
async function getLogin(req, res) {
    const token = req.cookies?.panel_token;
    if (token) {
        const user = await (0, panelAuth_1.resolvePanelUserFromToken)(token);
        if (user) {
            return res.redirect('/panel');
        }
        (0, panelAuth_1.clearPanelAuthCookies)(res);
    }
    const csrfToken = res.locals.csrfToken || req.cookies?.panel_csrf_token || '';
    res.render('auth/login', { title: 'تسجيل الدخول', csrfToken });
}
async function postLogin(req, res, next) {
    try {
        const { username, password } = req.body;
        const result = await (0, service_1.loginForPanel)({ username, password });
        const token = result.token;
        const user = result.user;
        res.cookie('panel_token', token, {
            httpOnly: true,
            sameSite: 'strict',
            secure: cookieSecureFlag(),
            path: '/panel',
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });
        const redirectTo = user.role === enums_1.UserRole.ADMIN ? '/panel/admin/overview' : '/panel/teacher/courses';
        return res.redirect(redirectTo);
    }
    catch (error) {
        return next(error);
    }
}
async function postLogout(req, res) {
    (0, panelAuth_1.clearPanelAuthCookies)(res);
    res.clearCookie('panel_csrf_token', { path: '/panel' });
    res.clearCookie('panel_flash', { path: '/panel' });
    return res.redirect('/panel/login');
}
async function getPanelHome(req, res) {
    if (!req.user) {
        return res.redirect('/panel/login');
    }
    if (req.user.role === enums_1.UserRole.ADMIN) {
        return res.redirect('/panel/admin/overview');
    }
    if (req.user.role === enums_1.UserRole.TEACHER) {
        return res.redirect('/panel/teacher/courses');
    }
    return res.redirect('/panel/login');
}
