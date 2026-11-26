import { z } from 'zod';

import { LectureType } from '../../entities/enums';
import { idParamSchema } from '../../utils/requestSchemas';

export const teacherCourseIdParamSchema = idParamSchema;
export const teacherLectureIdParamSchema = idParamSchema;

const urlSchema = z
  .string()
  .trim()
  .max(5000)
  .optional()
  .nullable()
  .refine(
    (value) => !value || /^https?:\/\/.+/.test(value),
    'URL must start with http:// or https://',
  );

export const teacherLectureCreateSchema = z
  .object({
    title: z.string().trim().min(1).max(150).optional(),
    type: z.nativeEnum(LectureType).optional(),
    url: urlSchema,
    content: z.string().trim().max(50000).optional().nullable(),
    sort_order: z.coerce.number().int().min(0).optional(),
    source_lecture_id: z.coerce.number().int().positive().optional(),
  })
  .strict()
  .refine((value) => value.source_lecture_id !== undefined || (value.title !== undefined && value.type !== undefined), {
    message: 'title and type are required unless source_lecture_id is provided',
  });

export const teacherLectureUpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(150).optional(),
    type: z.nativeEnum(LectureType).optional(),
    url: urlSchema,
    content: z.string().trim().max(50000).optional().nullable(),
    sort_order: z.coerce.number().int().min(0).optional(),
  })
  .strict();

export const teacherStatsQuerySchema = z
  .object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  })
  .strict();
