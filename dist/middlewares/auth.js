"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const data_source_1 = require("../config/data-source");
const env_1 = require("../config/env");
const User_1 = require("../entities/User");
const AppError_1 = require("../utils/AppError");
const enums_1 = require("../entities/enums");
async function authMiddleware(req, _res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        return next(new AppError_1.AppError(401, 'Authentication required'));
    }
    const token = header.slice('Bearer '.length).trim();
    let payload;
    try {
        payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
    }
    catch {
        return next(new AppError_1.AppError(401, 'Invalid token'));
    }
    const user = await data_source_1.AppDataSource.getRepository(User_1.User).findOne({ where: { id: payload.userId } });
    if (!user || !user.isActive) {
        return next(new AppError_1.AppError(401, 'Authentication required'));
    }
    if (user.role !== payload.role) {
        return next(new AppError_1.AppError(401, 'Authentication required'));
    }
    if (user.role === enums_1.UserRole.STUDENT && user.deviceId !== payload.deviceId) {
        return next(new AppError_1.AppError(403, 'This account is linked to another device'));
    }
    req.user = user;
    next();
}
