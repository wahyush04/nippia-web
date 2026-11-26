import { Router } from 'express';
import { z } from 'zod';
import { classifyMastery, MASTERY_LABELS } from '@nippia/shared';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { prisma } from '../lib/prisma.js';
import { evaluateSingleAnswer } from '../services/scoring.service.js';
import { recomputeUserAnalytics } from '../services/analytics.service.js';
import { awardXpIdempotent, evaluateAchievements, getTodayWibString, updateDailyStreak } from '../services/gamification.service.js';

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

    const prefs = await prisma.userPreference.findUnique({ where: { userId } });
    const twkCount = body.twkCount ?? prefs?.dailyTwkTarget ?? 10;
    const tiuCount = body.tiuCount ?? prefs?.dailyTiuTarget ?? 10;
    const tkpCount = body.tkpCount ?? prefs?.dailyTkpTarget ?? 10;

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

practiceRouter.get(
  '/sessions/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const session = await prisma.practiceSession.findFirst({
      where: { id: String(req.params.id), userId },
      include: { answers: true },
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

    res.json({
      success: true,
      data: {
        session,
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
            userAnswer: ans ?? null,
            options: q!.options.map((o) => ({
              optionKey: o.optionKey,
              text: o.text,
              visualSpec: o.visualSpec,
              ...(showDetail
                ? {
                    scoreValue: o.scoreValue,
                    isCorrect: o.isCorrect,
                    optionFeedback: o.optionFeedback,
                  }
                : {}),
            })),
            ...(showDetail
              ? {
                  explanation: q!.explanation,
                  conceptSummary: q!.conceptSummary,
                  stepByStep: q!.stepByStep,
                  whyOthersWrong: q!.whyOthersWrong,
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

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { subject: true, options: { orderBy: { optionKey: 'asc' } }, references: true },
    });
    if (!question) throw new AppError(404, 'Soal tidak ditemukan.');

    const rule = await getActiveScoringRule();
    const evaluated = evaluateSingleAnswer(
      {
        questionId,
        subjectCode: question.subject.code,
        selectedKey: selectedKey ?? null,
        options: question.options,
      },
      rule,
    );

    const saved = await prisma.practiceAnswer.upsert({
      where: { sessionId_questionId: { sessionId: session.id, questionId } },
      update: {
        selectedKey: selectedKey ?? null,
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
        selectedKey: selectedKey ?? null,
        isCorrect: evaluated.isCorrect,
        scoreEarned: evaluated.scoreEarned,
        maxScore: evaluated.maxScore,
        timeSpentSec,
        isFlagged: isFlagged ?? false,
      },
    });

    // Save/update Error Notebook if wrong (or score < max for TKP)
    if (selectedKey && !evaluated.isCorrect) {
      const nextReviewAt = new Date(Date.now() + REVIEW_INTERVAL_DAYS[0] * 24 * 60 * 60 * 1000);
      await prisma.errorNotebook.upsert({
        where: { userId_questionId: { userId, questionId } },
        update: {
          lastSelectedKey: selectedKey,
          wrongCount: { increment: 1 },
          reviewStage: 0,
          isMastered: false,
          lastAttemptAt: new Date(),
          nextReviewAt,
        },
        create: {
          userId,
          questionId,
          lastSelectedKey: selectedKey,
          wrongCount: 1,
          reviewStage: 0,
          isMastered: false,
          nextReviewAt,
        },
      });
    } else if (selectedKey && evaluated.isCorrect && session.sessionType === 'ERROR_REVIEW') {
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
        answer: saved,
        feedback: showFeedback
          ? {
              isCorrect: evaluated.isCorrect,
              scoreEarned: evaluated.scoreEarned,
              maxScore: evaluated.maxScore,
              options: question.options,
              explanation: question.explanation,
              conceptSummary: question.conceptSummary,
              stepByStep: question.stepByStep,
              whyOthersWrong: question.whyOthersWrong,
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
      session.sessionType === 'DAILY' ? 'DAILY_PRACTICE' : 'TOPIC_DRILL',
      session.id,
      `Menyelesaikan ${session.title}`,
    );

    await updateDailyStreak(userId);
    await recomputeUserAnalytics(userId);
    const newAchievements = await evaluateAchievements(userId);

    // Identify weak topics in this session
    const topicSummary = new Map<string, { name: string; slug: string; total: number; wrong: number }>();
    for (const ans of answered) {
      const t = ans.question.topic;
      const cur = topicSummary.get(t.id) ?? { name: t.name, slug: t.slug, total: 0, wrong: 0 };
      cur.total++;
      if (!ans.isCorrect) cur.wrong++;
      topicSummary.set(t.id, cur);
    }

    const topicsToImprove = [...topicSummary.values()]
      .filter((t) => t.wrong > 0)
      .sort((a, b) => b.wrong - a.wrong)
      .slice(0, 3);

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
          xpEarned: xpAwarded + bonusGoalXp,
          bonusGoalXp,
          topicsToImprove,
          newAchievements,
        },
      },
    });
  }),
);

// Error Notebook routes
practiceRouter.get(
  '/error-notebook',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const statusFilter = typeof req.query.status === 'string' ? req.query.status : 'all';

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
            options: { orderBy: { optionKey: 'asc' } },
          },
        },
      },
      orderBy: [{ isMastered: 'asc' }, { nextReviewAt: 'asc' }],
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
      .object({ reason: z.string().min(3).max(120), details: z.string().max(1000).optional() })
      .parse(req.body);

    const report = await prisma.contentReport.create({
      data: {
        userId: req.user!.userId,
        questionId: String(req.params.questionId),
        reason,
        details,
      },
    });
    res.status(201).json({ success: true, data: report });
  }),
);
