"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teacherStatsQuerySchema = exports.teacherLectureUpdateSchema = exports.teacherLectureCreateSchema = exports.teacherLectureIdParamSchema = exports.teacherCourseIdParamSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../../entities/enums");
const requestSchemas_1 = require("../../utils/requestSchemas");
exports.teacherCourseIdParamSchema = requestSchemas_1.idParamSchema;
exports.teacherLectureIdParamSchema = requestSchemas_1.idParamSchema;
const urlSchema = zod_1.z
    .string()
    .trim()
    .max(5000)
    .optional()
    .nullable()
    .refine((value) => !value || /^https?:\/\/.+/.test(value), 'URL must start with http:// or https://');
exports.teacherLectureCreateSchema = zod_1.z
    .object({
    title: zod_1.z.string().trim().min(1).max(150),
    type: zod_1.z.nativeEnum(enums_1.LectureType),
    url: urlSchema,
    content: zod_1.z.string().trim().max(50000).optional().nullable(),
    sort_order: zod_1.z.coerce.number().int().min(0).optional(),
})
    .strict();
exports.teacherLectureUpdateSchema = exports.teacherLectureCreateSchema.partial().strict();
exports.teacherStatsQuerySchema = zod_1.z
    .object({
    from: zod_1.z.string().datetime().optional(),
    to: zod_1.z.string().datetime().optional(),
})
    .strict();
