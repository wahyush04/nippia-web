import { classifyMastery, MASTERY_LABELS, MASTERY_THRESHOLDS } from '@nippia/shared';
import { prisma } from '../lib/prisma.js';

export interface TopicAnalysisRow {
  topicId: string;
  topicName: string;
  topicSlug: string;
  subjectCode: 'TWK' | 'TIU' | 'TKP';
  category: string | null;
  attemptsCount: number;
  correctCount: number;
  accuracyPct: number;
  avgTimeSec: number;
  masteryLevel: ReturnType<typeof classifyMastery>;
  masteryLabel: string;
  hasSufficientData: boolean;
  lastPracticedAt: string | null;
  recommendation: string;
}

/**
 * Recomputes a user's TopicMastery and LearningProgress from actual PracticeAnswer + ExaminationAnswer history.
 */
export async function recomputeUserAnalytics(userId: string) {
  const [practiceAnswers, examAnswers, topics] = await Promise.all([
    prisma.practiceAnswer.findMany({
      where: { userId, selectedKey: { not: null } },
      include: { question: { include: { subject: true, topic: true } } },
    }),
    prisma.examinationAnswer.findMany({
      where: { userId, selectedKey: { not: null }, session: { status: 'SUBMITTED' } },
      include: { question: { include: { subject: true, topic: true } } },
    }),
    prisma.topic.findMany({ include: { subject: true } }),
  ]);

  const bySubject = new Map<
    'TWK' | 'TIU' | 'TKP',
    { answered: number; correct: number; score: number; maxScore: number; timeSec: number }
  >([
    ['TWK', { answered: 0, correct: 0, score: 0, maxScore: 0, timeSec: 0 }],
    ['TIU', { answered: 0, correct: 0, score: 0, maxScore: 0, timeSec: 0 }],
    ['TKP', { answered: 0, correct: 0, score: 0, maxScore: 0, timeSec: 0 }],
  ]);

  const byTopic = new Map<
    string,
    { attempts: number; correct: number; score: number; maxScore: number; timeSec: number; lastAt: Date | null }
  >();

  const recordAnswer = (
    subj: 'TWK' | 'TIU' | 'TKP',
    topicId: string,
    isCorrect: boolean,
    scoreEarned: number,
    maxScore: number,
    timeSec: number,
    at: Date,
  ) => {
    const s = bySubject.get(subj)!;
    s.answered += 1;
    if (isCorrect) s.correct += 1;
    s.score += scoreEarned;
    s.maxScore += maxScore;
    s.timeSec += timeSec;

    const t = byTopic.get(topicId) ?? {
      attempts: 0,
      correct: 0,
      score: 0,
      maxScore: 0,
      timeSec: 0,
      lastAt: null,
    };
    t.attempts += 1;
    if (isCorrect) t.correct += 1;
    t.score += scoreEarned;
    t.maxScore += maxScore;
    t.timeSec += timeSec;
    if (!t.lastAt || at > t.lastAt) t.lastAt = at;
    byTopic.set(topicId, t);
  };

  for (const a of practiceAnswers) {
    recordAnswer(
      a.question.subject.code,
      a.question.topicId,
      a.isCorrect,
      a.scoreEarned,
      a.maxScore,
      a.timeSpentSec,
      a.answeredAt,
    );
  }

  for (const a of examAnswers) {
    recordAnswer(
      a.question.subject.code,
      a.question.topicId,
      a.isCorrect,
      a.scoreEarned,
      a.maxScore,
      a.timeSpentSec,
      a.updatedAt,
    );
  }

  for (const [subjectCode, s] of bySubject.entries()) {
    await prisma.learningProgress.upsert({
      where: { userId_subjectCode: { userId, subjectCode } },
      update: {
        totalAnswered: s.answered,
        correctCount: s.correct,
        totalScore: s.score,
        maxPossibleScore: s.maxScore,
        totalTimeSec: s.timeSec,
      },
      create: {
        userId,
        subjectCode,
        totalAnswered: s.answered,
        correctCount: s.correct,
        totalScore: s.score,
        maxPossibleScore: s.maxScore,
        totalTimeSec: s.timeSec,
      },
    });
  }

  for (const topic of topics) {
    const t = byTopic.get(topic.id);
    if (!t) continue;
    // For TKP, mastery accuracy reflects score percentage out of maxScore; for TWK/TIU, correct %
    const accuracyPct =
      topic.subject.code === 'TKP'
        ? t.maxScore > 0
          ? Number(((t.score / t.maxScore) * 100).toFixed(1))
          : 0
        : t.attempts > 0
          ? Number(((t.correct / t.attempts) * 100).toFixed(1))
          : 0;
    const avgTimeSec = t.attempts > 0 ? Number((t.timeSec / t.attempts).toFixed(1)) : 0;
    const masteryLevel = classifyMastery(accuracyPct, t.attempts);

    await prisma.topicMastery.upsert({
      where: { userId_topicId: { userId, topicId: topic.id } },
      update: {
        attemptsCount: t.attempts,
        correctCount: t.correct,
        accuracyPct,
        avgTimeSec,
        masteryLevel,
        lastPracticedAt: t.lastAt,
      },
      create: {
        userId,
        topicId: topic.id,
        attemptsCount: t.attempts,
        correctCount: t.correct,
        accuracyPct,
        avgTimeSec,
        masteryLevel,
        lastPracticedAt: t.lastAt,
      },
    });
  }
}

function buildTopicRecommendation(
  topicName: string,
  subjectCode: 'TWK' | 'TIU' | 'TKP',
  mastery: ReturnType<typeof classifyMastery>,
  attempts: number,
  accuracyPct: number,
): string {
  if (attempts < MASTERY_THRESHOLDS.MIN_SAMPLES) {
    const needed = MASTERY_THRESHOLDS.MIN_SAMPLES - attempts;
    return `Data belum mencukupi (${attempts}/${MASTERY_THRESHOLDS.MIN_SAMPLES} sampel). Kerjakan minimal ${needed} soal lagi untuk analisis kelemahan yang akurat.`;
  }
  if (mastery === 'NEEDS_IMPROVEMENT') {
    return `Akurasi ${accuracyPct}% pada ${subjectCode} — ${topicName}. Pelajari ringkasan konsep dasar, latihan 10–15 soal tingkat Mudah–Sedang, lalu ulangi soal salah di Buku Kesalahan setelah 24 jam.`;
  }
  if (mastery === 'DEVELOPING') {
    return `Pemahaman berkembang (${accuracyPct}%). Fokus pada jebakan pengecoh dan latih soal tingkat Sedang–Sulit dengan pengatur waktu.`;
  }
  if (mastery === 'GOOD') {
    return `Penguasaan baik (${accuracyPct}%). Pertahankan akurasi dan perkuat kecepatan menjawab pada level Sulit.`;
  }
  return `Topik telah dikuasai (${accuracyPct}%). Lakukan pengulangan berkala agar ingatan tetap tajam hingga hari ujian.`;
}

export async function getUserWeaknessAnalytics(userId: string) {
  const [topics, masteries, progressList, dailyActivities, practiceAnswers, examAnswers] =
    await Promise.all([
      prisma.topic.findMany({
        include: { subject: true },
        orderBy: [{ subject: { orderIndex: 'asc' } }, { orderIndex: 'asc' }],
      }),
      prisma.topicMastery.findMany({ where: { userId } }),
      prisma.learningProgress.findMany({ where: { userId } }),
      prisma.dailyActivity.findMany({
        where: { userId },
        orderBy: { date: 'asc' },
        take: 30,
      }),
      prisma.practiceAnswer.findMany({
        where: { userId, selectedKey: { not: null } },
        include: { question: true },
      }),
      prisma.examinationAnswer.findMany({
        where: { userId, selectedKey: { not: null }, session: { status: 'SUBMITTED' } },
        include: { question: true },
      }),
    ]);

  const masteryMap = new Map(masteries.map((m) => [m.topicId, m]));

  const topicAnalysis: TopicAnalysisRow[] = topics.map((t) => {
    const m = masteryMap.get(t.id);
    const attempts = m?.attemptsCount ?? 0;
    const correct = m?.correctCount ?? 0;
    const accuracyPct = m?.accuracyPct ?? 0;
    const avgTimeSec = m?.avgTimeSec ?? 0;
    const level = classifyMastery(accuracyPct, attempts);

    return {
      topicId: t.id,
      topicName: t.name,
      topicSlug: t.slug,
      subjectCode: t.subject.code,
      category: t.category,
      attemptsCount: attempts,
      correctCount: correct,
      accuracyPct,
      avgTimeSec,
      masteryLevel: level,
      masteryLabel: MASTERY_LABELS[level],
      hasSufficientData: attempts >= MASTERY_THRESHOLDS.MIN_SAMPLES,
      lastPracticedAt: m?.lastPracticedAt?.toISOString() ?? null,
      recommendation: buildTopicRecommendation(t.name, t.subject.code, level, attempts, accuracyPct),
    };
  });

  // Weakness ranking strictly respects minimum sample threshold (no false weakness on 1-2 answers)
  const sufficientWeakTopics = topicAnalysis
    .filter((t) => t.hasSufficientData && t.accuracyPct < MASTERY_THRESHOLDS.MASTERED)
    .sort((a, b) => a.accuracyPct - b.accuracyPct);

  const weakestThree = sufficientWeakTopics.slice(0, 3);

  // Difficulty distribution performance
  const diffStats = {
    EASY: { total: 0, correct: 0 },
    MEDIUM: { total: 0, correct: 0 },
    HARD: { total: 0, correct: 0 },
  };
  for (const a of [...practiceAnswers, ...examAnswers]) {
    const d = a.question.difficulty;
    diffStats[d].total += 1;
    if (a.isCorrect) diffStats[d].correct += 1;
  }

  const difficultyBreakdown = (['EASY', 'MEDIUM', 'HARD'] as const).map((d) => ({
    difficulty: d,
    label: d === 'EASY' ? 'Mudah' : d === 'MEDIUM' ? 'Sedang' : 'Sulit',
    total: diffStats[d].total,
    correct: diffStats[d].correct,
    accuracyPct:
      diffStats[d].total > 0 ? Number(((diffStats[d].correct / diffStats[d].total) * 100).toFixed(1)) : 0,
  }));

  const subjectComparison = (['TWK', 'TIU', 'TKP'] as const).map((code) => {
    const p = progressList.find((x) => x.subjectCode === code);
    const answered = p?.totalAnswered ?? 0;
    const accuracyPct =
      code === 'TKP'
        ? p && p.maxPossibleScore > 0
          ? Number(((p.totalScore / p.maxPossibleScore) * 100).toFixed(1))
          : 0
        : answered > 0
          ? Number((((p?.correctCount ?? 0) / answered) * 100).toFixed(1))
          : 0;
    return {
      subjectCode: code,
      totalAnswered: answered,
      correctCount: p?.correctCount ?? 0,
      accuracyPct,
      avgTimeSec: answered > 0 ? Number((((p?.totalTimeSec ?? 0) / answered)).toFixed(1)) : 0,
    };
  });

  return {
    thresholds: MASTERY_THRESHOLDS,
    subjectComparison,
    topicAnalysis,
    weakestTopics: weakestThree,
    insufficientDataCount: topicAnalysis.filter((t) => !t.hasSufficientData).length,
    difficultyBreakdown,
    activityTrend: dailyActivities.map((d) => ({
      date: d.date,
      questionsAnswered: d.questionsAnswered,
      correctCount: d.correctCount,
      accuracyPct:
        d.questionsAnswered > 0 ? Number(((d.correctCount / d.questionsAnswered) * 100).toFixed(1)) : 0,
      studyMinutes: Math.round(d.studyTimeSec / 60),
      xpEarned: d.xpEarned,
    })),
  };
}
