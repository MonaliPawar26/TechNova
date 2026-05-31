import { Request, Response, NextFunction } from 'express';

const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 120; // max requests per minute

export const rateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  const clientData = ipRequestCounts.get(ip);

  if (!clientData) {
    ipRequestCounts.set(ip, {
      count: 1,
      resetTime: now + WINDOW_MS
    });
    next();
    return;
  }

  if (now > clientData.resetTime) {
    // Reset window
    clientData.count = 1;
    clientData.resetTime = now + WINDOW_MS;
    next();
    return;
  }

  clientData.count += 1;
  if (clientData.count > MAX_REQUESTS) {
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.'
    });
    return;
  }

  next();
};
