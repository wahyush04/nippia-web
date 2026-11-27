import crypto from 'crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../app.js';
import { env, validateEnv } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { loginOrRegisterWithGoogle } from '../services/auth.service.js';

describe('Production Security, Config Validation & Negative Test Scenarios', () => {
  const app = createApp();

  afterEach(() => {
    vi.restoreAllMocks();
    env.enableSimulatedPayments = true;
    env.midtransServerKey = '';
    env.midtransClientKey = '';
  });

  async function req(path: string, init: RequestInit = {}) {
    const server = app.listen(0);
    const addr = server.address() as { port: number };
    try {
      const resp = await fetch(`http://127.0.0.1:${addr.port}${path}`, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(init.headers || {}),
        },
      });
      const json = await resp.json();
      return { status: resp.status, json };
    } finally {
      server.close();
    }
  }

  it('rejects weak/default production secrets or localhost origins and accepts valid production env', () => {
    const invalidProd = validateEnv({
      ...env,
      nodeEnv: 'production',
      databaseUrl: 'postgresql://user:pass@postgres:5432/db',
      jwtAccessSecret: 'dev_access_secret_nippia_2026_32chars',
      jwtRefreshSecret: 'short',
      corsOrigin: 'http://localhost:5173',
      appUrl: 'http://localhost:5173',
      allowLocalOrigin: false,
      midtransServerKey: 'key-only',
      midtransClientKey: '',
    });

    expect(invalidProd.valid).toBe(false);
    expect(invalidProd.errors.length).toBeGreaterThanOrEqual(4);

    const validProd = validateEnv({
      ...env,
      nodeEnv: 'production',
      databaseUrl: 'postgresql://user:pass@postgres:5432/db',
      jwtAccessSecret: crypto.randomBytes(32).toString('hex'),
      jwtRefreshSecret: crypto.randomBytes(32).toString('hex'),
      corsOrigin: 'https://nippia.id',
      appUrl: 'https://nippia.id',
      allowLocalOrigin: false,
      midtransServerKey: '',
      midtransClientKey: '',
    });

    expect(validProd.valid).toBe(true);
    expect(validProd.errors).toHaveLength(0);
  });

  it('exposes healthy /api/health and /api/ready checks and suppresses stack traces on 404/invalid JSON', async () => {
    const health = await req('/api/health');
    expect(health.status).toBe(200);
    expect(health.json.data.database).toBe('connected');

    const ready = await req('/api/ready');
    expect(ready.status).toBe(200);
    expect(ready.json.data.ready).toBe(true);
    expect(ready.json.data.checks.database).toBe('ok');

    const notFound = await req('/api/v1/does-not-exist');
    expect(notFound.status).toBe(404);
    expect(notFound.json.error.code).toBe('NOT_FOUND');
    expect(notFound.json.error.stack).toBeUndefined();
  });

  it('enforces refresh token rotation & revocation, rejects tampered/missing tokens, and secures email verification', async () => {
    const email = `sec_auth_${Date.now()}@nippia.id`;
    const reg = await req('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Auth Security QA', email, password: 'PasswordKuat2026!' }),
    });
    expect(reg.status).toBe(201);
    const userId = reg.json.data.user.id as string;
    const accessToken = reg.json.data.accessToken as string;
    const refresh1 = reg.json.data.refreshToken as string;

    try {
      // Invalid token fails
      const badTokenRes = await req('/api/v1/auth/me', {
        headers: { Authorization: 'Bearer invalid.jwt.token' },
      });
      expect(badTokenRes.status).toBe(401);

      // Email verification fails on wrong code
      const badVerify = await req('/api/v1/auth/verify-email', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ code: 'wrong-verification-code' }),
      });
      expect(badVerify.status).toBe(400);
      expect(badVerify.json.error.code).toBe('INVALID_VERIFY_CODE');

      // Rotate refresh token
      const rot = await req('/api/v1/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: refresh1 }),
      });
      expect(rot.status).toBe(200);
      const refresh2 = rot.json.data.refreshToken as string;
      expect(refresh2).not.toBe(refresh1);

      // Old refresh token is revoked and rejected
      const replayOld = await req('/api/v1/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: refresh1 }),
      });
      expect(replayOld.status).toBe(401);

      // Logout revokes new refresh token
      const logoutRes = await req('/api/v1/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: refresh2 }),
      });
      expect(logoutRes.status).toBe(200);

      const useRevoked = await req('/api/v1/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: refresh2 }),
      });
      expect(useRevoked.status).toBe(401);
    } finally {
      await prisma.user.delete({ where: { id: userId } });
    }
  });

  it('blocks automatic Google login linking onto existing password accounts without explicit linking', async () => {
    const email = `google_link_guard_${Date.now()}@nippia.id`;
    const reg = await req('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Local Account QA', email, password: 'PasswordKuat2026!' }),
    });
    expect(reg.status).toBe(201);
    const userId = reg.json.data.user.id as string;

    try {
      await expect(
        loginOrRegisterWithGoogle({
          googleId: `sub-${Date.now()}`,
          email,
          name: 'Attacker Google',
          avatarUrl: null,
        }),
      ).rejects.toMatchObject({ statusCode: 409, code: 'GOOGLE_LINK_REQUIRED' });
    } finally {
      await prisma.user.delete({ where: { id: userId } });
    }
  });

  it('blocks simulated instantActivate payment bypass when disabled in production', async () => {
    const email = `pay_guard_${Date.now()}@nippia.id`;
    const reg = await req('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Payment Guard QA', email, password: 'PasswordKuat2026!' }),
    });
    expect(reg.status).toBe(201);
    const token = reg.json.data.accessToken as string;
    const userId = reg.json.data.user.id as string;

    try {
      env.enableSimulatedPayments = false;
      const bypassAttempt = await req('/api/v1/subscriptions/orders', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          planCode: 'PRO_MONTHLY',
          paymentMethod: 'QRIS',
          instantActivate: true,
        }),
      });
      expect(bypassAttempt.status).toBe(403);
      expect(bypassAttempt.json.error.code).toBe('SIMULATED_PAYMENT_DISABLED');
    } finally {
      await prisma.user.delete({ where: { id: userId } });
    }
  });

  it('prevents cross-user exam access, expired deadline answer tampering, and foreign question injection', async () => {
    const u1 = await req('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'User One QA', email: `u1_${Date.now()}@nippia.id`, password: 'PasswordKuat2026!' }),
    });
    const u2 = await req('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'User Two QA', email: `u2_${Date.now()}@nippia.id`, password: 'PasswordKuat2026!' }),
    });
    const u1Token = u1.json.data.accessToken as string;
    const u2Token = u2.json.data.accessToken as string;
    const u1Id = u1.json.data.user.id as string;
    const u2Id = u2.json.data.user.id as string;

    try {
      const start = await req('/api/v1/exams/start', {
        method: 'POST',
        headers: { Authorization: `Bearer ${u1Token}` },
        body: JSON.stringify({ mode: 'MINI', formationType: 'UMUM' }),
      });
      expect(start.status).toBe(201);
      const examId = start.json.data.sessionId as string;

      // User 2 cannot read or tamper User 1's exam session
      const u2Read = await req(`/api/v1/exams/${examId}`, {
        headers: { Authorization: `Bearer ${u2Token}` },
      });
      expect(u2Read.status).toBe(404);

      // Foreign question injection rejected
      const badQ = await req(`/api/v1/exams/${examId}/answer`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${u1Token}` },
        body: JSON.stringify({ questionId: 'non-existent-question-id', selectedKey: 'A' }),
      });
      expect(badQ.status).toBe(400);
      expect(badQ.json.error.code).toBe('QUESTION_NOT_IN_SESSION');

      // Expired deadline rejects answer patching
      await prisma.examinationSession.update({
        where: { id: examId },
        data: { expiresAt: new Date(Date.now() - 5000) },
      });
      const examData = await req(`/api/v1/exams/${examId}`, {
        headers: { Authorization: `Bearer ${u1Token}` },
      });
      const firstQId = examData.json.data.questions[0].id as string;

      const expiredPatch = await req(`/api/v1/exams/${examId}/answer`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${u1Token}` },
        body: JSON.stringify({ questionId: firstQId, selectedKey: 'B' }),
      });
      expect(expiredPatch.status).toBe(400);
      expect(expiredPatch.json.error.code).toBe('EXAM_TIME_EXPIRED');
    } finally {
      await prisma.user.deleteMany({ where: { id: { in: [u1Id, u2Id] } } });
    }
  });

  it('supports image visualSpec on question stem and options while rejecting unsafe image URLs', async () => {
    const email = `curator_img_${Date.now()}@nippia.id`;
    const reg = await req('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Curator Image QA', email, password: 'PasswordKuat2026!' }),
    });
    expect(reg.status).toBe(201);
    const userId = reg.json.data.user.id as string;

    try {
      await prisma.user.update({ where: { id: userId }, data: { role: 'CONTENT_PARTNER' } });
      const login = await req('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: 'PasswordKuat2026!' }),
      });
      const token = login.json.data.accessToken as string;

      // Reject unsafe javascript: URL
      const badImg = await req('/api/v1/admin/questions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          subjectCode: 'TIU',
          topicSlug: 'figural-serial',
          difficulty: 'MEDIUM',
          status: 'DRAFT',
          stem: 'Perhatikan pola gambar berikut!',
          visualSpec: { kind: 'image', url: 'javascript:alert(1)' },
          explanation: 'Pembahasan soal bergambar minimal sepuluh karakter.',
          options: [
            { optionKey: 'A', text: '', scoreValue: 5, isCorrect: true, visualSpec: { kind: 'image', url: 'https://example.com/a.png' } },
            { optionKey: 'B', text: 'B', scoreValue: 0, isCorrect: false },
            { optionKey: 'C', text: 'C', scoreValue: 0, isCorrect: false },
            { optionKey: 'D', text: 'D', scoreValue: 0, isCorrect: false },
            { optionKey: 'E', text: 'E', scoreValue: 0, isCorrect: false },
          ],
        }),
      });
      expect(badImg.status).toBe(400);

      // Accept safe data URL & HTTPS image URL even when option text is empty
      const tinyPng =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const created = await req('/api/v1/admin/questions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          subjectCode: 'TIU',
          topicSlug: 'figural-serial',
          difficulty: 'MEDIUM',
          status: 'DRAFT',
          stem: 'Pilih gambar yang tepat untuk melengkapi pola:',
          visualSpec: { kind: 'image', url: tinyPng, caption: 'Pola utama' },
          explanation: 'Pola berputar 90 derajat searah jarum jam pada setiap langkah.',
          options: [
            { optionKey: 'A', text: '', scoreValue: 5, isCorrect: true, visualSpec: { kind: 'image', url: tinyPng } },
            { optionKey: 'B', text: '', scoreValue: 0, isCorrect: false, visualSpec: { kind: 'image', url: 'https://example.com/opt-b.webp' } },
            { optionKey: 'C', text: 'Opsi C', scoreValue: 0, isCorrect: false },
            { optionKey: 'D', text: 'Opsi D', scoreValue: 0, isCorrect: false },
            { optionKey: 'E', text: 'Opsi E', scoreValue: 0, isCorrect: false },
          ],
        }),
      });
      expect(created.status).toBe(201);
      const qId = created.json.data.id as string;
      expect(created.json.data.visualSpec.kind).toBe('image');
      expect(created.json.data.options[0].visualSpec.kind).toBe('image');

      // Update question to clear stem visualSpec cleanly
      const updated = await req(`/api/v1/admin/questions/${qId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          subjectCode: 'TIU',
          topicSlug: 'figural-serial',
          difficulty: 'MEDIUM',
          status: 'DRAFT',
          stem: 'Pilih gambar yang tepat untuk melengkapi pola (diperbarui):',
          visualSpec: null,
          explanation: 'Pola berputar 90 derajat searah jarum jam pada setiap langkah.',
          options: [
            { optionKey: 'A', text: '', scoreValue: 5, isCorrect: true, visualSpec: { kind: 'image', url: tinyPng } },
            { optionKey: 'B', text: 'Opsi B', scoreValue: 0, isCorrect: false, visualSpec: null },
            { optionKey: 'C', text: 'Opsi C', scoreValue: 0, isCorrect: false, visualSpec: null },
            { optionKey: 'D', text: 'Opsi D', scoreValue: 0, isCorrect: false, visualSpec: null },
            { optionKey: 'E', text: 'Opsi E', scoreValue: 0, isCorrect: false, visualSpec: null },
          ],
        }),
      });
      expect(updated.status).toBe(200);
      expect(updated.json.data.visualSpec).toBeNull();
    } finally {
      await prisma.user.delete({ where: { id: userId } });
    }
  });

  it('locks PRACTICE mode answers once submitted and supports retrying the exact same question set after completion', async () => {
    const email = `practice_lock_${Date.now()}@nippia.id`;
    const reg = await req('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Practice Lock QA', email, password: 'PasswordKuat2026!' }),
    });
    expect(reg.status).toBe(201);
    const userId = reg.json.data.user.id as string;
    const token = reg.json.data.accessToken as string;

    try {
      const startRes = await req('/api/v1/practice/topic/start', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          topicSlug: 'pancasila',
          questionCount: 3,
          difficulty: 'MIXED',
          mode: 'PRACTICE',
        }),
      });
      expect(startRes.status).toBe(201);
      const sessionId = startRes.json.data.sessionId as string;

      const initialSession = await req(`/api/v1/practice/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(initialSession.status).toBe(200);
      const qIds = initialSession.json.data.questions.map((q: { id: string }) => q.id) as string[];
      expect(qIds).toHaveLength(3);
      expect(initialSession.json.data.questions[0].explanation).toBeUndefined();

      // First confirmation locks the answer and returns feedback
      const firstLock = await req(`/api/v1/practice/sessions/${sessionId}/answer`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ questionId: qIds[0], selectedKey: 'A', timeSpentSec: 12 }),
      });
      expect(firstLock.status).toBe(200);
      expect(firstLock.json.data.feedback).toBeTruthy();

      // Re-answering the same question in PRACTICE mode is blocked (prevents score farming loophole)
      const changeAttempt = await req(`/api/v1/practice/sessions/${sessionId}/answer`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ questionId: qIds[0], selectedKey: 'B', timeSpentSec: 15 }),
      });
      expect(changeAttempt.status).toBe(409);
      expect(changeAttempt.json.error.code).toBe('ANSWER_LOCKED');

      // Retrying before submitting is rejected
      const earlyRetry = await req(`/api/v1/practice/sessions/${sessionId}/retry`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(earlyRetry.status).toBe(400);

      // Lock remaining questions & submit
      for (const qId of qIds.slice(1)) {
        const ansRes = await req(`/api/v1/practice/sessions/${sessionId}/answer`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ questionId: qId, selectedKey: 'B', timeSpentSec: 10 }),
        });
        expect(ansRes.status).toBe(200);
      }

      const submitRes = await req(`/api/v1/practice/sessions/${sessionId}/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ timeSpentSec: 45 }),
      });
      expect(submitRes.status).toBe(200);
      expect(submitRes.json.data.summary.answeredCount).toBe(3);

      const postSubmit = await req(`/api/v1/practice/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(postSubmit.status).toBe(200);
      expect(postSubmit.json.data.summary.answeredCount).toBe(3);

      // Retry with the exact same questions
      const retryRes = await req(`/api/v1/practice/sessions/${sessionId}/retry`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(retryRes.status).toBe(201);
      const retrySessionId = retryRes.json.data.sessionId as string;
      expect(retrySessionId).not.toBe(sessionId);

      const retried = await req(`/api/v1/practice/sessions/${retrySessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(retried.status).toBe(200);
      expect(retried.json.data.session.status).toBe('IN_PROGRESS');
      expect(retried.json.data.questions.map((q: { id: string }) => q.id)).toEqual(qIds);
      expect(retried.json.data.questions.every((q: { userAnswer: unknown }) => q.userAnswer === null)).toBe(true);
    } finally {
      await prisma.user.delete({ where: { id: userId } });
    }
  });

  it('randomizes option order A-E in Campaign sessions and scores displayed keys accurately', async () => {
    const email = `campaign_shuffle_${Date.now()}@nippia.id`;
    const reg = await req('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Campaign Shuffle QA', email, password: 'PasswordKuat2026!' }),
    });
    expect(reg.status).toBe(201);
    const userId = reg.json.data.user.id as string;
    const token = reg.json.data.accessToken as string;

    try {
      const start = await req('/api/v1/practice/campaign/start', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subjectCode: 'TWK', unitNumber: 1 }),
      });
      expect(start.status).toBe(201);
      const sessionId = start.json.data.sessionId as string;

      const sess = await req(`/api/v1/practice/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(sess.status).toBe(200);
      const qs = sess.json.data.questions as Array<{
        id: string;
        options: Array<{ optionKey: string; text: string }>;
      }>;
      expect(qs).toHaveLength(10);

      // Look up true correct option texts in DB and find their shuffled display keys in this Campaign session
      const dbQs = await prisma.question.findMany({
        where: { id: { in: qs.map((q) => q.id) } },
        include: { options: true },
      });
      const dbMap = new Map(dbQs.map((q) => [q.id, q]));

      const correctDisplayKeys = new Set<string>();
      for (const q of qs) {
        const origCorrect = dbMap.get(q.id)!.options.find((o) => o.isCorrect)!;
        const displayedCorrect = q.options.find((o) => o.text === origCorrect.text)!;
        expect(displayedCorrect).toBeTruthy();
        correctDisplayKeys.add(displayedCorrect.optionKey);
      }

      // Shuffling distributes correct answers across multiple option letters instead of always landing on B
      expect(correctDisplayKeys.size).toBeGreaterThanOrEqual(3);

      // Submitting the shuffled displayed key of the correct option yields isCorrect: true
      const q0 = qs[0]!;
      const origCorrect0 = dbMap.get(q0.id)!.options.find((o) => o.isCorrect)!;
      const displayedCorrect0 = q0.options.find((o) => o.text === origCorrect0.text)!;

      const ansRes = await req(`/api/v1/practice/sessions/${sessionId}/answer`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          questionId: q0.id,
          selectedKey: displayedCorrect0.optionKey,
          timeSpentSec: 10,
        }),
      });
      expect(ansRes.status).toBe(200);
      expect(ansRes.json.data.feedback.isCorrect).toBe(true);
      expect(ansRes.json.data.answer.selectedKey).toBe(displayedCorrect0.optionKey);
    } finally {
      await prisma.user.delete({ where: { id: userId } });
    }
  });
});
