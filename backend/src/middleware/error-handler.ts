import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { appLogger } from '../packages/logger';

export interface IAppError extends Error {
  statusCode: number;
  code: string;
}

export class AppError extends Error implements IAppError {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_SERVER_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  appLogger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    statusCode: err instanceof AppError ? err.statusCode : 500,
    code: err instanceof AppError ? err.code : 'INTERNAL_SERVER_ERROR',
  });

  // Handle MongoDB duplicate key errors
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    res.status(409).json({
      error: 'Conflict',
      code: 'DUPLICATE_KEY',
      message: 'A record with this ID already exists',
    });
    return;
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    res.status(400).json({
      error: 'Bad Request',
      code: 'VALIDATION_ERROR',
      message: err.message,
    });
    return;
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.name,
      code: err.code,
      message: err.message,
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    error: 'Internal Server Error',
    code: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
  });
};
