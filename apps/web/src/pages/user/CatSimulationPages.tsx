import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  Play,
  ShieldAlert,
  Timer,
  Trophy,
  XCircle,
} from 'lucide-react';
import { apiFetch, ApiError } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { AppLayout } from '../../components/layout/AppLayout';
import { ProBadge, ProUpgradeBanner } from '../../components/ui/ProBadge';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  LoadingState,
  Modal,
  ProgressBar,
  Select,
} from '../../components/ui';
import { FiguralRenderer } from '../../components/skd/FiguralRenderer';
import { QuestionDiscussionPanel } from '../../components/skd/QuestionDiscussionPanel';
import { ReportQuestionButton } from '../../components/skd/ReportQuestionButton';
import { NippiaLogo } from '../../components/ui/NippiaLogo';

interface ScoringConfigItem {
  id: string;
  name: string;
  year: number;
  isOfficialStyle: boolean;
  sourceReference: string;
  durationMinutes: number;
  disabilityMins: number;
  twkQuestionCount: number;
  tiuQuestionCount: number;
  tkpQuestionCount: number;
  passingGrades: Array<{
    formationType: string;
    twkThreshold: number;
    tiuThreshold: number;
    tkpThreshold: number;
    totalThreshold: number | null;
    sourceDocument: string;
  }>;
}

interface ExamHistoryItem {
  id: string;
  title: string;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'ABANDONED';
  totalScore: number;
  totalMaxScore: number;
  twkScore: number;
  tiuScore: number;
  tkpScore: number;
  overallPassed: boolean | null;
  startedAt: string;
  submittedAt: string | null;
}

interface ExamPackagesResponse {
  packages: Array<{
    code: 'ALL' | 'PAKET_1' | 'PAKET_2' | 'PAKET_3' | 'PAKET_4' | 'PAKET_5';
    label: string;
    twk: number;
    tiu: number;
    tkp: number;
    total: number;
  }>;
  pdfFiguralCount: number;
}

export function CatSimulationSetupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const isPro = Boolean(user?.isPro);
  const initialMode = searchParams.get('mode') === 'mini' ? 'MINI' : isPro ? 'FULL' : 'MINI';
  const [mode, setMode] = useState<'FULL' | 'MINI'>(initialMode);
  const [formationType, setFormationType] = useState('UMUM');
  const [packageCode, setPackageCode] = useState<'ALL' | 'PAKET_1' | 'PAKET_2' | 'PAKET_3' | 'PAKET_4' | 'PAKET_5'>('ALL');
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<{ message: string; isProErr?: boolean } | null>(null);

  const { data: subInfo } = useQuery({
    queryKey: ['subscription-me'],
    queryFn: () =>
      apiFetch<{
        isPro: boolean;
        usage: { miniCatUsed: number; fullCatUsed: number };
        limits: { MINI_CAT_LIFETIME_LIMIT: number };
      }>('/subscriptions/me'),
  });
  const miniUsed = subInfo?.usage?.miniCatUsed ?? 0;
  const miniLimit = subInfo?.limits?.MINI_CAT_LIFETIME_LIMIT ?? 1;
  const effectivePro = subInfo?.isPro ?? isPro;

  const { data: configs } = useQuery({
    queryKey: ['exam-configs'],
    queryFn: () => apiFetch<ScoringConfigItem[]>('/exams/config'),
  });
  const { data: packageData } = useQuery({
    queryKey: ['exam-packages'],
    queryFn: () => apiFetch<ExamPackagesResponse>('/exams/packages'),
  });
  const { data: history, isLoading } = useQuery({
    queryKey: ['exam-history'],
    queryFn: () => apiFetch<ExamHistoryItem[]>('/exams/history'),
  });

  const activeCfg = configs?.[0];

  const handleStart = async (forceNew = false) => {
    setStarting(true);
    setStartError(null);
    try {
      const res = await apiFetch<{ sessionId: string; resumed: boolean }>(
        `/exams/start${forceNew ? '?forceNew=true' : ''}`,
        {
          method: 'POST',
          body: JSON.stringify({
            mode,
            formationType,
            packageCode,
            scoringConfigId: activeCfg?.id,
          }),
        },
      );
      navigate(`/cat-simulation/run/${res.sessionId}`);
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      setStartError({
        message: apiErr?.message || (err instanceof Error ? err.message : 'Gagal memulai simulasi.'),
        isProErr: apiErr?.code === 'PRO_REQUIRED',
      });
    } finally {
      setStarting(false);
    }
  };

  const activeOngoing = history?.find((h) => h.status === 'IN_PROGRESS');

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <Badge variant="indigo">Simulasi Ujian Berbasis Komputer</Badge>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Simulasi CAT SKD</h1>
          <p className="mt-1 text-sm text-slate-600">
            Simulasikan pengalaman ujian SKD nyata dengan penyimpanan jawaban otomatis dan skor terversi.
          </p>
        </div>

        {activeOngoing && (
          <Card className="border-amber-300 bg-amber-50/70">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <p className="text-sm font-bold text-amber-950">
                  Anda memiliki sesi ujian yang sedang berjalan: {activeOngoing.title}
                </p>
                <p className="text-xs text-amber-800">
                  Jawaban terakhir Anda tersimpan aman dan dapat dilanjutkan sekarang.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="indigo" size="sm" onClick={() => navigate(`/cat-simulation/run/${activeOngoing.id}`)}>
                  Lanjutkan Sesi
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleStart(true)}>
                  Mulai Baru
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-5 lg:grid-cols-12">
          <Card className="lg:col-span-7">
            <CardHeader>
              <CardTitle>Pilih Format Simulasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!effectivePro && (
                <ProUpgradeBanner
                  compact
                  title={`Paket Free: ${Math.max(0, miniLimit - miniUsed)}/${miniLimit}× Kuota Simulasi CAT Mini Tersedia`}
                  description="Simulasi Penuh 110 Soal berkali-kali dan dukungan durasi disabilitas 130 menit tersedia di Nippia Pro (Rp 29.000/bln)."
                />
              )}

              {startError && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800">
                  <span>{startError.message}</span>
                  {startError.isProErr && (
                    <Link to="/subscription">
                      <Button size="sm" variant="indigo">Upgrade ke Pro</Button>
                    </Link>
                  )}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setMode('FULL')}
                  className={`rounded-xl border p-4 text-left cursor-pointer ${
                    mode === 'FULL'
                      ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="navy">Standar Penuh</Badge>
                    {!effectivePro && <ProBadge size="xs" />}
                  </div>
                  <p className="mt-2 text-base font-bold text-slate-900">110 Soal • 100 Menit</p>
                  <p className="mt-1 text-xs text-slate-600">
                    TWK {activeCfg?.twkQuestionCount ?? 30} • TIU {activeCfg?.tiuQuestionCount ?? 35} • TKP{' '}
                    {activeCfg?.tkpQuestionCount ?? 45}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('MINI')}
                  className={`rounded-xl border p-4 text-left cursor-pointer ${
                    mode === 'MINI'
                      ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="indigo">Simulasi Mini</Badge>
                    {!effectivePro && (
                      <Badge variant={miniUsed >= miniLimit ? 'warning' : 'success'}>
                        {miniUsed >= miniLimit ? 'Kuota Habis' : '1× Gratis'}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-2 text-base font-bold text-slate-900">30 Soal • 30 Menit</p>
                  <p className="mt-1 text-xs text-slate-600">
                    TWK 8 • TIU 10 • TKP 12 (Skor Estimasi)
                  </p>
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Paket Soal Simulasi
                  </label>
                  <Select
                    value={packageCode}
                    onChange={(e) =>
                      setPackageCode(e.target.value as 'ALL' | 'PAKET_1' | 'PAKET_2' | 'PAKET_3' | 'PAKET_4' | 'PAKET_5')
                    }
                  >
                    {(packageData?.packages ?? [
                      { code: 'ALL', label: 'Acak / Campuran Semua Bank Soal', twk: 152, tiu: 265, tkp: 225, total: 642 },
                      { code: 'PAKET_1', label: 'Paket 1 — SKD Lengkap Standar', twk: 30, tiu: 35, tkp: 45, total: 110 },
                      { code: 'PAKET_2', label: 'Paket 2 — SKD Lengkap Standar', twk: 30, tiu: 35, tkp: 45, total: 110 },
                      { code: 'PAKET_3', label: 'Paket 3 — SKD Lengkap Standar', twk: 30, tiu: 35, tkp: 45, total: 110 },
                      { code: 'PAKET_4', label: 'Paket 4 — SKD Lengkap Standar', twk: 30, tiu: 35, tkp: 45, total: 110 },
                      { code: 'PAKET_5', label: 'Paket 5 — SKD Lengkap Standar', twk: 30, tiu: 35, tkp: 45, total: 110 },
                    ]).map((pkg) => (
                      <option key={pkg.code} value={pkg.code}>
                        {pkg.label} ({pkg.total} soal: TWK {pkg.twk} • TIU {pkg.tiu} • TKP {pkg.tkp})
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Jalur Formasi (Acuan Ambang Batas)
                  </label>
                  <Select value={formationType} onChange={(e) => setFormationType(e.target.value)}>
                    <option value="UMUM">Formasi Umum</option>
                    <option value="CUMLAUDE">Lulusan Terbaik (Cumlaude)</option>
                    <option value="DISABILITAS">Penyandang Disabilitas</option>
                  </Select>
                </div>
              </div>

              {activeCfg && (
                <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600 border border-slate-200">
                  <p className="font-semibold text-slate-800">
                    Konfigurasi Aktif: {activeCfg.name} (Tahun {activeCfg.year})
                  </p>
                  <p className="mt-1">{activeCfg.sourceReference}</p>
                </div>
              )}

              <Button variant="indigo" size="lg" className="w-full" onClick={() => handleStart(false)} isLoading={starting}>
                <Play className="h-4 w-4" /> Mulai Simulasi CAT
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-5">
            <CardHeader>
              <CardTitle>Riwayat Simulasi Anda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {isLoading ? (
                <LoadingState label="Memuat riwayat..." />
              ) : !history || history.length === 0 ? (
                <p className="text-sm text-slate-500">Belum ada simulasi yang diselesaikan.</p>
              ) : (
                history.slice(0, 6).map((h) => (
                  <Link
                    key={h.id}
                    to={
                      h.status === 'SUBMITTED'
                        ? `/exam-results/${h.id}`
                        : `/cat-simulation/run/${h.id}`
                    }
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 hover:border-indigo-200"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{h.title}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(h.startedAt).toLocaleDateString('id-ID')} • TWK {h.twkScore} | TIU{' '}
                        {h.tiuScore} | TKP {h.tkpScore}
                      </p>
                    </div>
                    {h.status === 'SUBMITTED' ? (
                      <Badge variant={h.overallPassed ? 'success' : 'warning'}>
                        {h.totalScore}/{h.totalMaxScore}
                      </Badge>
                    ) : (
                      <Badge variant="indigo">Berlangsung</Badge>
                    )}
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

interface ExamRunPayload {
  session: {
    id: string;
    title: string;
    status: 'IN_PROGRESS' | 'SUBMITTED';
    remainingSec: number;
    durationSec: number;
    isOfficialStyle: boolean;
    formationType: string;
    twkScore: number;
    tiuScore: number;
    tkpScore: number;
    totalScore: number;
    twkMaxScore: number;
    tiuMaxScore: number;
    tkpMaxScore: number;
    totalMaxScore: number;
    twkPassed: boolean | null;
    tiuPassed: boolean | null;
    tkpPassed: boolean | null;
    overallPassed: boolean | null;
    xpAwarded: number;
    scoringSnapshot: Record<string, unknown> | null;
    scoringConfig: ScoringConfigItem;
  };
  questions: Array<{
    orderIndex: number;
    id: string;
    code: string;
    subjectCode: 'TWK' | 'TIU' | 'TKP';
    topicName: string;
    topicSlug: string;
    difficulty: string;
    stem: string;
    visualSpec?: Record<string, unknown> | null;
    selectedKey: string | null;
    isFlagged: boolean;
    isCorrect?: boolean;
    scoreEarned?: number;
    options: Array<{
      optionKey: string;
      text: string;
      visualSpec?: Record<string, unknown> | null;
      scoreValue?: number;
      isCorrect?: boolean;
      optionFeedback?: string;
    }>;
    explanation?: string;
    conceptSummary?: string | null;
    stepByStep?: unknown;
    whyOthersWrong?: unknown;
    quickTrick?: string | null;
    commonMistakes?: string | null;
    references?: Array<{ title: string; source: string; note?: string | null }>;
  }>;
}

export function CatExamRunnerPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'offline'>('saved');
  const submissionTokenRef = useRef(crypto.randomUUID());

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['exam-session', examId],
    queryFn: () => apiFetch<ExamRunPayload>(`/exams/${examId}`),
  });

  useEffect(() => {
    if (!data) return;
    if (data.session.status === 'SUBMITTED') {
      navigate(`/exam-results/${examId}`, { replace: true });
      return;
    }
    setSecondsLeft(data.session.remainingSec);
  }, [data, examId, navigate]);

  const handleSubmitExam = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await apiFetch(`/exams/${examId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ submissionToken: submissionTokenRef.current }),
      });
      navigate(`/exam-results/${examId}`, { replace: true });
    } catch {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      handleSubmitExam();
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s !== null ? Math.max(0, s - 1) : null));
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <LoadingState label="Memuat ruang ujian CAT..." />
      </div>
    );
  }

  const questions = data.questions;
  const q = questions[currentIdx];
  const answeredCount = questions.filter((x) => Boolean(x.selectedKey)).length;
  const flaggedCount = questions.filter((x) => x.isFlagged).length;

  const updateAnswer = async (payload: { selectedKey?: string | null; isFlagged?: boolean }) => {
    if (!q) return;
    setSaveStatus('saving');
    try {
      await apiFetch(`/exams/${examId}/answer`, {
        method: 'PATCH',
        body: JSON.stringify({ questionId: q.id, ...payload }),
      });
      setSaveStatus('saved');
      await refetch();
    } catch {
      setSaveStatus('offline');
    }
  };

  const formatCountdown = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* A. Sticky Exam Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-slate-900 text-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <NippiaLogo variant="mark" onDark size="sm" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
                {data.session.title}
              </p>
              <div className="flex items-center gap-2 text-sm font-bold">
                <span>Subtes Aktif: {q?.subjectCode}</span>
                <span className="text-slate-400">•</span>
                <span>
                  Terjawab {answeredCount} / {questions.length}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-300 hidden sm:inline">
              {saveStatus === 'saving'
                ? 'Menyimpan...'
                : saveStatus === 'offline'
                  ? 'Gangguan koneksi — coba ulang'
                  : 'Tersimpan otomatis'}
            </span>
            <div
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 font-mono text-sm font-bold ${
                (secondsLeft ?? 999) < 300 ? 'bg-red-600 text-white' : 'bg-slate-800 text-amber-300'
              }`}
            >
              <Clock className="h-4 w-4" />
              {secondsLeft !== null ? formatCountdown(secondsLeft) : '--:--:--'}
            </div>
            <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
              Selesai Ujian
            </Button>
          </div>
        </div>
      </header>

      {/* Main CAT Workspace */}
      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-5 p-4 md:p-6 lg:grid-cols-12">
        {/* B. Question Panel */}
        {q && (
          <div className="lg:col-span-8 space-y-4">
            <Card className="h-full flex flex-col justify-between">
              <CardContent className="p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="navy">Nomor {currentIdx + 1}</Badge>
                    <Badge variant="indigo">{q.subjectCode}</Badge>
                    <span className="text-xs text-slate-500">{q.topicName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateAnswer({ isFlagged: !q.isFlagged })}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                        q.isFlagged
                          ? 'border-amber-400 bg-amber-50 text-amber-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Flag className="h-3.5 w-3.5" />
                      {q.isFlagged ? 'Ditandai Ragu-Ragu' : 'Tandai Ragu-Ragu'}
                    </button>
                    <ReportQuestionButton questionId={q.id} questionCode={q.code} />
                  </div>
                </div>

                <p className="text-base leading-relaxed font-medium text-slate-900">{q.stem}</p>

                {q.visualSpec && <FiguralRenderer spec={q.visualSpec} />}

                <div className="space-y-2.5">
                  {q.options.map((opt) => {
                    const selected = q.selectedKey === opt.optionKey;
                    return (
                      <button
                        key={opt.optionKey}
                        type="button"
                        onClick={() => updateAnswer({ selectedKey: opt.optionKey })}
                        className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                          selected
                            ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600/20'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                            selected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {opt.optionKey}
                        </span>
                        <div className="flex-1 space-y-2">
                          <span className="text-sm text-slate-800">{opt.text}</span>
                          {opt.visualSpec && <FiguralRenderer spec={opt.visualSpec} compact />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>

              {/* D. Sticky Bottom Exam Controls */}
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-6 py-4 rounded-b-2xl">
                <Button
                  variant="outline"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                >
                  <ChevronLeft className="h-4 w-4" /> Soal Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateAnswer({ selectedKey: null })}
                  disabled={!q.selectedKey}
                >
                  Kosongkan Jawaban
                </Button>
                <Button
                  variant="primary"
                  disabled={currentIdx === questions.length - 1}
                  onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
                >
                  Soal Berikutnya <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* C. Question Navigation Grid */}
        <div className="lg:col-span-4">
          <Card className="sticky top-20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm">Navigasi Nomor Soal ({questions.length})</CardTitle>
                <Badge variant="indigo">No. {currentIdx + 1}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-[396px] overflow-y-auto p-1.5 pr-2">
                <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-5 gap-2">
                  {questions.map((item, idx) => {
                    const isCur = idx === currentIdx;
                    let cls =
                      'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300';
                    if (item.isFlagged) {
                      cls = 'bg-amber-400 text-amber-950 border-amber-500 hover:bg-amber-300';
                    } else if (item.selectedKey) {
                      cls = 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700';
                    }

                    if (isCur) {
                      if (!item.isFlagged && !item.selectedKey) {
                        cls =
                          'bg-indigo-50 text-indigo-700 border-indigo-600 ring-2 ring-indigo-600/25';
                      } else {
                        cls += ' ring-2 ring-indigo-600 ring-offset-2 ring-offset-white';
                      }
                    }

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCurrentIdx(idx)}
                        className={`h-9 rounded-xl border text-xs font-bold transition-all cursor-pointer ${cls}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 border-t border-slate-100 pt-3.5 text-xs text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-md bg-emerald-600 shrink-0" />
                  Terjawab ({answeredCount})
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-md border border-slate-200 bg-slate-100 shrink-0" />
                  Kosong ({questions.length - answeredCount})
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-md bg-amber-400 shrink-0" />
                  Ragu-ragu ({flaggedCount})
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-md border-2 border-indigo-600 bg-indigo-50 shrink-0" />
                  Soal aktif
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Konfirmasi Pengumpulan Ujian"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Apakah Anda yakin ingin mengakhiri dan mengumpulkan ujian sekarang?
          </p>
          <div className="rounded-xl bg-slate-50 p-3.5 text-xs space-y-1 border border-slate-200">
            <p>Total soal terjawab: <strong>{answeredCount}</strong> dari {questions.length}</p>
            <p>Soal belum dijawab: <strong>{questions.length - answeredCount}</strong></p>
            <p>Ditandai ragu-ragu: <strong>{flaggedCount}</strong></p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Lanjutkan Mengerjakan
            </Button>
            <Button variant="danger" onClick={handleSubmitExam} isLoading={submitting}>
              Ya, Kumpulkan Sekarang
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function ExamResultsPage() {
  const { examId } = useParams();
  const [filterSubj, setFilterSubj] = useState<'ALL' | 'TWK' | 'TIU' | 'TKP'>('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['exam-results', examId],
    queryFn: () => apiFetch<ExamRunPayload>(`/exams/${examId}`),
  });

  const { data: history } = useQuery({
    queryKey: ['exam-history'],
    queryFn: () => apiFetch<ExamHistoryItem[]>('/exams/history'),
  });

  const filteredQuestions = useMemo(() => {
    if (!data) return [];
    return data.questions.filter((q) => filterSubj === 'ALL' || q.subjectCode === filterSubj);
  }, [data, filterSubj]);

  if (isLoading || !data) {
    return (
      <AppLayout>
        <LoadingState label="Menghitung hasil ujian..." />
      </AppLayout>
    );
  }

  const s = data.session;
  const snap = (s.scoringSnapshot || {}) as {
    readinessLabel?: string;
    passingThresholds?: { twk: number; tiu: number; tkp: number; sourceDocument: string; year: number } | null;
  };
  const pg = snap.passingThresholds;
  const prevSims = (history || []).filter((h) => h.status === 'SUBMITTED' && h.id !== s.id).slice(0, 3);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Result */}
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 md:flex-row md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={s.overallPassed ? 'success' : 'warning'}>
                {s.overallPassed ? 'Memenuhi Ambang Batas Konfigurasi' : 'Belum Memenuhi Semua Ambang Batas'}
              </Badge>
              <Badge variant="neutral">
                {s.isOfficialStyle ? 'Skor Simulasi Gaya Resmi' : 'Skor Estimasi Latihan'}
              </Badge>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">{s.title}</h1>
            <p className="mt-1 text-sm text-slate-600">
              Indikator Kesiapan: <strong>{snap.readinessLabel || 'Evaluasi Hasil'}</strong> • Bonus +{s.xpAwarded} XP
            </p>
          </div>
          <div className="rounded-2xl bg-slate-900 px-6 py-4 text-center text-white">
            <p className="text-xs text-indigo-300">Skor Kumulatif</p>
            <p className="text-3xl font-extrabold">
              {s.totalScore} <span className="text-base font-normal text-slate-400">/ {s.totalMaxScore}</span>
            </p>
          </div>
        </div>

        {/* Subject Breakdown */}
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { code: 'TWK', score: s.twkScore, max: s.twkMaxScore, passed: s.twkPassed, pg: pg?.twk },
            { code: 'TIU', score: s.tiuScore, max: s.tiuMaxScore, passed: s.tiuPassed, pg: pg?.tiu },
            { code: 'TKP', score: s.tkpScore, max: s.tkpMaxScore, passed: s.tkpPassed, pg: pg?.tkp },
          ].map((item) => (
            <Card key={item.code}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="navy">{item.code}</Badge>
                  {item.passed !== null && (
                    <Badge variant={item.passed ? 'success' : 'danger'}>
                      {item.passed ? 'Lulus Ambang' : 'Di Bawah Ambang'}
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {item.score} <span className="text-sm font-normal text-slate-500">/ {item.max}</span>
                </p>
                <ProgressBar
                  value={(item.score / Math.max(1, item.max)) * 100}
                  colorClass={item.passed ? 'bg-emerald-600' : 'bg-amber-500'}
                />
                {item.pg !== undefined && (
                  <p className="text-xs text-slate-500">
                    Acuan ambang batas ({pg?.year}): {item.pg} (untuk format penuh)
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {pg && (
          <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <p>
              <strong>Catatan Aturan Penilaian:</strong> {pg.sourceDocument}. Nippia adalah platform persiapan independen;
              verifikasi selalu ketentuan nilai ambang batas resmi pada pengumuman tahun seleksi berjalan.
            </p>
          </div>
        )}

        {/* Comparison with previous simulations */}
        {prevSims.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-indigo-600" />
                Perbandingan dengan Simulasi Sebelumnya
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              {prevSims.map((p) => (
                <div key={p.id} className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs">
                  <p className="font-semibold text-slate-900">{p.title}</p>
                  <p className="mt-1 text-slate-500">{new Date(p.startedAt).toLocaleDateString('id-ID')}</p>
                  <p className="mt-2 text-base font-bold text-indigo-700">
                    {p.totalScore}/{p.totalMaxScore}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Detailed Question Review */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">Tinjauan & Pembahasan Soal</h2>
            <div className="flex gap-1.5">
              {(['ALL', 'TWK', 'TIU', 'TKP'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterSubj(f)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                    filterSubj === f ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  {f === 'ALL' ? 'Semua' : f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredQuestions.map((q) => (
              <Card key={q.id}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="navy">No. {q.orderIndex + 1}</Badge>
                      <Badge variant="indigo">{q.subjectCode} • {q.topicName}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={q.isCorrect ? 'success' : q.selectedKey ? 'warning' : 'neutral'}>
                        {q.selectedKey
                          ? `Pilihan: ${q.selectedKey} (+${q.scoreEarned ?? 0} poin)`
                          : 'Tidak Dijawab (0 poin)'}
                      </Badge>
                      <ReportQuestionButton questionId={q.id} questionCode={q.code} />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-900">{q.stem}</p>
                  {q.visualSpec && <FiguralRenderer spec={q.visualSpec} />}
                  <QuestionDiscussionPanel
                    questionId={q.id}
                    questionCode={q.code}
                    subjectCode={q.subjectCode}
                    topicName={q.topicName}
                    topicSlug={q.topicSlug}
                    selectedKey={q.selectedKey}
                    options={q.options}
                    explanation={q.explanation}
                    conceptSummary={q.conceptSummary}
                    stepByStep={q.stepByStep}
                    whyOthersWrong={q.whyOthersWrong}
                    quickTrick={q.quickTrick}
                    commonMistakes={q.commonMistakes}
                    references={q.references}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
