import { Router } from 'express';

import { authMiddleware } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/role';
import { validate } from '../../middlewares/validate';
import { UserRole } from '../../entities/enums';
import {
  teacherCourseIdParamSchema,
  teacherLectureCreateSchema,
  teacherLectureIdParamSchema,
  teacherLectureUpdateSchema,
  teacherStatsQuerySchema,
} from './schemas';
import {
  deleteTeacherLecture,
  getTeacherCourseLectures,
  getTeacherCourses,
  getTeacherPayouts,
  getTeacherStatsController,
  patchTeacherLecture,
  postTeacherLecture,
} from './controller';

export const teacherRoutes = Router();

teacherRoutes.use(authMiddleware, requireRole(UserRole.TEACHER));

teacherRoutes.get('/courses', getTeacherCourses);
teacherRoutes.get('/courses/:id/lectures', validate({ params: teacherCourseIdParamSchema }), getTeacherCourseLectures);
teacherRoutes.post('/courses/:id/lectures', validate({ params: teacherCourseIdParamSchema, body: teacherLectureCreateSchema }), postTeacherLecture);
teacherRoutes.patch('/lectures/:id', validate({ params: teacherLectureIdParamSchema, body: teacherLectureUpdateSchema }), patchTeacherLecture);
teacherRoutes.delete('/lectures/:id', validate({ params: teacherLectureIdParamSchema }), deleteTeacherLecture);
teacherRoutes.get('/stats', validate({ query: teacherStatsQuerySchema }), getTeacherStatsController);
teacherRoutes.get('/payouts', getTeacherPayouts);
