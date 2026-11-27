import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  Copy,
  Gift,
  Link2,
  Sparkles,
  Ticket,
  Users,
  Wallet,
} from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { AppLayout } from '../../components/layout/AppLayout';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  LoadingState,
} from '../../components/ui';

interface PartnerDashboardPayload {
  voucher: {
    id: string;
    code: string;
    discountIdr: number;
    commissionIdr: number;
    newUsersOnly: boolean;
    isActive: boolean;
    createdAt: string;
  };
  summary: {
    totalRedemptions: number;
    totalEarnedIdr: number;
    readyToPayoutIdr: number;
    paidOutIdr: number;
  };
  commissions: Array<{
    id: string;
    orderCode: string;
    planName: string;
    buyerLabel: string;
    buyerEmailMasked: string;
    orderAmountIdr: number;
    discountGivenIdr: number;
    commissionIdr: number;
    status: 'EARNED' | 'PAID_OUT' | 'CANCELLED';
    payoutNote: string | null;
    paidOutAt: string | null;
    createdAt: string;
  }>;
}

function formatIdr(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PartnerVoucherPage() {
  const [codeDraft, setCodeDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['partner-dashboard'],
    queryFn: () => apiFetch<PartnerDashboardPayload>('/partner/me'),
  });

  useEffect(() => {
    if (data?.voucher.code) {
      setCodeDraft(data.voucher.code);
    }
  }, [data?.voucher.code]);

  const handleSaveVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const updated = await apiFetch<{ code: string }>('/partner/voucher', {
        method: 'PATCH',
        body: JSON.stringify({ code: codeDraft.trim().toUpperCase() }),
      });
      await refetch();
      setFeedback({
        type: 'ok',
        text: `Kode voucher Anda berhasil diperbarui menjadi "${updated.code}".`,
      });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Gagal memperbarui kode voucher.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    if (!data) return;
    setSaving(true);
    setFeedback(null);
    try {
      await apiFetch('/partner/voucher', {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !data.voucher.isActive }),
      });
      await refetch();
    } finally {
      setSaving(false);
    }
  };

  const copyText = async (text: string, type: 'code' | 'link') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (isLoading || !data) {
    return (
      <AppLayout>
        <LoadingState label="Memuat panel voucher & komisi..." />
      </AppLayout>
    );
  }

  const shareUrl = `${window.location.origin}/subscription?voucher=${encodeURIComponent(data.voucher.code)}`;

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Hero Header */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-md">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-xl space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-amber-400/20 text-amber-200 border-amber-400/30">
                  <Ticket className="h-3.5 w-3.5" /> Panel Voucher & Komisi Partner
                </Badge>
                <Badge className={data.voucher.isActive ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30' : 'bg-rose-500/20 text-rose-200 border-rose-400/30'}>
                  {data.voucher.isActive ? 'Voucher Aktif' : 'Nonaktif'}
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Bagikan Kode Voucher, Raih Komisi Rp 5.000/User!
              </h1>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
                Setiap pengguna baru yang berlangganan Nippia Pro pertama kali menggunakan kode voucher Anda akan mendapat{' '}
                <strong className="text-white">potongan harga {formatIdr(data.voucher.discountIdr)}</strong>, dan Anda langsung memperoleh{' '}
                <strong className="text-amber-300">komisi {formatIdr(data.voucher.commissionIdr)}</strong> per transaksi lunas.
              </p>
            </div>

            <div className="min-w-[260px] rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xs space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-200">
                Kode Voucher Khusus Anda
              </p>
              <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-950/60 px-4 py-2.5 border border-white/10">
                <span className="font-mono text-xl font-extrabold tracking-widest text-amber-300">
                  {data.voucher.code}
                </span>
                <button
                  type="button"
                  onClick={() => copyText(data.voucher.code, 'code')}
                  className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-white hover:bg-white/20 cursor-pointer"
                >
                  {copied === 'code' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied === 'code' ? 'Disalin' : 'Salin'}
                </button>
              </div>
              <button
                type="button"
                onClick={() => copyText(shareUrl, 'link')}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500 cursor-pointer"
              >
                <Link2 className="h-3.5 w-3.5" />
                {copied === 'link' ? 'Link Checkout Disalin ✓' : 'Salin Link Langganan Ber-Voucher'}
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-indigo-600" /> Pengguna Baru Memakai
              </p>
              <p className="mt-1.5 text-2xl font-extrabold text-slate-900">
                {data.summary.totalRedemptions} orang
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Total Komisi Terkumpul
              </p>
              <p className="mt-1.5 text-2xl font-extrabold text-indigo-700">
                {formatIdr(data.summary.totalEarnedIdr)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5 text-emerald-600" /> Saldo Komisi Siap Cair
              </p>
              <p className="mt-1.5 text-2xl font-extrabold text-emerald-700">
                {formatIdr(data.summary.readyToPayoutIdr)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <Gift className="h-3.5 w-3.5 text-slate-600" /> Sudah Dicairkan
              </p>
              <p className="mt-1.5 text-2xl font-extrabold text-slate-800">
                {formatIdr(data.summary.paidOutIdr)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Customize Voucher Code */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pengaturan Kode Voucher</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {feedback && (
              <div
                className={`rounded-xl border px-4 py-2.5 text-xs font-medium ${
                  feedback.type === 'ok'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-rose-200 bg-rose-50 text-rose-800'
                }`}
              >
                {feedback.text}
              </div>
            )}
            <form onSubmit={handleSaveVoucher} className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[220px]">
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Ubah Kode Voucher (4–20 karakter huruf/angka)
                </label>
                <Input
                  value={codeDraft}
                  onChange={(e) => setCodeDraft(e.target.value.toUpperCase())}
                  placeholder="Contoh: SKDBUDI4K"
                />
              </div>
              <Button type="submit" variant="indigo" isLoading={saving}>
                Simpan Kode Voucher
              </Button>
              <Button
                type="button"
                variant={data.voucher.isActive ? 'outline' : 'secondary'}
                disabled={saving}
                onClick={handleToggleActive}
              >
                {data.voucher.isActive ? 'Nonaktifkan Sementara' : 'Aktifkan Kembali'}
              </Button>
            </form>
            <p className="text-xs text-slate-500">
              Skema aktif: Diskon pembeli baru <strong>{formatIdr(data.voucher.discountIdr)}</strong> • Komisi Anda{' '}
              <strong>{formatIdr(data.voucher.commissionIdr)}</strong> per transaksi lunas.
            </p>
          </CardContent>
        </Card>

        {/* Commission History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Riwayat Komisi & Pemakaian Voucher</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {data.commissions.length === 0 ? (
              <EmptyState
                title="Belum ada komisi tercatat"
                description="Bagikan kode voucher atau link langganan Anda kepada calon peserta SKD untuk mulai mengumpulkan komisi."
              />
            ) : (
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="py-2.5 pr-4">Tanggal</th>
                    <th className="py-2.5 pr-4">Order</th>
                    <th className="py-2.5 pr-4">Pengguna Baru</th>
                    <th className="py-2.5 pr-4">Potongan</th>
                    <th className="py-2.5 pr-4">Komisi Anda</th>
                    <th className="py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.commissions.map((c) => (
                    <tr key={c.id}>
                      <td className="py-3 pr-4 text-xs text-slate-500">
                        {new Date(c.createdAt).toLocaleString('id-ID', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs font-semibold text-slate-800">
                        {c.orderCode}
                      </td>
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-slate-900">{c.buyerLabel}</p>
                        <p className="text-[11px] text-slate-500">{c.buyerEmailMasked}</p>
                      </td>
                      <td className="py-3 pr-4 text-slate-700">{formatIdr(c.discountGivenIdr)}</td>
                      <td className="py-3 pr-4 font-bold text-emerald-700">
                        +{formatIdr(c.commissionIdr)}
                      </td>
                      <td className="py-3">
                        <Badge variant={c.status === 'PAID_OUT' ? 'success' : 'indigo'}>
                          {c.status === 'PAID_OUT' ? 'Sudah Cair' : 'Terkumpul'}
                        </Badge>
                        {c.payoutNote && (
                          <p className="mt-1 text-[11px] text-slate-500">{c.payoutNote}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
