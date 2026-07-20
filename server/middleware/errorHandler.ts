/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[errorHandler] Centralized Exception Caught:', err.message || err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected server error occurred.';
  
  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    }
  });
}
