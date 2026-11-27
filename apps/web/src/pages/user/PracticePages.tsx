import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Crown,
  Eye,
  Flag,
  Lock,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Star,
  Target,
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
  Input,
  LoadingState,
  ProgressBar,
  Select,
} from '../../components/ui';
import { FiguralRenderer } from '../../components/skd/FiguralRenderer';
import { QuestionDiscussionPanel } from '../../components/skd/QuestionDiscussionPanel';
import { ReportQuestionButton } from '../../components/skd/ReportQuestionButton';

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

interface CampaignUnitItem {
  subjectCode: 'TWK' | 'TIU' | 'TKP';
  unitNumber: number;
  title: string;
  topicSummary: string;
  topics: Array<{ name: string; slug: string; count: number }>;
  difficultyLabel: string;
  isMilestone: boolean;
  questionCount: number;
  status: 'COMPLETED' | 'UNLOCKED' | 'LOCKED' | 'PRO_LOCKED';
  requiresPro?: boolean;
  activeSessionId: string | null;
  activeAnsweredCount: number;
  progress: {
    bestScore: number;
    bestCorrect: number;
    bestAccuracy: number;
    stars: number;
    attemptsCount: number;
    lastSessionId: string | null;
    completedAt: string | null;
  } | null;
}

interface CampaignTrackItem {
  code: 'TWK' | 'TIU' | 'TKP';
  name: string;
  tagline: string;
  accent: 'navy' | 'indigo' | 'emerald';
  totalUnits: number;
  completedUnits: number;
  totalQuestions: number;
  totalStars: number;
  maxStars: number;
  nextUnitNumber: number | null;
  units: CampaignUnitItem[];
}

interface CampaignOverviewPayload {
  unitSize: number;
  overallCompletedUnits: number;
  overallTotalUnits: number;
  overallTotalStars: number;
  overallMaxStars: number;
  tracks: CampaignTrackItem[];
}

export function DailyPracticePage() {
  const navigate = useNavigate();
  const { user, fetchMe } = useAuthStore();
  const isPro = Boolean(user?.isPro);
  const [twk, setTwk] = useState(isPro ? (user?.preferences?.dailyTwkTarget ?? 10) : 3);
  const [tiu, setTiu] = useState(isPro ? (user?.preferences?.dailyTiuTarget ?? 10) : 3);
  const [tkp, setTkp] = useState(isPro ? (user?.preferences?.dailyTkpTarget ?? 10) : 4);
  const [starting, setStarting] = useState(false);
  const [dailyError, setDailyError] = useState<{ message: string; isProErr?: boolean } | null>(null);
  const [savingPref, setSavingPref] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [activeTrackCode, setActiveTrackCode] = useState<'TWK' | 'TIU' | 'TKP'>('TWK');
  const [launchingUnitKey, setLaunchingUnitKey] = useState<string | null>(null);
  const [campaignError, setCampaignError] = useState<string | null>(null);

  const { data: campaign, isLoading: loadingCampaign } = useQuery({
    queryKey: ['daily-campaign'],
    queryFn: () => apiFetch<CampaignOverviewPayload>('/practice/campaign'),
  });

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
    setDailyError(null);
    try {
      const res = await apiFetch<{ sessionId: string }>('/practice/daily/start', {
        method: 'POST',
        body: JSON.stringify({ twkCount: twk, tiuCount: tiu, tkpCount: tkp }),
      });
      navigate(`/practice/session/${res.sessionId}`);
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      setDailyError({
        message: apiErr?.message || (err instanceof Error ? err.message : 'Gagal memulai latihan harian.'),
        isProErr: apiErr?.code === 'PRO_REQUIRED',
      });
    } finally {
      setStarting(false);
    }
  };

  const handleStartCampaignUnit = async (unit: CampaignUnitItem) => {
    if (unit.status === 'LOCKED') return;
    if (unit.status === 'PRO_LOCKED') {
      navigate('/subscription');
      return;
    }
    const key = `${unit.subjectCode}:${unit.unitNumber}`;
    setLaunchingUnitKey(key);
    setCampaignError(null);
    try {
      if (unit.activeSessionId) {
        navigate(`/practice/session/${unit.activeSessionId}`);
        return;
      }
      const res = await apiFetch<{ sessionId: string }>('/practice/campaign/start', {
        method: 'POST',
        body: JSON.stringify({ subjectCode: unit.subjectCode, unitNumber: unit.unitNumber }),
      });
      navigate(`/practice/session/${res.sessionId}`);
    } catch (err) {
      setCampaignError(err instanceof Error ? err.message : 'Gagal memulai unit campaign.');
    } finally {
      setLaunchingUnitKey(null);
    }
  };

  const activeTrack =
    campaign?.tracks.find((t) => t.code === activeTrackCode) ?? campaign?.tracks[0];
  const recommendedUnit =
    activeTrack?.units.find((u) => u.status === 'UNLOCKED') ??
    activeTrack?.units[activeTrack.units.length - 1];
  const overallProgressPct =
    campaign && campaign.overallTotalUnits > 0
      ? Math.round((campaign.overallCompletedUnits / campaign.overallTotalUnits) * 100)
      : 0;

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Section 1: Latihan Harian Adaptif */}
        <div className="space-y-5">
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
              {!isPro && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-2.5 text-xs text-amber-950">
                  <span>
                    <strong>Paket Free:</strong> Maks. 1 sesi latihan/hari dan hingga 10 soal per sesi (standar acak).
                  </span>
                  <Link to="/subscription" className="font-bold text-indigo-700 hover:underline">
                    Upgrade Pro (Rp 29rb/bln) →
                  </Link>
                </div>
              )}

              {dailyError && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-800">
                  <span>{dailyError.message}</span>
                  {dailyError.isProErr && (
                    <Link to="/subscription">
                      <Button size="sm" variant="indigo">Upgrade Pro</Button>
                    </Link>
                  )}
                </div>
              )}

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

        {/* Section 2: Skema Belajar Harian — Mode Campaign */}
        <section id="campaign" className="space-y-5 pt-2 border-t border-slate-200/80">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Badge variant="navy">
                <Trophy className="h-3.5 w-3.5 text-amber-400" /> Skema Belajar Bertahap • 10 Soal / Unit
              </Badge>
              <h2 className="mt-2 text-xl sm:text-2xl font-bold text-slate-900">
                Campaign Belajar Harian SKD
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Taklukkan unit belajar per tipe (TWK, TIU, TKP) secara berurutan. Setiap unit berisi{' '}
                <strong>10 soal</strong> terkurasi—tuntaskan unit aktif untuk membuka unit berikutnya dan kumpulkan 3 bintang.
              </p>
            </div>

            {campaign && (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-2xs">
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Unit Tuntas</p>
                  <p className="text-sm font-bold text-slate-900">
                    {campaign.overallCompletedUnits} / {campaign.overallTotalUnits}
                  </p>
                </div>
                <div className="h-7 w-px bg-slate-200" />
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Total Bintang</p>
                  <p className="flex items-center gap-1 text-sm font-bold text-amber-600">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                    {campaign.overallTotalStars} / {campaign.overallMaxStars}
                  </p>
                </div>
              </div>
            )}
          </div>

          {loadingCampaign || !campaign ? (
            <LoadingState label="Memuat peta Campaign belajar..." />
          ) : (
            <div className="space-y-5">
              {/* Overall Progress Bar */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    Progres Keseluruhan Campaign ({overallProgressPct}%)
                  </span>
                  <span className="text-slate-500">
                    Bintang: ★ Selesai • ★★ ≥60% (TKP ≥72%) • ★★★ ≥80% (TKP ≥84%)
                  </span>
                </div>
                <ProgressBar value={overallProgressPct} colorClass="bg-indigo-600" />
              </div>

              {/* 3 Subject Track Cards */}
              <div className="grid gap-3 md:grid-cols-3">
                {campaign.tracks.map((track) => {
                  const isActive = track.code === activeTrack?.code;
                  const pct =
                    track.totalUnits > 0
                      ? Math.round((track.completedUnits / track.totalUnits) * 100)
                      : 0;
                  return (
                    <button
                      key={track.code}
                      type="button"
                      onClick={() => setActiveTrackCode(track.code)}
                      className={`text-left rounded-2xl border p-4 transition-all cursor-pointer ${
                        isActive
                          ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant={track.code === 'TWK' ? 'navy' : track.code === 'TIU' ? 'indigo' : 'success'}>
                          {track.code}
                        </Badge>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                          {track.totalStars}/{track.maxStars}
                        </span>
                      </div>
                      <h3 className="mt-2.5 text-sm font-bold text-slate-900">{track.name}</h3>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">{track.tagline}</p>
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
                          <span>
                            {track.completedUnits}/{track.totalUnits} unit ({track.totalQuestions} soal)
                          </span>
                          <span>{pct}%</span>
                        </div>
                        <ProgressBar
                          value={pct}
                          colorClass={
                            track.code === 'TWK'
                              ? 'bg-slate-800'
                              : track.code === 'TIU'
                                ? 'bg-indigo-600'
                                : 'bg-emerald-600'
                          }
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {campaignError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800">
                  {campaignError}
                </div>
              )}

              {/* Active Track Recommended Mission Callout */}
              {activeTrack && recommendedUnit && (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-900 p-5 text-white shadow-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/25 border border-indigo-400/30 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-200">
                        <Target className="h-3 w-3" /> Misi {activeTrack.code} Berikutnya
                      </span>
                      {recommendedUnit.isMilestone && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/30 px-2.5 py-0.5 text-[11px] font-semibold text-amber-200">
                          <Crown className="h-3 w-3" /> Bonus Milestone +50 XP
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold">
                      Unit {recommendedUnit.unitNumber}: {recommendedUnit.title}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {recommendedUnit.questionCount} Soal ({recommendedUnit.difficultyLabel}) •{' '}
                      {recommendedUnit.topicSummary}
                    </p>
                  </div>
                  <Button
                    variant="indigo"
                    isLoading={launchingUnitKey === `${recommendedUnit.subjectCode}:${recommendedUnit.unitNumber}`}
                    onClick={() => handleStartCampaignUnit(recommendedUnit)}
                  >
                    <Play className="h-4 w-4" />
                    {recommendedUnit.activeSessionId
                      ? `Lanjutkan Unit ${recommendedUnit.unitNumber} (${recommendedUnit.activeAnsweredCount}/10)`
                      : recommendedUnit.status === 'COMPLETED'
                        ? `Ulangi Unit ${recommendedUnit.unitNumber}`
                        : `Mulai Unit ${recommendedUnit.unitNumber}`}
                  </Button>
                </div>
              )}

              {/* Units Grid for Active Track */}
              {activeTrack && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {activeTrack.units.map((unit) => {
                    const isProLocked = unit.status === 'PRO_LOCKED';
                    const isLocked = unit.status === 'LOCKED' || isProLocked;
                    const isDone = unit.status === 'COMPLETED';
                    const isLaunching =
                      launchingUnitKey === `${unit.subjectCode}:${unit.unitNumber}`;
                    const stars = unit.progress?.stars ?? 0;

                    return (
                      <Card
                        key={`${unit.subjectCode}-${unit.unitNumber}`}
                        className={`flex flex-col justify-between transition-all ${
                          isProLocked
                            ? 'border-amber-200/90 bg-gradient-to-b from-amber-50/40 to-white'
                            : isLocked
                              ? 'border-slate-200 bg-slate-50/80 opacity-85'
                              : isDone
                                ? 'border-emerald-200 bg-white'
                                : 'border-indigo-300 bg-white ring-1 ring-indigo-500/15 shadow-xs'
                        }`}
                      >
                        <CardContent className="p-5 space-y-3.5">
                          {/* Unit Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                                  isDone
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : isLocked
                                      ? 'bg-slate-200 text-slate-500'
                                      : 'bg-indigo-600 text-white'
                                }`}
                              >
                                {isLocked ? (
                                  <Lock className="h-4 w-4" />
                                ) : (
                                  unit.unitNumber
                                )}
                              </div>
                              <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                  Unit {unit.unitNumber} • {unit.questionCount} Soal
                                </p>
                                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                                  {unit.title}
                                </h4>
                              </div>
                            </div>

                            {isProLocked ? (
                              <ProBadge size="xs" />
                            ) : (
                              unit.isMilestone && (
                                <Badge variant="warning" className="shrink-0">
                                  <Crown className="h-3 w-3" /> Milestone
                                </Badge>
                              )
                            )}
                          </div>

                          {/* Topics Covered */}
                          <div className="flex flex-wrap gap-1">
                            {unit.topics.slice(0, 3).map((tp) => (
                              <Badge key={tp.slug} variant="neutral" className="text-[10px]">
                                {tp.name} ({tp.count})
                              </Badge>
                            ))}
                            {unit.topics.length > 3 && (
                              <Badge variant="neutral" className="text-[10px]">
                                +{unit.topics.length - 3} topik
                              </Badge>
                            )}
                          </div>

                          {/* Status / Stars / Score */}
                          {isDone && unit.progress ? (
                            <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/80 p-3 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-0.5" title={`${stars} dari 3 bintang`}>
                                  {[1, 2, 3].map((s) => (
                                    <Star
                                      key={s}
                                      className={`h-4 w-4 ${
                                        s <= stars
                                          ? 'fill-amber-400 text-amber-500'
                                          : 'text-slate-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs font-bold text-emerald-800">
                                  Terbaik: {unit.progress.bestScore}/50 ({unit.progress.bestAccuracy}%)
                                </span>
                              </div>
                              <p className="text-[11px] text-emerald-900">
                                Selesai ({unit.progress.attemptsCount}× latihan)
                              </p>
                            </div>
                          ) : isProLocked ? (
                            <div className="rounded-xl bg-amber-50 border border-amber-200/80 p-3 text-xs text-amber-950 flex items-center gap-2">
                              <Crown className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                              <span>
                                Unit 3+ terbuka untuk anggota <strong>Nippia Pro</strong> (Rp 29.000/bulan).
                              </span>
                            </div>
                          ) : isLocked ? (
                            <div className="rounded-xl bg-slate-100 border border-slate-200 p-3 text-xs text-slate-500 flex items-center gap-2">
                              <Lock className="h-3.5 w-3.5 shrink-0" />
                              <span>
                                Selesaikan <strong>Unit {unit.unitNumber - 1}</strong> (10 soal) untuk membuka unit ini.
                              </span>
                            </div>
                          ) : (
                            <div className="rounded-xl bg-indigo-50/60 border border-indigo-200/70 p-3 text-xs text-indigo-950 flex items-center justify-between">
                              <span>
                                {unit.activeSessionId
                                  ? `Progres tersimpan: ${unit.activeAnsweredCount}/10 soal`
                                  : `Tingkat: ${unit.difficultyLabel}`}
                              </span>
                              <Badge variant="indigo">+{unit.isMilestone ? 50 : 25} XP</Badge>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="pt-1">
                            {isProLocked ? (
                              <Link to="/subscription">
                                <Button variant="secondary" size="sm" className="w-full bg-amber-100 text-amber-950 hover:bg-amber-200">
                                  <Crown className="h-3.5 w-3.5 text-amber-600" /> Buka dengan Pro
                                </Button>
                              </Link>
                            ) : isLocked ? (
                              <Button variant="outline" size="sm" className="w-full" disabled>
                                <Lock className="h-3.5 w-3.5" /> Terkunci
                              </Button>
                            ) : isDone ? (
                              <div className="grid grid-cols-2 gap-2">
                                {unit.progress?.lastSessionId ? (
                                  <Link to={`/practice/session/${unit.progress.lastSessionId}`}>
                                    <Button variant="outline" size="sm" className="w-full">
                                      <Eye className="h-3.5 w-3.5" /> Pembahasan
                                    </Button>
                                  </Link>
                                ) : (
                                  <span />
                                )}
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="w-full"
                                  isLoading={isLaunching}
                                  onClick={() => handleStartCampaignUnit(unit)}
                                >
                                  <RotateCcw className="h-3.5 w-3.5" />
                                  {unit.activeSessionId ? 'Lanjutkan' : 'Ulangi'}
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="indigo"
                                size="sm"
                                className="w-full"
                                isLoading={isLaunching}
                                onClick={() => handleStartCampaignUnit(unit)}
                              >
                                <Play className="h-3.5 w-3.5" />
                                {unit.activeSessionId
                                  ? `Lanjutkan (${unit.activeAnsweredCount}/10)`
                                  : 'Mulai Unit (10 Soal)'}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>
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
  const { user } = useAuthStore();
  const isPro = Boolean(user?.isPro);
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
  const [errIsPro, setErrIsPro] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    setErr('');
    setErrIsPro(false);
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
      const apiErr = e instanceof ApiError ? e : null;
      setErr(apiErr?.message || (e instanceof Error ? e.message : 'Gagal memulai latihan.'));
      setErrIsPro(apiErr?.code === 'PRO_REQUIRED');
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
            {!isPro && (
              <ProUpgradeBanner
                compact
                title="Paket Free: Maks. 1 Sesi/Hari & 10 Soal (MIXED • Mode Belajar)"
                description="Filter tingkat kesulitan (HARD/MEDIUM), mode ujian berwaktu (EXAM), dan opsi pintar khusus anggota Nippia Pro."
              />
            )}

            {err && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <span>{err}</span>
                {errIsPro && (
                  <Link to="/subscription">
                    <Button size="sm" variant="indigo">Upgrade Pro</Button>
                  </Link>
                )}
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-700">Jumlah Soal</label>
              <div className="flex flex-wrap gap-2">
                {[5, 10, 15, 20].map((n) => {
                  const locked = !isPro && n > 10;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setQuestionCount(n)}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-semibold cursor-pointer ${
                        questionCount === n
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{n} Soal</span>
                      {locked && <ProBadge size="xs" />}
                    </button>
                  );
                })}
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
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <span>Tingkat Kesulitan</span>
                  {!isPro && <ProBadge size="xs" />}
                </label>
                <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}>
                  <option value="MIXED">Campuran (Gratis & Pro)</option>
                  <option value="EASY">Mudah (Pro)</option>
                  <option value="MEDIUM">Sedang (Pro)</option>
                  <option value="HARD">Sulit (Pro)</option>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <span>Mode Latihan</span>
                  {!isPro && <ProBadge size="xs" />}
                </label>
                <Select value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
                  <option value="PRACTICE">Mode Belajar (Gratis & Pro)</option>
                  <option value="EXAM">Mode Ujian Berwaktu (Pro)</option>
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
                <span>Prioritaskan soal yang pernah salah sebelumnya</span>
                {!isPro && <ProBadge size="xs" />}
              </label>
              <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={avoidRecent}
                  onChange={(e) => setAvoidRecent(e.target.checked)}
                  className="rounded accent-indigo-600"
                />
                <span>Hindari soal yang baru saja dikerjakan</span>
                {!isPro && <ProBadge size="xs" />}
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

interface PracticeSummaryResult {
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  incorrectCount: number;
  accuracyPct: number;
  earnedScore: number;
  maxScore: number;
  xpEarned: number;
  campaignProgress?: {
    subjectCode: 'TWK' | 'TIU' | 'TKP';
    unitNumber: number;
    isCompleted: boolean;
    justUnlockedNext: boolean;
    nextUnitNumber: number | null;
    stars: number;
    bonusCampaignXp: number;
    totalUnits: number;
  } | null;
  topicsToImprove: Array<{ name: string; slug: string; wrong: number }>;
  newAchievements: string[];
}

interface PracticeSessionPayload {
  session: {
    id: string;
    sessionType: string;
    subjectCode: 'TWK' | 'TIU' | 'TKP' | null;
    campaignUnit: number | null;
    title: string;
    mode: 'PRACTICE' | 'EXAM';
    status: 'IN_PROGRESS' | 'SUBMITTED';
    totalQuestions: number;
    timeLimitSec: number | null;
  };
  summary?: PracticeSummaryResult | null;
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
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [lockingAnswer, setLockingAnswer] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [answerError, setAnswerError] = useState('');
  const [draftSelections, setDraftSelections] = useState<Record<string, string>>({});
  const [launchingNext, setLaunchingNext] = useState(false);
  const [summaryResult, setSummaryResult] = useState<PracticeSummaryResult | null>(null);

  useEffect(() => {
    setCurrentIdx(0);
    setElapsedSec(0);
    setSummaryResult(null);
    setDraftSelections({});
    setAnswerError('');
  }, [sessionId]);

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
  const isPracticeMode = data.session.mode === 'PRACTICE';
  const lockedKey = q?.userAnswer?.selectedKey ?? null;
  const isQuestionLocked = isSubmitted || (isPracticeMode && Boolean(lockedKey));
  const pendingKey = q ? (draftSelections[q.id] ?? null) : null;
  const activeSelectedKey = lockedKey ?? (isPracticeMode ? pendingKey : null);
  const displayedSummary = summaryResult ?? (isSubmitted ? (data.summary ?? null) : null);
  const allQuestionsAnswered =
    questions.length > 0 && questions.every((item) => Boolean(item.userAnswer?.selectedKey));
  const showDiscussion = Boolean(
    q && (isSubmitted || (isPracticeMode && lockedKey)),
  );

  const submitAnswerKey = async (questionId: string, key: string) => {
    setLockingAnswer(true);
    setAnswerError('');
    try {
      await apiFetch(`/practice/sessions/${sessionId}/answer`, {
        method: 'POST',
        body: JSON.stringify({
          questionId,
          selectedKey: key,
          timeSpentSec: Math.max(5, Math.round(elapsedSec / Math.max(1, currentIdx + 1))),
        }),
      });
      setDraftSelections((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
      await refetch();
    } catch (err) {
      setAnswerError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : 'Gagal menyimpan dan mengunci jawaban.',
      );
      await refetch();
    } finally {
      setLockingAnswer(false);
    }
  };

  const handleSelectOption = async (key: string) => {
    if (!q || isQuestionLocked || lockingAnswer) return;
    setAnswerError('');
    if (isPracticeMode) {
      // Only stage selection locally; user must click Lanjutkan / Kunci Jawaban to lock & reveal feedback
      setDraftSelections((prev) => ({ ...prev, [q.id]: key }));
      return;
    }
    await submitAnswerKey(q.id, key);
  };

  const handleConfirmPracticeAnswer = async () => {
    if (!q || !pendingKey || isQuestionLocked || lockingAnswer) return;
    await submitAnswerKey(q.id, pendingKey);
  };

  const handleBookmark = async () => {
    if (!q) return;
    await apiFetch(`/dashboard/bookmarks/${q.id}`, { method: 'POST' });
    await refetch();
  };

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      const res = await apiFetch<{ summary: PracticeSummaryResult }>(
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

  const handleRetrySameQuestions = async () => {
    if (!sessionId) return;
    setRetrying(true);
    setAnswerError('');
    try {
      const res = await apiFetch<{ sessionId: string }>(`/practice/sessions/${sessionId}/retry`, {
        method: 'POST',
      });
      navigate(`/practice/session/${res.sessionId}`);
    } catch (err) {
      setAnswerError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : 'Gagal mengulangi latihan dengan soal ini.',
      );
    } finally {
      setRetrying(false);
    }
  };

  const handleStartNextCampaignUnit = async (subjectCode: 'TWK' | 'TIU' | 'TKP', unitNumber: number) => {
    setLaunchingNext(true);
    try {
      const res = await apiFetch<{ sessionId: string }>('/practice/campaign/start', {
        method: 'POST',
        body: JSON.stringify({ subjectCode, unitNumber }),
      });
      navigate(`/practice/session/${res.sessionId}`);
    } finally {
      setLaunchingNext(false);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const isCampaign = data.session.sessionType === 'CAMPAIGN';

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="space-y-1">
            {isCampaign && (
              <Link
                to="/daily-practice#campaign"
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Peta Campaign
              </Link>
            )}
            <p className="text-xs font-semibold text-indigo-600">
              {isCampaign
                ? `CAMPAIGN HARIAN • ${data.session.subjectCode ?? ''} UNIT ${data.session.campaignUnit ?? ''}`
                : data.session.mode === 'PRACTICE'
                  ? 'MODE BELAJAR'
                  : 'MODE UJIAN'}
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
        {displayedSummary && (
          <Card className="border-indigo-200 bg-indigo-50/40">
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Badge variant="success">Sesi Selesai</Badge>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Ringkasan Hasil Latihan
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="indigo" className="text-sm px-3 py-1">
                    <Sparkles className="h-4 w-4" /> +{displayedSummary.xpEarned} XP
                  </Badge>
                  {isSubmitted && allQuestionsAnswered && (
                    <Button
                      variant="indigo"
                      size="sm"
                      isLoading={retrying}
                      onClick={handleRetrySameQuestions}
                    >
                      <RotateCcw className="h-4 w-4" /> Ulangi Latihan (Soal yang Sama)
                    </Button>
                  )}
                </div>
              </div>

              {answerError && isSubmitted && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800">
                  {answerError}
                </div>
              )}

              {displayedSummary.campaignProgress && (
                <div
                  className={`rounded-xl border p-4 flex flex-wrap items-center justify-between gap-3 ${
                    displayedSummary.campaignProgress.isCompleted
                      ? 'border-emerald-300 bg-emerald-50/80 text-emerald-950'
                      : 'border-amber-300 bg-amber-50/80 text-amber-950'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">
                        {displayedSummary.campaignProgress.isCompleted
                          ? `Unit ${displayedSummary.campaignProgress.unitNumber} (${displayedSummary.campaignProgress.subjectCode}) Tuntas!`
                          : `Unit ${displayedSummary.campaignProgress.unitNumber} Belum Tuntas`}
                      </span>
                      {displayedSummary.campaignProgress.isCompleted && (
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`h-4 w-4 ${
                                s <= (displayedSummary.campaignProgress?.stars ?? 0)
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs">
                      {displayedSummary.campaignProgress.isCompleted
                        ? displayedSummary.campaignProgress.justUnlockedNext &&
                          displayedSummary.campaignProgress.nextUnitNumber
                          ? `Unit ${displayedSummary.campaignProgress.nextUnitNumber} (${displayedSummary.campaignProgress.subjectCode}) kini telah terbuka!`
                          : 'Unit ini tercatat selesai dan progres bintang Anda telah diperbarui.'
                        : `Anda baru menjawab ${displayedSummary.answeredCount} dari ${displayedSummary.totalQuestions} soal. Jawab seluruh 10 soal untuk menuntaskan unit dan membuka unit berikutnya.`}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link to="/daily-practice#campaign">
                      <Button variant="outline" size="sm">Peta Campaign</Button>
                    </Link>
                    {displayedSummary.campaignProgress.isCompleted &&
                      displayedSummary.campaignProgress.nextUnitNumber && (
                        <Button
                          variant="indigo"
                          size="sm"
                          isLoading={launchingNext}
                          onClick={() =>
                            handleStartNextCampaignUnit(
                              displayedSummary.campaignProgress!.subjectCode,
                              displayedSummary.campaignProgress!.nextUnitNumber!,
                            )
                          }
                        >
                          Lanjut ke Unit {displayedSummary.campaignProgress.nextUnitNumber}{' '}
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl bg-white p-3.5 border border-slate-200">
                  <p className="text-xs text-slate-500">Terjawab / Total</p>
                  <p className="text-lg font-bold text-slate-900">
                    {displayedSummary.answeredCount} / {displayedSummary.totalQuestions}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3.5 border border-slate-200">
                  <p className="text-xs text-slate-500">Tepat / Kurang Tepat</p>
                  <p className="text-lg font-bold text-emerald-700">
                    {displayedSummary.correctCount} / {displayedSummary.incorrectCount}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3.5 border border-slate-200">
                  <p className="text-xs text-slate-500">Akurasi</p>
                  <p className="text-lg font-bold text-indigo-700">{displayedSummary.accuracyPct}%</p>
                </div>
                <div className="rounded-xl bg-white p-3.5 border border-slate-200">
                  <p className="text-xs text-slate-500">Skor Poin</p>
                  <p className="text-lg font-bold text-slate-900">
                    {displayedSummary.earnedScore} / {displayedSummary.maxScore}
                  </p>
                </div>
              </div>
              {displayedSummary.topicsToImprove.length > 0 && (
                <div className="rounded-xl bg-white p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-700 mb-2">
                    Topik yang Perlu Diperkuat:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {displayedSummary.topicsToImprove.map((t) => (
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
                    <div className="flex items-center gap-1.5">
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
                      <ReportQuestionButton questionId={q.id} questionCode={q.code} />
                    </div>
                  </div>

                  <p className="text-base leading-relaxed text-slate-900 font-medium">{q.stem}</p>

                  {q.visualSpec && <FiguralRenderer spec={q.visualSpec} />}

                  <div className="space-y-2.5 pt-2">
                    {isPracticeMode && isQuestionLocked && !isSubmitted && (
                      <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                        <Lock className="h-3 w-3 text-slate-500" />
                        Jawaban Anda ({lockedKey}) sudah dikunci dan tidak dapat diubah
                      </div>
                    )}
                    {isPracticeMode && !isQuestionLocked && (
                      <p className="text-xs text-slate-500">
                        {pendingKey
                          ? `Opsi ${pendingKey} dipilih sementara. Klik "Lanjutkan & Kunci Jawaban" di bawah untuk mengunci dan melihat pembahasan.`
                          : 'Pilih salah satu opsi jawaban, lalu klik "Lanjutkan & Kunci Jawaban".'}
                      </p>
                    )}
                    {answerError && (
                      <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800">
                        {answerError}
                      </div>
                    )}
                    {q.options.map((opt) => {
                      const isSelected = activeSelectedKey === opt.optionKey;
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
                          disabled={isQuestionLocked || lockingAnswer}
                          onClick={() => handleSelectOption(opt.optionKey)}
                          className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                            isQuestionLocked ? 'cursor-default' : 'cursor-pointer'
                          } ${stateStyle}`}
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
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100">
                    <Button
                      variant="outline"
                      disabled={currentIdx === 0 || lockingAnswer}
                      onClick={() => {
                        setAnswerError('');
                        setCurrentIdx((i) => Math.max(0, i - 1));
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" /> Sebelumnya
                    </Button>
                    {isPracticeMode && !isQuestionLocked ? (
                      pendingKey ? (
                        <Button
                          variant="indigo"
                          isLoading={lockingAnswer}
                          onClick={handleConfirmPracticeAnswer}
                        >
                          <Lock className="h-4 w-4" /> Lanjutkan &amp; Kunci Jawaban
                        </Button>
                      ) : currentIdx < questions.length - 1 ? (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setAnswerError('');
                            setCurrentIdx((i) => Math.min(questions.length - 1, i + 1));
                          }}
                        >
                          Lewati ke Berikutnya <ChevronRight className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="indigo" onClick={handleFinish} isLoading={submitting}>
                          Selesaikan &amp; Lihat Skor
                        </Button>
                      )
                    ) : currentIdx < questions.length - 1 ? (
                      <Button
                        variant="primary"
                        onClick={() => {
                          setAnswerError('');
                          setCurrentIdx((i) => Math.min(questions.length - 1, i + 1));
                        }}
                      >
                        Berikutnya <ChevronRight className="h-4 w-4" />
                      </Button>
                    ) : !isSubmitted ? (
                      <Button variant="indigo" onClick={handleFinish} isLoading={submitting}>
                        Selesaikan &amp; Lihat Skor
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
