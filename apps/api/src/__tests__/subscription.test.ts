import crypto from 'crypto';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { createApp } from '../app.js';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';

describe('Pro Monthly Subscription & Free vs Pro Entitlements', () => {
  const app = createApp();

  afterEach(() => {
    vi.restoreAllMocks();
    env.midtransServerKey = '';
    env.midtransClientKey = '';
    env.midtransIsProduction = false;
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

  it('enforces Free tier limits and unlocks full Pro features after activating Rp 29.000/month Pro subscription', async () => {
    const uniqueEmail = `sub_qa_${Date.now()}@nippia.id`;

    // 1. Register Free user
    const reg = await req('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Peserta Free To Pro',
        email: uniqueEmail,
        password: 'PasswordKuat2026!',
      }),
    });
    expect(reg.status).toBe(201);
    const token = reg.json.data.accessToken as string;
    const userId = reg.json.data.user.id as string;

    try {
      // 2. Verify PRO_MONTHLY plan is Rp 29.000 / 30 days
      const plansResp = await req('/api/v1/subscriptions/plans');
      expect(plansResp.status).toBe(200);
      const monthly = (plansResp.json.data as Array<{ code: string; priceIdr: number; durationDays: number }>).find(
        (p) => p.code === 'PRO_MONTHLY',
      );
      expect(monthly?.priceIdr).toBe(29000);
      expect(monthly?.durationDays).toBe(30);

      // 3. Free user: Campaign unit 3+ blocked with PRO_REQUIRED; overview marks unit 3 PRO_LOCKED
      const campOverview = await req('/api/v1/practice/campaign', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(campOverview.status).toBe(200);
      expect(campOverview.json.data.isPro).toBe(false);
      const twkUnit3 = campOverview.json.data.tracks[0].units.find((u: { unitNumber: number }) => u.unitNumber === 3);
      expect(twkUnit3.status).toBe('PRO_LOCKED');

      const campStart3 = await req('/api/v1/practice/campaign/start', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subjectCode: 'TWK', unitNumber: 3 }),
      });
      expect(campStart3.status).toBe(403);
      expect(campStart3.json.error.code).toBe('PRO_REQUIRED');

      // 4. Free user: Full CAT (110 soal) blocked with PRO_REQUIRED
      const fullCatFree = await req('/api/v1/exams/start', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mode: 'FULL', formationType: 'UMUM' }),
      });
      expect(fullCatFree.status).toBe(403);
      expect(fullCatFree.json.error.code).toBe('PRO_REQUIRED');

      // 5. Free user: 1st daily practice (10 soal) succeeds, 2nd session same day blocked
      const daily1 = await req('/api/v1/practice/daily/start', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });
      expect(daily1.status).toBe(201);

      const daily2 = await req('/api/v1/practice/daily/start', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });
      expect(daily2.status).toBe(403);
      expect(daily2.json.error.code).toBe('PRO_REQUIRED');

      // 6. Free user: AI Tutor & Error Review blocked
      const aiFree = await req('/api/v1/analytics/ai/ask', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: 'Jelaskan silogisme' }),
      });
      expect(aiFree.status).toBe(403);
      expect(aiFree.json.error.code).toBe('PRO_REQUIRED');

      const errRevFree = await req('/api/v1/practice/error-review/start', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(errRevFree.status).toBe(403);
      expect(errRevFree.json.error.code).toBe('PRO_REQUIRED');

      // 7. Flashcards & Study Materials lock check for Free
      const flashcardsFree = await req('/api/v1/dashboard/flashcards', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(flashcardsFree.status).toBe(200);
      const unlockedCards = (flashcardsFree.json.data as Array<{ isLocked: boolean }>).filter((c) => !c.isLocked);
      expect(unlockedCards.length).toBe(15);

      const materialsFree = await req('/api/v1/dashboard/materials', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(materialsFree.status).toBe(200);
      const matList = materialsFree.json.data as Array<{ isLocked: boolean }>;
      const lockedMats = matList.filter((m) => m.isLocked);
      expect(lockedMats.length).toBeGreaterThanOrEqual(12);
      const firstLockedIdx = matList.findIndex((m) => m.isLocked);
      expect(firstLockedIdx).toBeGreaterThan(0);
      expect(matList.slice(0, firstLockedIdx).every((m) => !m.isLocked)).toBe(true);
      expect(matList.slice(firstLockedIdx).every((m) => m.isLocked)).toBe(true);

      // 8. Checkout & Activate Nippia Pro Bulanan (Rp 29.000) via instant sandbox fallback
      const checkout = await req('/api/v1/subscriptions/orders', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          planCode: 'PRO_MONTHLY',
          paymentMethod: 'QRIS',
          instantActivate: true,
        }),
      });
      expect(checkout.status).toBe(201);
      expect(checkout.json.data.activated).toBe(true);
      expect(checkout.json.data.entitlement.isPro).toBe(true);

      // 9. Pro user: /auth/me reflects isPro = true & previously blocked endpoints succeed!
      const mePro = await req('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(mePro.status).toBe(200);
      expect(mePro.json.data.isPro).toBe(true);

      const topicPro = await req('/api/v1/practice/topic/start', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          topicSlug: 'uud-1945',
          questionCount: 15,
          difficulty: 'HARD',
          mode: 'EXAM',
          includeWrong: true,
          avoidRecent: true,
        }),
      });
      expect(topicPro.status).toBe(201);

      const fullCatPro = await req('/api/v1/exams/start', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mode: 'FULL', formationType: 'UMUM' }),
      });
      expect(fullCatPro.status).toBe(201);

      const aiPro = await req('/api/v1/analytics/ai/ask', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: 'Jelaskan silogisme' }),
      });
      expect(aiPro.status).toBe(200);

      const flashcardsPro = await req('/api/v1/dashboard/flashcards', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(flashcardsPro.status).toBe(200);
      expect((flashcardsPro.json.data as Array<{ isLocked: boolean }>).every((c) => !c.isLocked)).toBe(true);
    } finally {
      await prisma.user.delete({ where: { id: userId } });
    }
  });

  it('creates Midtrans Snap token, rejects tampered webhooks, and activates Pro on valid SHA-512 settlement webhook', async () => {
    const uniqueEmail = `midtrans_qa_${Date.now()}@nippia.id`;
    const reg = await req('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Peserta Midtrans QA',
        email: uniqueEmail,
        password: 'PasswordKuat2026!',
      }),
    });
    expect(reg.status).toBe(201);
    const token = reg.json.data.accessToken as string;
    const userId = reg.json.data.user.id as string;

    try {
      env.midtransServerKey = 'SB-Mid-server-TESTKEY_2026';
      env.midtransClientKey = 'SB-Mid-client-TESTKEY_2026';
      env.midtransIsProduction = false;

      // Config endpoint exposes public clientKey & sandbox snap.js URL without serverKey
      const cfg = await req('/api/v1/subscriptions/config');
      expect(cfg.status).toBe(200);
      expect(cfg.json.data.midtrans.enabled).toBe(true);
      expect(cfg.json.data.midtrans.clientKey).toBe('SB-Mid-client-TESTKEY_2026');
      expect(cfg.json.data.midtrans.snapScriptUrl).toBe('https://app.sandbox.midtrans.com/snap/snap.js');

      // Intercept outbound Midtrans Snap API call cleanly while letting local test fetch work
      const realFetch = globalThis.fetch;
      vi.stubGlobal('fetch', async (input: string | URL | Request, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
        if (url.startsWith('https://app.sandbox.midtrans.com/snap/v1/transactions')) {
          return new Response(
            JSON.stringify({
              token: 'snap-tok-qa-12345',
              redirect_url: 'https://app.sandbox.midtrans.com/snap/v4/redirection/snap-tok-qa-12345',
            }),
            { status: 201, headers: { 'Content-Type': 'application/json' } },
          );
        }
        return realFetch(input, init);
      });

      const orderRes = await req('/api/v1/subscriptions/orders', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          planCode: 'PRO_MONTHLY',
          paymentMethod: 'MIDTRANS_SNAP',
        }),
      });
      expect(orderRes.status).toBe(201);
      expect(orderRes.json.data.snapToken).toBe('snap-tok-qa-12345');
      expect(orderRes.json.data.activated).toBe(false);
      const orderCode = orderRes.json.data.order.orderCode as string;

      // Tampered webhook signature must be rejected with 403
      const badHook = await req('/api/v1/subscriptions/midtrans/webhook', {
        method: 'POST',
        body: JSON.stringify({
          order_id: orderCode,
          status_code: '200',
          gross_amount: '29000.00',
          transaction_status: 'settlement',
          signature_key: 'invalid-signature',
        }),
      });
      expect(badHook.status).toBe(403);
      expect(badHook.json.error.code).toBe('INVALID_MIDTRANS_SIGNATURE');

      // Valid SHA-512 Midtrans settlement webhook activates Pro immediately
      const statusCode = '200';
      const grossAmount = '29000.00';
      const validSig = crypto
        .createHash('sha512')
        .update(`${orderCode}${statusCode}${grossAmount}${env.midtransServerKey}`)
        .digest('hex');

      const goodHook = await req('/api/v1/subscriptions/midtrans/webhook', {
        method: 'POST',
        body: JSON.stringify({
          order_id: orderCode,
          transaction_id: 'mid-tx-9999',
          status_code: statusCode,
          gross_amount: grossAmount,
          payment_type: 'qris',
          transaction_status: 'settlement',
          fraud_status: 'accept',
          signature_key: validSig,
        }),
      });
      expect(goodHook.status).toBe(200);
      expect(goodHook.json.data.settled).toBe(true);

      const meAfter = await req('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(meAfter.status).toBe(200);
      expect(meAfter.json.data.isPro).toBe(true);
    } finally {
      await prisma.user.delete({ where: { id: userId } });
    }
  });
});
