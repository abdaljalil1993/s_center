import { z } from 'zod';

import { LectureType } from '../../entities/enums';
import { idParamSchema } from '../../utils/requestSchemas';

export const teacherCourseIdParamSchema = idParamSchema;
export const teacherLectureIdParamSchema = idParamSchema;

export const teacherLectureCreateSchema = z
  .object({
    title: z.string().trim().min(1).max(150),
    type: z.nativeEnum(LectureType),
    url: z.string().trim().max(5000).optional().nullable(),
    content: z.string().trim().max(50000).optional().nullable(),
    sort_order: z.coerce.number().int().min(0).optional(),
  })
  .strict();

export const teacherLectureUpdateSchema = teacherLectureCreateSchema.partial().strict();

export const teacherStatsQuerySchema = z
  .object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  })
  .strict();
