"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.coerce.number().int().positive().default(3000),
    DB_HOST: zod_1.z.string().min(1),
    DB_PORT: zod_1.z.coerce.number().int().positive().default(3306),
    DB_USER: zod_1.z.string().min(1),
    DB_PASSWORD: zod_1.z.string().default(''),
    DB_NAME: zod_1.z.string().min(1),
    DB_SYNC: zod_1.z
        .string()
        .default('false')
        .transform((value) => value === 'true'),
    JWT_SECRET: zod_1.z.string().min(1),
    JWT_EXPIRES_IN: zod_1.z.string().min(1),
    CORS_ORIGINS: zod_1.z.string().min(1),
    ADMIN_USERNAME: zod_1.z.string().optional(),
    ADMIN_PASSWORD: zod_1.z.string().optional(),
    DEBUG_PANEL: zod_1.z
        .string()
        .optional()
        .transform((value) => value === 'true'),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join(', ');
    throw new Error(message || 'Invalid environment configuration');
}
const corsOrigins = parsed.data.CORS_ORIGINS.split(',').map((value) => value.trim()).filter(Boolean);
if (corsOrigins.length === 0) {
    throw new Error('CORS_ORIGINS must contain at least one origin');
}
exports.env = {
    ...parsed.data,
    CORS_ORIGINS: corsOrigins,
};
