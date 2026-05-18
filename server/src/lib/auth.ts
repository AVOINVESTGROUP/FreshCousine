import { NextFunction, Request, Response } from 'express';
import { AppError, ERROR_CODES } from './errors.js';

export interface AuthRequest extends Request {
  userId: string;
  role: string;
}

export function authenticate(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = req.header('x-user-id');
    const userRole = req.header('x-user-role') || 'customer';

    if (!userId) {
      return next(new AppError(ERROR_CODES.UNAUTHORIZED, 401, 'errors.unauthorized', 'Missing authentication header'));
    }

    if (userRole !== role && role !== 'customer' && userRole !== role) {
      return next(new AppError(ERROR_CODES.UNAUTHORIZED, 403, 'errors.forbidden', 'Insufficient permissions'));
    }

    (req as AuthRequest).userId = userId;
    (req as AuthRequest).role = userRole;
    next();
  };
}
