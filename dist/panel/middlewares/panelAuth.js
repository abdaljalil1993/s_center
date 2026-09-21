"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.panelAuth = panelAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const data_source_1 = require("../../config/data-source");
const env_1 = require("../../config/env");
const User_1 = require("../../entities/User");
const enums_1 = require("../../entities/enums");
function redirectToLogin(res) {
    return res.redirect('/panel/login');
}
async function panelAuth(req, res, next) {
    const token = req.cookies?.panel_token;
    if (!token) {
        return redirectToLogin(res);
    }
    let payload;
    try {
        payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
    }
    catch {
        return redirectToLogin(res);
    }
    const user = await data_source_1.AppDataSource.getRepository(User_1.User).findOne({ where: { id: payload.userId } });
    if (!user || !user.isActive) {
        return redirectToLogin(res);
    }
    if (user.role !== payload.role) {
        return redirectToLogin(res);
    }
    if (user.role === enums_1.UserRole.STUDENT) {
        return redirectToLogin(res);
    }
    if (req.path.startsWith('/admin') && user.role !== enums_1.UserRole.ADMIN) {
        return redirectToLogin(res);
    }
    if (req.path.startsWith('/teacher') && user.role !== enums_1.UserRole.TEACHER) {
        return redirectToLogin(res);
    }
    req.user = user;
    res.locals.currentUser = user;
    next();
}
