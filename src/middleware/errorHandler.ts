import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('\x1b[31m%s\x1b[0m', `🔥 [Error Handler] Error occurred: ${err.message || err}`);
  if (err.stack) {
    console.error(err.stack);
  }

  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
};
