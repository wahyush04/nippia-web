import type { Server as HttpServer } from 'http';
import { Server as SocketIOServer, type Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Redis } from 'ioredis';
import { createAdapter } from '@socket.io/redis-adapter';
import { env } from '../config/env.js';
import type { AuthPayload } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import {
  dispatchEventNotifications,
  finalizeEventAndRankings,
  getLiveEventMonitoringStats,
  getServerEventTiming,
} from './live-event.service.js';

let ioInstance: SocketIOServer | null = null;
let redisPub: Redis | null = null;
let redisSub: Redis | null = null;
let redisStateClient: Redis | null = null;
let schedulerTimer: NodeJS.Timeout | null = null;
let tickRunning = false;

export async function pingRealtimeRedis(): Promise<boolean> {
  if (!redisStateClient) return false;
  try {
    const res = await redisStateClient.ping();
    return res === 'PONG';
  } catch {
    return false;
  }
}

interface AuthedSocket extends Socket {
  data: {
    user?: AuthPayload;
    eventIds?: Set<string>;
    lastPingAt?: number;
  };
}

export function getIO(): SocketIOServer | null {
  return ioInstance;
}

export function getConnectedSocketCount(): number {
  return ioInstance?.engine.clientsCount ?? 0;
}

export async function cacheEventState(key: string, value: unknown, ttlSeconds = 120) {
  if (!redisStateClient) return;
  try {
    await redisStateClient.set(`nippia:live:${key}`, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    // non-fatal cache write
  }
}

export async function getCachedEventState<T>(key: string): Promise<T | null> {
  if (!redisStateClient) return null;
  try {
    const raw = await redisStateClient.get(`nippia:live:${key}`);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function attachRealtime(httpServer: HttpServer): SocketIOServer {
  if (ioInstance) return ioInstance;

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.corsOrigin.split(',').map((s) => s.trim()),
      credentials: true,
    },
    pingInterval: 20000,
    pingTimeout: 15000,
    transports: ['websocket', 'polling'],
  });

  if (env.redisUrl) {
    try {
      redisPub = new Redis(env.redisUrl, { maxRetriesPerRequest: 3 });
      redisSub = redisPub.duplicate();
      redisStateClient = redisPub.duplicate();
      io.adapter(createAdapter(redisPub, redisSub));
      logger.info('Redis adapter enabled for Socket.IO');
    } catch (err) {
      logger.warn('Failed to connect Redis adapter, falling back to memory adapter', { error: err });
    }
  }

  io.use((socket: AuthedSocket, next) => {
    const rawToken =
      (typeof socket.handshake.auth?.token === 'string' && socket.handshake.auth.token) ||
      (typeof socket.handshake.headers.authorization === 'string' &&
      socket.handshake.headers.authorization.startsWith('Bearer ')
        ? socket.handshake.headers.authorization.slice(7)
        : '');

    if (!rawToken) {
      return next(new Error('UNAUTHORIZED'));
    }
    try {
      const decoded = jwt.verify(rawToken, env.jwtAccessSecret) as AuthPayload;
      socket.data.user = decoded;
      socket.data.eventIds = new Set();
      return next();
    } catch {
      return next(new Error('INVALID_TOKEN'));
    }
  });

  io.on('connection', (socket: AuthedSocket) => {
    const user = socket.data.user!;
    socket.join(`user:${user.userId}`);

    socket.on('live_event:join_room', async (payload: { eventId?: string }, ack?: (res: unknown) => void) => {
      try {
        const eventId = typeof payload?.eventId === 'string' ? payload.eventId : '';
        if (!eventId) {
          ack?.({ ok: false, message: 'eventId wajib diisi.' });
          return;
        }

        const isStaff = ['HOST_OPERATOR', 'EVENT_ADMIN', 'ADMIN'].includes(user.role);
        const event = await prisma.liveEvent.findUnique({ where: { id: eventId } });
        if (!event) {
          ack?.({ ok: false, message: 'Event tidak ditemukan.' });
          return;
        }

        let reg = null;
        if (!isStaff) {
          reg = await prisma.liveEventRegistration.findUnique({
            where: { eventId_userId: { eventId, userId: user.userId } },
          });
          const canPublicWatch = ['COMPLETED', 'PUBLISHED', 'REGISTRATION_OPEN'].includes(
            event.eventStatus,
          );
          const hasReg = reg && ['REGISTERED', 'CONFIRMED'].includes(reg.registrationStatus);
          if (!hasReg && !canPublicWatch) {
            ack?.({ ok: false, message: 'Akses ruang event ditolak. Pastikan Anda terdaftar.' });
            return;
          }
        }

        socket.join(`event:${eventId}`);
        socket.data.eventIds?.add(eventId);

        if (isStaff) {
          socket.join(`event_admin:${eventId}`);
        } else if (reg && ['REGISTERED', 'CONFIRMED'].includes(reg.registrationStatus)) {
          const existingSession = await prisma.liveEventSession.findUnique({
            where: { eventId_userId: { eventId, userId: user.userId } },
          });
          if (existingSession) {
            const wasDisconnected = existingSession.connectionStatus === 'DISCONNECTED';
            await prisma.liveEventSession.update({
              where: { id: existingSession.id },
              data: {
                connectionStatus: 'ONLINE',
                lastActivityAt: new Date(),
                reconnectCount: wasDisconnected ? { increment: 1 } : undefined,
              },
            });
            if (wasDisconnected) {
              io.to(`event_admin:${eventId}`).emit('admin:participant_reconnected', {
                eventId,
                userId: user.userId,
                timestamp: new Date().toISOString(),
              });
            }
          } else {
            await prisma.liveEventSession.create({
              data: {
                eventId,
                userId: user.userId,
                sessionStatus: reg.isReady ? 'READY' : 'WAITING',
                connectionStatus: 'ONLINE',
                lastActivityAt: new Date(),
              },
            });
          }

          io.to(`event_admin:${eventId}`).emit('admin:participant_joined', {
            eventId,
            userId: user.userId,
            timestamp: new Date().toISOString(),
          });
          void broadcastParticipantCount(eventId);
        }

        const timing = getServerEventTiming(event);
        ack?.({ ok: true, timing, eventStatus: event.eventStatus });
      } catch (err) {
        console.warn('[Socket join_room error]', err);
        ack?.({ ok: false, message: 'Gagal bergabung ke ruang event.' });
      }
    });

    socket.on('live_event:ping_activity', async (payload: { eventId?: string }) => {
      const nowMs = Date.now();
      // Rate limit heartbeat to max 1 per 4 seconds per socket
      if (socket.data.lastPingAt && nowMs - socket.data.lastPingAt < 4000) return;
      socket.data.lastPingAt = nowMs;

      const eventId = typeof payload?.eventId === 'string' ? payload.eventId : '';
      if (!eventId || !socket.data.eventIds?.has(eventId)) return;

      await prisma.liveEventSession
        .updateMany({
          where: { eventId, userId: user.userId },
          data: { lastActivityAt: new Date(), connectionStatus: 'ONLINE' },
        })
        .catch(() => {});
    });

    socket.on('disconnect', async () => {
      const eventIds = Array.from(socket.data.eventIds ?? []);
      for (const eventId of eventIds) {
        try {
          const updated = await prisma.liveEventSession.updateMany({
            where: {
              eventId,
              userId: user.userId,
              sessionStatus: { in: ['WAITING', 'READY', 'IN_PROGRESS'] },
            },
            data: { connectionStatus: 'DISCONNECTED', lastActivityAt: new Date() },
          });
          if (updated.count > 0) {
            io.to(`event_admin:${eventId}`).emit('admin:participant_disconnected', {
              eventId,
              userId: user.userId,
              timestamp: new Date().toISOString(),
            });
            void broadcastParticipantCount(eventId);
          }
        } catch {
          // ignore cleanup failure
        }
      }
    });
  });

  ioInstance = io;
  startLiveEventScheduler();
  return io;
}

export async function broadcastParticipantCount(eventId: string) {
  if (!ioInstance) return;
  try {
    const stats = await getLiveEventMonitoringStats(eventId);
    ioInstance.to(`event:${eventId}`).emit('live_event:participant_count', {
      eventId,
      totalRegistered: stats.totalRegistered,
      inWaitingRoom: stats.inWaitingRoom,
      totalReady: stats.totalReady,
      activeInExam: stats.activeInExam,
      completedCount: stats.completedCount,
    });
    ioInstance.to(`event_admin:${eventId}`).emit('admin:exam_progress_updated', {
      eventId,
      ...stats,
      timestamp: new Date().toISOString(),
    });
  } catch {
    // non-fatal
  }
}

export function broadcastEventStatus(
  eventId: string,
  eventStatus: string,
  extra: Record<string, unknown> = {},
) {
  if (!ioInstance) return;
  ioInstance.to(`event:${eventId}`).emit('live_event:status', {
    eventId,
    eventStatus,
    serverNow: new Date().toISOString(),
    ...extra,
  });
}

export function broadcastAnnouncement(eventId: string, announcement: Record<string, unknown>) {
  if (!ioInstance) return;
  ioInstance.to(`event:${eventId}`).emit('live_event:announcement', {
    eventId,
    announcement,
  });
}

export function broadcastExamStarted(eventId: string, timing: Record<string, unknown>) {
  if (!ioInstance) return;
  ioInstance.to(`event:${eventId}`).emit('live_event:exam_started', {
    eventId,
    ...timing,
  });
}

export function broadcastExamPaused(eventId: string, isPaused: boolean, timing: Record<string, unknown>) {
  if (!ioInstance) return;
  ioInstance
    .to(`event:${eventId}`)
    .emit(isPaused ? 'live_event:exam_paused' : 'live_event:exam_resumed', {
      eventId,
      isPaused,
      ...timing,
    });
}

export function broadcastDeadlineUpdated(eventId: string, timing: Record<string, unknown>) {
  if (!ioInstance) return;
  ioInstance.to(`event:${eventId}`).emit('live_event:exam_deadline_updated', {
    eventId,
    ...timing,
  });
}

export function broadcastResultsPublished(eventId: string) {
  if (!ioInstance) return;
  ioInstance.to(`event:${eventId}`).emit('live_event:results_published', {
    eventId,
    serverNow: new Date().toISOString(),
  });
  ioInstance.to(`event:${eventId}`).emit('live_event:leaderboard_updated', {
    eventId,
    serverNow: new Date().toISOString(),
  });
}

export function startLiveEventScheduler() {
  if (schedulerTimer || env.nodeEnv === 'test') return;

  schedulerTimer = setInterval(async () => {
    if (tickRunning) return;
    tickRunning = true;
    try {
      const now = new Date();

      // 1. Auto-expire LIVE events past deadlineAt
      const expiredLive = await prisma.liveEvent.findMany({
        where: {
          eventStatus: 'LIVE',
          isPaused: false,
          deadlineAt: { lte: now },
        },
        take: 10,
      });

      for (const ev of expiredLive) {
        logger.info('LiveAkbar deadline expired, finalizing event', { eventId: ev.id });
        await finalizeEventAndRankings(ev.id, ev.createdBy);
        const completed = await prisma.liveEvent.update({
          where: { id: ev.id },
          data: {
            eventStatus: 'COMPLETED',
            leaderboardPublished: true,
          },
        });
        await dispatchEventNotifications(
          ev.id,
          'EXAM_ENDED',
          `Ujian Selesai: ${ev.title}`,
          'Waktu ujian Live Akbar telah berakhir dan seluruh jawaban Anda telah dikumpulkan serta dinilai oleh sistem.',
        );
        await dispatchEventNotifications(
          ev.id,
          'RESULTS_PUBLISHED',
          `Hasil & Peringkat Terbit: ${ev.title}`,
          'Nilai SKD dan papan peringkat Live Akbar kini telah dipublikasikan.',
        );
        broadcastEventStatus(ev.id, completed.eventStatus, {
          deadlineAt: completed.deadlineAt?.toISOString() ?? null,
        });
        ioInstance?.to(`event:${ev.id}`).emit('live_event:exam_submitted', {
          eventId: ev.id,
          reason: 'TIME_EXPIRED',
          serverNow: now.toISOString(),
        });
        broadcastResultsPublished(ev.id);
      }

      // 2. Sync countdown ticks & health metrics for active LIVE / COUNTDOWN / WAITING_ROOM events
      const activeEvents = await prisma.liveEvent.findMany({
        where: {
          eventStatus: { in: ['WAITING_ROOM', 'COUNTDOWN', 'LIVE'] },
        },
        select: {
          id: true,
          title: true,
          eventStatus: true,
          isPaused: true,
          pausedAt: true,
          scheduledStartAt: true,
          actualStartAt: true,
          deadlineAt: true,
          durationSeconds: true,
        },
      });

      for (const ev of activeEvents) {
        if (!ioInstance) continue;
        const timing = getServerEventTiming(ev, now);
        ioInstance.to(`event:${ev.id}`).emit('live_event:countdown', {
          eventId: ev.id,
          eventStatus: ev.eventStatus,
          ...timing,
        });
        ioInstance.to(`event_admin:${ev.id}`).emit('admin:event_health_updated', {
          eventId: ev.id,
          connectedSockets: getConnectedSocketCount(),
          uptimeSeconds: Math.round(process.uptime()),
          memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
          serverNow: now.toISOString(),
        });
      }

      // 3. Automated pre-event reminder notifications (24h, 1h, 15m)
      const upcomingEvents = await prisma.liveEvent.findMany({
        where: {
          eventStatus: { in: ['PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'WAITING_ROOM', 'COUNTDOWN'] },
          scheduledStartAt: { gt: now },
        },
        select: { id: true, title: true, scheduledStartAt: true },
      });

      for (const ev of upcomingEvents) {
        const diffMin = Math.floor((ev.scheduledStartAt.getTime() - now.getTime()) / 60000);
        if (diffMin <= 1440 && diffMin > 60) {
          await dispatchEventNotifications(
            ev.id,
            'REMINDER_24H',
            `Pengingat H-1: ${ev.title}`,
            'Live Akbar akan dimulai kurang dari 24 jam lagi. Pastikan koneksi internet dan perangkat Anda siap.',
          );
        } else if (diffMin <= 60 && diffMin > 15) {
          await dispatchEventNotifications(
            ev.id,
            'REMINDER_1H',
            `Pengingat 1 Jam Lagi: ${ev.title}`,
            'Ujian Live Akbar akan segera dimulai dalam kurang dari 1 jam. Bersiap masuk ke Ruang Tunggu.',
          );
        } else if (diffMin <= 15 && diffMin >= 0) {
          await dispatchEventNotifications(
            ev.id,
            'REMINDER_15M',
            `15 Menit Menuju Mulai: ${ev.title}`,
            'Ujian Live Akbar segera dimulai! Segera masuk ke Ruang Tunggu dan lakukan konfirmasi kesiapan.',
          );
        }
      }
    } catch (err) {
      console.warn('[LiveAkbar Scheduler Error]', err);
    } finally {
      tickRunning = false;
    }
  }, 5000);
}

export async function shutdownRealtime() {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }
  await Promise.allSettled([
    redisPub?.quit(),
    redisSub?.quit(),
    redisStateClient?.quit(),
  ]);
}
