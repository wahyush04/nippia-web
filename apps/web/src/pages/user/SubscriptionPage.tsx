import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Crown,
  ExternalLink,
  MessageCircle,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Ticket,
  Wallet,
  XCircle,
} from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { webEnv } from '../../lib/env';
import { useAuthStore } from '../../stores/authStore';
import { AppLayout } from '../../components/layout/AppLayout';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  LoadingState,
  Modal,
  Textarea,
} from '../../components/ui';
import { ProBadge } from '../../components/ui/ProBadge';

declare global {
  interface Window {
    snap?: {
      pay: (
        snapToken: string,
        callbacks?: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        },
      ) => void;
    };
  }
}

interface PlanItem {
  id: string;
  code: string;
  name: string;
  description: string;
  priceIdr: number;
  originalIdr: number | null;
  durationDays: number;
  features: string[];
  isPopular: boolean;
}

interface OrderItem {
  id: string;
  orderCode: string;
  amountIdr: number;
  paymentMethod: string;
  status: 'PENDING' | 'PAID' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';
  snapToken?: string | null;
  snapRedirectUrl?: string | null;
  gatewayStatus?: string | null;
  paymentProofNote: string | null;
  rejectionReason: string | null;
  paidAt: string | null;
  createdAt: string;
  plan: { name: string; code: string; durationDays: number };
}

interface SubscriptionMePayload {
  isPro: boolean;
  isAdmin: boolean;
  tier: 'FREE' | 'PRO';
  proPriceIdr: number;
  subscription: {
    id: string;
    planCode: string;
    planName: string;
    status: string;
    startedAt: string;
    expiresAt: string;
    daysRemaining: number;
    source: string;
  } | null;
  limits: {
    CAMPAIGN_MAX_UNIT: number;
    DAILY_PRACTICE_SESSIONS_PER_DAY: number;
    MAX_QUESTIONS_PER_SESSION: number;
    MINI_CAT_LIFETIME_LIMIT: number;
    FLASHCARD_FREE_PER_SUBJECT: number;
    ERROR_NOTEBOOK_FREE_LIMIT: number;
  };
  usage: {
    todayPracticeSessionsUsed: number;
    miniCatUsed: number;
    fullCatUsed: number;
    activeErrorNotes: number;
  };
  orders: OrderItem[];
}

interface MidtransPublicConfig {
  enabled: boolean;
  isProduction: boolean;
  clientKey: string | null;
  snapScriptUrl: string;
}

const COMPARISON_ROWS = [
  {
    feature: 'Campaign Belajar Harian',
    free: 'Unit 1–2 per jalur (6 unit / 60 soal) + bintang & XP; Unit 3+ terkunci',
    pro: 'Seluruh 41 Unit (TWK 9, TIU 19, TKP 13 = 410+ soal) + Milestone & bonus XP',
  },
  {
    feature: 'Latihan Harian & 24 Topik',
    free: 'Maks. 1 sesi/hari (maks. 10 soal), acak standar (MIXED), Mode Belajar',
    pro: 'Tanpa batas 420+ soal termasuk Figural Visual, filter HARD/MEDIUM, Mode EXAM, soal salah',
  },
  {
    feature: 'Simulasi CAT SKD',
    free: '1× kuota Simulasi CAT Mini (30 soal) sebagai baseline awal',
    pro: 'Simulasi CAT Penuh 110 soal unlimited + riwayat perkembangan + Disabilitas 130 menit',
  },
  {
    feature: 'Nippia Live Akbar',
    free: 'Bebas ikut seluruh event bertipe Gratis (ruang tunggu, leaderboard, sertifikat)',
    pro: 'Otomatis gratis ikut semua event Live Akbar Premium/Pro tanpa bayar per event',
  },
  {
    feature: 'Kartu Hafalan 3D & Pusat Materi',
    free: '15 Kartu Hafalan dasar (5 per subtes) & Paket 1 Pusat Materi (6 modul inti)',
    pro: 'Seluruh 45 Kartu Hafalan 3D (24 topik) & semua 18 Modul Pusat Materi (Paket 1–3)',
  },
  {
    feature: 'Buku Kesalahan & Spaced Repetition',
    free: 'Menyimpan & melihat hingga 5 catatan kesalahan aktif terakhir',
    pro: 'Kapasitas tanpa batas + tombol "Latih Ulang Soal Salah" otomatis (H+1, H+3, H+7, H+14)',
  },
  {
    feature: 'Jadwal 14 Hari & Analitik Kelemahan',
    free: 'Ringkasan skor subtes dasar & pratinjau analitik',
    pro: 'Generator Jadwal Belajar 14 Hari & Peta Penguasaan 24 Topik penuh',
  },
  {
    feature: 'Identitas Akun & Komunitas',
    free: 'Login Google/Email + Binding Akun, Streak, Lencana, Peringkat, Report Soal',
    pro: 'Semua fitur komunitas + Badge eksklusif PRO di Profil, Sidebar, dan Papan Peringkat',
  },
];

const MANUAL_BANK_NAME = 'BCA';
const MANUAL_BANK_ACCOUNT = '6000125057';
const MANUAL_BANK_HOLDER = 'WAHYU SYARIF HIDAYATULLAH';
const MANUAL_WA_DISPLAY = '085737275048';
const MANUAL_WA_E164 = '6285737275048';

function formatIdr(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function buildManualWaUrl(params: {
  orderCode?: string;
  planName: string;
  amountIdr: number;
  userEmail?: string | null;
  note?: string | null;
}) {
  const lines = [
    'Halo Admin Nippia, saya ingin konfirmasi pembayaran Nippia Pro (Transfer Bank BCA):',
    params.orderCode ? `• Kode Order: ${params.orderCode}` : '• Status: Akan membuat/sudah membuat order',
    params.userEmail ? `• Email Akun: ${params.userEmail}` : null,
    `• Paket: ${params.planName}`,
    `• Nominal Transfer: ${formatIdr(params.amountIdr)}`,
    `• Tujuan Transfer: BCA ${MANUAL_BANK_ACCOUNT} a.n. ${MANUAL_BANK_HOLDER}`,
    params.note ? `• Catatan Pengirim: ${params.note}` : null,
    'Mohon bantuannya untuk verifikasi dan aktivasi Nippia Pro. Terima kasih!',
  ].filter(Boolean);
  return `https://wa.me/${MANUAL_WA_E164}?text=${encodeURIComponent(lines.join('\n'))}`;
}

function loadMidtransSnapScript(scriptUrl: string, clientKey: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.snap) return Promise.resolve();

  const existing = document.querySelector<HTMLScriptElement>('script[data-midtrans-snap="true"]');
  if (existing) {
    return new Promise((resolve, reject) => {
      if (window.snap) {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Gagal memuat Midtrans Snap.js')));
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.setAttribute('data-client-key', clientKey);
    script.setAttribute('data-midtrans-snap', 'true');
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Gagal memuat skrip Midtrans Snap.js'));
    document.body.appendChild(script);
  });
}

export function SubscriptionPage() {
  const { user, fetchMe } = useAuthStore();
  const qc = useQueryClient();
  const [searchParams] = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<
    'MIDTRANS_SNAP' | 'QRIS' | 'VIRTUAL_ACCOUNT' | 'EWALLET' | 'TRANSFER_MANUAL'
  >('MIDTRANS_SNAP');
  const [proofNote, setProofNote] = useState('');
  const [copiedRek, setCopiedRek] = useState(false);
  const [voucherInput, setVoucherInput] = useState(searchParams.get('voucher')?.toUpperCase() || '');
  const [appliedVoucher, setAppliedVoucher] = useState<{
    voucherCode: string;
    ownerName: string;
    originalPriceIdr: number;
    discountIdr: number;
    finalAmountIdr: number;
  } | null>(null);
  const [voucherErr, setVoucherErr] = useState<string | null>(null);
  const [validatingVoucher, setValidatingVoucher] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string; waUrl?: string } | null>(null);
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);

  const { data: gatewayConfig } = useQuery({
    queryKey: ['subscription-gateway-config'],
    queryFn: () => apiFetch<{ midtrans: MidtransPublicConfig }>('/subscriptions/config'),
  });

  const { data: plans, isLoading: loadingPlans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => apiFetch<PlanItem[]>('/subscriptions/plans'),
  });

  const { data: subInfo, isLoading: loadingMe, refetch } = useQuery({
    queryKey: ['subscription-me'],
    queryFn: () => apiFetch<SubscriptionMePayload>('/subscriptions/me'),
  });

  const midtrans = gatewayConfig?.midtrans;

  // Preload Midtrans Snap.js whenever configured
  useEffect(() => {
    if (midtrans?.enabled && midtrans.clientKey) {
      loadMidtransSnapScript(midtrans.snapScriptUrl, midtrans.clientKey).catch(() => {});
    }
  }, [midtrans?.enabled, midtrans?.clientKey, midtrans?.snapScriptUrl]);

  // Default to Midtrans Snap if configured, otherwise local mode (dev) or Transfer Manual (prod)
  useEffect(() => {
    if (midtrans && !midtrans.enabled && paymentMethod === 'MIDTRANS_SNAP') {
      setPaymentMethod(webEnv.enableDemoLogin ? 'QRIS' : 'TRANSFER_MANUAL');
    }
  }, [midtrans, paymentMethod]);

  const invalidateSubscriptionCaches = async () => {
    await Promise.all([fetchMe(), refetch()]);
    qc.invalidateQueries({ queryKey: ['daily-campaign'] });
    qc.invalidateQueries({ queryKey: ['flashcards'] });
    qc.invalidateQueries({ queryKey: ['study-materials'] });
  };

  const handleSyncMidtrans = async (orderId: string, silentPending = false) => {
    setBusyOrderId(orderId);
    try {
      const res = await apiFetch<{
        order: OrderItem;
        settled: boolean;
        notStartedYet?: boolean;
      }>(`/subscriptions/orders/${orderId}/sync-midtrans`, { method: 'POST' });
      await invalidateSubscriptionCaches();
      if (res.settled) {
        setFeedback({
          type: 'ok',
          text: `Pembayaran Midtrans untuk order ${res.order.orderCode} berhasil diverifikasi! Nippia Pro kini aktif.`,
        });
      } else if (!silentPending) {
        setFeedback({
          type: 'err',
          text: res.notStartedYet
            ? `Order ${res.order?.orderCode ?? ''} menunggu Anda memilih metode & menyelesaikan pembayaran di popup Midtrans.`
            : `Status Midtrans order ${res.order?.orderCode ?? ''}: ${res.order?.gatewayStatus || res.order?.status}.`,
        });
      }
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Gagal menyinkronkan status Midtrans.',
      });
    } finally {
      setBusyOrderId(null);
    }
  };

  // Auto-sync if redirected back from Midtrans finish URL (?order=NIP-...)
  useEffect(() => {
    const returnedOrderCode = searchParams.get('order');
    if (!returnedOrderCode || !subInfo?.orders) return;
    const match = subInfo.orders.find(
      (o) => o.orderCode === returnedOrderCode && o.status === 'PENDING' && o.snapToken,
    );
    if (match) {
      handleSyncMidtrans(match.id, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, subInfo?.orders?.length]);

  const openSnapPopup = async (
    orderId: string,
    orderCode: string,
    snapToken: string,
    redirectUrl?: string | null,
  ) => {
    try {
      if (midtrans?.clientKey) {
        await loadMidtransSnapScript(midtrans.snapScriptUrl, midtrans.clientKey);
      }
      if (window.snap) {
        window.snap.pay(snapToken, {
          onSuccess: async () => {
            await handleSyncMidtrans(orderId, false);
          },
          onPending: async () => {
            await handleSyncMidtrans(orderId, true);
            setFeedback({
              type: 'ok',
              text: `Instruksi pembayaran Midtrans untuk ${orderCode} dibuat. Selesaikan pembayaran lalu klik "Cek Status Midtrans" bila belum aktif otomatis.`,
            });
          },
          onError: () => {
            setFeedback({
              type: 'err',
              text: 'Pembayaran Midtrans gagal atau dibatalkan. Anda dapat mencoba ulang dari Riwayat Transaksi.',
            });
          },
          onClose: () => {
            refetch();
          },
        });
        return;
      }
    } catch {
      // Fallback to hosted redirect URL if Snap.js script failed to load
    }
    if (redirectUrl) {
      window.open(redirectUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleValidateVoucher = async (planCodeOverride?: string) => {
    const planCode = planCodeOverride || selectedPlan?.code;
    if (!planCode || !voucherInput.trim()) {
      setAppliedVoucher(null);
      setVoucherErr(null);
      return;
    }
    setValidatingVoucher(true);
    setVoucherErr(null);
    try {
      const res = await apiFetch<{
        voucherCode: string;
        ownerName: string;
        originalPriceIdr: number;
        discountIdr: number;
        finalAmountIdr: number;
      }>('/subscriptions/vouchers/validate', {
        method: 'POST',
        body: JSON.stringify({ code: voucherInput.trim(), planCode }),
      });
      setAppliedVoucher(res);
    } catch (err) {
      setAppliedVoucher(null);
      setVoucherErr(err instanceof Error ? err.message : 'Kode voucher tidak valid.');
    } finally {
      setValidatingVoucher(false);
    }
  };

  const handleCheckout = async (instantActivate: boolean) => {
    if (!selectedPlan) return;
    setSubmittingOrder(true);
    setFeedback(null);
    try {
      const res = await apiFetch<{
        activated: boolean;
        order: OrderItem;
        snapToken?: string;
        snapRedirectUrl?: string | null;
      }>('/subscriptions/orders', {
        method: 'POST',
        body: JSON.stringify({
          planCode: selectedPlan.code,
          paymentMethod,
          voucherCode: appliedVoucher?.voucherCode || undefined,
          paymentProofNote: proofNote.trim() || undefined,
          instantActivate,
        }),
      });

      const submittedProof = proofNote.trim();
      setSelectedPlan(null);
      setProofNote('');
      setAppliedVoucher(null);
      setVoucherErr(null);
      await invalidateSubscriptionCaches();

      if (paymentMethod === 'MIDTRANS_SNAP' && res.snapToken) {
        await openSnapPopup(res.order.id, res.order.orderCode, res.snapToken, res.snapRedirectUrl);
        return;
      }

      const waUrl =
        !res.activated
          ? buildManualWaUrl({
              orderCode: res.order.orderCode,
              planName: selectedPlan.name,
              amountIdr: res.order.amountIdr,
              userEmail: user?.email,
              note: submittedProof || null,
            })
          : undefined;

      setFeedback({
        type: 'ok',
        text: res.activated
          ? `Pembayaran berhasil! Paket ${selectedPlan.name} (${res.order.orderCode}) langsung aktif di akun Anda.`
          : `Order ${res.order.orderCode} dibuat (${formatIdr(res.order.amountIdr)}). Silakan transfer ke BCA ${MANUAL_BANK_ACCOUNT} a.n. ${MANUAL_BANK_HOLDER} lalu konfirmasi via WhatsApp ${MANUAL_WA_DISPLAY}.`,
        waUrl,
      });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Gagal membuat order langganan.',
      });
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleConfirmPendingInstant = async (orderId: string) => {
    setBusyOrderId(orderId);
    setFeedback(null);
    try {
      const res = await apiFetch<{ activated: boolean; order: OrderItem }>(
        `/subscriptions/orders/${orderId}/confirm-payment`,
        {
          method: 'POST',
          body: JSON.stringify({ instantActivate: true }),
        },
      );
      await invalidateSubscriptionCaches();
      if (res.activated) {
        setFeedback({
          type: 'ok',
          text: `Pembayaran order ${res.order.orderCode} terkonfirmasi! Akun Nippia Pro Anda kini aktif.`,
        });
      }
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Gagal mengonfirmasi pembayaran.',
      });
    } finally {
      setBusyOrderId(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    await apiFetch(`/subscriptions/orders/${orderId}/cancel`, { method: 'POST' });
    await refetch();
  };

  if (loadingPlans || loadingMe) {
    return (
      <AppLayout>
        <LoadingState label="Memuat paket langganan Nippia Pro..." />
      </AppLayout>
    );
  }

  const isPro = Boolean(subInfo?.isPro);

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Hero Header */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-md">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <ProBadge />
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-0.5 text-xs font-medium text-indigo-200">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Investasi Cerdas Lolos SKD CPNS
                </span>
                {midtrans?.enabled && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-200">
                    <ShieldCheck className="h-3 w-3" /> Midtrans {midtrans.isProduction ? 'Live' : 'Sandbox'} Aktif
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {isPro
                  ? 'Akun Anda Sudah Menggunakan Nippia Pro!'
                  : 'Upgrade ke Nippia Pro — Hanya Rp 29.000 / Bulan'}
              </h1>
              <p className="text-sm leading-relaxed text-slate-300">
                Buka seluruh 41 Unit Campaign, 420+ bank soal 24 Topik termasuk Figural Visual, Simulasi CAT 110 soal tanpa batas, Live Akbar Premium gratis, Jadwal 14 Hari, dan Spaced Repetition penuh.
              </p>
            </div>

            <div className="min-w-[260px] rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-200">
                Status Langganan Saat Ini
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-lg font-bold">{isPro ? 'NIPPIA PRO AKTIF' : 'PAKET FREE'}</span>
                {isPro && <ProBadge size="xs" />}
              </div>
              {subInfo?.subscription ? (
                <div className="mt-2 space-y-1 text-xs text-slate-200">
                  <p>{subInfo.subscription.planName}</p>
                  <p>
                    Berlaku hingga:{' '}
                    <strong>
                      {new Date(subInfo.subscription.expiresAt).toLocaleDateString('id-ID', {
                        dateStyle: 'long',
                      })}
                    </strong>
                  </p>
                  <p className="text-amber-300 font-semibold">
                    Sisa {subInfo.subscription.daysRemaining} hari aktif
                  </p>
                </div>
              ) : (
                <div className="mt-2 space-y-1 text-xs text-slate-300">
                  <p>
                    Latihan Harian hari ini:{' '}
                    <strong>
                      {subInfo?.usage.todayPracticeSessionsUsed ?? 0}/
                      {subInfo?.limits.DAILY_PRACTICE_SESSIONS_PER_DAY ?? 1} sesi
                    </strong>
                  </p>
                  <p>
                    Kuota Simulasi CAT Mini:{' '}
                    <strong>
                      {subInfo?.usage.miniCatUsed ?? 0}/{subInfo?.limits.MINI_CAT_LIFETIME_LIMIT ?? 1}×
                    </strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {feedback && (
          <div
            className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 text-sm font-medium ${
              feedback.type === 'ok'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : 'border-rose-200 bg-rose-50 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'ok' ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              ) : (
                <XCircle className="h-5 w-5 shrink-0 text-rose-600" />
              )}
              <span>{feedback.text}</span>
            </div>
            {feedback.waUrl && (
              <a href={feedback.waUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <MessageCircle className="h-4 w-4" /> Chat WhatsApp ({MANUAL_WA_DISPLAY})
                </Button>
              </a>
            )}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Free Tier Card */}
          <Card className="flex flex-col justify-between border-slate-200">
            <CardHeader>
              <Badge variant="neutral" className="w-fit">Paket Dasar</Badge>
              <CardTitle className="mt-2 text-xl">Paket Free</CardTitle>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900">Rp 0</span>
                <span className="text-xs text-slate-500">/ selamanya</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Cocok untuk mencoba ritme belajar SKD harian dan mengukur skor baseline awal Anda.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  Campaign Unit 1–2 per jalur (6 unit / 60 soal)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  1 sesi latihan/hari (maks. 10 soal, MIXED, Mode Belajar)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  1× Simulasi CAT Mini 30 Soal gratis
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  Semua Live Akbar Gratis, 15 Flashcard, Paket 1 Materi
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  Hingga 5 catatan Buku Kesalahan aktif & Fitur Komunitas
                </li>
              </ul>
              <Button variant="outline" className="w-full" disabled>
                {isPro ? 'Paket Dasar' : 'Paket Aktif Saat Ini'}
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plans from Database */}
          {(plans || []).map((plan) => (
            <Card
              key={plan.id}
              className={`flex flex-col justify-between relative ${
                plan.isPopular
                  ? 'border-2 border-indigo-600 ring-4 ring-indigo-500/10 shadow-md'
                  : 'border-slate-200'
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <ProBadge label={plan.isPopular ? 'PALING POPULER' : 'HEMAT'} />
                  <span className="text-xs font-semibold text-indigo-700">{plan.durationDays} Hari</span>
                </div>
                <CardTitle className="mt-2 text-xl">{plan.name}</CardTitle>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {formatIdr(plan.priceIdr)}
                  </span>
                  {plan.originalIdr && plan.originalIdr > plan.priceIdr && (
                    <span className="text-sm text-slate-400 line-through">
                      {formatIdr(plan.originalIdr)}
                    </span>
                  )}
                  <span className="text-xs text-slate-500">
                    / {plan.durationDays === 30 ? 'bulan' : `${plan.durationDays} hari`}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-600">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2 text-xs text-slate-700">
                  {(Array.isArray(plan.features) ? plan.features : []).map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-600" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.isPopular ? 'indigo' : 'primary'}
                  className="w-full"
                  onClick={() => {
                    setSelectedPlan(plan);
                    setPaymentMethod(midtrans?.enabled ? 'MIDTRANS_SNAP' : 'QRIS');
                    if (voucherInput.trim()) {
                      handleValidateVoucher(plan.code);
                    }
                  }}
                >
                  <Crown className="h-4 w-4" />
                  {isPro ? 'Perpanjang Masa Aktif' : 'Pilih Paket Ini'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Full Feature Matrix Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              Perbandingan Lengkap Paket Free vs Nippia Pro
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-left text-xs sm:text-sm border-t border-slate-100">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Area Fitur</th>
                  <th className="px-5 py-3.5 font-bold">Paket Free (Rp 0)</th>
                  <th className="px-5 py-3.5 font-bold text-indigo-900 bg-indigo-50/70">
                    <span className="inline-flex items-center gap-1.5">
                      Nippia Pro (Rp 29.000/bln) <ProBadge size="xs" />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{row.feature}</td>
                    <td className="px-5 py-3.5 text-slate-600">{row.free}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-900 bg-indigo-50/30">{row.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Order History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Riwayat Transaksi & Aktivasi Langganan</CardTitle>
          </CardHeader>
          <CardContent>
            {!subInfo?.orders || subInfo.orders.length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada riwayat transaksi langganan.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="py-2.5 pr-4 font-semibold">Kode Order</th>
                      <th className="py-2.5 pr-4 font-semibold">Paket</th>
                      <th className="py-2.5 pr-4 font-semibold">Nominal</th>
                      <th className="py-2.5 pr-4 font-semibold">Metode</th>
                      <th className="py-2.5 pr-4 font-semibold">Status</th>
                      <th className="py-2.5 text-right font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subInfo.orders.map((ord) => (
                      <tr key={ord.id}>
                        <td className="py-3 pr-4 font-mono text-xs font-semibold text-slate-800">
                          {ord.orderCode}
                        </td>
                        <td className="py-3 pr-4 text-slate-800">{ord.plan.name}</td>
                        <td className="py-3 pr-4 font-semibold text-slate-900">
                          {formatIdr(ord.amountIdr)}
                        </td>
                        <td className="py-3 pr-4 text-slate-600">{ord.paymentMethod}</td>
                        <td className="py-3 pr-4">
                          <Badge
                            variant={
                              ord.status === 'PAID'
                                ? 'success'
                                : ord.status === 'PENDING'
                                  ? 'warning'
                                  : ord.status === 'REJECTED'
                                    ? 'danger'
                                    : 'neutral'
                            }
                          >
                            {ord.status}
                          </Badge>
                          {ord.rejectionReason && (
                            <p className="mt-1 text-[11px] text-rose-600">{ord.rejectionReason}</p>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          {ord.status === 'PENDING' && (
                            <div className="flex flex-wrap justify-end gap-1.5">
                              {ord.snapToken ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="indigo"
                                    onClick={() =>
                                      openSnapPopup(
                                        ord.id,
                                        ord.orderCode,
                                        ord.snapToken!,
                                        ord.snapRedirectUrl,
                                      )
                                    }
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" /> Bayar (Snap)
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    isLoading={busyOrderId === ord.id}
                                    onClick={() => handleSyncMidtrans(ord.id)}
                                  >
                                    <RefreshCw className="h-3.5 w-3.5" /> Cek Status
                                  </Button>
                                </>
                              ) : ord.paymentMethod === 'TRANSFER_MANUAL' || !webEnv.enableDemoLogin ? (
                                <a
                                  href={buildManualWaUrl({
                                    orderCode: ord.orderCode,
                                    planName: ord.plan.name,
                                    amountIdr: ord.amountIdr,
                                    userEmail: user?.email,
                                    note: ord.paymentProofNote,
                                  })}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                    <MessageCircle className="h-3.5 w-3.5" /> Konfirmasi WA
                                  </Button>
                                </a>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="indigo"
                                  isLoading={busyOrderId === ord.id}
                                  onClick={() => handleConfirmPendingInstant(ord.id)}
                                >
                                  Bayar & Aktifkan
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelOrder(ord.id)}
                              >
                                Batalkan
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Checkout Modal */}
      <Modal
        open={Boolean(selectedPlan)}
        onClose={() => setSelectedPlan(null)}
        title={selectedPlan ? `Checkout ${selectedPlan.name}` : 'Checkout Nippia Pro'}
      >
        {selectedPlan && (() => {
          const payableAmount = appliedVoucher ? appliedVoucher.finalAmountIdr : selectedPlan.priceIdr;
          return (
          <div className="space-y-4">
            <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">{selectedPlan.name}</p>
                  <p className="text-xs text-slate-600">Masa aktif {selectedPlan.durationDays} hari</p>
                </div>
                <div className="text-right">
                  {appliedVoucher && (
                    <p className="text-xs text-slate-400 line-through">
                      {formatIdr(selectedPlan.priceIdr)}
                    </p>
                  )}
                  <p className="text-xl font-extrabold text-indigo-700">
                    {formatIdr(payableAmount)}
                  </p>
                </div>
              </div>
              {appliedVoucher && (
                <div className="flex items-center justify-between border-t border-indigo-200/80 pt-2 text-xs text-emerald-800 font-semibold">
                  <span className="flex items-center gap-1">
                    <Ticket className="h-3.5 w-3.5" /> Voucher {appliedVoucher.voucherCode}
                  </span>
                  <span>-{formatIdr(appliedVoucher.discountIdr)}</span>
                </div>
              )}
            </div>

            {/* Voucher Input */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-700">Punya Kode Voucher? (Potongan Rp 4.000 pengguna baru)</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Masukkan kode voucher (cth: NIPPIA4K)"
                  value={voucherInput}
                  onChange={(e) => {
                    setVoucherInput(e.target.value.toUpperCase());
                    if (appliedVoucher) setAppliedVoucher(null);
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  isLoading={validatingVoucher}
                  onClick={() => handleValidateVoucher()}
                >
                  Terapkan
                </Button>
              </div>
              {voucherErr && <p className="text-xs font-medium text-rose-600">{voucherErr}</p>}
              {appliedVoucher && (
                <p className="text-xs font-medium text-emerald-700">
                  Kode voucher valid! Anda hemat {formatIdr(appliedVoucher.discountIdr)}.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-700">Pilih Metode Pembayaran</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {midtrans?.enabled && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('MIDTRANS_SNAP')}
                    className={`sm:col-span-2 flex items-center justify-between gap-2 rounded-xl border p-3 text-left text-xs font-semibold cursor-pointer ${
                      paymentMethod === 'MIDTRANS_SNAP'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-500/30'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-indigo-600" />
                      <span>
                        Midtrans Online Checkout (QRIS, GoPay, OVO, DANA, ShopeePay, VA Bank)
                      </span>
                    </span>
                    <Badge variant="indigo">Rekomendasi</Badge>
                  </button>
                )}

                {!midtrans?.enabled &&
                  webEnv.enableDemoLogin &&
                  [
                    { id: 'QRIS' as const, label: 'QRIS (Simulasi Lokal Dev)', icon: QrCode },
                    { id: 'EWALLET' as const, label: 'E-Wallet (Simulasi Lokal Dev)', icon: Wallet },
                    { id: 'VIRTUAL_ACCOUNT' as const, label: 'VA Bank (Simulasi Lokal Dev)', icon: CreditCard },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`flex items-center gap-2 rounded-xl border p-3 text-left text-xs font-semibold cursor-pointer ${
                          paymentMethod === m.id
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-indigo-600" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}

                <button
                  type="button"
                  onClick={() => setPaymentMethod('TRANSFER_MANUAL')}
                  className={`flex items-center gap-2 rounded-xl border p-3 text-left text-xs font-semibold cursor-pointer ${
                    paymentMethod === 'TRANSFER_MANUAL'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Clock className="h-4 w-4 shrink-0 text-indigo-600" />
                  <span>Transfer Manual (Verifikasi Admin)</span>
                </button>
              </div>
            </div>

            {paymentMethod === 'MIDTRANS_SNAP' ? (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-3.5 text-xs text-indigo-950 space-y-1">
                <p className="font-semibold">
                  Pembayaran Otomatis via Midtrans ({midtrans?.isProduction ? 'Production' : 'Sandbox'})
                </p>
                <p>
                  Setelah klik tombol bayar, popup resmi Midtrans Snap akan terbuka. Begitu pembayaran selesai, status Nippia Pro otomatis aktif.
                </p>
              </div>
            ) : paymentMethod === 'TRANSFER_MANUAL' ? (
              <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-950">
                <p className="font-semibold">Instruksi Transfer Manual:</p>
                <p>
                  Transfer sebesar <strong>{formatIdr(payableAmount)}</strong> ke rekening berikut:
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-300/80 bg-white px-3 py-2">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500">BANK {MANUAL_BANK_NAME}</p>
                    <p className="font-mono text-sm font-extrabold text-slate-900">{MANUAL_BANK_ACCOUNT}</p>
                    <p className="text-[11px] font-semibold text-slate-700">a.n. {MANUAL_BANK_HOLDER}</p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(MANUAL_BANK_ACCOUNT);
                      setCopiedRek(true);
                      setTimeout(() => setCopiedRek(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <Copy className="h-3 w-3" /> {copiedRek ? 'Tersalin ✓' : 'Salin No. Rek'}
                  </button>
                </div>
                <Textarea
                  rows={2}
                  placeholder="Contoh: Transfer dari BCA a.n. Budi Santoso tgl 27 Nov pukul 17:10"
                  value={proofNote}
                  onChange={(e) => setProofNote(e.target.value)}
                />
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50/90 px-3 py-2 text-emerald-950">
                  <span>
                    Setelah kirim bukti &amp; buat order, konfirmasi juga ke WhatsApp{' '}
                    <strong>{MANUAL_WA_DISPLAY}</strong>.
                  </span>
                  <a
                    href={buildManualWaUrl({
                      planName: selectedPlan.name,
                      amountIdr: payableAmount,
                      userEmail: user?.email,
                      note: proofNote.trim() || null,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Chat WA {MANUAL_WA_DISPLAY}
                  </a>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-950 space-y-1">
                <p className="font-semibold">Mode Pembayaran Instan Lokal (Development)</p>
                <p>
                  Hanya aktif pada environment development untuk pengujian lokal tanpa kredensial Midtrans.
                </p>
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setSelectedPlan(null)}>
                Tutup
              </Button>
              {paymentMethod === 'MIDTRANS_SNAP' ? (
                <Button
                  variant="indigo"
                  isLoading={submittingOrder}
                  onClick={() => handleCheckout(false)}
                >
                  <Crown className="h-4 w-4" />
                  Bayar {formatIdr(payableAmount)} via Midtrans
                </Button>
              ) : paymentMethod === 'TRANSFER_MANUAL' || !webEnv.enableDemoLogin ? (
                <Button
                  variant="indigo"
                  isLoading={submittingOrder}
                  onClick={() => handleCheckout(false)}
                >
                  Kirim Bukti & Buat Order Pending
                </Button>
              ) : (
                <Button
                  variant="indigo"
                  isLoading={submittingOrder}
                  onClick={() => handleCheckout(true)}
                >
                  <Crown className="h-4 w-4" />
                  Simulasi Bayar {formatIdr(payableAmount)} & Aktifkan Pro
                </Button>
              )}
            </div>
          </div>
          );
        })()}
      </Modal>
    </AppLayout>
  );
}
