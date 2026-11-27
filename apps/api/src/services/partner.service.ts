import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export const DEFAULT_PARTNER_DISCOUNT_IDR = 4000;
export const DEFAULT_PARTNER_COMMISSION_IDR = 5000;

function maskBuyerEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***';
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
}

function maskBuyerName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return `${parts[0]?.slice(0, 3) ?? 'U'}***`;
  return `${parts[0]} ${parts[1].charAt(0)}.`;
}

function buildSuggestedCode(name: string): string {
  const clean = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6);
  const prefix = clean.length >= 3 ? clean : 'MITRA';
  const suffix = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}${suffix}`;
}

export async function getOrCreatePartnerVoucher(userId: string) {
  const existing = await prisma.partnerVoucher.findUnique({ where: { ownerId: userId } });
  if (existing) return existing;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });
  if (!user) throw new AppError(404, 'Pengguna tidak ditemukan.');

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = buildSuggestedCode(user.name);
    const conflict = await prisma.partnerVoucher.findUnique({ where: { code } });
    if (!conflict) {
      return prisma.partnerVoucher.create({
        data: {
          ownerId: userId,
          code,
          discountIdr: DEFAULT_PARTNER_DISCOUNT_IDR,
          commissionIdr: DEFAULT_PARTNER_COMMISSION_IDR,
          newUsersOnly: true,
          isActive: true,
        },
      });
    }
  }

  return prisma.partnerVoucher.create({
    data: {
      ownerId: userId,
      code: `NIP${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
      discountIdr: DEFAULT_PARTNER_DISCOUNT_IDR,
      commissionIdr: DEFAULT_PARTNER_COMMISSION_IDR,
      newUsersOnly: true,
      isActive: true,
    },
  });
}

export async function updatePartnerVoucher(params: {
  userId: string;
  code?: string;
  isActive?: boolean;
}) {
  const current = await getOrCreatePartnerVoucher(params.userId);
  const nextCode = params.code ? params.code.trim().toUpperCase() : current.code;

  if (nextCode !== current.code) {
    if (!/^[A-Z0-9_-]{4,20}$/.test(nextCode)) {
      throw new AppError(
        400,
        'Kode voucher hanya boleh berisi huruf kapital, angka, tanda hubung (-), atau garis bawah (_) sebanyak 4–20 karakter.',
        'INVALID_VOUCHER_FORMAT',
      );
    }
    const taken = await prisma.partnerVoucher.findUnique({ where: { code: nextCode } });
    if (taken && taken.id !== current.id) {
      throw new AppError(409, `Kode voucher "${nextCode}" sudah digunakan. Pilih kode lain.`, 'VOUCHER_CODE_TAKEN');
    }
  }

  return prisma.partnerVoucher.update({
    where: { id: current.id },
    data: {
      code: nextCode,
      ...(params.isActive !== undefined ? { isActive: params.isActive } : {}),
    },
  });
}

export async function validateVoucherForCheckout(params: {
  code: string;
  buyerUserId: string;
  planCode: string;
}) {
  const normalizedCode = params.code.trim().toUpperCase();
  if (!normalizedCode) {
    throw new AppError(400, 'Kode voucher tidak boleh kosong.', 'VOUCHER_EMPTY');
  }

  const [voucher, plan, paidOrdersCount, priorSubCount] = await Promise.all([
    prisma.partnerVoucher.findUnique({
      where: { code: normalizedCode },
      include: { owner: { select: { id: true, name: true } } },
    }),
    prisma.subscriptionPlan.findUnique({ where: { code: params.planCode } }),
    prisma.subscriptionOrder.count({
      where: { userId: params.buyerUserId, status: 'PAID' },
    }),
    prisma.userSubscription.count({
      where: { userId: params.buyerUserId },
    }),
  ]);

  if (!plan || !plan.isActive) {
    throw new AppError(404, 'Paket langganan tidak tersedia.');
  }
  if (!voucher) {
    throw new AppError(404, `Kode voucher "${normalizedCode}" tidak ditemukan.`, 'VOUCHER_NOT_FOUND');
  }
  if (!voucher.isActive) {
    throw new AppError(400, `Kode voucher "${normalizedCode}" sedang tidak aktif.`, 'VOUCHER_INACTIVE');
  }
  if (voucher.ownerId === params.buyerUserId) {
    throw new AppError(400, 'Anda tidak dapat menggunakan kode voucher milik sendiri.', 'SELF_REFERRAL_BLOCKED');
  }
  if (voucher.newUsersOnly && (paidOrdersCount > 0 || priorSubCount > 0)) {
    throw new AppError(
      400,
      'Kode voucher ini khusus untuk pengguna baru yang pertama kali berlangganan Nippia Pro.',
      'VOUCHER_NEW_USER_ONLY',
    );
  }

  const discountIdr = Math.min(voucher.discountIdr, Math.max(0, plan.priceIdr - 1000));
  const finalAmountIdr = plan.priceIdr - discountIdr;

  return {
    voucher,
    originalPriceIdr: plan.priceIdr,
    discountIdr,
    finalAmountIdr,
    commissionIdr: voucher.commissionIdr,
  };
}

export async function awardPartnerCommissionForOrder(orderId: string) {
  const order = await prisma.subscriptionOrder.findUnique({
    where: { id: orderId },
    include: { voucher: true },
  });
  if (!order || order.status !== 'PAID' || !order.voucherId || !order.voucher) {
    return null;
  }

  const existing = await prisma.partnerCommission.findUnique({
    where: { orderId: order.id },
  });
  if (existing) return existing;

  return prisma.partnerCommission.create({
    data: {
      voucherId: order.voucherId,
      partnerId: order.voucher.ownerId,
      buyerUserId: order.userId,
      orderId: order.id,
      orderAmountIdr: order.amountIdr,
      discountGivenIdr: order.discountIdr,
      commissionIdr: order.voucher.commissionIdr,
      status: 'EARNED',
    },
  });
}

export async function getPartnerDashboardData(userId: string) {
  const voucher = await getOrCreatePartnerVoucher(userId);
  const commissions = await prisma.partnerCommission.findMany({
    where: { partnerId: userId },
    include: {
      buyer: { select: { name: true, email: true } },
      order: { select: { orderCode: true, paidAt: true, plan: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  let totalEarnedIdr = 0;
  let readyToPayoutIdr = 0;
  let paidOutIdr = 0;

  for (const c of commissions) {
    if (c.status === 'EARNED') {
      totalEarnedIdr += c.commissionIdr;
      readyToPayoutIdr += c.commissionIdr;
    } else if (c.status === 'PAID_OUT') {
      totalEarnedIdr += c.commissionIdr;
      paidOutIdr += c.commissionIdr;
    }
  }

  return {
    voucher,
    summary: {
      totalRedemptions: commissions.filter((c) => c.status !== 'CANCELLED').length,
      totalEarnedIdr,
      readyToPayoutIdr,
      paidOutIdr,
    },
    commissions: commissions.map((c) => ({
      id: c.id,
      orderCode: c.order.orderCode,
      planName: c.order.plan.name,
      buyerLabel: maskBuyerName(c.buyer.name),
      buyerEmailMasked: maskBuyerEmail(c.buyer.email),
      orderAmountIdr: c.orderAmountIdr,
      discountGivenIdr: c.discountGivenIdr,
      commissionIdr: c.commissionIdr,
      status: c.status,
      payoutNote: c.payoutNote,
      paidOutAt: c.paidOutAt,
      createdAt: c.createdAt,
    })),
  };
}
