import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from './errorHandler.js';
import { prisma } from '../lib/prisma.js';

export interface AuthPayload {
  userId: string;
  role: 'USER' | 'ADMIN';
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError(401, 'Sesi tidak ditemukan. Silakan masuk terlebih dahulu.', 'UNAUTHORIZED'));
  }

  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, env.jwtAccessSecret) as AuthPayload;
    req.user = decoded;
    return next();
  } catch {
    return next(new AppError(401, 'Token tidak valid atau telah kedaluwarsa.', 'TOKEN_EXPIRED'));
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new AppError(401, 'Autentikasi diperlukan.', 'UNAUTHORIZED'));
  }
  if (req.user.role !== 'ADMIN') {
    return next(new AppError(403, 'Akses ditolak. Hanya administrator yang diizinkan.', 'FORBIDDEN'));
  }
  return next();
}

export async function logAudit(
  actorId: string,
  action: string,
  entity: string,
  entityId?: string,
  metadata?: Record<string, unknown>,
) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        entity,
        entityId,
        metadata: metadata ? (metadata as object) : undefined,
      },
    });
  } catch (err) {
    console.warn('[AUDIT LOG FAILED]', err);
  }
}
