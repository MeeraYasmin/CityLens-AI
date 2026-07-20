/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import apiRouter from './server/routes/api';
import { errorHandler } from './server/middleware/errorHandler';
import { rateLimiter } from './server/middleware/rateLimiter';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body-parsers supporting massive photographic base64 payloads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Basic request logger for backend observability
  app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.originalUrl}`);
    next();
  });

  // Clean Production-Ready health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'CityLens AI Full-Stack Platform',
      timestamp: new Date().toISOString(),
    });
  });

  // Apply rate limiter to all API endpoints
  app.use('/api', rateLimiter);

  // Mount modular API routing paths
  app.use('/api', apiRouter);

  // Centralized Error-Catching Middleware
  app.use(errorHandler);

  // Manage Vite Asset Serving & Routing Fallbacks
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Server] Launching Vite development middleware layer');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('[Server] Serving production compiled client static assets');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] CityLens AI Full-Stack Server booted at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Critical Bootstrapping Crash:', err);
  process.exit(1);
});
