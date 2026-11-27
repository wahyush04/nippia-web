import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Award,
  BookMarked,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  Download,
  Lock,
  Search,
  Share2,
  Trophy,
  XCircle,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { SubjectCode } from '@nippia/shared';
import { apiFetch, ApiError } from '../../lib/api';
import { formatDurationReadable } from '../../lib/liveSocket';
import { AppLayout } from '../../components/layout/AppLayout';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, LoadingState } from '../../components/ui';
import { FiguralRenderer } from '../../components/skd/FiguralRenderer';
import { QuestionDiscussionPanel } from '../../components/skd/QuestionDiscussionPanel';
import { ReportQuestionButton } from '../../components/skd/ReportQuestionButton';

export function LiveEventResultPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const [nbMsg, setNbMsg] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['live-event-result', eventId],
    queryFn: () => apiFetch<Record<string, any>>(`/live-events/${eventId}/result`),
    enabled: Boolean(eventId),
  });

  const addNotebook = useMutation({
    mutationFn: () => apiFetch<{ addedCount: number }>(`/live-events/${eventId}/error-notebook`, { method: 'POST' }),
    onSuccess: (res) => setNbMsg(`${res.addedCount} soal yang perlu diperbaiki ditambahkan ke Buku Kesalahan.`),
    onError: (err) => setNbMsg(err instanceof ApiError ? err.message : 'Belum dapat menambahkan ke Buku Kesalahan.'),
  });

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingState label="Memuat hasil & analitik Live Akbar..." />
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout>
        <Card>
          <CardContent className="p-8 text-center space-y-3">
            <p className="text-base font-bold text-slate-900">Hasil Belum Tersedia</p>
            <p className="text-sm text-slate-600">
              {error instanceof ApiError ? error.message : 'Anda belum menyelesaikan ujian pada event ini.'}
            </p>
            <Link to={`/live-events/${eventId}`}>
              <Button variant="indigo">Kembali ke Event</Button>
            </Link>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const r = data.result;
  const stats = data.eventStats;
  const analytics = data.analytics;

  const subjectChartData = [
    { name: 'TWK', Anda: r.twkScore, RataRataEvent: stats.averageTwk },
    { name: 'TIU', Anda: r.tiuScore, RataRataEvent: stats.averageTiu },
    { name: 'TKP', Anda: r.tkpScore, RataRataEvent: stats.averageTkp },
  ];

  const handleShare = async () => {
    const summary = `Hasil Nippia Live Akbar — ${data.event.title}\nSkor Total: ${r.totalScore}/${r.maxScore} (TWK ${r.twkScore} | TIU ${r.tiuScore} | TKP ${r.tkpScore})\nPeringkat: #${r.ranking ?? '-'} dari ${stats.totalParticipants} peserta`;
    try {
      await navigator.clipboard.writeText(summary);
      setShareMsg('Ringkasan hasil disalin ke clipboard!');
    } catch {
      setShareMsg(summary);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Summary Banner */}
        <Card className="overflow-hidden border-indigo-200 print:border-slate-300">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 p-6 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Badge variant="indigo">Laporan Hasil Resmi Live Akbar</Badge>
                <h1 className="mt-2 text-2xl font-bold">{data.event.title}</h1>
                <p className="text-sm text-indigo-200">Peserta: {data.participantName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-indigo-300">Skor Total</p>
                <p className="text-4xl font-extrabold">
                  {r.totalScore} <span className="text-lg font-normal text-indigo-300">/ {r.maxScore}</span>
                </p>
                {r.overallPassed !== null && (
                  <Badge variant={r.overallPassed ? 'success' : 'warning'} className="mt-1">
                    {r.overallPassed ? 'Memenuhi Ambang Batas SKD' : 'Perlu Penguatan Ambang Batas'}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
              <div>
                <p className="text-xs text-slate-500">Peringkat Sementara/Resmi</p>
                <p className="text-lg font-bold text-slate-900">
                  #{r.ranking ?? '-'} <span className="text-xs font-normal text-slate-500">/ {stats.totalParticipants}</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Persentil</p>
                <p className="text-lg font-bold text-indigo-600">{r.percentile !== null ? `Top ${Math.max(0.1, 100 - r.percentile).toFixed(1)}%` : '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Rata-rata Event</p>
                <p className="text-lg font-bold text-slate-900">{stats.averageTotal}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Waktu Penyelesaian</p>
                <p className="text-lg font-bold text-slate-900">{formatDurationReadable(r.completionTimeSeconds)}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 print:hidden">
              {data.canReview && (
                <Link to={`/live-events/${eventId}/review`}>
                  <Button variant="indigo" size="sm">
                    <BookOpen className="h-4 w-4" /> Lihat Pembahasan
                  </Button>
                </Link>
              )}
              {data.event.leaderboardPublished && (
                <Link to={`/live-events/${eventId}/leaderboard`}>
                  <Button variant="primary" size="sm">
                    <Trophy className="h-4 w-4 text-amber-400" /> Papan Peringkat
                  </Button>
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Download className="h-4 w-4" /> Unduh Sertifikat / PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" /> Bagikan
              </Button>
              {data.event.leaderboardPublished && (
                <Button variant="outline" size="sm" isLoading={addNotebook.isPending} onClick={() => addNotebook.mutate()}>
                  <BookMarked className="h-4 w-4 text-indigo-600" /> Simpan Soal Salah
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {shareMsg && (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-xs font-medium text-indigo-900">
            {shareMsg}
          </div>
        )}
        {nbMsg && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-900">
            {nbMsg}
          </div>
        )}

        {/* Subject Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>TWK</span>
                <Badge variant="navy">{r.twkScore} Poin</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-emerald-50 p-2.5">
                <p className="text-base font-bold text-emerald-700">{r.twkCorrect}</p>
                <p className="text-emerald-700">Benar</p>
              </div>
              <div className="rounded-lg bg-rose-50 p-2.5">
                <p className="text-base font-bold text-rose-700">{r.twkWrong}</p>
                <p className="text-rose-700">Salah</p>
              </div>
              <div className="rounded-lg bg-slate-100 p-2.5">
                <p className="text-base font-bold text-slate-700">{r.twkUnanswered}</p>
                <p className="text-slate-600">Kosong</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>TIU</span>
                <Badge variant="indigo">{r.tiuScore} Poin</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-emerald-50 p-2.5">
                <p className="text-base font-bold text-emerald-700">{r.tiuCorrect}</p>
                <p className="text-emerald-700">Benar</p>
              </div>
              <div className="rounded-lg bg-rose-50 p-2.5">
                <p className="text-base font-bold text-rose-700">{r.tiuWrong}</p>
                <p className="text-rose-700">Salah</p>
              </div>
              <div className="rounded-lg bg-slate-100 p-2.5">
                <p className="text-base font-bold text-slate-700">{r.tiuUnanswered}</p>
                <p className="text-slate-600">Kosong</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>TKP</span>
                <Badge variant="success">{r.tkpScore} Poin</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="rounded-lg bg-emerald-50 p-2.5">
                <p className="text-base font-bold text-emerald-700">{r.tkpAnswered}</p>
                <p className="text-emerald-700">Terjawab (Bobot 1–5)</p>
              </div>
              <div className="rounded-lg bg-slate-100 p-2.5">
                <p className="text-base font-bold text-slate-700">{r.tkpUnanswered}</p>
                <p className="text-slate-600">Kosong</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visualizations */}
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Skor Anda vs Rata-rata Event</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Anda" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="RataRataEvent" name="Rata-rata Event" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribusi Skor Peserta Event</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.scoreDistribution ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="range" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Jumlah Peserta" fill="#0f172a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Topic Breakdown & Adaptive Recommendations */}
        <div className="grid gap-5 lg:grid-cols-12">
          <Card className="lg:col-span-7">
            <CardHeader>
              <CardTitle>Penguasaan Topik dalam Event Ini</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={r.topicBreakdown ?? []} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 100]} unit="%" />
                  <YAxis type="category" dataKey="topicName" width={130} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="accuracyPct" name="Capaian (%)" radius={[0, 6, 6, 0]}>
                    {(r.topicBreakdown ?? []).map((entry: any, i: number) => (
                      <Cell
                        key={i}
                        fill={entry.accuracyPct >= 75 ? '#10b981' : entry.accuracyPct >= 50 ? '#f59e0b' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-5">
            <CardHeader>
              <CardTitle>Rekomendasi Belajar Lanjutan Nippia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-emerald-50 p-3">
                  <p className="text-emerald-700">Subjek Terkuat</p>
                  <p className="mt-1 font-bold text-emerald-950">
                    {analytics?.strongestSubject?.subject} ({analytics?.strongestSubject?.pct}%)
                  </p>
                </div>
                <div className="rounded-xl bg-amber-50 p-3">
                  <p className="text-amber-700">Perlu Ditingkatkan</p>
                  <p className="mt-1 font-bold text-amber-950">
                    {analytics?.weakestSubject?.subject} ({analytics?.weakestSubject?.pct}%)
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                {(analytics?.recommendations ?? []).map((rec: any) => (
                  <Link
                    key={rec.topicSlug}
                    to={rec.route}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-3 hover:border-indigo-300 hover:bg-indigo-50/40"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{rec.actionLabel}</p>
                      <p className="text-[11px] text-slate-500">Akurasi saat ini: {rec.accuracyPct}%</p>
                    </div>
                    <Compass className="h-4 w-4 text-indigo-600 shrink-0" />
                  </Link>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 pt-2 print:hidden">
                <Link to="/daily-practice" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">Latihan Harian</Button>
                </Link>
                <Link to="/materials" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">Pusat Materi</Button>
                </Link>
                <Link to="/cat-simulation" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">Simulasi CAT</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Printable Participation Certificate Card */}
        <Card className="border-2 border-indigo-200 bg-slate-50/40">
          <CardContent className="p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Sertifikat Partisipasi Resmi Nippia
                </p>
                <p className="text-base font-bold text-slate-900">
                  {data.participantName} — {data.event.title}
                </p>
                <p className="text-xs text-slate-600">
                  Total Skor {r.totalScore}/{r.maxScore} (TWK {r.twkScore}, TIU {r.tiuScore}, TKP {r.tkpScore}) • Diselenggarakan oleh {data.event.hostName}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.print()} className="print:hidden">
              Cetak / Simpan PDF Sertifikat
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

// ==================================================
// LEADERBOARD PAGE
// ==================================================

export function LiveEventLeaderboardPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [tab, setTab] = useState<'top10' | 'top50' | 'top100' | 'all' | 'mine'>('top50');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['live-event-leaderboard', eventId, tab, search, page],
    queryFn: () =>
      apiFetch<Record<string, any>>(
        `/live-events/${eventId}/leaderboard?tab=${tab}&q=${encodeURIComponent(search)}&page=${page}&limit=25`,
      ),
    enabled: Boolean(eventId),
  });

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingState label="Memuat papan peringkat Live Akbar..." />
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout>
        <Card>
          <CardContent className="p-8 text-center space-y-3">
            <Lock className="mx-auto h-10 w-10 text-amber-500" />
            <p className="text-base font-bold text-slate-900">Papan Peringkat Belum Tersedia</p>
            <p className="text-sm text-slate-600">
              {error instanceof ApiError ? error.message : 'Hasil resmi belum dipublikasikan oleh penyelenggara.'}
            </p>
            <Link to={`/live-events/${eventId}`}>
              <Button variant="indigo">Kembali ke Detail Event</Button>
            </Link>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const tabs = [
    { key: 'top10', label: 'Top 10' },
    { key: 'top50', label: 'Top 50' },
    { key: 'top100', label: 'Top 100' },
    { key: 'all', label: 'Semua Peserta' },
    { key: 'mine', label: 'Peringkat Saya' },
  ] as const;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge variant="indigo">Pemeringkatan Nasional Deterministik</Badge>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">{data.event.title}</h1>
            <p className="mt-1 text-sm text-slate-600">
              Total Peserta: {data.stats.totalParticipants} • Rata-rata: {data.stats.averageScore} • Tertinggi: {data.stats.highestScore}
            </p>
          </div>
          <Link to={`/live-events/${eventId}/result`}>
            <Button variant="outline">Lihat Hasil Detail Saya</Button>
          </Link>
        </div>

        {data.myEntry && (
          <Card className="border-indigo-300 bg-indigo-50/70">
            <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">
                  #{data.myEntry.rank}
                </div>
                <div>
                  <p className="text-sm font-bold text-indigo-950">{data.myEntry.displayName} (Anda)</p>
                  <p className="text-xs text-indigo-700">
                    TWK {data.myEntry.twkScore} • TIU {data.myEntry.tiuScore} • TKP {data.myEntry.tkpScore} • Waktu {formatDurationReadable(data.myEntry.completionTimeSeconds)}
                  </p>
                </div>
              </div>
              <Badge variant="indigo" className="text-sm px-3 py-1">
                Total Skor: {data.myEntry.totalScore}
              </Badge>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setTab(t.key);
                  setPage(1);
                }}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold cursor-pointer ${
                  tab === t.key
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari nama peserta..."
              className="pl-9"
            />
          </div>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Peringkat</th>
                  <th className="px-4 py-3">Peserta</th>
                  <th className="px-4 py-3 text-right">TWK</th>
                  <th className="px-4 py-3 text-right">TIU</th>
                  <th className="px-4 py-3 text-right">TKP</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Waktu Selesai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data.entries ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      Tidak ada data peringkat yang cocok.
                    </td>
                  </tr>
                ) : (
                  (data.entries ?? []).map((row: any, idx: number) => (
                    <tr
                      key={`${row.rank}-${idx}`}
                      className={row.isCurrentUser ? 'bg-indigo-50/80 font-semibold' : 'hover:bg-slate-50/70'}
                    >
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex h-7 min-w-7 items-center justify-center rounded-lg px-2 text-xs font-bold ${
                            row.rank === 1
                              ? 'bg-amber-400 text-amber-950'
                              : row.rank === 2
                                ? 'bg-slate-300 text-slate-900'
                                : row.rank === 3
                                  ? 'bg-amber-700/20 text-amber-900'
                                  : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          #{row.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                            {row.displayName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-slate-900">
                              {row.displayName}{' '}
                              {row.isCurrentUser && <Badge variant="indigo">Anda</Badge>}
                            </p>
                            <p className="text-[11px] text-slate-500">{row.levelName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{row.twkScore}</td>
                      <td className="px-4 py-3 text-right font-mono">{row.tiuScore}</td>
                      <td className="px-4 py-3 text-right font-mono">{row.tkpScore}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-indigo-700">{row.totalScore}</td>
                      <td className="px-4 py-3 text-right text-xs text-slate-600">
                        {formatDurationReadable(row.completionTimeSeconds)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {data.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-600">
              <span>
                Halaman {data.pagination.page} dari {data.pagination.totalPages} ({data.pagination.total} peserta)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Berikutnya
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}

// ==================================================
// QUESTION REVIEW & EXPLANATION PAGE
// ==================================================

export function LiveEventReviewPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [subjectFilter, setSubjectFilter] = useState<'ALL' | SubjectCode>('ALL');
  const [activeIdx, setActiveIdx] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['live-event-review', eventId],
    queryFn: () => apiFetch<Record<string, any>>(`/live-events/${eventId}/review`),
    enabled: Boolean(eventId),
  });

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingState label="Memuat pembahasan soal Live Akbar..." />
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout>
        <Card>
          <CardContent className="p-8 text-center space-y-3">
            <Lock className="mx-auto h-10 w-10 text-amber-500" />
            <p className="text-base font-bold text-slate-900">Pembahasan Soal Terkunci</p>
            <p className="text-sm text-slate-600">
              {error instanceof ApiError ? error.message : 'Pembahasan belum dibuka untuk event ini.'}
            </p>
            <Link to={`/live-events/${eventId}/result`}>
              <Button variant="indigo">Kembali ke Hasil</Button>
            </Link>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const allQuestions = (data.questions ?? []) as Array<Record<string, any>>;
  const filtered = subjectFilter === 'ALL'
    ? allQuestions
    : allQuestions.filter((q) => q.subjectCode === subjectFilter);
  const current = filtered[activeIdx] ?? filtered[0];

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge variant="indigo">Pembahasan Soal Resmi</Badge>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">{data.event.title}</h1>
          </div>
          <Link to={`/live-events/${eventId}/result`}>
            <Button variant="outline">Kembali ke Hasil</Button>
          </Link>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(['ALL', 'TWK', 'TIU', 'TKP'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setSubjectFilter(s);
                setActiveIdx(0);
              }}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold cursor-pointer ${
                subjectFilter === s ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {s === 'ALL' ? 'Semua Subjek' : s}
            </button>
          ))}
        </div>

        {current && (
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            <Card className="lg:col-span-8">
              <CardContent className="p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="navy">No. {current.questionOrder}</Badge>
                    <Badge variant="indigo">{current.subjectCode}</Badge>
                    <span className="text-xs text-slate-500">{current.topicName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={current.isCorrect || current.scoreEarned >= 4 ? 'success' : 'warning'}>
                      Skor Diperoleh: +{current.scoreEarned}
                    </Badge>
                    <ReportQuestionButton
                      questionId={current.questionId}
                      questionCode={`LIVE-${current.questionOrder}`}
                    />
                  </div>
                </div>

                <p className="text-base leading-relaxed text-slate-900 whitespace-pre-line">{current.stem}</p>
                {current.visualSpec && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <FiguralRenderer spec={current.visualSpec} />
                  </div>
                )}

                <div className="space-y-2">
                  {(current.options ?? []).map((opt: any) => {
                    const isMine = current.selectedOption === opt.optionKey;
                    const isBest = current.subjectCode === 'TKP' ? opt.scoreValue === 5 : opt.isCorrect;

                    return (
                      <div
                        key={opt.optionKey}
                        className={`rounded-xl border p-3.5 text-sm ${
                          isBest
                            ? 'border-emerald-400 bg-emerald-50/70'
                            : isMine
                              ? 'border-rose-300 bg-rose-50/70'
                              : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            <span className="font-bold text-slate-800">{opt.optionKey}.</span>
                            <div>
                              <p className="text-slate-900">{opt.text}</p>
                              {opt.visualSpec && (
                                <div className="mt-2 max-w-[140px]">
                                  <FiguralRenderer spec={opt.visualSpec} />
                                </div>
                              )}
                              {opt.optionFeedback && (
                                <p className="mt-1 text-xs text-slate-600">{opt.optionFeedback}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            {isMine && <Badge variant="indigo">Pilihan Anda</Badge>}
                            {current.subjectCode === 'TKP' ? (
                              <Badge variant={opt.scoreValue >= 4 ? 'success' : 'default'}>
                                Bobot {opt.scoreValue}
                              </Badge>
                            ) : isBest ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            ) : isMine ? (
                              <XCircle className="h-4 w-4 text-rose-600" />
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <QuestionDiscussionPanel
                  questionId={current.questionId}
                  questionCode={`LIVE-${current.questionOrder}`}
                  subjectCode={current.subjectCode}
                  topicName={current.topicName}
                  topicSlug=""
                  selectedKey={current.selectedOption}
                  options={current.options}
                  explanation={current.explanation}
                  conceptSummary={current.conceptSummary}
                  stepByStep={current.stepByStep}
                  whyOthersWrong={current.whyOthersWrong}
                  quickTrick={current.quickTrick}
                  commonMistakes={current.commonMistakes}
                  studyTip={current.studyTip}
                  references={current.references}
                />
              </CardContent>
            </Card>

            <Card className="lg:col-span-4 lg:sticky lg:top-6">
              <CardHeader>
                <CardTitle>Daftar Soal ({filtered.length})</CardTitle>
              </CardHeader>
              <CardContent className="grid max-h-[420px] grid-cols-6 gap-1.5 overflow-y-auto p-2">
                {filtered.map((q, idx) => {
                  const active = idx === activeIdx;
                  const good = q.subjectCode === 'TKP' ? q.scoreEarned >= 4 : q.isCorrect;
                  return (
                    <button
                      key={q.questionId}
                      type="button"
                      onClick={() => setActiveIdx(idx)}
                      className={`h-8 rounded-lg text-xs font-bold cursor-pointer ${
                        good ? 'bg-emerald-600 text-white' : 'bg-rose-100 text-rose-800'
                      } ${active ? 'ring-2 ring-indigo-600 ring-offset-1' : ''}`}
                    >
                      {q.questionOrder}
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
