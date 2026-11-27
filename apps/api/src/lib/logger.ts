import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const SENSITIVE_KEY_PATTERN =
  /password|token|secret|authorization|cookie|signature_key|serverkey|clientsecret|apikey|credential/i;

function sanitizeMeta(value: unknown, depth = 0): unknown {
  if (depth > 4 || value === null || value === undefined) return value;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (value instanceof Error) {
    return env.nodeEnv === 'production'
      ? { name: value.name, message: value.message }
      : { name: value.name, message: value.message, stack: value.stack };
  }
  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => sanitizeMeta(item, depth + 1));
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEY_PATTERN.test(k)) {
        out[k] = '[REDACTED]';
      } else {
        out[k] = sanitizeMeta(v, depth + 1);
      }
    }
    return out;
  }
  return String(value);
}

function configuredLevel(): LogLevel {
  if (env.nodeEnv === 'test') return 'error';
  if (env.logLevel && env.logLevel in LEVEL_WEIGHT) return env.logLevel as LogLevel;
  return env.nodeEnv === 'production' ? 'info' : 'debug';
}

function emit(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  if (LEVEL_WEIGHT[level] > LEVEL_WEIGHT[configuredLevel()]) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: 'nippia-api',
    message,
    ...(meta ? { meta: sanitizeMeta(meta) } : {}),
  };

  const line =
    env.nodeEnv === 'production'
      ? JSON.stringify(entry)
      : `[${entry.timestamp}] ${level.toUpperCase()}: ${message}${
          meta ? ` ${JSON.stringify(entry.meta)}` : ''
        }`;

  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const logger = {
  error: (message: string, meta?: Record<string, unknown>) => emit('error', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => emit('warn', message, meta),
  info: (message: string, meta?: Record<string, unknown>) => emit('info', message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => emit('debug', message, meta),
};

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

export function requestIdAndLoggerMiddleware(req: Request, res: Response, next: NextFunction) {
  const incomingId = typeof req.headers['x-request-id'] === 'string' ? req.headers['x-request-id'].trim() : '';
  const requestId = incomingId && incomingId.length <= 64 ? incomingId : crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  if (env.nodeEnv === 'test' || req.path === '/api/health') {
    return next();
  }

  const startedAt = process.hrtime.bigint();
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const status = res.statusCode;
    const logFn = status >= 500 ? logger.error : status >= 400 ? logger.warn : logger.info;
    logFn('HTTP request completed', {
      requestId,
      method: req.method,
      path: req.originalUrl.split('?')[0],
      statusCode: status,
      durationMs: Math.round(durationMs * 10) / 10,
      ip: req.ip,
      userId: req.user?.userId,
    });
  });

  return next();
}
