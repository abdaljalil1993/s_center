import { z } from 'zod';

const moneyPattern = /^-?\d+(?:\.\d{1,2})?$/;

function normalizeMoneyInput(value: string): string {
  const arabicIndic = '٠١٢٣٤٥٦٧٨٩';
  const easternArabicIndic = '۰۱۲۳۴۵۶۷۸۹';

  let normalized = value.trim();

  normalized = normalized
    .replace(/[٠-٩]/g, (digit) => String(arabicIndic.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String(easternArabicIndic.indexOf(digit)))
    .replace(/\u066C/g, '')
    .replace(/\u066B/g, '.')
    .replace(/\s+/g, '');

  if (!normalized.includes('.') && normalized.includes(',')) {
    normalized = normalized.replace(/,/g, '.');
  } else {
    normalized = normalized.replace(/,/g, '');
  }

  return normalized;
}

export const moneySchema = z
  .union([z.string(), z.number()])
  .transform((value) => normalizeMoneyInput(String(value)))
  .refine((value) => moneyPattern.test(value), 'Invalid money amount');

export const positiveMoneySchema = moneySchema.refine(
  (value) => toCents(value) > 0n,
  'Amount must be greater than 0',
);

export const signedMoneySchema = moneySchema.refine(
  (value) => toCents(value) !== 0n,
  'Amount must not be 0',
);

export function toCents(value: string): bigint {
  const normalized = normalizeMoneyInput(value);
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

export function centsToMoney(value: bigint): string {
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  const whole = absolute / 100n;
  const fraction = (absolute % 100n).toString().padStart(2, '0');
  return `${negative ? '-' : ''}${whole.toString()}.${fraction}`;
}

export function addMoney(left: string, right: string): string {
  return centsToMoney(toCents(left) + toCents(right));
}

export function subtractMoney(left: string, right: string): string {
  return centsToMoney(toCents(left) - toCents(right));
}

export function calculateMoneyShare(amount: string, percent: string): string {
  const amountCents = toCents(amount);
  const percentCents = toCents(percent);
  const raw = amountCents * percentCents;
  const adjusted = raw >= 0n ? raw + 5000n : raw - 5000n;
  return centsToMoney(adjusted / 10000n);
}
