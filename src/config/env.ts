import 'dotenv/config';

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().min(1),
  DB_SYNC: z
    .string()
    .default('false')
    .transform((value) => value === 'true'),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().min(1),
  CORS_ORIGINS: z.string().min(1),
  ADMIN_USERNAME: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
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

export const env = {
  ...parsed.data,
  CORS_ORIGINS: corsOrigins,
};
