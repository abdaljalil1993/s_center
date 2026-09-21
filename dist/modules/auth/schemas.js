"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const usernameSchema = zod_1.z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/, 'Username may contain only lowercase letters, numbers, and underscores');
const passwordSchema = zod_1.z.string().min(8).max(128);
const deviceIdSchema = zod_1.z.string().trim().min(1).max(255);
exports.registerSchema = zod_1.z
    .object({
    username: usernameSchema,
    full_name: zod_1.z.string().trim().min(2).max(120),
    password: passwordSchema,
    device_id: deviceIdSchema,
})
    .strict();
exports.loginSchema = zod_1.z
    .object({
    username: usernameSchema,
    password: passwordSchema,
    device_id: deviceIdSchema.optional(),
})
    .strict();
exports.changePasswordSchema = zod_1.z
    .object({
    old_password: passwordSchema,
    new_password: passwordSchema,
})
    .strict();
