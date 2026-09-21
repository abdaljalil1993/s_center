"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminTeachersStatsSchema = exports.adminTopCoursesStatsSchema = exports.adminSalesStatsSchema = exports.adminStatsRangeSchema = exports.resetPasswordSchema = exports.teacherPayoutSchema = exports.teacherCreateSchema = exports.adminNotificationSchema = exports.adminUsersQuerySchema = exports.adjustBalanceSchema = exports.activeUserSchema = exports.rejectTopupSchema = exports.topupRequestsQuerySchema = exports.lectureUpdateSchema = exports.lectureCreateSchema = exports.courseUpdateSchema = exports.courseCreateSchema = exports.specializationUpdateSchema = exports.specializationCreateSchema = exports.adminIdParamSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../../entities/enums");
const money_1 = require("../../utils/money");
const requestSchemas_1 = require("../../utils/requestSchemas");
const usernameSchema = zod_1.z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/, 'Username may contain only lowercase letters, numbers, and underscores');
const passwordSchema = zod_1.z.string().min(8).max(128);
const nameSchema = zod_1.z.string().trim().min(1).max(120);
const descriptionSchema = zod_1.z.string().trim().max(5000).optional().nullable();
const contentSchema = zod_1.z.string().trim().max(50000).optional().nullable();
const urlSchema = zod_1.z
    .string()
    .trim()
    .max(5000)
    .optional()
    .nullable()
    .refine((value) => !value || /^https?:\/\/.+/.test(value), 'URL must start with http:// or https://');
const percentageSchema = zod_1.z
    .union([zod_1.z.string(), zod_1.z.number()])
    .transform((value) => String(value).trim())
    .refine((value) => /^\d+(?:\.\d{1,2})?$/.test(value), 'Invalid percentage')
    .refine((value) => Number(value) >= 0 && Number(value) <= 100, 'Percentage must be between 0 and 100');
exports.adminIdParamSchema = requestSchemas_1.idParamSchema;
exports.specializationCreateSchema = zod_1.z
    .object({
    name: nameSchema,
    is_published: zod_1.z.boolean().optional(),
    sort_order: zod_1.z.coerce.number().int().min(0).optional(),
})
    .strict();
exports.specializationUpdateSchema = exports.specializationCreateSchema.partial().strict();
exports.courseCreateSchema = zod_1.z
    .object({
    specialization_id: zod_1.z.coerce.number().int().positive(),
    year: zod_1.z.coerce.number().int().min(1).max(5),
    name: nameSchema,
    description: descriptionSchema,
    price: money_1.positiveMoneySchema,
    is_published: zod_1.z.boolean().optional(),
    sort_order: zod_1.z.coerce.number().int().min(0).optional(),
    teacher_id: zod_1.z.coerce.number().int().positive().nullable().optional(),
    teacher_percent: percentageSchema.optional(),
})
    .strict();
exports.courseUpdateSchema = exports.courseCreateSchema.partial().strict();
exports.lectureCreateSchema = zod_1.z
    .object({
    course_id: zod_1.z.coerce.number().int().positive(),
    title: nameSchema,
    type: zod_1.z.nativeEnum(enums_1.LectureType),
    url: urlSchema,
    content: contentSchema,
    is_published: zod_1.z.boolean().optional(),
    sort_order: zod_1.z.coerce.number().int().min(0).optional(),
})
    .strict();
exports.lectureUpdateSchema = exports.lectureCreateSchema.partial().strict();
exports.topupRequestsQuerySchema = zod_1.z
    .object({
    status: zod_1.z.nativeEnum(enums_1.TopupStatus).optional().default(enums_1.TopupStatus.PENDING),
})
    .strict();
exports.rejectTopupSchema = zod_1.z
    .object({
    reason: zod_1.z.string().trim().min(1).max(1000),
})
    .strict();
exports.activeUserSchema = zod_1.z
    .object({
    is_active: zod_1.z.boolean(),
})
    .strict();
exports.adjustBalanceSchema = zod_1.z
    .object({
    amount: money_1.signedMoneySchema,
    description: zod_1.z.string().trim().min(1).max(1000),
})
    .strict();
exports.adminUsersQuerySchema = zod_1.z
    .object({
    search: zod_1.z.string().trim().max(100).optional(),
})
    .strict();
exports.adminNotificationSchema = zod_1.z.union([
    zod_1.z
        .object({
        all: zod_1.z.literal(true),
        title: zod_1.z.string().trim().min(1).max(180),
        body: zod_1.z.string().trim().min(1).max(5000),
    })
        .strict(),
    zod_1.z
        .object({
        user_id: zod_1.z.coerce.number().int().positive(),
        title: zod_1.z.string().trim().min(1).max(180),
        body: zod_1.z.string().trim().min(1).max(5000),
    })
        .strict(),
]);
exports.teacherCreateSchema = zod_1.z
    .object({
    username: usernameSchema,
    full_name: zod_1.z.string().trim().min(2).max(120),
    password: passwordSchema,
})
    .strict();
exports.teacherPayoutSchema = zod_1.z
    .object({
    amount: money_1.positiveMoneySchema,
    note: zod_1.z.string().trim().max(1000).optional().nullable(),
})
    .strict();
exports.resetPasswordSchema = zod_1.z
    .object({
    new_password: passwordSchema,
})
    .strict();
exports.adminStatsRangeSchema = zod_1.z
    .object({
    from: zod_1.z.string().datetime().optional(),
    to: zod_1.z.string().datetime().optional(),
})
    .strict();
exports.adminSalesStatsSchema = zod_1.z
    .object({
    days: zod_1.z.coerce.number().int().min(1).max(365).default(30),
    from: zod_1.z.string().datetime().optional(),
    to: zod_1.z.string().datetime().optional(),
})
    .strict();
exports.adminTopCoursesStatsSchema = zod_1.z
    .object({
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
    from: zod_1.z.string().datetime().optional(),
    to: zod_1.z.string().datetime().optional(),
})
    .strict();
exports.adminTeachersStatsSchema = zod_1.z
    .object({
    from: zod_1.z.string().datetime().optional(),
    to: zod_1.z.string().datetime().optional(),
})
    .strict();
