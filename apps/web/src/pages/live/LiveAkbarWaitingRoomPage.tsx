import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Megaphone,
  Play,
  Radio,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react';
import type { LiveEventStatus } from '@nippia/shared';
import { LIVE_EVENT_STATUS_LABELS } from '@nippia/shared';
import { apiFetch, ApiError } from '../../lib/api';
import { createLiveEventSocket, formatDurationHms } from '../../lib/liveSocket';
import { AppLayout } from '../../components/layout/AppLayout';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, LoadingState } from '../../components/ui';
import { MarkdownView } from '../../components/ui/MarkdownView';

export function WaitingRoomPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [socketConnected, setSocketConnected] = useState(false);
  const [liveStatus, setLiveStatus] = useState<LiveEventStatus | null>(null);
  const [canJoinLive, setCanJoinLive] = useState<boolean | null>(null);
  const [countdownSec, setCountdownSec] = useState<number>(0);
  const [counters, setCounters] = useState<{
    totalRegistered: number;
    inWaitingRoom: number;
    totalReady: number;
    activeInExam: number;
  } | null>(null);
  const [announcements, setAnnouncements] = useState<Array<{ id: string; title: string; message: string; createdAt: string; isPinned?: boolean }>>([]);
  const [joinError, setJoinError] = useState<string | null>(null);
  const serverOffsetRef = useRef<number>(0);
  const scheduledStartRef = useRef<number>(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['live-waiting-room', eventId],
    queryFn: () => apiFetch<Record<string, any>>(`/live-events/${eventId}/waiting-room`),
    enabled: Boolean(eventId),
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (!data) return;
    setLiveStatus(data.event.eventStatus);
    setCanJoinLive(data.canJoin);
    setCounters(data.counters);
    setAnnouncements(data.announcements ?? []);
    if (data.timing) {
      serverOffsetRef.current = data.timing.serverNowMs - Date.now();
      scheduledStartRef.current = new Date(data.timing.scheduledStartAt).getTime();
      setCountdownSec(data.timing.countdownToStartSeconds ?? 0);
    }
  }, [data]);

  // Smooth 1-second server-synchronized countdown tick
  useEffect(() => {
    const id = setInterval(() => {
      if (scheduledStartRef.current <= 0) return;
      const estimatedServerNow = Date.now() + serverOffsetRef.current;
      const diff = Math.max(0, Math.floor((scheduledStartRef.current - estimatedServerNow) / 1000));
      setCountdownSec(diff);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Real-time WebSocket listeners
  useEffect(() => {
    if (!eventId) return;
    const socket = createLiveEventSocket(eventId);
    if (!socket) return;

    socket.on('connect', () => setSocketConnected(true));
    socket.on('disconnect', () => setSocketConnected(false));

    socket.on('live_event:status', (payload: any) => {
      if (payload.eventStatus) setLiveStatus(payload.eventStatus);
      if (payload.eventStatus === 'LIVE') setCanJoinLive(true);
      if (payload.serverNowMs) {
        serverOffsetRef.current = payload.serverNowMs - Date.now();
      }
      qc.invalidateQueries({ queryKey: ['live-waiting-room', eventId] });
    });

    socket.on('live_event:exam_started', (payload: any) => {
      setLiveStatus('LIVE');
      setCanJoinLive(true);
      if (payload.serverNowMs) serverOffsetRef.current = payload.serverNowMs - Date.now();
    });

    socket.on('live_event:participant_count', (payload: any) => {
      setCounters({
        totalRegistered: payload.totalRegistered ?? 0,
        inWaitingRoom: payload.inWaitingRoom ?? 0,
        totalReady: payload.totalReady ?? 0,
        activeInExam: payload.activeInExam ?? 0,
      });
    });

    socket.on('live_event:announcement', (payload: any) => {
      if (payload?.announcement) {
        setAnnouncements((prev) => [payload.announcement, ...prev.filter((a) => a.id !== payload.announcement.id)]);
      }
    });

    socket.on('live_event:countdown', (payload: any) => {
      if (payload.serverNowMs) serverOffsetRef.current = payload.serverNowMs - Date.now();
      if (payload.eventStatus) setLiveStatus(payload.eventStatus);
    });

    const pingId = setInterval(() => {
      if (socket.connected) socket.emit('live_event:ping_activity', { eventId });
    }, 10000);

    return () => {
      clearInterval(pingId);
      socket.disconnect();
    };
  }, [eventId, qc]);

  const readyMutation = useMutation({
    mutationFn: () => apiFetch(`/live-events/${eventId}/ready`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['live-waiting-room', eventId] }),
  });

  const joinMutation = useMutation({
    mutationFn: () => apiFetch(`/live-events/${eventId}/join`, { method: 'POST' }),
    onSuccess: () => navigate(`/live-events/${eventId}/exam`),
    onError: (err) => {
      setJoinError(err instanceof ApiError ? err.message : 'Belum dapat masuk ke ruang ujian.');
    },
  });

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingState label="Memasuki Ruang Tunggu Live Akbar..." />
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout>
        <Card>
          <CardContent className="p-8 text-center space-y-3">
            <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
            <p className="text-base font-bold text-slate-900">Akses Ruang Tunggu Ditolak</p>
            <p className="text-sm text-slate-600">
              {error instanceof ApiError ? error.message : 'Pastikan Anda sudah terdaftar pada event ini.'}
            </p>
            <Button variant="indigo" onClick={() => navigate(`/live-events/${eventId}`)}>
              Kembali ke Detail Event
            </Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const effectiveStatus = liveStatus ?? data.event.eventStatus;
  const effectiveCanJoin = canJoinLive ?? data.canJoin;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header + Connection */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="indigo">Ruang Tunggu Resmi</Badge>
              <Badge variant={effectiveStatus === 'LIVE' ? 'danger' : 'warning'}>
                {LIVE_EVENT_STATUS_LABELS[effectiveStatus as LiveEventStatus]}
              </Badge>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">{data.event.title}</h1>
            <p className="mt-1 text-sm text-slate-600">
              Host: {data.event.hostName} • Jadwal Mulai:{' '}
              {new Date(data.event.scheduledStartAt).toLocaleString('id-ID')} WIB
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold">
            {socketConnected ? (
              <>
                <Wifi className="h-4 w-4 text-emerald-600" />
                <span className="text-emerald-700">Tersambung Real-Time</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-amber-600" />
                <span className="text-amber-700">Sinkronisasi Polling</span>
              </>
            )}
          </div>
        </div>

        {/* Live Synchronized Countdown Banner */}
        <Card className="border-indigo-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white">
          <CardContent className="flex flex-wrap items-center justify-between gap-6 p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                {effectiveStatus === 'LIVE'
                  ? 'Ujian Telah Dibuka Serentak'
                  : effectiveStatus === 'CANCELLED'
                    ? 'Event Dibatalkan'
                    : 'Hitung Mundur Menuju Mulai Ujian (Waktu Server)'}
              </p>
              <p className="mt-2 font-mono text-3xl font-extrabold tracking-tight sm:text-4xl">
                {effectiveStatus === 'LIVE'
                  ? 'SEDANG BERLANGSUNG'
                  : effectiveStatus === 'CANCELLED'
                    ? 'DIBATALKAN'
                    : formatDurationHms(countdownSec)}
              </p>
              <p className="mt-1.5 text-xs text-slate-300">
                {effectiveStatus === 'LIVE'
                  ? 'Silakan klik Masuk ke Ujian sekarang. Timer ujian berjalan sesuai batas waktu server.'
                  : 'Tombol Masuk ke Ujian akan terbuka otomatis secara serentak begitu Host memulai ujian.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {!data.isReady && effectiveStatus !== 'LIVE' && effectiveStatus !== 'CANCELLED' && (
                <Button
                  variant="secondary"
                  size="lg"
                  isLoading={readyMutation.isPending}
                  onClick={() => readyMutation.mutate()}
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Konfirmasi Saya Siap
                </Button>
              )}
              {data.isReady && effectiveStatus !== 'LIVE' && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 px-4 py-2.5 text-sm font-semibold text-emerald-200">
                  <CheckCircle2 className="h-4 w-4" /> Anda Sudah Siap Mengikuti Ujian
                </div>
              )}
              <Button
                variant={effectiveCanJoin ? 'danger' : 'outline'}
                size="lg"
                disabled={!effectiveCanJoin}
                isLoading={joinMutation.isPending}
                onClick={() => joinMutation.mutate()}
                className={!effectiveCanJoin ? 'border-slate-600 bg-slate-800/50 text-slate-400' : ''}
              >
                <Play className="h-4 w-4" /> Masuk ke Ujian CAT
              </Button>
            </div>
          </CardContent>
        </Card>

        {joinError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-800">
            {joinError}
          </div>
        )}

        {/* Counters */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Terdaftar</p>
                <p className="text-xl font-bold text-slate-900">{counters?.totalRegistered ?? 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Di Ruang Tunggu</p>
                <p className="text-xl font-bold text-slate-900">{counters?.inWaitingRoom ?? 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Sudah Konfirmasi Siap</p>
                <p className="text-xl font-bold text-slate-900">{counters?.totalReady ?? 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-xl bg-rose-50 p-2.5 text-rose-600">
                <Radio className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Sedang Mengerjakan</p>
                <p className="text-xl font-bold text-slate-900">{counters?.activeInExam ?? 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rules + Announcements */}
        <div className="grid gap-5 lg:grid-cols-12">
          <Card className="lg:col-span-7">
            <CardHeader>
              <CardTitle>Informasi & Tata Tertib Ujian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-center">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Durasi</p>
                  <p className="font-bold text-slate-900">{data.event.durationMinutes} Menit</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">TWK</p>
                  <p className="font-bold text-slate-900">{data.event.twkCount} Soal</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">TIU</p>
                  <p className="font-bold text-slate-900">{data.event.tiuCount} Soal</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">TKP</p>
                  <p className="font-bold text-slate-900">{data.event.tkpCount} Soal</p>
                </div>
              </div>

              {data.event.rulesMd ? (
                <MarkdownView content={data.event.rulesMd} />
              ) : (
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600">
                  <li>Dilarang membuka sesi ganda di perangkat lain; sistem mencatat koneksi aktif terakhir Anda.</li>
                  <li>Setiap jawaban disimpan otomatis ke server. Tetap tenang jika jaringan sempat melambat.</li>
                  <li>Ketika batas waktu serentak tiba, ujian otomatis diselesaikan dan dinilai oleh server.</li>
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-indigo-600" />
                Pengumuman Live dari Host
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[380px] overflow-y-auto">
              {announcements.length === 0 ? (
                <p className="text-sm text-slate-500">Belum ada pengumuman dari host/operator.</p>
              ) : (
                announcements.map((a) => (
                  <div
                    key={a.id}
                    className={`rounded-xl border p-3.5 ${
                      a.isPinned ? 'border-amber-300 bg-amber-50/60' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <p className="text-sm font-bold text-slate-900">{a.title}</p>
                    <p className="mt-1 text-xs text-slate-700 whitespace-pre-line">{a.message}</p>
                    <p className="mt-1.5 text-[11px] text-slate-400">
                      {new Date(a.createdAt).toLocaleTimeString('id-ID')} WIB
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
