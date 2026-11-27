import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  HelpCircle,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  XCircle,
} from 'lucide-react';
import type { LiveEventStatus } from '@nippia/shared';
import { LIVE_EVENT_STATUS_LABELS } from '@nippia/shared';
import { apiFetch, ApiError } from '../../lib/api';
import { formatDurationHms } from '../../lib/liveSocket';
import { AppLayout } from '../../components/layout/AppLayout';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, LoadingState } from '../../components/ui';
import { MarkdownView } from '../../components/ui/MarkdownView';
import { ProBadge } from '../../components/ui/ProBadge';
import { useAuthStore } from '../../stores/authStore';

interface LiveEventListItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  bannerUrl?: string | null;
  hostName: string;
  eventStatus: LiveEventStatus;
  isPaused: boolean;
  eventType: 'FREE' | 'PREMIUM';
  registrationStartAt: string;
  registrationEndAt: string;
  scheduledStartAt: string;
  durationMinutes: number;
  totalQuestions: number;
  twkCount: number;
  tiuCount: number;
  tkpCount: number;
  registeredCount: number;
  maxParticipants: number;
  leaderboardPublished: boolean;
  myRegistration: { registrationStatus: string; isReady: boolean } | null;
  mySession: { sessionStatus: string } | null;
}

export function statusBadgeVariant(status: LiveEventStatus): 'default' | 'indigo' | 'success' | 'warning' | 'danger' | 'navy' {
  switch (status) {
    case 'LIVE':
      return 'danger';
    case 'COUNTDOWN':
    case 'WAITING_ROOM':
      return 'warning';
    case 'REGISTRATION_OPEN':
      return 'success';
    case 'COMPLETED':
      return 'navy';
    case 'CANCELLED':
      return 'default';
    default:
      return 'indigo';
  }
}

export function LiveAkbarDiscoveryPage() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'live' | 'completed' | 'free' | 'premium'>('all');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['live-events', filter, search],
    queryFn: () =>
      apiFetch<{ events: LiveEventListItem[]; serverNow: string }>(
        `/live-events?filter=${filter}&q=${encodeURIComponent(search)}`,
      ),
  });

  const { data: notifData } = useQuery({
    queryKey: ['live-notifications'],
    queryFn: () => apiFetch<{ items: unknown[]; unreadCount: number }>('/live-events/notifications'),
  });

  const events = data?.events ?? [];

  const grouped = useMemo(() => {
    return {
      live: events.filter((e) => e.eventStatus === 'LIVE'),
      regOpen: events.filter((e) => e.eventStatus === 'REGISTRATION_OPEN'),
      upcoming: events.filter((e) =>
        ['PUBLISHED', 'REGISTRATION_CLOSED', 'WAITING_ROOM', 'COUNTDOWN'].includes(e.eventStatus),
      ),
      completed: events.filter((e) => ['FINALIZING', 'COMPLETED'].includes(e.eventStatus)),
    };
  }, [events]);

  const filterTabs = [
    { key: 'all', label: 'Semua Event' },
    { key: 'upcoming', label: 'Akan Datang' },
    { key: 'live', label: 'Sedang Live' },
    { key: 'completed', label: 'Selesai' },
    { key: 'free', label: 'Gratis' },
    { key: 'premium', label: 'Premium' },
  ] as const;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Hero Header */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 p-6 text-white shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200 border border-indigo-400/30">
                <Radio className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
                TRYOUT AKBAR SERENTAK REAL-TIME
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Nippia Live Akbar CAT SKD
              </h1>
              <p className="mt-2 text-sm text-slate-200 leading-relaxed">
                Ikuti simulasi CAT SKD nasional secara serentak bersama ribuan peserta dengan waktu
                tersinkronisasi server, ruang tunggu interaktif, pemeringkatan nasional, dan analisis kelemahan mendalam.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/live-events/my-events">
                <Button variant="secondary" size="sm">
                  <Bell className="h-4 w-4 text-indigo-600" />
                  Event Saya
                  {(notifData?.unreadCount ?? 0) > 0 && (
                    <span className="ml-1 rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {notifData?.unreadCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {filterTabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setFilter(t.key)}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  filter === t.key
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama event atau penyelenggara..."
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <LoadingState label="Memuat jadwal event Live Akbar..." />
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-sm font-medium text-slate-600">
                Belum ada event Live Akbar yang sesuai dengan filter Anda.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {grouped.live.length > 0 && (
              <EventSection title="Sedang Berlangsung (Live Now)" badge="LIVE" items={grouped.live} />
            )}
            {grouped.regOpen.length > 0 && (
              <EventSection title="Pendaftaran Dibuka" items={grouped.regOpen} />
            )}
            {grouped.upcoming.length > 0 && (
              <EventSection title="Event Mendatang & Ruang Tunggu" items={grouped.upcoming} />
            )}
            {grouped.completed.length > 0 && (
              <EventSection title="Event Selesai" items={grouped.completed} />
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function EventSection({
  title,
  badge,
  items,
}: {
  title: string;
  badge?: string;
  items: LiveEventListItem[];
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {badge && <Badge variant="danger">{badge}</Badge>}
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((ev) => {
          const isRegistered =
            ev.myRegistration && ['REGISTERED', 'CONFIRMED'].includes(ev.myRegistration.registrationStatus);
          const pct = Math.min(100, Math.round((ev.registeredCount / ev.maxParticipants) * 100));

          return (
            <Card key={ev.id} className="overflow-hidden flex flex-col">
              {/* Banner */}
              <div className="relative h-32 bg-gradient-to-r from-indigo-700 via-indigo-600 to-slate-900 p-4 flex flex-col justify-between text-white">
                {ev.bannerUrl && (
                  <img
                    src={ev.bannerUrl}
                    alt={ev.title}
                    className="absolute inset-0 h-full w-full object-cover opacity-25"
                  />
                )}
                <div className="relative flex items-center justify-between gap-2">
                  <Badge variant={statusBadgeVariant(ev.eventStatus)}>
                    {LIVE_EVENT_STATUS_LABELS[ev.eventStatus]}
                  </Badge>
                  {ev.eventType === 'FREE' ? (
                    <Badge variant="success">GRATIS</Badge>
                  ) : (
                    <ProBadge size="xs" label="PRO / PREMIUM" />
                  )}
                </div>
                <p className="relative text-xs font-medium text-indigo-100 truncate">
                  Penyelenggara: {ev.hostName}
                </p>
              </div>

              <CardContent className="flex-1 flex flex-col justify-between p-5 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-2">{ev.title}</h3>
                  <p className="mt-1.5 text-xs text-slate-600 line-clamp-2">{ev.description}</p>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                      <span>{new Date(ev.scheduledStartAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                      <span>
                        {new Date(ev.scheduledStartAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB • {ev.durationMinutes} mnt
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                      <span>{ev.totalQuestions} Soal (TWK {ev.twkCount}/TIU {ev.tiuCount}/TKP {ev.tkpCount})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                      <span>{ev.registeredCount}/{ev.maxParticipants} Peserta</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full bg-indigo-600" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {isRegistered && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Anda sudah terdaftar
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Link to={`/live-events/${ev.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Lihat Detail
                      </Button>
                    </Link>

                    {ev.eventStatus === 'LIVE' && isRegistered && (
                      <Link to={`/live-events/${ev.id}/exam`} className="flex-1">
                        <Button variant="danger" size="sm" className="w-full">
                          Kerjakan Sekarang
                        </Button>
                      </Link>
                    )}

                    {['WAITING_ROOM', 'COUNTDOWN'].includes(ev.eventStatus) && isRegistered && (
                      <Link to={`/live-events/${ev.id}/waiting-room`} className="flex-1">
                        <Button variant="indigo" size="sm" className="w-full">
                          Masuk Ruang Tunggu
                        </Button>
                      </Link>
                    )}

                    {ev.eventStatus === 'COMPLETED' && ev.leaderboardPublished && (
                      <Link to={`/live-events/${ev.id}/leaderboard`} className="flex-1">
                        <Button variant="primary" size="sm" className="w-full">
                          <Trophy className="h-3.5 w-3.5" /> Hasil & Peringkat
                        </Button>
                      </Link>
                    )}

                    {ev.eventStatus === 'REGISTRATION_OPEN' && !isRegistered && (
                      <Link to={`/live-events/${ev.id}`} className="flex-1">
                        <Button variant="indigo" size="sm" className="w-full">
                          Daftar Sekarang
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

// ==================================================
// EVENT DETAIL PAGE
// ==================================================

export function LiveAkbarDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string; proRequired?: boolean } | null>(null);

  const { data: ev, isLoading } = useQuery({
    queryKey: ['live-event-detail', eventId],
    queryFn: () => apiFetch<Record<string, any>>(`/live-events/${eventId}`),
    enabled: Boolean(eventId),
  });

  const regMutation = useMutation({
    mutationFn: () => apiFetch(`/live-events/${eventId}/register`, { method: 'POST' }),
    onSuccess: () => {
      setFeedback({ type: 'ok', text: 'Pendaftaran berhasil! Anda sekarang terdaftar pada Live Akbar ini.' });
      qc.invalidateQueries({ queryKey: ['live-event-detail', eventId] });
      qc.invalidateQueries({ queryKey: ['live-events'] });
      qc.invalidateQueries({ queryKey: ['my-live-events'] });
    },
    onError: (err) => {
      const apiErr = err instanceof ApiError ? err : null;
      setFeedback({
        type: 'err',
        text: apiErr ? apiErr.message : 'Pendaftaran gagal.',
        proRequired: apiErr?.code === 'PRO_REQUIRED',
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => apiFetch(`/live-events/${eventId}/register`, { method: 'DELETE' }),
    onSuccess: () => {
      setFeedback({ type: 'ok', text: 'Pendaftaran berhasil dibatalkan.' });
      qc.invalidateQueries({ queryKey: ['live-event-detail', eventId] });
      qc.invalidateQueries({ queryKey: ['live-events'] });
    },
    onError: (err) => {
      setFeedback({ type: 'err', text: err instanceof ApiError ? err.message : 'Gagal membatalkan pendaftaran.' });
    },
  });

  if (isLoading || !ev) {
    return (
      <AppLayout>
        <LoadingState label="Memuat detail event Live Akbar..." />
      </AppLayout>
    );
  }

  const isRegistered =
    ev.myRegistration && ['REGISTERED', 'CONFIRMED'].includes(ev.myRegistration.registrationStatus);
  const canEnterWaitingRoom =
    isRegistered && ['REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'WAITING_ROOM', 'COUNTDOWN', 'LIVE'].includes(ev.eventStatus);
  const faqItems = (ev.faqItems ?? []) as Array<{ q: string; a: string }>;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Hero */}
        <Card className="overflow-hidden border-indigo-200">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-800 p-6 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={statusBadgeVariant(ev.eventStatus)}>
                  {LIVE_EVENT_STATUS_LABELS[ev.eventStatus as LiveEventStatus]}
                </Badge>
                <Badge variant={ev.eventType === 'FREE' ? 'success' : 'warning'}>
                  {ev.eventType === 'FREE' ? 'Gratis' : 'Premium'}
                </Badge>
              </div>
              <span className="text-xs text-indigo-200">Host: {ev.hostName}</span>
            </div>
            <h1 className="mt-3 text-2xl font-bold sm:text-3xl">{ev.title}</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-200 leading-relaxed">{ev.description}</p>
          </div>

          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5 bg-white">
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <p className="text-xs text-slate-500">Jadwal Pelaksanaan</p>
                <p className="font-semibold text-slate-900">
                  {new Date(ev.scheduledStartAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })} WIB
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Batas Pendaftaran</p>
                <p className="font-semibold text-slate-900">
                  {new Date(ev.registrationEndAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} WIB
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Peserta Terdaftar</p>
                <p className="font-semibold text-slate-900">
                  {ev.registeredCount} / {ev.maxParticipants}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {ev.canRegister && ev.eventType === 'PREMIUM' && !user?.isPro ? (
                <Link to="/subscription">
                  <Button variant="indigo">
                    Daftar Gratis via Nippia Pro
                  </Button>
                </Link>
              ) : ev.canRegister ? (
                <Button variant="indigo" isLoading={regMutation.isPending} onClick={() => regMutation.mutate()}>
                  Daftar Event Sekarang
                </Button>
              ) : null}
              {canEnterWaitingRoom && (
                <Button variant="indigo" onClick={() => navigate(`/live-events/${ev.id}/waiting-room`)}>
                  Masuk Ruang Tunggu
                </Button>
              )}
              {isRegistered && ev.eventStatus === 'LIVE' && (
                <Button variant="danger" onClick={() => navigate(`/live-events/${ev.id}/exam`)}>
                  Mulai / Lanjutkan Ujian
                </Button>
              )}
              {isRegistered &&
                ['PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'WAITING_ROOM'].includes(ev.eventStatus) && (
                  <Button
                    variant="outline"
                    isLoading={cancelMutation.isPending}
                    onClick={() => cancelMutation.mutate()}
                  >
                    Batalkan Pendaftaran
                  </Button>
                )}
              {ev.mySession?.hasResult && (
                <Button variant="primary" onClick={() => navigate(`/live-events/${ev.id}/result`)}>
                  Lihat Hasil Saya
                </Button>
              )}
              {ev.leaderboardPublished && (
                <Button variant="outline" onClick={() => navigate(`/live-events/${ev.id}/leaderboard`)}>
                  <Trophy className="h-4 w-4 text-amber-500" /> Papan Peringkat
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {feedback && (
          <div
            className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 text-sm font-medium ${
              feedback.type === 'ok'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-rose-200 bg-rose-50 text-rose-800'
            }`}
          >
            <span>{feedback.text}</span>
            {feedback.proRequired && (
              <Link to="/subscription">
                <Button size="sm" variant="indigo">Upgrade ke Nippia Pro</Button>
              </Link>
            )}
          </div>
        )}

        {/* 8 Detail Sections */}
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-8">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Ujian & Distribusi Soal</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                  <p className="text-xs text-slate-500">Total Soal</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{ev.totalQuestions}</p>
                </div>
                <div className="rounded-xl bg-indigo-50 p-3.5 border border-indigo-100">
                  <p className="text-xs text-indigo-600">TWK</p>
                  <p className="mt-1 text-xl font-bold text-indigo-900">{ev.twkCount} Soal</p>
                </div>
                <div className="rounded-xl bg-indigo-50 p-3.5 border border-indigo-100">
                  <p className="text-xs text-indigo-600">TIU</p>
                  <p className="mt-1 text-xl font-bold text-indigo-900">{ev.tiuCount} Soal</p>
                </div>
                <div className="rounded-xl bg-indigo-50 p-3.5 border border-indigo-100">
                  <p className="text-xs text-indigo-600">TKP</p>
                  <p className="mt-1 text-xl font-bold text-indigo-900">{ev.tkpCount} Soal</p>
                </div>
                <div className="sm:col-span-4 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600 border border-slate-200">
                  <p className="font-semibold text-slate-800">
                    Durasi Ujian: {ev.durationMinutes} Menit • Sistem Penilaian: {ev.scoringConfig?.name ?? 'Standar SKD CPNS'}
                  </p>
                  <p className="mt-1">
                    Acak Opsi per Peserta: {ev.randomizeOptions ? 'Aktif (Anti-kecurangan)' : 'Standar'} • Kebijakan Pembahasan:{' '}
                    {ev.reviewPolicy === 'IMMEDIATE'
                      ? 'Langsung setelah hasil terbit'
                      : ev.reviewPolicy === 'DELAYED'
                        ? 'Terjadwal'
                        : 'Dinonaktifkan'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tata Tertib & Peraturan Ujian</CardTitle>
              </CardHeader>
              <CardContent>
                {ev.rulesMd ? (
                  <MarkdownView content={ev.rulesMd} />
                ) : (
                  <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600">
                    <li>Semua peserta mengikuti waktu mulai dan batas akhir serentak sesuai waktu server Nippia.</li>
                    <li>Peserta diharapkan hadir di Ruang Tunggu minimal 15 menit sebelum jadwal ujian dimulai.</li>
                    <li>Keterlambatan bergabung ke ujian tidak memberikan tambahan waktu di luar tenggat resmi event.</li>
                    <li>Jawaban tersimpan otomatis ke server; ketika waktu habis, sistem mengumpulkan jawaban secara otomatis.</li>
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pertanyaan Umum (FAQ)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(faqItems.length > 0
                  ? faqItems
                  : [
                      {
                        q: 'Bagaimana jika koneksi internet saya sempat terputus saat ujian?',
                        a: 'Jawaban terakhir yang Anda pilih tetap aman di perangkat dan langsung disinkronkan kembali ke server saat koneksi pulih.',
                      },
                      {
                        q: 'Apakah saya bisa langsung melihat peringkat nasional setelah submit?',
                        a: 'Peringkat resmi dihitung dan dipublikasikan serentak setelah seluruh peserta selesai atau waktu event berakhir.',
                      },
                    ]
                ).map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <HelpCircle className="h-4 w-4 text-indigo-600 shrink-0" />
                      {item.q}
                    </p>
                    <p className="mt-1.5 text-sm text-slate-600 pl-6">{item.a}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-5 lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle>Jadwal & Tahapan Event</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Buka Pendaftaran</p>
                  <p className="font-semibold text-slate-900">
                    {new Date(ev.registrationStartAt).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Tutup Pendaftaran</p>
                  <p className="font-semibold text-slate-900">
                    {new Date(ev.registrationEndAt).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="rounded-xl bg-indigo-50 p-3 border border-indigo-100">
                  <p className="text-xs text-indigo-600">Waktu Mulai Ujian Serentak</p>
                  <p className="font-bold text-indigo-950">
                    {new Date(ev.scheduledStartAt).toLocaleString('id-ID')}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Persyaratan & Eligibilitas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <p>
                    {ev.eligibilityText ||
                      'Terbuka untuk seluruh pengguna terdaftar Nippia dengan akun aktif sebelum pendaftaran ditutup.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistik Peserta Saat Ini</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2.5 text-center">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-lg font-bold text-slate-900">{ev.stats?.totalRegistered ?? 0}</p>
                  <p className="text-xs text-slate-500">Terdaftar</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-lg font-bold text-indigo-600">{ev.stats?.totalReady ?? 0}</p>
                  <p className="text-xs text-slate-500">Siap Ujian</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// ==================================================
// MY LIVE EVENTS + NOTIFICATIONS
// ==================================================

export function MyLiveEventsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'upcoming' | 'live' | 'completed' | 'cancelled'>('upcoming');

  const { data, isLoading } = useQuery({
    queryKey: ['my-live-events'],
    queryFn: () => apiFetch<{ items: Array<Record<string, any>>; serverNow: string }>('/live-events/my-events'),
  });

  const { data: notifData } = useQuery({
    queryKey: ['live-notifications'],
    queryFn: () =>
      apiFetch<{
        items: Array<{
          id: string;
          eventId: string;
          title: string;
          message: string;
          deliveredAt: string;
          readAt: string | null;
          event: { id: string; title: string };
        }>;
        unreadCount: number;
      }>('/live-events/notifications'),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => apiFetch(`/live-events/notifications/${id}/read`, { method: 'PATCH' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['live-notifications'] }),
  });

  const allItems = data?.items ?? [];
  const filtered = allItems.filter((item) => {
    const st = item.event.eventStatus as LiveEventStatus;
    if (item.registrationStatus === 'CANCELLED' || st === 'CANCELLED') return tab === 'cancelled';
    if (st === 'LIVE') return tab === 'live';
    if (['FINALIZING', 'COMPLETED'].includes(st)) return tab === 'completed';
    return tab === 'upcoming';
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge variant="indigo">Jadwal & Riwayat Peserta</Badge>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Event Live Akbar Saya</h1>
            <p className="mt-1 text-sm text-slate-600">
              Kelola event yang Anda ikuti, akses ruang tunggu, dan pantau pengingat jadwal.
            </p>
          </div>
          <Link to="/live-events">
            <Button variant="indigo">Jelajahi Event Live Akbar</Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'upcoming', label: 'Akan Datang' },
                { key: 'live', label: 'Sedang Berlangsung' },
                { key: 'completed', label: 'Selesai' },
                { key: 'cancelled', label: 'Dibatalkan' },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key as typeof tab)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer ${
                    tab === t.key
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {isLoading ? (
              <LoadingState label="Memuat event Anda..." />
            ) : filtered.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-sm text-slate-500">
                  Belum ada event pada kategori ini.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filtered.map((item) => {
                  const ev = item.event;
                  return (
                    <Card key={item.registrationId}>
                      <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={statusBadgeVariant(ev.eventStatus)}>
                              {LIVE_EVENT_STATUS_LABELS[ev.eventStatus as LiveEventStatus]}
                            </Badge>
                            {item.isReady && <Badge variant="success">Siap Ujian</Badge>}
                          </div>
                          <h3 className="text-base font-bold text-slate-900">{ev.title}</h3>
                          <p className="text-xs text-slate-500">
                            {new Date(ev.scheduledStartAt).toLocaleString('id-ID')} WIB • {ev.totalQuestions} Soal ({ev.durationMinutes} mnt)
                          </p>
                          {ev.timing?.countdownToStartSeconds > 0 && (
                            <p className="text-xs font-semibold text-indigo-600">
                              Mulai dalam: {formatDurationHms(ev.timing.countdownToStartSeconds)}
                            </p>
                          )}
                          {item.session?.result && (
                            <p className="text-xs font-semibold text-emerald-700">
                              Skor Total: {item.session.result.totalScore} • Peringkat #{item.session.result.ranking ?? '-'}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Link to={`/live-events/${ev.id}`}>
                            <Button variant="outline" size="sm">Detail</Button>
                          </Link>
                          {['REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'WAITING_ROOM', 'COUNTDOWN'].includes(ev.eventStatus) && (
                            <Link to={`/live-events/${ev.id}/waiting-room`}>
                              <Button variant="indigo" size="sm">Ruang Tunggu</Button>
                            </Link>
                          )}
                          {ev.eventStatus === 'LIVE' && (
                            <Link to={`/live-events/${ev.id}/exam`}>
                              <Button variant="danger" size="sm">Masuk Ujian</Button>
                            </Link>
                          )}
                          {item.session?.result && (
                            <Link to={`/live-events/${ev.id}/result`}>
                              <Button variant="primary" size="sm">Hasil</Button>
                            </Link>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <Card className="lg:col-span-4 h-fit">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Notifikasi & Pengingat</span>
                {(notifData?.unreadCount ?? 0) > 0 && (
                  <Badge variant="danger">{notifData?.unreadCount} Baru</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 max-h-[500px] overflow-y-auto">
              {!notifData?.items?.length ? (
                <p className="text-xs text-slate-500">Belum ada notifikasi Live Akbar.</p>
              ) : (
                notifData.items.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.readAt && markRead.mutate(n.id)}
                    className={`rounded-xl border p-3 text-xs cursor-pointer transition-colors ${
                      n.readAt ? 'border-slate-100 bg-slate-50/50' : 'border-indigo-200 bg-indigo-50/60'
                    }`}
                  >
                    <p className="font-semibold text-slate-900">{n.title}</p>
                    <p className="mt-1 text-slate-600">{n.message}</p>
                    <p className="mt-1.5 text-[11px] text-slate-400">
                      {new Date(n.deliveredAt).toLocaleString('id-ID')}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
