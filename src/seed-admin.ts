import 'reflect-metadata';

import bcrypt from 'bcrypt';
import { z } from 'zod';

import { AppDataSource } from './config/data-source';
import { env } from './config/env';
import { User } from './entities/User';
import { UserRole } from './entities/enums';

const adminSeedSchema = z.object({
  ADMIN_USERNAME: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/, 'Username may contain only lowercase letters, numbers, and underscores'),
  ADMIN_PASSWORD: z.string().min(8),
});

async function main() {
  const parsed = adminSeedSchema.safeParse({
    ADMIN_USERNAME: env.ADMIN_USERNAME,
    ADMIN_PASSWORD: env.ADMIN_PASSWORD,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => issue.message).join(', '));
  }

  await AppDataSource.initialize();

  const userRepository = AppDataSource.getRepository(User);
  const existingAdminCount = await userRepository.count({ where: { role: UserRole.ADMIN } });

  if (existingAdminCount > 0) {
    console.log('An admin user already exists. Skipping seed.');
    await AppDataSource.destroy();
    return;
  }

  const username = parsed.data.ADMIN_USERNAME;
  const existingUser = await userRepository.findOne({ where: { username } });

  if (existingUser) {
    if (existingUser.role === UserRole.ADMIN) {
      console.log('Admin user already exists. Skipping seed.');
      await AppDataSource.destroy();
      return;
    }

    throw new Error('The configured admin username is already taken by another account');
  }

  const passwordHash = await bcrypt.hash(parsed.data.ADMIN_PASSWORD, 12);
  await userRepository.save(
    userRepository.create({
      username,
      fullName: 'System Administrator',
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
      balance: '0.00',
      deviceId: null,
    }),
  );

  console.log('Admin user created successfully');
  await AppDataSource.destroy();
}

main().catch(async (error) => {
  console.error('Failed to seed admin');
  console.error(error instanceof Error ? error.message : error);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(1);
});
