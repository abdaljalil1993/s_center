"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.csrfOrigin = csrfOrigin;
const crypto_1 = require("crypto");
const AppError_1 = require("../../utils/AppError");
function getHost(value) {
    if (!value) {
        return null;
    }
    try {
        return new URL(value).host;
    }
    catch {
        return null;
    }
}
function csrfOrigin(req, _res, next) {
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
        return next();
    }
    const requestHost = req.get('host');
    const originHost = getHost(req.get('origin') ?? undefined) ?? getHost(req.get('referer') ?? undefined);
    if (!requestHost || !originHost || requestHost !== originHost) {
        return next(new AppError_1.AppError(403, 'تعذر التحقق من مصدر الطلب'));
    }
    const tokenFromCookie = req.cookies?.panel_csrf_token;
    const tokenFromBody = typeof req.body?.csrf_token === 'string' ? req.body.csrf_token : undefined;
    if (!tokenFromCookie || !tokenFromBody) {
        return next(new AppError_1.AppError(403, 'انتهت صلاحية النموذج أو تم التلاعب به'));
    }
    try {
        if (!(0, crypto_1.timingSafeEqual)(Buffer.from(tokenFromCookie), Buffer.from(tokenFromBody))) {
            return next(new AppError_1.AppError(403, 'انتهت صلاحية النموذج أو تم التلاعب به'));
        }
    }
    catch {
        return next(new AppError_1.AppError(403, 'انتهت صلاحية النموذج أو تم التلاعب به'));
    }
    next();
}
