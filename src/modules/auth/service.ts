import bcrypt from 'bcrypt';

import { AppDataSource } from '../../config/data-source';
import { User } from '../../entities/User';
import { UserRole } from '../../entities/enums';
import { AppError } from '../../utils/AppError';
import { signAuthToken } from '../../utils/jwt';

function toUserResponse(user: User) {
  return {
    id: user.id,
    username: user.username,
    full_name: user.fullName,
    role: user.role,
    is_active: user.isActive,
    balance: user.balance,
  };
}

async function authenticateCredentials(input: { username: string; password: string }) {
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({ where: { username: input.username } });

  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AppError(401, 'Invalid username or password');
  }

  if (!user.isActive) {
    throw new AppError(403, 'This account is inactive');
  }

  return user;
}

export async function registerStudent(input: { username: string; full_name: string; password: string; device_id: string }) {
  const userRepository = AppDataSource.getRepository(User);
  const existingUser = await userRepository.findOne({ where: { username: input.username } });

  if (existingUser) {
    throw new AppError(409, 'Username already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = userRepository.create({
    username: input.username,
    fullName: input.full_name,
    passwordHash,
    role: UserRole.STUDENT,
    isActive: true,
    balance: '0.00',
    deviceId: input.device_id,
  });

  const savedUser = await userRepository.save(user);

  return {
    token: signAuthToken({ userId: savedUser.id, role: savedUser.role, deviceId: savedUser.deviceId }),
    user: toUserResponse(savedUser),
  };
}

export async function loginUser(input: { username: string; password: string; device_id?: string }) {
  const userRepository = AppDataSource.getRepository(User);
  const user = await authenticateCredentials({ username: input.username, password: input.password });

  if (user.role === UserRole.STUDENT) {
    if (!input.device_id) {
      throw new AppError(400, 'device_id is required');
    }

    if (!user.deviceId) {
      user.deviceId = input.device_id;
      await userRepository.save(user);
    } else if (user.deviceId !== input.device_id) {
      throw new AppError(403, 'This account is linked to another device');
    }
  }

  return {
    token: signAuthToken({ userId: user.id, role: user.role, deviceId: user.role === UserRole.STUDENT ? user.deviceId : null }),
    user: toUserResponse(user),
  };
}

export async function loginForPanel(input: { username: string; password: string }) {
  const user = await authenticateCredentials(input);

  if (user.role === UserRole.STUDENT) {
    throw new AppError(403, 'هذا الحساب غير مخصص للوحة التحكم');
  }

  if (user.role !== UserRole.ADMIN && user.role !== UserRole.TEACHER) {
    throw new AppError(403, 'هذا الحساب غير مخصص للوحة التحكم');
  }

  return {
    token: signAuthToken({ userId: user.id, role: user.role, deviceId: null }),
    user: toUserResponse(user),
  };
}

export async function getCurrentUser(userId: number) {
  const user = await AppDataSource.getRepository(User).findOne({ where: { id: userId } });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return toUserResponse(user);
}

export async function changePassword(userId: number, input: { old_password: string; new_password: string }) {
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const validOldPassword = await bcrypt.compare(input.old_password, user.passwordHash);
  if (!validOldPassword) {
    throw new AppError(400, 'Old password is incorrect');
  }

  user.passwordHash = await bcrypt.hash(input.new_password, 12);
  await userRepository.save(user);

  return { message: 'Password updated successfully' };
}
