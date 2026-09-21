import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';

import { AppError } from '../utils/AppError';

type ValidationSchemas = {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
};

export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    for (const key of ['body', 'query', 'params'] as const) {
      const schema = schemas[key];
      if (!schema) {
        continue;
      }

      const source = key === 'body' && req.body && typeof req.body === 'object' ? { ...(req.body as Record<string, unknown>) } : req[key];
      if (key === 'body' && source && typeof source === 'object') {
        delete (source as Record<string, unknown>).csrf_token;
      }

      const result = schema.safeParse(source);
      if (!result.success) {
        const message = result.error.issues.map((issue) => issue.message).join(', ');
        return next(new AppError(400, message || 'Validation failed'));
      }

      req[key] = result.data as never;
    }

    next();
  };
}
