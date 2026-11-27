import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { getTodayWibString } from './gamification.service.js';
import { awardPartnerCommissionForOrder, validateVoucherForCheckout } from './partner.service.js';

export const PRO_MONTHLY_PRICE_IDR = 29000;

export const FREE_LIMITS = {
  CAMPAIGN_MAX_UNIT: 2,
  DAILY_PRACTICE_SESSIONS_PER_DAY: 1,
  MAX_QUESTIONS_PER_SESSION: 10,
  MINI_CAT_LIFETIME_LIMIT: 1,
  FLASHCARD_FREE_PER_SUBJECT: 5,
  ERROR_NOTEBOOK_FREE_LIMIT: 5,
} as const;

export const DEFAULT_SUBSCRIPTION_PLANS = [
  {
    code: 'PRO_MONTHLY',
    name: 'Nippia Pro Bulanan',
    description:
      'Akses penuh seluruh 41 Unit Campaign, 420+ soal Drilling 24 Topik, Simulasi CAT Unlimited, Live Akbar Premium, Jadwal 14 Hari, & Spaced Repetition.',
    priceIdr: 29000,
    originalIdr: 49000,
    durationDays: 30,
    isActive: true,
    isPopular: true,
    orderIndex: 1,
    features: [
      '41 Unit Campaign Belajar Harian (TWK, TIU, TKP) lengkap',
      'Drilling 24 Topik tanpa batas + filter HARD/MEDIUM & mode EXAM',
      'Simulasi CAT 110 soal unlimited + mode Disabilitas 130 menit',
      'Gratis semua event Nippia Live Akbar Premium',
      '45 Kartu Hafalan 3D & 18 Modul Pusat Materi (Paket 1–3)',
      'Buku Kesalahan tanpa batas + Latih Ulang Spaced Repetition',
      'Generator Jadwal 14 Hari & Analisis Kelemahan 24 Topik penuh',
      'Badge eksklusif PRO di Profil, Sidebar, dan Leaderboard',
    ],
  },
  {
    code: 'PRO_QUARTERLY',
    name: 'Nippia Pro 3 Bulan (Hemat)',
    description:
      'Paket persiapan intensif 90 hari menjelang seleksi CPNS dengan penghematan biaya bulanan.',
    priceIdr: 79000,
    originalIdr: 87000,
    durationDays: 90,
    isActive: true,
    isPopular: false,
    orderIndex: 2,
    features: [
      'Semua fitur Nippia Pro Bulanan aktif selama 90 hari penuh',
      'Hemat Rp 8.000 dibanding perpanjangan bulanan reguler',
      'Prioritas akses Tryout Live Akbar Premium sepanjang periode',
    ],
  },
];

export interface UserEntitlement {
  isPro: boolean;
  isAdmin: boolean;
  tier: 'FREE' | 'PRO';
  proPriceIdr: number;
  subscription: {
    id: string;
    planCode: string;
    planName: string;
    status: string;
    startedAt: Date;
    expiresAt: Date;
    daysRemaining: number;
    source: string;
  } | null;
  limits: typeof FREE_LIMITS;
  usage: {
    todayPracticeSessionsUsed: number;
    miniCatUsed: number;
    fullCatUsed: number;
    activeErrorNotes: number;
  };
}

export function getTodayWibStartDate(): Date {
  const todayWib = getTodayWibString();
  return new Date(`${todayWib}T00:00:00+07:00`);
}

export async function ensureDefaultSubscriptionPlans() {
  for (const plan of DEFAULT_SUBSCRIPTION_PLANS) {
    await prisma.subscriptionPlan.upsert({
      where: { code: plan.code },
      update: {
        name: plan.name,
        description: plan.description,
        priceIdr: plan.priceIdr,
        originalIdr: plan.originalIdr,
        durationDays: plan.durationDays,
        features: plan.features,
        isPopular: plan.isPopular,
        orderIndex: plan.orderIndex,
      },
      create: plan,
    });
  }
}

export async function getUserEntitlement(userId: string): Promise<UserEntitlement> {
  const now = new Date();
  const todayStart = getTodayWibStartDate();

  const [user, activeSub, todayPracticeSessionsUsed, miniCatUsed, fullCatUsed, activeErrorNotes] =
    await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
      prisma.userSubscription.findFirst({
        where: {
          userId,
          status: 'ACTIVE',
          expiresAt: { gt: now },
        },
        include: { plan: true },
        orderBy: { expiresAt: 'desc' },
      }),
      prisma.practiceSession.count({
        where: {
          userId,
          sessionType: { in: ['DAILY', 'TOPIC_DRILL'] },
          startedAt: { gte: todayStart },
        },
      }),
      prisma.examinationSession.count({
        where: { userId, isOfficialStyle: false },
      }),
      prisma.examinationSession.count({
        where: { userId, isOfficialStyle: true },
      }),
      prisma.errorNotebook.count({
        where: { userId, isMastered: false },
      }),
    ]);

  const isAdmin = user?.role === 'ADMIN';
  const isContentPartner = user?.role === 'CONTENT_PARTNER';
  const isPro = Boolean(activeSub) || isAdmin || isContentPartner;

  const daysRemaining = activeSub
    ? Math.max(1, Math.ceil((activeSub.expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
    : 0;

  return {
    isPro,
    isAdmin,
    tier: isPro ? 'PRO' : 'FREE',
    proPriceIdr: PRO_MONTHLY_PRICE_IDR,
    subscription: activeSub
      ? {
          id: activeSub.id,
          planCode: activeSub.plan.code,
          planName: activeSub.plan.name,
          status: activeSub.status,
          startedAt: activeSub.startedAt,
          expiresAt: activeSub.expiresAt,
          daysRemaining,
          source: activeSub.source,
        }
      : isAdmin || isContentPartner
        ? {
            id: isAdmin ? 'admin-override' : 'partner-pro',
            planCode: isAdmin ? 'ADMIN_PRO' : 'PARTNER_PRO',
            planName: isAdmin ? 'Akses Penuh Administrator' : 'Nippia Pro (Kontributor & Partner)',
            status: 'ACTIVE',
            startedAt: now,
            expiresAt: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
            daysRemaining: 365,
            source: isAdmin ? 'ADMIN' : 'PARTNER',
          }
        : null,
    limits: FREE_LIMITS,
    usage: {
      todayPracticeSessionsUsed,
      miniCatUsed,
      fullCatUsed,
      activeErrorNotes,
    },
  };
}

export async function getProUserIdSet(userIds: string[]): Promise<Set<string>> {
  if (userIds.length === 0) return new Set();
  const now = new Date();
  const [activeSubs, admins] = await Promise.all([
    prisma.userSubscription.findMany({
      where: {
        userId: { in: userIds },
        status: 'ACTIVE',
        expiresAt: { gt: now },
      },
      select: { userId: true },
    }),
    prisma.user.findMany({
      where: {
        id: { in: userIds },
        role: { in: ['ADMIN', 'CONTENT_PARTNER'] },
      },
      select: { id: true },
    }),
  ]);
  const proSet = new Set<string>();
  for (const s of activeSubs) proSet.add(s.userId);
  for (const a of admins) proSet.add(a.id);
  return proSet;
}

export async function requireProOrThrow(
  userId: string,
  featureLabel: string,
  featureKey: string,
): Promise<UserEntitlement> {
  const entitlement = await getUserEntitlement(userId);
  if (!entitlement.isPro) {
    throw new AppError(
      403,
      `${featureLabel} merupakan fitur Paket Pro (Rp 29.000/bulan). Upgrade akun Anda ke Nippia Pro untuk membuka akses penuh.`,
      'PRO_REQUIRED',
      {
        feature: featureKey,
        featureLabel,
        upgradeUrl: '/subscription',
        priceIdr: PRO_MONTHLY_PRICE_IDR,
      },
    );
  }
  return entitlement;
}

export async function activateSubscriptionForUser(params: {
  userId: string;
  planId: string;
  source: 'ORDER' | 'ADMIN_GRANT';
  note?: string;
  durationDaysOverride?: number;
}) {
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: params.planId } });
  if (!plan) {
    throw new AppError(404, 'Paket langganan tidak ditemukan.');
  }

  const now = new Date();
  const durationDays = params.durationDaysOverride ?? plan.durationDays;

  return prisma.$transaction(async (tx) => {
    const existingActive = await tx.userSubscription.findFirst({
      where: {
        userId: params.userId,
        status: 'ACTIVE',
        expiresAt: { gt: now },
      },
      orderBy: { expiresAt: 'desc' },
    });

    if (existingActive) {
      const nextExpiry = new Date(
        existingActive.expiresAt.getTime() + durationDays * 24 * 60 * 60 * 1000,
      );
      return tx.userSubscription.update({
        where: { id: existingActive.id },
        data: {
          planId: plan.id,
          expiresAt: nextExpiry,
          source: params.source,
          note: params.note ?? existingActive.note,
        },
        include: { plan: true },
      });
    }

    // Expire any stale active records cleanly
    await tx.userSubscription.updateMany({
      where: { userId: params.userId, status: 'ACTIVE', expiresAt: { lte: now } },
      data: { status: 'EXPIRED' },
    });

    const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
    return tx.userSubscription.create({
      data: {
        userId: params.userId,
        planId: plan.id,
        status: 'ACTIVE',
        startedAt: now,
        expiresAt,
        source: params.source,
        note: params.note ?? null,
      },
      include: { plan: true },
    });
  });
}

export async function createSubscriptionOrder(params: {
  userId: string;
  planCode: string;
  paymentMethod: string;
  paymentProofNote?: string;
  voucherCode?: string;
}) {
  await ensureDefaultSubscriptionPlans();
  const plan = await prisma.subscriptionPlan.findUnique({ where: { code: params.planCode } });
  if (!plan || !plan.isActive) {
    throw new AppError(404, 'Paket langganan tidak tersedia.');
  }

  let voucherId: string | null = null;
  let appliedCode: string | null = null;
  let discountIdr = 0;
  let finalAmountIdr = plan.priceIdr;

  if (params.voucherCode && params.voucherCode.trim()) {
    const validated = await validateVoucherForCheckout({
      code: params.voucherCode,
      buyerUserId: params.userId,
      planCode: params.planCode,
    });
    voucherId = validated.voucher.id;
    appliedCode = validated.voucher.code;
    discountIdr = validated.discountIdr;
    finalAmountIdr = validated.finalAmountIdr;
  }

  const orderCode = `NIP-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${crypto
    .randomBytes(3)
    .toString('hex')
    .toUpperCase()}`;

  return prisma.subscriptionOrder.create({
    data: {
      orderCode,
      userId: params.userId,
      planId: plan.id,
      amountIdr: finalAmountIdr,
      voucherId,
      voucherCode: appliedCode,
      discountIdr,
      paymentMethod: params.paymentMethod,
      paymentProofNote: params.paymentProofNote?.trim() || null,
      status: 'PENDING',
    },
    include: { plan: true },
  });
}

export async function markOrderPaidAndActivate(params: {
  orderId: string;
  verifiedById?: string | null;
  note?: string;
}) {
  const order = await prisma.subscriptionOrder.findUnique({
    where: { id: params.orderId },
    include: { plan: true },
  });
  if (!order) throw new AppError(404, 'Order langganan tidak ditemukan.');
  if (order.status === 'PAID') {
    await awardPartnerCommissionForOrder(order.id);
    return order;
  }
  if (order.status === 'REJECTED' || order.status === 'CANCELLED') {
    throw new AppError(400, 'Order yang ditolak atau dibatalkan tidak dapat diaktifkan.');
  }

  const subscription = await activateSubscriptionForUser({
    userId: order.userId,
    planId: order.planId,
    source: 'ORDER',
    note: params.note ?? `Order ${order.orderCode}`,
  });

  const updated = await prisma.subscriptionOrder.update({
    where: { id: order.id },
    data: {
      status: 'PAID',
      paidAt: new Date(),
      verifiedById: params.verifiedById ?? null,
      verifiedAt: new Date(),
      subscriptionId: subscription.id,
    },
    include: { plan: true, subscription: true },
  });

  await awardPartnerCommissionForOrder(updated.id);
  return updated;
}
