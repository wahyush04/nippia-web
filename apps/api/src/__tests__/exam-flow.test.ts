import { describe, it, expect } from 'vitest';
import { createApp } from '../app.js';
import { prisma } from '../lib/prisma.js';

describe('End-to-End API Flow & Security', () => {
  const app = createApp();

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

  it('registers, logs in, runs CAT simulation with duplicate-submission protection, and enforces admin RBAC', async () => {
    const uniqueEmail = `qa_${Date.now()}@nippia.id`;

    // 1. Register
    const reg = await req('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Peserta QA',
        email: uniqueEmail,
        password: 'PasswordKuat2026!',
      }),
    });
    expect(reg.status).toBe(201);
    expect(reg.json.success).toBe(true);
    const token = reg.json.data.accessToken as string;
    const userId = reg.json.data.user.id as string;

    try {
      // 2. Normal user is blocked from admin endpoints
      const adminBlock = await req('/api/v1/admin/overview', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(adminBlock.status).toBe(403);

      // 3. Start Mini CAT simulation
      const startExam = await req('/api/v1/exams/start', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mode: 'MINI', formationType: 'UMUM' }),
      });
      expect(startExam.status).toBe(201);
      const examId = startExam.json.data.sessionId as string;

      // 4. Fetch exam questions & answer one question
      const examData = await req(`/api/v1/exams/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(examData.status).toBe(200);
      expect(examData.json.data.questions.length).toBeGreaterThan(0);

      const firstQ = examData.json.data.questions[0];
      const saveAns = await req(`/api/v1/exams/${examId}/answer`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ questionId: firstQ.id, selectedKey: 'A', isFlagged: true }),
      });
      expect(saveAns.status).toBe(200);
      expect(saveAns.json.data.selectedKey).toBe('A');

      // 5. Submit exam twice -> second submit must be idempotent (alreadySubmitted: true)
      const sub1 = await req(`/api/v1/exams/${examId}/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ submissionToken: `tok-${Date.now()}` }),
      });
      expect(sub1.status).toBe(200);
      expect(sub1.json.data.alreadySubmitted).toBe(false);

      const sub2 = await req(`/api/v1/exams/${examId}/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ submissionToken: `tok-${Date.now()}` }),
      });
      expect(sub2.status).toBe(200);
      expect(sub2.json.data.alreadySubmitted).toBe(true);
    } finally {
      await prisma.user.delete({ where: { id: userId } });
    }
  });
});
