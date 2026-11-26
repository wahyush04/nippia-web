import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import type { AuthPayload } from '../middleware/auth.js';

function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export function signAccessToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export async function issueTokenPair(user: { id: string; email: string; role: 'USER' | 'ADMIN' }) {
  const payload: AuthPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  const accessToken = signAccessToken(payload);
  const rawRefresh = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawRefresh),
      expiresAt,
    },
  });

  return { accessToken, refreshToken: rawRefresh };
}

export async function registerUser(input: { name: string; email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError(409, 'Email sudah terdaftar. Silakan masuk atau gunakan email lain.', 'EMAIL_EXISTS');
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const verifyCode = crypto.randomBytes(16).toString('hex');

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      passwordHash,
      role: 'USER',
      emailVerifyCode: verifyCode,
      profile: {
        create: {
          onboardingCompleted: false,
          totalXp: 0,
          levelName: 'Pemula',
        },
      },
      preferences: {
        create: {
          dailyTwkTarget: 10,
          dailyTiuTarget: 10,
          dailyTkpTarget: 10,
        },
      },
      streak: {
        create: {
          currentStreak: 0,
          longestStreak: 0,
        },
      },
    },
    include: { profile: true, preferences: true, streak: true },
  });

  const tokens = await issueTokenPair({ id: user.id, email: user.email, role: user.role });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      profile: user.profile,
      preferences: user.preferences,
      streak: user.streak,
    },
    ...tokens,
    devVerificationCode: env.nodeEnv !== 'production' ? verifyCode : undefined,
  };
}

export async function loginUser(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true, preferences: true, streak: true },
  });

  if (!user) {
    throw new AppError(401, 'Email atau kata sandi salah.', 'INVALID_CREDENTIALS');
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, 'Email atau kata sandi salah.', 'INVALID_CREDENTIALS');
  }

  const tokens = await issueTokenPair({ id: user.id, email: user.email, role: user.role });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      profile: user.profile,
      preferences: user.preferences,
      streak: user.streak,
    },
    ...tokens,
  };
}

export async function rotateRefreshToken(rawRefresh: string) {
  const tokenHash = hashToken(rawRefresh);
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new AppError(401, 'Refresh token tidak valid atau kedaluwarsa.', 'INVALID_REFRESH_TOKEN');
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const tokens = await issueTokenPair({
    id: stored.user.id,
    email: stored.user.email,
    role: stored.user.role,
  });

  return tokens;
}

export async function revokeRefreshToken(rawRefresh?: string) {
  if (!rawRefresh) return;
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(rawRefresh) },
    data: { revokedAt: new Date() },
  });
}

export async function createPasswordReset(emailInput: string) {
  const email = emailInput.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { sent: true };
  }

  const rawToken = crypto.randomBytes(24).toString('hex');
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  return {
    sent: true,
    devResetToken: env.nodeEnv !== 'production' ? rawToken : undefined,
  };
}

export async function resetPassword(rawToken: string, newPassword: string) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw new AppError(400, 'Token atur ulang kata sandi tidak valid atau kedaluwarsa.', 'INVALID_RESET_TOKEN');
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.refreshToken.updateMany({
      where: { userId: record.userId },
      data: { revokedAt: new Date() },
    }),
  ]);

  return { reset: true };
}
