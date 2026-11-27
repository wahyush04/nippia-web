import crypto from 'crypto';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { markOrderPaidAndActivate } from './subscription.service.js';

export interface MidtransClientConfig {
  enabled: boolean;
  isProduction: boolean;
  clientKey: string | null;
  snapScriptUrl: string;
}

export function getMidtransEndpoints() {
  const isProd = env.midtransIsProduction;
  return {
    isProd,
    snapApiUrl: isProd
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions',
    coreApiBase: isProd
      ? 'https://api.midtrans.com'
      : 'https://api.sandbox.midtrans.com',
    snapScriptUrl: isProd
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js',
  };
}

export function getMidtransPublicConfig(): MidtransClientConfig {
  const { isProd, snapScriptUrl } = getMidtransEndpoints();
  const enabled = Boolean(env.midtransServerKey && env.midtransClientKey);
  return {
    enabled,
    isProduction: isProd,
    clientKey: enabled ? env.midtransClientKey : null,
    snapScriptUrl,
  };
}

function getMidtransAuthHeader(): string {
  if (!env.midtransServerKey) {
    throw new AppError(
      503,
      'Midtrans Server Key belum dikonfigurasi pada server (.env).',
      'MIDTRANS_NOT_CONFIGURED',
    );
  }
  const encoded = Buffer.from(`${env.midtransServerKey}:`).toString('base64');
  return `Basic ${encoded}`;
}

export async function createMidtransSnapTransaction(params: {
  orderCode: string;
  amountIdr: number;
  planCode: string;
  planName: string;
  customerName: string;
  customerEmail: string;
  finishUrl?: string;
}) {
  if (!env.midtransServerKey || !env.midtransClientKey) {
    throw new AppError(
      503,
      'Midtrans belum dikonfigurasi. Isi MIDTRANS_SERVER_KEY dan MIDTRANS_CLIENT_KEY di .env terlebih dahulu.',
      'MIDTRANS_NOT_CONFIGURED',
    );
  }

  const { snapApiUrl } = getMidtransEndpoints();
  const baseAppUrl = env.appUrl.replace(/\/$/, '');

  const payload = {
    transaction_details: {
      order_id: params.orderCode,
      gross_amount: Math.round(params.amountIdr),
    },
    item_details: [
      {
        id: params.planCode,
        price: Math.round(params.amountIdr),
        quantity: 1,
        name: params.planName.slice(0, 50),
      },
    ],
    customer_details: {
      first_name: params.customerName.slice(0, 50),
      email: params.customerEmail,
    },
    callbacks: {
      finish: params.finishUrl || `${baseAppUrl}/subscription?order=${encodeURIComponent(params.orderCode)}`,
    },
  };

  const resp = await fetch(snapApiUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: getMidtransAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  const body = (await resp.json().catch(() => ({}))) as {
    token?: string;
    redirect_url?: string;
    error_messages?: string[];
  };

  if (!resp.ok || !body.token) {
    const errDetail = body.error_messages?.join('; ') || `HTTP ${resp.status}`;
    throw new AppError(
      502,
      `Gagal membuat transaksi Midtrans Snap: ${errDetail}`,
      'MIDTRANS_API_ERROR',
    );
  }

  return {
    token: body.token,
    redirectUrl: body.redirect_url ?? null,
  };
}

export function verifyMidtransSignature(params: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
}): boolean {
  if (!env.midtransServerKey || !params.signatureKey) return false;
  const raw = `${params.orderId}${params.statusCode}${params.grossAmount}${env.midtransServerKey}`;
  const expected = crypto.createHash('sha512').update(raw).digest('hex');

  const expectedBuf = Buffer.from(expected, 'utf8');
  const incomingBuf = Buffer.from(params.signatureKey.trim().toLowerCase(), 'utf8');
  if (expectedBuf.length !== incomingBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, incomingBuf);
}

export interface MidtransNotificationPayload {
  order_id: string;
  transaction_id?: string;
  transaction_status: string;
  fraud_status?: string;
  payment_type?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
  [key: string]: unknown;
}

export async function applyMidtransNotification(payload: MidtransNotificationPayload) {
  const order = await prisma.subscriptionOrder.findUnique({
    where: { orderCode: payload.order_id },
    include: { plan: true },
  });
  if (!order) {
    throw new AppError(404, `Order ${payload.order_id} tidak ditemukan.`);
  }

  const txStatus = String(payload.transaction_status || '').toLowerCase();
  const fraudStatus = String(payload.fraud_status || '').toLowerCase();

  const isSettled =
    txStatus === 'settlement' ||
    (txStatus === 'capture' && (fraudStatus === 'accept' || fraudStatus === ''));

  const paymentLabel = payload.payment_type
    ? `MIDTRANS:${String(payload.payment_type).toUpperCase()}`
    : order.paymentMethod;

  if (isSettled) {
    await prisma.subscriptionOrder.update({
      where: { id: order.id },
      data: {
        paymentMethod: paymentLabel,
        gatewayTransactionId: payload.transaction_id ?? order.gatewayTransactionId,
        gatewayStatus: txStatus,
        gatewayRawPayload: payload as object,
      },
    });
    const updatedOrder = await markOrderPaidAndActivate({
      orderId: order.id,
      note: `Pembayaran Midtrans (${paymentLabel})`,
    });
    return { order: updatedOrder, settled: true };
  }

  if (txStatus === 'expire') {
    const expired = await prisma.subscriptionOrder.update({
      where: { id: order.id },
      data: {
        status: order.status === 'PAID' ? 'PAID' : 'EXPIRED',
        gatewayTransactionId: payload.transaction_id ?? order.gatewayTransactionId,
        gatewayStatus: txStatus,
        gatewayRawPayload: payload as object,
      },
      include: { plan: true },
    });
    return { order: expired, settled: false };
  }

  if (txStatus === 'cancel' || txStatus === 'deny') {
    const nextStatus = order.status === 'PAID' ? 'PAID' : txStatus === 'cancel' ? 'CANCELLED' : 'REJECTED';
    const failed = await prisma.subscriptionOrder.update({
      where: { id: order.id },
      data: {
        status: nextStatus,
        rejectionReason:
          order.status === 'PAID'
            ? order.rejectionReason
            : `Pembayaran ${txStatus === 'cancel' ? 'dibatalkan' : 'ditolak'} oleh Midtrans.`,
        gatewayTransactionId: payload.transaction_id ?? order.gatewayTransactionId,
        gatewayStatus: txStatus,
        gatewayRawPayload: payload as object,
      },
      include: { plan: true },
    });
    return { order: failed, settled: false };
  }

  // Pending or challenge
  const pending = await prisma.subscriptionOrder.update({
    where: { id: order.id },
    data: {
      paymentMethod: paymentLabel,
      gatewayTransactionId: payload.transaction_id ?? order.gatewayTransactionId,
      gatewayStatus: txStatus || 'pending',
      gatewayRawPayload: payload as object,
    },
    include: { plan: true },
  });
  return { order: pending, settled: false };
}

export async function syncOrderWithMidtransStatus(orderCode: string) {
  const { coreApiBase } = getMidtransEndpoints();
  const resp = await fetch(`${coreApiBase}/v2/${encodeURIComponent(orderCode)}/status`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: getMidtransAuthHeader(),
    },
  });

  const body = (await resp.json().catch(() => ({}))) as MidtransNotificationPayload & {
    status_message?: string;
  };

  if (!resp.ok || !body.transaction_status) {
    // 404 from Midtrans means user hasn't picked a payment method in Snap popup yet
    if (resp.status === 404 || body.status_code === '404') {
      const order = await prisma.subscriptionOrder.findUnique({
        where: { orderCode },
        include: { plan: true },
      });
      return { order, settled: false, notStartedYet: true };
    }
    throw new AppError(
      502,
      `Gagal mengecek status Midtrans: ${body.status_message || `HTTP ${resp.status}`}`,
      'MIDTRANS_STATUS_ERROR',
    );
  }

  return applyMidtransNotification({
    ...body,
    order_id: body.order_id || orderCode,
  });
}
