import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  Ban,
  CheckCircle2,
  Clock,
  Download,
  Lock,
  Megaphone,
  Pause,
  Play,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  Trophy,
  Users,
  XCircle,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { LiveEventStatus } from '@nippia/shared';
import { LIVE_EVENT_STATUS_LABELS } from '@nippia/shared';
import { apiFetch, ApiError, getAccessToken } from '../../lib/api';
import { createLiveEventSocket, formatDurationHms } from '../../lib/liveSocket';
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
  Select,
  Textarea,
} from '../../components/ui';
import { statusBadgeVariant } from '../live/LiveAkbarDiscoveryPages';

function toLocalInputIso(offsetMinutes: number): string {
  const d = new Date(Date.now() + offsetMinutes * 60000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AdminLiveEventsListPage() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const canManageConfig = user?.role === 'ADMIN' || user?.role === 'EVENT_ADMIN';

  const [createOpen, setCreateOpen] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [hostName, setHostName] = useState('Tim Akademik Nasional Nippia');
  const [regStart, setRegStart] = useState(() => toLocalInputIso(-60));
  const [regEnd, setRegEnd] = useState(() => toLocalInputIso(60 * 24));
  const [schedStart, setSchedStart] = useState(() => toLocalInputIso(60 * 25));
  const [durationMinutes, setDurationMinutes] = useState(100);
  const [maxParticipants, setMaxParticipants] = useState(1000);
  const [eventType, setEventType] = useState<'FREE' | 'PREMIUM'>('FREE');
  const [packageCode, setPackageCode] = useState<'ALL' | 'PAKET_1' | 'PAKET_2' | 'PAKET_3'>('ALL');
  const [twkCount, setTwkCount] = useState(30);
  const [tiuCount, setTiuCount] = useState(35);
  const [tkpCount, setTkpCount] = useState(45);
  const [randomizeOptions, setRandomizeOptions] = useState(true);
  const [reviewPolicy, setReviewPolicy] = useState<'IMMEDIATE' | 'DELAYED' | 'DISABLED'>('IMMEDIATE');

  const { data: events, isLoading } = useQuery({
    queryKey: ['admin-live-events'],
    queryFn: () => apiFetch<Array<Record<string, any>>>('/admin/live-events'),
  });

  const createMut = useMutation({
    mutationFn: () =>
      apiFetch('/admin/live-events', {
        method: 'POST',
        body: JSON.stringify({
          title,
          slug,
          description,
          hostName,
          registrationStartAt: new Date(regStart).toISOString(),
          registrationEndAt: new Date(regEnd).toISOString(),
          scheduledStartAt: new Date(schedStart).toISOString(),
          durationMinutes: Number(durationMinutes),
          maxParticipants: Number(maxParticipants),
          eventType,
          packageCode,
          twkCount: Number(twkCount),
          tiuCount: Number(tiuCount),
          tkpCount: Number(tkpCount),
          randomizeOptions,
          reviewPolicy,
        }),
      }),
    onSuccess: () => {
      setCreateOpen(false);
      setTitle('');
      setSlug('');
      setDescription('');
      setFormErr(null);
      qc.invalidateQueries({ queryKey: ['admin-live-events'] });
    },
    onError: (err) => {
      setFormErr(err instanceof ApiError ? err.message : 'Gagal membuat event.');
    },
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge variant="navy">Konsol Penyelenggara Event</Badge>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Manajemen Nippia Live Akbar</h1>
            <p className="mt-1 text-sm text-slate-600">
              Buat event tryout nasional, bekukan paket soal, kendalikan hitung mundur, dan pantau peserta secara langsung.
            </p>
          </div>
          {canManageConfig && (
            <Button variant="indigo" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> Buat Event Live Akbar
            </Button>
          )}
        </div>

        {isLoading ? (
          <LoadingState label="Memuat daftar event Live Akbar..." />
        ) : !events || events.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-slate-500">
              Belum ada event Live Akbar. Klik Buat Event untuk memulai.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((ev) => (
              <Card key={ev.id}>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant={statusBadgeVariant(ev.eventStatus)}>
                          {LIVE_EVENT_STATUS_LABELS[ev.eventStatus as LiveEventStatus]}
                        </Badge>
                        {ev.isPaused && <Badge variant="warning">DIJEDA</Badge>}
                        <Badge variant={ev.eventType === 'FREE' ? 'success' : 'warning'}>
                          {ev.eventType}
                        </Badge>
                      </div>
                      <h3 className="mt-2 text-base font-bold text-slate-900">{ev.title}</h3>
                      <p className="text-xs text-slate-500">
                        Slug: {ev.slug} • Host: {ev.hostName}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{ev._count?.registrations ?? 0}</p>
                      <p className="text-slate-500">Pendaftar</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{ev._count?.questionSets ?? 0}</p>
                      <p className="text-slate-500">Soal Snapshot</p>
                    </div>
                    <div>
                      <p className="font-bold text-indigo-700">{ev._count?.results ?? 0}</p>
                      <p className="text-slate-500">Hasil Masuk</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Jadwal: {new Date(ev.scheduledStartAt).toLocaleString('id-ID')}</span>
                    <Link to={`/admin/live-events/${ev.id}`}>
                      <Button variant="indigo" size="sm">
                        Buka Konsol Live Control
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Buat Event Live Akbar Baru"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {formErr && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">{formErr}</div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Judul Event</label>
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slug) {
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, ''),
                    );
                  }
                }}
                placeholder="Tryout Akbar Nasional SKD 2026 #2"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Slug URL</label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="tryout-akbar-skd-2026-2" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Deskripsi Event</label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Simulasi CAT SKD nasional serentak dengan pemeringkatan resmi..."
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Penyelenggara / Host</label>
              <Input value={hostName} onChange={(e) => setHostName(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Tipe Event</label>
              <Select value={eventType} onChange={(e) => setEventType(e.target.value as 'FREE' | 'PREMIUM')}>
                <option value="FREE">Gratis (Free)</option>
                <option value="PREMIUM">Premium</option>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Kapasitas Maksimal</label>
              <Input
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Buka Pendaftaran</label>
              <Input type="datetime-local" value={regStart} onChange={(e) => setRegStart(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Tutup Pendaftaran</label>
              <Input type="datetime-local" value={regEnd} onChange={(e) => setRegEnd(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Jadwal Mulai Ujian</label>
              <Input type="datetime-local" value={schedStart} onChange={(e) => setSchedStart(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Sumber Paket</label>
              <Select value={packageCode} onChange={(e) => setPackageCode(e.target.value as any)}>
                <option value="ALL">Campuran</option>
                <option value="PAKET_1">Paket 1</option>
                <option value="PAKET_2">Paket 2</option>
                <option value="PAKET_3">Paket 3</option>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Durasi (mnt)</label>
              <Input type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">TWK</label>
              <Input type="number" value={twkCount} onChange={(e) => setTwkCount(Number(e.target.value))} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">TIU</label>
              <Input type="number" value={tiuCount} onChange={(e) => setTiuCount(Number(e.target.value))} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">TKP</label>
              <Input type="number" value={tkpCount} onChange={(e) => setTkpCount(Number(e.target.value))} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 items-center">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Kebijakan Pembahasan</label>
              <Select value={reviewPolicy} onChange={(e) => setReviewPolicy(e.target.value as any)}>
                <option value="IMMEDIATE">Langsung Setelah Hasil Terbit</option>
                <option value="DELAYED">Ditunda Sesuai Jadwal</option>
                <option value="DISABLED">Dinonaktifkan</option>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700 pt-4 cursor-pointer">
              <input
                type="checkbox"
                checked={randomizeOptions}
                onChange={(e) => setRandomizeOptions(e.target.checked)}
                className="h-4 w-4 accent-indigo-600"
              />
              Acak urutan opsi A–E per peserta
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Batal</Button>
            <Button variant="indigo" isLoading={createMut.isPending} onClick={() => createMut.mutate()}>
              Simpan Event (Draf)
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}

// ==================================================
// ADMIN / HOST LIVE CONTROL & MONITORING CONSOLE
// ==================================================

export function AdminLiveEventControlPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const canEventAdmin = user?.role === 'ADMIN' || user?.role === 'EVENT_ADMIN';

  const [tab, setTab] = useState<'controls' | 'participants' | 'analytics'>('controls');
  const [liveStats, setLiveStats] = useState<Record<string, any> | null>(null);
  const [health, setHealth] = useState<Record<string, any> | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annPinned, setAnnPinned] = useState(true);

  const [pSearch, setPSearch] = useState('');
  const [pFilter, setPFilter] = useState('ALL');
  const [confirmAction, setConfirmAction] = useState<{ label: string; endpoint: string; body?: object } | null>(null);
  const [dqTarget, setDqTarget] = useState<{ userId: string; name: string } | null>(null);
  const [dqReason, setDqReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-live-monitoring', eventId],
    queryFn: () => apiFetch<Record<string, any>>(`/admin/live-events/${eventId}/monitoring`),
    enabled: Boolean(eventId),
    refetchInterval: 10000,
  });

  const { data: participantsData } = useQuery({
    queryKey: ['admin-live-participants', eventId, pSearch, pFilter],
    queryFn: () =>
      apiFetch<{ participants: Array<Record<string, any>>; total: number }>(
        `/admin/live-events/${eventId}/participants?q=${encodeURIComponent(pSearch)}&status=${pFilter}`,
      ),
    enabled: Boolean(eventId) && tab === 'participants',
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['admin-live-analytics', eventId],
    queryFn: () => apiFetch<Record<string, any>>(`/admin/live-events/${eventId}/analytics`),
    enabled: Boolean(eventId) && tab === 'analytics' && canEventAdmin,
  });

  useEffect(() => {
    if (!data) return;
    setLiveStats(data.stats);
    setHealth(data.serverHealth);
  }, [data]);

  // Real-time monitoring Socket.IO
  useEffect(() => {
    if (!eventId) return;
    const socket = createLiveEventSocket(eventId);
    if (!socket) return;

    socket.on('admin:exam_progress_updated', (payload: any) => {
      setLiveStats(payload);
    });
    socket.on('admin:event_health_updated', (payload: any) => {
      setHealth((prev) => ({ ...(prev ?? {}), ...payload }));
    });
    socket.on('live_event:status', () => {
      qc.invalidateQueries({ queryKey: ['admin-live-monitoring', eventId] });
    });

    return () => {
      socket.disconnect();
    };
  }, [eventId, qc]);

  const execAction = useMutation({
    mutationFn: ({ endpoint, body }: { endpoint: string; body?: object }) =>
      apiFetch(`/admin/live-events/${eventId}/${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(body ?? {}),
      }),
    onSuccess: (_res, vars) => {
      setConfirmAction(null);
      setActionMsg(`Aksi "${vars.endpoint}" berhasil dijalankan.`);
      qc.invalidateQueries({ queryKey: ['admin-live-monitoring', eventId] });
      qc.invalidateQueries({ queryKey: ['admin-live-events'] });
    },
    onError: (err) => {
      setConfirmAction(null);
      setActionMsg(err instanceof ApiError ? err.message : 'Gagal menjalankan aksi.');
    },
  });

  const sendAnn = useMutation({
    mutationFn: () =>
      apiFetch(`/admin/live-events/${eventId}/announcements`, {
        method: 'POST',
        body: JSON.stringify({ title: annTitle, message: annMessage, isPinned: annPinned }),
      }),
    onSuccess: () => {
      setAnnTitle('');
      setAnnMessage('');
      setActionMsg('Pengumuman berhasil dikirim real-time ke seluruh peserta.');
      qc.invalidateQueries({ queryKey: ['admin-live-monitoring', eventId] });
    },
  });

  const dqMut = useMutation({
    mutationFn: () =>
      apiFetch(`/admin/live-events/${eventId}/participants/${dqTarget!.userId}/disqualify`, {
        method: 'POST',
        body: JSON.stringify({ reason: dqReason }),
      }),
    onSuccess: () => {
      setDqTarget(null);
      setDqReason('');
      qc.invalidateQueries({ queryKey: ['admin-live-participants', eventId] });
      qc.invalidateQueries({ queryKey: ['admin-live-monitoring', eventId] });
    },
  });

  const handleDownloadCsv = async () => {
    const token = getAccessToken();
    const resp = await fetch(`/api/v1/admin/live-events/${eventId}/participants?format=csv`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const text = await resp.text();
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `peserta-live-${eventId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading || !data) {
    return (
      <AppLayout>
        <LoadingState label="Memuat konsol Live Control..." />
      </AppLayout>
    );
  }

  const ev = data.event;
  const stats = liveStats ?? data.stats;
  const timing = data.timing;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Link to="/admin/live-events" className="text-xs font-semibold text-indigo-600 hover:underline">
                ← Daftar Event
              </Link>
              <Badge variant={statusBadgeVariant(ev.eventStatus)}>
                {LIVE_EVENT_STATUS_LABELS[ev.eventStatus as LiveEventStatus]}
              </Badge>
              {ev.isPaused && <Badge variant="warning">DIJEDA</Badge>}
            </div>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">{ev.title}</h1>
            <p className="text-xs text-slate-500">
              Snapshot Soal: {ev._count?.questionSets ?? 0} soal • Sisa Waktu Server: {formatDurationHms(timing.remainingSeconds)}
            </p>
          </div>

          {/* Server Health Mini Pill */}
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
              <Activity className="h-4 w-4" /> Server Sehat
            </span>
            <span className="text-slate-600">Socket Aktif: <b>{health?.connectedSockets ?? 0}</b></span>
            <span className="text-slate-600">Memori: <b>{health?.memoryMb ?? 0} MB</b></span>
            <span className="text-slate-600">DB Latency: <b>{health?.dbLatencyMs ?? '-'} ms</b></span>
          </div>
        </div>

        {actionMsg && (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3.5 text-sm font-medium text-indigo-950">
            {actionMsg}
          </div>
        )}

        {/* Monitoring KPI Cards */}
        <div className="grid gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {[
            { label: 'Terdaftar', val: stats.totalRegistered, cls: 'text-slate-900' },
            { label: 'Ruang Tunggu', val: stats.inWaitingRoom, cls: 'text-amber-700' },
            { label: 'Siap', val: stats.totalReady, cls: 'text-emerald-700' },
            { label: 'Aktif Ujian', val: stats.activeInExam, cls: 'text-indigo-700' },
            { label: 'Terputus', val: stats.disconnectedCount, cls: 'text-rose-700' },
            { label: 'Selesai', val: stats.completedCount, cls: 'text-emerald-700' },
            { label: 'Progres Rata2', val: `${stats.averageProgressPct}%`, cls: 'text-indigo-700' },
          ].map((k) => (
            <Card key={k.label}>
              <CardContent className="p-3.5 text-center">
                <p className={`text-xl font-bold ${k.cls}`}>{k.val}</p>
                <p className="text-[11px] text-slate-500">{k.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {[
            { key: 'controls', label: 'Kontrol Event, Pengumuman & Audit' },
            { key: 'participants', label: `Daftar Peserta (${stats.totalRegistered})` },
            ...(canEventAdmin ? [{ key: 'analytics', label: 'Analitik Event' }] : []),
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key as typeof tab)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer ${
                tab === t.key ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'controls' && (
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Lifecycle & Live Controls */}
            <Card className="lg:col-span-7">
              <CardHeader>
                <CardTitle>Kendali Siklus Hidup & Ujian Live</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {canEventAdmin && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Persiapan & Publikasi (Event Admin)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={['LIVE', 'FINALIZING', 'COMPLETED'].includes(ev.eventStatus)}
                        onClick={() =>
                          setConfirmAction({
                            label: 'Bekukan / Buat Ulang Snapshot Paket Soal Event?',
                            endpoint: 'freeze-questions',
                            body: { force: true },
                          })
                        }
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Bekukan Paket Soal
                      </Button>
                      {ev.eventStatus === 'DRAFT' && (
                        <Button
                          variant="indigo"
                          size="sm"
                          onClick={() =>
                            setConfirmAction({
                              label: 'Publikasikan Event & Buka Pendaftaran Sekarang?',
                              endpoint: 'publish',
                              body: { openRegistration: true },
                            })
                          }
                        >
                          Publikasikan & Buka Daftar
                        </Button>
                      )}
                      {ev.eventStatus === 'REGISTRATION_OPEN' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setConfirmAction({ label: 'Tutup Pendaftaran Event?', endpoint: 'close-registration' })
                          }
                        >
                          <Lock className="h-3.5 w-3.5" /> Tutup Pendaftaran
                        </Button>
                      )}
                      {ev.eventStatus === 'REGISTRATION_CLOSED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setConfirmAction({ label: 'Buka Kembali Pendaftaran?', endpoint: 'open-registration' })
                          }
                        >
                          Buka Pendaftaran Lagi
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Kendali Ruang Tunggu & Ujian Serentak (Host / Operator)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED'].includes(ev.eventStatus) && (
                      <Button
                        variant="indigo"
                        size="sm"
                        onClick={() =>
                          setConfirmAction({ label: 'Buka Ruang Tunggu Peserta?', endpoint: 'open-waiting-room' })
                        }
                      >
                        <Users className="h-3.5 w-3.5" /> Buka Ruang Tunggu
                      </Button>
                    )}
                    {ev.eventStatus === 'WAITING_ROOM' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setConfirmAction({ label: 'Mulai Hitung Mundur Resmi?', endpoint: 'start-countdown' })
                        }
                      >
                        <Clock className="h-3.5 w-3.5" /> Mulai Countdown
                      </Button>
                    )}
                    {['WAITING_ROOM', 'COUNTDOWN', 'REGISTRATION_CLOSED'].includes(ev.eventStatus) && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() =>
                          setConfirmAction({
                            label: 'MULAI UJIAN SERENTAK SEKARANG? Timer resmi akan langsung berjalan bagi semua peserta.',
                            endpoint: 'start',
                          })
                        }
                      >
                        <Play className="h-3.5 w-3.5" /> Mulai Ujian Serentak
                      </Button>
                    )}
                    {ev.eventStatus === 'LIVE' && !ev.isPaused && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setConfirmAction({ label: 'Jeda sementara seluruh timer ujian peserta?', endpoint: 'pause' })
                        }
                      >
                        <Pause className="h-3.5 w-3.5" /> Jeda Ujian
                      </Button>
                    )}
                    {ev.eventStatus === 'LIVE' && ev.isPaused && (
                      <Button
                        variant="indigo"
                        size="sm"
                        onClick={() =>
                          setConfirmAction({ label: 'Lanjutkan kembali timer ujian peserta?', endpoint: 'resume' })
                        }
                      >
                        <Play className="h-3.5 w-3.5" /> Lanjutkan Ujian
                      </Button>
                    )}
                    {ev.eventStatus === 'LIVE' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setConfirmAction({
                            label: 'Tambah perpanjangan waktu +10 menit untuk seluruh peserta?',
                            endpoint: 'extend-time',
                            body: { extraMinutes: 10 },
                          })
                        }
                      >
                        +10 Menit Ekstra
                      </Button>
                    )}
                  </div>
                </div>

                {canEventAdmin && (
                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Finalisasi, Hasil & Pembatalan
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['LIVE', 'FINALIZING'].includes(ev.eventStatus) && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            setConfirmAction({
                              label: 'Finalisasi skor, auto-submit sesi tersisa, hitung peringkat, & PUBLIKASIKAN HASIL RESMI?',
                              endpoint: 'publish-results',
                            })
                          }
                        >
                          <Trophy className="h-3.5 w-3.5 text-amber-400" /> Finalisasi & Publikasikan Peringkat
                        </Button>
                      )}
                      {!['COMPLETED', 'CANCELLED'].includes(ev.eventStatus) && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            setConfirmAction({
                              label: 'Batalkan event Live Akbar ini secara permanen?',
                              endpoint: 'cancel',
                            })
                          }
                        >
                          <Ban className="h-3.5 w-3.5" /> Batalkan Event
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Announcements + Audit Log */}
            <div className="lg:col-span-5 space-y-5">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-indigo-600" /> Kirim Pengumuman Real-Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="Judul pengumuman singkat..."
                  />
                  <Textarea
                    rows={3}
                    value={annMessage}
                    onChange={(e) => setAnnMessage(e.target.value)}
                    placeholder="Pesan langsung ke Ruang Tunggu & peserta..."
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={annPinned}
                        onChange={(e) => setAnnPinned(e.target.checked)}
                        className="accent-indigo-600"
                      />
                      Sematkan di atas pengumuman
                    </label>
                    <Button
                      variant="indigo"
                      size="sm"
                      disabled={!annTitle || !annMessage}
                      isLoading={sendAnn.isPending}
                      onClick={() => sendAnn.mutate()}
                    >
                      <Send className="h-3.5 w-3.5" /> Siarkan
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Log Aktivitas & Audit Event</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-64 overflow-y-auto text-xs">
                  {(data.auditLogs ?? []).map((log: any) => (
                    <div key={log.id} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span>{log.action}</span>
                        <span className="text-[11px] font-normal text-slate-500">
                          {new Date(log.createdAt).toLocaleTimeString('id-ID')}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-0.5">
                        Oleh: {log.actor?.name} ({log.actor?.role})
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {tab === 'participants' && (
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      value={pSearch}
                      onChange={(e) => setPSearch(e.target.value)}
                      placeholder="Cari nama atau email peserta..."
                      className="pl-9"
                    />
                  </div>
                  <Select value={pFilter} onChange={(e) => setPFilter(e.target.value)} className="w-44">
                    <option value="ALL">Semua Status</option>
                    <option value="CONFIRMED">Terkonfirmasi</option>
                    <option value="IN_PROGRESS">Mengerjakan</option>
                    <option value="SUBMITTED">Selesai Submit</option>
                    <option value="TIME_EXPIRED">Waktu Habis</option>
                    <option value="DISQUALIFIED">Didiskualifikasi</option>
                  </Select>
                </div>
                <Button variant="outline" size="sm" onClick={handleDownloadCsv}>
                  <Download className="h-4 w-4" /> Ekspor CSV
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 uppercase text-slate-500">
                    <tr>
                      <th className="px-3 py-2.5">Peserta</th>
                      <th className="px-3 py-2.5">Status Daftar</th>
                      <th className="px-3 py-2.5">Status Ujian</th>
                      <th className="px-3 py-2.5">Koneksi</th>
                      <th className="px-3 py-2.5">Progres</th>
                      <th className="px-3 py-2.5">Skor</th>
                      <th className="px-3 py-2.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(participantsData?.participants ?? []).map((p) => (
                      <tr key={p.userId}>
                        <td className="px-3 py-2.5">
                          <p className="font-semibold text-slate-900">{p.name}</p>
                          <p className="text-slate-500">{p.email}</p>
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge variant={p.registrationStatus === 'DISQUALIFIED' ? 'danger' : 'indigo'}>
                            {p.registrationStatus}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5">{p.sessionStatus}</td>
                        <td className="px-3 py-2.5">
                          <Badge
                            variant={
                              p.connectionStatus === 'ONLINE'
                                ? 'success'
                                : p.connectionStatus === 'DISCONNECTED'
                                  ? 'warning'
                                  : 'default'
                            }
                          >
                            {p.connectionStatus}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5">
                          {p.answeredCount}/{p.totalQuestions}
                        </td>
                        <td className="px-3 py-2.5 font-mono font-bold">
                          {p.totalScore !== null ? `${p.totalScore} (#${p.ranking ?? '-'})` : '-'}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          {canEventAdmin && p.registrationStatus !== 'DISQUALIFIED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDqTarget({ userId: p.userId, name: p.name })}
                            >
                              Diskualifikasi
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === 'analytics' && canEventAdmin && analyticsData && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-slate-500">Tingkat Kehadiran</p>
                  <p className="text-2xl font-bold text-slate-900">{analyticsData.attendanceRatePct}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-slate-500">Tingkat Penyelesaian</p>
                  <p className="text-2xl font-bold text-indigo-600">{analyticsData.completionRatePct}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-slate-500">Rata-rata / Tertinggi</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {analyticsData.averageScore} / {analyticsData.highestScore}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-slate-500">Lolos Ambang Batas</p>
                  <p className="text-2xl font-bold text-emerald-600">{analyticsData.passRatePct}%</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Distribusi Skor Nasional</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.scoreDistribution ?? []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="range" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" name="Peserta" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Topik Paling Menantang Bagi Peserta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {(analyticsData.challengingTopics ?? []).map((t: any) => (
                    <div key={t.topicName} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm">
                      <div>
                        <p className="font-semibold text-slate-900">{t.topicName}</p>
                        <p className="text-xs text-slate-500">{t.subject}</p>
                      </div>
                      <Badge variant="warning">Rata-rata {t.averageAccuracyPct}%</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        open={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        title="Konfirmasi Aksi Kendali Live"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-3.5 text-sm text-amber-900 border border-amber-200">
            <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <p>{confirmAction?.label}</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmAction(null)}>Batal</Button>
            <Button
              variant="indigo"
              isLoading={execAction.isPending}
              onClick={() => confirmAction && execAction.mutate(confirmAction)}
            >
              Ya, Jalankan Aksi
            </Button>
          </div>
        </div>
      </Modal>

      {/* Disqualify Modal */}
      <Modal
        open={Boolean(dqTarget)}
        onClose={() => setDqTarget(null)}
        title={`Diskualifikasi Peserta: ${dqTarget?.name}`}
      >
        <div className="space-y-4">
          <Textarea
            rows={3}
            value={dqReason}
            onChange={(e) => setDqReason(e.target.value)}
            placeholder="Catat alasan pelanggaran administratif secara jelas untuk log audit..."
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDqTarget(null)}>Batal</Button>
            <Button
              variant="danger"
              disabled={dqReason.trim().length < 3}
              isLoading={dqMut.isPending}
              onClick={() => dqMut.mutate()}
            >
              Konfirmasi Diskualifikasi
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
