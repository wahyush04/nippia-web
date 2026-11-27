import { Router } from 'express';
import { z } from 'zod';
import { getLevelForXp } from '@nippia/shared';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { prisma } from '../lib/prisma.js';
import { getTodayWibString } from '../services/gamification.service.js';
import { getUserWeaknessAnalytics } from '../services/analytics.service.js';
import {
  FREE_LIMITS,
  getProUserIdSet,
  getUserEntitlement,
  requireProOrThrow,
} from '../services/subscription.service.js';

export const dashboardRouter = Router();

const MOTIVATIONAL_QUOTES = [
  'Konsistensi 30 menit setiap hari jauh lebih kuat daripada belajar SKS semalam suntuk.',
  'Setiap soal yang kamu pahami pembahasannya hari ini adalah poin tambahan di ruang CAT nanti.',
  'Fokus pada topik terlemahmu—kenaikan skor tercepat berasal dari memperbaiki celah terkecil.',
  'Disiplin harian membangun ketenangan mental saat berhadapan dengan timer CAT.',
  'Jangan hanya menghafal jawaban; pahami pola berpikir di balik setiap soal TWK, TIU, dan TKP.',
];

dashboardRouter.get(
  '/overview',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const today = getTodayWibString();

    const [
      user,
      prefs,
      todayGoal,
      todayActivity,
      progressList,
      simSessions,
      activePlan,
      analytics,
      errorDueCount,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true, streak: true },
      }),
      prisma.userPreference.findUnique({ where: { userId } }),
      prisma.dailyGoal.findUnique({ where: { userId_date: { userId, date: today } } }),
      prisma.dailyActivity.findUnique({ where: { userId_date: { userId, date: today } } }),
      prisma.learningProgress.findMany({ where: { userId } }),
      prisma.examinationSession.findMany({
        where: { userId, status: 'SUBMITTED' },
        orderBy: { submittedAt: 'desc' },
        take: 10,
      }),
      prisma.studyPlan.findFirst({
        where: { userId, isActive: true },
        include: {
          tasks: {
            where: { scheduledDate: { gte: today }, isCompleted: false },
            orderBy: { scheduledDate: 'asc' },
            take: 5,
          },
        },
      }),
      getUserWeaknessAnalytics(userId),
      prisma.errorNotebook.count({
        where: { userId, isMastered: false, nextReviewAt: { lte: new Date() } },
      }),
    ]);

    if (!user) throw new AppError(404, 'Pengguna tidak ditemukan');

    const twkTarget = prefs?.dailyTwkTarget ?? 10;
    const tiuTarget = prefs?.dailyTiuTarget ?? 10;
    const tkpTarget = prefs?.dailyTkpTarget ?? 10;
    const totalTarget = twkTarget + tiuTarget + tkpTarget;

    const goal =
      todayGoal ??
      (await prisma.dailyGoal.create({
        data: {
          userId,
          date: today,
          targetCount: totalTarget,
          completedCount: todayActivity?.questionsAnswered ?? 0,
          twkTarget,
          tiuTarget,
          tkpTarget,
          isCompleted: (todayActivity?.questionsAnswered ?? 0) >= totalTarget,
        },
      }));

    const totalAnswered = progressList.reduce((acc, p) => acc + p.totalAnswered, 0);
    const totalCorrect = progressList.reduce((acc, p) => acc + p.correctCount, 0);
    const totalStudySec = progressList.reduce((acc, p) => acc + p.totalTimeSec, 0);
    const overallAccuracy = totalAnswered > 0 ? Number(((totalCorrect / totalAnswered) * 100).toFixed(1)) : 0;
    const avgSimScore =
      simSessions.length > 0
        ? Math.round(simSessions.reduce((a, b) => a + b.totalScore, 0) / simSessions.length)
        : 0;

    // Weekly activity (last 7 days)
    const weeklyDays: Array<{ date: string; label: string; questions: number; accuracy: number }> = [];
    const base = new Date(`${today}T00:00:00Z`);
    const allWeekAct = await prisma.dailyActivity.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 14,
    });
    const actMap = new Map(allWeekAct.map((a) => [a.date, a]));
    const shortDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(base);
      d.setUTCDate(d.getUTCDate() - i);
      const dStr = d.toISOString().slice(0, 10);
      const act = actMap.get(dStr);
      weeklyDays.push({
        date: dStr,
        label: shortDays[d.getUTCDay()],
        questions: act?.questionsAnswered ?? 0,
        accuracy:
          act && act.questionsAnswered > 0
            ? Math.round((act.correctCount / act.questionsAnswered) * 100)
            : 0,
      });
    }

    // Build recommended next activities
    const recommendations: Array<{
      id: string;
      title: string;
      description: string;
      actionPath: string;
      badge: string;
    }> = [];

    for (const weak of analytics.weakestTopics.slice(0, 2)) {
      recommendations.push({
        id: `weak-${weak.topicSlug}`,
        title: `Latih 10 Soal ${weak.subjectCode}: ${weak.topicName}`,
        description: `Akurasi saat ini ${weak.accuracyPct}% (${weak.attemptsCount} soal). Fokuskan perbaikan sebelum ujian.`,
        actionPath: `/practice/topic/${weak.topicSlug}`,
        badge: 'Prioritas Kelemahan',
      });
    }

    if (errorDueCount > 0) {
      recommendations.push({
        id: 'error-review',
        title: `Ulangi ${errorDueCount} Soal di Buku Kesalahan`,
        description: 'Jadwal pengulangan berjarak (spaced repetition) hari ini sudah menunggu.',
        actionPath: '/error-notebook',
        badge: 'Spaced Repetition',
      });
    }

    if (simSessions.length === 0) {
      recommendations.push({
        id: 'first-sim',
        title: 'Ikuti Simulasi CAT SKD Pertama Anda',
        description: 'Ukur skor awal TWK, TIU, dan TKP dengan kondisi timer 100 menit.',
        actionPath: '/cat-simulation',
        badge: 'Simulasi CAT',
      });
    } else {
      recommendations.push({
        id: 'mini-sim',
        title: 'Ambil Simulasi Mini 30 Soal',
        description: 'Latih kecepatan kombinasi TWK, TIU, dan TKP dalam waktu singkat.',
        actionPath: '/cat-simulation?mode=mini',
        badge: 'Latihan Kecepatan',
      });
    }

    const dayIndex = new Date().getDate() % MOTIVATIONAL_QUOTES.length;
    const xp = user.profile?.totalXp ?? 0;

    res.json({
      success: true,
      data: {
        user: {
          name: user.name,
          totalXp: xp,
          levelInfo: getLevelForXp(xp),
          onboardingCompleted: user.profile?.onboardingCompleted ?? false,
          targetScore: user.profile?.targetScore ?? 380,
          targetExamDate: user.profile?.targetExamDate ?? null,
        },
        motivation: MOTIVATIONAL_QUOTES[dayIndex],
        todayDate: today,
        dailyGoal: {
          targetCount: goal.targetCount,
          completedCount: goal.completedCount,
          remainingCount: Math.max(0, goal.targetCount - goal.completedCount),
          completionPct: Math.min(100, Math.round((goal.completedCount / Math.max(1, goal.targetCount)) * 100)),
          twkTarget: goal.twkTarget,
          tiuTarget: goal.tiuTarget,
          tkpTarget: goal.tkpTarget,
          isCompleted: goal.isCompleted,
        },
        streak: {
          currentStreak: user.streak?.currentStreak ?? 0,
          longestStreak: user.streak?.longestStreak ?? 0,
        },
        performanceOverview: {
          totalAnswered,
          overallAccuracy,
          avgSimScore,
          totalStudyMinutes: Math.round(totalStudySec / 60),
          completedSimulations: simSessions.length,
        },
        subjectPerformance: analytics.subjectComparison,
        weakestTopics: analytics.weakestTopics,
        recommendations,
        weeklyActivity: weeklyDays,
        upcomingTasks: activePlan?.tasks ?? [],
      },
    });
  }),
);

dashboardRouter.get(
  '/gamification',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const today = getTodayWibString();

    const [profile, streak, allAchievements, userAchievements, xpHistory, todayAct, todayGoal, publicUsers] =
      await Promise.all([
        prisma.userProfile.findUnique({ where: { userId } }),
        prisma.userStreak.findUnique({ where: { userId } }),
        prisma.achievement.findMany({ orderBy: { xpReward: 'asc' } }),
        prisma.userAchievement.findMany({ where: { userId } }),
        prisma.userXpTransaction.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 15,
        }),
        prisma.dailyActivity.findUnique({ where: { userId_date: { userId, date: today } } }),
        prisma.dailyGoal.findUnique({ where: { userId_date: { userId, date: today } } }),
        prisma.user.findMany({
          where: { preferences: { isLeaderboardPublic: true } },
          select: {
            id: true,
            name: true,
            profile: { select: { totalXp: true, levelName: true } },
            streak: { select: { currentStreak: true } },
            examSessions: {
              where: { status: 'SUBMITTED' },
              orderBy: { totalScore: 'desc' },
              take: 1,
              select: { totalScore: true },
            },
          },
        }),
      ]);

    const unlockedMap = new Map(userAchievements.map((u) => [u.achievementId, u.unlockedAt]));
    const xp = profile?.totalXp ?? 0;
    const proIdSet = await getProUserIdSet(publicUsers.map((u) => u.id));

    const weeklyLeaderboard = [...publicUsers]
      .sort((a, b) => (b.profile?.totalXp ?? 0) - (a.profile?.totalXp ?? 0))
      .slice(0, 20)
      .map((u, idx) => ({
        rank: idx + 1,
        userId: u.id,
        name: u.name,
        isMe: u.id === userId,
        isPro: proIdSet.has(u.id),
        totalXp: u.profile?.totalXp ?? 0,
        levelName: u.profile?.levelName ?? 'Pemula',
        currentStreak: u.streak?.currentStreak ?? 0,
        bestSimScore: u.examSessions[0]?.totalScore ?? 0,
      }));

    const simLeaderboard = [...publicUsers]
      .filter((u) => (u.examSessions[0]?.totalScore ?? 0) > 0)
      .sort((a, b) => (b.examSessions[0]?.totalScore ?? 0) - (a.examSessions[0]?.totalScore ?? 0))
      .slice(0, 20)
      .map((u, idx) => ({
        rank: idx + 1,
        userId: u.id,
        name: u.name,
        isMe: u.id === userId,
        isPro: proIdSet.has(u.id),
        bestSimScore: u.examSessions[0]?.totalScore ?? 0,
        totalXp: u.profile?.totalXp ?? 0,
        levelName: u.profile?.levelName ?? 'Pemula',
      }));

    const dailyChallenges = [
      {
        id: 'chal-correct-10',
        title: 'Jawab 10 Soal dengan Benar Hari Ini',
        progress: Math.min(10, todayAct?.correctCount ?? 0),
        target: 10,
        completed: (todayAct?.correctCount ?? 0) >= 10,
        rewardXp: 40,
      },
      {
        id: 'chal-daily-target',
        title: 'Tuntaskan Target Harian Anda',
        progress: Math.min(todayGoal?.targetCount ?? 30, todayGoal?.completedCount ?? 0),
        target: todayGoal?.targetCount ?? 30,
        completed: todayGoal?.isCompleted ?? false,
        rewardXp: 60,
      },
      {
        id: 'chal-sim',
        title: 'Selesaikan 1 Simulasi CAT',
        progress: Math.min(1, todayAct?.simulationsDone ?? 0),
        target: 1,
        completed: (todayAct?.simulationsDone ?? 0) >= 1,
        rewardXp: 100,
      },
    ];

    res.json({
      success: true,
      data: {
        totalXp: xp,
        levelInfo: getLevelForXp(xp),
        streak,
        achievements: allAchievements.map((a) => ({
          ...a,
          unlocked: unlockedMap.has(a.id),
          unlockedAt: unlockedMap.get(a.id) ?? null,
        })),
        xpHistory,
        dailyChallenges,
        leaderboards: {
          weeklyXp: weeklyLeaderboard,
          simulationScore: simLeaderboard,
        },
      },
    });
  }),
);

dashboardRouter.get(
  '/materials',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const subject = typeof req.query.subject === 'string' ? req.query.subject : '';

    const [entitlement, materials] = await Promise.all([
      getUserEntitlement(userId),
      prisma.studyMaterial.findMany({
        where: {
          ...(subject ? { subject: { code: subject as 'TWK' | 'TIU' | 'TKP' } } : {}),
          ...(q
            ? {
                OR: [
                  { title: { contains: q, mode: 'insensitive' } },
                  { summary: { contains: q, mode: 'insensitive' } },
                  { contentMd: { contains: q, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
        include: { subject: true, topic: true },
        orderBy: [{ subject: { orderIndex: 'asc' } }, { createdAt: 'asc' }],
      }),
    ]);

    const mapped = materials.map((m) => {
      const isProPackage = m.slug.startsWith('paket2-') || m.slug.startsWith('paket3-');
      const isLocked = !entitlement.isPro && isProPackage;
      return {
        ...m,
        packageLabel: m.slug.startsWith('paket3-')
          ? 'Paket 3'
          : m.slug.startsWith('paket2-')
            ? 'Paket 2'
            : 'Paket 1',
        requiresPro: isProPackage,
        isLocked,
        ...(isLocked
          ? {
              contentMd: '',
              keyPoints: [],
              formulas: [],
            }
          : {}),
      };
    });

    res.json({ success: true, data: mapped });
  }),
);

async function getFreeFlashcardIdSet(): Promise<Set<string>> {
  const all = await prisma.flashcard.findMany({
    select: {
      id: true,
      topic: { select: { subject: { select: { code: true } } } },
    },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  });
  const countBySubj: Record<string, number> = { TWK: 0, TIU: 0, TKP: 0 };
  const freeSet = new Set<string>();
  for (const c of all) {
    const code = c.topic.subject.code;
    if ((countBySubj[code] ?? 0) < FREE_LIMITS.FLASHCARD_FREE_PER_SUBJECT) {
      countBySubj[code] = (countBySubj[code] ?? 0) + 1;
      freeSet.add(c.id);
    }
  }
  return freeSet;
}

dashboardRouter.get(
  '/flashcards',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const topicSlug = typeof req.query.topic === 'string' ? req.query.topic : undefined;

    const [entitlement, freeIdSet, cards, progress] = await Promise.all([
      getUserEntitlement(userId),
      getFreeFlashcardIdSet(),
      prisma.flashcard.findMany({
        where: topicSlug ? { topic: { slug: topicSlug } } : undefined,
        include: { topic: { include: { subject: true } } },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      }),
      prisma.flashcardProgress.findMany({ where: { userId } }),
    ]);

    const progMap = new Map(progress.map((p) => [p.flashcardId, p]));
    res.json({
      success: true,
      data: cards.map((c) => {
        const isFreeCard = freeIdSet.has(c.id);
        const isLocked = !entitlement.isPro && !isFreeCard;
        return {
          ...c,
          requiresPro: !isFreeCard,
          isLocked,
          back: isLocked ? '' : c.back,
          hint: isLocked ? null : c.hint,
          isMastered: progMap.get(c.id)?.isMastered ?? false,
          reviewCount: progMap.get(c.id)?.reviewCount ?? 0,
        };
      }),
    });
  }),
);

dashboardRouter.post(
  '/flashcards/:id/review',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { isMastered } = z.object({ isMastered: z.boolean() }).parse(req.body);
    const userId = req.user!.userId;
    const flashcardId = String(req.params.id);

    const [entitlement, freeIdSet] = await Promise.all([
      getUserEntitlement(userId),
      getFreeFlashcardIdSet(),
    ]);
    if (!entitlement.isPro && !freeIdSet.has(flashcardId)) {
      await requireProOrThrow(userId, 'Kartu Hafalan 3D Lengkap (45 Kartu)', 'FLASHCARDS_PRO');
    }

    const nextDays = isMastered ? 7 : 1;
    const nextReviewAt = new Date(Date.now() + nextDays * 24 * 60 * 60 * 1000);

    const record = await prisma.flashcardProgress.upsert({
      where: { userId_flashcardId: { userId, flashcardId } },
      update: {
        isMastered,
        reviewCount: { increment: 1 },
        nextReviewAt,
      },
      create: {
        userId,
        flashcardId,
        isMastered,
        reviewCount: 1,
        nextReviewAt,
      },
    });

    res.json({ success: true, data: record });
  }),
);

dashboardRouter.get(
  '/bookmarks',
  requireAuth,
  asyncHandler(async (req, res) => {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user!.userId },
      include: {
        question: {
          include: { subject: true, topic: true, options: { orderBy: { optionKey: 'asc' } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: bookmarks });
  }),
);

dashboardRouter.post(
  '/bookmarks/:questionId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const questionId = String(req.params.questionId);
    const existing = await prisma.bookmark.findUnique({
      where: { userId_questionId: { userId, questionId } },
    });
    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return res.json({ success: true, data: { bookmarked: false } });
    }
    await prisma.bookmark.create({ data: { userId, questionId } });
    return res.json({ success: true, data: { bookmarked: true } });
  }),
);
