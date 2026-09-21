"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogin = getLogin;
exports.postLogin = postLogin;
exports.postLogout = postLogout;
exports.getPanelHome = getPanelHome;
const service_1 = require("../../modules/auth/service");
const enums_1 = require("../../entities/enums");
const env_1 = require("../../config/env");
function cookieSecureFlag() {
    return env_1.env.NODE_ENV === 'production';
}
async function getLogin(req, res) {
    if (req.cookies?.panel_token) {
        return res.redirect('/panel');
    }
    res.render('auth/login', { title: 'تسجيل الدخول' });
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
        return res.redirect(user.role === enums_1.UserRole.ADMIN ? '/panel/admin' : '/panel/teacher');
    }
    catch (error) {
        return next(error);
    }
}
async function postLogout(req, res) {
    res.clearCookie('panel_token', { path: '/panel' });
    res.clearCookie('panel_csrf_token', { path: '/panel' });
    res.clearCookie('panel_flash', { path: '/panel' });
    return res.redirect('/panel/login');
}
async function getPanelHome(req, res) {
    if (!req.cookies?.panel_token) {
        return res.redirect('/panel/login');
    }
    if (req.user?.role === enums_1.UserRole.ADMIN) {
        return res.redirect('/panel/admin');
    }
    if (req.user?.role === enums_1.UserRole.TEACHER) {
        return res.redirect('/panel/teacher');
    }
    return res.redirect('/panel/login');
}
