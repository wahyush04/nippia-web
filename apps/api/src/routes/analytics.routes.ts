import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { prisma } from '../lib/prisma.js';
import { getUserWeaknessAnalytics, recomputeUserAnalytics } from '../services/analytics.service.js';
import { generateAdaptiveStudyPlan } from '../services/planner.service.js';
import { generateTutorReply } from '../services/ai.service.js';
import { getUserEntitlement, requireProOrThrow } from '../services/subscription.service.js';

export const analyticsRouter = Router();

analyticsRouter.get(
  '/weakness',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    await recomputeUserAnalytics(userId);
    const data = await getUserWeaknessAnalytics(userId);
    res.json({ success: true, data });
  }),
);

analyticsRouter.get(
  '/planner',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const entitlement = await getUserEntitlement(userId);
    let plan = await prisma.studyPlan.findFirst({
      where: { userId, isActive: true },
      include: { tasks: { orderBy: { scheduledDate: 'asc' } } },
    });
    if (!plan && entitlement.isPro) {
      plan = await generateAdaptiveStudyPlan(userId);
    }
    res.json({ success: true, data: plan });
  }),
);

analyticsRouter.post(
  '/planner/generate',
  requireAuth,
  asyncHandler(async (req, res) => {
    await requireProOrThrow(
      req.user!.userId,
      'Perencana Belajar Adaptif 14 Hari',
      'STUDY_PLANNER',
    );
    const body = z
      .object({
        targetExamDate: z.string().nullable().optional(),
        dailyMinutes: z.number().int().min(15).max(360).optional(),
        targetScore: z.number().int().min(150).max(550).optional(),
        preferredDays: z.array(z.number().int().min(0).max(6)).min(1).optional(),
      })
      .parse(req.body ?? {});

    const plan = await generateAdaptiveStudyPlan(req.user!.userId, body);
    res.json({ success: true, data: plan });
  }),
);

analyticsRouter.patch(
  '/planner/tasks/:taskId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { isCompleted } = z.object({ isCompleted: z.boolean() }).parse(req.body);
    const task = await prisma.studyPlanTask.findFirst({
      where: { id: String(req.params.taskId), studyPlan: { userId: req.user!.userId } },
    });
    if (!task) throw new AppError(404, 'Tugas rencana belajar tidak ditemukan.');

    const updated = await prisma.studyPlanTask.update({
      where: { id: task.id },
      data: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });
    res.json({ success: true, data: updated });
  }),
);

analyticsRouter.get(
  '/ai/conversations',
  requireAuth,
  asyncHandler(async (req, res) => {
    const convs = await prisma.aiConversation.findMany({
      where: { userId: req.user!.userId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 15,
    });
    res.json({ success: true, data: convs });
  }),
);

analyticsRouter.post(
  '/ai/ask',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    await requireProOrThrow(userId, 'Tutor AI Pribadi', 'AI_TUTOR');
    const { message, conversationId, questionId } = z
      .object({
        message: z.string().min(2).max(2000),
        conversationId: z.string().optional(),
        questionId: z.string().optional(),
      })
      .parse(req.body);

    let conv = conversationId
      ? await prisma.aiConversation.findFirst({ where: { id: conversationId, userId } })
      : null;

    if (!conv) {
      conv = await prisma.aiConversation.create({
        data: {
          userId,
          title: message.slice(0, 60),
          contextId: questionId,
        },
      });
    }

    const userMsg = await prisma.aiMessage.create({
      data: {
        conversationId: conv.id,
        role: 'user',
        content: message,
      },
    });

    const reply = await generateTutorReply(userId, message, questionId ?? conv.contextId ?? undefined);

    const assistantMsg = await prisma.aiMessage.create({
      data: {
        conversationId: conv.id,
        role: 'assistant',
        content: reply.content,
        citations: reply.citations as object,
      },
    });

    await prisma.aiConversation.update({
      where: { id: conv.id },
      data: { updatedAt: new Date() },
    });

    res.json({
      success: true,
      data: {
        conversationId: conv.id,
        userMessage: userMsg,
        assistantMessage: assistantMsg,
      },
    });
  }),
);
