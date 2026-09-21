import { Router } from 'express';

import { UserRole } from '../../entities/enums';
import { requireRole } from '../../middlewares/role';
import { validate } from '../../middlewares/validate';
import { panelFlash } from '../middlewares/flash';
import { panelAuth } from '../middlewares/panelAuth';
import { teacherCourseIdParamSchema, teacherLectureCreateSchema, teacherLectureIdParamSchema, teacherLectureUpdateSchema } from '../schemas/teacher.schema';
import { coursesPage, createLectureAction, earningsPage, hideLectureAction, lecturesPage, rootTeacherRedirect, updateLectureAction } from '../controllers/teacher.controller';

export const panelTeacherRoutes = Router();

panelTeacherRoutes.use(panelFlash, panelAuth, requireRole(UserRole.TEACHER));

panelTeacherRoutes.get('/', rootTeacherRedirect);
panelTeacherRoutes.get('/courses', coursesPage);
panelTeacherRoutes.get('/lectures', lecturesPage);
panelTeacherRoutes.get('/earnings', earningsPage);
panelTeacherRoutes.post('/courses/:id/lectures', validate({ params: teacherCourseIdParamSchema, body: teacherLectureCreateSchema }), createLectureAction);
panelTeacherRoutes.post('/lectures/:id', validate({ params: teacherLectureIdParamSchema, body: teacherLectureUpdateSchema }), updateLectureAction);
panelTeacherRoutes.post('/lectures/:id/hide', validate({ params: teacherLectureIdParamSchema }), hideLectureAction);
