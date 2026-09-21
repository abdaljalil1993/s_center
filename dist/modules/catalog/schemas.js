"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lecturesParamSchema = exports.courseIdParamSchema = exports.coursesQuerySchema = void 0;
const zod_1 = require("zod");
const requestSchemas_1 = require("../../utils/requestSchemas");
exports.coursesQuerySchema = zod_1.z
    .object({
    specializationId: zod_1.z.coerce.number().int().positive().optional(),
    year: zod_1.z.coerce.number().int().min(1).max(5).optional(),
})
    .strict();
exports.courseIdParamSchema = requestSchemas_1.idParamSchema;
exports.lecturesParamSchema = requestSchemas_1.idParamSchema;
