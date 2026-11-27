import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { logger } from '../lib/logger.js';

export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(statusCode: number, message: string, code = 'APP_ERROR', details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const requestId = req.requestId;

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        ...(requestId ? { requestId } : {}),
      },
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Data input tidak valid',
        details: err.flatten().fieldErrors,
        ...(requestId ? { requestId } : {}),
      },
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Data yang dimasukkan sudah terdaftar atau bentrok dengan data lain.',
          ...(requestId ? { requestId } : {}),
        },
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Data yang diminta tidak ditemukan.',
          ...(requestId ? { requestId } : {}),
        },
      });
    }
  }

  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Format JSON pada body permintaan tidak valid.',
        ...(requestId ? { requestId } : {}),
      },
    });
  }

  logger.error('Unhandled API error', {
    requestId,
    method: req.method,
    path: req.originalUrl.split('?')[0],
    error: err,
  });

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
      ...(requestId ? { requestId } : {}),
    },
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
