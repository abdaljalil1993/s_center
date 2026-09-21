"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signedMoneySchema = exports.positiveMoneySchema = exports.moneySchema = void 0;
exports.toCents = toCents;
exports.centsToMoney = centsToMoney;
exports.addMoney = addMoney;
exports.subtractMoney = subtractMoney;
exports.calculateMoneyShare = calculateMoneyShare;
const zod_1 = require("zod");
const moneyPattern = /^-?\d+(?:\.\d{1,2})?$/;
exports.moneySchema = zod_1.z
    .union([zod_1.z.string(), zod_1.z.number()])
    .transform((value) => String(value).trim())
    .refine((value) => moneyPattern.test(value), 'Invalid money amount');
exports.positiveMoneySchema = exports.moneySchema.refine((value) => toCents(value) > 0n, 'Amount must be greater than 0');
exports.signedMoneySchema = exports.moneySchema.refine((value) => toCents(value) !== 0n, 'Amount must not be 0');
function toCents(value) {
    const normalized = value.trim();
    if (!moneyPattern.test(normalized)) {
        throw new Error('Invalid money amount');
    }
    const negative = normalized.startsWith('-');
    const unsigned = negative ? normalized.slice(1) : normalized;
    const [wholePart, fractionPart = ''] = unsigned.split('.');
    const whole = BigInt(wholePart || '0');
    const fraction = BigInt((fractionPart + '00').slice(0, 2));
    const cents = whole * 100n + fraction;
    return negative ? -cents : cents;
}
function centsToMoney(value) {
    const negative = value < 0n;
    const absolute = negative ? -value : value;
    const whole = absolute / 100n;
    const fraction = (absolute % 100n).toString().padStart(2, '0');
    return `${negative ? '-' : ''}${whole.toString()}.${fraction}`;
}
function addMoney(left, right) {
    return centsToMoney(toCents(left) + toCents(right));
}
function subtractMoney(left, right) {
    return centsToMoney(toCents(left) - toCents(right));
}
function calculateMoneyShare(amount, percent) {
    const amountCents = toCents(amount);
    const percentCents = toCents(percent);
    const raw = amountCents * percentCents;
    const adjusted = raw >= 0n ? raw + 5000n : raw - 5000n;
    return centsToMoney(adjusted / 10000n);
}
