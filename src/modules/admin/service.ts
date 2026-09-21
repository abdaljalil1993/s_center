import bcrypt from 'bcrypt';
import { Brackets, Like } from 'typeorm';

import { AppDataSource } from '../../config/data-source';
import { Course } from '../../entities/Course';
import { Lecture } from '../../entities/Lecture';
import { Notification } from '../../entities/Notification';
import { Purchase } from '../../entities/Purchase';
import { TeacherPayout } from '../../entities/TeacherPayout';
import { Specialization } from '../../entities/Specialization';
import { TopupRequest } from '../../entities/TopupRequest';
import { TopupStatus, TransactionType } from '../../entities/enums';
import { Transaction } from '../../entities/Transaction';
import { User } from '../../entities/User';
import { UserRole } from '../../entities/enums';
import { AppError } from '../../utils/AppError';
import { calculateMoneyShare, centsToMoney, toCents } from '../../utils/money';
import { notify } from '../notifications/service';

function mapSpecialization(specialization: Specialization) {
  return {
    id: specialization.id,
    name: specialization.name,
    is_published: specialization.isPublished,
    sort_order: specialization.sortOrder,
    created_at: specialization.createdAt,
    updated_at: specialization.updatedAt,
  };
}

function mapCourse(course: Course) {
  return {
    id: course.id,
    specialization_id: course.specialization.id,
    specialization_name: course.specialization.name,
    teacher_id: course.teacher ? course.teacher.id : null,
    teacher_full_name: course.teacher ? course.teacher.fullName : null,
    teacher_percent: course.teacherPercent,
    year: course.year,
    name: course.name,
    description: course.description,
    price: course.price,
    is_published: course.isPublished,
    sort_order: course.sortOrder,
    created_at: course.createdAt,
    updated_at: course.updatedAt,
  };
}

function mapLecture(lecture: Lecture) {
  return {
    id: lecture.id,
    course_id: lecture.course.id,
    course_name: lecture.course.name,
    course_teacher_id: lecture.course.teacher ? lecture.course.teacher.id : null,
    title: lecture.title,
    type: lecture.type,
    url: lecture.url,
    content: lecture.content,
    is_published: lecture.isPublished,
    sort_order: lecture.sortOrder,
    created_by: lecture.createdBy ? lecture.createdBy.id : null,
    created_at: lecture.createdAt,
    updated_at: lecture.updatedAt,
  };
}

function mapUser(user: User) {
  return {
    id: user.id,
    username: user.username,
    full_name: user.fullName,
    role: user.role,
    is_active: user.isActive,
    balance: user.balance,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  };
}

function mapTopupRequest(request: TopupRequest) {
  return {
    id: request.id,
    user_id: request.user.id,
    username: request.user.username,
    full_name: request.user.fullName,
    amount: request.amount,
    method: request.method,
    reference_number: request.referenceNumber,
    sender_name: request.senderName,
    note: request.note,
    status: request.status,
    reject_reason: request.rejectReason,
    reviewed_by: request.reviewedBy ? request.reviewedBy.id : null,
    reviewed_at: request.reviewedAt,
    created_at: request.createdAt,
  };
}

function mapTeacherAggregate(row: Record<string, unknown>) {
  const earned = String(row.total_earned ?? '0.00');
  const paid = String(row.total_paid ?? '0.00');
  const remaining = centsToMoney(toCents(earned) - toCents(paid));

  return {
    teacher_id: Number(row.teacher_id),
    username: String(row.username ?? ''),
    full_name: String(row.full_name ?? ''),
    purchases_count: Number(row.purchases_count ?? 0),
    earned,
    paid,
    remaining,
  };
}

function addDateFilter(qb: { andWhere: (sql: string, params?: Record<string, unknown>) => unknown }, alias: string, from?: string, to?: string) {
  if (from) {
    qb.andWhere(`${alias}.created_at >= :from`, { from });
  }
  if (to) {
    qb.andWhere(`${alias}.created_at <= :to`, { to });
  }
}

async function requireTeacherUser(id: number) {
  const user = await AppDataSource.getRepository(User).findOne({ where: { id, role: UserRole.TEACHER } });
  if (!user) {
    throw new AppError(400, 'teacher_id must reference a TEACHER user');
  }
  return user;
}

async function requireNonAdminUser(id: number) {
  const user = await AppDataSource.getRepository(User).findOne({ where: { id } });
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  if (user.role === UserRole.ADMIN) {
    throw new AppError(400, 'Admin users cannot be modified');
  }
  return user;
}

async function findSpecializationOrFail(id: number) {
  const specialization = await AppDataSource.getRepository(Specialization).findOne({ where: { id } });
  if (!specialization) {
    throw new AppError(404, 'Specialization not found');
  }
  return specialization;
}

async function findCourseOrFail(id: number) {
  const course = await AppDataSource.getRepository(Course).findOne({ where: { id }, relations: { specialization: true, teacher: true } });
  if (!course) {
    throw new AppError(404, 'Course not found');
  }
  return course;
}

async function findLectureOrFail(id: number) {
  const lecture = await AppDataSource.getRepository(Lecture).findOne({ where: { id }, relations: { course: { specialization: true, teacher: true }, createdBy: true } });
  if (!lecture) {
    throw new AppError(404, 'Lecture not found');
  }
  return lecture;
}

async function findTopupRequestOrFail(id: number) {
  const request = await AppDataSource.getRepository(TopupRequest).findOne({
    where: { id },
    relations: { user: true, reviewedBy: true },
  });
  if (!request) {
    throw new AppError(404, 'Top-up request not found');
  }
  return request;
}

export async function listSpecializations() {
  const specializations = await AppDataSource.getRepository(Specialization).find({ order: { sortOrder: 'ASC', id: 'ASC' } });
  return specializations.map(mapSpecialization);
}

export async function createSpecialization(input: { name: string; is_published?: boolean; sort_order?: number }) {
  const specialization = AppDataSource.getRepository(Specialization).create({
    name: input.name,
    isPublished: input.is_published ?? true,
    sortOrder: input.sort_order ?? 0,
  });
  return mapSpecialization(await AppDataSource.getRepository(Specialization).save(specialization));
}

export async function updateSpecialization(id: number, input: Partial<{ name: string; is_published: boolean; sort_order: number }>) {
  const repository = AppDataSource.getRepository(Specialization);
  const specialization = await repository.findOne({ where: { id } });
  if (!specialization) {
    throw new AppError(404, 'Specialization not found');
  }

  if (input.name !== undefined) specialization.name = input.name;
  if (input.is_published !== undefined) specialization.isPublished = input.is_published;
  if (input.sort_order !== undefined) specialization.sortOrder = input.sort_order;

  return mapSpecialization(await repository.save(specialization));
}

export async function archiveSpecialization(id: number) {
  const repository = AppDataSource.getRepository(Specialization);
  const specialization = await repository.findOne({ where: { id } });
  if (!specialization) {
    throw new AppError(404, 'Specialization not found');
  }
  specialization.isPublished = false;
  return mapSpecialization(await repository.save(specialization));
}

export async function listCourses() {
  const courses = await AppDataSource.getRepository(Course).find({
    relations: { specialization: true, teacher: true },
    order: { sortOrder: 'ASC', id: 'ASC' },
  });
  return courses.map(mapCourse);
}

export async function createCourse(input: { specialization_id: number; year: number; name: string; description?: string | null; price: string; is_published?: boolean; sort_order?: number; teacher_id?: number | null; teacher_percent?: string }) {
  const specialization = await findSpecializationOrFail(input.specialization_id);
  const teacher = input.teacher_id ? await requireTeacherUser(input.teacher_id) : null;
  const course = AppDataSource.getRepository(Course).create({
    specialization,
    teacher,
    year: input.year,
    name: input.name,
    description: input.description ?? null,
    price: input.price,
    isPublished: input.is_published ?? true,
    sortOrder: input.sort_order ?? 0,
    teacherPercent: input.teacher_percent ?? '0.00',
  });
  return mapCourse(await AppDataSource.getRepository(Course).save(course));
}

export async function updateCourse(id: number, input: Partial<{ specialization_id: number; teacher_id: number | null; year: number; name: string; description: string | null; price: string; teacher_percent: string; is_published: boolean; sort_order: number }>) {
  const repository = AppDataSource.getRepository(Course);
  const course = await repository.findOne({ where: { id }, relations: { specialization: true, teacher: true } });
  if (!course) {
    throw new AppError(404, 'Course not found');
  }

  if (input.specialization_id !== undefined) {
    course.specialization = await findSpecializationOrFail(input.specialization_id);
  }
  if (input.teacher_id !== undefined) {
    course.teacher = input.teacher_id === null ? null : await requireTeacherUser(input.teacher_id);
  }
  if (input.year !== undefined) course.year = input.year;
  if (input.name !== undefined) course.name = input.name;
  if (input.description !== undefined) course.description = input.description;
  if (input.price !== undefined) course.price = input.price;
  if (input.teacher_percent !== undefined) course.teacherPercent = input.teacher_percent;
  if (input.is_published !== undefined) course.isPublished = input.is_published;
  if (input.sort_order !== undefined) course.sortOrder = input.sort_order;

  return mapCourse(await repository.save(course));
}

export async function archiveCourse(id: number) {
  const repository = AppDataSource.getRepository(Course);
  const course = await repository.findOne({ where: { id }, relations: { specialization: true, teacher: true } });
  if (!course) {
    throw new AppError(404, 'Course not found');
  }
  course.isPublished = false;
  return mapCourse(await repository.save(course));
}

export async function listLectures() {
  const lectures = await AppDataSource.getRepository(Lecture).find({
    relations: { course: { specialization: true, teacher: true }, createdBy: true },
    order: { sortOrder: 'ASC', id: 'ASC' },
  });
  return lectures.map(mapLecture);
}

export async function createLecture(adminId: number, input: { course_id: number; title: string; type: string; url?: string | null; content?: string | null; is_published?: boolean; sort_order?: number }) {
  const course = await findCourseOrFail(input.course_id);
  const lecture = AppDataSource.getRepository(Lecture).create({
    course,
    createdBy: { id: adminId } as User,
    title: input.title,
    type: input.type as Lecture['type'],
    url: input.url ?? null,
    content: input.content ?? null,
    isPublished: input.is_published ?? true,
    sortOrder: input.sort_order ?? 0,
  });
  return mapLecture(await AppDataSource.getRepository(Lecture).save(lecture));
}

export async function updateLecture(id: number, input: Partial<{ course_id: number; title: string; type: string; url: string | null; content: string | null; is_published: boolean; sort_order: number }>) {
  const repository = AppDataSource.getRepository(Lecture);
  const lecture = await repository.findOne({ where: { id }, relations: { course: { specialization: true, teacher: true }, createdBy: true } });
  if (!lecture) {
    throw new AppError(404, 'Lecture not found');
  }

  if (input.course_id !== undefined) lecture.course = await findCourseOrFail(input.course_id);
  if (input.title !== undefined) lecture.title = input.title;
  if (input.type !== undefined) lecture.type = input.type as Lecture['type'];
  if (input.url !== undefined) lecture.url = input.url;
  if (input.content !== undefined) lecture.content = input.content;
  if (input.is_published !== undefined) lecture.isPublished = input.is_published;
  if (input.sort_order !== undefined) lecture.sortOrder = input.sort_order;

  return mapLecture(await repository.save(lecture));
}

export async function archiveLecture(id: number) {
  const repository = AppDataSource.getRepository(Lecture);
  const lecture = await repository.findOne({ where: { id }, relations: { course: { specialization: true, teacher: true }, createdBy: true } });
  if (!lecture) {
    throw new AppError(404, 'Lecture not found');
  }
  lecture.isPublished = false;
  return mapLecture(await repository.save(lecture));
}

export async function listTopupRequests(status: TopupStatus) {
  const requests = await AppDataSource.getRepository(TopupRequest).find({
    where: { status },
    relations: { user: true, reviewedBy: true },
    order: { createdAt: 'DESC', id: 'DESC' },
  });
  return requests.map(mapTopupRequest);
}

export async function approveTopupRequest(topupRequestId: number, reviewerId: number) {
  return AppDataSource.transaction(async (manager) => {
    const requestRepository = manager.getRepository(TopupRequest);
    const userRepository = manager.getRepository(User);
    const transactionRepository = manager.getRepository(Transaction);

    const request = await requestRepository.findOne({
      where: { id: topupRequestId },
      relations: { user: true, reviewedBy: true },
      lock: { mode: 'pessimistic_write' },
    });

    if (!request) {
      throw new AppError(404, 'Top-up request not found');
    }

    if (request.status !== TopupStatus.PENDING) {
      throw new AppError(400, 'Top-up request is not pending');
    }

    const user = await userRepository.findOne({
      where: { id: request.user.id },
      lock: { mode: 'pessimistic_write' },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const newBalance = centsToMoney(toCents(user.balance) + toCents(request.amount));
    user.balance = newBalance;
    await userRepository.save(user);

    const transaction = transactionRepository.create({
      user: { id: user.id } as User,
      type: TransactionType.TOPUP,
      amount: request.amount,
      balanceAfter: newBalance,
      description: `Top-up request approved: ${request.referenceNumber}`,
      referenceType: 'TOPUP_REQUEST',
      referenceId: request.id,
    });
    await transactionRepository.save(transaction);

    request.status = TopupStatus.APPROVED;
    request.reviewedBy = { id: reviewerId } as User;
    request.reviewedAt = new Date();
    request.rejectReason = null;
    await requestRepository.save(request);

    await notify(user.id, 'Top-up approved', `Your balance was topped up by ${request.amount}`, manager);

    return {
      message: 'Top-up request approved',
      request_id: request.id,
    };
  });
}

export async function rejectTopupRequest(topupRequestId: number, reviewerId: number, reason: string) {
  return AppDataSource.transaction(async (manager) => {
    const requestRepository = manager.getRepository(TopupRequest);
    const request = await requestRepository.findOne({
      where: { id: topupRequestId },
      relations: { user: true, reviewedBy: true },
      lock: { mode: 'pessimistic_write' },
    });

    if (!request) {
      throw new AppError(404, 'Top-up request not found');
    }

    if (request.status !== TopupStatus.PENDING) {
      throw new AppError(400, 'Top-up request is not pending');
    }

    request.status = TopupStatus.REJECTED;
    request.reviewedBy = { id: reviewerId } as User;
    request.reviewedAt = new Date();
    request.rejectReason = reason;
    await requestRepository.save(request);

    await notify(request.user.id, 'Top-up rejected', `Your top-up request was rejected: ${reason}`, manager);

    return {
      message: 'Top-up request rejected',
      request_id: request.id,
    };
  });
}

export async function listUsers(search?: string) {
  const repository = AppDataSource.getRepository(User);
  const users = await repository.find({
    where: search
      ? [
          { username: Like(`%${search}%`) },
          { fullName: Like(`%${search}%`) },
        ]
      : undefined,
    order: { createdAt: 'DESC', id: 'DESC' },
  });

  return users.map(mapUser);
}

export async function setUserActive(userId: number, isActive: boolean) {
  const repository = AppDataSource.getRepository(User);
  const user = await requireNonAdminUser(userId);
  user.isActive = isActive;
  return mapUser(await repository.save(user));
}

export async function resetUserDevice(userId: number) {
  const repository = AppDataSource.getRepository(User);
  const user = await requireNonAdminUser(userId);
  user.deviceId = null;
  return mapUser(await repository.save(user));
}

export async function adjustBalance(userId: number, amount: string, description: string) {
  return AppDataSource.transaction(async (manager) => {
    const userRepository = manager.getRepository(User);
    const transactionRepository = manager.getRepository(Transaction);

    const user = await userRepository.findOne({
      where: { id: userId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const newBalanceCents = toCents(user.balance) + toCents(amount);
    if (newBalanceCents < 0n) {
      throw new AppError(400, 'Balance cannot go below zero');
    }

    const newBalance = centsToMoney(newBalanceCents);
    user.balance = newBalance;
    await userRepository.save(user);

    await transactionRepository.save(
      transactionRepository.create({
        user: { id: user.id } as User,
        type: TransactionType.TOPUP,
        amount,
        balanceAfter: newBalance,
        description,
        referenceType: 'ADMIN_ADJUSTMENT',
        referenceId: null,
      }),
    );

    return {
      message: 'Balance updated successfully',
      balance: newBalance,
    };
  });
}

export async function createNotifications(input: { all?: boolean; user_id?: number; title: string; body: string }) {
  return AppDataSource.transaction(async (manager) => {
    const userRepository = manager.getRepository(User);
    const notificationRepository = manager.getRepository(Notification);

    const targetUsers = input.all
      ? await userRepository.find({ select: { id: true } })
      : input.user_id
        ? await userRepository.find({ where: { id: input.user_id }, select: { id: true } })
        : [];

    if (!input.all && targetUsers.length === 0) {
      throw new AppError(404, 'User not found');
    }

    const notifications = targetUsers.map((user) =>
      notificationRepository.create({
        user: { id: user.id } as User,
        title: input.title,
        body: input.body,
        isRead: false,
      }),
    );

    await notificationRepository.save(notifications);

    return {
      message: 'Notification sent successfully',
      count: notifications.length,
    };
  });
}

export async function getTopupRequestById(id: number) {
  const request = await findTopupRequestOrFail(id);
  return mapTopupRequest(request);
}

export async function createTeacher(input: { username: string; full_name: string; password: string }) {
  const userRepository = AppDataSource.getRepository(User);
  const existing = await userRepository.findOne({ where: { username: input.username } });

  if (existing) {
    throw new AppError(409, 'Username already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const teacher = userRepository.create({
    username: input.username,
    fullName: input.full_name,
    passwordHash,
    role: UserRole.TEACHER,
    isActive: true,
    balance: '0.00',
    deviceId: null,
  });

  const saved = await userRepository.save(teacher);
  return mapUser(saved);
}

function buildTeacherAggregateQuery(from?: string, to?: string) {
  const purchaseAgg = AppDataSource.createQueryBuilder()
    .from(Purchase, 'purchase')
    .innerJoin('purchase.course', 'course')
    .select('course.teacher_id', 'teacher_id')
    .addSelect('COUNT(purchase.id)', 'purchases_count')
    .addSelect('COALESCE(SUM(purchase.teacher_share), 0)', 'total_earned')
    .where('course.teacher_id IS NOT NULL');

  const payoutAgg = AppDataSource.createQueryBuilder()
    .from(TeacherPayout, 'payout')
    .select('payout.teacher_id', 'teacher_id')
    .addSelect('COALESCE(SUM(payout.amount), 0)', 'total_paid');

  addDateFilter(purchaseAgg, 'purchase', from, to);
  addDateFilter(payoutAgg, 'payout', from, to);

  purchaseAgg.groupBy('course.teacher_id');
  payoutAgg.groupBy('payout.teacher_id');

  return { purchaseAgg, payoutAgg };
}

async function loadTeacherRows(from?: string, to?: string) {
  const { purchaseAgg, payoutAgg } = buildTeacherAggregateQuery(from, to);

  return AppDataSource.getRepository(User)
    .createQueryBuilder('teacher')
    .select('teacher.id', 'teacher_id')
    .addSelect('teacher.username', 'username')
    .addSelect('teacher.full_name', 'full_name')
    .addSelect('COALESCE(purchases.purchases_count, 0)', 'purchases_count')
    .addSelect('COALESCE(purchases.total_earned, 0)', 'total_earned')
    .addSelect('COALESCE(payouts.total_paid, 0)', 'total_paid')
    .leftJoin(`(${purchaseAgg.getQuery()})`, 'purchases', 'purchases.teacher_id = teacher.id')
    .leftJoin(`(${payoutAgg.getQuery()})`, 'payouts', 'payouts.teacher_id = teacher.id')
    .setParameters({ ...purchaseAgg.getParameters(), ...payoutAgg.getParameters() })
    .where('teacher.role = :role', { role: UserRole.TEACHER })
    .orderBy('teacher.id', 'ASC')
    .getRawMany();
}

export async function listTeachers() {
  return (await loadTeacherRows()).map(mapTeacherAggregate);
}

export async function payoutTeacher(teacherId: number, createdById: number, amount: string, note?: string | null) {
  return AppDataSource.transaction(async (manager) => {
    const userRepository = manager.getRepository(User);
    const payoutRepository = manager.getRepository(TeacherPayout);

    const teacher = await userRepository.findOne({
      where: { id: teacherId, role: UserRole.TEACHER },
      lock: { mode: 'pessimistic_write' },
    });

    if (!teacher) {
      throw new AppError(404, 'Teacher not found');
    }

    const earnedRow = await manager
      .getRepository(Purchase)
      .createQueryBuilder('purchase')
      .innerJoin('purchase.course', 'course')
      .select('COALESCE(SUM(purchase.teacher_share), 0)', 'total_earned')
      .where('course.teacher_id = :teacherId', { teacherId })
      .getRawOne<{ total_earned: string }>();

    const paidRow = await manager
      .getRepository(TeacherPayout)
      .createQueryBuilder('payout')
      .select('COALESCE(SUM(payout.amount), 0)', 'total_paid')
      .where('payout.teacher_id = :teacherId', { teacherId })
      .getRawOne<{ total_paid: string }>();

    const totalEarned = String(earnedRow?.total_earned ?? '0.00');
    const totalPaid = String(paidRow?.total_paid ?? '0.00');
    const remaining = toCents(totalEarned) - toCents(totalPaid);

    if (toCents(amount) > remaining) {
      throw new AppError(400, 'Payout amount exceeds remaining balance');
    }

    const payout = payoutRepository.create({
      teacher: { id: teacher.id } as User,
      amount,
      note: note ?? null,
      createdBy: { id: createdById } as User,
    });

    const saved = await payoutRepository.save(payout);
    return {
      id: saved.id,
      teacher_id: teacher.id,
      amount: saved.amount,
      note: saved.note,
      created_by: saved.createdBy.id,
      created_at: saved.createdAt,
    };
  });
}

export async function listTeacherPayouts(teacherId: number) {
  const payouts = await AppDataSource.getRepository(TeacherPayout).find({
    where: { teacher: { id: teacherId } },
    relations: { createdBy: true },
    order: { createdAt: 'DESC', id: 'DESC' },
  });

  return payouts.map((payout) => ({
    id: payout.id,
    teacher_id: teacherId,
    amount: payout.amount,
    note: payout.note,
    created_by: payout.createdBy.id,
    created_at: payout.createdAt,
  }));
}

export async function resetPassword(userId: number, newPassword: string) {
  const user = await requireNonAdminUser(userId);
  const passwordHash = await bcrypt.hash(newPassword, 12);
  user.passwordHash = passwordHash;
  await AppDataSource.getRepository(User).save(user);
  return { message: 'Password reset successfully' };
}

export async function overviewStats(from?: string, to?: string) {
  const userRepo = AppDataSource.getRepository(User);
  const courseRepo = AppDataSource.getRepository(Course);
  const purchaseRepo = AppDataSource.getRepository(Purchase);
  const topupRepo = AppDataSource.getRepository(TopupRequest);

  const studentsCountQuery = userRepo.createQueryBuilder('user').select('COUNT(user.id)', 'count').where('user.role = :role', { role: UserRole.STUDENT });
  const teachersCountQuery = userRepo.createQueryBuilder('user').select('COUNT(user.id)', 'count').where('user.role = :role', { role: UserRole.TEACHER });
  const coursesCountQuery = courseRepo.createQueryBuilder('course').select('COUNT(course.id)', 'count');
  const purchasesCountQuery = purchaseRepo.createQueryBuilder('purchase').select('COUNT(purchase.id)', 'count');
  const totalSalesQuery = purchaseRepo.createQueryBuilder('purchase').select('COALESCE(SUM(purchase.pricePaid), 0)', 'amount');
  const totalTopupsQuery = topupRepo.createQueryBuilder('request').select('COALESCE(SUM(request.amount), 0)', 'amount').where('request.status = :status', { status: TopupStatus.APPROVED });
  const pendingTopupsQuery = topupRepo.createQueryBuilder('request').select('COUNT(request.id)', 'count').where('request.status = :status', { status: TopupStatus.PENDING });
  const totalBalanceQuery = userRepo.createQueryBuilder('user').select('COALESCE(SUM(user.balance), 0)', 'amount').where('user.role = :role', { role: UserRole.STUDENT });

  addDateFilter(studentsCountQuery, 'user', from, to);
  addDateFilter(teachersCountQuery, 'user', from, to);
  addDateFilter(coursesCountQuery, 'course', from, to);
  addDateFilter(purchasesCountQuery, 'purchase', from, to);
  addDateFilter(totalSalesQuery, 'purchase', from, to);
  if (from) {
    pendingTopupsQuery.andWhere('request.created_at >= :from', { from });
  }
  if (to) {
    pendingTopupsQuery.andWhere('request.created_at <= :to', { to });
  }
  if (from) {
    totalTopupsQuery.andWhere('request.reviewed_at >= :from', { from });
  }
  if (to) {
    totalTopupsQuery.andWhere('request.reviewed_at <= :to', { to });
  }
  addDateFilter(totalBalanceQuery, 'user', from, to);

  const [studentsCount, teachersCount, coursesCount, purchasesCount, salesRow, topupRow, pendingRow, balanceRow] = await Promise.all([
    studentsCountQuery.getRawOne<{ count: string }>(),
    teachersCountQuery.getRawOne<{ count: string }>(),
    coursesCountQuery.getRawOne<{ count: string }>(),
    purchasesCountQuery.getRawOne<{ count: string }>(),
    totalSalesQuery.getRawOne<{ amount: string }>(),
    totalTopupsQuery.getRawOne<{ amount: string }>(),
    pendingTopupsQuery.getRawOne<{ count: string }>(),
    totalBalanceQuery.getRawOne<{ amount: string }>(),
  ]);

  return {
    students_count: Number(studentsCount?.count ?? 0),
    teachers_count: Number(teachersCount?.count ?? 0),
    courses_count: Number(coursesCount?.count ?? 0),
    purchases_count: Number(purchasesCount?.count ?? 0),
    total_sales_amount: String(salesRow?.amount ?? '0.00'),
    total_topups_amount: String(topupRow?.amount ?? '0.00'),
    pending_topups_count: Number(pendingRow?.count ?? 0),
    total_students_balance: String(balanceRow?.amount ?? '0.00'),
  };
}

function buildDateSeries(start: Date, end: Date) {
  const series: string[] = [];
  const current = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  const finalDate = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));

  while (current <= finalDate) {
    series.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return series;
}

export async function salesStats(days: number, from?: string, to?: string) {
  const endDate = to ? new Date(to) : new Date();
  const startDate = from ? new Date(from) : new Date(endDate);
  if (!from) {
    startDate.setUTCDate(startDate.getUTCDate() - (days - 1));
  }

  const rows = await AppDataSource.getRepository(Purchase)
    .createQueryBuilder('purchase')
    .select("DATE_FORMAT(purchase.created_at, '%Y-%m-%d')", 'date')
    .addSelect('COUNT(purchase.id)', 'purchases_count')
    .addSelect('COALESCE(SUM(purchase.pricePaid), 0)', 'amount')
    .where('purchase.created_at >= :from', { from: startDate.toISOString() })
    .andWhere('purchase.created_at <= :to', { to: endDate.toISOString() })
    .groupBy('date')
    .orderBy('date', 'ASC')
    .getRawMany<{ date: string; purchases_count: string; amount: string }>();

  const rowMap = new Map(rows.map((row) => [row.date, row]));
  return buildDateSeries(startDate, endDate).map((date) => {
    const row = rowMap.get(date);
    return {
      date,
      purchases_count: Number(row?.purchases_count ?? 0),
      amount: String(row?.amount ?? '0.00'),
    };
  });
}

export async function topCoursesStats(limit: number, from?: string, to?: string) {
  const query = AppDataSource.getRepository(Purchase)
    .createQueryBuilder('purchase')
    .innerJoin('purchase.course', 'course')
    .leftJoin('course.teacher', 'teacher')
    .select('course.id', 'course_id')
    .addSelect('course.name', 'name')
    .addSelect('teacher.full_name', 'teacher_name')
    .addSelect('COUNT(purchase.id)', 'purchases_count')
    .addSelect('COALESCE(SUM(purchase.pricePaid), 0)', 'revenue')
    .groupBy('course.id')
    .orderBy('purchases_count', 'DESC')
    .addOrderBy('course.id', 'ASC')
    .limit(limit);

  addDateFilter(query, 'purchase', from, to);

  const rows = await query.getRawMany<{ course_id: string; name: string; teacher_name: string | null; purchases_count: string; revenue: string }>();

  return rows.map((row) => ({
    course_id: Number(row.course_id),
    name: row.name,
    teacher_name: row.teacher_name,
    purchases_count: Number(row.purchases_count),
    revenue: String(row.revenue ?? '0.00'),
  }));
}

export async function bySpecializationStats(from?: string, to?: string) {
  const query = AppDataSource.getRepository(Purchase)
    .createQueryBuilder('purchase')
    .innerJoin('purchase.course', 'course')
    .innerJoin('course.specialization', 'specialization')
    .select('specialization.id', 'specialization_id')
    .addSelect('specialization.name', 'name')
    .addSelect('COUNT(purchase.id)', 'purchases_count')
    .addSelect('COALESCE(SUM(purchase.pricePaid), 0)', 'revenue')
    .groupBy('specialization.id')
    .orderBy('purchases_count', 'DESC')
    .addOrderBy('specialization.id', 'ASC');

  addDateFilter(query, 'purchase', from, to);

  const rows = await query.getRawMany<{ specialization_id: string; name: string; purchases_count: string; revenue: string }>();

  return rows.map((row) => ({
    specialization_id: Number(row.specialization_id),
    name: row.name,
    purchases_count: Number(row.purchases_count),
    revenue: String(row.revenue ?? '0.00'),
  }));
}

export async function teachersStats(from?: string, to?: string) {
  return (await loadTeacherRows(from, to)).map(mapTeacherAggregate);
}

export async function teacherPayoutHistory(teacherId: number) {
  return listTeacherPayouts(teacherId);
}
