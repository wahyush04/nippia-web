import crypto from 'crypto';
import type { SubjectCode, LiveEventStatus } from '@nippia/shared';
import { LIVE_EVENT_TRANSITIONS } from '@nippia/shared';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  evaluateSingleAnswer,
  type PassingGradeRule,
  type ScoringRuleConfig,
} from './scoring.service.js';

export interface SnapshotOption {
  optionKey: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
  scoreValue: number;
  isCorrect: boolean;
  optionFeedback: string | null;
  visualSpec: Record<string, unknown> | null;
}

export interface QuestionSnapshotPayload {
  id: string;
  code: string;
  subjectCode: SubjectCode;
  topicId: string;
  topicSlug: string;
  topicName: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  questionType: string;
  stem: string;
  visualSpec: Record<string, unknown> | null;
  options: SnapshotOption[];
  explanation: string;
  conceptSummary: string | null;
  stepByStep: string[];
  whyOthersWrong: Record<string, string>;
  quickTrick: string | null;
  commonMistakes: string | null;
  studyTip: string | null;
  references: Array<{ title: string; source: string; note?: string | null }>;
}

import {
  BASE_OPTION_KEYS,
  buildOptionOrderMap,
  displayKeyToOriginal,
  originalKeyToDisplay,
} from '../utils/optionOrder.js';

export { buildOptionOrderMap, displayKeyToOriginal, originalKeyToDisplay };
const BASE_KEYS = BASE_OPTION_KEYS;

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export async function logLiveEventAudit(
  eventId: string,
  actorId: string,
  action: string,
  metadata?: Record<string, unknown>,
) {
  try {
    await prisma.liveEventAuditLog.create({
      data: {
        eventId,
        actorId,
        action,
        metadata: metadata ? (metadata as object) : undefined,
      },
    });
  } catch (err) {
    console.warn('[LIVE EVENT AUDIT FAILED]', err);
  }
}

export function getServerEventTiming(
  event: {
    eventStatus: LiveEventStatus;
    isPaused: boolean;
    pausedAt: Date | null;
    scheduledStartAt: Date;
    actualStartAt: Date | null;
    deadlineAt: Date | null;
    durationSeconds: number;
  },
  now = new Date(),
) {
  const serverNowMs = now.getTime();
  const scheduledStartMs = event.scheduledStartAt.getTime();
  const deadlineMs = event.deadlineAt?.getTime() ?? null;

  let remainingSeconds = event.durationSeconds;
  let isTimeExpired = false;

  if (event.eventStatus === 'LIVE' && deadlineMs !== null) {
    const referenceMs = event.isPaused && event.pausedAt ? event.pausedAt.getTime() : serverNowMs;
    const diffSec = Math.floor((deadlineMs - referenceMs) / 1000);
    remainingSeconds = Math.max(0, diffSec);
    isTimeExpired = !event.isPaused && serverNowMs >= deadlineMs;
  } else if (['FINALIZING', 'COMPLETED', 'CANCELLED'].includes(event.eventStatus)) {
    remainingSeconds = 0;
  }

  return {
    serverNow: now.toISOString(),
    serverNowMs,
    scheduledStartAt: event.scheduledStartAt.toISOString(),
    actualStartAt: event.actualStartAt?.toISOString() ?? null,
    deadlineAt: event.deadlineAt?.toISOString() ?? null,
    countdownToStartSeconds: Math.max(0, Math.floor((scheduledStartMs - serverNowMs) / 1000)),
    remainingSeconds,
    isPaused: event.isPaused,
    isTimeExpired,
  };
}

export async function resolveEventScoringConfig(scoringConfigId: string | null): Promise<{
  config: ScoringRuleConfig;
  passingGrades: PassingGradeRule[];
}> {
  const found = scoringConfigId
    ? await prisma.scoringConfiguration.findUnique({
        where: { id: scoringConfigId },
        include: { passingGrades: { where: { isActive: true } } },
      })
    : await prisma.scoringConfiguration.findFirst({
        where: { isActive: true },
        include: { passingGrades: { where: { isActive: true } } },
        orderBy: { year: 'desc' },
      });

  if (!found) {
    throw new AppError(400, 'Konfigurasi penilaian SKD aktif belum tersedia.');
  }

  return {
    config: {
      id: found.id,
      name: found.name,
      year: found.year,
      isOfficialStyle: found.isOfficialStyle,
      sourceReference: found.sourceReference,
      durationMinutes: found.durationMinutes,
      disabilityMins: found.disabilityMins,
      twkQuestionCount: found.twkQuestionCount,
      tiuQuestionCount: found.tiuQuestionCount,
      tkpQuestionCount: found.tkpQuestionCount,
      twkCorrectPoints: found.twkCorrectPoints,
      twkWrongPoints: found.twkWrongPoints,
      tiuCorrectPoints: found.tiuCorrectPoints,
      tiuWrongPoints: found.tiuWrongPoints,
      tkpMinPoints: found.tkpMinPoints,
      tkpMaxPoints: found.tkpMaxPoints,
      unansweredPoints: found.unansweredPoints,
      version: found.version,
    },
    passingGrades: found.passingGrades.map((pg) => ({
      formationType: pg.formationType,
      year: pg.year,
      twkThreshold: pg.twkThreshold,
      tiuThreshold: pg.tiuThreshold,
      tkpThreshold: pg.tkpThreshold,
      totalThreshold: pg.totalThreshold,
      sourceDocument: pg.sourceDocument,
    })),
  };
}

/**
 * Generates and freezes an immutable event question set snapshot before the exam begins.
 * Validates question completeness, 5 options, answer keys, and scoring snapshot.
 */
export async function freezeEventQuestionSet(eventId: string, forceRegenerate = false) {
  const event = await prisma.liveEvent.findUnique({
    where: { id: eventId },
    include: { _count: { select: { questionSets: true } } },
  });
  if (!event) throw new AppError(404, 'Event Live Akbar tidak ditemukan.');

  if (['LIVE', 'FINALIZING', 'COMPLETED'].includes(event.eventStatus)) {
    throw new AppError(400, 'Paket soal event yang sudah berjalan atau selesai tidak dapat diubah.');
  }

  if (event._count.questionSets > 0 && !forceRegenerate) {
    return { frozenCount: event._count.questionSets, alreadyFrozen: true };
  }

  const { config, passingGrades } = await resolveEventScoringConfig(event.scoringConfigId);
  const scoringSnapshot = { config, passingGrades };

  const allPublished = await prisma.question.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      subject: true,
      topic: true,
      options: { orderBy: { optionKey: 'asc' } },
      references: true,
    },
  });

  const pickForSubject = (subj: SubjectCode, need: number) => {
    if (need <= 0) return [];
    let primary = allPublished.filter(
      (q) =>
        q.subject.code === subj &&
        (event.packageCode === 'ALL' || q.packageCode === event.packageCode),
    );
    if (event.difficultyMix !== 'BALANCED') {
      const exactDiff = primary.filter((q) => q.difficulty === event.difficultyMix);
      const rest = primary.filter((q) => q.difficulty !== event.difficultyMix);
      primary = [...shuffleArray(exactDiff), ...shuffleArray(rest)];
    } else {
      primary = shuffleArray(primary);
    }

    const pickedIds = new Set(primary.slice(0, need).map((q) => q.id));
    let selected = primary.slice(0, need);

    if (selected.length < need) {
      const fallback = shuffleArray(
        allPublished.filter((q) => q.subject.code === subj && !pickedIds.has(q.id)),
      );
      selected = [...selected, ...fallback.slice(0, need - selected.length)];
    }

    if (selected.length < need) {
      throw new AppError(
        400,
        `Bank soal ${subj} belum mencukupi (${selected.length}/${need} tersedia).`,
      );
    }

    return selected;
  };

  const twk = pickForSubject('TWK', event.twkCount);
  const tiu = pickForSubject('TIU', event.tiuCount);
  const tkp = pickForSubject('TKP', event.tkpCount);
  const orderedQuestions = [...twk, ...tiu, ...tkp];

  if (orderedQuestions.length === 0) {
    throw new AppError(400, 'Total soal event harus minimal 1 soal.');
  }

  // Validate option completeness & answer key integrity before freezing
  for (const q of orderedQuestions) {
    if (q.options.length !== 5) {
      throw new AppError(400, `Soal ${q.code} tidak memiliki tepat 5 pilihan jawaban.`);
    }
    if (q.subject.code === 'TKP') {
      const hasValidWeights = q.options.some((o) => o.scoreValue > 0);
      if (!hasValidWeights) {
        throw new AppError(400, `Soal TKP ${q.code} belum memiliki bobot skor yang valid.`);
      }
    } else {
      const correctCount = q.options.filter((o) => o.isCorrect).length;
      if (correctCount !== 1) {
        throw new AppError(400, `Soal ${q.code} harus memiliki tepat 1 kunci jawaban benar.`);
      }
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.liveEventQuestionSet.deleteMany({ where: { eventId } });
    await tx.liveEventQuestionSet.createMany({
      data: orderedQuestions.map((q, idx) => {
        const snapshot: QuestionSnapshotPayload = {
          id: q.id,
          code: q.code,
          subjectCode: q.subject.code,
          topicId: q.topicId,
          topicSlug: q.topic.slug,
          topicName: q.topic.name,
          difficulty: q.difficulty,
          questionType: q.questionType,
          stem: q.stem,
          visualSpec: (q.visualSpec as Record<string, unknown> | null) ?? null,
          options: q.options.map((o) => ({
            optionKey: o.optionKey as 'A' | 'B' | 'C' | 'D' | 'E',
            text: o.text,
            scoreValue: o.scoreValue,
            isCorrect: o.isCorrect,
            optionFeedback: o.optionFeedback ?? null,
            visualSpec: (o.visualSpec as Record<string, unknown> | null) ?? null,
          })),
          explanation: q.explanation,
          conceptSummary: q.conceptSummary ?? null,
          stepByStep: Array.isArray(q.stepByStep) ? (q.stepByStep as string[]) : [],
          whyOthersWrong:
            q.whyOthersWrong && typeof q.whyOthersWrong === 'object'
              ? (q.whyOthersWrong as Record<string, string>)
              : {},
          quickTrick: q.quickTrick ?? null,
          commonMistakes: q.commonMistakes ?? null,
          studyTip: q.studyTip ?? null,
          references: q.references.map((r) => ({
            title: r.title,
            source: r.source,
            note: r.note ?? null,
          })),
        };

        return {
          eventId,
          questionId: q.id,
          questionOrder: idx + 1,
          subject: q.subject.code,
          topic: q.topic.name,
          questionSnapshot: snapshot as unknown as object,
          scoringSnapshot: scoringSnapshot as unknown as object,
        };
      }),
    });

    await tx.liveEvent.update({
      where: { id: eventId },
      data: {
        snapshotFrozenAt: new Date(),
        scoringConfigId: config.id,
      },
    });
  });

  return { frozenCount: orderedQuestions.length, alreadyFrozen: false };
}

export async function validateStateTransition(current: LiveEventStatus, next: LiveEventStatus) {
  if (current === next) return;
  const allowed = LIVE_EVENT_TRANSITIONS[current] ?? [];
  if (!allowed.includes(next)) {
    throw new AppError(
      400,
      `Transisi status event dari ${current} ke ${next} tidak diizinkan.`,
      'INVALID_STATE_TRANSITION',
    );
  }
}

/**
 * Dispatches idempotent in-app notifications for all registered participants of an event.
 */
export async function dispatchEventNotifications(
  eventId: string,
  notificationType: string,
  title: string,
  message: string,
  targetUserIds?: string[],
) {
  let userIds = targetUserIds;
  if (!userIds) {
    const regs = await prisma.liveEventRegistration.findMany({
      where: {
        eventId,
        registrationStatus: { in: ['REGISTERED', 'CONFIRMED'] },
      },
      select: { userId: true },
    });
    userIds = regs.map((r) => r.userId);
  }
  if (userIds.length === 0) return 0;

  const result = await prisma.liveEventNotification.createMany({
    data: userIds.map((userId) => ({
      eventId,
      userId,
      notificationType,
      title,
      message,
      deliveryStatus: 'DELIVERED',
    })),
    skipDuplicates: true,
  });

  return result.count;
}

/**
 * Ensures participant joins/creates their LiveEventSession atomically once the event is LIVE.
 */
export async function joinLiveExamSession(eventId: string, userId: string) {
  const event = await prisma.liveEvent.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError(404, 'Event Live Akbar tidak ditemukan.');

  if (event.eventStatus === 'CANCELLED') {
    throw new AppError(400, 'Event telah dibatalkan.', 'EVENT_CANCELLED');
  }
  if (event.eventStatus !== 'LIVE') {
    throw new AppError(
      403,
      'Ujian belum dimulai oleh penyelenggara. Silakan tunggu di Ruang Tunggu.',
      'EXAM_NOT_LIVE',
    );
  }

  const now = new Date();
  if (event.deadlineAt && !event.isPaused && now > event.deadlineAt) {
    throw new AppError(409, 'Batas waktu ujian telah berakhir.', 'EXAM_TIME_EXPIRED');
  }

  const reg = await prisma.liveEventRegistration.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });
  if (!reg || !['REGISTERED', 'CONFIRMED'].includes(reg.registrationStatus)) {
    throw new AppError(
      403,
      'Anda belum terdaftar atau tidak memiliki akses ke event ini.',
      'NOT_REGISTERED',
    );
  }

  const existing = await prisma.liveEventSession.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });

  if (existing) {
    if (existing.sessionStatus === 'DISQUALIFIED') {
      throw new AppError(403, 'Sesi Anda didiskualifikasi oleh pengawas.', 'DISQUALIFIED');
    }
    if (['SUBMITTED', 'TIME_EXPIRED'].includes(existing.sessionStatus)) {
      return existing;
    }

    const updated = await prisma.liveEventSession.update({
      where: { id: existing.id },
      data: {
        sessionStatus: 'IN_PROGRESS',
        startedAt: existing.startedAt ?? event.actualStartAt ?? now,
        connectionStatus: 'ONLINE',
        lastActivityAt: now,
        reconnectCount: existing.connectionStatus === 'DISCONNECTED' ? { increment: 1 } : undefined,
      },
    });
    return updated;
  }

  const qSets = await prisma.liveEventQuestionSet.findMany({
    where: { eventId },
    orderBy: { questionOrder: 'asc' },
    select: { questionId: true },
  });
  if (qSets.length === 0) {
    throw new AppError(500, 'Paket soal event belum disiapkan oleh administrator.');
  }

  const seed = `${eventId}:${userId}:${crypto.randomBytes(8).toString('hex')}`;
  const optionOrderMap = buildOptionOrderMap(
    qSets.map((q) => q.questionId),
    seed,
    event.randomizeOptions,
  );

  // Upsert-safe creation against concurrent clicks
  try {
    return await prisma.liveEventSession.create({
      data: {
        eventId,
        userId,
        sessionStatus: 'IN_PROGRESS',
        startedAt: event.actualStartAt ?? now,
        connectionStatus: 'ONLINE',
        lastActivityAt: now,
        optionSeed: seed,
        optionOrderMap: optionOrderMap as object,
      },
    });
  } catch {
    const retry = await prisma.liveEventSession.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
    if (!retry) throw new AppError(500, 'Gagal memulai sesi ujian.');
    return retry;
  }
}

/**
 * Idempotent & revision-safe answer persistence enforced by server deadline.
 */
export async function saveLiveAnswer(params: {
  eventId: string;
  userId: string;
  questionId: string;
  displayOption: 'A' | 'B' | 'C' | 'D' | 'E' | null;
  isFlagged?: boolean;
  clientRevision?: number;
}) {
  const { eventId, userId, questionId, displayOption, isFlagged, clientRevision } = params;
  const now = new Date();

  const event = await prisma.liveEvent.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError(404, 'Event tidak ditemukan.');

  if (event.eventStatus !== 'LIVE') {
    throw new AppError(409, 'Ujian tidak sedang berlangsung.', 'EXAM_NOT_LIVE');
  }
  if (event.isPaused) {
    throw new AppError(409, 'Ujian sedang dijeda sementara oleh Host/Operator.', 'EVENT_PAUSED');
  }
  if (event.deadlineAt && now.getTime() > event.deadlineAt.getTime()) {
    // Auto-submit active session cleanly
    await submitLiveSession(eventId, userId, 'TIME_EXPIRED');
    throw new AppError(409, 'Waktu ujian telah habis dan jawaban telah dikumpulkan otomatis.', 'EXAM_TIME_EXPIRED');
  }

  const session = await prisma.liveEventSession.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });
  if (!session) throw new AppError(403, 'Sesi ujian belum dimulai.');
  if (session.sessionStatus !== 'IN_PROGRESS') {
    throw new AppError(409, 'Sesi ujian sudah ditutup atau dikumpulkan.', 'SESSION_CLOSED');
  }

  const qInEvent = await prisma.liveEventQuestionSet.findUnique({
    where: { eventId_questionId: { eventId, questionId } },
    select: { id: true },
  });
  if (!qInEvent) throw new AppError(404, 'Soal tidak termasuk dalam paket event ini.');

  const optionOrderMap = (session.optionOrderMap as Record<string, string[]> | null) ?? null;
  const originalOption = displayKeyToOriginal(optionOrderMap, questionId, displayOption);

  const saved = await prisma.$transaction(async (tx) => {
    const existing = await tx.liveEventAnswer.findUnique({
      where: { sessionId_questionId: { sessionId: session.id, questionId } },
    });

    if (existing && clientRevision !== undefined && clientRevision <= existing.answerRevision) {
      return { answer: existing, staleIgnored: true };
    }

    const nextRevision = Math.max((existing?.answerRevision ?? 0) + 1, clientRevision ?? 1);
    const upserted = await tx.liveEventAnswer.upsert({
      where: { sessionId_questionId: { sessionId: session.id, questionId } },
      update: {
        selectedOption: originalOption,
        ...(isFlagged !== undefined ? { isFlagged } : {}),
        answerRevision: nextRevision,
        answeredAt: now,
      },
      create: {
        sessionId: session.id,
        questionId,
        selectedOption: originalOption,
        isFlagged: isFlagged ?? false,
        answerRevision: nextRevision,
        answeredAt: now,
      },
    });

    await tx.liveEventSession.update({
      where: { id: session.id },
      data: { lastActivityAt: now, connectionStatus: 'ONLINE' },
    });

    return { answer: upserted, staleIgnored: false };
  }, { maxWait: 10000, timeout: 10000 });

  return {
    questionId,
    selectedOption: displayOption,
    isFlagged: saved.answer.isFlagged,
    answerRevision: saved.answer.answerRevision,
    answeredAt: saved.answer.answeredAt.toISOString(),
    staleIgnored: saved.staleIgnored,
  };
}

/**
 * Transaction-safe, idempotent exam submission & server-side scoring using immutable snapshots.
 */
export async function submitLiveSession(
  eventId: string,
  userId: string,
  reason: 'MANUAL' | 'TIME_EXPIRED' | 'ADMIN_FORCE' | 'DISQUALIFIED' = 'MANUAL',
  submissionToken?: string,
) {
  const event = await prisma.liveEvent.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError(404, 'Event tidak ditemukan.');

  const resultOut = await prisma.$transaction(async (tx) => {
    const session = await tx.liveEventSession.findUnique({
      where: { eventId_userId: { eventId, userId } },
      include: { result: true },
    });

    if (!session) {
      throw new AppError(404, 'Sesi ujian peserta tidak ditemukan.');
    }

    if (session.result || ['SUBMITTED', 'TIME_EXPIRED'].includes(session.sessionStatus)) {
      return {
        alreadySubmitted: true,
        resultId: session.result?.id ?? null,
        sessionStatus: session.sessionStatus,
        result: session.result,
      };
    }

    if (submissionToken) {
      const dupToken = await tx.liveEventSession.findUnique({
        where: { submissionToken },
        include: { result: true },
      });
      if (dupToken && dupToken.result) {
        return {
          alreadySubmitted: true,
          resultId: dupToken.result.id,
          sessionStatus: dupToken.sessionStatus,
          result: dupToken.result,
        };
      }
    }

    const questionSets = await tx.liveEventQuestionSet.findMany({
      where: { eventId },
      orderBy: { questionOrder: 'asc' },
    });
    const answers = await tx.liveEventAnswer.findMany({
      where: { sessionId: session.id },
    });
    const ansMap = new Map(answers.map((a) => [a.questionId, a]));

    let twkScore = 0;
    let tiuScore = 0;
    let tkpScore = 0;
    let maxScore = 0;
    let twkCorrect = 0;
    let twkWrong = 0;
    let twkUnanswered = 0;
    let tiuCorrect = 0;
    let tiuWrong = 0;
    let tiuUnanswered = 0;
    let tkpAnswered = 0;
    let tkpUnanswered = 0;

    const topicAcc: Record<
      string,
      { topicName: string; subject: SubjectCode; total: number; answered: number; correct: number; earned: number; max: number }
    > = {};
    const diffAcc: Record<'EASY' | 'MEDIUM' | 'HARD', { total: number; correct: number; earned: number; max: number }> = {
      EASY: { total: 0, correct: 0, earned: 0, max: 0 },
      MEDIUM: { total: 0, correct: 0, earned: 0, max: 0 },
      HARD: { total: 0, correct: 0, earned: 0, max: 0 },
    };

    let activePassingGrade: PassingGradeRule | null = null;

    for (const qs of questionSets) {
      const qSnap = qs.questionSnapshot as unknown as QuestionSnapshotPayload;
      const sSnap = qs.scoringSnapshot as unknown as {
        config: ScoringRuleConfig;
        passingGrades: PassingGradeRule[];
      };
      if (!activePassingGrade && sSnap.passingGrades?.length) {
        activePassingGrade =
          sSnap.passingGrades.find((pg) => pg.formationType === 'UMUM') ?? sSnap.passingGrades[0]!;
      }

      const ans = ansMap.get(qs.questionId);
      const selectedKey = ans?.selectedOption ?? null;

      const evaluated = evaluateSingleAnswer(
        {
          questionId: qs.questionId,
          subjectCode: qSnap.subjectCode,
          selectedKey,
          options: qSnap.options.map((o) => ({
            optionKey: o.optionKey,
            scoreValue: o.scoreValue,
            isCorrect: o.isCorrect,
          })),
        },
        sSnap.config,
      );

      maxScore += evaluated.maxScore;

      if (qSnap.subjectCode === 'TWK') {
        twkScore += evaluated.scoreEarned;
        if (!selectedKey) twkUnanswered++;
        else if (evaluated.isCorrect) twkCorrect++;
        else twkWrong++;
      } else if (qSnap.subjectCode === 'TIU') {
        tiuScore += evaluated.scoreEarned;
        if (!selectedKey) tiuUnanswered++;
        else if (evaluated.isCorrect) tiuCorrect++;
        else tiuWrong++;
      } else {
        tkpScore += evaluated.scoreEarned;
        if (!selectedKey) tkpUnanswered++;
        else tkpAnswered++;
      }

      if (ans) {
        await tx.liveEventAnswer.update({
          where: { id: ans.id },
          data: {
            scoreAwarded: evaluated.scoreEarned,
            isCorrect: evaluated.isCorrect,
          },
        });
      }

      const topicKey = qSnap.topicSlug || qSnap.topicName;
      if (!topicAcc[topicKey]) {
        topicAcc[topicKey] = {
          topicName: qSnap.topicName,
          subject: qSnap.subjectCode,
          total: 0,
          answered: 0,
          correct: 0,
          earned: 0,
          max: 0,
        };
      }
      const t = topicAcc[topicKey]!;
      t.total++;
      if (selectedKey) t.answered++;
      if (evaluated.isCorrect) t.correct++;
      t.earned += evaluated.scoreEarned;
      t.max += evaluated.maxScore;

      const d = diffAcc[qSnap.difficulty] ?? diffAcc.MEDIUM;
      d.total++;
      if (evaluated.isCorrect) d.correct++;
      d.earned += evaluated.scoreEarned;
      d.max += evaluated.maxScore;
    }

    const totalScore = twkScore + tiuScore + tkpScore;
    const now = new Date();
    const effectiveEnd =
      reason === 'TIME_EXPIRED' && event.deadlineAt ? event.deadlineAt : now;
    const rawStart = event.actualStartAt ?? session.startedAt ?? now;
    const completionTimeSeconds = Math.max(
      1,
      Math.min(
        event.durationSeconds,
        Math.round((effectiveEnd.getTime() - rawStart.getTime()) / 1000) - event.totalPausedSeconds,
      ),
    );

    const overallPassed = activePassingGrade
      ? twkScore >= activePassingGrade.twkThreshold &&
        tiuScore >= activePassingGrade.tiuThreshold &&
        tkpScore >= activePassingGrade.tkpThreshold
      : null;

    const finalSessionStatus =
      reason === 'TIME_EXPIRED'
        ? 'TIME_EXPIRED'
        : reason === 'DISQUALIFIED'
          ? 'DISQUALIFIED'
          : 'SUBMITTED';

    await tx.liveEventSession.update({
      where: { id: session.id },
      data: {
        sessionStatus: finalSessionStatus,
        submittedAt: effectiveEnd,
        completionReason: reason,
        ...(submissionToken ? { submissionToken } : {}),
      },
    });

    const createdResult = await tx.liveEventResult.create({
      data: {
        eventId,
        userId,
        sessionId: session.id,
        twkScore,
        tiuScore,
        tkpScore,
        totalScore,
        maxScore,
        twkCorrect,
        twkWrong,
        twkUnanswered,
        tiuCorrect,
        tiuWrong,
        tiuUnanswered,
        tkpAnswered,
        tkpUnanswered,
        overallPassed,
        completionTimeSeconds,
        topicBreakdown: Object.entries(topicAcc).map(([slug, v]) => ({
          topicSlug: slug,
          topicName: v.topicName,
          subject: v.subject,
          total: v.total,
          answered: v.answered,
          correct: v.correct,
          earnedScore: v.earned,
          maxScore: v.max,
          accuracyPct: v.max > 0 ? Math.round((v.earned / v.max) * 100) : 0,
        })) as object,
        difficultyBreakdown: Object.entries(diffAcc).map(([diff, v]) => ({
          difficulty: diff,
          total: v.total,
          correct: v.correct,
          earnedScore: v.earned,
          maxScore: v.max,
          accuracyPct: v.max > 0 ? Math.round((v.earned / v.max) * 100) : 0,
        })) as object,
      },
    });

    return {
      alreadySubmitted: false,
      resultId: createdResult.id,
      sessionStatus: finalSessionStatus,
      result: createdResult,
    };
  });

  return resultOut;
}

/**
 * Auto-submits all unfinished active sessions, computes deterministic rankings
 * (Score DESC, Completion Time ASC, TKP DESC, TIU DESC, TWK DESC), and caches leaderboard snapshot.
 */
export async function finalizeEventAndRankings(eventId: string, actorId: string) {
  const event = await prisma.liveEvent.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError(404, 'Event tidak ditemukan.');

  if (event.eventStatus === 'CANCELLED') {
    throw new AppError(400, 'Event yang dibatalkan tidak dapat difinalisasi.');
  }

  // Transition LIVE -> FINALIZING first
  if (event.eventStatus === 'LIVE') {
    await prisma.liveEvent.update({
      where: { id: eventId },
      data: { eventStatus: 'FINALIZING', isPaused: false },
    });
  }

  // Auto-submit any sessions still IN_PROGRESS
  const openSessions = await prisma.liveEventSession.findMany({
    where: { eventId, sessionStatus: { in: ['IN_PROGRESS', 'READY', 'WAITING'] } },
    select: { userId: true },
  });

  for (const s of openSessions) {
    try {
      await submitLiveSession(eventId, s.userId, 'TIME_EXPIRED');
    } catch (err) {
      console.warn('[AUTO SUBMIT SESSION FAILED]', eventId, s.userId, err);
    }
  }

  // Compute deterministic rankings
  const results = await prisma.liveEventResult.findMany({
    where: { eventId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          profile: { select: { avatarUrl: true, levelName: true } },
          preferences: { select: { isLeaderboardPublic: true } },
        },
      },
    },
    orderBy: [
      { totalScore: 'desc' },
      { completionTimeSeconds: 'asc' },
      { tkpScore: 'desc' },
      { tiuScore: 'desc' },
      { twkScore: 'desc' },
      { id: 'asc' },
    ],
  });

  const totalCount = results.length;
  let prevRank = 0;
  let prevScore: number | null = null;
  let prevTime: number | null = null;
  let prevSub: string | null = null;

  const snapshotEntries: Array<{
    rank: number;
    userId: string;
    displayName: string;
    avatarUrl: string | null;
    levelName: string;
    twkScore: number;
    tiuScore: number;
    tkpScore: number;
    totalScore: number;
    completionTimeSeconds: number;
    overallPassed: boolean | null;
  }> = [];

  for (let i = 0; i < results.length; i++) {
    const r = results[i]!;
    const subKey = `${r.tkpScore}:${r.tiuScore}:${r.twkScore}`;
    const isExactTie =
      prevScore === r.totalScore &&
      prevTime === r.completionTimeSeconds &&
      prevSub === subKey;

    const rank = isExactTie ? prevRank : i + 1;
    prevRank = rank;
    prevScore = r.totalScore;
    prevTime = r.completionTimeSeconds;
    prevSub = subKey;

    const percentile =
      totalCount <= 1 ? 100 : Math.round(((totalCount - rank) / (totalCount - 1)) * 1000) / 10;

    await prisma.liveEventResult.update({
      where: { id: r.id },
      data: { ranking: rank, percentile },
    });

    const isPublic = r.user.preferences?.isLeaderboardPublic ?? true;
    const maskedName = isPublic
      ? r.user.name
      : `Peserta #${String(i + 1).padStart(4, '0')}`;

    snapshotEntries.push({
      rank,
      userId: r.userId,
      displayName: maskedName,
      avatarUrl: r.user.profile?.avatarUrl ?? null,
      levelName: r.user.profile?.levelName ?? 'Peserta',
      twkScore: r.twkScore,
      tiuScore: r.tiuScore,
      tkpScore: r.tkpScore,
      totalScore: r.totalScore,
      completionTimeSeconds: r.completionTimeSeconds,
      overallPassed: r.overallPassed,
    });
  }

  const avgScore =
    totalCount > 0
      ? Math.round((results.reduce((acc, r) => acc + r.totalScore, 0) / totalCount) * 10) / 10
      : 0;
  const highestScore = totalCount > 0 ? results[0]!.totalScore : 0;
  const lowestScore = totalCount > 0 ? results[results.length - 1]!.totalScore : 0;

  await prisma.$transaction(async (tx) => {
    await tx.eventLeaderboardSnapshot.upsert({
      where: { eventId },
      update: {
        rankingData: snapshotEntries as object,
        totalParticipants: totalCount,
        averageScore: avgScore,
        highestScore,
        lowestScore,
        generatedAt: new Date(),
      },
      create: {
        eventId,
        rankingData: snapshotEntries as object,
        totalParticipants: totalCount,
        averageScore: avgScore,
        highestScore,
        lowestScore,
      },
    });
  });

  await logLiveEventAudit(eventId, actorId, 'FINALIZE_RESULTS', {
    totalParticipants: totalCount,
    averageScore: avgScore,
    highestScore,
  });

  return {
    totalParticipants: totalCount,
    averageScore: avgScore,
    highestScore,
    lowestScore,
  };
}

export async function getLiveEventMonitoringStats(eventId: string) {
  const [regs, sessions, snapshotCount] = await Promise.all([
    prisma.liveEventRegistration.groupBy({
      by: ['registrationStatus', 'isReady'],
      where: { eventId },
      _count: { _all: true },
    }),
    prisma.liveEventSession.findMany({
      where: { eventId },
      select: {
        sessionStatus: true,
        connectionStatus: true,
        _count: { select: { answers: true } },
      },
    }),
    prisma.liveEventQuestionSet.count({ where: { eventId } }),
  ]);

  let totalRegistered = 0;
  let totalReady = 0;
  for (const r of regs) {
    if (['REGISTERED', 'CONFIRMED'].includes(r.registrationStatus)) {
      totalRegistered += r._count._all;
      if (r.isReady) totalReady += r._count._all;
    }
  }

  let inWaitingRoom = 0;
  let activeInExam = 0;
  let submittedCount = 0;
  let expiredCount = 0;
  let disconnectedCount = 0;
  let totalAnswersCount = 0;

  for (const s of sessions) {
    if (s.sessionStatus === 'WAITING' || s.sessionStatus === 'READY') inWaitingRoom++;
    if (s.sessionStatus === 'IN_PROGRESS') activeInExam++;
    if (s.sessionStatus === 'SUBMITTED') submittedCount++;
    if (s.sessionStatus === 'TIME_EXPIRED') expiredCount++;
    if (s.connectionStatus === 'DISCONNECTED' && s.sessionStatus === 'IN_PROGRESS') {
      disconnectedCount++;
    }
    totalAnswersCount += s._count.answers;
  }

  const startedCount = activeInExam + submittedCount + expiredCount;
  const averageProgressPct =
    startedCount > 0 && snapshotCount > 0
      ? Math.min(100, Math.round((totalAnswersCount / (startedCount * snapshotCount)) * 100))
      : 0;

  return {
    totalRegistered,
    totalReady,
    inWaitingRoom,
    startedCount,
    activeInExam,
    disconnectedCount,
    submittedCount,
    expiredCount,
    completedCount: submittedCount + expiredCount,
    totalQuestions: snapshotCount,
    averageProgressPct,
  };
}
