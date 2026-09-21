"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.topupRequestSchema = exports.walletPaginationSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../../entities/enums");
const money_1 = require("../../utils/money");
const requestSchemas_1 = require("../../utils/requestSchemas");
exports.walletPaginationSchema = requestSchemas_1.paginationSchema;
exports.topupRequestSchema = zod_1.z
    .object({
    amount: money_1.positiveMoneySchema,
    method: zod_1.z.nativeEnum(enums_1.TopupMethod),
    reference_number: zod_1.z.string().trim().min(1).max(100),
    sender_name: zod_1.z.string().trim().min(1).max(150),
    note: zod_1.z.string().trim().max(1000).optional().nullable(),
})
    .strict();
