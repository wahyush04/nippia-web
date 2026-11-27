import { describe, it, expect } from 'vitest';
import { createApp } from '../app.js';
import { prisma } from '../lib/prisma.js';

describe('CONTENT_PARTNER Role RBAC & Referral Voucher Commissions', () => {
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

  it('restricts CONTENT_PARTNER to questions/reports/topics/partner-voucher and awards Rp 5.000 commission on Rp 4.000 discounted new user checkout', async () => {
    const partnerEmail = `partner_qa_${Date.now()}@nippia.id`;
    const buyerEmail = `buyer_qa_${Date.now()}@nippia.id`;

    const regPartner = await req('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Partner Kontributor QA',
        email: partnerEmail,
        password: 'PasswordKuat2026!',
      }),
    });
    expect(regPartner.status).toBe(201);
    const partnerId = regPartner.json.data.user.id as string;

    const regBuyer = await req('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Pembeli Baru QA',
        email: buyerEmail,
        password: 'PasswordKuat2026!',
      }),
    });
    expect(regBuyer.status).toBe(201);
    const buyerToken = regBuyer.json.data.accessToken as string;
    const buyerId = regBuyer.json.data.user.id as string;

    try {
      // Promote user to CONTENT_PARTNER directly & log in fresh token
      await prisma.user.update({
        where: { id: partnerId },
        data: { role: 'CONTENT_PARTNER' },
      });
      const loginPartner = await req('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: partnerEmail, password: 'PasswordKuat2026!' }),
      });
      expect(loginPartner.status).toBe(200);
      expect(loginPartner.json.data.user.role).toBe('CONTENT_PARTNER');
      expect(loginPartner.json.data.user.isPro).toBe(true);
      const partnerToken = loginPartner.json.data.accessToken as string;

      // Partner automatically has Pro access to learning features (e.g. Full 110 CAT simulation)
      const partnerFullCat = await req('/api/v1/exams/start', {
        method: 'POST',
        headers: { Authorization: `Bearer ${partnerToken}` },
        body: JSON.stringify({ mode: 'FULL', formationType: 'UMUM' }),
      });
      expect(partnerFullCat.status).toBe(201);

      // 1. Partner CAN access bank soal, reports, topics, and partner voucher panel
      const qList = await req('/api/v1/admin/questions?pageSize=2', {
        headers: { Authorization: `Bearer ${partnerToken}` },
      });
      expect(qList.status).toBe(200);
      const sampleQ = qList.json.data.items[0];
      expect(sampleQ?.id).toBeTruthy();

      const qDetail = await req(`/api/v1/admin/questions/${sampleQ.id}`, {
        headers: { Authorization: `Bearer ${partnerToken}` },
      });
      expect(qDetail.status).toBe(200);

      const reports = await req('/api/v1/admin/reports', {
        headers: { Authorization: `Bearer ${partnerToken}` },
      });
      expect(reports.status).toBe(200);

      const topics = await req('/api/v1/admin/topics', {
        headers: { Authorization: `Bearer ${partnerToken}` },
      });
      expect(topics.status).toBe(200);

      // 2. Partner CANNOT access admin-only or live-event routes (403)
      const adminOverview = await req('/api/v1/admin/overview', {
        headers: { Authorization: `Bearer ${partnerToken}` },
      });
      expect(adminOverview.status).toBe(403);

      const deleteQuestion = await req(`/api/v1/admin/questions/${sampleQ.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${partnerToken}` },
      });
      expect(deleteQuestion.status).toBe(403);

      const adminUsers = await req('/api/v1/admin/users', {
        headers: { Authorization: `Bearer ${partnerToken}` },
      });
      expect(adminUsers.status).toBe(403);

      const adminSubs = await req('/api/v1/admin/subscriptions', {
        headers: { Authorization: `Bearer ${partnerToken}` },
      });
      expect(adminSubs.status).toBe(403);

      const liveOps = await req('/api/v1/admin/live-events', {
        headers: { Authorization: `Bearer ${partnerToken}` },
      });
      expect(liveOps.status).toBe(403);

      // Regular USER cannot access partner panel or bank soal
      const userPartnerBlock = await req('/api/v1/partner/me', {
        headers: { Authorization: `Bearer ${buyerToken}` },
      });
      expect(userPartnerBlock.status).toBe(403);

      // 3. Partner gets auto-generated voucher & customizes code
      const customCode = `QA${Date.now().toString().slice(-6)}`;
      const partnerMe = await req('/api/v1/partner/me', {
        headers: { Authorization: `Bearer ${partnerToken}` },
      });
      expect(partnerMe.status).toBe(200);
      expect(partnerMe.json.data.voucher.discountIdr).toBe(4000);
      expect(partnerMe.json.data.voucher.commissionIdr).toBe(5000);

      const patchVoucher = await req('/api/v1/partner/voucher', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${partnerToken}` },
        body: JSON.stringify({ code: customCode }),
      });
      expect(patchVoucher.status).toBe(200);
      expect(patchVoucher.json.data.code).toBe(customCode);

      // Partner cannot use own voucher
      const selfValidate = await req('/api/v1/subscriptions/vouchers/validate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${partnerToken}` },
        body: JSON.stringify({ code: customCode, planCode: 'PRO_MONTHLY' }),
      });
      expect(selfValidate.status).toBe(400);
      expect(selfValidate.json.error.code).toBe('SELF_REFERRAL_BLOCKED');

      // 4. New buyer validates voucher -> Rp 29.000 - Rp 4.000 = Rp 25.000
      const buyerValidate = await req('/api/v1/subscriptions/vouchers/validate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${buyerToken}` },
        body: JSON.stringify({ code: customCode, planCode: 'PRO_MONTHLY' }),
      });
      expect(buyerValidate.status).toBe(200);
      expect(buyerValidate.json.data.originalPriceIdr).toBe(29000);
      expect(buyerValidate.json.data.discountIdr).toBe(4000);
      expect(buyerValidate.json.data.finalAmountIdr).toBe(25000);

      // 5. Buyer checks out with voucher and pays -> pays Rp 25.000, Partner earns Rp 5.000 commission
      const orderRes = await req('/api/v1/subscriptions/orders', {
        method: 'POST',
        headers: { Authorization: `Bearer ${buyerToken}` },
        body: JSON.stringify({
          planCode: 'PRO_MONTHLY',
          paymentMethod: 'QRIS',
          voucherCode: customCode,
          instantActivate: true,
        }),
      });
      expect(orderRes.status).toBe(201);
      expect(orderRes.json.data.activated).toBe(true);
      expect(orderRes.json.data.order.amountIdr).toBe(25000);
      expect(orderRes.json.data.order.discountIdr).toBe(4000);
      expect(orderRes.json.data.order.voucherCode).toBe(customCode);

      // 6. Verify partner dashboard reflects 1 redemption & Rp 5.000 commission
      const partnerAfter = await req('/api/v1/partner/me', {
        headers: { Authorization: `Bearer ${partnerToken}` },
      });
      expect(partnerAfter.status).toBe(200);
      expect(partnerAfter.json.data.summary.totalRedemptions).toBe(1);
      expect(partnerAfter.json.data.summary.totalEarnedIdr).toBe(5000);
      expect(partnerAfter.json.data.summary.readyToPayoutIdr).toBe(5000);
      expect(partnerAfter.json.data.commissions[0].commissionIdr).toBe(5000);

      // 7. Existing subscriber cannot reuse new-user voucher a second time
      const reuseValidate = await req('/api/v1/subscriptions/vouchers/validate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${buyerToken}` },
        body: JSON.stringify({ code: customCode, planCode: 'PRO_MONTHLY' }),
      });
      expect(reuseValidate.status).toBe(400);
      expect(reuseValidate.json.error.code).toBe('VOUCHER_NEW_USER_ONLY');
    } finally {
      await prisma.user.deleteMany({ where: { id: { in: [partnerId, buyerId] } } });
    }
  });
});
