import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Flame,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
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
import { apiFetch } from '../../lib/api';
import { AppLayout } from '../../components/layout/AppLayout';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorState,
  LoadingState,
  ProgressBar,
} from '../../components/ui';

interface OverviewResponse {
  user: {
    name: string;
    totalXp: number;
    levelInfo: { name: string; progressPct: number; nextXp: number | null; nextLevelName: string | null };
    onboardingCompleted: boolean;
    targetScore: number;
  };
  motivation: string;
  todayDate: string;
  dailyGoal: {
    targetCount: number;
    completedCount: number;
    remainingCount: number;
    completionPct: number;
    twkTarget: number;
    tiuTarget: number;
    tkpTarget: number;
    isCompleted: boolean;
  };
  streak: { currentStreak: number; longestStreak: number };
  performanceOverview: {
    totalAnswered: number;
    overallAccuracy: number;
    avgSimScore: number;
    totalStudyMinutes: number;
    completedSimulations: number;
  };
  subjectPerformance: Array<{
    subjectCode: 'TWK' | 'TIU' | 'TKP';
    totalAnswered: number;
    correctCount: number;
    accuracyPct: number;
    avgTimeSec: number;
  }>;
  weakestTopics: Array<{
    topicSlug: string;
    topicName: string;
    subjectCode: string;
    accuracyPct: number;
    attemptsCount: number;
  }>;
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    actionPath: string;
    badge: string;
  }>;
  weeklyActivity: Array<{ date: string; label: string; questions: number; accuracy: number }>;
  upcomingTasks: Array<{
    id: string;
    scheduledDate: string;
    dayLabel: string;
    title: string;
    taskType: string;
    questionCount: number;
  }>;
}

export function DashboardPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => apiFetch<OverviewResponse>('/dashboard/overview'),
  });

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingState label="Menyiapkan ringkasan belajar Anda..." />
      </AppLayout>
    );
  }
  if (error || !data) {
    return (
      <AppLayout>
        <ErrorState message={(error as Error)?.message || 'Gagal memuat dasbor.'} onRetry={refetch} />
      </AppLayout>
    );
  }

  const formattedDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* A. Welcome Header */}
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 md:flex-row md:items-center">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="indigo">
                <Sparkles className="h-3 w-3" /> {data.user.levelInfo.name}
              </Badge>
              <span className="text-xs text-slate-500">{formattedDate}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Halo, {data.user.name}!
            </h1>
            <p className="text-sm text-slate-600">{data.motivation}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-center">
              <p className="flex items-center justify-center gap-1 text-xs font-semibold text-amber-800">
                <Flame className="h-3.5 w-3.5 text-amber-600" /> Streak Belajar
              </p>
              <p className="text-lg font-bold text-amber-950">{data.streak.currentStreak} Hari</p>
            </div>
            <Link to="/daily-practice">
              <Button variant="indigo" size="lg">
                Mulai Latihan Harian
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* B. Daily Learning Progress & C. Performance Overview */}
        <div className="grid gap-5 lg:grid-cols-12">
          <Card className="lg:col-span-5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Progres Target Harian</CardTitle>
                <p className="mt-0.5 text-xs text-slate-500">
                  Komposisi: TWK {data.dailyGoal.twkTarget} • TIU {data.dailyGoal.tiuTarget} • TKP{' '}
                  {data.dailyGoal.tkpTarget}
                </p>
              </div>
              <Badge variant={data.dailyGoal.isCompleted ? 'success' : 'indigo'}>
                {data.dailyGoal.completionPct}%
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProgressBar
                value={data.dailyGoal.completionPct}
                colorClass={data.dailyGoal.isCompleted ? 'bg-emerald-600' : 'bg-indigo-600'}
                className="h-3"
              />
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Target</p>
                  <p className="text-lg font-bold text-slate-900">{data.dailyGoal.targetCount}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3">
                  <p className="text-xs text-emerald-700">Selesai</p>
                  <p className="text-lg font-bold text-emerald-800">{data.dailyGoal.completedCount}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Tersisa</p>
                  <p className="text-lg font-bold text-slate-900">{data.dailyGoal.remainingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
            {[
              {
                label: 'Total Soal Selesai',
                value: data.performanceOverview.totalAnswered,
                icon: CheckCircle2,
                tone: 'text-indigo-600 bg-indigo-50',
              },
              {
                label: 'Akurasi Keseluruhan',
                value: `${data.performanceOverview.overallAccuracy}%`,
                icon: TrendingUp,
                tone: 'text-emerald-600 bg-emerald-50',
              },
              {
                label: 'Rata-rata Simulasi CAT',
                value: data.performanceOverview.avgSimScore > 0 ? `${data.performanceOverview.avgSimScore}/550` : 'Belum ada',
                icon: Timer,
                tone: 'text-blue-700 bg-blue-50',
              },
              {
                label: 'Total Waktu & Simulasi',
                value: `${data.performanceOverview.totalStudyMinutes} mnt • ${data.performanceOverview.completedSimulations} CAT`,
                icon: Clock,
                tone: 'text-amber-600 bg-amber-50',
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.tone}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                      <p className="mt-0.5 text-xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* D. Subject Performance Cards (TWK, TIU, TKP) */}
        <div className="grid gap-4 md:grid-cols-3">
          {data.subjectPerformance.map((subj) => {
            const titleMap = {
              TWK: 'TWK — Wawasan Kebangsaan',
              TIU: 'TIU — Intelegensia Umum',
              TKP: 'TKP — Karakteristik Pribadi',
            };
            const strength =
              subj.totalAnswered < 5
                ? { label: 'Data Awal', variant: 'neutral' as const }
                : subj.accuracyPct >= 75
                  ? { label: 'Kuat', variant: 'success' as const }
                  : subj.accuracyPct >= 55
                    ? { label: 'Berkembang', variant: 'warning' as const }
                    : { label: 'Perlu Fokus', variant: 'danger' as const };

            return (
              <Card key={subj.subjectCode}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="navy">{subj.subjectCode}</Badge>
                    <Badge variant={strength.variant}>{strength.label}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{titleMap[subj.subjectCode]}</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{subj.accuracyPct}%</p>
                  </div>
                  <ProgressBar
                    value={subj.accuracyPct}
                    colorClass={
                      subj.accuracyPct >= 75
                        ? 'bg-emerald-600'
                        : subj.accuracyPct >= 55
                          ? 'bg-amber-500'
                          : 'bg-indigo-600'
                    }
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{subj.totalAnswered} soal dikerjakan</span>
                    <span>~{subj.avgTimeSec} dtk/soal</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* E. Weakness Detection & F. Recommended Next Activities */}
        <div className="grid gap-5 lg:grid-cols-12">
          <Card className="lg:col-span-5">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Deteksi 3 Topik Terlemah
              </CardTitle>
              <Link to="/analytics" className="text-xs font-semibold text-indigo-600 hover:underline">
                Lihat Detail
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.weakestTopics.length === 0 ? (
                <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
                  Belum cukup sampel (minimal 5 soal per topik) untuk menentukan topik terlemah.
                  Lanjutkan latihan agar sistem menganalisis pola Anda secara akurat.
                </div>
              ) : (
                data.weakestTopics.map((w) => (
                  <div
                    key={w.topicSlug}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3.5"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="neutral">{w.subjectCode}</Badge>
                        <p className="text-sm font-semibold text-slate-900">{w.topicName}</p>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Akurasi {w.accuracyPct}% ({w.attemptsCount} sampel)
                      </p>
                    </div>
                    <Link to={`/practice/topic/${w.topicSlug}`}>
                      <Button size="sm" variant="outline">
                        Latih
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-7">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-4 w-4 text-indigo-600" />
                Rekomendasi Aktivitas Berikutnya
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {data.recommendations.map((rec) => (
                <Link
                  key={rec.id}
                  to={rec.actionPath}
                  className="group rounded-xl border border-slate-200 p-4 transition-all hover:border-indigo-300 hover:bg-indigo-50/30"
                >
                  <Badge variant="indigo">{rec.badge}</Badge>
                  <p className="mt-2 text-sm font-semibold text-slate-900 group-hover:text-indigo-700">
                    {rec.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{rec.description}</p>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* G. Weekly Learning Activity & H. Upcoming Study Schedule */}
        <div className="grid gap-5 lg:grid-cols-12">
          <Card className="lg:col-span-7">
            <CardHeader>
              <CardTitle>Aktivitas Belajar 7 Hari Terakhir</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0', fontSize: 12 }}
                    formatter={(value: number, name: string) => [
                      name === 'questions' ? `${value} soal` : `${value}%`,
                      name === 'questions' ? 'Soal Selesai' : 'Akurasi',
                    ]}
                  />
                  <Bar dataKey="questions" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-5">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-indigo-600" />
                Jadwal Belajar Mendatang
              </CardTitle>
              <Link to="/planner" className="text-xs font-semibold text-indigo-600 hover:underline">
                Kelola
              </Link>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {data.upcomingTasks.length === 0 ? (
                <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
                  Belum ada jadwal aktif. Buka menu Perencana Belajar untuk menyusun jadwal adaptif.
                </div>
              ) : (
                data.upcomingTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5"
                  >
                    <div>
                      <p className="text-xs font-semibold text-indigo-600">
                        {t.dayLabel}, {t.scheduledDate}
                      </p>
                      <p className="text-sm font-medium text-slate-900">{t.title}</p>
                    </div>
                    <Badge variant="neutral">{t.questionCount} soal</Badge>
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
