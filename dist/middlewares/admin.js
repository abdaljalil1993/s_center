"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = adminMiddleware;
const AppError_1 = require("../utils/AppError");
function adminMiddleware(req, _res, next) {
    if (!req.user || req.user.role !== 'ADMIN') {
        return next(new AppError_1.AppError(403, 'Access denied'));
    }
    next();
}
