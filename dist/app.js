"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const env_1 = require("./config/env");
const routes_1 = require("./modules/admin/routes");
const routes_2 = require("./modules/auth/routes");
const routes_3 = require("./modules/catalog/routes");
const routes_4 = require("./modules/notifications/routes");
const routes_5 = require("./modules/purchase/routes");
const routes_6 = require("./modules/wallet/routes");
const routes_7 = require("./modules/teacher/routes");
const auth_routes_1 = require("./panel/routes/auth.routes");
const admin_routes_1 = require("./panel/routes/admin.routes");
const teacher_routes_1 = require("./panel/routes/teacher.routes");
const error_1 = require("./middlewares/error");
const rateLimit_1 = require("./middlewares/rateLimit");
const csrfOrigin_1 = require("./panel/middlewares/csrfOrigin");
exports.app = (0, express_1.default)();
function resolveViewsPath() {
    const distViews = path_1.default.resolve(process.cwd(), 'dist', 'panel', 'views');
    const srcViews = path_1.default.resolve(process.cwd(), 'src', 'panel', 'views');
    return fs_1.default.existsSync(distViews) ? distViews : srcViews;
}
function formatMoney(value) {
    const number = typeof value === 'bigint' ? Number(value) : Number(value ?? 0);
    return new Intl.NumberFormat('ar-SY', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number.isFinite(number) ? number : 0);
}
function formatDate(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '-';
    }
    return new Intl.DateTimeFormat('ar', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}
exports.app.set('view engine', 'ejs');
exports.app.set('views', resolveViewsPath());
exports.app.locals.money = formatMoney;
exports.app.locals.date = formatDate;
exports.app.disable('x-powered-by');
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       useDefaults: true,
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: ["'self'"],
//         styleSrc: ["'self'"],
//         imgSrc: ["'self'", 'data:'],
//         fontSrc: ["'self'"],
//         connectSrc: ["'self'"],
//         objectSrc: ["'none'"],
//         baseUri: ["'self'"],
//         frameAncestors: ["'self'"],
//       },
//     },
//   }),
// );
exports.app.use((0, cors_1.default)({
    origin: env_1.env.CORS_ORIGINS,
    credentials: true,
}));
exports.app.use((0, cookie_parser_1.default)());
exports.app.use(express_1.default.json({ limit: '1mb' }));
exports.app.use(express_1.default.urlencoded({ extended: false }));
exports.app.use(rateLimit_1.generalRateLimit);
exports.app.use(express_1.default.static(path_1.default.resolve(process.cwd(), 'public')));
exports.app.get('/', (_req, res) => {
    res.redirect('/panel');
});
exports.app.use('/api/auth', routes_2.authRoutes);
exports.app.use('/api', routes_3.catalogRoutes);
exports.app.use('/api', routes_6.walletRoutes);
exports.app.use('/api', routes_5.purchaseRoutes);
exports.app.use('/api', routes_4.notificationsRoutes);
exports.app.use('/api/admin', routes_1.adminRoutes);
exports.app.use('/api/teacher', routes_7.teacherRoutes);
exports.app.use('/panel', csrfOrigin_1.csrfOrigin, auth_routes_1.panelAuthRoutes);
exports.app.use('/panel/admin', csrfOrigin_1.csrfOrigin, admin_routes_1.panelAdminRoutes);
exports.app.use('/panel/teacher', csrfOrigin_1.csrfOrigin, teacher_routes_1.panelTeacherRoutes);
exports.app.use(error_1.errorMiddleware);
