import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './routes/auth.routes.js';
import { dashboardRouter } from './routes/dashboard.routes.js';
import { practiceRouter } from './routes/practice.routes.js';
import { examRouter } from './routes/exam.routes.js';
import { analyticsRouter } from './routes/analytics.routes.js';
import { adminRouter } from './routes/admin.routes.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin.split(',').map((s) => s.trim()),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '5mb' }));
  app.use(cookieParser());
  if (env.nodeEnv !== 'test') {
    app.use(morgan('dev'));
  }

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

  app.use('/api', apiLimiter);

  app.get('/api/health', (_req, res) => {
    res.json({
      success: true,
      data: {
        service: 'Nippia SKD Master API',
        status: 'ok',
        timestamp: new Date().toISOString(),
      },
    });
  });

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/dashboard', dashboardRouter);
  app.use('/api/v1/practice', practiceRouter);
  app.use('/api/v1/exams', examRouter);
  app.use('/api/v1/analytics', analyticsRouter);
  app.use('/api/v1/admin', adminRouter);

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Endpoint API tidak ditemukan.' },
    });
  });

  app.use(errorHandler);
  return app;
}
