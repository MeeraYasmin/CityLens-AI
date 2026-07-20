/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  timestamps: number[];
}

const windowMs = 60 * 1000; // 1 minute window
const maxRequests = 100; // max 100 requests per IP per minute
const ipRecords = new Map<string, RateLimitRecord>();

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown-ip';
  const now = Date.now();

  let record = ipRecords.get(ip);
  if (!record) {
    record = { timestamps: [] };
    ipRecords.set(ip, record);
  }

  // Filter out timestamps older than the window
  record.timestamps = record.timestamps.filter(ts => now - ts < windowMs);

  if (record.timestamps.length >= maxRequests) {
    console.warn(`[rateLimiter] IP ${ip} has exceeded the rate limit threshold.`);
    return res.status(429).json({
      error: {
        message: 'Too many requests from this client. Please slow down and try again in a minute.',
        statusCode: 429,
        timestamp: new Date().toISOString()
      }
    });
  }

  record.timestamps.push(now);
  next();
}
