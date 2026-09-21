"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationSchema = exports.idParamSchema = void 0;
const zod_1 = require("zod");
exports.idParamSchema = zod_1.z
    .object({
    id: zod_1.z.coerce.number().int().positive(),
})
    .strict();
exports.paginationSchema = zod_1.z
    .object({
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    offset: zod_1.z.coerce.number().int().min(0).default(0),
})
    .strict();
