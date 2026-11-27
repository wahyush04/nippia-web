import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { questionCreateSchema } from '@nippia/shared';
import { logAudit, requireAdmin, requireAuth, requireContentCurator } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { prisma } from '../lib/prisma.js';
import { generateDraftQuestionsForAdmin } from '../services/ai.service.js';
import {
  activateSubscriptionForUser,
  ensureDefaultSubscriptionPlans,
  markOrderPaidAndActivate,
} from '../services/subscription.service.js';

export const adminRouter = Router();

adminRouter.use(requireAuth);

adminRouter.get(
  '/overview',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const [
      totalUsers,
      activeUsersLast7d,
      totalQuestions,
      draftQuestions,
      totalSimulations,
      openReports,
      pendingSubscriptionOrders,
      hardestTopics,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.dailyActivity.groupBy({
        by: ['userId'],
        where: {
          date: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          },
        },
      }),
      prisma.question.count({ where: { status: 'PUBLISHED' } }),
      prisma.question.count({ where: { status: 'DRAFT' } }),
      prisma.examinationSession.count({ where: { status: 'SUBMITTED' } }),
      prisma.contentReport.count({ where: { status: 'OPEN' } }),
      prisma.subscriptionOrder.count({ where: { status: 'PENDING' } }),
      prisma.topicMastery.groupBy({
        by: ['topicId'],
        _avg: { accuracyPct: true },
        _sum: { attemptsCount: true },
        orderBy: { _avg: { accuracyPct: 'asc' } },
        take: 6,
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          profile: { select: { totalXp: true, levelName: true } },
        },
      }),
    ]);

    const topicIds = hardestTopics.map((h) => h.topicId);
    const topics = await prisma.topic.findMany({
      where: { id: { in: topicIds } },
      include: { subject: true },
    });
    const tMap = new Map(topics.map((t) => [t.id, t]));

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers7d: activeUsersLast7d.length,
        totalPublishedQuestions: totalQuestions,
        draftQuestions,
        totalSimulations,
        openReports,
        pendingSubscriptionOrders,
        hardestTopics: hardestTopics.map((h) => {
          const t = tMap.get(h.topicId);
          return {
            topicId: h.topicId,
            topicName: t?.name ?? 'Topik',
            subjectCode: t?.subject.code ?? 'TWK',
            avgAccuracy: Number((h._avg.accuracyPct ?? 0).toFixed(1)),
            totalAttempts: h._sum.attemptsCount ?? 0,
          };
        }),
        recentUsers,
      },
    });
  }),
);

adminRouter.get(
  '/questions',
  requireContentCurator,
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(req.query.pageSize ?? 20)));
    const subject = typeof req.query.subject === 'string' ? req.query.subject : '';
    const topicSlug = typeof req.query.topicSlug === 'string' ? req.query.topicSlug : '';
    const packageCode = typeof req.query.packageCode === 'string' ? req.query.packageCode : '';
    const status = typeof req.query.status === 'string' ? req.query.status : '';
    const difficulty = typeof req.query.difficulty === 'string' ? req.query.difficulty : '';
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';

    const where = {
      ...(subject ? { subject: { code: subject as 'TWK' | 'TIU' | 'TKP' } } : {}),
      ...(topicSlug ? { topic: { slug: topicSlug } } : {}),
      ...(packageCode ? { packageCode } : {}),
      ...(status ? { status: status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' } : {}),
      ...(difficulty ? { difficulty: difficulty as 'EASY' | 'MEDIUM' | 'HARD' } : {}),
      ...(q
        ? {
            OR: [
              { code: { contains: q, mode: 'insensitive' as const } },
              { stem: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.findMany({
        where,
        include: {
          subject: true,
          topic: true,
          subtopic: true,
          options: { orderBy: { optionKey: 'asc' } },
          references: true,
        },
        orderBy: topicSlug ? [{ code: 'asc' }] : [{ updatedAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    res.json({
      success: true,
      data: {
        items,
        pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
      },
    });
  }),
);

adminRouter.post(
  '/questions',
  requireContentCurator,
  asyncHandler(async (req, res) => {
    const data = questionCreateSchema.parse(req.body);
    const subject = await prisma.subject.findUnique({ where: { code: data.subjectCode } });
    const topic = await prisma.topic.findUnique({ where: { slug: data.topicSlug } });
    if (!subject || !topic) {
      throw new AppError(400, 'Subtes atau topik tidak valid.');
    }

    let subtopicId: string | undefined;
    if (data.subtopicName) {
      const sub = await prisma.subtopic.upsert({
        where: { topicId_name: { topicId: topic.id, name: data.subtopicName } },
        update: {},
        create: { topicId: topic.id, name: data.subtopicName },
      });
      subtopicId = sub.id;
    }

    const code = data.code || `${data.subjectCode}-${Date.now().toString().slice(-6)}`;

    const created = await prisma.question.create({
      data: {
        code,
        subjectId: subject.id,
        topicId: topic.id,
        subtopicId,
        questionType: data.questionType,
        difficulty: data.difficulty,
        stem: data.stem,
        visualSpec: data.visualSpec ?? undefined,
        explanation: data.explanation,
        conceptSummary: data.conceptSummary,
        stepByStep: data.stepByStep ?? undefined,
        whyOthersWrong: data.whyOthersWrong ?? undefined,
        quickTrick: data.quickTrick,
        commonMistakes: data.commonMistakes,
        status: data.status,
        isAiGenerated: data.isAiGenerated,
        options: {
          create: data.options.map((o) => ({
            optionKey: o.optionKey,
            text: o.text,
            scoreValue: o.scoreValue,
            isCorrect: o.isCorrect,
            optionFeedback: o.optionFeedback,
            visualSpec: o.visualSpec ?? undefined,
          })),
        },
        references: data.references
          ? { create: data.references.map((r) => ({ title: r.title, source: r.source, note: r.note })) }
          : undefined,
      },
      include: { subject: true, topic: true, options: true, references: true },
    });

    await logAudit(req.user!.userId, 'CREATE_QUESTION', 'Question', created.id, { code: created.code });
    res.status(201).json({ success: true, data: created });
  }),
);

adminRouter.put(
  '/questions/:id',
  requireContentCurator,
  asyncHandler(async (req, res) => {
    const data = questionCreateSchema.parse(req.body);
    const existing = await prisma.question.findUnique({
      where: { id: String(req.params.id) },
      include: { options: true },
    });
    if (!existing) throw new AppError(404, 'Soal tidak ditemukan.');

    const subject = await prisma.subject.findUnique({ where: { code: data.subjectCode } });
    const topic = await prisma.topic.findUnique({ where: { slug: data.topicSlug } });
    if (!subject || !topic) throw new AppError(400, 'Subtes atau topik tidak valid.');

    // Save version history snapshot before overwriting
    await prisma.questionVersion.create({
      data: {
        questionId: existing.id,
        version: existing.version,
        snapshot: existing as unknown as object,
        changedBy: req.user!.userId,
        changeNote: 'Pembaruan melalui Editor Admin',
      },
    });

    const updated = await prisma.$transaction(async (tx) => {
      await tx.questionOption.deleteMany({ where: { questionId: existing.id } });
      await tx.questionReference.deleteMany({ where: { questionId: existing.id } });

      return tx.question.update({
        where: { id: existing.id },
        data: {
          subjectId: subject.id,
          topicId: topic.id,
          questionType: data.questionType,
          difficulty: data.difficulty,
          stem: data.stem,
          visualSpec:
            data.visualSpec === null ? Prisma.DbNull : (data.visualSpec ?? undefined),
          explanation: data.explanation,
          conceptSummary: data.conceptSummary,
          stepByStep: data.stepByStep ?? undefined,
          whyOthersWrong: data.whyOthersWrong ?? undefined,
          quickTrick: data.quickTrick,
          commonMistakes: data.commonMistakes,
          status: data.status,
          version: { increment: 1 },
          options: {
            create: data.options.map((o) => ({
              optionKey: o.optionKey,
              text: o.text,
              scoreValue: o.scoreValue,
              isCorrect: o.isCorrect,
              optionFeedback: o.optionFeedback,
              visualSpec: o.visualSpec ?? undefined,
            })),
          },
          references: data.references
            ? { create: data.references.map((r) => ({ title: r.title, source: r.source, note: r.note })) }
            : undefined,
        },
        include: { subject: true, topic: true, options: true, references: true },
      });
    });

    await logAudit(req.user!.userId, 'UPDATE_QUESTION', 'Question', updated.id, { version: updated.version });
    res.json({ success: true, data: updated });
  }),
);

adminRouter.delete(
  '/questions/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const existing = await prisma.question.findUnique({ where: { id: String(req.params.id) } });
    if (!existing) throw new AppError(404, 'Soal tidak ditemukan.');
    await prisma.question.delete({ where: { id: existing.id } });
    await logAudit(req.user!.userId, 'DELETE_QUESTION', 'Question', existing.id, { code: existing.code });
    res.json({ success: true, data: { deleted: true } });
  }),
);

adminRouter.post(
  '/questions/bulk-update',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { ids, difficulty, status, topicSlug } = z
      .object({
        ids: z.array(z.string()).min(1),
        difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
        status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
        topicSlug: z.string().optional(),
      })
      .parse(req.body);

    let topicId: string | undefined;
    if (topicSlug) {
      const t = await prisma.topic.findUnique({ where: { slug: topicSlug } });
      if (!t) throw new AppError(400, 'Topik tidak ditemukan.');
      topicId = t.id;
    }

    const result = await prisma.question.updateMany({
      where: { id: { in: ids } },
      data: {
        ...(difficulty ? { difficulty } : {}),
        ...(status ? { status } : {}),
        ...(topicId ? { topicId } : {}),
      },
    });

    await logAudit(req.user!.userId, 'BULK_UPDATE_QUESTIONS', 'Question', undefined, { count: result.count });
    res.json({ success: true, data: { updatedCount: result.count } });
  }),
);

adminRouter.get(
  '/questions/export',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const questions = await prisma.question.findMany({
      include: { subject: true, topic: true, options: { orderBy: { optionKey: 'asc' } }, references: true },
      orderBy: { code: 'asc' },
    });
    res.json({ success: true, data: questions });
  }),
);

adminRouter.get(
  '/questions/:id',
  requireContentCurator,
  asyncHandler(async (req, res) => {
    const question = await prisma.question.findUnique({
      where: { id: String(req.params.id) },
      include: {
        subject: true,
        topic: true,
        subtopic: true,
        options: { orderBy: { optionKey: 'asc' } },
        references: true,
        versions: { orderBy: { version: 'desc' }, take: 5 },
      },
    });
    if (!question) {
      throw new AppError(404, 'Soal tidak ditemukan.');
    }
    res.json({ success: true, data: question });
  }),
);

adminRouter.post(
  '/questions/import',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { items } = z.object({ items: z.array(questionCreateSchema).min(1).max(200) }).parse(req.body);
    let imported = 0;

    for (const item of items) {
      const subject = await prisma.subject.findUnique({ where: { code: item.subjectCode } });
      const topic = await prisma.topic.findUnique({ where: { slug: item.topicSlug } });
      if (!subject || !topic) continue;
      const code = item.code || `${item.subjectCode}-IMP-${Date.now()}-${imported}`;
      await prisma.question.upsert({
        where: { code },
        update: { stem: item.stem, explanation: item.explanation, status: item.status },
        create: {
          code,
          subjectId: subject.id,
          topicId: topic.id,
          questionType: item.questionType,
          difficulty: item.difficulty,
          stem: item.stem,
          explanation: item.explanation,
          conceptSummary: item.conceptSummary,
          quickTrick: item.quickTrick,
          commonMistakes: item.commonMistakes,
          status: item.status,
          options: {
            create: item.options.map((o) => ({
              optionKey: o.optionKey,
              text: o.text,
              scoreValue: o.scoreValue,
              isCorrect: o.isCorrect,
              optionFeedback: o.optionFeedback,
            })),
          },
        },
      });
      imported++;
    }

    await logAudit(req.user!.userId, 'IMPORT_QUESTIONS', 'Question', undefined, { imported });
    res.json({ success: true, data: { imported } });
  }),
);

adminRouter.post(
  '/ai-generate',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        subjectCode: z.enum(['TWK', 'TIU', 'TKP']),
        topicSlug: z.string().min(1),
        subtopicName: z.string().optional(),
        difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
        count: z.number().int().min(1).max(5).default(2),
      })
      .parse(req.body);

    const drafts = await generateDraftQuestionsForAdmin(body);
    const subject = await prisma.subject.findUnique({ where: { code: body.subjectCode } });
    const topic = await prisma.topic.findUnique({ where: { slug: body.topicSlug } });
    if (!subject || !topic) throw new AppError(400, 'Subtes atau topik tidak valid.');

    const savedDrafts: unknown[] = [];
    for (const d of drafts) {
      const created = await prisma.question.create({
        data: {
          code: d.code || `AI-${body.subjectCode}-${Date.now().toString().slice(-5)}-${savedDrafts.length + 1}`,
          subjectId: subject.id,
          topicId: topic.id,
          difficulty: body.difficulty,
          stem: d.stem,
          explanation: d.explanation,
          conceptSummary: d.conceptSummary,
          quickTrick: d.quickTrick,
          commonMistakes: d.commonMistakes,
          status: 'DRAFT',
          isAiGenerated: true,
          options: {
            create: (d.options || []).map((o: { optionKey: string; text: string; scoreValue: number; isCorrect: boolean; optionFeedback?: string }) => ({
              optionKey: o.optionKey,
              text: o.text,
              scoreValue: o.scoreValue,
              isCorrect: Boolean(o.isCorrect),
              optionFeedback: o.optionFeedback,
            })),
          },
        },
        include: { subject: true, topic: true, options: true },
      });
      savedDrafts.push(created);
    }

    await logAudit(req.user!.userId, 'AI_GENERATE_DRAFTS', 'Question', undefined, { count: savedDrafts.length });
    res.status(201).json({ success: true, data: savedDrafts });
  }),
);

adminRouter.get(
  '/quality-check',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const [allQuestions, reports, aiDrafts] = await Promise.all([
      prisma.question.findMany({
        include: { subject: true, topic: true, options: true },
      }),
      prisma.contentReport.findMany({
        where: { status: 'OPEN' },
        include: {
          user: { select: { name: true, email: true } },
          question: { select: { id: true, code: true, stem: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.question.findMany({
        where: { status: 'DRAFT', isAiGenerated: true },
        include: { subject: true, topic: true, options: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Check duplicate stems
    const stemSeen = new Map<string, string[]>();
    const missingExplanations: Array<{ id: string; code: string }> = [];
    const inconsistentKeys: Array<{ id: string; code: string; issue: string }> = [];

    for (const q of allQuestions) {
      const norm = q.stem.trim().toLowerCase().slice(0, 120);
      stemSeen.set(norm, [...(stemSeen.get(norm) ?? []), q.code]);

      if (!q.explanation || q.explanation.trim().length < 20) {
        missingExplanations.push({ id: q.id, code: q.code });
      }

      if (q.options.length !== 5) {
        inconsistentKeys.push({ id: q.id, code: q.code, issue: `Jumlah opsi ${q.options.length} (harus 5)` });
      } else if (q.subject.code === 'TKP') {
        const scores = new Set(q.options.map((o) => o.scoreValue));
        if (scores.size < 3) {
          inconsistentKeys.push({ id: q.id, code: q.code, issue: 'Bobot opsi TKP tidak bervariasi' });
        }
      } else {
        const corrects = q.options.filter((o) => o.isCorrect);
        if (corrects.length !== 1) {
          inconsistentKeys.push({
            id: q.id,
            code: q.code,
            issue: `Jumlah kunci benar ${corrects.length} (harus tepat 1)`,
          });
        }
      }
    }

    const duplicates = [...stemSeen.entries()]
      .filter(([, codes]) => codes.length > 1)
      .map(([prefix, codes]) => ({ prefix, codes }));

    res.json({
      success: true,
      data: {
        duplicates,
        missingExplanations,
        inconsistentKeys,
        aiDrafts,
        openReports: reports,
      },
    });
  }),
);

adminRouter.get(
  '/reports',
  requireContentCurator,
  asyncHandler(async (req, res) => {
    const status = typeof req.query.status === 'string' ? req.query.status : 'ALL';
    const subjectCode = typeof req.query.subjectCode === 'string' ? req.query.subjectCode : '';
    const search = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const page = Math.max(1, Number(req.query.page ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize ?? 25)));

    const baseWhere = {
      ...(subjectCode ? { question: { subject: { code: subjectCode as 'TWK' | 'TIU' | 'TKP' } } } : {}),
      ...(search
        ? {
            OR: [
              { reason: { contains: search, mode: 'insensitive' as const } },
              { details: { contains: search, mode: 'insensitive' as const } },
              { user: { name: { contains: search, mode: 'insensitive' as const } } },
              { user: { email: { contains: search, mode: 'insensitive' as const } } },
              { question: { code: { contains: search, mode: 'insensitive' as const } } },
              { question: { stem: { contains: search, mode: 'insensitive' as const } } },
            ],
          }
        : {}),
    };

    const where = {
      ...baseWhere,
      ...(status !== 'ALL' ? { status } : {}),
    };

    const [total, items, openCount, reviewedCount, resolvedCount, dismissedCount] = await Promise.all([
      prisma.contentReport.count({ where }),
      prisma.contentReport.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          question: {
            include: {
              subject: true,
              topic: true,
              subtopic: true,
              options: { orderBy: { optionKey: 'asc' } },
              references: true,
            },
          },
        },
        orderBy: [{ createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.contentReport.count({ where: { status: 'OPEN' } }),
      prisma.contentReport.count({ where: { status: 'REVIEWED' } }),
      prisma.contentReport.count({ where: { status: 'RESOLVED' } }),
      prisma.contentReport.count({ where: { status: 'DISMISSED' } }),
    ]);

    res.json({
      success: true,
      data: {
        items,
        counts: {
          ALL: openCount + reviewedCount + resolvedCount + dismissedCount,
          OPEN: openCount,
          REVIEWED: reviewedCount,
          RESOLVED: resolvedCount,
          DISMISSED: dismissedCount,
        },
        pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
      },
    });
  }),
);

adminRouter.patch(
  '/reports/:id',
  requireContentCurator,
  asyncHandler(async (req, res) => {
    const { status } = z.object({ status: z.enum(['OPEN', 'REVIEWED', 'RESOLVED', 'DISMISSED']) }).parse(req.body);
    const id = String(req.params.id);
    const existing = await prisma.contentReport.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'Laporan soal tidak ditemukan.');

    const updated = await prisma.contentReport.update({
      where: { id },
      data: { status },
    });
    await logAudit(req.user!.userId, 'UPDATE_REPORT_STATUS', 'ContentReport', id, {
      previousStatus: existing.status,
      newStatus: status,
    });
    res.json({ success: true, data: updated });
  }),
);

adminRouter.get(
  '/topics',
  requireContentCurator,
  asyncHandler(async (_req, res) => {
    const topics = await prisma.topic.findMany({
      include: {
        subject: true,
        _count: { select: { questions: true } },
      },
      orderBy: [{ subject: { orderIndex: 'asc' } }, { orderIndex: 'asc' }],
    });
    res.json({ success: true, data: topics });
  }),
);

adminRouter.post(
  '/topics',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        subjectCode: z.enum(['TWK', 'TIU', 'TKP']),
        name: z.string().min(2),
        slug: z.string().min(2),
        category: z.string().optional(),
        description: z.string().min(5),
      })
      .parse(req.body);

    const subject = await prisma.subject.findUnique({ where: { code: body.subjectCode } });
    if (!subject) throw new AppError(400, 'Subtes tidak ditemukan.');

    const created = await prisma.topic.create({
      data: {
        subjectId: subject.id,
        name: body.name,
        slug: body.slug,
        category: body.category,
        description: body.description,
      },
    });
    await logAudit(req.user!.userId, 'CREATE_TOPIC', 'Topic', created.id);
    res.status(201).json({ success: true, data: created });
  }),
);

adminRouter.get(
  '/users',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const now = new Date();
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        profile: { select: { totalXp: true, levelName: true, targetScore: true } },
        streak: { select: { currentStreak: true } },
        subscriptions: {
          where: { status: 'ACTIVE', expiresAt: { gt: now } },
          include: { plan: { select: { name: true, code: true } } },
          orderBy: { expiresAt: 'desc' },
          take: 1,
        },
        _count: { select: { practiceSessions: true, examSessions: true } },
      },
    });
    res.json({
      success: true,
      data: users.map((u) => ({
        ...u,
        isPro: u.role === 'ADMIN' || u.role === 'CONTENT_PARTNER' || u.subscriptions.length > 0,
        activeSubscription: u.subscriptions[0] ?? null,
      })),
    });
  }),
);

adminRouter.patch(
  '/users/:id/role',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { role } = z
      .object({
        role: z.enum(['USER', 'CONTENT_PARTNER', 'HOST_OPERATOR', 'EVENT_ADMIN', 'ADMIN']),
      })
      .parse(req.body);
    const updated = await prisma.user.update({
      where: { id: String(req.params.id) },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
    await logAudit(req.user!.userId, 'UPDATE_USER_ROLE', 'User', updated.id, { role });
    res.json({ success: true, data: updated });
  }),
);

adminRouter.get(
  '/configs',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const configs = await prisma.scoringConfiguration.findMany({
      include: { passingGrades: true },
      orderBy: [{ year: 'desc' }, { version: 'desc' }],
    });
    res.json({ success: true, data: configs });
  }),
);

adminRouter.post(
  '/configs',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        name: z.string().min(3),
        year: z.number().int().min(2020).max(2035),
        isOfficialStyle: z.boolean().default(true),
        isActive: z.boolean().default(true),
        sourceReference: z.string().min(3),
        durationMinutes: z.number().int().min(10).max(300).default(100),
        disabilityMins: z.number().int().min(10).max(300).default(130),
        twkQuestionCount: z.number().int().min(1).max(100).default(30),
        tiuQuestionCount: z.number().int().min(1).max(100).default(35),
        tkpQuestionCount: z.number().int().min(1).max(100).default(45),
        twkCorrectPoints: z.number().int().min(1).max(20).default(5),
        tiuCorrectPoints: z.number().int().min(1).max(20).default(5),
        tkpMaxPoints: z.number().int().min(1).max(20).default(5),
        twkThreshold: z.number().int().min(0).max(500).default(65),
        tiuThreshold: z.number().int().min(0).max(500).default(80),
        tkpThreshold: z.number().int().min(0).max(500).default(166),
        passingSourceDocument: z.string().min(3),
      })
      .parse(req.body);

    const created = await prisma.$transaction(async (tx) => {
      if (body.isActive) {
        await tx.scoringConfiguration.updateMany({ data: { isActive: false } });
      }
      return tx.scoringConfiguration.create({
        data: {
          name: body.name,
          year: body.year,
          isOfficialStyle: body.isOfficialStyle,
          isActive: body.isActive,
          sourceReference: body.sourceReference,
          durationMinutes: body.durationMinutes,
          disabilityMins: body.disabilityMins,
          twkQuestionCount: body.twkQuestionCount,
          tiuQuestionCount: body.tiuQuestionCount,
          tkpQuestionCount: body.tkpQuestionCount,
          twkCorrectPoints: body.twkCorrectPoints,
          tiuCorrectPoints: body.tiuCorrectPoints,
          tkpMaxPoints: body.tkpMaxPoints,
          passingGrades: {
            create: {
              formationType: 'UMUM',
              year: body.year,
              twkThreshold: body.twkThreshold,
              tiuThreshold: body.tiuThreshold,
              tkpThreshold: body.tkpThreshold,
              sourceDocument: body.passingSourceDocument,
              isActive: true,
            },
          },
        },
        include: { passingGrades: true },
      });
    });

    await logAudit(req.user!.userId, 'CREATE_EXAM_CONFIG', 'ScoringConfiguration', created.id, {
      year: created.year,
    });
    res.status(201).json({ success: true, data: created });
  }),
);

// ==========================================
// ADMIN SUBSCRIPTION & BILLING MANAGEMENT
// ==========================================

adminRouter.get(
  '/subscriptions',
  requireAdmin,
  asyncHandler(async (req, res) => {
    await ensureDefaultSubscriptionPlans();
    const orderStatus = typeof req.query.status === 'string' ? req.query.status : 'ALL';
    const userQuery = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const now = new Date();

    const [
      plans,
      activeSubscriptions,
      orders,
      pendingCount,
      paidCount,
      revenueAgg,
      users,
      partnerCommissions,
    ] = await Promise.all([
      prisma.subscriptionPlan.findMany({ orderBy: { orderIndex: 'asc' } }),
      prisma.userSubscription.findMany({
        where: { status: 'ACTIVE', expiresAt: { gt: now } },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          plan: { select: { id: true, code: true, name: true, priceIdr: true } },
        },
        orderBy: { expiresAt: 'asc' },
        take: 100,
      }),
      prisma.subscriptionOrder.findMany({
        where:
          orderStatus !== 'ALL'
            ? { status: orderStatus as 'PENDING' | 'PAID' | 'REJECTED' | 'CANCELLED' | 'EXPIRED' }
            : undefined,
        include: {
          user: { select: { id: true, name: true, email: true } },
          plan: { select: { id: true, code: true, name: true, priceIdr: true, durationDays: true } },
          verifiedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.subscriptionOrder.count({ where: { status: 'PENDING' } }),
      prisma.subscriptionOrder.count({ where: { status: 'PAID' } }),
      prisma.subscriptionOrder.aggregate({
        where: { status: 'PAID' },
        _sum: { amountIdr: true },
      }),
      prisma.user.findMany({
        where: userQuery
          ? {
              OR: [
                { name: { contains: userQuery, mode: 'insensitive' } },
                { email: { contains: userQuery, mode: 'insensitive' } },
              ],
            }
          : undefined,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          subscriptions: {
            where: { status: 'ACTIVE', expiresAt: { gt: now } },
            include: { plan: { select: { name: true, code: true } } },
            orderBy: { expiresAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      prisma.partnerCommission.findMany({
        include: {
          partner: { select: { id: true, name: true, email: true } },
          buyer: { select: { id: true, name: true, email: true } },
          voucher: { select: { code: true } },
          order: { select: { orderCode: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          activeProCount: activeSubscriptions.length,
          pendingOrdersCount: pendingCount,
          paidOrdersCount: paidCount,
          totalRevenueIdr: revenueAgg._sum.amountIdr ?? 0,
        },
        plans,
        activeSubscriptions,
        orders,
        partnerCommissions,
        users: users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          isPro: u.role === 'ADMIN' || u.role === 'CONTENT_PARTNER' || u.subscriptions.length > 0,
          activeSubscription: u.subscriptions[0] ?? null,
        })),
      },
    });
  }),
);

adminRouter.patch(
  '/subscriptions/plans/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        name: z.string().min(2).max(100).optional(),
        priceIdr: z.number().int().min(1000).optional(),
        originalIdr: z.number().int().min(1000).nullable().optional(),
        durationDays: z.number().int().min(1).max(3650).optional(),
        isActive: z.boolean().optional(),
      })
      .parse(req.body);

    const updated = await prisma.subscriptionPlan.update({
      where: { id: String(req.params.id) },
      data: body,
    });
    await logAudit(req.user!.userId, 'UPDATE_SUBSCRIPTION_PLAN', 'SubscriptionPlan', updated.id, body);
    res.json({ success: true, data: updated });
  }),
);

adminRouter.patch(
  '/subscriptions/orders/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { action, rejectionReason } = z
      .object({
        action: z.enum(['APPROVE', 'REJECT']),
        rejectionReason: z.string().max(300).optional(),
      })
      .parse(req.body);

    const orderId = String(req.params.id);
    if (action === 'APPROVE') {
      const updated = await markOrderPaidAndActivate({
        orderId,
        verifiedById: req.user!.userId,
        note: 'Diverifikasi oleh Admin',
      });
      await logAudit(req.user!.userId, 'APPROVE_SUBSCRIPTION_ORDER', 'SubscriptionOrder', orderId, {
        userId: updated.userId,
        amountIdr: updated.amountIdr,
      });
      return res.json({ success: true, data: updated });
    }

    const existing = await prisma.subscriptionOrder.findUnique({ where: { id: orderId } });
    if (!existing) throw new AppError(404, 'Order langganan tidak ditemukan.');
    if (existing.status !== 'PENDING') {
      throw new AppError(400, 'Hanya order PENDING yang dapat ditolak.');
    }

    const rejected = await prisma.subscriptionOrder.update({
      where: { id: orderId },
      data: {
        status: 'REJECTED',
        rejectionReason: rejectionReason?.trim() || 'Pembayaran belum terverifikasi.',
        verifiedById: req.user!.userId,
        verifiedAt: new Date(),
      },
      include: { plan: true },
    });
    await logAudit(req.user!.userId, 'REJECT_SUBSCRIPTION_ORDER', 'SubscriptionOrder', orderId, {
      reason: rejected.rejectionReason,
    });
    res.json({ success: true, data: rejected });
  }),
);

adminRouter.post(
  '/subscriptions/grant',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        userId: z.string().min(1),
        planCode: z.string().default('PRO_MONTHLY'),
        durationDays: z.number().int().min(1).max(730).optional(),
        note: z.string().max(300).optional(),
      })
      .parse(req.body);

    await ensureDefaultSubscriptionPlans();
    const plan = await prisma.subscriptionPlan.findUnique({ where: { code: body.planCode } });
    if (!plan) throw new AppError(404, 'Paket langganan tidak ditemukan.');

    const sub = await activateSubscriptionForUser({
      userId: body.userId,
      planId: plan.id,
      source: 'ADMIN_GRANT',
      durationDaysOverride: body.durationDays,
      note: body.note?.trim() || `Aktivasi Pro manual oleh Admin (${body.durationDays ?? plan.durationDays} hari)`,
    });
    await logAudit(req.user!.userId, 'GRANT_PRO_SUBSCRIPTION', 'UserSubscription', sub.id, {
      targetUserId: body.userId,
      durationDays: body.durationDays ?? plan.durationDays,
    });
    res.status(201).json({ success: true, data: sub });
  }),
);

adminRouter.post(
  '/subscriptions/revoke',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { userId, note } = z
      .object({
        userId: z.string().min(1),
        note: z.string().max(300).optional(),
      })
      .parse(req.body);

    const result = await prisma.userSubscription.updateMany({
      where: { userId, status: 'ACTIVE' },
      data: {
        status: 'CANCELLED',
        note: note?.trim() || 'Dinonaktifkan oleh Admin',
      },
    });
    await logAudit(req.user!.userId, 'REVOKE_PRO_SUBSCRIPTION', 'User', userId, {
      cancelledCount: result.count,
    });
    res.json({ success: true, data: { cancelledCount: result.count } });
  }),
);

adminRouter.post(
  '/subscriptions/commissions/:id/payout',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { payoutNote } = z.object({ payoutNote: z.string().max(300).optional() }).parse(req.body ?? {});
    const commissionId = String(req.params.id);
    const existing = await prisma.partnerCommission.findUnique({ where: { id: commissionId } });
    if (!existing) throw new AppError(404, 'Data komisi tidak ditemukan.');
    if (existing.status === 'PAID_OUT') {
      return res.json({ success: true, data: existing });
    }
    const updated = await prisma.partnerCommission.update({
      where: { id: commissionId },
      data: {
        status: 'PAID_OUT',
        payoutNote: payoutNote?.trim() || 'Komisi dicairkan oleh Admin',
        paidOutAt: new Date(),
      },
    });
    await logAudit(req.user!.userId, 'PAYOUT_PARTNER_COMMISSION', 'PartnerCommission', commissionId, {
      partnerId: updated.partnerId,
      commissionIdr: updated.commissionIdr,
    });
    res.json({ success: true, data: updated });
  }),
);
