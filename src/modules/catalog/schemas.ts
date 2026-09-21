import { z } from 'zod';

import { idParamSchema } from '../../utils/requestSchemas';

export const coursesQuerySchema = z
  .object({
    specializationId: z.coerce.number().int().positive().optional(),
    year: z.coerce.number().int().min(1).max(5).optional(),
  })
  .strict();

export const courseIdParamSchema = idParamSchema;
export const lecturesParamSchema = idParamSchema;
