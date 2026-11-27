import { Router } from 'express';
import { z } from 'zod';
import {
  liveEventCreateSchema,
  liveEventUpdateSchema,
  type LiveEventStatus,
} from '@nippia/shared';
import {
  requireAuth,
  requireEventAdmin,
  requireEventOperator,
} from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { prisma } from '../lib/prisma.js';
import {
  dispatchEventNotifications,
  finalizeEventAndRankings,
  freezeEventQuestionSet,
  getLiveEventMonitoringStats,
  getServerEventTiming,
  logLiveEventAudit,
  validateStateTransition,
} from '../services/live-event.service.js';
import {
  broadcastAnnouncement,
  broadcastDeadlineUpdated,
  broadcastEventStatus,
  broadcastExamPaused,
  broadcastExamStarted,
  broadcastParticipantCount,
  broadcastResultsPublished,
  cacheEventState,
  getConnectedSocketCount,
} from '../services/realtime.service.js';

export const adminLiveEventsRouter = Router();

adminLiveEventsRouter.use(requireAuth, requireEventOperator);

// 1. List All Events (Admin/Operator)
adminLiveEventsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const events = await prisma.liveEvent.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { name: true, email: true } },
        _count: {
          select: {
            registrations: true,
            questionSets: true,
            sessions: true,
            results: true,
          },
        },
      },
    });

    res.json({ success: true, data: events });
  }),
);

// 2. Create Event (Event Admin / Super Admin)
adminLiveEventsRouter.post(
  '/',
  requireEventAdmin,
  asyncHandler(async (req, res) => {
    const parsed = liveEventCreateSchema.parse(req.body);
    const existingSlug = await prisma.liveEvent.findUnique({ where: { slug: parsed.slug } });
    if (existingSlug) {
      throw new AppError(409, 'Slug event sudah digunakan. Gunakan slug yang berbeda.');
    }

    const regStart = new Date(parsed.registrationStartAt);
    const regEnd = new Date(parsed.registrationEndAt);
    const schedStart = new Date(parsed.scheduledStartAt);

    if (regEnd <= regStart) {
      throw new AppError(400, 'Waktu tutup pendaftaran harus setelah waktu buka pendaftaran.');
    }

    const created = await prisma.liveEvent.create({
      data: {
        title: parsed.title,
        slug: parsed.slug,
        description: parsed.description,
        bannerUrl: parsed.bannerUrl || null,
        hostName: parsed.hostName,
        eventStatus: 'DRAFT',
        registrationStartAt: regStart,
        registrationEndAt: regEnd,
        scheduledStartAt: schedStart,
        durationSeconds: parsed.durationMinutes * 60,
        maxParticipants: parsed.maxParticipants,
        visibility: parsed.visibility,
        eventType: parsed.eventType,
        packageCode: parsed.packageCode,
        twkCount: parsed.twkCount,
        tiuCount: parsed.tiuCount,
        tkpCount: parsed.tkpCount,
        difficultyMix: parsed.difficultyMix,
        scoringConfigId: parsed.scoringConfigId || null,
        randomizeOptions: parsed.randomizeOptions,
        leaderboardPublished: parsed.leaderboardPublished,
        reviewPolicy: parsed.reviewPolicy,
        reviewUnlockAt: parsed.reviewUnlockAt ? new Date(parsed.reviewUnlockAt) : null,
        rulesMd: parsed.rulesMd ?? null,
        eligibilityText: parsed.eligibilityText ?? null,
        faqJson: parsed.faqItems ? (parsed.faqItems as object) : undefined,
        createdBy: req.user!.userId,
      },
    });

    await logLiveEventAudit(created.id, req.user!.userId, 'CREATE_EVENT', {
      title: created.title,
      packageCode: created.packageCode,
    });

    res.status(201).json({ success: true, data: created });
  }),
);

// 3. Update Event Configuration
adminLiveEventsRouter.put(
  '/:eventId',
  requireEventAdmin,
  asyncHandler(async (req, res) => {
    const eventId = String(req.params.eventId);
    const existing = await prisma.liveEvent.findUnique({ where: { id: eventId } });
    if (!existing) throw new AppError(404, 'Event tidak ditemukan.');

    if (['LIVE', 'FINALIZING', 'COMPLETED'].includes(existing.eventStatus)) {
      throw new AppError(400, 'Konfigurasi event yang sedang berjalan atau selesai tidak dapat diubah.');
    }

    const parsed = liveEventUpdateSchema.parse(req.body);
    const updated = await prisma.liveEvent.update({
      where: { id: eventId },
      data: {
        ...(parsed.title !== undefined ? { title: parsed.title } : {}),
        ...(parsed.description !== undefined ? { description: parsed.description } : {}),
        ...(parsed.bannerUrl !== undefined ? { bannerUrl: parsed.bannerUrl || null } : {}),
        ...(parsed.hostName !== undefined ? { hostName: parsed.hostName } : {}),
        ...(parsed.registrationStartAt ? { registrationStartAt: new Date(parsed.registrationStartAt) } : {}),
        ...(parsed.registrationEndAt ? { registrationEndAt: new Date(parsed.registrationEndAt) } : {}),
        ...(parsed.scheduledStartAt ? { scheduledStartAt: new Date(parsed.scheduledStartAt) } : {}),
        ...(parsed.durationMinutes !== undefined ? { durationSeconds: parsed.durationMinutes * 60 } : {}),
        ...(parsed.maxParticipants !== undefined ? { maxParticipants: parsed.maxParticipants } : {}),
        ...(parsed.visibility !== undefined ? { visibility: parsed.visibility } : {}),
        ...(parsed.eventType !== undefined ? { eventType: parsed.eventType } : {}),
        ...(parsed.packageCode !== undefined ? { packageCode: parsed.packageCode } : {}),
        ...(parsed.twkCount !== undefined ? { twkCount: parsed.twkCount } : {}),
        ...(parsed.tiuCount !== undefined ? { tiuCount: parsed.tiuCount } : {}),
        ...(parsed.tkpCount !== undefined ? { tkpCount: parsed.tkpCount } : {}),
        ...(parsed.difficultyMix !== undefined ? { difficultyMix: parsed.difficultyMix } : {}),
        ...(parsed.scoringConfigId !== undefined ? { scoringConfigId: parsed.scoringConfigId || null } : {}),
        ...(parsed.randomizeOptions !== undefined ? { randomizeOptions: parsed.randomizeOptions } : {}),
        ...(parsed.reviewPolicy !== undefined ? { reviewPolicy: parsed.reviewPolicy } : {}),
        ...(parsed.reviewUnlockAt !== undefined
          ? { reviewUnlockAt: parsed.reviewUnlockAt ? new Date(parsed.reviewUnlockAt) : null }
          : {}),
        ...(parsed.rulesMd !== undefined ? { rulesMd: parsed.rulesMd } : {}),
        ...(parsed.eligibilityText !== undefined ? { eligibilityText: parsed.eligibilityText } : {}),
        ...(parsed.faqItems !== undefined ? { faqJson: parsed.faqItems as object } : {}),
      },
    });

    await logLiveEventAudit(eventId, req.user!.userId, 'UPDATE_EVENT');
    res.json({ success: true, data: updated });
  }),
);

// 4. Freeze / Regenerate Immutable Question Snapshot
adminLiveEventsRouter.post(
  '/:eventId/freeze-questions',
  requireEventAdmin,
  asyncHandler(async (req, res) => {
    const eventId = String(req.params.eventId);
    const { force } = z.object({ force: z.boolean().default(false) }).parse(req.body ?? {});
    const result = await freezeEventQuestionSet(eventId, force);
    await logLiveEventAudit(eventId, req.user!.userId, 'FREEZE_QUESTIONS', result);
    res.json({ success: true, data: result });
  }),
);

// 5. Event Detail + Monitoring + Audit Logs
adminLiveEventsRouter.get(
  '/:eventId/monitoring',
  asyncHandler(async (req, res) => {
    const eventId = String(req.params.eventId);
    const event = await prisma.liveEvent.findUnique({
      where: { id: eventId },
      include: {
        scoringConfig: true,
        _count: { select: { questionSets: true } },
      },
    });
    if (!event) throw new AppError(404, 'Event tidak ditemukan.');

    const [stats, announcements, auditLogs] = await Promise.all([
      getLiveEventMonitoringStats(eventId),
      prisma.liveEventAnnouncement.findMany({
        where: { eventId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.liveEventAuditLog.findMany({
        where: { eventId },
        orderBy: { createdAt: 'desc' },
        take: 40,
        include: { actor: { select: { name: true, role: true } } },
      }),
    ]);

    const t0 = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Date.now() - t0;

    res.json({
      success: true,
      data: {
        event,
        timing: getServerEventTiming(event),
        stats,
        serverHealth: {
          status: 'healthy',
          uptimeSeconds: Math.round(process.uptime()),
          memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
          connectedSockets: getConnectedSocketCount(),
          dbLatencyMs,
        },
        announcements,
        auditLogs,
      },
    });
  }),
);

// Helper for Validated State Transitions
async function transitionEventStatus(
  eventId: string,
  targetStatus: LiveEventStatus,
  actorId: string,
  actionName: string,
) {
  const existing = await prisma.liveEvent.findUnique({ where: { id: eventId } });
  if (!existing) throw new AppError(404, 'Event tidak ditemukan.');

  await validateStateTransition(existing.eventStatus, targetStatus);

  const updated = await prisma.liveEvent.update({
    where: { id: eventId },
    data: { eventStatus: targetStatus },
  });

  await logLiveEventAudit(eventId, actorId, actionName, {
    from: existing.eventStatus,
    to: targetStatus,
  });

  broadcastEventStatus(eventId, updated.eventStatus, getServerEventTiming(updated));
  return updated;
}

// 6. Publish & Open Registration
adminLiveEventsRouter.post(
  '/:eventId/publish',
  requireEventAdmin,
  asyncHandler(async (req, res) => {
    const eventId = String(req.params.eventId);
    const { openRegistration } = z
      .object({ openRegistration: z.boolean().default(true) })
      .parse(req.body ?? {});

    // Freeze question set automatically if not yet frozen
    await freezeEventQuestionSet(eventId, false);
    const target: LiveEventStatus = openRegistration ? 'REGISTRATION_OPEN' : 'PUBLISHED';
    const updated = await transitionEventStatus(
      eventId,
      target,
      req.user!.userId,
      openRegistration ? 'PUBLISH_AND_OPEN_REG' : 'PUBLISH_EVENT',
    );
    res.json({ success: true, data: updated });
  }),
);

adminLiveEventsRouter.post(
  '/:eventId/open-registration',
  requireEventAdmin,
  asyncHandler(async (req, res) => {
    const updated = await transitionEventStatus(
      String(req.params.eventId),
      'REGISTRATION_OPEN',
      req.user!.userId,
      'OPEN_REGISTRATION',
    );
    res.json({ success: true, data: updated });
  }),
);

adminLiveEventsRouter.post(
  '/:eventId/close-registration',
  requireEventAdmin,
  asyncHandler(async (req, res) => {
    const updated = await transitionEventStatus(
      String(req.params.eventId),
      'REGISTRATION_CLOSED',
      req.user!.userId,
      'CLOSE_REGISTRATION',
    );
    res.json({ success: true, data: updated });
  }),
);

// 7. Operator Controls: Waiting Room -> Countdown -> Start -> Pause/Resume -> Extend -> Cancel
adminLiveEventsRouter.post(
  '/:eventId/open-waiting-room',
  asyncHandler(async (req, res) => {
    const eventId = String(req.params.eventId);
    await freezeEventQuestionSet(eventId, false);
    const updated = await transitionEventStatus(
      eventId,
      'WAITING_ROOM',
      req.user!.userId,
      'OPEN_WAITING_ROOM',
    );
    await dispatchEventNotifications(
      eventId,
      'WAITING_ROOM_OPEN',
      `Ruang Tunggu Dibuka: ${updated.title}`,
      'Ruang tunggu Live Akbar telah dibuka. Silakan masuk dan konfirmasi kesiapan Anda.',
    );
    res.json({ success: true, data: updated });
  }),
);

adminLiveEventsRouter.post(
  '/:eventId/start-countdown',
  asyncHandler(async (req, res) => {
    const eventId = String(req.params.eventId);
    await freezeEventQuestionSet(eventId, false);
    const updated = await transitionEventStatus(
      eventId,
      'COUNTDOWN',
      req.user!.userId,
      'START_COUNTDOWN',
    );
    res.json({ success: true, data: updated });
  }),
);

adminLiveEventsRouter.post(
  '/:eventId/start',
  asyncHandler(async (req, res) => {
    const eventId = String(req.params.eventId);
    const existing = await prisma.liveEvent.findUnique({ where: { id: eventId } });
    if (!existing) throw new AppError(404, 'Event tidak ditemukan.');

    if (existing.eventStatus === 'CANCELLED') {
      throw new AppError(400, 'Event yang telah dibatalkan tidak dapat dimulai.', 'EVENT_CANCELLED');
    }
    await validateStateTransition(existing.eventStatus, 'LIVE');
    await freezeEventQuestionSet(eventId, false);

    const now = new Date();
    const deadlineAt = new Date(now.getTime() + existing.durationSeconds * 1000);

    const updated = await prisma.liveEvent.update({
      where: { id: eventId },
      data: {
        eventStatus: 'LIVE',
        actualStartAt: now,
        deadlineAt,
        isPaused: false,
        pausedAt: null,
        totalPausedSeconds: 0,
      },
    });

    await logLiveEventAudit(eventId, req.user!.userId, 'START_EXAM', {
      actualStartAt: now.toISOString(),
      deadlineAt: deadlineAt.toISOString(),
    });

    await dispatchEventNotifications(
      eventId,
      'EXAM_STARTED',
      `Ujian Dimulai: ${updated.title}`,
      'Ujian Live Akbar resmi dimulai! Segera klik Masuk ke Ujian dari Ruang Tunggu.',
    );

    const timing = getServerEventTiming(updated, now);
    broadcastEventStatus(eventId, 'LIVE', timing);
    broadcastExamStarted(eventId, timing);

    res.json({ success: true, data: { event: updated, timing } });
  }),
);

adminLiveEventsRouter.post(
  '/:eventId/pause',
  asyncHandler(async (req, res) => {
    const eventId = String(req.params.eventId);
    const existing = await prisma.liveEvent.findUnique({ where: { id: eventId } });
    if (!existing) throw new AppError(404, 'Event tidak ditemukan.');
    if (existing.eventStatus !== 'LIVE') throw new AppError(400, 'Hanya ujian LIVE yang dapat dijeda.');
    if (existing.isPaused) return res.json({ success: true, data: existing });

    const now = new Date();
    const updated = await prisma.liveEvent.update({
      where: { id: eventId },
      data: { isPaused: true, pausedAt: now },
    });

    await logLiveEventAudit(eventId, req.user!.userId, 'PAUSE_EXAM', { pausedAt: now.toISOString() });
    const timing = getServerEventTiming(updated, now);
    broadcastExamPaused(eventId, true, timing);
    broadcastEventStatus(eventId, 'LIVE', timing);

    res.json({ success: true, data: updated });
  }),
);

adminLiveEventsRouter.post(
  '/:eventId/resume',
  asyncHandler(async (req, res) => {
    const eventId = String(req.params.eventId);
    const existing = await prisma.liveEvent.findUnique({ where: { id: eventId } });
    if (!existing) throw new AppError(404, 'Event tidak ditemukan.');
    if (existing.eventStatus !== 'LIVE' || !existing.isPaused || !existing.pausedAt) {
      throw new AppError(400, 'Event tidak sedang dalam status jeda.');
    }

    const now = new Date();
    const pausedMs = Math.max(0, now.getTime() - existing.pausedAt.getTime());
    const pausedSec = Math.round(pausedMs / 1000);
    const newDeadline = existing.deadlineAt ? new Date(existing.deadlineAt.getTime() + pausedMs) : null;

    const updated = await prisma.liveEvent.update({
      where: { id: eventId },
      data: {
        isPaused: false,
        pausedAt: null,
        totalPausedSeconds: { increment: pausedSec },
        ...(newDeadline ? { deadlineAt: newDeadline } : {}),
      },
    });

    await logLiveEventAudit(eventId, req.user!.userId, 'RESUME_EXAM', {
      pausedSecondsAdded: pausedSec,
      newDeadlineAt: newDeadline?.toISOString() ?? null,
    });
    const timing = getServerEventTiming(updated, now);
    broadcastExamPaused(eventId, false, timing);
    broadcastDeadlineUpdated(eventId, timing);
    broadcastEventStatus(eventId, 'LIVE', timing);

    res.json({ success: true, data: updated });
  }),
);

adminLiveEventsRouter.post(
  '/:eventId/extend-time',
  asyncHandler(async (req, res) => {
    const eventId = String(req.params.eventId);
    const { extraMinutes } = z
      .object({ extraMinutes: z.number().int().min(1).max(120) })
      .parse(req.body);

    const existing = await prisma.liveEvent.findUnique({ where: { id: eventId } });
    if (!existing) throw new AppError(404, 'Event tidak ditemukan.');
    if (existing.eventStatus !== 'LIVE' || !existing.deadlineAt) {
      throw new AppError(400, 'Perpanjangan waktu hanya tersedia saat ujian LIVE.');
    }

    const extraMs = extraMinutes * 60 * 1000;
    const newDeadline = new Date(existing.deadlineAt.getTime() + extraMs);
    const updated = await prisma.liveEvent.update({
      where: { id: eventId },
      data: {
        deadlineAt: newDeadline,
        durationSeconds: { increment: extraMinutes * 60 },
      },
    });

    await logLiveEventAudit(eventId, req.user!.userId, 'EXTEND_DEADLINE', {
      extraMinutes,
      newDeadlineAt: newDeadline.toISOString(),
    });
    const timing = getServerEventTiming(updated);
    broadcastDeadlineUpdated(eventId, timing);

    res.json({ success: true, data: { event: updated, timing } });
  }),
);

adminLiveEventsRouter.post(
  '/:eventId/cancel',
  requireEventAdmin,
  asyncHandler(async (req, res) => {
    const eventId = String(req.params.eventId);
    const { reason } = z.object({ reason: z.string().optional() }).parse(req.body ?? {});
    const existing = await prisma.liveEvent.findUnique({ where: { id: eventId } });
    if (!existing) throw new AppError(404, 'Event tidak ditemukan.');

    await validateStateTransition(existing.eventStatus, 'CANCELLED');

    const updated = await prisma.liveEvent.update({
      where: { id: eventId },
      data: { eventStatus: 'CANCELLED', isPaused: false },
    });

    await logLiveEventAudit(eventId, req.user!.userId, 'CANCEL_EVENT', { reason });
    broadcastEventStatus(eventId, 'CANCELLED');
    res.json({ success: true, data: updated });
  }),
);

// 8. Finalize & Publish Results / Leaderboard
adminLiveEventsRouter.post(
  '/:eventId/finalize',
  requireEventAdmin,
  asyncHandler(async (req, res) => {
    const eventId = String(req.params.eventId);
    const summary = await finalizeEventAndRankings(eventId, req.user!.userId);
    const updated = await prisma.liveEvent.update({
      where: { id: eventId },
      data: { eventStatus: 'FINALIZING' },
    });
    broadcastEventStatus(eventId, 'FINALIZING');
    res.json({ success: true, data: { event: updated, summary } });
  }),
);

adminLiveEventsRouter.post(
  '/:eventId/publish-results',
  requireEventAdmin,
  asyncHandler(async (req, res) => {
    const eventId = String(req.params.eventId);
    const summary = await finalizeEventAndRankings(eventId, req.user!.userId);

    const updated = await prisma.liveEvent.update({
      where: { id: eventId },
      data: {
        eventStatus: 'COMPLETED',
        leaderboardPublished: true,
      },
    });

    // Clear stale Redis cache so fresh snapshot is loaded
    await cacheEventState(`leaderboard:${eventId}`, null, 1);

    await dispatchEventNotifications(
      eventId,
      'RESULTS_PUBLISHED',
      `Hasil & Peringkat Terbit: ${updated.title}`,
      'Hasil resmi, pemeringkatan nasional, dan pembahasan Live Akbar kini sudah tersedia.',
    );

    await logLiveEventAudit(eventId, req.user!.userId, 'PUBLISH_RESULTS', summary);
    broadcastEventStatus(eventId, 'COMPLETED');
    broadcastResultsPublished(eventId);

    res.json({ success: true, data: { event: updated, summary } });
  }),
);

// 9. Host Announcements
adminLiveEventsRouter.post(
  '/:eventId/announcements',
  asyncHandler(async (req, res) => {
    const eventId = String(req.params.eventId);
    const { title, message, isPinned } = z
      .object({
        title: z.string().min(2).max(120),
        message: z.string().min(3).max(2000),
        isPinned: z.boolean().default(false),
      })
      .parse(req.body);

    const ann = await prisma.liveEventAnnouncement.create({
      data: {
        eventId,
        title,
        message,
        isPinned,
        createdBy: req.user!.userId,
      },
    });

    await logLiveEventAudit(eventId, req.user!.userId, 'SEND_ANNOUNCEMENT', { title });
    broadcastAnnouncement(eventId, ann as unknown as Record<string, unknown>);
    res.status(201).json({ success: true, data: ann });
  }),
);

// 10. Participant Management + CSV Export
adminLiveEventsRouter.get(
  '/:eventId/participants',
  asyncHandler(async (req, res) => {
    const eventId = String(req.params.eventId);
    const q = String(req.query.q ?? '').trim().toLowerCase();
    const statusFilter = String(req.query.status ?? 'ALL');
    const format = String(req.query.format ?? 'json');

    const regs = await prisma.liveEventRegistration.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            liveEventSessions: {
              where: { eventId },
              include: {
                result: { select: { totalScore: true, ranking: true, completionTimeSeconds: true } },
                _count: { select: { answers: true } },
              },
            },
          },
        },
      },
      orderBy: { registeredAt: 'asc' },
    });

    const totalQuestions = await prisma.liveEventQuestionSet.count({ where: { eventId } });

    let rows = regs.map((r) => {
      const sess = r.user.liveEventSessions[0] ?? null;
      return {
        userId: r.user.id,
        name: r.user.name,
        email: r.user.email,
        registrationStatus: r.registrationStatus,
        isReady: r.isReady,
        registeredAt: r.registeredAt,
        sessionStatus: sess?.sessionStatus ?? (r.isReady ? 'READY' : 'WAITING'),
        connectionStatus: sess?.connectionStatus ?? 'OFFLINE',
        answeredCount: sess?._count.answers ?? 0,
        totalQuestions,
        reconnectCount: sess?.reconnectCount ?? 0,
        visibilityViolations: sess?.visibilityViolations ?? 0,
        totalScore: sess?.result?.totalScore ?? null,
        ranking: sess?.result?.ranking ?? null,
      };
    });

    if (q) {
      rows = rows.filter(
        (r) => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== 'ALL') {
      rows = rows.filter(
        (r) => r.registrationStatus === statusFilter || r.sessionStatus === statusFilter,
      );
    }

    if (format === 'csv') {
      const header = 'Nama,Email,Status Pendaftaran,Status Sesi,Koneksi,Terjawab,Skor Total,Peringkat\n';
      const body = rows
        .map(
          (r) =>
            `"${r.name.replace(/"/g, '""')}","${r.email}",${r.registrationStatus},${r.sessionStatus},${r.connectionStatus},${r.answeredCount}/${r.totalQuestions},${r.totalScore ?? ''},${r.ranking ?? ''}`,
        )
        .join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="peserta-live-${eventId}.csv"`);
      return res.send(header + body);
    }

    res.json({ success: true, data: { participants: rows, total: rows.length } });
  }),
);

// 11. Disqualify Participant
adminLiveEventsRouter.post(
  '/:eventId/participants/:userId/disqualify',
  requireEventAdmin,
  asyncHandler(async (req, res) => {
    const eventId = String(req.params.eventId);
    const targetUserId = String(req.params.userId);
    const { reason } = z.object({ reason: z.string().min(3) }).parse(req.body);

    await prisma.$transaction(async (tx) => {
      await tx.liveEventRegistration.updateMany({
        where: { eventId, userId: targetUserId },
        data: { registrationStatus: 'DISQUALIFIED', disqualifiedReason: reason },
      });
      await tx.liveEventSession.updateMany({
        where: { eventId, userId: targetUserId },
        data: { sessionStatus: 'DISQUALIFIED', completionReason: 'DISQUALIFIED' },
      });
    });

    await logLiveEventAudit(eventId, req.user!.userId, 'DISQUALIFY_PARTICIPANT', {
      targetUserId,
      reason,
    });
    void broadcastParticipantCount(eventId);
    res.json({ success: true, data: { disqualified: true } });
  }),
);

// 12. Admin Event Analytics (Conversion, Attendance, Score Distribution, Challenging Topics)
adminLiveEventsRouter.get(
  '/:eventId/analytics',
  requireEventAdmin,
  asyncHandler(async (req, res) => {
    const eventId = String(req.params.eventId);
    const [regsCount, attendedCount, completedCount, results] = await Promise.all([
      prisma.liveEventRegistration.count({
        where: { eventId, registrationStatus: { in: ['REGISTERED', 'CONFIRMED'] } },
      }),
      prisma.liveEventSession.count({
        where: {
          eventId,
          sessionStatus: { in: ['IN_PROGRESS', 'SUBMITTED', 'TIME_EXPIRED'] },
        },
      }),
      prisma.liveEventResult.count({ where: { eventId } }),
      prisma.liveEventResult.findMany({
        where: { eventId },
        select: {
          totalScore: true,
          twkScore: true,
          tiuScore: true,
          tkpScore: true,
          overallPassed: true,
          topicBreakdown: true,
        },
      }),
    ]);

    const n = results.length;
    const avgScore = n > 0 ? Math.round((results.reduce((a, r) => a + r.totalScore, 0) / n) * 10) / 10 : 0;
    const highestScore = n > 0 ? Math.max(...results.map((r) => r.totalScore)) : 0;
    const lowestScore = n > 0 ? Math.min(...results.map((r) => r.totalScore)) : 0;
    const avgTwk = n > 0 ? Math.round((results.reduce((a, r) => a + r.twkScore, 0) / n) * 10) / 10 : 0;
    const avgTiu = n > 0 ? Math.round((results.reduce((a, r) => a + r.tiuScore, 0) / n) * 10) / 10 : 0;
    const avgTkp = n > 0 ? Math.round((results.reduce((a, r) => a + r.tkpScore, 0) / n) * 10) / 10 : 0;
    const passCount = results.filter((r) => r.overallPassed).length;

    const topicTotals = new Map<string, { topicName: string; subject: string; sumPct: number; count: number }>();
    for (const r of results) {
      const tb = Array.isArray(r.topicBreakdown) ? (r.topicBreakdown as Array<Record<string, unknown>>) : [];
      for (const item of tb) {
        const slug = String(item.topicSlug ?? '');
        if (!topicTotals.has(slug)) {
          topicTotals.set(slug, {
            topicName: String(item.topicName ?? slug),
            subject: String(item.subject ?? ''),
            sumPct: 0,
            count: 0,
          });
        }
        const entry = topicTotals.get(slug)!;
        entry.sumPct += Number(item.accuracyPct ?? 0);
        entry.count += 1;
      }
    }

    const challengingTopics = Array.from(topicTotals.values())
      .map((t) => ({
        topicName: t.topicName,
        subject: t.subject,
        averageAccuracyPct: t.count > 0 ? Math.round(t.sumPct / t.count) : 0,
      }))
      .sort((a, b) => a.averageAccuracyPct - b.averageAccuracyPct)
      .slice(0, 6);

    const bins = [
      { range: '<200', count: results.filter((r) => r.totalScore < 200).length },
      { range: '200-299', count: results.filter((r) => r.totalScore >= 200 && r.totalScore < 300).length },
      { range: '300-349', count: results.filter((r) => r.totalScore >= 300 && r.totalScore < 350).length },
      { range: '350-399', count: results.filter((r) => r.totalScore >= 350 && r.totalScore < 400).length },
      { range: '400-449', count: results.filter((r) => r.totalScore >= 400 && r.totalScore < 450).length },
      { range: '450-550', count: results.filter((r) => r.totalScore >= 450).length },
    ];

    res.json({
      success: true,
      data: {
        registeredCount: regsCount,
        attendanceRatePct: regsCount > 0 ? Math.round((attendedCount / regsCount) * 100) : 0,
        completionRatePct: attendedCount > 0 ? Math.round((completedCount / attendedCount) * 100) : 0,
        passRatePct: n > 0 ? Math.round((passCount / n) * 100) : 0,
        averageScore: avgScore,
        highestScore,
        lowestScore,
        subjectAverages: { twk: avgTwk, tiu: avgTiu, tkp: avgTkp },
        scoreDistribution: bins,
        challengingTopics,
      },
    });
  }),
);
