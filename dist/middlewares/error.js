"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
const typeorm_1 = require("typeorm");
const zod_1 = require("zod");
const AppError_1 = require("../utils/AppError");
const flash_1 = require("../panel/middlewares/flash");
function isPanelRequest(req) {
    return req.originalUrl.startsWith('/panel');
}
function panelRedirectTarget(req) {
    return req.get('referer') || '/panel/login';
}
function errorMiddleware(error, _req, res, _next) {
    const req = _req;
    if (isPanelRequest(req) && error instanceof AppError_1.AppError) {
        (0, flash_1.setFlash)(res, 'error', error.message);
        return res.redirect(panelRedirectTarget(req));
    }
    if (error instanceof AppError_1.AppError) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    if (error instanceof zod_1.ZodError) {
        return res.status(400).json({ success: false, message: error.issues.map((issue) => issue.message).join(', ') });
    }
    if (error instanceof typeorm_1.QueryFailedError) {
        const driverError = error.driverError;
        if (driverError?.errno === 1062 || driverError?.code === 'ER_DUP_ENTRY') {
            if (isPanelRequest(req)) {
                (0, flash_1.setFlash)(res, 'error', 'السجل موجود مسبقًا');
                return res.redirect(panelRedirectTarget(req));
            }
            return res.status(409).json({ success: false, message: 'Resource already exists' });
        }
        if (isPanelRequest(req)) {
            (0, flash_1.setFlash)(res, 'error', 'تعذر تنفيذ العملية');
            return res.redirect(panelRedirectTarget(req));
        }
        return res.status(400).json({ success: false, message: 'Database operation failed' });
    }
    if (isPanelRequest(req)) {
        return res.status(500).render('error', { title: 'حدث خطأ' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
}
