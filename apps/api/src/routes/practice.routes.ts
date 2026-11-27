import { Router } from 'express';
import { z } from 'zod';
import { classifyMastery, MASTERY_LABELS } from '@nippia/shared';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { prisma } from '../lib/prisma.js';
import { evaluateSingleAnswer } from '../services/scoring.service.js';
import { recomputeUserAnalytics } from '../services/analytics.service.js';
import { awardXpIdempotent, evaluateAchievements, getTodayWibString, updateDailyStreak } from '../services/gamification.service.js';
import {
  buildSubjectCampaignUnits,
  computeCampaignStars,
  getUserCampaignOverview,
} from '../services/campaign.service.js';
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

export const practiceRouter = Router();

const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14];

async function getActiveScoringRule() {
  const cfg = await prisma.scoringConfiguration.findFirst({
    where: { isActive: true },
    orderBy: { year: 'desc' },
  });
  if (cfg) return cfg;
  return {
    id: 'default',
    name: 'Default SKD',
    year: 2026,
    isOfficialStyle: true,
    sourceReference: 'Default',
    durationMinutes: 100,
    disabilityMins: 130,
    twkQuestionCount: 30,
    tiuQuestionCount: 35,
    tkpQuestionCount: 45,
    twkCorrectPoints: 5,
    twkWrongPoints: 0,
    tiuCorrectPoints: 5,
    tiuWrongPoints: 0,
    tkpMinPoints: 1,
    tkpMaxPoints: 5,
    unansweredPoints: 0,
    version: 1,
  };
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

practiceRouter.get(
  '/topics',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const [topics, masteries, questionCounts, difficultyGroups] = await Promise.all([
      prisma.topic.findMany({
        include: { subject: true },
        orderBy: [{ subject: { orderIndex: 'asc' } }, { orderIndex: 'asc' }],
      }),
      prisma.topicMastery.findMany({ where: { userId } }),
      prisma.question.groupBy({
        by: ['topicId'],
        where: { status: 'PUBLISHED' },
        _count: { _all: true },
      }),
      prisma.question.groupBy({
        by: ['topicId', 'difficulty'],
        where: { status: 'PUBLISHED' },
        _count: { _all: true },
      }),
    ]);

    const masteryMap = new Map(masteries.map((m) => [m.topicId, m]));
    const countMap = new Map(questionCounts.map((c) => [c.topicId, c._count._all]));

    const result = topics.map((t) => {
      const m = masteryMap.get(t.id);
      const diffs = difficultyGroups.filter((d) => d.topicId === t.id);
      const diffDist = {
        EASY: diffs.find((d) => d.difficulty === 'EASY')?._count._all ?? 0,
        MEDIUM: diffs.find((d) => d.difficulty === 'MEDIUM')?._count._all ?? 0,
        HARD: diffs.find((d) => d.difficulty === 'HARD')?._count._all ?? 0,
      };
      const attempts = m?.attemptsCount ?? 0;
      const accuracy = m?.accuracyPct ?? 0;
      const level = classifyMastery(accuracy, attempts);

      return {
        id: t.id,
        slug: t.slug,
        name: t.name,
        category: t.category,
        description: t.description,
        subjectCode: t.subject.code,
        subjectName: t.subject.name,
        totalQuestions: countMap.get(t.id) ?? 0,
        completedCount: attempts,
        accuracyPct: accuracy,
        masteryLevel: level,
        masteryLabel: MASTERY_LABELS[level],
        difficultyDistribution: diffDist,
        lastPracticedAt: m?.lastPracticedAt ?? null,
      };
    });

    res.json({ success: true, data: result });
  }),
);

/**
 * Starts an adaptive Daily Practice session prioritizing weak topics, unpracticed topics,
 * and due spaced-repetition questions.
 */
practiceRouter.post(
  '/daily/start',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const body = z
      .object({
        twkCount: z.number().int().min(0).max(30).optional(),
        tiuCount: z.number().int().min(0).max(35).optional(),
        tkpCount: z.number().int().min(0).max(45).optional(),
      })
      .parse(req.body ?? {});

    const entitlement = await getUserEntitlement(userId);
    if (!entitlement.isPro) {
      if (entitlement.usage.todayPracticeSessionsUsed >= FREE_LIMITS.DAILY_PRACTICE_SESSIONS_PER_DAY) {
        throw new AppError(
          403,
          'Kuota Paket Free: maksimal 1 sesi latihan (Harian/Topik) per hari sudah digunakan. Upgrade ke Nippia Pro untuk latihan tanpa batas!',
          'PRO_REQUIRED',
          { feature: 'DAILY_PRACTICE_LIMIT', upgradeUrl: '/subscription', priceIdr: 29000 },
        );
      }
      if (body.twkCount !== undefined || body.tiuCount !== undefined || body.tkpCount !== undefined) {
        const reqTotal = (body.twkCount ?? 0) + (body.tiuCount ?? 0) + (body.tkpCount ?? 0);
        if (reqTotal > FREE_LIMITS.MAX_QUESTIONS_PER_SESSION) {
          throw new AppError(
            403,
            `Paket Free maksimal ${FREE_LIMITS.MAX_QUESTIONS_PER_SESSION} soal per sesi latihan. Upgrade ke Nippia Pro untuk target soal harian penuh!`,
            'PRO_REQUIRED',
            { feature: 'DAILY_QUESTION_CAP', upgradeUrl: '/subscription', priceIdr: 29000 },
          );
        }
      }
    }

    const prefs = await prisma.userPreference.findUnique({ where: { userId } });
    const twkCount = entitlement.isPro ? (body.twkCount ?? prefs?.dailyTwkTarget ?? 10) : (body.twkCount ?? 3);
    const tiuCount = entitlement.isPro ? (body.tiuCount ?? prefs?.dailyTiuTarget ?? 10) : (body.tiuCount ?? 3);
    const tkpCount = entitlement.isPro ? (body.tkpCount ?? prefs?.dailyTkpTarget ?? 10) : (body.tkpCount ?? 4);

    const [masteries, dueErrors, allQuestions] = await Promise.all([
      prisma.topicMastery.findMany({ where: { userId } }),
      prisma.errorNotebook.findMany({
        where: { userId, isMastered: false, nextReviewAt: { lte: new Date() } },
        select: { questionId: true },
      }),
      prisma.question.findMany({
        where: { status: 'PUBLISHED' },
        include: { subject: true },
      }),
    ]);

    const masteryMap = new Map(masteries.map((m) => [m.topicId, m]));
    const dueErrorSet = new Set(dueErrors.map((e) => e.questionId));

    const pickAdaptive = (subj: 'TWK' | 'TIU' | 'TKP', limit: number) => {
      if (limit <= 0) return [];
      const pool = allQuestions.filter((q) => q.subject.code === subj);
      const scored = pool.map((q) => {
        const m = masteryMap.get(q.topicId);
        let priority = Math.random() * 15;
        if (dueErrorSet.has(q.id)) priority += 40; // due spaced repetition
        if (!m || m.attemptsCount === 0) priority += 25; // never practiced
        else if (m.accuracyPct < 70) priority += 30 - m.accuracyPct * 0.2; // weak topic
        return { q, priority };
      });
      scored.sort((a, b) => b.priority - a.priority);
      return scored.slice(0, limit).map((s) => s.q);
    };

    const chosen = [
      ...pickAdaptive('TWK', twkCount),
      ...pickAdaptive('TIU', tiuCount),
      ...pickAdaptive('TKP', tkpCount),
    ];

    if (chosen.length === 0) {
      throw new AppError(400, 'Belum ada soal tersedia untuk latihan harian.');
    }

    const session = await prisma.practiceSession.create({
      data: {
        userId,
        sessionType: 'DAILY',
        mode: 'PRACTICE',
        status: 'IN_PROGRESS',
        title: `Latihan Harian Adaptif (${chosen.length} Soal)`,
        questionIds: chosen.map((q) => q.id),
        totalQuestions: chosen.length,
        maxScore: chosen.length * 5,
      },
    });

    res.status(201).json({ success: true, data: { sessionId: session.id } });
  }),
);

/**
 * Returns Daily Campaign learning tracks (TWK, TIU, TKP), 10 questions per unit,
 * with sequential unlock status and per-unit mastery stars.
 */
practiceRouter.get(
  '/campaign',
  requireAuth,
  asyncHandler(async (req, res) => {
    const overview = await getUserCampaignOverview(req.user!.userId);
    res.json({ success: true, data: overview });
  }),
);

/**
 * Starts or resumes a Campaign unit session (10 questions).
 * Enforces sequential unit lock: unit N requires unit N-1 to be completed.
 */
practiceRouter.post(
  '/campaign/start',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const { subjectCode, unitNumber } = z
      .object({
        subjectCode: z.enum(['TWK', 'TIU', 'TKP']),
        unitNumber: z.number().int().min(1),
      })
      .parse(req.body);

    if (unitNumber > FREE_LIMITS.CAMPAIGN_MAX_UNIT) {
      await requireProOrThrow(
        userId,
        `Campaign ${subjectCode} Unit ${unitNumber} ke atas`,
        'CAMPAIGN_PRO_UNIT',
      );
    }

    const units = await buildSubjectCampaignUnits(subjectCode);
    const targetUnit = units.find((u) => u.unitNumber === unitNumber);
    if (!targetUnit) {
      throw new AppError(404, `Unit ${unitNumber} pada jalur ${subjectCode} tidak ditemukan.`);
    }

    if (unitNumber > 1) {
      const [prevProgress, currentProgress] = await Promise.all([
        prisma.campaignUnitProgress.findUnique({
          where: {
            userId_subjectCode_unitNumber: {
              userId,
              subjectCode,
              unitNumber: unitNumber - 1,
            },
          },
        }),
        prisma.campaignUnitProgress.findUnique({
          where: {
            userId_subjectCode_unitNumber: {
              userId,
              subjectCode,
              unitNumber,
            },
          },
        }),
      ]);
      if (!prevProgress?.isCompleted && !currentProgress?.isCompleted) {
        throw new AppError(
          403,
          `Unit ${unitNumber} masih terkunci. Selesaikan Unit ${unitNumber - 1} (${subjectCode}) terlebih dahulu.`,
        );
      }
    }

    // Resume unfinished session if already started
    const existingActive = await prisma.practiceSession.findFirst({
      where: {
        userId,
        sessionType: 'CAMPAIGN',
        subjectCode,
        campaignUnit: unitNumber,
        status: 'IN_PROGRESS',
      },
      orderBy: { startedAt: 'desc' },
    });
    if (existingActive) {
      return res.status(200).json({
        success: true,
        data: { sessionId: existingActive.id, resumed: true },
      });
    }

    const session = await prisma.practiceSession.create({
      data: {
        userId,
        sessionType: 'CAMPAIGN',
        mode: 'PRACTICE',
        status: 'IN_PROGRESS',
        title: `Campaign ${subjectCode} • Unit ${unitNumber}: ${targetUnit.title}`,
        subjectCode,
        campaignUnit: unitNumber,
        questionIds: targetUnit.questionIds,
        totalQuestions: targetUnit.questionIds.length,
        maxScore: targetUnit.questionIds.length * 5,
      },
    });

    res.status(201).json({
      success: true,
      data: { sessionId: session.id, resumed: false },
    });
  }),
);

/**
 * Starts a configurable Topic Drilling session.
 */
practiceRouter.post(
  '/topic/start',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const body = z
      .object({
        topicSlug: z.string().min(1),
        questionCount: z.number().int().min(1).max(50).default(10),
        difficulty: z.enum(['MIXED', 'EASY', 'MEDIUM', 'HARD']).default('MIXED'),
        mode: z.enum(['PRACTICE', 'EXAM']).default('PRACTICE'),
        includeWrong: z.boolean().default(false),
        avoidRecent: z.boolean().default(false),
        timeLimitMinutes: z.number().int().min(1).max(120).optional(),
      })
      .parse(req.body);

    const topic = await prisma.topic.findUnique({
      where: { slug: body.topicSlug },
      include: { subject: true },
    });
    if (!topic) throw new AppError(404, 'Topik tidak ditemukan.');

    const entitlement = await getUserEntitlement(userId);
    if (!entitlement.isPro) {
      if (entitlement.usage.todayPracticeSessionsUsed >= FREE_LIMITS.DAILY_PRACTICE_SESSIONS_PER_DAY) {
        throw new AppError(
          403,
          'Kuota Paket Free: maksimal 1 sesi latihan per hari sudah digunakan. Upgrade ke Nippia Pro untuk Drilling 24 Topik tanpa batas!',
          'PRO_REQUIRED',
          { feature: 'DAILY_PRACTICE_LIMIT', upgradeUrl: '/subscription', priceIdr: 29000 },
        );
      }
      if (body.questionCount > FREE_LIMITS.MAX_QUESTIONS_PER_SESSION) {
        throw new AppError(
          403,
          `Paket Free maksimal ${FREE_LIMITS.MAX_QUESTIONS_PER_SESSION} soal per sesi. Upgrade ke Nippia Pro untuk hingga 50 soal per sesi.`,
          'PRO_REQUIRED',
          { feature: 'TOPIC_QUESTION_CAP', upgradeUrl: '/subscription', priceIdr: 29000 },
        );
      }
      if (body.difficulty !== 'MIXED') {
        throw new AppError(
          403,
          'Filter tingkat kesulitan spesifik (EASY/MEDIUM/HARD) hanya tersedia pada Nippia Pro.',
          'PRO_REQUIRED',
          { feature: 'TOPIC_DIFFICULTY_FILTER', upgradeUrl: '/subscription', priceIdr: 29000 },
        );
      }
      if (body.mode === 'EXAM') {
        throw new AppError(
          403,
          'Mode Ujian berwaktu pada Latihan per Topik hanya tersedia pada Nippia Pro.',
          'PRO_REQUIRED',
          { feature: 'TOPIC_EXAM_MODE', upgradeUrl: '/subscription', priceIdr: 29000 },
        );
      }
      if (body.includeWrong || body.avoidRecent) {
        throw new AppError(
          403,
          'Opsi prioritaskan soal salah & hindari soal baru dijawab khusus untuk Nippia Pro.',
          'PRO_REQUIRED',
          { feature: 'TOPIC_SMART_OPTIONS', upgradeUrl: '/subscription', priceIdr: 29000 },
        );
      }
    }

    let pool = await prisma.question.findMany({
      where: {
        topicId: topic.id,
        status: 'PUBLISHED',
        ...(body.difficulty !== 'MIXED' ? { difficulty: body.difficulty } : {}),
      },
    });

    // Fallback to all difficulties in topic if specific difficulty yields 0
    if (pool.length === 0 && body.difficulty !== 'MIXED') {
      pool = await prisma.question.findMany({
        where: { topicId: topic.id, status: 'PUBLISHED' },
      });
    }

    if (pool.length === 0) {
      throw new AppError(400, 'Belum ada soal terpublikasi untuk topik ini.');
    }

    if (body.avoidRecent) {
      const recent = await prisma.practiceAnswer.findMany({
        where: { userId },
        orderBy: { answeredAt: 'desc' },
        take: 30,
        select: { questionId: true },
      });
      const recentIds = new Set(recent.map((r) => r.questionId));
      const filtered = pool.filter((q) => !recentIds.has(q.id));
      if (filtered.length > 0) pool = filtered;
    }

    let selected = shuffleArray(pool);

    if (body.includeWrong) {
      const wrongs = await prisma.errorNotebook.findMany({
        where: { userId, isMastered: false, question: { topicId: topic.id } },
        select: { questionId: true },
      });
      const wrongSet = new Set(wrongs.map((w) => w.questionId));
      selected.sort((a, b) => (wrongSet.has(b.id) ? 1 : 0) - (wrongSet.has(a.id) ? 1 : 0));
    }

    selected = selected.slice(0, Math.min(body.questionCount, selected.length));

    const session = await prisma.practiceSession.create({
      data: {
        userId,
        sessionType: 'TOPIC_DRILL',
        mode: body.mode,
        status: 'IN_PROGRESS',
        title: `${topic.subject.code} — ${topic.name}`,
        topicId: topic.id,
        subjectCode: topic.subject.code,
        questionIds: selected.map((q) => q.id),
        totalQuestions: selected.length,
        maxScore: selected.length * 5,
        timeLimitSec: body.timeLimitMinutes ? body.timeLimitMinutes * 60 : null,
      },
    });

    res.status(201).json({ success: true, data: { sessionId: session.id } });
  }),
);

practiceRouter.post(
  '/error-review/start',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    await requireProOrThrow(
      userId,
      'Latih Ulang Soal Salah (Spaced Repetition)',
      'ERROR_REVIEW',
    );
    const errors = await prisma.errorNotebook.findMany({
      where: { userId, isMastered: false },
      orderBy: { nextReviewAt: 'asc' },
      take: 15,
    });

    if (errors.length === 0) {
      throw new AppError(400, 'Tidak ada soal yang perlu diulang di Buku Kesalahan Anda saat ini.');
    }

    const session = await prisma.practiceSession.create({
      data: {
        userId,
        sessionType: 'ERROR_REVIEW',
        mode: 'PRACTICE',
        status: 'IN_PROGRESS',
        title: `Ulasan Buku Kesalahan (${errors.length} Soal)`,
        questionIds: errors.map((e) => e.questionId),
        totalQuestions: errors.length,
        maxScore: errors.length * 5,
      },
    });

    res.status(201).json({ success: true, data: { sessionId: session.id } });
  }),
);

function buildTopicsToImprove(
  answers: Array<{ selectedKey: string | null; isCorrect: boolean; question: { topic: { id: string; name: string; slug: string } } }>,
) {
  const topicSummary = new Map<string, { name: string; slug: string; total: number; wrong: number }>();
  for (const ans of answers) {
    if (!ans.selectedKey) continue;
    const t = ans.question.topic;
    const cur = topicSummary.get(t.id) ?? { name: t.name, slug: t.slug, total: 0, wrong: 0 };
    cur.total++;
    if (!ans.isCorrect) cur.wrong++;
    topicSummary.set(t.id, cur);
  }
  return [...topicSummary.values()]
    .filter((t) => t.wrong > 0)
    .sort((a, b) => b.wrong - a.wrong)
    .slice(0, 3);
}

practiceRouter.get(
  '/sessions/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const session = await prisma.practiceSession.findFirst({
      where: { id: String(req.params.id), userId },
      include: { answers: { include: { question: { include: { topic: true } } } } },
    });
    if (!session) throw new AppError(404, 'Sesi latihan tidak ditemukan.');

    const questionsRaw = await prisma.question.findMany({
      where: { id: { in: session.questionIds } },
      include: {
        subject: true,
        topic: true,
        subtopic: true,
        options: { orderBy: { optionKey: 'asc' } },
        references: true,
      },
    });
    const qMap = new Map(questionsRaw.map((q) => [q.id, q]));
    const orderedQuestions = session.questionIds.map((id) => qMap.get(id)).filter(Boolean);

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId, questionId: { in: session.questionIds } },
      select: { questionId: true },
    });
    const bookmarkSet = new Set(bookmarks.map((b) => b.questionId));
    const answerMap = new Map(session.answers.map((a) => [a.questionId, a]));

    const revealAnswers = session.mode === 'PRACTICE' || session.status === 'SUBMITTED';
    const optionOrderMap = buildOptionOrderMap(session.questionIds, session.id, true);

    let summary: Record<string, unknown> | null = null;
    if (session.status === 'SUBMITTED') {
      const answered = session.answers.filter((a) => Boolean(a.selectedKey));
      let campaignProgress: Record<string, unknown> | null = null;
      if (session.sessionType === 'CAMPAIGN' && session.subjectCode && session.campaignUnit) {
        const [prog, units] = await Promise.all([
          prisma.campaignUnitProgress.findUnique({
            where: {
              userId_subjectCode_unitNumber: {
                userId,
                subjectCode: session.subjectCode,
                unitNumber: session.campaignUnit,
              },
            },
          }),
          buildSubjectCampaignUnits(session.subjectCode),
        ]);
        const nextUnit = session.campaignUnit < units.length ? session.campaignUnit + 1 : null;
        const accuracyPct = answered.length > 0 ? Math.round((session.correctCount / answered.length) * 100) : 0;
        campaignProgress = {
          subjectCode: session.subjectCode,
          unitNumber: session.campaignUnit,
          isCompleted: Boolean(prog?.isCompleted && answered.length >= session.totalQuestions),
          justUnlockedNext: false,
          nextUnitNumber: nextUnit,
          stars: computeCampaignStars({
            subjectCode: session.subjectCode,
            accuracyPct,
            earnedScore: session.earnedScore,
            maxScore: session.maxScore,
            isCompleted: answered.length >= session.totalQuestions,
          }),
          bonusCampaignXp: 0,
          totalUnits: units.length,
        };
      }
      summary = {
        totalQuestions: session.totalQuestions,
        answeredCount: answered.length,
        correctCount: session.correctCount,
        incorrectCount: answered.length - session.correctCount,
        accuracyPct: answered.length > 0 ? Math.round((session.correctCount / answered.length) * 100) : 0,
        earnedScore: session.earnedScore,
        maxScore: session.maxScore,
        xpEarned: session.xpAwarded,
        campaignProgress,
        topicsToImprove: buildTopicsToImprove(session.answers),
        newAchievements: [],
      };
    }

    res.json({
      success: true,
      data: {
        session,
        summary,
        questions: orderedQuestions.map((q) => {
          const ans = answerMap.get(q!.id);
          const showDetail = revealAnswers && (session.status === 'SUBMITTED' || Boolean(ans?.selectedKey));
          return {
            id: q!.id,
            code: q!.code,
            subjectCode: q!.subject.code,
            topicName: q!.topic.name,
            topicSlug: q!.topic.slug,
            subtopicName: q!.subtopic?.name ?? null,
            questionType: q!.questionType,
            difficulty: q!.difficulty,
            stem: q!.stem,
            visualSpec: q!.visualSpec,
            isBookmarked: bookmarkSet.has(q!.id),
            userAnswer: ans
              ? {
                  selectedKey: originalKeyToDisplay(optionOrderMap, q!.id, ans.selectedKey),
                  isCorrect: ans.isCorrect,
                  scoreEarned: ans.scoreEarned,
                }
              : null,
            options: remapOptionsForDisplay(q!.options, optionOrderMap, q!.id, showDetail),
            ...(showDetail
              ? {
                  explanation: remapOptionMentions(q!.explanation, optionOrderMap, q!.id),
                  conceptSummary: q!.conceptSummary,
                  stepByStep: remapStepByStep(q!.stepByStep, optionOrderMap, q!.id),
                  whyOthersWrong: remapWhyOthersWrong(q!.whyOthersWrong, optionOrderMap, q!.id),
                  quickTrick: q!.quickTrick,
                  commonMistakes: q!.commonMistakes,
                  studyTip: q!.studyTip,
                  references: q!.references,
                }
              : {}),
          };
        }),
      },
    });
  }),
);

practiceRouter.post(
  '/sessions/:id/answer',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const { questionId, selectedKey, timeSpentSec, isFlagged } = z
      .object({
        questionId: z.string(),
        selectedKey: z.enum(['A', 'B', 'C', 'D', 'E']).nullable().optional(),
        timeSpentSec: z.number().int().min(0).max(3600).default(15),
        isFlagged: z.boolean().optional(),
      })
      .parse(req.body);

    const session = await prisma.practiceSession.findFirst({
      where: { id: String(req.params.id), userId },
    });
    if (!session) throw new AppError(404, 'Sesi latihan tidak ditemukan.');
    if (session.status === 'SUBMITTED') {
      throw new AppError(400, 'Sesi sudah dikumpulkan.');
    }
    if (!session.questionIds.includes(questionId)) {
      throw new AppError(400, 'Soal tidak terdaftar dalam sesi latihan ini.', 'QUESTION_NOT_IN_SESSION');
    }

    const existingAnswer = await prisma.practiceAnswer.findUnique({
      where: { sessionId_questionId: { sessionId: session.id, questionId } },
    });
    if (session.mode === 'PRACTICE' && existingAnswer?.selectedKey) {
      throw new AppError(
        409,
        'Jawaban pada soal ini sudah dikunci dan tidak dapat diubah lagi.',
        'ANSWER_LOCKED',
      );
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { subject: true, options: { orderBy: { optionKey: 'asc' } }, references: true },
    });
    if (!question) throw new AppError(404, 'Soal tidak ditemukan.');

    const optionOrderMap = buildOptionOrderMap(session.questionIds, session.id, true);
    const originalSelectedKey = displayKeyToOriginal(
      optionOrderMap,
      questionId,
      selectedKey ?? null,
    );

    const rule = await getActiveScoringRule();
    const evaluated = evaluateSingleAnswer(
      {
        questionId,
        subjectCode: question.subject.code,
        selectedKey: originalSelectedKey,
        options: question.options,
      },
      rule,
    );

    const saved = await prisma.practiceAnswer.upsert({
      where: { sessionId_questionId: { sessionId: session.id, questionId } },
      update: {
        selectedKey: originalSelectedKey,
        isCorrect: evaluated.isCorrect,
        scoreEarned: evaluated.scoreEarned,
        maxScore: evaluated.maxScore,
        timeSpentSec,
        isFlagged: isFlagged ?? false,
        answeredAt: new Date(),
      },
      create: {
        sessionId: session.id,
        userId,
        questionId,
        selectedKey: originalSelectedKey,
        isCorrect: evaluated.isCorrect,
        scoreEarned: evaluated.scoreEarned,
        maxScore: evaluated.maxScore,
        timeSpentSec,
        isFlagged: isFlagged ?? false,
      },
    });

    // Save/update Error Notebook if wrong (or score < max for TKP)
    if (originalSelectedKey && !evaluated.isCorrect) {
      const nextReviewAt = new Date(Date.now() + REVIEW_INTERVAL_DAYS[0] * 24 * 60 * 60 * 1000);
      await prisma.errorNotebook.upsert({
        where: { userId_questionId: { userId, questionId } },
        update: {
          lastSelectedKey: originalSelectedKey,
          wrongCount: { increment: 1 },
          reviewStage: 0,
          isMastered: false,
          lastAttemptAt: new Date(),
          nextReviewAt,
        },
        create: {
          userId,
          questionId,
          lastSelectedKey: originalSelectedKey,
          wrongCount: 1,
          reviewStage: 0,
          isMastered: false,
          nextReviewAt,
        },
      });
    } else if (originalSelectedKey && evaluated.isCorrect && session.sessionType === 'ERROR_REVIEW') {
      const existingErr = await prisma.errorNotebook.findUnique({
        where: { userId_questionId: { userId, questionId } },
      });
      if (existingErr) {
        const nextStage = existingErr.reviewStage + 1;
        const mastered = nextStage >= REVIEW_INTERVAL_DAYS.length;
        const days = REVIEW_INTERVAL_DAYS[Math.min(nextStage, REVIEW_INTERVAL_DAYS.length - 1)];
        await prisma.errorNotebook.update({
          where: { id: existingErr.id },
          data: {
            reviewStage: nextStage,
            isMastered: mastered,
            lastAttemptAt: new Date(),
            nextReviewAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
          },
        });
      }
    }

    const showFeedback = session.mode === 'PRACTICE' && Boolean(selectedKey);

    res.json({
      success: true,
      data: {
        answer: {
          ...saved,
          selectedKey: selectedKey ?? null,
        },
        feedback: showFeedback
          ? {
              isCorrect: evaluated.isCorrect,
              scoreEarned: evaluated.scoreEarned,
              maxScore: evaluated.maxScore,
              options: remapOptionsForDisplay(question.options, optionOrderMap, questionId, true),
              explanation: remapOptionMentions(question.explanation, optionOrderMap, questionId),
              conceptSummary: question.conceptSummary,
              stepByStep: remapStepByStep(question.stepByStep, optionOrderMap, questionId),
              whyOthersWrong: remapWhyOthersWrong(question.whyOthersWrong, optionOrderMap, questionId),
              quickTrick: question.quickTrick,
              commonMistakes: question.commonMistakes,
              references: question.references,
            }
          : null,
      },
    });
  }),
);

practiceRouter.post(
  '/sessions/:id/submit',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const { timeSpentSec } = z
      .object({ timeSpentSec: z.number().int().min(0).max(14400).optional() })
      .parse(req.body ?? {});

    const session = await prisma.practiceSession.findFirst({
      where: { id: String(req.params.id), userId },
      include: { answers: { include: { question: { include: { topic: true, subject: true } } } } },
    });
    if (!session) throw new AppError(404, 'Sesi latihan tidak ditemukan.');

    if (session.status === 'SUBMITTED') {
      return res.json({ success: true, data: { session, alreadySubmitted: true } });
    }

    const answered = session.answers.filter((a) => Boolean(a.selectedKey));
    const correctCount = answered.filter((a) => a.isCorrect).length;
    const earnedScore = answered.reduce((s, a) => s + a.scoreEarned, 0);
    const maxScore = session.totalQuestions * 5;
    const totalTime = timeSpentSec ?? answered.reduce((s, a) => s + a.timeSpentSec, 0);

    // Fair XP calculation: rewards genuine accuracy & completion, not rapid random guessing
    const accuracyRatio = answered.length > 0 ? correctCount / answered.length : 0;
    const baseCompletionXp = Math.min(30, answered.length * 2);
    const accuracyBonusXp = Math.round(accuracyRatio * answered.length * 3);
    const xpAwarded = baseCompletionXp + accuracyBonusXp;

    const updated = await prisma.practiceSession.update({
      where: { id: session.id },
      data: {
        status: 'SUBMITTED',
        answeredCount: answered.length,
        correctCount,
        earnedScore,
        maxScore,
        xpAwarded,
        timeSpentSec: totalTime,
        completedAt: new Date(),
      },
    });

    const today = getTodayWibString();
    await prisma.dailyActivity.upsert({
      where: { userId_date: { userId, date: today } },
      update: {
        questionsAnswered: { increment: answered.length },
        correctCount: { increment: correctCount },
        studyTimeSec: { increment: totalTime },
      },
      create: {
        userId,
        date: today,
        questionsAnswered: answered.length,
        correctCount,
        studyTimeSec: totalTime,
      },
    });

    // Update daily goal
    const prefs = await prisma.userPreference.findUnique({ where: { userId } });
    const targetCount = (prefs?.dailyTwkTarget ?? 10) + (prefs?.dailyTiuTarget ?? 10) + (prefs?.dailyTkpTarget ?? 10);
    const goal = await prisma.dailyGoal.upsert({
      where: { userId_date: { userId, date: today } },
      update: { completedCount: { increment: answered.length } },
      create: {
        userId,
        date: today,
        targetCount,
        completedCount: answered.length,
        twkTarget: prefs?.dailyTwkTarget ?? 10,
        tiuTarget: prefs?.dailyTiuTarget ?? 10,
        tkpTarget: prefs?.dailyTkpTarget ?? 10,
      },
    });

    let bonusGoalXp = 0;
    if (goal.completedCount >= goal.targetCount && !goal.rewardClaimed) {
      await prisma.dailyGoal.update({
        where: { id: goal.id },
        data: { isCompleted: true, rewardClaimed: true },
      });
      const resGoal = await awardXpIdempotent(
        userId,
        50,
        'DAILY_GOAL',
        today,
        `Target harian ${today} tercapai`,
      );
      if (resGoal.awarded) bonusGoalXp = 50;
    }

    await awardXpIdempotent(
      userId,
      xpAwarded,
      session.sessionType === 'DAILY'
        ? 'DAILY_PRACTICE'
        : session.sessionType === 'CAMPAIGN'
          ? 'CAMPAIGN_PRACTICE'
          : 'TOPIC_DRILL',
      session.id,
      `Menyelesaikan ${session.title}`,
    );

    let campaignProgress: {
      subjectCode: string;
      unitNumber: number;
      isCompleted: boolean;
      justUnlockedNext: boolean;
      nextUnitNumber: number | null;
      stars: number;
      bonusCampaignXp: number;
      totalUnits: number;
    } | null = null;

    if (session.sessionType === 'CAMPAIGN' && session.subjectCode && session.campaignUnit) {
      const subjCode = session.subjectCode;
      const unitNum = session.campaignUnit;
      const allAnswered = answered.length >= session.totalQuestions;
      const accuracyPct = answered.length > 0 ? Math.round((correctCount / answered.length) * 100) : 0;
      const earnedStars = computeCampaignStars({
        subjectCode: subjCode,
        accuracyPct,
        earnedScore,
        maxScore,
        isCompleted: allAnswered,
      });

      const [existingProg, units] = await Promise.all([
        prisma.campaignUnitProgress.findUnique({
          where: {
            userId_subjectCode_unitNumber: { userId, subjectCode: subjCode, unitNumber: unitNum },
          },
        }),
        buildSubjectCampaignUnits(subjCode),
      ]);

      const wasCompleted = Boolean(existingProg?.isCompleted);
      const nowCompleted = wasCompleted || allAnswered;

      await prisma.campaignUnitProgress.upsert({
        where: {
          userId_subjectCode_unitNumber: { userId, subjectCode: subjCode, unitNumber: unitNum },
        },
        update: {
          isCompleted: nowCompleted,
          bestScore: Math.max(existingProg?.bestScore ?? 0, earnedScore),
          bestCorrect: Math.max(existingProg?.bestCorrect ?? 0, correctCount),
          bestAccuracy: Math.max(existingProg?.bestAccuracy ?? 0, accuracyPct),
          stars: Math.max(existingProg?.stars ?? 0, earnedStars),
          attemptsCount: { increment: 1 },
          lastSessionId: session.id,
          completedAt: existingProg?.completedAt ?? (nowCompleted ? new Date() : null),
        },
        create: {
          userId,
          subjectCode: subjCode,
          unitNumber: unitNum,
          isCompleted: nowCompleted,
          bestScore: earnedScore,
          bestCorrect: correctCount,
          bestAccuracy: accuracyPct,
          stars: earnedStars,
          attemptsCount: 1,
          lastSessionId: session.id,
          completedAt: nowCompleted ? new Date() : null,
        },
      });

      let bonusCampaignXp = 0;
      if (nowCompleted && !wasCompleted) {
        const isMilestone = unitNum % 5 === 0 || unitNum === units.length;
        const reward = isMilestone ? 50 : 25;
        const resUnit = await awardXpIdempotent(
          userId,
          reward,
          'CAMPAIGN_UNIT',
          `${subjCode}_UNIT_${unitNum}`,
          `Menuntaskan Campaign ${subjCode} Unit ${unitNum}`,
        );
        if (resUnit.awarded) bonusCampaignXp = reward;
      }

      const nextUnit = unitNum < units.length ? unitNum + 1 : null;
      campaignProgress = {
        subjectCode: subjCode,
        unitNumber: unitNum,
        isCompleted: nowCompleted,
        justUnlockedNext: !wasCompleted && nowCompleted && nextUnit !== null,
        nextUnitNumber: nextUnit,
        stars: earnedStars,
        bonusCampaignXp,
        totalUnits: units.length,
      };
    }

    await updateDailyStreak(userId);
    await recomputeUserAnalytics(userId);
    const newAchievements = await evaluateAchievements(userId);

    // Identify weak topics in this session
    const topicsToImprove = buildTopicsToImprove(answered);

    res.json({
      success: true,
      data: {
        session: updated,
        summary: {
          totalQuestions: session.totalQuestions,
          answeredCount: answered.length,
          correctCount,
          incorrectCount: answered.length - correctCount,
          accuracyPct: answered.length > 0 ? Math.round((correctCount / answered.length) * 100) : 0,
          earnedScore,
          maxScore,
          xpEarned: xpAwarded + bonusGoalXp + (campaignProgress?.bonusCampaignXp ?? 0),
          bonusGoalXp,
          campaignProgress,
          topicsToImprove,
          newAchievements,
        },
      },
    });
  }),
);

/**
 * Starts a fresh practice session using the exact same questionIds as a completed session.
 */
practiceRouter.post(
  '/sessions/:id/retry',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const oldSession = await prisma.practiceSession.findFirst({
      where: { id: String(req.params.id), userId },
    });
    if (!oldSession) throw new AppError(404, 'Sesi latihan tidak ditemukan.');
    if (oldSession.status !== 'SUBMITTED') {
      throw new AppError(400, 'Selesaikan sesi latihan terlebih dahulu sebelum mengulangi soal-soal ini.');
    }
    if (!oldSession.questionIds || oldSession.questionIds.length === 0) {
      throw new AppError(400, 'Daftar soal pada sesi ini kosong.');
    }

    if (
      oldSession.sessionType === 'CAMPAIGN' &&
      oldSession.campaignUnit &&
      oldSession.campaignUnit > FREE_LIMITS.CAMPAIGN_MAX_UNIT
    ) {
      await requireProOrThrow(
        userId,
        `Campaign ${oldSession.subjectCode ?? ''} Unit ${oldSession.campaignUnit} ke atas`,
        'CAMPAIGN_PRO_UNIT',
      );
    } else if (oldSession.sessionType === 'ERROR_REVIEW') {
      await requireProOrThrow(
        userId,
        'Latih Ulang Soal Salah (Spaced Repetition)',
        'ERROR_REVIEW',
      );
    }

    const baseTitle = oldSession.title.replace(/\s*\(Ulangi\)$/i, '').trim();
    const newSession = await prisma.practiceSession.create({
      data: {
        userId,
        sessionType: oldSession.sessionType,
        mode: oldSession.mode,
        status: 'IN_PROGRESS',
        title: `${baseTitle} (Ulangi)`,
        topicId: oldSession.topicId,
        subjectCode: oldSession.subjectCode,
        campaignUnit: oldSession.campaignUnit,
        questionIds: oldSession.questionIds,
        totalQuestions: oldSession.questionIds.length,
        maxScore: oldSession.questionIds.length * 5,
        timeLimitSec: oldSession.timeLimitSec,
      },
    });

    res.status(201).json({ success: true, data: { sessionId: newSession.id } });
  }),
);

// Error Notebook routes
practiceRouter.get(
  '/error-notebook',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const statusFilter = typeof req.query.status === 'string' ? req.query.status : 'all';
    const entitlement = await getUserEntitlement(userId);

    const items = await prisma.errorNotebook.findMany({
      where: {
        userId,
        ...(statusFilter === 'active' ? { isMastered: false } : {}),
        ...(statusFilter === 'mastered' ? { isMastered: true } : {}),
      },
      include: {
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
      orderBy: entitlement.isPro
        ? [{ isMastered: 'asc' }, { nextReviewAt: 'asc' }]
        : [{ isMastered: 'asc' }, { lastAttemptAt: 'desc' }],
      ...(entitlement.isPro ? {} : { take: FREE_LIMITS.ERROR_NOTEBOOK_FREE_LIMIT }),
    });

    res.json({ success: true, data: items });
  }),
);

practiceRouter.patch(
  '/error-notebook/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        personalNote: z.string().max(1000).optional(),
        isMastered: z.boolean().optional(),
      })
      .parse(req.body);

    const existing = await prisma.errorNotebook.findFirst({
      where: { id: String(req.params.id), userId: req.user!.userId },
    });
    if (!existing) throw new AppError(404, 'Catatan kesalahan tidak ditemukan.');

    const updated = await prisma.errorNotebook.update({
      where: { id: existing.id },
      data: body,
    });
    res.json({ success: true, data: updated });
  }),
);

practiceRouter.post(
  '/questions/:questionId/report',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { reason, details } = z
      .object({
        reason: z.string().trim().min(3).max(120),
        details: z.string().trim().max(1000).optional(),
      })
      .parse(req.body);

    const questionId = String(req.params.questionId);
    const exists = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true },
    });
    if (!exists) throw new AppError(404, 'Soal tidak ditemukan.');

    const report = await prisma.contentReport.create({
      data: {
        userId: req.user!.userId,
        questionId,
        reason,
        details: details || null,
      },
    });
    res.status(201).json({ success: true, data: report });
  }),
);
