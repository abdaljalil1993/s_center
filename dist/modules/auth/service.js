"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerStudent = registerStudent;
exports.loginUser = loginUser;
exports.loginForPanel = loginForPanel;
exports.getCurrentUser = getCurrentUser;
exports.changePassword = changePassword;
const bcrypt_1 = __importDefault(require("bcrypt"));
const data_source_1 = require("../../config/data-source");
const User_1 = require("../../entities/User");
const enums_1 = require("../../entities/enums");
const AppError_1 = require("../../utils/AppError");
const jwt_1 = require("../../utils/jwt");
function toUserResponse(user) {
    return {
        id: user.id,
        username: user.username,
        full_name: user.fullName,
        role: user.role,
        is_active: user.isActive,
        balance: user.balance,
    };
}
async function authenticateCredentials(input) {
    const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
    const user = await userRepository.findOne({ where: { username: input.username } });
    if (!user || !(await bcrypt_1.default.compare(input.password, user.passwordHash))) {
        throw new AppError_1.AppError(401, 'Invalid username or password');
    }
    if (!user.isActive) {
        throw new AppError_1.AppError(403, 'This account is inactive');
    }
    return user;
}
async function registerStudent(input) {
    const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
    const existingUser = await userRepository.findOne({ where: { username: input.username } });
    if (existingUser) {
        throw new AppError_1.AppError(409, 'Username already exists');
    }
    const passwordHash = await bcrypt_1.default.hash(input.password, 12);
    const user = userRepository.create({
        username: input.username,
        fullName: input.full_name,
        passwordHash,
        role: enums_1.UserRole.STUDENT,
        isActive: true,
        balance: '0.00',
        deviceId: input.device_id,
    });
    const savedUser = await userRepository.save(user);
    return {
        token: (0, jwt_1.signAuthToken)({ userId: savedUser.id, role: savedUser.role, deviceId: savedUser.deviceId }),
        user: toUserResponse(savedUser),
    };
}
async function loginUser(input) {
    const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
    const user = await authenticateCredentials({ username: input.username, password: input.password });
    if (user.role === enums_1.UserRole.STUDENT) {
        if (!input.device_id) {
            throw new AppError_1.AppError(400, 'device_id is required');
        }
        if (!user.deviceId) {
            user.deviceId = input.device_id;
            await userRepository.save(user);
        }
        else if (user.deviceId !== input.device_id) {
            throw new AppError_1.AppError(403, 'This account is linked to another device');
        }
    }
    return {
        token: (0, jwt_1.signAuthToken)({ userId: user.id, role: user.role, deviceId: user.role === enums_1.UserRole.STUDENT ? user.deviceId : null }),
        user: toUserResponse(user),
    };
}
async function loginForPanel(input) {
    const user = await authenticateCredentials(input);
    if (user.role === enums_1.UserRole.STUDENT) {
        throw new AppError_1.AppError(403, 'هذا الحساب غير مخصص للوحة التحكم');
    }
    if (user.role !== enums_1.UserRole.ADMIN && user.role !== enums_1.UserRole.TEACHER) {
        throw new AppError_1.AppError(403, 'هذا الحساب غير مخصص للوحة التحكم');
    }
    return {
        token: (0, jwt_1.signAuthToken)({ userId: user.id, role: user.role, deviceId: null }),
        user: toUserResponse(user),
    };
}
async function getCurrentUser(userId) {
    const user = await data_source_1.AppDataSource.getRepository(User_1.User).findOne({ where: { id: userId } });
    if (!user) {
        throw new AppError_1.AppError(404, 'User not found');
    }
    return toUserResponse(user);
}
async function changePassword(userId, input) {
    const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
        throw new AppError_1.AppError(404, 'User not found');
    }
    const validOldPassword = await bcrypt_1.default.compare(input.old_password, user.passwordHash);
    if (!validOldPassword) {
        throw new AppError_1.AppError(400, 'Old password is incorrect');
    }
    user.passwordHash = await bcrypt_1.default.hash(input.new_password, 12);
    await userRepository.save(user);
    return { message: 'Password updated successfully' };
}
