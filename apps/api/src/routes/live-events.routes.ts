import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { prisma } from '../lib/prisma.js';
import {
  getLiveEventMonitoringStats,
  getServerEventTiming,
  joinLiveExamSession,
  originalKeyToDisplay,
  saveLiveAnswer,
  submitLiveSession,
  type QuestionSnapshotPayload,
} from '../services/live-event.service.js';
import {
  broadcastParticipantCount,
  getCachedEventState,
  cacheEventState,
  getIO,
} from '../services/realtime.service.js';
import { requireProOrThrow } from '../services/subscription.service.js';

export const liveEventsRouter = Router();

const answerRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 240,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Terlalu banyak pengiriman jawaban dalam 1 menit.' },
  },
});

async function resolveEventByIdOrSlug(idOrSlug: string) {
  const event = await prisma.liveEvent.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    include: {
      scoringConfig: { include: { passingGrades: { where: { isActive: true } } } },
    },
  });
  if (!event) throw new AppError(404, 'Event Live Akbar tidak ditemukan.');
  return event;
}

// 1. Discovery List
liveEventsRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const filter = String(req.query.filter ?? 'all').toLowerCase();
    const q = String(req.query.q ?? '').trim();

    const where: Record<string, unknown> = {
      visibility: 'PUBLIC',
      eventStatus: { not: 'DRAFT' },
    };

    if (filter === 'upcoming') {
      where.eventStatus = { in: ['PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'WAITING_ROOM', 'COUNTDOWN'] };
    } else if (filter === 'live') {
      where.eventStatus = 'LIVE';
    } else if (filter === 'completed') {
      where.eventStatus = { in: ['FINALIZING', 'COMPLETED'] };
    } else if (filter === 'free') {
      where.eventType = 'FREE';
    } else if (filter === 'premium') {
      where.eventType = 'PREMIUM';
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { hostName: { contains: q, mode: 'insensitive' } },
      ];
    }

    const events = await prisma.liveEvent.findMany({
      where,
      orderBy: [{ scheduledStartAt: 'asc' }],
      include: {
        registrations: {
          where: { userId },
          select: { registrationStatus: true, isReady: true, registeredAt: true },
        },
        sessions: {
          where: { userId },
          select: { sessionStatus: true, submittedAt: true },
        },
        _count: {
          select: {
            registrations: {
              where: { registrationStatus: { in: ['REGISTERED', 'CONFIRMED'] } },
            },
          },
        },
      },
    });

    const now = new Date();
    const items = events.map((ev) => ({
      id: ev.id,
      title: ev.title,
      slug: ev.slug,
      description: ev.description,
      bannerUrl: ev.bannerUrl,
      hostName: ev.hostName,
      eventStatus: ev.eventStatus,
      isPaused: ev.isPaused,
      eventType: ev.eventType,
      visibility: ev.visibility,
      registrationStartAt: ev.registrationStartAt,
      registrationEndAt: ev.registrationEndAt,
      scheduledStartAt: ev.scheduledStartAt,
      deadlineAt: ev.deadlineAt,
      durationMinutes: Math.round(ev.durationSeconds / 60),
      totalQuestions: ev.twkCount + ev.tiuCount + ev.tkpCount,
      twkCount: ev.twkCount,
      tiuCount: ev.tiuCount,
      tkpCount: ev.tkpCount,
      registeredCount: ev._count.registrations,
      maxParticipants: ev.maxParticipants,
      leaderboardPublished: ev.leaderboardPublished,
      myRegistration: ev.registrations[0] ?? null,
      mySession: ev.sessions[0] ?? null,
      timing: getServerEventTiming(ev, now),
    }));

    res.json({
      success: true,
      data: {
        events: items,
        serverNow: now.toISOString(),
      },
    });
  }),
);

// 2. My Registered Live Events
liveEventsRouter.get(
  '/my-events',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const regs = await prisma.liveEventRegistration.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            _count: {
              select: {
                registrations: {
                  where: { registrationStatus: { in: ['REGISTERED', 'CONFIRMED'] } },
                },
              },
            },
            sessions: {
              where: { userId },
              include: { result: true },
            },
          },
        },
      },
      orderBy: { registeredAt: 'desc' },
    });

    const now = new Date();
    const items = regs.map((r) => {
      const ev = r.event;
      const session = ev.sessions[0] ?? null;
      return {
        registrationId: r.id,
        registrationStatus: r.registrationStatus,
        isReady: r.isReady,
        registeredAt: r.registeredAt,
        cancelledAt: r.cancelledAt,
        event: {
          id: ev.id,
          title: ev.title,
          slug: ev.slug,
          description: ev.description,
          hostName: ev.hostName,
          eventStatus: ev.eventStatus,
          isPaused: ev.isPaused,
          eventType: ev.eventType,
          scheduledStartAt: ev.scheduledStartAt,
          deadlineAt: ev.deadlineAt,
          durationMinutes: Math.round(ev.durationSeconds / 60),
          totalQuestions: ev.twkCount + ev.tiuCount + ev.tkpCount,
          registeredCount: ev._count.registrations,
          maxParticipants: ev.maxParticipants,
          leaderboardPublished: ev.leaderboardPublished,
          timing: getServerEventTiming(ev, now),
        },
        session: session
          ? {
              id: session.id,
              sessionStatus: session.sessionStatus,
              submittedAt: session.submittedAt,
              result: session.result,
            }
          : null,
      };
    });

    res.json({ success: true, data: { items, serverNow: now.toISOString() } });
  }),
);

// 3. In-app Live Akbar Notifications
liveEventsRouter.get(
  '/notifications',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const [items, unreadCount] = await Promise.all([
      prisma.liveEventNotification.findMany({
        where: { userId },
        orderBy: { deliveredAt: 'desc' },
        take: 30,
        include: { event: { select: { id: true, title: true, slug: true, eventStatus: true } } },
      }),
      prisma.liveEventNotification.count({
        where: { userId, readAt: null },
      }),
    ]);

    res.json({ success: true, data: { items, unreadCount } });
  }),
);

liveEventsRouter.patch(
  '/notifications/:notificationId/read',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    await prisma.liveEventNotification.updateMany({
      where: { id: String(req.params.notificationId), userId },
      data: { readAt: new Date(), deliveryStatus: 'READ' },
    });
    res.json({ success: true, data: { read: true } });
  }),
);

// 4. Event Detail
liveEventsRouter.get(
  '/:eventId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const event = await resolveEventByIdOrSlug(String(req.params.eventId));

    const [reg, session, registeredCount, stats] = await Promise.all([
      prisma.liveEventRegistration.findUnique({
        where: { eventId_userId: { eventId: event.id, userId } },
      }),
      prisma.liveEventSession.findUnique({
        where: { eventId_userId: { eventId: event.id, userId } },
        include: { result: true },
      }),
      prisma.liveEventRegistration.count({
        where: {
          eventId: event.id,
          registrationStatus: { in: ['REGISTERED', 'CONFIRMED'] },
        },
      }),
      getLiveEventMonitoringStats(event.id),
    ]);

    const now = new Date();
    const canRegister =
      event.eventStatus === 'REGISTRATION_OPEN' &&
      now >= event.registrationStartAt &&
      now <= event.registrationEndAt &&
      registeredCount < event.maxParticipants &&
      (!reg || reg.registrationStatus === 'CANCELLED');

    res.json({
      success: true,
      data: {
        id: event.id,
        title: event.title,
        slug: event.slug,
        description: event.description,
        bannerUrl: event.bannerUrl,
        hostName: event.hostName,
        eventStatus: event.eventStatus,
        isPaused: event.isPaused,
        eventType: event.eventType,
        visibility: event.visibility,
        registrationStartAt: event.registrationStartAt,
        registrationEndAt: event.registrationEndAt,
        scheduledStartAt: event.scheduledStartAt,
        actualStartAt: event.actualStartAt,
        deadlineAt: event.deadlineAt,
        durationSeconds: event.durationSeconds,
        durationMinutes: Math.round(event.durationSeconds / 60),
        maxParticipants: event.maxParticipants,
        registeredCount,
        twkCount: event.twkCount,
        tiuCount: event.tiuCount,
        tkpCount: event.tkpCount,
        totalQuestions: event.twkCount + event.tiuCount + event.tkpCount,
        randomizeOptions: event.randomizeOptions,
        leaderboardPublished: event.leaderboardPublished,
        reviewPolicy: event.reviewPolicy,
        reviewUnlockAt: event.reviewUnlockAt,
        rulesMd: event.rulesMd,
        eligibilityText: event.eligibilityText,
        faqItems: Array.isArray(event.faqJson) ? event.faqJson : [],
        scoringConfig: event.scoringConfig,
        stats,
        canRegister,
        myRegistration: reg,
        mySession: session
          ? {
              id: session.id,
              sessionStatus: session.sessionStatus,
              submittedAt: session.submittedAt,
              hasResult: Boolean(session.result),
            }
          : null,
        timing: getServerEventTiming(event, now),
      },
    });
  }),
);

// 5. Register for Event
liveEventsRouter.post(
  '/:eventId/register',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const event = await resolveEventByIdOrSlug(String(req.params.eventId));
    const now = new Date();

    if (event.eventStatus === 'CANCELLED') {
      throw new AppError(400, 'Event telah dibatalkan.', 'EVENT_CANCELLED');
    }
    if (event.eventStatus !== 'REGISTRATION_OPEN') {
      throw new AppError(400, 'Pendaftaran untuk event ini belum dibuka atau sudah ditutup.', 'REGISTRATION_CLOSED');
    }
    if (now < event.registrationStartAt || now > event.registrationEndAt) {
      throw new AppError(400, 'Saat ini di luar jadwal pendaftaran yang ditentukan.', 'OUTSIDE_REGISTRATION_WINDOW');
    }
    if (event.eventType === 'PREMIUM') {
      await requireProOrThrow(
        userId,
        `Event Live Akbar Premium (${event.title})`,
        'LIVE_AKBAR_PREMIUM',
      );
    }

    const registration = await prisma.$transaction(async (tx) => {
      const existing = await tx.liveEventRegistration.findUnique({
        where: { eventId_userId: { eventId: event.id, userId } },
      });
      if (existing && ['REGISTERED', 'CONFIRMED'].includes(existing.registrationStatus)) {
        throw new AppError(409, 'Anda sudah terdaftar pada event Live Akbar ini.', 'DUPLICATE_REGISTRATION');
      }
      if (existing && existing.registrationStatus === 'DISQUALIFIED') {
        throw new AppError(403, 'Akun Anda tidak dapat mendaftar ulang pada event ini.', 'DISQUALIFIED');
      }

      const activeCount = await tx.liveEventRegistration.count({
        where: {
          eventId: event.id,
          registrationStatus: { in: ['REGISTERED', 'CONFIRMED'] },
        },
      });
      if (activeCount >= event.maxParticipants) {
        throw new AppError(409, 'Kuota peserta untuk event ini telah penuh.', 'EVENT_FULL');
      }

      const reg = existing
        ? await tx.liveEventRegistration.update({
            where: { id: existing.id },
            data: {
              registrationStatus: 'CONFIRMED',
              registeredAt: now,
              cancelledAt: null,
              isReady: false,
              readyAt: null,
            },
          })
        : await tx.liveEventRegistration.create({
            data: {
              eventId: event.id,
              userId,
              registrationStatus: 'CONFIRMED',
              registeredAt: now,
            },
          });

      await tx.liveEventNotification.upsert({
        where: {
          eventId_userId_notificationType: {
            eventId: event.id,
            userId,
            notificationType: 'REGISTRATION_CONFIRMED',
          },
        },
        update: {
          title: `Pendaftaran Berhasil: ${event.title}`,
          message: `Anda terdaftar di ${event.title}. Jadwal mulai: ${event.scheduledStartAt.toLocaleString('id-ID')}.`,
          deliveredAt: now,
        },
        create: {
          eventId: event.id,
          userId,
          notificationType: 'REGISTRATION_CONFIRMED',
          title: `Pendaftaran Berhasil: ${event.title}`,
          message: `Anda terdaftar di ${event.title}. Jadwal mulai: ${event.scheduledStartAt.toLocaleString('id-ID')}.`,
        },
      });

      return reg;
    },
    { maxWait: 10_000, timeout: 15_000 });

    void broadcastParticipantCount(event.id);
    res.status(201).json({ success: true, data: registration });
  }),
);

// 6. Cancel Registration
liveEventsRouter.delete(
  '/:eventId/register',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const event = await resolveEventByIdOrSlug(String(req.params.eventId));

    if (['COUNTDOWN', 'LIVE', 'FINALIZING', 'COMPLETED'].includes(event.eventStatus)) {
      throw new AppError(400, 'Pendaftaran tidak dapat dibatalkan saat ujian akan dimulai atau sudah berlangsung.');
    }

    const existing = await prisma.liveEventRegistration.findUnique({
      where: { eventId_userId: { eventId: event.id, userId } },
    });
    if (!existing || existing.registrationStatus === 'CANCELLED') {
      throw new AppError(404, 'Pendaftaran aktif tidak ditemukan.');
    }

    const updated = await prisma.liveEventRegistration.update({
      where: { id: existing.id },
      data: { registrationStatus: 'CANCELLED', cancelledAt: new Date(), isReady: false },
    });

    void broadcastParticipantCount(event.id);
    res.json({ success: true, data: updated });
  }),
);

// 7. Waiting Room
liveEventsRouter.get(
  '/:eventId/waiting-room',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const event = await resolveEventByIdOrSlug(String(req.params.eventId));

    const reg = await prisma.liveEventRegistration.findUnique({
      where: { eventId_userId: { eventId: event.id, userId } },
    });
    const isStaff = ['HOST_OPERATOR', 'EVENT_ADMIN', 'ADMIN'].includes(req.user!.role);

    if (!isStaff && (!reg || !['REGISTERED', 'CONFIRMED'].includes(reg.registrationStatus))) {
      throw new AppError(403, 'Hanya peserta terdaftar yang dapat memasuki Ruang Tunggu.', 'NOT_REGISTERED');
    }

    const [stats, announcements, session] = await Promise.all([
      getLiveEventMonitoringStats(event.id),
      prisma.liveEventAnnouncement.findMany({
        where: { eventId: event.id },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        take: 15,
      }),
      prisma.liveEventSession.findUnique({
        where: { eventId_userId: { eventId: event.id, userId } },
      }),
    ]);

    const now = new Date();
    const timing = getServerEventTiming(event, now);
    const canJoin =
      event.eventStatus === 'LIVE' &&
      !timing.isTimeExpired &&
      reg?.registrationStatus !== 'DISQUALIFIED' &&
      session?.sessionStatus !== 'DISQUALIFIED';

    let waitingRoomState = 'WAITING_FOR_EVENT';
    if (event.eventStatus === 'CANCELLED') waitingRoomState = 'EVENT_CANCELLED';
    else if (!reg && !isStaff) waitingRoomState = 'WAITING_FOR_REGISTRATION';
    else if (event.eventStatus === 'LIVE') waitingRoomState = 'EXAMINATION_LIVE';
    else if (event.eventStatus === 'COUNTDOWN') waitingRoomState = 'EXAMINATION_STARTING';
    else if (reg?.isReady) waitingRoomState = 'READY';

    res.json({
      success: true,
      data: {
        event: {
          id: event.id,
          title: event.title,
          slug: event.slug,
          hostName: event.hostName,
          eventStatus: event.eventStatus,
          isPaused: event.isPaused,
          scheduledStartAt: event.scheduledStartAt,
          deadlineAt: event.deadlineAt,
          durationMinutes: Math.round(event.durationSeconds / 60),
          twkCount: event.twkCount,
          tiuCount: event.tiuCount,
          tkpCount: event.tkpCount,
          totalQuestions: event.twkCount + event.tiuCount + event.tkpCount,
          rulesMd: event.rulesMd,
          scoringConfig: event.scoringConfig,
        },
        waitingRoomState,
        isReady: reg?.isReady ?? false,
        canJoin,
        sessionStatus: session?.sessionStatus ?? 'WAITING',
        counters: {
          totalRegistered: stats.totalRegistered,
          inWaitingRoom: stats.inWaitingRoom,
          totalReady: stats.totalReady,
          activeInExam: stats.activeInExam,
        },
        announcements,
        timing,
      },
    });
  }),
);

// 8. Ready Confirmation
liveEventsRouter.post(
  '/:eventId/ready',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const event = await resolveEventByIdOrSlug(String(req.params.eventId));

    const reg = await prisma.liveEventRegistration.findUnique({
      where: { eventId_userId: { eventId: event.id, userId } },
    });
    if (!reg || !['REGISTERED', 'CONFIRMED'].includes(reg.registrationStatus)) {
      throw new AppError(403, 'Anda belum terdaftar pada event ini.', 'NOT_REGISTERED');
    }

    const now = new Date();
    const updatedReg = await prisma.liveEventRegistration.update({
      where: { id: reg.id },
      data: { isReady: true, readyAt: now },
    });

    await prisma.liveEventSession.upsert({
      where: { eventId_userId: { eventId: event.id, userId } },
      update: {
        sessionStatus: 'READY',
        connectionStatus: 'ONLINE',
        lastActivityAt: now,
      },
      create: {
        eventId: event.id,
        userId,
        sessionStatus: 'READY',
        connectionStatus: 'ONLINE',
        lastActivityAt: now,
      },
    });

    void broadcastParticipantCount(event.id);
    res.json({ success: true, data: { isReady: updatedReg.isReady, readyAt: updatedReg.readyAt } });
  }),
);

// 9. Join Examination
liveEventsRouter.post(
  '/:eventId/join',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const event = await resolveEventByIdOrSlug(String(req.params.eventId));
    const session = await joinLiveExamSession(event.id, userId);

    void broadcastParticipantCount(event.id);
    res.json({
      success: true,
      data: {
        sessionId: session.id,
        sessionStatus: session.sessionStatus,
        timing: getServerEventTiming(event),
      },
    });
  }),
);

// 10. Session Status & Sync
liveEventsRouter.get(
  '/:eventId/session',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const event = await resolveEventByIdOrSlug(String(req.params.eventId));
    const session = await prisma.liveEventSession.findUnique({
      where: { eventId_userId: { eventId: event.id, userId } },
      include: { result: true },
    });

    res.json({
      success: true,
      data: {
        eventStatus: event.eventStatus,
        session,
        timing: getServerEventTiming(event),
      },
    });
  }),
);

// 11. Fetch Live Exam Questions & Saved Answers (NEVER exposes keys/explanations)
liveEventsRouter.get(
  '/:eventId/exam',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const event = await resolveEventByIdOrSlug(String(req.params.eventId));

    if (event.eventStatus === 'CANCELLED') {
      throw new AppError(400, 'Event telah dibatalkan.', 'EVENT_CANCELLED');
    }
    if (!['LIVE', 'FINALIZING', 'COMPLETED'].includes(event.eventStatus)) {
      throw new AppError(
        403,
        'Soal ujian belum dapat diakses sebelum waktu mulai resmi.',
        'EARLY_ACCESS_FORBIDDEN',
      );
    }

    const session = await joinLiveExamSession(event.id, userId);
    const now = new Date();
    const timing = getServerEventTiming(event, now);

    // If deadline passed while participant was still IN_PROGRESS, auto-submit immediately
    if (
      event.eventStatus === 'LIVE' &&
      !event.isPaused &&
      timing.isTimeExpired &&
      session.sessionStatus === 'IN_PROGRESS'
    ) {
      await submitLiveSession(event.id, userId, 'TIME_EXPIRED');
    }

    const refreshedSession = await prisma.liveEventSession.findUnique({
      where: { id: session.id },
      include: { answers: true },
    });
    if (!refreshedSession) throw new AppError(404, 'Sesi ujian tidak ditemukan.');

    const questionSets = await prisma.liveEventQuestionSet.findMany({
      where: { eventId: event.id },
      orderBy: { questionOrder: 'asc' },
    });

    const optionOrderMap = (refreshedSession.optionOrderMap as Record<string, string[]> | null) ?? null;
    const ansMap = new Map(refreshedSession.answers.map((a) => [a.questionId, a]));

    const BASE_KEYS: Array<'A' | 'B' | 'C' | 'D' | 'E'> = ['A', 'B', 'C', 'D', 'E'];

    const sanitizedQuestions = questionSets.map((qs) => {
      const snap = qs.questionSnapshot as unknown as QuestionSnapshotPayload;
      const order = optionOrderMap?.[qs.questionId] ?? BASE_KEYS;
      const optByKey = new Map(snap.options.map((o) => [o.optionKey, o]));

      const mappedOptions = BASE_KEYS.map((displayKey, idx) => {
        const origKey = order[idx] ?? displayKey;
        const opt = optByKey.get(origKey as 'A' | 'B' | 'C' | 'D' | 'E') ?? snap.options[idx]!;
        return {
          optionKey: displayKey,
          text: opt.text,
          visualSpec: opt.visualSpec ?? null,
        };
      });

      const saved = ansMap.get(qs.questionId);
      const displayedSelected = saved
        ? originalKeyToDisplay(optionOrderMap, qs.questionId, saved.selectedOption)
        : null;

      return {
        questionId: qs.questionId,
        questionOrder: qs.questionOrder,
        subjectCode: snap.subjectCode,
        topicName: snap.topicName,
        questionType: snap.questionType,
        stem: snap.stem,
        visualSpec: snap.visualSpec ?? null,
        options: mappedOptions,
        savedAnswer: saved
          ? {
              selectedOption: displayedSelected,
              isFlagged: saved.isFlagged,
              answerRevision: saved.answerRevision,
              answeredAt: saved.answeredAt.toISOString(),
            }
          : null,
      };
    });

    res.json({
      success: true,
      data: {
        event: {
          id: event.id,
          title: event.title,
          slug: event.slug,
          eventStatus: event.eventStatus,
          isPaused: event.isPaused,
          durationSeconds: event.durationSeconds,
          hostName: event.hostName,
        },
        session: {
          id: refreshedSession.id,
          sessionStatus: refreshedSession.sessionStatus,
          startedAt: refreshedSession.startedAt,
          submittedAt: refreshedSession.submittedAt,
        },
        timing,
        questions: sanitizedQuestions,
      },
    });
  }),
);

// 12. Answer Persistence (PUT + PATCH supported)
const saveAnswerHandler = asyncHandler(async (req, res) => {
  const userId = req.user!.userId;
  const body = z
    .object({
      selectedOption: z.enum(['A', 'B', 'C', 'D', 'E']).nullable().optional(),
      isFlagged: z.boolean().optional(),
      answerRevision: z.number().int().min(1).optional(),
    })
    .parse(req.body ?? {});

  const result = await saveLiveAnswer({
    eventId: String(req.params.eventId),
    userId,
    questionId: String(req.params.questionId),
    displayOption: body.selectedOption ?? null,
    isFlagged: body.isFlagged,
    clientRevision: body.answerRevision,
  });

  res.json({ success: true, data: result });
});

liveEventsRouter.put('/:eventId/answers/:questionId', requireAuth, answerRateLimiter, saveAnswerHandler);
liveEventsRouter.patch('/:eventId/answers/:questionId', requireAuth, answerRateLimiter, saveAnswerHandler);

// 13. Non-punitive Activity / Visibility Ping
liveEventsRouter.post(
  '/:eventId/visibility-ping',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const { visible } = z.object({ visible: z.boolean() }).parse(req.body ?? {});
    const session = await prisma.liveEventSession.findUnique({
      where: { eventId_userId: { eventId: String(req.params.eventId), userId } },
    });
    if (session && session.sessionStatus === 'IN_PROGRESS') {
      await prisma.liveEventSession.update({
        where: { id: session.id },
        data: {
          lastActivityAt: new Date(),
          ...(!visible ? { visibilityViolations: { increment: 1 } } : {}),
        },
      });
    }
    res.json({ success: true, data: { recorded: true } });
  }),
);

// 14. Submit Examination
liveEventsRouter.post(
  '/:eventId/submit',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const { submissionToken } = z
      .object({ submissionToken: z.string().optional() })
      .parse(req.body ?? {});

    const event = await resolveEventByIdOrSlug(String(req.params.eventId));
    const submitted = await submitLiveSession(event.id, userId, 'MANUAL', submissionToken);

    getIO()?.to(`user:${userId}`).emit('live_event:exam_submitted', {
      eventId: event.id,
      reason: 'MANUAL',
      resultId: submitted.resultId,
      serverNow: new Date().toISOString(),
    });
    void broadcastParticipantCount(event.id);

    res.json({ success: true, data: submitted });
  }),
);

// 15. Individual Result & Analytics
liveEventsRouter.get(
  '/:eventId/result',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const event = await resolveEventByIdOrSlug(String(req.params.eventId));

    const result = await prisma.liveEventResult.findUnique({
      where: { eventId_userId: { eventId: event.id, userId } },
      include: {
        session: { select: { completionReason: true, startedAt: true, submittedAt: true } },
      },
    });
    if (!result) {
      throw new AppError(404, 'Hasil ujian Anda untuk event ini belum tersedia.');
    }

    const allScores = await prisma.liveEventResult.findMany({
      where: { eventId: event.id },
      select: { totalScore: true, twkScore: true, tiuScore: true, tkpScore: true },
    });

    const totalFinished = allScores.length;
    const avgTotal =
      totalFinished > 0
        ? Math.round((allScores.reduce((a, r) => a + r.totalScore, 0) / totalFinished) * 10) / 10
        : result.totalScore;
    const avgTwk =
      totalFinished > 0
        ? Math.round((allScores.reduce((a, r) => a + r.twkScore, 0) / totalFinished) * 10) / 10
        : result.twkScore;
    const avgTiu =
      totalFinished > 0
        ? Math.round((allScores.reduce((a, r) => a + r.tiuScore, 0) / totalFinished) * 10) / 10
        : result.tiuScore;
    const avgTkp =
      totalFinished > 0
        ? Math.round((allScores.reduce((a, r) => a + r.tkpScore, 0) / totalFinished) * 10) / 10
        : result.tkpScore;

    // Score distribution histogram (bins of 50 points up to 550)
    const bins = [
      { range: '<200', min: 0, max: 199, count: 0 },
      { range: '200-299', min: 200, max: 299, count: 0 },
      { range: '300-349', min: 300, max: 349, count: 0 },
      { range: '350-399', min: 350, max: 399, count: 0 },
      { range: '400-449', min: 400, max: 449, count: 0 },
      { range: '450-550', min: 450, max: 550, count: 0 },
    ];
    for (const s of allScores) {
      const bin = bins.find((b) => s.totalScore >= b.min && s.totalScore <= b.max);
      if (bin) bin.count++;
    }

    const topicBreakdown = (Array.isArray(result.topicBreakdown) ? result.topicBreakdown : []) as Array<{
      topicSlug: string;
      topicName: string;
      subject: string;
      total: number;
      answered: number;
      correct: number;
      earnedScore: number;
      maxScore: number;
      accuracyPct: number;
    }>;

    const sortedTopics = [...topicBreakdown].sort((a, b) => a.accuracyPct - b.accuracyPct);
    const weakestTopics = sortedTopics.slice(0, 3);
    const strongestTopics = [...sortedTopics].reverse().slice(0, 3);

    const subjRates = [
      { subject: 'TWK', score: result.twkScore, max: event.twkCount * 5, pct: event.twkCount > 0 ? Math.round((result.twkScore / (event.twkCount * 5)) * 100) : 0 },
      { subject: 'TIU', score: result.tiuScore, max: event.tiuCount * 5, pct: event.tiuCount > 0 ? Math.round((result.tiuScore / (event.tiuCount * 5)) * 100) : 0 },
      { subject: 'TKP', score: result.tkpScore, max: event.tkpCount * 5, pct: event.tkpCount > 0 ? Math.round((result.tkpScore / (event.tkpCount * 5)) * 100) : 0 },
    ].sort((a, b) => a.pct - b.pct);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    const canReview =
      event.leaderboardPublished || event.eventStatus === 'COMPLETED'
        ? event.reviewPolicy === 'IMMEDIATE' ||
          (event.reviewPolicy === 'DELAYED' && (!event.reviewUnlockAt || new Date() >= event.reviewUnlockAt))
        : false;

    const recommendations = weakestTopics.map((t) => ({
      topicSlug: t.topicSlug,
      topicName: t.topicName,
      subject: t.subject,
      accuracyPct: t.accuracyPct,
      actionLabel: `Latih 10 Soal ${t.subject} — ${t.topicName}`,
      route: `/practice/topic/${t.topicSlug}`,
    }));

    res.json({
      success: true,
      data: {
        event: {
          id: event.id,
          title: event.title,
          slug: event.slug,
          hostName: event.hostName,
          eventStatus: event.eventStatus,
          leaderboardPublished: event.leaderboardPublished,
          reviewPolicy: event.reviewPolicy,
          scheduledStartAt: event.scheduledStartAt,
          twkCount: event.twkCount,
          tiuCount: event.tiuCount,
          tkpCount: event.tkpCount,
        },
        participantName: user?.name ?? 'Peserta',
        result: {
          ...result,
          topicBreakdown,
          difficultyBreakdown: Array.isArray(result.difficultyBreakdown) ? result.difficultyBreakdown : [],
        },
        eventStats: {
          totalParticipants: totalFinished,
          averageTotal: avgTotal,
          averageTwk: avgTwk,
          averageTiu: avgTiu,
          averageTkp: avgTkp,
          scoreDistribution: bins,
        },
        analytics: {
          weakestSubject: subjRates[0],
          strongestSubject: subjRates[subjRates.length - 1],
          weakestTopics,
          strongestTopics,
          recommendations,
        },
        canReview,
      },
    });
  }),
);

// 16. Add Incorrect Live Event Questions to Error Notebook
liveEventsRouter.post(
  '/:eventId/error-notebook',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const event = await resolveEventByIdOrSlug(String(req.params.eventId));

    if (event.eventStatus !== 'COMPLETED' && !event.leaderboardPublished) {
      throw new AppError(403, 'Pembahasan dan buku kesalahan tersedia setelah hasil resmi diterbitkan.');
    }

    const session = await prisma.liveEventSession.findUnique({
      where: { eventId_userId: { eventId: event.id, userId } },
      include: { answers: true },
    });
    if (!session) throw new AppError(404, 'Sesi ujian tidak ditemukan.');

    const qSets = await prisma.liveEventQuestionSet.findMany({
      where: { eventId: event.id },
      select: { questionId: true, subject: true },
    });
    const ansMap = new Map(session.answers.map((a) => [a.questionId, a]));

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    let added = 0;
    for (const q of qSets) {
      const a = ansMap.get(q.questionId);
      const isIncorrect =
        !a ||
        !a.selectedOption ||
        (q.subject === 'TKP' ? (a.scoreAwarded ?? 0) < 4 : !a.isCorrect);
      if (isIncorrect) {
        await prisma.errorNotebook.upsert({
          where: { userId_questionId: { userId, questionId: q.questionId } },
          update: {
            isMastered: false,
            lastAttemptAt: now,
            nextReviewAt: tomorrow,
            wrongCount: { increment: 1 },
            lastSelectedKey: a?.selectedOption ?? null,
          },
          create: {
            userId,
            questionId: q.questionId,
            lastSelectedKey: a?.selectedOption ?? null,
            nextReviewAt: tomorrow,
            personalNote: `Dari Live Akbar: ${event.title}`,
          },
        });
        added++;
      }
    }

    res.json({ success: true, data: { addedCount: added } });
  }),
);

// 17. Leaderboard (Paginated + Cached Snapshot + Privacy Protected)
liveEventsRouter.get(
  '/:eventId/leaderboard',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const event = await resolveEventByIdOrSlug(String(req.params.eventId));

    const isStaff = ['HOST_OPERATOR', 'EVENT_ADMIN', 'ADMIN'].includes(req.user!.role);
    if (!event.leaderboardPublished && !isStaff) {
      throw new AppError(
        403,
        'Papan peringkat event ini belum dipublikasikan oleh penyelenggara.',
        'LEADERBOARD_NOT_PUBLISHED',
      );
    }

    const tab = String(req.query.tab ?? 'top50');
    const q = String(req.query.q ?? '').trim().toLowerCase();
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(5, Number(req.query.limit ?? 25)));

    const cached = await getCachedEventState<{
      entries: Array<Record<string, unknown>>;
      totalParticipants: number;
      averageScore: number;
      highestScore: number;
      lowestScore: number;
      generatedAt: string;
    }>(`leaderboard:${event.id}`);

    let snapshotData = cached;
    if (!snapshotData) {
      const dbSnap = await prisma.eventLeaderboardSnapshot.findUnique({
        where: { eventId: event.id },
      });
      if (dbSnap) {
        snapshotData = {
          entries: (dbSnap.rankingData as Array<Record<string, unknown>>) ?? [],
          totalParticipants: dbSnap.totalParticipants,
          averageScore: dbSnap.averageScore,
          highestScore: dbSnap.highestScore,
          lowestScore: dbSnap.lowestScore,
          generatedAt: dbSnap.generatedAt.toISOString(),
        };
        await cacheEventState(`leaderboard:${event.id}`, snapshotData, 60);
      }
    }

    if (!snapshotData) {
      return res.json({
        success: true,
        data: {
          event: { id: event.id, title: event.title, leaderboardPublished: event.leaderboardPublished },
          stats: { totalParticipants: 0, averageScore: 0, highestScore: 0, lowestScore: 0 },
          myEntry: null,
          entries: [],
          pagination: { page: 1, limit, total: 0, totalPages: 1 },
        },
      });
    }

    const allEntries = snapshotData.entries.map((entry) => ({
      rank: entry.rank as number,
      displayName: entry.displayName as string,
      avatarUrl: (entry.avatarUrl as string | null) ?? null,
      levelName: (entry.levelName as string) ?? 'Peserta',
      twkScore: entry.twkScore as number,
      tiuScore: entry.tiuScore as number,
      tkpScore: entry.tkpScore as number,
      totalScore: entry.totalScore as number,
      completionTimeSeconds: entry.completionTimeSeconds as number,
      overallPassed: (entry.overallPassed as boolean | null) ?? null,
      isCurrentUser: entry.userId === userId,
    }));

    const myEntry = allEntries.find((e) => e.isCurrentUser) ?? null;

    let filtered = allEntries;
    if (tab === 'top10') filtered = allEntries.slice(0, 10);
    else if (tab === 'top50') filtered = allEntries.slice(0, 50);
    else if (tab === 'top100') filtered = allEntries.slice(0, 100);
    else if (tab === 'mine') filtered = myEntry ? [myEntry] : [];

    if (q) {
      filtered = filtered.filter((e) => e.displayName.toLowerCase().includes(q));
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const paged = filtered.slice((safePage - 1) * limit, safePage * limit);

    res.json({
      success: true,
      data: {
        event: {
          id: event.id,
          title: event.title,
          slug: event.slug,
          leaderboardPublished: event.leaderboardPublished,
        },
        stats: {
          totalParticipants: snapshotData.totalParticipants,
          averageScore: snapshotData.averageScore,
          highestScore: snapshotData.highestScore,
          lowestScore: snapshotData.lowestScore,
          generatedAt: snapshotData.generatedAt,
        },
        myEntry,
        entries: paged,
        pagination: { page: safePage, limit, total, totalPages },
      },
    });
  }),
);

// 18. Question Review & Explanation (Gated by Publication & Review Policy)
liveEventsRouter.get(
  '/:eventId/review',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const event = await resolveEventByIdOrSlug(String(req.params.eventId));

    if (!event.leaderboardPublished && event.eventStatus !== 'COMPLETED') {
      throw new AppError(
        403,
        'Pembahasan soal hanya dapat diakses setelah event selesai dan hasil resmi dipublikasikan.',
        'REVIEW_NOT_PUBLISHED',
      );
    }
    if (event.reviewPolicy === 'DISABLED') {
      throw new AppError(403, 'Pembahasan soal dinonaktifkan oleh penyelenggara untuk event ini.', 'REVIEW_DISABLED');
    }
    if (
      event.reviewPolicy === 'DELAYED' &&
      event.reviewUnlockAt &&
      new Date() < event.reviewUnlockAt
    ) {
      throw new AppError(
        403,
        `Pembahasan baru akan dibuka pada ${event.reviewUnlockAt.toLocaleString('id-ID')}.`,
        'REVIEW_DELAYED',
      );
    }

    const session = await prisma.liveEventSession.findUnique({
      where: { eventId_userId: { eventId: event.id, userId } },
      include: { answers: true },
    });
    if (!session) {
      throw new AppError(403, 'Anda tidak tercatat sebagai peserta pada sesi ujian ini.');
    }

    const qSets = await prisma.liveEventQuestionSet.findMany({
      where: { eventId: event.id },
      orderBy: { questionOrder: 'asc' },
    });
    const ansMap = new Map(session.answers.map((a) => [a.questionId, a]));

    const items = qSets.map((qs) => {
      const snap = qs.questionSnapshot as unknown as QuestionSnapshotPayload;
      const ans = ansMap.get(qs.questionId);
      const bestOpt =
        snap.subjectCode === 'TKP'
          ? [...snap.options].sort((a, b) => b.scoreValue - a.scoreValue)[0]
          : snap.options.find((o) => o.isCorrect);

      return {
        questionId: qs.questionId,
        questionOrder: qs.questionOrder,
        subjectCode: snap.subjectCode,
        topicName: snap.topicName,
        difficulty: snap.difficulty,
        stem: snap.stem,
        visualSpec: snap.visualSpec,
        options: snap.options.map((o) => ({
          optionKey: o.optionKey,
          text: o.text,
          scoreValue: o.scoreValue,
          isCorrect: o.isCorrect,
          optionFeedback: o.optionFeedback,
          visualSpec: o.visualSpec,
        })),
        selectedOption: ans?.selectedOption ?? null,
        scoreEarned: ans?.scoreAwarded ?? 0,
        isCorrect: ans?.isCorrect ?? false,
        bestOptionKey: bestOpt?.optionKey ?? null,
        explanation: snap.explanation,
        conceptSummary: snap.conceptSummary,
        stepByStep: snap.stepByStep,
        whyOthersWrong: snap.whyOthersWrong,
        quickTrick: snap.quickTrick,
        commonMistakes: snap.commonMistakes,
        studyTip: snap.studyTip,
        references: snap.references,
      };
    });

    res.json({
      success: true,
      data: {
        event: {
          id: event.id,
          title: event.title,
          slug: event.slug,
          reviewPolicy: event.reviewPolicy,
        },
        questions: items,
      },
    });
  }),
);
