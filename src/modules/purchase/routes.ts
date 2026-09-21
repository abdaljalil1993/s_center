import { Router } from 'express';

import { authMiddleware } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { purchaseCourseParamSchema } from './schemas';
import { buyCourse, myCourses, myPayments } from './controller';

export const purchaseRoutes = Router();

purchaseRoutes.post('/courses/:id/purchase', authMiddleware, validate({ params: purchaseCourseParamSchema }), buyCourse);
purchaseRoutes.get('/me/courses', authMiddleware, myCourses);
purchaseRoutes.get('/me/payments', authMiddleware, myPayments);
