"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.panelFlash = panelFlash;
exports.setFlash = setFlash;
const crypto_1 = __importDefault(require("crypto"));
function cookieSecureFlag() {
    return process.env.NODE_ENV === 'production';
}
function serializeFlash(type, message) {
    return Buffer.from(JSON.stringify({ type, message }), 'utf8').toString('base64');
}
function deserializeFlash(value) {
    if (!value) {
        return null;
    }
    try {
        const parsed = JSON.parse(Buffer.from(value, 'base64').toString('utf8'));
        if (parsed && (parsed.type === 'success' || parsed.type === 'error') && typeof parsed.message === 'string') {
            return parsed;
        }
    }
    catch {
        return null;
    }
    return null;
}
function panelFlash(req, res, next) {
    res.locals.flash = deserializeFlash(req.cookies?.panel_flash);
    if (req.cookies?.panel_flash) {
        res.clearCookie('panel_flash', { path: '/panel' });
    }
    let csrfToken = req.cookies?.panel_csrf_token;
    if (!csrfToken) {
        csrfToken = crypto_1.default.randomBytes(24).toString('hex');
        res.cookie('panel_csrf_token', csrfToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: cookieSecureFlag(),
            path: '/panel',
        });
    }
    res.locals.csrfToken = csrfToken;
    next();
}
function setFlash(res, type, message) {
    res.cookie('panel_flash', serializeFlash(type, message), {
        httpOnly: true,
        sameSite: 'strict',
        secure: cookieSecureFlag(),
        path: '/panel',
        maxAge: 60 * 1000,
    });
}
