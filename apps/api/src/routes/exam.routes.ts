import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { prisma } from '../lib/prisma.js';
import {
  calculateExaminationSummary,
  evaluateSingleAnswer,
  type ScoringRuleConfig,
} from '../services/scoring.service.js';
import { recomputeUserAnalytics } from '../services/analytics.service.js';
import {
  awardXpIdempotent,
  evaluateAchievements,
  getTodayWibString,
  updateDailyStreak,
} from '../services/gamification.service.js';
import {
  FREE_LIMITS,
  getUserEntitlement,
  requireProOrThrow,
} from '../services/subscription.service.js';
import {
  buildOptionOrderMap,
  displayKeyToOriginal,
  originalKeyToDisplay,
  remapOptionMentions,
  remapOptionsForDisplay,
  remapStepByStep,
  remapWhyOthersWrong,
} from '../utils/optionOrder.js';

export const examRouter = Router();

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

examRouter.get(
  '/config',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const configs = await prisma.scoringConfiguration.findMany({
      where: { isActive: true },
      include: { passingGrades: { where: { isActive: true } } },
      orderBy: { year: 'desc' },
    });
    res.json({ success: true, data: configs });
  }),
);

examRouter.get(
  '/history',
  requireAuth,
  asyncHandler(async (req, res) => {
    const sessions = await prisma.examinationSession.findMany({
      where: { userId: req.user!.userId },
      include: { scoringConfig: true },
      orderBy: { startedAt: 'desc' },
      take: 25,
    });
    res.json({ success: true, data: sessions });
  }),
);

examRouter.get(
  '/packages',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const published = await prisma.question.findMany({
      where: { status: 'PUBLISHED' },
      select: { packageCode: true, subject: { select: { code: true } } },
    });

    const stats = new Map<string, { twk: number; tiu: number; tkp: number; total: number }>();
    const totalAll = { twk: 0, tiu: 0, tkp: 0, total: 0 };

    for (const q of published) {
      const code = q.packageCode || 'PAKET_1';
      if (!stats.has(code)) {
        stats.set(code, { twk: 0, tiu: 0, tkp: 0, total: 0 });
      }
      const entry = stats.get(code)!;
      entry.total += 1;
      totalAll.total += 1;
      if (q.subject.code === 'TWK') {
        entry.twk += 1;
        totalAll.twk += 1;
      } else if (q.subject.code === 'TIU') {
        entry.tiu += 1;
        totalAll.tiu += 1;
      } else if (q.subject.code === 'TKP') {
        entry.tkp += 1;
        totalAll.tkp += 1;
      }
    }

    const packageDefs = [
      { code: 'ALL', label: 'Acak / Campuran Semua Bank Soal (Termasuk 90 Figural PDF)', ...totalAll },
      { code: 'PAKET_1', label: 'Paket 1 — SKD Lengkap Standar', ...(stats.get('PAKET_1') ?? { twk: 0, tiu: 0, tkp: 0, total: 0 }) },
      { code: 'PAKET_2', label: 'Paket 2 — SKD Lengkap Standar', ...(stats.get('PAKET_2') ?? { twk: 0, tiu: 0, tkp: 0, total: 0 }) },
      { code: 'PAKET_3', label: 'Paket 3 — SKD Lengkap Standar', ...(stats.get('PAKET_3') ?? { twk: 0, tiu: 0, tkp: 0, total: 0 }) },
      { code: 'PAKET_4', label: 'Paket 4 — SKD Lengkap Standar', ...(stats.get('PAKET_4') ?? { twk: 0, tiu: 0, tkp: 0, total: 0 }) },
      { code: 'PAKET_5', label: 'Paket 5 — SKD Lengkap Standar', ...(stats.get('PAKET_5') ?? { twk: 0, tiu: 0, tkp: 0, total: 0 }) },
    ];

    res.json({
      success: true,
      data: {
        packages: packageDefs,
        pdfFiguralCount: stats.get('PDF_FIGURAL')?.tiu ?? 0,
      },
    });
  }),
);

examRouter.post(
  '/start',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const body = z
      .object({
        mode: z.enum(['FULL', 'MINI']).default('FULL'),
        formationType: z.string().default('UMUM'),
        packageCode: z.enum(['ALL', 'PAKET_1', 'PAKET_2', 'PAKET_3', 'PAKET_4', 'PAKET_5']).default('ALL'),
        scoringConfigId: z.string().optional(),
      })
      .parse(req.body ?? {});

    // Check if there is an active in-progress session that hasn't expired
    const existingActive = await prisma.examinationSession.findFirst({
      where: { userId, status: 'IN_PROGRESS', expiresAt: { gt: new Date() } },
      orderBy: { startedAt: 'desc' },
    });
    if (existingActive && req.query.forceNew !== 'true') {
      return res.json({
        success: true,
        data: { sessionId: existingActive.id, resumed: true },
      });
    }

    const entitlement = await getUserEntitlement(userId);
    if (!entitlement.isPro) {
      if (body.mode === 'FULL') {
        await requireProOrThrow(userId, 'Simulasi CAT Penuh 110 Soal', 'FULL_CAT');
      }
      if (entitlement.usage.miniCatUsed >= FREE_LIMITS.MINI_CAT_LIFETIME_LIMIT) {
        throw new AppError(
          403,
          'Kuota 1× Simulasi CAT Mini 30 Soal gratis Anda telah digunakan. Upgrade ke Nippia Pro untuk Simulasi CAT 110 Soal tanpa batas!',
          'PRO_REQUIRED',
          { feature: 'MINI_CAT_QUOTA', upgradeUrl: '/subscription', priceIdr: 29000 },
        );
      }
    }

    const config = body.scoringConfigId
      ? await prisma.scoringConfiguration.findUnique({ where: { id: body.scoringConfigId } })
      : await prisma.scoringConfiguration.findFirst({
          where: { isActive: true },
          orderBy: { year: 'desc' },
        });

    if (!config) {
      throw new AppError(400, 'Konfigurasi penilaian SKD belum tersedia.');
    }

    const prefs = await prisma.userPreference.findUnique({ where: { userId } });
    const useDisabilityTime = entitlement.isPro ? (prefs?.disabilityExtraTime ?? false) : false;

    const twkNeed = body.mode === 'MINI' ? 8 : config.twkQuestionCount;
    const tiuNeed = body.mode === 'MINI' ? 10 : config.tiuQuestionCount;
    const tkpNeed = body.mode === 'MINI' ? 12 : config.tkpQuestionCount;

    const published = await prisma.question.findMany({
      where: {
        status: 'PUBLISHED',
        ...(body.packageCode !== 'ALL' ? { packageCode: body.packageCode } : {}),
      },
      include: { subject: true },
    });

    const twkPool = shuffle(published.filter((q) => q.subject.code === 'TWK')).slice(0, twkNeed);
    const tiuPool = shuffle(published.filter((q) => q.subject.code === 'TIU')).slice(0, tiuNeed);
    const tkpPool = shuffle(published.filter((q) => q.subject.code === 'TKP')).slice(0, tkpNeed);

    const selected = [...twkPool, ...tiuPool, ...tkpPool];
    if (selected.length === 0) {
      throw new AppError(400, 'Bank soal terpublikasi kosong.');
    }

    const pkgLabelMap: Record<string, string> = {
      ALL: 'Campuran',
      PAKET_1: 'Paket 1',
      PAKET_2: 'Paket 2',
      PAKET_3: 'Paket 3',
      PAKET_4: 'Paket 4',
      PAKET_5: 'Paket 5',
    };
    const pkgLabel = pkgLabelMap[body.packageCode] ?? 'Campuran';

    const durationMins =
      body.mode === 'MINI'
        ? 30
        : useDisabilityTime
          ? config.disabilityMins
          : config.durationMinutes;
    const durationSec = durationMins * 60;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationSec * 1000);

    const session = await prisma.$transaction(async (tx) => {
      const created = await tx.examinationSession.create({
        data: {
          userId,
          scoringConfigId: config.id,
          title:
            body.mode === 'MINI'
              ? `Simulasi Mini CAT — ${pkgLabel} (${selected.length} Soal)`
              : `Simulasi CAT SKD ${config.year} — ${pkgLabel} (${selected.length} Soal)`,
          isOfficialStyle: config.isOfficialStyle && body.mode === 'FULL',
          formationType: body.formationType,
          status: 'IN_PROGRESS',
          questionIds: selected.map((q) => q.id),
          durationSec,
          startedAt: now,
          expiresAt,
          twkMaxScore: twkPool.length * config.twkCorrectPoints,
          tiuMaxScore: tiuPool.length * config.tiuCorrectPoints,
          tkpMaxScore: tkpPool.length * config.tkpMaxPoints,
          totalMaxScore:
            twkPool.length * config.twkCorrectPoints +
            tiuPool.length * config.tiuCorrectPoints +
            tkpPool.length * config.tkpMaxPoints,
        },
      });

      await tx.examinationAnswer.createMany({
        data: selected.map((q, idx) => ({
          sessionId: created.id,
          userId,
          questionId: q.id,
          orderIndex: idx,
          maxScore:
            q.subject.code === 'TWK'
              ? config.twkCorrectPoints
              : q.subject.code === 'TIU'
                ? config.tiuCorrectPoints
                : config.tkpMaxPoints,
        })),
      });

      return created;
    });

    res.status(201).json({ success: true, data: { sessionId: session.id, resumed: false } });
  }),
);

examRouter.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const session = await prisma.examinationSession.findFirst({
      where: { id: String(req.params.id), userId },
      include: {
        scoringConfig: { include: { passingGrades: true } },
        answers: { orderBy: { orderIndex: 'asc' } },
      },
    });
    if (!session) throw new AppError(404, 'Sesi ujian tidak ditemukan.');

    const questionsRaw = await prisma.question.findMany({
      where: { id: { in: session.questionIds } },
      include: {
        subject: true,
        topic: true,
        options: { orderBy: { optionKey: 'asc' } },
        references: true,
      },
    });
    const qMap = new Map(questionsRaw.map((q) => [q.id, q]));
    const ansMap = new Map(session.answers.map((a) => [a.questionId, a]));

    const isSubmitted = session.status === 'SUBMITTED';
    const remainingSec = isSubmitted
      ? 0
      : Math.max(0, Math.floor((session.expiresAt.getTime() - Date.now()) / 1000));
    const optionOrderMap = buildOptionOrderMap(session.questionIds, session.id, true);

    res.json({
      success: true,
      data: {
        session: {
          ...session,
          remainingSec,
        },
        questions: session.questionIds
          .map((qId, idx) => {
            const q = qMap.get(qId);
            if (!q) return null;
            const ans = ansMap.get(qId);
            return {
              orderIndex: idx,
              id: q.id,
              code: q.code,
              subjectCode: q.subject.code,
              topicName: q.topic.name,
              topicSlug: q.topic.slug,
              questionType: q.questionType,
              difficulty: q.difficulty,
              stem: q.stem,
              visualSpec: q.visualSpec,
              selectedKey: originalKeyToDisplay(optionOrderMap, q.id, ans?.selectedKey ?? null),
              isFlagged: ans?.isFlagged ?? false,
              isCorrect: isSubmitted ? ans?.isCorrect ?? false : undefined,
              scoreEarned: isSubmitted ? ans?.scoreEarned ?? 0 : undefined,
              options: remapOptionsForDisplay(q.options, optionOrderMap, q.id, isSubmitted),
              ...(isSubmitted
                ? {
                    explanation: remapOptionMentions(q.explanation, optionOrderMap, q.id),
                    conceptSummary: q.conceptSummary,
                    stepByStep: remapStepByStep(q.stepByStep, optionOrderMap, q.id),
                    whyOthersWrong: remapWhyOthersWrong(q.whyOthersWrong, optionOrderMap, q.id),
                    quickTrick: q.quickTrick,
                    commonMistakes: q.commonMistakes,
                    references: q.references,
                  }
                : {}),
            };
          })
          .filter(Boolean),
      },
    });
  }),
);

examRouter.patch(
  '/:id/answer',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const body = z
      .object({
        questionId: z.string(),
        selectedKey: z.enum(['A', 'B', 'C', 'D', 'E']).nullable().optional(),
        isFlagged: z.boolean().optional(),
        timeSpentSec: z.number().int().min(0).max(7200).optional(),
      })
      .parse(req.body);

    const session = await prisma.examinationSession.findFirst({
      where: { id: String(req.params.id), userId },
    });
    if (!session) throw new AppError(404, 'Sesi ujian tidak ditemukan.');
    if (session.status === 'SUBMITTED') {
      throw new AppError(400, 'Ujian sudah dikumpulkan dan tidak dapat diubah.');
    }
    if (new Date() >= session.expiresAt) {
      throw new AppError(
        400,
        'Waktu ujian simulasi telah berakhir. Silakan kumpulkan sesi Anda.',
        'EXAM_TIME_EXPIRED',
      );
    }
    if (!session.questionIds.includes(body.questionId)) {
      throw new AppError(400, 'Soal tidak terdaftar dalam sesi ujian ini.', 'QUESTION_NOT_IN_SESSION');
    }

    const optionOrderMap = buildOptionOrderMap(session.questionIds, session.id, true);
    const originalSelectedKey =
      body.selectedKey !== undefined
        ? displayKeyToOriginal(optionOrderMap, body.questionId, body.selectedKey)
        : undefined;

    const updated = await prisma.examinationAnswer.update({
      where: { sessionId_questionId: { sessionId: session.id, questionId: body.questionId } },
      data: {
        ...(originalSelectedKey !== undefined ? { selectedKey: originalSelectedKey } : {}),
        ...(body.isFlagged !== undefined ? { isFlagged: body.isFlagged } : {}),
        ...(body.timeSpentSec !== undefined ? { timeSpentSec: body.timeSpentSec } : {}),
      },
    });

    res.json({
      success: true,
      data: {
        ...updated,
        selectedKey:
          body.selectedKey !== undefined
            ? body.selectedKey
            : originalKeyToDisplay(optionOrderMap, body.questionId, updated.selectedKey),
      },
    });
  }),
);

/**
 * Submits CAT examination inside a serializable/atomic database transaction
 * with idempotency protection so duplicate submissions never corrupt scores or XP.
 */
examRouter.post(
  '/:id/submit',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const submissionToken =
      typeof req.body?.submissionToken === 'string' && req.body.submissionToken.length > 0
        ? req.body.submissionToken
        : crypto.randomUUID();

    const result = await prisma.$transaction(async (tx) => {
      const session = await tx.examinationSession.findFirst({
        where: { id: String(req.params.id), userId },
        include: {
          scoringConfig: { include: { passingGrades: true } },
          answers: { orderBy: { orderIndex: 'asc' } },
        },
      });

      if (!session) throw new AppError(404, 'Sesi ujian tidak ditemukan.');

      if (session.status === 'SUBMITTED') {
        return { session, alreadySubmitted: true };
      }

      const questions = await tx.question.findMany({
        where: { id: { in: session.questionIds } },
        include: { subject: true, options: true },
      });
      const qMap = new Map(questions.map((q) => [q.id, q]));

      const rule: ScoringRuleConfig = {
        id: session.scoringConfig.id,
        name: session.scoringConfig.name,
        year: session.scoringConfig.year,
        isOfficialStyle: session.scoringConfig.isOfficialStyle,
        sourceReference: session.scoringConfig.sourceReference,
        durationMinutes: session.scoringConfig.durationMinutes,
        disabilityMins: session.scoringConfig.disabilityMins,
        twkQuestionCount: session.scoringConfig.twkQuestionCount,
        tiuQuestionCount: session.scoringConfig.tiuQuestionCount,
        tkpQuestionCount: session.scoringConfig.tkpQuestionCount,
        twkCorrectPoints: session.scoringConfig.twkCorrectPoints,
        twkWrongPoints: session.scoringConfig.twkWrongPoints,
        tiuCorrectPoints: session.scoringConfig.tiuCorrectPoints,
        tiuWrongPoints: session.scoringConfig.tiuWrongPoints,
        tkpMinPoints: session.scoringConfig.tkpMinPoints,
        tkpMaxPoints: session.scoringConfig.tkpMaxPoints,
        unansweredPoints: session.scoringConfig.unansweredPoints,
        version: session.scoringConfig.version,
      };

      const passingRule =
        session.scoringConfig.passingGrades.find(
          (pg) => pg.formationType === session.formationType && pg.isActive,
        ) ?? session.scoringConfig.passingGrades[0] ?? null;

      const evaluatedList = [];
      for (const ans of session.answers) {
        const q = qMap.get(ans.questionId);
        if (!q) continue;
        const evalRes = evaluateSingleAnswer(
          {
            questionId: q.id,
            subjectCode: q.subject.code,
            selectedKey: ans.selectedKey,
            options: q.options,
          },
          rule,
        );
        evaluatedList.push(evalRes);

        await tx.examinationAnswer.update({
          where: { id: ans.id },
          data: {
            isCorrect: evalRes.isCorrect,
            scoreEarned: evalRes.scoreEarned,
            maxScore: evalRes.maxScore,
          },
        });

        // Record wrong/suboptimal answers to Error Notebook
        if (ans.selectedKey && !evalRes.isCorrect) {
          const nextReviewAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
          await tx.errorNotebook.upsert({
            where: { userId_questionId: { userId, questionId: q.id } },
            update: {
              lastSelectedKey: ans.selectedKey,
              wrongCount: { increment: 1 },
              reviewStage: 0,
              isMastered: false,
              lastAttemptAt: new Date(),
              nextReviewAt,
            },
            create: {
              userId,
              questionId: q.id,
              lastSelectedKey: ans.selectedKey,
              wrongCount: 1,
              reviewStage: 0,
              isMastered: false,
              nextReviewAt,
            },
          });
        }
      }

      const summary = calculateExaminationSummary(evaluatedList, rule, passingRule);
      const answeredCount = evaluatedList.filter((e) => Boolean(e.selectedKey)).length;
      const xpAwarded = Math.min(250, 40 + Math.round((summary.totalScore / Math.max(1, summary.totalMaxScore)) * 200));

      const updatedSession = await tx.examinationSession.update({
        where: { id: session.id },
        data: {
          status: 'SUBMITTED',
          submittedAt: new Date(),
          submissionToken,
          twkScore: summary.twkScore,
          tiuScore: summary.tiuScore,
          tkpScore: summary.tkpScore,
          totalScore: summary.totalScore,
          twkPassed: summary.twkPassed,
          tiuPassed: summary.tiuPassed,
          tkpPassed: summary.tkpPassed,
          overallPassed: summary.overallPassed,
          twkMaxScore: summary.twkMaxScore,
          tiuMaxScore: summary.tiuMaxScore,
          tkpMaxScore: summary.tkpMaxScore,
          totalMaxScore: summary.totalMaxScore,
          xpAwarded,
          scoringSnapshot: {
            ...summary,
            answeredCount,
            passingThresholds: passingRule
              ? {
                  twk: passingRule.twkThreshold,
                  tiu: passingRule.tiuThreshold,
                  tkp: passingRule.tkpThreshold,
                  formationType: passingRule.formationType,
                  year: passingRule.year,
                  sourceDocument: passingRule.sourceDocument,
                }
              : null,
          } as object,
        },
      });

      return { session: updatedSession, alreadySubmitted: false, summary, answeredCount };
    });

    if (!result.alreadySubmitted) {
      const today = getTodayWibString();
      const elapsedSec = Math.min(
        result.session.durationSec,
        Math.max(1, Math.floor((Date.now() - result.session.startedAt.getTime()) / 1000)),
      );
      await prisma.dailyActivity.upsert({
        where: { userId_date: { userId, date: today } },
        update: {
          questionsAnswered: { increment: result.answeredCount ?? 0 },
          studyTimeSec: { increment: elapsedSec },
          simulationsDone: { increment: 1 },
        },
        create: {
          userId,
          date: today,
          questionsAnswered: result.answeredCount ?? 0,
          studyTimeSec: elapsedSec,
          simulationsDone: 1,
        },
      });

      await awardXpIdempotent(
        userId,
        result.session.xpAwarded,
        'SIMULATION',
        result.session.id,
        `Menyelesaikan ${result.session.title}`,
      );
      await updateDailyStreak(userId);
      await recomputeUserAnalytics(userId);
      await evaluateAchievements(userId);
    }

    res.json({
      success: true,
      data: {
        session: result.session,
        alreadySubmitted: result.alreadySubmitted,
      },
    });
  }),
);
