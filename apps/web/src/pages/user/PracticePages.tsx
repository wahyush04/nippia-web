import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  Play,
  SlidersHorizontal,
  Sparkles,
  Target,
  XCircle,
} from 'lucide-react';
import { apiFetch } from '../../lib/api';
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
  ProgressBar,
  Select,
} from '../../components/ui';
import { FiguralRenderer } from '../../components/skd/FiguralRenderer';
import { QuestionDiscussionPanel } from '../../components/skd/QuestionDiscussionPanel';

interface TopicItem {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  description: string;
  subjectCode: 'TWK' | 'TIU' | 'TKP';
  totalQuestions: number;
  completedCount: number;
  accuracyPct: number;
  masteryLevel: string;
  masteryLabel: string;
  difficultyDistribution: { EASY: number; MEDIUM: number; HARD: number };
  lastPracticedAt: string | null;
}

export function DailyPracticePage() {
  const navigate = useNavigate();
  const { user, fetchMe } = useAuthStore();
  const [twk, setTwk] = useState(user?.preferences?.dailyTwkTarget ?? 10);
  const [tiu, setTiu] = useState(user?.preferences?.dailyTiuTarget ?? 10);
  const [tkp, setTkp] = useState(user?.preferences?.dailyTkpTarget ?? 10);
  const [starting, setStarting] = useState(false);
  const [savingPref, setSavingPref] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveTarget = async () => {
    setSavingPref(true);
    try {
      await apiFetch('/auth/preferences', {
        method: 'PUT',
        body: JSON.stringify({ dailyTwkTarget: twk, dailyTiuTarget: tiu, dailyTkpTarget: tkp }),
      });
      await fetchMe();
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    } finally {
      setSavingPref(false);
    }
  };

  const handleStart = async () => {
    setStarting(true);
    try {
      const res = await apiFetch<{ sessionId: string }>('/practice/daily/start', {
        method: 'POST',
        body: JSON.stringify({ twkCount: twk, tiuCount: tiu, tkpCount: tkp }),
      });
      navigate(`/practice/session/${res.sessionId}`);
    } finally {
      setStarting(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Badge variant="indigo">Rutinitas Harian Adaptif</Badge>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Latihan Harian SKD</h1>
          <p className="mt-1 text-sm text-slate-600">
            Soal dipilih otomatis dengan memprioritaskan topik lemah, topik yang jarang dilatih,
            dan jadwal ulang Buku Kesalahan (spaced repetition).
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
              Konfigurasi Target Soal Harian
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Soal TWK</label>
                <Input
                  type="number"
                  min={0}
                  max={30}
                  value={twk}
                  onChange={(e) => setTwk(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Soal TIU</label>
                <Input
                  type="number"
                  min={0}
                  max={35}
                  value={tiu}
                  onChange={(e) => setTiu(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Soal TKP</label>
                <Input
                  type="number"
                  min={0}
                  max={45}
                  value={tkp}
                  onChange={(e) => setTkp(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4 border border-slate-200/80">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Total Paket Hari Ini: {twk + tiu + tkp} Soal
                </p>
                <p className="text-xs text-slate-500">
                  Menuntaskan target harian memberi bonus +50 XP dan menjaga Streak belajar.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSaveTarget} isLoading={savingPref}>
                  {savedNotice ? 'Tersimpan ✓' : 'Simpan Target'}
                </Button>
                <Button variant="indigo" onClick={handleStart} isLoading={starting} disabled={twk + tiu + tkp === 0}>
                  <Play className="h-4 w-4" /> Mulai Latihan Harian
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export function TopicDrillingPage() {
  const [activeSubj, setActiveSubj] = useState<'ALL' | 'TWK' | 'TIU' | 'TKP'>('ALL');
  const { data: topics, isLoading } = useQuery({
    queryKey: ['practice-topics'],
    queryFn: () => apiFetch<TopicItem[]>('/practice/topics'),
  });

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingState label="Memuat daftar topik kisi-kisi..." />
      </AppLayout>
    );
  }

  const filtered = (topics || []).filter((t) => activeSubj === 'ALL' || t.subjectCode === activeSubj);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Latihan per Topik</h1>
            <p className="mt-1 text-sm text-slate-600">
              Pilih topik spesifik dari 24 kisi-kisi resmi TWK, TIU, dan TKP.
            </p>
          </div>
          <div className="flex gap-1.5 rounded-xl bg-white p-1 border border-slate-200">
            {(['ALL', 'TWK', 'TIU', 'TKP'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setActiveSubj(s)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold cursor-pointer ${
                  activeSubj === s ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {s === 'ALL' ? 'Semua' : s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => {
            const masteryVariant =
              t.masteryLevel === 'MASTERED'
                ? 'success'
                : t.masteryLevel === 'GOOD'
                  ? 'indigo'
                  : t.masteryLevel === 'DEVELOPING'
                    ? 'warning'
                    : t.masteryLevel === 'NEEDS_IMPROVEMENT'
                      ? 'danger'
                      : 'neutral';

            return (
              <Card key={t.id} className="flex flex-col justify-between hover:border-indigo-300 transition-colors">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="navy">{t.subjectCode}</Badge>
                      {t.category && <Badge variant="neutral">{t.category}</Badge>}
                    </div>
                    <Badge variant={masteryVariant}>{t.masteryLabel}</Badge>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{t.name}</h3>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">{t.description}</p>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Akurasi ({t.completedCount} dikerjakan)</span>
                      <span className="font-semibold text-slate-900">{t.accuracyPct}%</span>
                    </div>
                    <ProgressBar value={t.accuracyPct} />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
                    <span>Total: {t.totalQuestions} soal</span>
                    <span>
                      M:{t.difficultyDistribution.EASY} • S:{t.difficultyDistribution.MEDIUM} • H:
                      {t.difficultyDistribution.HARD}
                    </span>
                  </div>

                  <Link to={`/practice/topic/${t.slug}`} className="block pt-2">
                    <Button variant="outline" className="w-full" size="sm">
                      Konfigurasi & Latihan
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}

export function PracticeConfigPage() {
  const { topicSlug } = useParams();
  const navigate = useNavigate();
  const { data: topics } = useQuery({
    queryKey: ['practice-topics'],
    queryFn: () => apiFetch<TopicItem[]>('/practice/topics'),
  });
  const topic = topics?.find((t) => t.slug === topicSlug);

  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<'MIXED' | 'EASY' | 'MEDIUM' | 'HARD'>('MIXED');
  const [mode, setMode] = useState<'PRACTICE' | 'EXAM'>('PRACTICE');
  const [includeWrong, setIncludeWrong] = useState(false);
  const [avoidRecent, setAvoidRecent] = useState(false);
  const [enableTimer, setEnableTimer] = useState(false);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleStart = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await apiFetch<{ sessionId: string }>('/practice/topic/start', {
        method: 'POST',
        body: JSON.stringify({
          topicSlug,
          questionCount,
          difficulty,
          mode,
          includeWrong,
          avoidRecent,
          timeLimitMinutes: mode === 'EXAM' && enableTimer ? timeLimitMinutes : undefined,
        }),
      });
      navigate(`/practice/session/${res.sessionId}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Gagal memulai latihan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <Link to="/topics" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline">
          <ChevronLeft className="h-4 w-4" /> Kembali ke Daftar Topik
        </Link>

        <div>
          {topic && <Badge variant="navy">{topic.subjectCode}</Badge>}
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Konfigurasi Latihan: {topic?.name || topicSlug}
          </h1>
          {topic && <p className="mt-1 text-sm text-slate-600">{topic.description}</p>}
        </div>

        <Card>
          <CardContent className="p-6 space-y-5">
            {err && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {err}
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-700">Jumlah Soal</label>
              <div className="flex flex-wrap gap-2">
                {[5, 10, 15, 20].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setQuestionCount(n)}
                    className={`rounded-xl border px-4 py-2 text-sm font-semibold cursor-pointer ${
                      questionCount === n
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    {n} Soal
                  </button>
                ))}
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-24"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Tingkat Kesulitan
                </label>
                <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}>
                  <option value="MIXED">Campuran (Semua Tingkat)</option>
                  <option value="EASY">Mudah</option>
                  <option value="MEDIUM">Sedang</option>
                  <option value="HARD">Sulit</option>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Mode Latihan</label>
                <Select value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
                  <option value="PRACTICE">Mode Belajar (Umpan Balik Langsung)</option>
                  <option value="EXAM">Mode Ujian (Pembahasan di Akhir)</option>
                </Select>
              </div>
            </div>

            <div className="space-y-2.5 rounded-xl bg-slate-50 p-4 border border-slate-200/80">
              <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeWrong}
                  onChange={(e) => setIncludeWrong(e.target.checked)}
                  className="rounded accent-indigo-600"
                />
                Prioritaskan soal yang pernah salah sebelumnya
              </label>
              <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={avoidRecent}
                  onChange={(e) => setAvoidRecent(e.target.checked)}
                  className="rounded accent-indigo-600"
                />
                Hindari soal yang baru saja dikerjakan
              </label>
              {mode === 'EXAM' && (
                <div className="flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableTimer}
                      onChange={(e) => setEnableTimer(e.target.checked)}
                      className="rounded accent-indigo-600"
                    />
                    Aktifkan Timer (menit):
                  </label>
                  {enableTimer && (
                    <Input
                      type="number"
                      min={1}
                      max={120}
                      value={timeLimitMinutes}
                      onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                      className="w-24 h-8"
                    />
                  )}
                </div>
              )}
            </div>

            <Button variant="indigo" size="lg" className="w-full" onClick={handleStart} isLoading={loading}>
              <Play className="h-4 w-4" /> Mulai Sesi Latihan
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

interface PracticeSessionPayload {
  session: {
    id: string;
    title: string;
    mode: 'PRACTICE' | 'EXAM';
    status: 'IN_PROGRESS' | 'SUBMITTED';
    totalQuestions: number;
    timeLimitSec: number | null;
  };
  questions: Array<{
    id: string;
    code: string;
    subjectCode: 'TWK' | 'TIU' | 'TKP';
    topicName: string;
    topicSlug: string;
    difficulty: string;
    stem: string;
    visualSpec?: Record<string, unknown> | null;
    isBookmarked: boolean;
    userAnswer?: { selectedKey: string | null; isCorrect: boolean; scoreEarned: number } | null;
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
    studyTip?: string | null;
    references?: Array<{ title: string; source: string; note?: string | null }>;
  }>;
}

export function QuestionPracticePage() {
  const { sessionId } = useParams();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [summaryResult, setSummaryResult] = useState<{
    totalQuestions: number;
    answeredCount: number;
    correctCount: number;
    incorrectCount: number;
    accuracyPct: number;
    earnedScore: number;
    maxScore: number;
    xpEarned: number;
    topicsToImprove: Array<{ name: string; slug: string; wrong: number }>;
    newAchievements: string[];
  } | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['practice-session', sessionId],
    queryFn: () => apiFetch<PracticeSessionPayload>(`/practice/sessions/${sessionId}`),
  });

  useEffect(() => {
    if (!data || data.session.status === 'SUBMITTED') return;
    const t = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [data]);

  if (isLoading || !data) {
    return (
      <AppLayout>
        <LoadingState label="Memuat soal latihan..." />
      </AppLayout>
    );
  }

  const questions = data.questions;
  const q = questions[currentIdx];
  const isSubmitted = data.session.status === 'SUBMITTED';
  const showDiscussion = Boolean(
    q && (isSubmitted || (data.session.mode === 'PRACTICE' && q.userAnswer?.selectedKey)),
  );

  const handleSelectOption = async (key: string) => {
    if (!q || isSubmitted) return;
    await apiFetch(`/practice/sessions/${sessionId}/answer`, {
      method: 'POST',
      body: JSON.stringify({
        questionId: q.id,
        selectedKey: key,
        timeSpentSec: Math.max(5, Math.round(elapsedSec / Math.max(1, currentIdx + 1))),
      }),
    });
    await refetch();
  };

  const handleBookmark = async () => {
    if (!q) return;
    await apiFetch(`/dashboard/bookmarks/${q.id}`, { method: 'POST' });
    await refetch();
  };

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      const res = await apiFetch<{ summary: typeof summaryResult }>(
        `/practice/sessions/${sessionId}/submit`,
        {
          method: 'POST',
          body: JSON.stringify({ timeSpentSec: elapsedSec }),
        },
      );
      setSummaryResult(res.summary);
      await refetch();
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div>
            <p className="text-xs font-semibold text-indigo-600">
              {data.session.mode === 'PRACTICE' ? 'MODE BELAJAR' : 'MODE UJIAN'}
            </p>
            <h1 className="text-base font-bold text-slate-900">{data.session.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="neutral">
              <Clock className="h-3.5 w-3.5" /> {formatTimer(elapsedSec)}
            </Badge>
            {!isSubmitted && (
              <Button variant="indigo" size="sm" onClick={handleFinish} isLoading={submitting}>
                Selesaikan Sesi
              </Button>
            )}
          </div>
        </div>

        {/* Summary Banner if submitted */}
        {summaryResult && (
          <Card className="border-indigo-200 bg-indigo-50/40">
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Badge variant="success">Sesi Selesai</Badge>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Ringkasan Hasil Latihan
                  </h2>
                </div>
                <Badge variant="indigo" className="text-sm px-3 py-1">
                  <Sparkles className="h-4 w-4" /> +{summaryResult.xpEarned} XP
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl bg-white p-3.5 border border-slate-200">
                  <p className="text-xs text-slate-500">Terjawab / Total</p>
                  <p className="text-lg font-bold text-slate-900">
                    {summaryResult.answeredCount} / {summaryResult.totalQuestions}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3.5 border border-slate-200">
                  <p className="text-xs text-slate-500">Tepat / Kurang Tepat</p>
                  <p className="text-lg font-bold text-emerald-700">
                    {summaryResult.correctCount} / {summaryResult.incorrectCount}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3.5 border border-slate-200">
                  <p className="text-xs text-slate-500">Akurasi</p>
                  <p className="text-lg font-bold text-indigo-700">{summaryResult.accuracyPct}%</p>
                </div>
                <div className="rounded-xl bg-white p-3.5 border border-slate-200">
                  <p className="text-xs text-slate-500">Skor Poin</p>
                  <p className="text-lg font-bold text-slate-900">
                    {summaryResult.earnedScore} / {summaryResult.maxScore}
                  </p>
                </div>
              </div>
              {summaryResult.topicsToImprove.length > 0 && (
                <div className="rounded-xl bg-white p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-700 mb-2">
                    Topik yang Perlu Diperkuat:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {summaryResult.topicsToImprove.map((t) => (
                      <Link key={t.slug} to={`/practice/topic/${t.slug}`}>
                        <Badge variant="warning">
                          {t.name} ({t.wrong} keliru) → Latih lagi
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-5 lg:grid-cols-12">
          {/* Question Card */}
          {q && (
            <div className="lg:col-span-9 space-y-4">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="navy">Soal {currentIdx + 1} / {questions.length}</Badge>
                      <Badge variant="indigo">{q.subjectCode} • {q.topicName}</Badge>
                      <Badge variant="neutral">{q.difficulty}</Badge>
                    </div>
                    <button
                      type="button"
                      onClick={handleBookmark}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium cursor-pointer ${
                        q.isBookmarked
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <Bookmark className="h-3.5 w-3.5" />
                      {q.isBookmarked ? 'Tersimpan' : 'Simpan'}
                    </button>
                  </div>

                  <p className="text-base leading-relaxed text-slate-900 font-medium">{q.stem}</p>

                  {q.visualSpec && <FiguralRenderer spec={q.visualSpec} />}

                  <div className="space-y-2.5 pt-2">
                    {q.options.map((opt) => {
                      const isSelected = q.userAnswer?.selectedKey === opt.optionKey;
                      const showOutcome = showDiscussion;
                      let stateStyle = 'border-slate-200 bg-white hover:bg-slate-50';
                      if (showOutcome) {
                        if (opt.isCorrect) stateStyle = 'border-emerald-500 bg-emerald-50/70';
                        else if (isSelected) stateStyle = 'border-red-400 bg-red-50/70';
                      } else if (isSelected) {
                        stateStyle = 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20';
                      }

                      return (
                        <button
                          key={opt.optionKey}
                          type="button"
                          disabled={isSubmitted}
                          onClick={() => handleSelectOption(opt.optionKey)}
                          className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all cursor-pointer ${stateStyle}`}
                        >
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {opt.optionKey}
                          </span>
                          <div className="flex-1 space-y-2">
                            <p className="text-sm text-slate-800">{opt.text}</p>
                            {opt.visualSpec && <FiguralRenderer spec={opt.visualSpec} compact />}
                          </div>
                          {showOutcome && opt.isCorrect && (
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                          )}
                          {showOutcome && isSelected && !opt.isCorrect && (
                            <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <Button
                      variant="outline"
                      disabled={currentIdx === 0}
                      onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" /> Sebelumnya
                    </Button>
                    {currentIdx < questions.length - 1 ? (
                      <Button
                        variant="primary"
                        onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
                      >
                        Berikutnya <ChevronRight className="h-4 w-4" />
                      </Button>
                    ) : !isSubmitted ? (
                      <Button variant="indigo" onClick={handleFinish} isLoading={submitting}>
                        Selesaikan & Lihat Skor
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>

              {showDiscussion && (
                <QuestionDiscussionPanel
                  questionId={q.id}
                  questionCode={q.code}
                  subjectCode={q.subjectCode}
                  topicName={q.topicName}
                  topicSlug={q.topicSlug}
                  selectedKey={q.userAnswer?.selectedKey}
                  options={q.options}
                  explanation={q.explanation}
                  conceptSummary={q.conceptSummary}
                  stepByStep={q.stepByStep}
                  whyOthersWrong={q.whyOthersWrong}
                  quickTrick={q.quickTrick}
                  commonMistakes={q.commonMistakes}
                  studyTip={q.studyTip}
                  references={q.references}
                />
              )}
            </div>
          )}

          {/* Question Grid Navigator */}
          <div className="lg:col-span-3">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="text-sm">Navigasi Nomor Soal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-[340px] overflow-y-auto p-1.5 pr-2">
                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((item, idx) => {
                      const answered = Boolean(item.userAnswer?.selectedKey);
                      const active = idx === currentIdx;
                      let cls = 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100';
                      if (answered) cls = 'bg-emerald-600 text-white border-emerald-600';
                      if (active) {
                        cls = answered
                          ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-600/30 ring-offset-2 ring-offset-white'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-600 ring-2 ring-indigo-600/25';
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
                <div className="space-y-1.5 text-[11px] text-slate-500 border-t border-slate-100 pt-3">
                  <p className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-indigo-600" /> Sedang dibuka
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-emerald-600" /> Sudah dijawab
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-slate-200" /> Belum dijawab
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
