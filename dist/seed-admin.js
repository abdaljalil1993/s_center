"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const bcrypt_1 = __importDefault(require("bcrypt"));
const zod_1 = require("zod");
const data_source_1 = require("./config/data-source");
const env_1 = require("./config/env");
const User_1 = require("./entities/User");
const enums_1 = require("./entities/enums");
const adminSeedSchema = zod_1.z.object({
    ADMIN_USERNAME: zod_1.z
        .string()
        .trim()
        .toLowerCase()
        .min(3)
        .max(30)
        .regex(/^[a-z0-9_]+$/, 'Username may contain only lowercase letters, numbers, and underscores'),
    ADMIN_PASSWORD: zod_1.z.string().min(8),
});
async function main() {
    const parsed = adminSeedSchema.safeParse({
        ADMIN_USERNAME: env_1.env.ADMIN_USERNAME,
        ADMIN_PASSWORD: env_1.env.ADMIN_PASSWORD,
    });
    if (!parsed.success) {
        throw new Error(parsed.error.issues.map((issue) => issue.message).join(', '));
    }
    await data_source_1.AppDataSource.initialize();
    const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
    const existingAdminCount = await userRepository.count({ where: { role: enums_1.UserRole.ADMIN } });
    if (existingAdminCount > 0) {
        console.log('An admin user already exists. Skipping seed.');
        await data_source_1.AppDataSource.destroy();
        return;
    }
    const username = parsed.data.ADMIN_USERNAME;
    const existingUser = await userRepository.findOne({ where: { username } });
    if (existingUser) {
        if (existingUser.role === enums_1.UserRole.ADMIN) {
            console.log('Admin user already exists. Skipping seed.');
            await data_source_1.AppDataSource.destroy();
            return;
        }
        throw new Error('The configured admin username is already taken by another account');
    }
    const passwordHash = await bcrypt_1.default.hash(parsed.data.ADMIN_PASSWORD, 12);
    await userRepository.save(userRepository.create({
        username,
        fullName: 'System Administrator',
        passwordHash,
        role: enums_1.UserRole.ADMIN,
        isActive: true,
        balance: '0.00',
        deviceId: null,
    }));
    console.log('Admin user created successfully');
    await data_source_1.AppDataSource.destroy();
}
main().catch(async (error) => {
    console.error('Failed to seed admin');
    console.error(error instanceof Error ? error.message : error);
    if (data_source_1.AppDataSource.isInitialized) {
        await data_source_1.AppDataSource.destroy();
    }
    process.exit(1);
});
