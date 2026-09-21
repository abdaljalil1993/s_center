"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearPanelAuthCookies = clearPanelAuthCookies;
exports.resolvePanelUserFromToken = resolvePanelUserFromToken;
exports.panelAuth = panelAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const data_source_1 = require("../../config/data-source");
const env_1 = require("../../config/env");
const User_1 = require("../../entities/User");
const enums_1 = require("../../entities/enums");
const debug_1 = require("../debug");
function redirectToLogin(res) {
    return res.redirect('/panel/login');
}
function clearPanelAuthCookies(res) {
    res.clearCookie('panel_token', { path: '/panel' });
}
async function resolvePanelUserFromToken(token) {
    if (!token) {
        return null;
    }
    let payload;
    try {
        payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
    }
    catch (error) {
        (0, debug_1.debugPanel)('panelAuth invalid token', { error: error instanceof Error ? error.message : String(error) });
        return null;
    }
    const user = await data_source_1.AppDataSource.getRepository(User_1.User).findOne({ where: { id: payload.userId } });
    if (!user || !user.isActive) {
        (0, debug_1.debugPanel)('panelAuth missing or inactive user', { userId: payload.userId });
        return null;
    }
    if (user.role !== payload.role) {
        (0, debug_1.debugPanel)('panelAuth role mismatch', { tokenRole: payload.role, dbRole: user.role, userId: payload.userId });
        return null;
    }
    if (user.role !== enums_1.UserRole.ADMIN && user.role !== enums_1.UserRole.TEACHER) {
        (0, debug_1.debugPanel)('panelAuth blocked non-panel role', { role: user.role, userId: user.id });
        return null;
    }
    return user;
}
async function panelAuth(req, res, next) {
    const token = req.cookies?.panel_token;
    if (!token) {
        (0, debug_1.debugPanel)('panelAuth missing token', { path: req.originalUrl });
        return redirectToLogin(res);
    }
    const user = await resolvePanelUserFromToken(token);
    if (!user) {
        clearPanelAuthCookies(res);
        return redirectToLogin(res);
    }
    req.user = user;
    res.locals.currentUser = user;
    (0, debug_1.debugPanel)('panelAuth success', { path: req.originalUrl, role: user.role, username: user.username, baseUrl: req.baseUrl, reqPath: req.path });
    next();
}
