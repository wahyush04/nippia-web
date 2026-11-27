import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';
import { requestIdAndLoggerMiddleware } from './lib/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { pingRealtimeRedis } from './services/realtime.service.js';
import { authRouter } from './routes/auth.routes.js';
import { dashboardRouter } from './routes/dashboard.routes.js';
import { practiceRouter } from './routes/practice.routes.js';
import { examRouter } from './routes/exam.routes.js';
import { analyticsRouter } from './routes/analytics.routes.js';
import { adminRouter } from './routes/admin.routes.js';
import { liveEventsRouter } from './routes/live-events.routes.js';
import { adminLiveEventsRouter } from './routes/admin-live-events.routes.js';
import { subscriptionRouter } from './routes/subscription.routes.js';
import { partnerRouter } from './routes/partner.routes.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  if (env.trustProxy) {
    app.set('trust proxy', 1);
  }

  app.use(requestIdAndLoggerMiddleware);
  app.use(
    helmet({
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    }),
  );

  const allowedOrigins = env.corsOrigin
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(null, false);
      },
      credentials: true,
    }),
  );

  // Admin question bulk-import supports larger payloads; all other JSON routes bounded to 1mb
  app.use('/api/v1/admin', express.json({ limit: '5mb' }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: { code: 'RATE_LIMITED', message: 'Terlalu banyak permintaan. Coba lagi sebentar.' },
    },
  });

  const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.nodeEnv === 'test' ? 500 : 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'AUTH_RATE_LIMITED',
        message: 'Terlalu banyak percobaan autentikasi. Silakan tunggu beberapa menit.',
      },
    },
  });

  app.use('/api', apiLimiter);
  app.use(
    [
      '/api/v1/auth/login',
      '/api/v1/auth/register',
      '/api/v1/auth/forgot-password',
      '/api/v1/auth/reset-password',
      '/api/v1/auth/google',
      '/api/v1/auth/refresh',
    ],
    authRateLimiter,
  );

  app.get('/api/health', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({
        success: true,
        data: {
          service: 'Nippia SKD Master API',
          status: 'ok',
          database: 'connected',
          timestamp: new Date().toISOString(),
        },
      });
    } catch {
      res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Koneksi database tidak tersedia.',
        },
      });
    }
  });

  app.get('/api/ready', async (_req, res) => {
    const checks: { database: string; redis?: string } = { database: 'down' };
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = 'ok';
      if (env.redisUrl) {
        checks.redis = (await pingRealtimeRedis()) ? 'ok' : 'degraded';
      }
      res.json({
        success: true,
        data: {
          service: 'Nippia SKD Master API',
          ready: true,
          checks,
          timestamp: new Date().toISOString(),
        },
      });
    } catch {
      res.status(503).json({
        success: false,
        error: {
          code: 'NOT_READY',
          message: 'Layanan belum siap menerima trafik.',
          details: checks,
        },
      });
    }
  });

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/dashboard', dashboardRouter);
  app.use('/api/v1/practice', practiceRouter);
  app.use('/api/v1/exams', examRouter);
  app.use('/api/v1/analytics', analyticsRouter);
  app.use('/api/v1/live-events', liveEventsRouter);
  app.use('/api/live-events', liveEventsRouter);
  app.use('/api/v1/admin/live-events', adminLiveEventsRouter);
  app.use('/api/admin/live-events', adminLiveEventsRouter);
  app.use('/api/v1/admin', adminRouter);
  app.use('/api/v1/subscriptions', subscriptionRouter);
  app.use('/api/v1/partner', partnerRouter);

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Endpoint API tidak ditemukan.' },
    });
  });

  app.use(errorHandler);
  return app;
}
