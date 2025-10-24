import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  status?: number;
  details?: unknown;
}

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const error: ApiError = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

export const errorHandler = (
  error: ApiError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  const status = error.status ?? 500;
  res.status(status).json({
    error: {
      message: error.message || 'Internal Server Error',
      details: error.details ?? undefined,
    },
  });
};
