import { NextFunction, Request, Response } from 'express';
import { AppError } from './errors.js';

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      ok: false,
      error: {
        code: err.name,
        messageKey: err.messageKey,
        message: err.message,
        details: err.details
      }
    });
  }

  console.error(err);
  res.status(500).json({
    ok: false,
    error: {
      code: 'INTERNAL_ERROR',
      messageKey: 'errors.internalServerError',
      message: 'Internal server error'
    }
  });
}
