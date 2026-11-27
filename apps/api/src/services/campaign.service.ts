import type { SubjectCode } from '@nippia/shared';
import { prisma } from '../lib/prisma.js';
import { FREE_LIMITS, getUserEntitlement } from './subscription.service.js';

export const CAMPAIGN_UNIT_SIZE = 10;

const DIFFICULTY_WEIGHT: Record<string, number> = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
};

export interface BuiltCampaignUnit {
  subjectCode: SubjectCode;
  unitNumber: number;
  title: string;
  topicSummary: string;
  topics: Array<{ name: string; slug: string; count: number }>;
  difficultyLabel: string;
  isMilestone: boolean;
  questionCount: number;
  questionIds: string[];
}

export interface CampaignTrackMeta {
  code: SubjectCode;
  name: string;
  tagline: string;
  accent: 'navy' | 'indigo' | 'emerald';
}

export const CAMPAIGN_TRACKS: CampaignTrackMeta[] = [
  {
    code: 'TWK',
    name: 'Jalur Kebangsaan (TWK)',
    tagline: 'Kuasai Pilar Negara, UUD 1945, Integritas, dan EYD V unit demi unit.',
    accent: 'navy',
  },
  {
    code: 'TIU',
    name: 'Jalur Intelegensia (TIU)',
    tagline: 'Taklukkan Silogisme, Analitis, Deret, Soal Cerita, hingga Figural bertahap.',
    accent: 'indigo',
  },
  {
    code: 'TKP',
    name: 'Jalur Karakteristik ASN (TKP)',
    tagline: 'Latih insting keputusan skor 5 pada 6 kompetensi inti ASN.',
    accent: 'emerald',
  },
];

function summarizeDifficulty(diffs: string[]): string {
  if (diffs.length === 0) return 'Campuran';
  const avg =
    diffs.reduce((acc, d) => acc + (DIFFICULTY_WEIGHT[d] ?? 2), 0) / diffs.length;
  if (avg < 1.55) return 'Dasar';
  if (avg < 2.2) return 'Menengah';
  return 'Menantang';
}

export async function buildSubjectCampaignUnits(
  subjectCode: SubjectCode,
): Promise<BuiltCampaignUnit[]> {
  const questions = await prisma.question.findMany({
    where: {
      status: 'PUBLISHED',
      subject: { code: subjectCode },
    },
    select: {
      id: true,
      code: true,
      difficulty: true,
      topic: {
        select: {
          name: true,
          slug: true,
          orderIndex: true,
        },
      },
    },
  });

  questions.sort((a, b) => {
    const topicCmp = a.topic.orderIndex - b.topic.orderIndex;
    if (topicCmp !== 0) return topicCmp;
    const diffCmp =
      (DIFFICULTY_WEIGHT[a.difficulty] ?? 2) - (DIFFICULTY_WEIGHT[b.difficulty] ?? 2);
    if (diffCmp !== 0) return diffCmp;
    return a.code.localeCompare(b.code);
  });

  const totalUnits = Math.floor(questions.length / CAMPAIGN_UNIT_SIZE);
  const units: BuiltCampaignUnit[] = [];

  for (let i = 0; i < totalUnits; i++) {
    const unitNumber = i + 1;
    const slice = questions.slice(i * CAMPAIGN_UNIT_SIZE, (i + 1) * CAMPAIGN_UNIT_SIZE);

    const topicCounter = new Map<string, { name: string; slug: string; count: number }>();
    for (const q of slice) {
      const existing = topicCounter.get(q.topic.slug);
      if (existing) existing.count += 1;
      else topicCounter.set(q.topic.slug, { name: q.topic.name, slug: q.topic.slug, count: 1 });
    }

    const sortedTopics = [...topicCounter.values()].sort((a, b) => b.count - a.count);
    const primary = sortedTopics[0];
    const secondary = sortedTopics[1];

    let title = `Unit ${unitNumber}`;
    if (unitNumber === totalUnits && totalUnits >= 3) {
      title = `Misi Final ${subjectCode}: ${primary?.name ?? 'Evaluasi Terpadu'}`;
    } else if (primary && (!secondary || primary.count >= 6)) {
      title = primary.name;
    } else if (primary && secondary) {
      title = `${primary.name} & ${secondary.name}`;
    }

    const topicSummary = sortedTopics.map((t) => `${t.name} (${t.count})`).join(' • ');

    units.push({
      subjectCode,
      unitNumber,
      title,
      topicSummary,
      topics: sortedTopics,
      difficultyLabel: summarizeDifficulty(slice.map((q) => q.difficulty)),
      isMilestone: unitNumber % 5 === 0 || unitNumber === totalUnits,
      questionCount: slice.length,
      questionIds: slice.map((q) => q.id),
    });
  }

  return units;
}

export function computeCampaignStars(params: {
  subjectCode: SubjectCode;
  accuracyPct: number;
  earnedScore: number;
  maxScore: number;
  isCompleted: boolean;
}): number {
  if (!params.isCompleted) return 0;
  if (params.subjectCode === 'TKP') {
    const scorePct = params.maxScore > 0 ? (params.earnedScore / params.maxScore) * 100 : 0;
    if (scorePct >= 84) return 3;
    if (scorePct >= 72) return 2;
    return 1;
  }
  if (params.accuracyPct >= 80) return 3;
  if (params.accuracyPct >= 60) return 2;
  return 1;
}

export async function getUserCampaignOverview(userId: string) {
  const [entitlement, twkUnits, tiuUnits, tkpUnits, progressRows, activeSessions] = await Promise.all([
    getUserEntitlement(userId),
    buildSubjectCampaignUnits('TWK'),
    buildSubjectCampaignUnits('TIU'),
    buildSubjectCampaignUnits('TKP'),
    prisma.campaignUnitProgress.findMany({ where: { userId } }),
    prisma.practiceSession.findMany({
      where: {
        userId,
        sessionType: 'CAMPAIGN',
        status: 'IN_PROGRESS',
        campaignUnit: { not: null },
      },
      include: {
        answers: {
          where: { selectedKey: { not: null } },
          select: { id: true },
        },
      },
      orderBy: { startedAt: 'desc' },
    }),
  ]);
  const isPro = entitlement.isPro;

  const progressMap = new Map(
    progressRows.map((p) => [`${p.subjectCode}:${p.unitNumber}`, p]),
  );

  const activeMap = new Map<string, { sessionId: string; answeredCount: number }>();
  for (const s of activeSessions) {
    if (!s.subjectCode || !s.campaignUnit) continue;
    const key = `${s.subjectCode}:${s.campaignUnit}`;
    if (!activeMap.has(key)) {
      activeMap.set(key, { sessionId: s.id, answeredCount: s.answers.length });
    }
  }

  const unitsByCode: Record<SubjectCode, BuiltCampaignUnit[]> = {
    TWK: twkUnits,
    TIU: tiuUnits,
    TKP: tkpUnits,
  };

  let overallCompletedUnits = 0;
  let overallTotalUnits = 0;
  let overallTotalStars = 0;

  const tracks = CAMPAIGN_TRACKS.map((meta) => {
    const built = unitsByCode[meta.code];
    let completedUnits = 0;
    let totalStars = 0;
    let nextUnitNumber: number | null = null;

    const units = built.map((u) => {
      const prog = progressMap.get(`${meta.code}:${u.unitNumber}`);
      const prevProg = u.unitNumber > 1 ? progressMap.get(`${meta.code}:${u.unitNumber - 1}`) : null;
      const isCompleted = Boolean(prog?.isCompleted);
      const requiresPro = !isPro && u.unitNumber > FREE_LIMITS.CAMPAIGN_MAX_UNIT;
      const isUnlocked = !requiresPro && (u.unitNumber === 1 || Boolean(prevProg?.isCompleted) || isCompleted);
      const status: 'COMPLETED' | 'UNLOCKED' | 'LOCKED' | 'PRO_LOCKED' = requiresPro
        ? 'PRO_LOCKED'
        : isCompleted
          ? 'COMPLETED'
          : isUnlocked
            ? 'UNLOCKED'
            : 'LOCKED';

      if (isCompleted) completedUnits += 1;
      totalStars += prog?.stars ?? 0;
      if (status === 'UNLOCKED' && nextUnitNumber === null) {
        nextUnitNumber = u.unitNumber;
      }

      const active = activeMap.get(`${meta.code}:${u.unitNumber}`);

      return {
        subjectCode: u.subjectCode,
        unitNumber: u.unitNumber,
        title: u.title,
        topicSummary: u.topicSummary,
        topics: u.topics,
        difficultyLabel: u.difficultyLabel,
        isMilestone: u.isMilestone,
        questionCount: u.questionCount,
        status,
        requiresPro,
        activeSessionId: active?.sessionId ?? null,
        activeAnsweredCount: active?.answeredCount ?? 0,
        progress: prog
          ? {
              bestScore: prog.bestScore,
              bestCorrect: prog.bestCorrect,
              bestAccuracy: prog.bestAccuracy,
              stars: prog.stars,
              attemptsCount: prog.attemptsCount,
              lastSessionId: prog.lastSessionId,
              completedAt: prog.completedAt,
            }
          : null,
      };
    });

    overallCompletedUnits += completedUnits;
    overallTotalUnits += units.length;
    overallTotalStars += totalStars;

    return {
      ...meta,
      totalUnits: units.length,
      completedUnits,
      totalQuestions: units.length * CAMPAIGN_UNIT_SIZE,
      totalStars,
      maxStars: units.length * 3,
      nextUnitNumber: nextUnitNumber ?? (units.length > 0 ? units[units.length - 1].unitNumber : null),
      units,
    };
  });

  return {
    unitSize: CAMPAIGN_UNIT_SIZE,
    isPro,
    freeMaxUnit: FREE_LIMITS.CAMPAIGN_MAX_UNIT,
    overallCompletedUnits,
    overallTotalUnits,
    overallTotalStars,
    overallMaxStars: overallTotalUnits * 3,
    tracks,
  };
}
