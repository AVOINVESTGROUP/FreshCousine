import { AnyZodObject } from 'zod';
import { NextFunction, Request, Response } from 'express';
import { AppError, ERROR_CODES } from './errors.js';

export function validate(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new AppError(ERROR_CODES.INVALID_INPUT, 400, 'errors.invalidInput', 'Invalid request body', result.error.format()));
    }
    req.body = result.data;
    next();
  };
}
