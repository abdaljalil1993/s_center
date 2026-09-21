import { AppDataSource } from '../../config/data-source';
import { Course } from '../../entities/Course';
import { Lecture } from '../../entities/Lecture';
import { TeacherPayout } from '../../entities/TeacherPayout';
import { LectureType } from '../../entities/enums';
import { User } from '../../entities/User';
import { AppError } from '../../utils/AppError';
import { centsToMoney, toCents } from '../../utils/money';

function toNumber(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    return Number(value);
  }
  return 0;
}

function toMoney(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '0.00';
  }
  return String(value);
}

async function assertOwnedCourse(courseId: number, teacherId: number) {
  const course = await AppDataSource.getRepository(Course).findOne({
    where: { id: courseId, teacher: { id: teacherId } },
    relations: { teacher: true, specialization: true },
  });

  if (!course) {
    throw new AppError(403, 'Access denied');
  }

  return course;
}

async function assertOwnedLecture(lectureId: number, teacherId: number) {
  const lecture = await AppDataSource.getRepository(Lecture).findOne({
    where: { id: lectureId },
    relations: { course: { teacher: true, specialization: true }, createdBy: true },
  });

  if (!lecture || lecture.course.teacher?.id !== teacherId) {
    throw new AppError(403, 'Access denied');
  }

  return lecture;
}

function mapCourseRow(row: Record<string, unknown>) {
  return {
    course_id: toNumber(row.course_id),
    name: String(row.name ?? ''),
    year: toNumber(row.year),
    description: row.description === null ? null : row.description ?? null,
    price: toMoney(row.price),
    is_published: Boolean(row.is_published),
    sort_order: toNumber(row.sort_order),
    purchases_count: toNumber(row.purchases_count),
    earned: toMoney(row.earned),
  };
}

function mapLecture(lecture: Lecture) {
  return {
    id: lecture.id,
    course_id: lecture.course.id,
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

function mapPayout(payout: TeacherPayout) {
  return {
    id: payout.id,
    amount: payout.amount,
    note: payout.note,
    created_by: payout.createdBy.id,
    created_at: payout.createdAt,
  };
}

export async function listMyCourses(teacherId: number) {
  const rows = await AppDataSource.getRepository(Course)
    .createQueryBuilder('course')
    .leftJoin('course.purchases', 'purchase')
    .select('course.id', 'course_id')
    .addSelect('course.name', 'name')
    .addSelect('course.year', 'year')
    .addSelect('course.description', 'description')
    .addSelect('course.price', 'price')
    .addSelect('course.isPublished', 'is_published')
    .addSelect('course.sortOrder', 'sort_order')
    .addSelect('COUNT(purchase.id)', 'purchases_count')
    .addSelect('COALESCE(SUM(purchase.teacherShare), 0)', 'earned')
    .where('course.teacher_id = :teacherId', { teacherId })
    .groupBy('course.id')
    .orderBy('course.sortOrder', 'ASC')
    .addOrderBy('course.id', 'ASC')
    .getRawMany();

  return rows.map(mapCourseRow);
}

export async function listCourseLectures(teacherId: number, courseId: number) {
  await assertOwnedCourse(courseId, teacherId);

  const lectures = await AppDataSource.getRepository(Lecture).find({
    where: { course: { id: courseId } },
    relations: { course: true, createdBy: true },
    order: { sortOrder: 'ASC', id: 'ASC' },
  });

  return lectures.map(mapLecture);
}

export async function createLectureForTeacher(
  teacherId: number,
  courseId: number,
  input: { title: string; type: LectureType; url?: string | null; content?: string | null; sort_order?: number },
) {
  const course = await assertOwnedCourse(courseId, teacherId);
  const repository = AppDataSource.getRepository(Lecture);
  const lecture = repository.create({
    course,
    createdBy: { id: teacherId } as User,
    title: input.title,
    type: input.type,
    url: input.url ?? null,
    content: input.content ?? null,
    isPublished: true,
    sortOrder: input.sort_order ?? 0,
  });

  return mapLecture(await repository.save(lecture));
}

export async function updateTeacherLecture(
  teacherId: number,
  lectureId: number,
  input: Partial<{ title: string; type: LectureType; url: string | null; content: string | null; sort_order: number }>,
) {
  const repository = AppDataSource.getRepository(Lecture);
  const lecture = await assertOwnedLecture(lectureId, teacherId);

  if (input.title !== undefined) lecture.title = input.title;
  if (input.type !== undefined) lecture.type = input.type;
  if (input.url !== undefined) lecture.url = input.url;
  if (input.content !== undefined) lecture.content = input.content;
  if (input.sort_order !== undefined) lecture.sortOrder = input.sort_order;

  return mapLecture(await repository.save(lecture));
}

export async function archiveTeacherLecture(teacherId: number, lectureId: number) {
  const repository = AppDataSource.getRepository(Lecture);
  const lecture = await assertOwnedLecture(lectureId, teacherId);
  lecture.isPublished = false;
  return mapLecture(await repository.save(lecture));
}

export async function getTeacherStats(teacherId: number) {
  const [courses, payoutRow] = await Promise.all([
    AppDataSource.getRepository(Course)
      .createQueryBuilder('course')
      .leftJoin('course.purchases', 'purchase')
      .select('course.id', 'course_id')
      .addSelect('course.name', 'name')
      .addSelect('COUNT(purchase.id)', 'purchases_count')
      .addSelect('COALESCE(SUM(purchase.teacherShare), 0)', 'earned')
      .where('course.teacher_id = :teacherId', { teacherId })
      .groupBy('course.id')
      .orderBy('course.sortOrder', 'ASC')
      .addOrderBy('course.id', 'ASC')
      .getRawMany(),
    AppDataSource.getRepository(TeacherPayout)
      .createQueryBuilder('payout')
      .select('COALESCE(SUM(payout.amount), 0)', 'total_paid')
      .where('payout.teacher_id = :teacherId', { teacherId })
      .getRawOne(),
  ]);

  let totalPurchases = 0;
  let totalEarnedCents = 0n;

  const mappedCourses = courses.map((row) => {
    const purchasesCount = toNumber(row.purchases_count);
    const earned = toMoney(row.earned);
    totalPurchases += purchasesCount;
    totalEarnedCents += toCents(earned);
    return {
      course_id: toNumber(row.course_id),
      name: String(row.name ?? ''),
      purchases_count: purchasesCount,
      earned,
    };
  });

  const totalPaid = toMoney(payoutRow?.total_paid);
  const remaining = centsToMoney(totalEarnedCents - toCents(totalPaid));

  return {
    total_purchases: totalPurchases,
    total_earned: centsToMoney(totalEarnedCents),
    total_paid: totalPaid,
    remaining,
    courses: mappedCourses,
  };
}

export async function listTeacherPayouts(teacherId: number) {
  const payouts = await AppDataSource.getRepository(TeacherPayout).find({
    where: { teacher: { id: teacherId } },
    relations: { createdBy: true },
    order: { createdAt: 'DESC', id: 'DESC' },
  });

  return payouts.map(mapPayout);
}
