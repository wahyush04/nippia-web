import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, BarChart3, Clock, Target } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
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

interface WeaknessPayload {
  thresholds: { MASTERED: number; GOOD: number; DEVELOPING: number; MIN_SAMPLES: number };
  subjectComparison: Array<{
    subjectCode: 'TWK' | 'TIU' | 'TKP';
    totalAnswered: number;
    correctCount: number;
    accuracyPct: number;
    avgTimeSec: number;
  }>;
  topicAnalysis: Array<{
    topicId: string;
    topicName: string;
    topicSlug: string;
    subjectCode: 'TWK' | 'TIU' | 'TKP';
    category: string | null;
    attemptsCount: number;
    correctCount: number;
    accuracyPct: number;
    avgTimeSec: number;
    masteryLevel: string;
    masteryLabel: string;
    hasSufficientData: boolean;
    recommendation: string;
  }>;
  weakestTopics: Array<{
    topicName: string;
    topicSlug: string;
    subjectCode: string;
    accuracyPct: number;
    attemptsCount: number;
    masteryLabel: string;
    recommendation: string;
  }>;
  insufficientDataCount: number;
  difficultyBreakdown: Array<{
    difficulty: string;
    label: string;
    total: number;
    correct: number;
    accuracyPct: number;
  }>;
  activityTrend: Array<{
    date: string;
    questionsAnswered: number;
    accuracyPct: number;
    studyMinutes: number;
  }>;
}

export function WeaknessAnalyticsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['weakness-analytics'],
    queryFn: () => apiFetch<WeaknessPayload>('/analytics/weakness'),
  });

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingState label="Menganalisis riwayat performa Anda..." />
      </AppLayout>
    );
  }
  if (error || !data) {
    return (
      <AppLayout>
        <ErrorState message={(error as Error)?.message || 'Gagal memuat analisis.'} onRetry={refetch} />
      </AppLayout>
    );
  }

  const heatColor = (level: string) => {
    switch (level) {
      case 'MASTERED':
        return 'bg-emerald-50 border-emerald-200 text-emerald-900';
      case 'GOOD':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'DEVELOPING':
        return 'bg-amber-50 border-amber-200 text-amber-900';
      case 'NEEDS_IMPROVEMENT':
        return 'bg-red-50 border-red-200 text-red-900';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-600';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge variant="indigo">Analitik Diagnostik</Badge>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Analisis Kelemahan & Penguasaan</h1>
            <p className="mt-1 text-sm text-slate-600">
              Klasifikasi pembelajaran internal (Menguasai ≥85%, Baik 70–84%, Berkembang 50–69%, Perlu
              Ditingkatkan &lt;50%). Minimal {data.thresholds.MIN_SAMPLES} sampel per topik sebelum
              ditetapkan sebagai kelemahan.
            </p>
          </div>
        </div>

        {/* Weakness Ranking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Prioritas Perbaikan Berdasarkan Data Nyata
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.weakestTopics.length === 0 ? (
              <p className="text-sm text-slate-600">
                Belum ada topik dengan ≥{data.thresholds.MIN_SAMPLES} sampel yang tergolong lemah.
                Terdapat <strong>{data.insufficientDataCount}</strong> topik yang masih membutuhkan
                lebih banyak sampel latihan.
              </p>
            ) : (
              data.weakestTopics.map((w) => (
                <div
                  key={w.topicSlug}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4 sm:flex-row sm:items-center"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="navy">{w.subjectCode}</Badge>
                      <span className="font-bold text-slate-900">{w.topicName}</span>
                      <Badge variant="danger">
                        Akurasi {w.accuracyPct}% • {w.masteryLabel}
                      </Badge>
                      <span className="text-xs text-slate-500">({w.attemptsCount} sampel)</span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-700">{w.recommendation}</p>
                  </div>
                  <Link to={`/practice/topic/${w.topicSlug}`}>
                    <Button variant="indigo" size="sm" className="shrink-0">
                      Latih Topik Ini
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Charts Row */}
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-indigo-600" />
                Perbandingan Performa Subtes & Kesulitan
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="h-56">
                <p className="mb-2 text-xs font-semibold text-slate-500">Akurasi per Subtes (%)</p>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={data.subjectComparison}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="subjectCode" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="accuracyPct" name="Akurasi %" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="h-56">
                <p className="mb-2 text-xs font-semibold text-slate-500">Akurasi per Tingkat Kesulitan</p>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={data.difficultyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="accuracyPct" name="Akurasi %" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-indigo-600" />
                Tren Akurasi Seiring Waktu
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.activityTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="accuracyPct"
                    name="Akurasi %"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Topic Mastery Heatmap Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Peta Penguasaan 24 Topik (Heatmap)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {data.topicAnalysis.map((t) => (
              <Link
                key={t.topicId}
                to={`/practice/topic/${t.topicSlug}`}
                className={`rounded-xl border p-3.5 transition-transform hover:-translate-y-0.5 ${heatColor(t.masteryLevel)}`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>{t.subjectCode}</span>
                  <span>{t.hasSufficientData ? `${t.accuracyPct}%` : `${t.attemptsCount}/5 sampel`}</span>
                </div>
                <p className="mt-1 text-sm font-bold">{t.topicName}</p>
                <p className="mt-0.5 text-[11px] opacity-80">{t.masteryLabel}</p>
                <div className="mt-2">
                  <ProgressBar value={t.hasSufficientData ? t.accuracyPct : (t.attemptsCount / 5) * 100} />
                </div>
                <p className="mt-2 flex items-center gap-1 text-[11px] opacity-75">
                  <Clock className="h-3 w-3" /> Rata-rata {t.avgTimeSec} dtk/soal
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
