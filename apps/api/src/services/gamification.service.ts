import { getLevelForXp } from '@nippia/shared';
import { prisma } from '../lib/prisma.js';

export function getTodayWibString(date = new Date()): string {
  // WIB = UTC+7
  const wib = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return wib.toISOString().slice(0, 10);
}

export function getYesterdayWibString(todayStr: string): string {
  const dt = new Date(`${todayStr}T00:00:00Z`);
  dt.setUTCDate(dt.getUTCDate() - 1);
  return dt.toISOString().slice(0, 10);
}

/**
 * Awards XP idempotently using (userId, source, refId) unique constraint so XP is never duplicated.
 */
export async function awardXpIdempotent(
  userId: string,
  amount: number,
  source: string,
  refId: string,
  note: string,
): Promise<{ awarded: boolean; amount: number; totalXp: number; levelName: string }> {
  if (amount <= 0) {
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    return {
      awarded: false,
      amount: 0,
      totalXp: profile?.totalXp ?? 0,
      levelName: profile?.levelName ?? 'Pemula',
    };
  }

  const existing = await prisma.userXpTransaction.findUnique({
    where: { userId_source_refId: { userId, source, refId } },
  });

  if (existing) {
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    return {
      awarded: false,
      amount: 0,
      totalXp: profile?.totalXp ?? 0,
      levelName: profile?.levelName ?? 'Pemula',
    };
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.userXpTransaction.create({
      data: { userId, amount, source, refId, note },
    });
    const current = await tx.userProfile.findUnique({ where: { userId } });
    const nextXp = (current?.totalXp ?? 0) + amount;
    const levelInfo = getLevelForXp(nextXp);
    const updated = await tx.userProfile.upsert({
      where: { userId },
      update: { totalXp: nextXp, levelName: levelInfo.name },
      create: { userId, totalXp: nextXp, levelName: levelInfo.name },
    });
    return updated;
  });

  const today = getTodayWibString();
  await prisma.dailyActivity.upsert({
    where: { userId_date: { userId, date: today } },
    update: { xpEarned: { increment: amount } },
    create: { userId, date: today, xpEarned: amount },
  });

  return {
    awarded: true,
    amount,
    totalXp: result.totalXp,
    levelName: result.levelName,
  };
}

/**
 * Updates daily streak once per calendar day (WIB) without duplicating consecutive increments.
 */
export async function updateDailyStreak(userId: string) {
  const today = getTodayWibString();
  const yesterday = getYesterdayWibString(today);

  const streak = await prisma.userStreak.findUnique({ where: { userId } });
  if (!streak) {
    return prisma.userStreak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: today,
        historyDates: [today],
      },
    });
  }

  if (streak.lastActiveDate === today) {
    return streak;
  }

  const nextCurrent = streak.lastActiveDate === yesterday ? streak.currentStreak + 1 : 1;
  const nextLongest = Math.max(streak.longestStreak, nextCurrent);
  const nextHistory = streak.historyDates.includes(today)
    ? streak.historyDates
    : [...streak.historyDates.slice(-59), today];

  const updated = await prisma.userStreak.update({
    where: { userId },
    data: {
      currentStreak: nextCurrent,
      longestStreak: nextLongest,
      lastActiveDate: today,
      historyDates: nextHistory,
    },
  });

  if (nextCurrent === 7) {
    await awardXpIdempotent(userId, 100, 'STREAK', `STREAK_7_${today}`, 'Bonus Streak Belajar 7 Hari');
  }

  return updated;
}

/**
 * Evaluates and unlocks achievements based on genuine verified learning metrics.
 */
export async function evaluateAchievements(userId: string) {
  const [achievements, unlocked, progressList, streak, simCount, perfectPracticeCount, masteredTopics] =
    await Promise.all([
      prisma.achievement.findMany(),
      prisma.userAchievement.findMany({ where: { userId } }),
      prisma.learningProgress.findMany({ where: { userId } }),
      prisma.userStreak.findUnique({ where: { userId } }),
      prisma.examinationSession.count({ where: { userId, status: 'SUBMITTED' } }),
      prisma.practiceSession.count({
        where: { userId, status: 'SUBMITTED', totalQuestions: { gte: 5 } },
      }),
      prisma.topicMastery.count({ where: { userId, masteryLevel: 'MASTERED' } }),
    ]);

  const unlockedSet = new Set(unlocked.map((u) => u.achievementId));
  const totalAnswered = progressList.reduce((sum, p) => sum + p.totalAnswered, 0);
  const twkAcc = (() => {
    const p = progressList.find((x) => x.subjectCode === 'TWK');
    return p && p.totalAnswered >= 15 ? (p.correctCount / p.totalAnswered) * 100 : 0;
  })();
  const tiuAcc = (() => {
    const p = progressList.find((x) => x.subjectCode === 'TIU');
    return p && p.totalAnswered >= 15 ? (p.correctCount / p.totalAnswered) * 100 : 0;
  })();
  const tkpAcc = (() => {
    const p = progressList.find((x) => x.subjectCode === 'TKP');
    return p && p.maxPossibleScore > 0 && p.totalAnswered >= 15
      ? (p.totalScore / p.maxPossibleScore) * 100
      : 0;
  })();

  const sessions = await prisma.practiceSession.findMany({
    where: { userId, status: 'SUBMITTED', totalQuestions: { gte: 5 } },
    select: { correctCount: true, totalQuestions: true },
  });
  const hasPerfectPractice = sessions.some((s) => s.correctCount === s.totalQuestions);

  const passedSim = await prisma.examinationSession.count({
    where: { userId, status: 'SUBMITTED', overallPassed: true },
  });

  const newlyUnlocked: string[] = [];

  for (const ach of achievements) {
    if (unlockedSet.has(ach.id)) continue;

    let qualifies = false;
    switch (ach.code) {
      case 'FIRST_STEPS':
        qualifies = totalAnswered >= 10;
        break;
      case 'FIRST_100':
        qualifies = totalAnswered >= 100;
        break;
      case 'STREAK_7':
        qualifies = (streak?.longestStreak ?? 0) >= 7;
        break;
      case 'TWK_SPECIALIST':
        qualifies = twkAcc >= 80;
        break;
      case 'TIU_SOLVER':
        qualifies = tiuAcc >= 80;
        break;
      case 'TKP_STRATEGIST':
        qualifies = tkpAcc >= 80;
        break;
      case 'PERFECT_PRACTICE':
        qualifies = hasPerfectPractice && perfectPracticeCount > 0;
        break;
      case 'SIM_CHAMPION':
        qualifies = passedSim >= 1;
        break;
      case 'FIRST_SIMULATION':
        qualifies = simCount >= 1;
        break;
      case 'TOPIC_MASTER':
        qualifies = masteredTopics >= 3;
        break;
      default:
        break;
    }

    if (qualifies) {
      await prisma.userAchievement.create({
        data: { userId, achievementId: ach.id },
      });
      await awardXpIdempotent(
        userId,
        ach.xpReward,
        'ACHIEVEMENT',
        ach.code,
        `Lencana terbuka: ${ach.title}`,
      );
      newlyUnlocked.push(ach.title);
    }
  }

  return newlyUnlocked;
}
