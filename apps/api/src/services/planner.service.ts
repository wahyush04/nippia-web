import { prisma } from '../lib/prisma.js';
import { getTodayWibString } from './gamification.service.js';

const DAY_NAMES_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

/**
 * Generates an adaptive 14-day study plan prioritizing weak topics, error notebook review,
 * and periodic CAT simulation milestones.
 */
export async function generateAdaptiveStudyPlan(
  userId: string,
  options?: {
    targetExamDate?: string | null;
    dailyMinutes?: number;
    targetScore?: number;
    preferredDays?: number[];
  },
) {
  const [profile, prefs, masteries, topics] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.userPreference.findUnique({ where: { userId } }),
    prisma.topicMastery.findMany({
      where: { userId },
      include: { topic: { include: { subject: true } } },
    }),
    prisma.topic.findMany({ include: { subject: true } }),
  ]);

  const dailyMinutes = options?.dailyMinutes ?? profile?.dailyStudyMinutes ?? 45;
  const targetScore = options?.targetScore ?? profile?.targetScore ?? 380;
  const preferredDays =
    options?.preferredDays && options.preferredDays.length > 0
      ? options.preferredDays
      : prefs?.preferredStudyDays ?? [1, 2, 3, 4, 5];
  const targetExamDate =
    options?.targetExamDate !== undefined
      ? options.targetExamDate
        ? new Date(options.targetExamDate)
        : null
      : profile?.targetExamDate ?? null;

  // Determine weakest/confidence priority order
  const masteryByTopic = new Map(masteries.map((m) => [m.topicId, m]));
  const confidenceWeight = (subj: 'TWK' | 'TIU' | 'TKP') => {
    const conf =
      subj === 'TWK'
        ? profile?.confidenceTwk ?? 3
        : subj === 'TIU'
          ? profile?.confidenceTiu ?? 3
          : profile?.confidenceTkp ?? 3;
    return 6 - conf; // lower confidence -> higher priority
  };

  const prioritizedTopics = [...topics].sort((a, b) => {
    const ma = masteryByTopic.get(a.id);
    const mb = masteryByTopic.get(b.id);
    const scoreA = (ma && ma.attemptsCount >= 3 ? 100 - ma.accuracyPct : 55) + confidenceWeight(a.subject.code) * 5;
    const scoreB = (mb && mb.attemptsCount >= 3 ? 100 - mb.accuracyPct : 55) + confidenceWeight(b.subject.code) * 5;
    return scoreB - scoreA;
  });

  const qPerSession = dailyMinutes >= 60 ? 15 : dailyMinutes >= 30 ? 10 : 5;
  const todayStr = getTodayWibString();
  const baseDate = new Date(`${todayStr}T00:00:00Z`);

  await prisma.studyPlan.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false },
  });

  const plan = await prisma.studyPlan.create({
    data: {
      userId,
      title: `Rencana Belajar Adaptif SKD (${dailyMinutes} mnt/hari)`,
      targetExamDate,
      dailyMinutes,
      targetScore,
      preferredDays,
      isActive: true,
    },
  });

  const tasksData: Array<{
    studyPlanId: string;
    scheduledDate: string;
    dayLabel: string;
    taskType: string;
    subjectCode?: 'TWK' | 'TIU' | 'TKP';
    topicSlug?: string;
    title: string;
    description: string;
    questionCount: number;
  }> = [];

  let topicIdx = 0;
  let studyDayCount = 0;

  for (let offset = 0; offset < 14; offset++) {
    const dt = new Date(baseDate);
    dt.setUTCDate(dt.getUTCDate() + offset);
    const dow = dt.getUTCDay();
    if (!preferredDays.includes(dow)) continue;

    studyDayCount++;
    const dateStr = dt.toISOString().slice(0, 10);
    const dayLabel = DAY_NAMES_ID[dow];

    // Every 6th study day -> CAT Mini/Full Simulation milestone
    if (studyDayCount % 6 === 0) {
      tasksData.push({
        studyPlanId: plan.id,
        scheduledDate: dateStr,
        dayLabel,
        taskType: 'SIMULATION',
        title: 'Simulasi CAT SKD Terjadwal',
        description: 'Uji ketahanan fokus dan manajemen waktu dengan simulasi CAT serta evaluasi skor tiap subtes.',
        questionCount: 110,
      });
      continue;
    }

    const t1 = prioritizedTopics[topicIdx % prioritizedTopics.length];
    topicIdx++;
    tasksData.push({
      studyPlanId: plan.id,
      scheduledDate: dateStr,
      dayLabel,
      taskType: 'PRACTICE',
      subjectCode: t1.subject.code,
      topicSlug: t1.slug,
      title: `${t1.subject.code}: ${t1.name} (${qPerSession} soal)`,
      description: `Latihan terarah untuk memperkuat topik ${t1.name} dan membaca pembahasan trik cepat.`,
      questionCount: qPerSession,
    });

    if (studyDayCount % 2 === 0) {
      tasksData.push({
        studyPlanId: plan.id,
        scheduledDate: dateStr,
        dayLabel,
        taskType: 'REVIEW_ERRORS',
        title: 'Ulas Buku Kesalahan & Spaced Repetition',
        description: 'Kerjakan ulang soal-soal yang sebelumnya keliru agar kesalahan serupa tidak terulang.',
        questionCount: 10,
      });
    } else {
      const t2 = prioritizedTopics[topicIdx % prioritizedTopics.length];
      topicIdx++;
      tasksData.push({
        studyPlanId: plan.id,
        scheduledDate: dateStr,
        dayLabel,
        taskType: 'PRACTICE',
        subjectCode: t2.subject.code,
        topicSlug: t2.slug,
        title: `${t2.subject.code}: ${t2.name} (${qPerSession} soal)`,
        description: `Latihan variasi soal pada topik ${t2.name} untuk memperluas pola pemecahan masalah.`,
        questionCount: qPerSession,
      });
    }
  }

  if (tasksData.length > 0) {
    await prisma.studyPlanTask.createMany({ data: tasksData });
  }

  return prisma.studyPlan.findUnique({
    where: { id: plan.id },
    include: { tasks: { orderBy: { scheduledDate: 'asc' } } },
  });
}
