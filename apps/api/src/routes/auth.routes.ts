import { Router } from 'express';
import { z } from 'zod';
import { loginSchema, onboardingSchema, registerSchema, getLevelForXp } from '@nippia/shared';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import {
  createPasswordReset,
  loginUser,
  registerUser,
  resetPassword,
  revokeRefreshToken,
  rotateRefreshToken,
} from '../services/auth.service.js';
import { generateAdaptiveStudyPlan } from '../services/planner.service.js';

export const authRouter = Router();

authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const parsed = registerSchema.parse(req.body);
    const result = await registerUser(parsed);
    res.status(201).json({ success: true, data: result });
  }),
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.parse(req.body);
    const result = await loginUser(parsed);
    res.json({ success: true, data: result });
  }),
);

authRouter.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const { refreshToken } = z.object({ refreshToken: z.string().min(1) }).parse(req.body);
    const tokens = await rotateRefreshToken(refreshToken);
    res.json({ success: true, data: tokens });
  }),
);

authRouter.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const refreshToken = typeof req.body?.refreshToken === 'string' ? req.body.refreshToken : undefined;
    await revokeRefreshToken(refreshToken);
    res.json({ success: true, data: { loggedOut: true } });
  }),
);

authRouter.post(
  '/forgot-password',
  asyncHandler(async (req, res) => {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const result = await createPasswordReset(email);
    res.json({ success: true, data: result });
  }),
);

authRouter.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const { token, password } = z
      .object({ token: z.string().min(10), password: z.string().min(8) })
      .parse(req.body);
    const result = await resetPassword(token, password);
    res.json({ success: true, data: result });
  }),
);

authRouter.post(
  '/verify-email',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { code } = z.object({ code: z.string().min(1) }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) throw new AppError(404, 'Pengguna tidak ditemukan');
    if (user.emailVerifyCode && user.emailVerifyCode !== code) {
      throw new AppError(400, 'Kode verifikasi tidak sesuai');
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerifyCode: null },
    });
    res.json({ success: true, data: { emailVerified: true } });
  }),
);

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { profile: true, preferences: true, streak: true },
    });
    if (!user) throw new AppError(404, 'Pengguna tidak ditemukan');

    const levelInfo = getLevelForXp(user.profile?.totalXp ?? 0);
    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        profile: user.profile,
        preferences: user.preferences,
        streak: user.streak,
        levelInfo,
      },
    });
  }),
);

authRouter.put(
  '/profile',
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        name: z.string().min(2).max(100).optional(),
        bio: z.string().max(400).nullable().optional(),
        targetAgency: z.string().max(120).nullable().optional(),
        targetExamDate: z.string().nullable().optional(),
        dailyStudyMinutes: z.number().int().min(10).max(480).optional(),
        targetScore: z.number().int().min(150).max(550).optional(),
      })
      .parse(req.body);

    const userId = req.user!.userId;
    if (body.name) {
      await prisma.user.update({ where: { id: userId }, data: { name: body.name.trim() } });
    }

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        bio: body.bio !== undefined ? body.bio : undefined,
        targetAgency: body.targetAgency !== undefined ? body.targetAgency : undefined,
        targetExamDate:
          body.targetExamDate !== undefined
            ? body.targetExamDate
              ? new Date(body.targetExamDate)
              : null
            : undefined,
        dailyStudyMinutes: body.dailyStudyMinutes,
        targetScore: body.targetScore,
      },
      create: { userId },
    });

    res.json({ success: true, data: profile });
  }),
);

authRouter.put(
  '/preferences',
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        dailyTwkTarget: z.number().int().min(1).max(50).optional(),
        dailyTiuTarget: z.number().int().min(1).max(50).optional(),
        dailyTkpTarget: z.number().int().min(1).max(60).optional(),
        preferredStudyDays: z.array(z.number().int().min(0).max(6)).optional(),
        isLeaderboardPublic: z.boolean().optional(),
        showQuickTricks: z.boolean().optional(),
        disabilityExtraTime: z.boolean().optional(),
        emailReminders: z.boolean().optional(),
      })
      .parse(req.body);

    const prefs = await prisma.userPreference.upsert({
      where: { userId: req.user!.userId },
      update: body,
      create: { userId: req.user!.userId, ...body },
    });

    res.json({ success: true, data: prefs });
  }),
);

authRouter.post(
  '/onboarding',
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = onboardingSchema.parse(req.body);
    const userId = req.user!.userId;

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        experienceLevel: data.experienceLevel ?? 'FIRST_TIME',
        targetExamDate: data.targetExamDate ? new Date(data.targetExamDate) : null,
        dailyStudyMinutes: data.dailyStudyMinutes ?? 45,
        targetScore: data.targetScore ?? 380,
        confidenceTwk: data.confidenceTwk ?? 3,
        confidenceTiu: data.confidenceTiu ?? 3,
        confidenceTkp: data.confidenceTkp ?? 3,
        onboardingCompleted: true,
      },
      create: {
        userId,
        experienceLevel: data.experienceLevel ?? 'FIRST_TIME',
        targetExamDate: data.targetExamDate ? new Date(data.targetExamDate) : null,
        dailyStudyMinutes: data.dailyStudyMinutes ?? 45,
        targetScore: data.targetScore ?? 380,
        confidenceTwk: data.confidenceTwk ?? 3,
        confidenceTiu: data.confidenceTiu ?? 3,
        confidenceTkp: data.confidenceTkp ?? 3,
        onboardingCompleted: true,
      },
    });

    if (data.dailyQuestionTarget || data.preferredStudyDays) {
      const perSubj = data.dailyQuestionTarget ? Math.max(2, Math.round(data.dailyQuestionTarget / 3)) : 10;
      await prisma.userPreference.upsert({
        where: { userId },
        update: {
          dailyTwkTarget: perSubj,
          dailyTiuTarget: perSubj,
          dailyTkpTarget: perSubj,
          preferredStudyDays: data.preferredStudyDays ?? [1, 2, 3, 4, 5],
        },
        create: {
          userId,
          dailyTwkTarget: perSubj,
          dailyTiuTarget: perSubj,
          dailyTkpTarget: perSubj,
          preferredStudyDays: data.preferredStudyDays ?? [1, 2, 3, 4, 5],
        },
      });
    }

    const plan = await generateAdaptiveStudyPlan(userId, {
      targetExamDate: data.targetExamDate,
      dailyMinutes: data.dailyStudyMinutes ?? 45,
      targetScore: data.targetScore ?? 380,
      preferredDays: data.preferredStudyDays,
    });

    res.json({ success: true, data: { profile, studyPlan: plan } });
  }),
);
