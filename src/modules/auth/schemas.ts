import { z } from 'zod';

const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(30)
  .regex(/^[a-z0-9_]+$/, 'Username may contain only lowercase letters, numbers, and underscores');

const passwordSchema = z.string().min(8).max(128);
const deviceIdSchema = z.string().trim().min(1).max(255);

export const registerSchema = z
  .object({
    username: usernameSchema,
    full_name: z.string().trim().min(2).max(120),
    password: passwordSchema,
    device_id: deviceIdSchema,
  })
  .strict();

export const loginSchema = z
  .object({
    username: usernameSchema,
    password: passwordSchema,
    device_id: deviceIdSchema.optional(),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    old_password: passwordSchema,
    new_password: passwordSchema,
  })
  .strict();
