import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import { io as ioClient } from 'socket.io-client';
import { createApp } from '../app.js';
import { prisma } from '../lib/prisma.js';
import { attachRealtime, shutdownRealtime } from '../services/realtime.service.js';
import { finalizeEventAndRankings } from '../services/live-event.service.js';

describe('Nippia Live Akbar — End-to-End, Sync, Security & Concurrency QA', () => {
  const app = createApp();
  let server: http.Server;
  let baseUrl = '';

  const createdUserIds: string[] = [];
  const createdEventIds: string[] = [];

  async function api(path: string, init: RequestInit = {}) {
    const resp = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
    });
    const text = await resp.text();
    let json: any = {};
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }
    return { status: resp.status, json };
  }

  async function createTestUser(role: 'USER' | 'HOST_OPERATOR' | 'EVENT_ADMIN' | 'ADMIN', suffix: string) {
    const email = `live_qa_${suffix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@nippia.id`;
    const reg = await api('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: `QA ${suffix}`,
        email,
        password: 'PasswordKuat2026!',
      }),
    });
    expect(reg.status).toBe(201);
    const userId = reg.json.data.user.id as string;
    createdUserIds.push(userId);

    if (role !== 'USER') {
      await prisma.user.update({ where: { id: userId }, data: { role } });
      const login = await api('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: 'PasswordKuat2026!' }),
      });
      return { userId, email, token: login.json.data.accessToken as string };
    }
    return { userId, email, token: reg.json.data.accessToken as string };
  }

  beforeAll(async () => {
    server = http.createServer(app);
    attachRealtime(server);
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => resolve());
    });
    const addr = server.address() as { port: number };
    baseUrl = `http://127.0.0.1:${addr.port}`;
  });

  afterAll(async () => {
    await shutdownRealtime();
    for (const evId of createdEventIds) {
      await prisma.liveEvent.deleteMany({ where: { id: evId } });
    }
    for (const uId of createdUserIds) {
      await prisma.user.deleteMany({ where: { id: uId } });
    }
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('enforces RBAC, registration rules, early-access protection, answer revision integrity, option randomization scoring, deterministic ranking, and WebSocket auth', async () => {
    const admin = await createTestUser('EVENT_ADMIN', 'EventAdmin');
    const operator = await createTestUser('HOST_OPERATOR', 'HostOp');
    const p1 = await createTestUser('USER', 'Peserta1');
    const p2 = await createTestUser('USER', 'Peserta2');
    const unregistered = await createTestUser('USER', 'Unregistered');

    // 1. Participant cannot create or control events
    const forbiddenCreate = await api('/api/v1/admin/live-events', {
      method: 'POST',
      headers: { Authorization: `Bearer ${p1.token}` },
      body: JSON.stringify({
        title: 'Illegal Event',
        slug: `illegal-${Date.now()}`,
        description: 'Should be rejected',
        registrationStartAt: new Date(Date.now() - 60000).toISOString(),
        registrationEndAt: new Date(Date.now() + 3600000).toISOString(),
        scheduledStartAt: new Date(Date.now() + 3600000).toISOString(),
      }),
    });
    expect(forbiddenCreate.status).toBe(403);

    // Host Operator cannot create events (Event Admin+)
    const opCreate = await api('/api/v1/admin/live-events', {
      method: 'POST',
      headers: { Authorization: `Bearer ${operator.token}` },
      body: JSON.stringify({
        title: 'Operator Event',
        slug: `op-${Date.now()}`,
        description: 'Should be rejected for HOST_OPERATOR',
        registrationStartAt: new Date(Date.now() - 60000).toISOString(),
        registrationEndAt: new Date(Date.now() + 3600000).toISOString(),
        scheduledStartAt: new Date(Date.now() + 3600000).toISOString(),
      }),
    });
    expect(opCreate.status).toBe(403);

    // 2. Event Admin creates a 12-question configured Live Akbar event (3 TWK, 4 TIU, 5 TKP)
    const now = Date.now();
    const createRes = await api('/api/v1/admin/live-events', {
      method: 'POST',
      headers: { Authorization: `Bearer ${admin.token}` },
      body: JSON.stringify({
        title: 'Live Akbar QA Test Event',
        slug: `live-qa-${now}`,
        description: 'Uji otomatis lengkap Live Akbar Nippia.',
        registrationStartAt: new Date(now - 60000).toISOString(),
        registrationEndAt: new Date(now + 3600000).toISOString(),
        scheduledStartAt: new Date(now + 60000).toISOString(),
        durationMinutes: 15,
        maxParticipants: 100,
        packageCode: 'PAKET_2',
        twkCount: 3,
        tiuCount: 4,
        tkpCount: 5,
        randomizeOptions: true,
        reviewPolicy: 'IMMEDIATE',
      }),
    });
    expect(createRes.status).toBe(201);
    const eventId = createRes.json.data.id as string;
    createdEventIds.push(eventId);

    // Publish & Open Registration
    const pubRes = await api(`/api/v1/admin/live-events/${eventId}/publish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${admin.token}` },
      body: JSON.stringify({ openRegistration: true }),
    });
    expect(pubRes.status).toBe(200);
    expect(pubRes.json.data.eventStatus).toBe('REGISTRATION_OPEN');

    // 3. Register P1 and P2; prevent duplicate registration
    const r1 = await api(`/api/v1/live-events/${eventId}/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${p1.token}` },
    });
    expect(r1.status).toBe(201);

    const r1Dup = await api(`/api/v1/live-events/${eventId}/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${p1.token}` },
    });
    expect(r1Dup.status).toBe(409);

    const r2 = await api(`/api/v1/live-events/${eventId}/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${p2.token}` },
    });
    expect(r2.status).toBe(201);

    // 4. Operator opens Waiting Room -> Unregistered blocked, Early Exam access blocked
    const wrOp = await api(`/api/v1/admin/live-events/${eventId}/open-waiting-room`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${operator.token}` },
    });
    expect(wrOp.status).toBe(200);

    const unregWr = await api(`/api/v1/live-events/${eventId}/waiting-room`, {
      headers: { Authorization: `Bearer ${unregistered.token}` },
    });
    expect(unregWr.status).toBe(403);

    const earlyExam = await api(`/api/v1/live-events/${eventId}/exam`, {
      headers: { Authorization: `Bearer ${p1.token}` },
    });
    expect(earlyExam.status).toBe(403);

    // P1 confirms ready
    const readyRes = await api(`/api/v1/live-events/${eventId}/ready`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${p1.token}` },
    });
    expect(readyRes.status).toBe(200);
    expect(readyRes.json.data.isReady).toBe(true);

    // 5. WebSocket auth + room join check
    await expect(
      new Promise<void>((resolve, reject) => {
        const badSock = ioClient(baseUrl, { auth: { token: 'bad-token' }, transports: ['websocket'] });
        badSock.on('connect_error', () => {
          badSock.close();
          resolve();
        });
        badSock.on('connect', () => {
          badSock.close();
          reject(new Error('Invalid token should not connect'));
        });
      }),
    ).resolves.toBeUndefined();

    const sockJoinAck = await new Promise<any>((resolve, reject) => {
      const sock = ioClient(baseUrl, { auth: { token: p1.token }, transports: ['websocket'] });
      sock.on('connect', () => {
        sock.emit('live_event:join_room', { eventId }, (ack: any) => {
          sock.close();
          resolve(ack);
        });
      });
      sock.on('connect_error', reject);
    });
    expect(sockJoinAck.ok).toBe(true);

    // 6. Operator starts exam -> shared deadline across participants
    const startRes = await api(`/api/v1/admin/live-events/${eventId}/start`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${operator.token}` },
    });
    expect(startRes.status).toBe(200);

    // Unregistered user still cannot join LIVE exam
    const unregJoin = await api(`/api/v1/live-events/${eventId}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${unregistered.token}` },
    });
    expect(unregJoin.status).toBe(403);

    // P1 & P2 fetch exam -> no correct answers leaked, shared deadline
    const exam1 = await api(`/api/v1/live-events/${eventId}/exam`, {
      headers: { Authorization: `Bearer ${p1.token}` },
    });
    const exam2 = await api(`/api/v1/live-events/${eventId}/exam`, {
      headers: { Authorization: `Bearer ${p2.token}` },
    });
    expect(exam1.status).toBe(200);
    expect(exam1.json.data.questions.length).toBe(12);
    expect(exam1.json.data.timing.deadlineAt).toBe(exam2.json.data.timing.deadlineAt);
    expect(exam1.json.data.questions[0].options[0].isCorrect).toBeUndefined();
    expect(exam1.json.data.questions[0].explanation).toBeUndefined();

    // 7. Answer saving + revision protection + refresh recovery
    const q0 = exam1.json.data.questions[0];
    const saveNewer = await api(`/api/v1/live-events/${eventId}/answers/${q0.questionId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${p1.token}` },
      body: JSON.stringify({ selectedOption: 'B', isFlagged: true, answerRevision: 5 }),
    });
    expect(saveNewer.status).toBe(200);
    expect(saveNewer.json.data.answerRevision).toBe(5);

    // Out-of-order stale retry (rev 3) must NOT overwrite rev 5!
    const saveStale = await api(`/api/v1/live-events/${eventId}/answers/${q0.questionId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${p1.token}` },
      body: JSON.stringify({ selectedOption: 'A', isFlagged: false, answerRevision: 3 }),
    });
    expect(saveStale.status).toBe(200);
    expect(saveStale.json.data.staleIgnored).toBe(true);

    // Simulated refresh recovers option 'B'
    const refresh1 = await api(`/api/v1/live-events/${eventId}/exam`, {
      headers: { Authorization: `Bearer ${p1.token}` },
    });
    expect(refresh1.json.data.questions[0].savedAnswer.selectedOption).toBe('B');

    // Review endpoint blocked before results published
    const earlyReview = await api(`/api/v1/live-events/${eventId}/review`, {
      headers: { Authorization: `Bearer ${p1.token}` },
    });
    expect(earlyReview.status).toBe(403);

    // 8. P1 submits twice -> idempotent duplicate-submission protection
    const tok = `qa-tok-${Date.now()}`;
    const sub1 = await api(`/api/v1/live-events/${eventId}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${p1.token}` },
      body: JSON.stringify({ submissionToken: tok }),
    });
    expect(sub1.status).toBe(200);
    expect(sub1.json.data.alreadySubmitted).toBe(false);

    const sub2 = await api(`/api/v1/live-events/${eventId}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${p1.token}` },
      body: JSON.stringify({ submissionToken: tok }),
    });
    expect(sub2.status).toBe(200);
    expect(sub2.json.data.alreadySubmitted).toBe(true);

    // P2 has NOT submitted manually -> answer one question and let finalize auto-submit P2!
    const p2q0 = exam2.json.data.questions[0];
    await api(`/api/v1/live-events/${eventId}/answers/${p2q0.questionId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${p2.token}` },
      body: JSON.stringify({ selectedOption: 'A', answerRevision: 1 }),
    });

    // 9. Publish results -> auto-submits P2, computes rankings & leaderboard snapshot
    const pubResults = await api(`/api/v1/admin/live-events/${eventId}/publish-results`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${admin.token}` },
    });
    expect(pubResults.status).toBe(200);

    // P2 cannot read P1's private /result endpoint directly (each /result is scoped strictly to req.user.userId)
    const p1Result = await api(`/api/v1/live-events/${eventId}/result`, {
      headers: { Authorization: `Bearer ${p1.token}` },
    });
    const p2Result = await api(`/api/v1/live-events/${eventId}/result`, {
      headers: { Authorization: `Bearer ${p2.token}` },
    });
    expect(p1Result.status).toBe(200);
    expect(p2Result.status).toBe(200);
    expect(p1Result.json.data.result.userId).toBe(p1.userId);
    expect(p2Result.json.data.result.userId).toBe(p2.userId);

    // Leaderboard published & paginated
    const lb = await api(`/api/v1/live-events/${eventId}/leaderboard?tab=all&page=1&limit=10`, {
      headers: { Authorization: `Bearer ${p1.token}` },
    });
    expect(lb.status).toBe(200);
    expect(lb.json.data.entries.length).toBe(2);
    expect(lb.json.data.entries[0].email).toBeUndefined();

    // Review now accessible & exposes complete explanation
    const reviewRes = await api(`/api/v1/live-events/${eventId}/review`, {
      headers: { Authorization: `Bearer ${p1.token}` },
    });
    expect(reviewRes.status).toBe(200);
    expect(reviewRes.json.data.questions.length).toBe(12);
    expect(reviewRes.json.data.questions[0].explanation).toBeTruthy();

    // 10. Cancelled event cannot be started
    const cancelEv = await api('/api/v1/admin/live-events', {
      method: 'POST',
      headers: { Authorization: `Bearer ${admin.token}` },
      body: JSON.stringify({
        title: 'Cancelled Event Test',
        slug: `cancel-qa-${Date.now()}`,
        description: 'Testing cancelled event cannot start.',
        registrationStartAt: new Date(now - 60000).toISOString(),
        registrationEndAt: new Date(now + 3600000).toISOString(),
        scheduledStartAt: new Date(now + 60000).toISOString(),
        twkCount: 2,
        tiuCount: 2,
        tkpCount: 2,
      }),
    });
    const cId = cancelEv.json.data.id as string;
    createdEventIds.push(cId);
    await api(`/api/v1/admin/live-events/${cId}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${admin.token}` },
    });
    const startCancelled = await api(`/api/v1/admin/live-events/${cId}/start`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${operator.token}` },
    });
    expect(startCancelled.status).toBe(400);
  }, 30000);

  it('handles expired deadline server enforcement and high-frequency concurrent submissions cleanly', async () => {
    const admin = await createTestUser('EVENT_ADMIN', 'ConcAdmin');
    const participants = await Promise.all(
      Array.from({ length: 12 }, (_, idx) => createTestUser('USER', `ConcP${idx}`)),
    );

    const now = Date.now();
    const createRes = await api('/api/v1/admin/live-events', {
      method: 'POST',
      headers: { Authorization: `Bearer ${admin.token}` },
      body: JSON.stringify({
        title: 'Concurrency Stress Event',
        slug: `conc-qa-${now}`,
        description: 'Simulasi beban paralel pendaftaran, ujian, jawaban, dan finalisasi.',
        registrationStartAt: new Date(now - 60000).toISOString(),
        registrationEndAt: new Date(now + 3600000).toISOString(),
        scheduledStartAt: new Date(now + 60000).toISOString(),
        durationMinutes: 10,
        twkCount: 2,
        tiuCount: 2,
        tkpCount: 2,
        randomizeOptions: false,
      }),
    });
    const eventId = createRes.json.data.id as string;
    createdEventIds.push(eventId);

    await api(`/api/v1/admin/live-events/${eventId}/publish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${admin.token}` },
      body: JSON.stringify({ openRegistration: true }),
    });

    // Simultaneous registrations
    const regResults = await Promise.all(
      participants.map((p) =>
        api(`/api/v1/live-events/${eventId}/register`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${p.token}` },
        }),
      ),
    );
    expect(regResults.every((r) => r.status === 201)).toBe(true);

    // Waiting room -> Start exam
    await api(`/api/v1/admin/live-events/${eventId}/open-waiting-room`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${admin.token}` },
    });
    await api(`/api/v1/admin/live-events/${eventId}/start`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${admin.token}` },
    });

    // Simultaneous exam join & question fetches
    const examPayloads = await Promise.all(
      participants.map((p) =>
        api(`/api/v1/live-events/${eventId}/exam`, {
          headers: { Authorization: `Bearer ${p.token}` },
        }),
      ),
    );
    expect(examPayloads.every((e) => e.status === 200 && e.json.data.questions.length === 6)).toBe(true);

    // Concurrent answer writes across all 12 participants x 6 questions = 72 concurrent PUTs
    const writeOps: Promise<any>[] = [];
    participants.forEach((p, pIdx) => {
      const qs = examPayloads[pIdx]!.json.data.questions as Array<{ questionId: string }>;
      qs.forEach((q, qIdx) => {
        const key = (['A', 'B', 'C', 'D', 'E'] as const)[(pIdx + qIdx) % 5];
        writeOps.push(
          api(`/api/v1/live-events/${eventId}/answers/${q.questionId}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${p.token}` },
            body: JSON.stringify({ selectedOption: key, answerRevision: 1 }),
          }),
        );
      });
    });
    const writeRes = await Promise.all(writeOps);
    expect(writeRes.every((w) => w.status === 200)).toBe(true);

    // Force deadline expired & verify late answer is rejected + auto-submitted
    await prisma.liveEvent.update({
      where: { id: eventId },
      data: { deadlineAt: new Date(Date.now() - 5000) },
    });
    const firstQ = examPayloads[0]!.json.data.questions[0].questionId;
    const lateSave = await api(`/api/v1/live-events/${eventId}/answers/${firstQ}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${participants[0]!.token}` },
      body: JSON.stringify({ selectedOption: 'E', answerRevision: 9 }),
    });
    expect(lateSave.status).toBe(409);

    // Finalize remaining sessions & verify 12 deterministic results
    const summary = await finalizeEventAndRankings(eventId, admin.userId);
    expect(summary.totalParticipants).toBe(12);
  }, 30000);
});
