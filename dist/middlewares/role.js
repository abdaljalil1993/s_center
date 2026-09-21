"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
const AppError_1 = require("../utils/AppError");
const debug_1 = require("../panel/debug");
function requireRole(...roles) {
    return (req, _res, next) => {
        (0, debug_1.debugPanel)('requireRole', {
            path: req.originalUrl,
            actualRole: req.user?.role,
            expectedRoles: roles,
            hasUser: !!req.user,
            username: req.user?.username,
        });
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new AppError_1.AppError(403, 'Access denied'));
        }
        next();
    };
}
