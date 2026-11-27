import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import {
  createSubscriptionOrder,
  ensureDefaultSubscriptionPlans,
  getUserEntitlement,
  markOrderPaidAndActivate,
} from '../services/subscription.service.js';
import {
  applyMidtransNotification,
  createMidtransSnapTransaction,
  getMidtransPublicConfig,
  syncOrderWithMidtransStatus,
  verifyMidtransSignature,
} from '../services/midtrans.service.js';
import { validateVoucherForCheckout } from '../services/partner.service.js';

export const subscriptionRouter = Router();

subscriptionRouter.get(
  '/config',
  asyncHandler(async (_req, res) => {
    res.json({
      success: true,
      data: {
        midtrans: getMidtransPublicConfig(),
      },
    });
  }),
);

subscriptionRouter.get(
  '/plans',
  asyncHandler(async (_req, res) => {
    await ensureDefaultSubscriptionPlans();
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' },
    });
    res.json({ success: true, data: plans });
  }),
);

subscriptionRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const [entitlement, orders] = await Promise.all([
      getUserEntitlement(userId),
      prisma.subscriptionOrder.findMany({
        where: { userId },
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
        take: 15,
      }),
    ]);

    res.json({
      success: true,
      data: {
        ...entitlement,
        orders,
      },
    });
  }),
);

subscriptionRouter.post(
  '/vouchers/validate',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { code, planCode } = z
      .object({
        code: z.string().min(2).max(30),
        planCode: z.string().default('PRO_MONTHLY'),
      })
      .parse(req.body ?? {});

    const validated = await validateVoucherForCheckout({
      code,
      buyerUserId: req.user!.userId,
      planCode,
    });

    res.json({
      success: true,
      data: {
        voucherCode: validated.voucher.code,
        ownerName: validated.voucher.owner.name,
        originalPriceIdr: validated.originalPriceIdr,
        discountIdr: validated.discountIdr,
        finalAmountIdr: validated.finalAmountIdr,
      },
    });
  }),
);

subscriptionRouter.post(
  '/orders',
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        planCode: z.string().default('PRO_MONTHLY'),
        paymentMethod: z
          .enum(['MIDTRANS_SNAP', 'QRIS', 'VIRTUAL_ACCOUNT', 'EWALLET', 'TRANSFER_MANUAL'])
          .default('MIDTRANS_SNAP'),
        voucherCode: z.string().max(30).optional(),
        paymentProofNote: z.string().max(500).optional(),
        instantActivate: z.boolean().optional(),
      })
      .parse(req.body ?? {});

    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    if (!user) throw new AppError(404, 'Pengguna tidak ditemukan.');

    const order = await createSubscriptionOrder({
      userId,
      planCode: body.planCode,
      paymentMethod: body.paymentMethod,
      voucherCode: body.voucherCode,
      paymentProofNote: body.paymentProofNote,
    });

    if (body.paymentMethod === 'MIDTRANS_SNAP') {
      try {
        const snapTx = await createMidtransSnapTransaction({
          orderCode: order.orderCode,
          amountIdr: order.amountIdr,
          planCode: order.plan.code,
          planName: order.plan.name,
          customerName: user.name,
          customerEmail: user.email,
        });

        const updatedOrder = await prisma.subscriptionOrder.update({
          where: { id: order.id },
          data: {
            snapToken: snapTx.token,
            snapRedirectUrl: snapTx.redirectUrl,
            gatewayStatus: 'snap_created',
          },
          include: { plan: true },
        });
        const entitlement = await getUserEntitlement(userId);
        return res.status(201).json({
          success: true,
          data: {
            order: updatedOrder,
            snapToken: snapTx.token,
            snapRedirectUrl: snapTx.redirectUrl,
            midtrans: getMidtransPublicConfig(),
            entitlement,
            activated: false,
          },
        });
      } catch (err) {
        await prisma.subscriptionOrder.delete({ where: { id: order.id } }).catch(() => {});
        throw err;
      }
    }

    // Fallback instant activation strictly blocked in production
    if (body.instantActivate) {
      if (!env.enableSimulatedPayments) {
        throw new AppError(
          403,
          'Aktivasi instan lokal dinonaktifkan di produksi. Gunakan Midtrans Checkout atau Transfer Manual terverifikasi.',
          'SIMULATED_PAYMENT_DISABLED',
        );
      }
      if (body.paymentMethod !== 'TRANSFER_MANUAL') {
        const paidOrder = await markOrderPaidAndActivate({
          orderId: order.id,
          note: `Aktivasi Instan (${body.paymentMethod})`,
        });
        const entitlement = await getUserEntitlement(userId);
        return res.status(201).json({
          success: true,
          data: { order: paidOrder, entitlement, activated: true },
        });
      }
    }

    const entitlement = await getUserEntitlement(userId);
    res.status(201).json({
      success: true,
      data: { order, entitlement, activated: false },
    });
  }),
);

subscriptionRouter.post(
  '/orders/:id/sync-midtrans',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const existing = await prisma.subscriptionOrder.findFirst({
      where: { id: String(req.params.id), userId },
      include: { plan: true },
    });
    if (!existing) throw new AppError(404, 'Order pembayaran tidak ditemukan.');

    if (existing.status === 'PAID') {
      const entitlement = await getUserEntitlement(userId);
      return res.json({
        success: true,
        data: { order: existing, settled: true, entitlement },
      });
    }

    const result = await syncOrderWithMidtransStatus(existing.orderCode);
    const entitlement = await getUserEntitlement(userId);
    res.json({
      success: true,
      data: {
        ...result,
        entitlement,
      },
    });
  }),
);

subscriptionRouter.post(
  '/orders/:id/confirm-payment',
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        paymentProofNote: z.string().max(500).optional(),
        instantActivate: z.boolean().optional(),
      })
      .parse(req.body ?? {});

    const userId = req.user!.userId;
    const existing = await prisma.subscriptionOrder.findFirst({
      where: { id: String(req.params.id), userId },
    });
    if (!existing) throw new AppError(404, 'Order pembayaran tidak ditemukan.');
    if (existing.status === 'PAID') {
      const entitlement = await getUserEntitlement(userId);
      return res.json({ success: true, data: { order: existing, entitlement, activated: true } });
    }

    if (body.paymentProofNote !== undefined) {
      await prisma.subscriptionOrder.update({
        where: { id: existing.id },
        data: { paymentProofNote: body.paymentProofNote.trim() || null },
      });
    }

    if (body.instantActivate) {
      if (!env.enableSimulatedPayments) {
        throw new AppError(
          403,
          'Konfirmasi instan lokal dinonaktifkan di produksi.',
          'SIMULATED_PAYMENT_DISABLED',
        );
      }
      if (existing.paymentMethod !== 'TRANSFER_MANUAL' && !existing.snapToken) {
        const paidOrder = await markOrderPaidAndActivate({
          orderId: existing.id,
          note: `Konfirmasi Gateway (${existing.paymentMethod})`,
        });
        const entitlement = await getUserEntitlement(userId);
        return res.json({
          success: true,
          data: { order: paidOrder, entitlement, activated: true },
        });
      }
    }

    const updated = await prisma.subscriptionOrder.findUnique({
      where: { id: existing.id },
      include: { plan: true },
    });
    const entitlement = await getUserEntitlement(userId);
    res.json({
      success: true,
      data: { order: updated, entitlement, activated: false },
    });
  }),
);

subscriptionRouter.post(
  '/orders/:id/cancel',
  requireAuth,
  asyncHandler(async (req, res) => {
    const existing = await prisma.subscriptionOrder.findFirst({
      where: { id: String(req.params.id), userId: req.user!.userId },
    });
    if (!existing) throw new AppError(404, 'Order pembayaran tidak ditemukan.');
    if (existing.status !== 'PENDING') {
      throw new AppError(400, 'Hanya order berstatus PENDING yang dapat dibatalkan.');
    }
    const updated = await prisma.subscriptionOrder.update({
      where: { id: existing.id },
      data: { status: 'CANCELLED' },
      include: { plan: true },
    });
    res.json({ success: true, data: updated });
  }),
);

/**
 * Public Webhook endpoint called by Midtrans servers on payment state updates.
 * Protected via Midtrans SHA-512 signature_key verification.
 */
subscriptionRouter.post(
  '/midtrans/webhook',
  asyncHandler(async (req, res) => {
    const body = req.body as {
      order_id?: string;
      status_code?: string;
      gross_amount?: string;
      signature_key?: string;
      transaction_status?: string;
    };

    if (
      !body?.order_id ||
      !body?.status_code ||
      !body?.gross_amount ||
      !body?.signature_key ||
      !body?.transaction_status
    ) {
      throw new AppError(400, 'Payload notifikasi Midtrans tidak lengkap.', 'INVALID_MIDTRANS_PAYLOAD');
    }

    const isValid = verifyMidtransSignature({
      orderId: String(body.order_id),
      statusCode: String(body.status_code),
      grossAmount: String(body.gross_amount),
      signatureKey: String(body.signature_key),
    });

    if (!isValid) {
      throw new AppError(403, 'Signature key Midtrans tidak valid.', 'INVALID_MIDTRANS_SIGNATURE');
    }

    const result = await applyMidtransNotification({
      ...body,
      order_id: String(body.order_id),
      transaction_status: String(body.transaction_status),
    });

    res.status(200).json({
      success: true,
      data: {
        status: 'ok',
        orderCode: body.order_id,
        settled: result.settled,
      },
    });
  }),
);
