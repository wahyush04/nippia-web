import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Award, CheckCircle2, Flame, Lock, Shield, Trophy, User } from 'lucide-react';
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
  Textarea,
} from '../../components/ui';

interface GamificationData {
  totalXp: number;
  levelInfo: { name: string; minXp: number; nextXp: number | null; nextLevelName: string | null; progressPct: number };
  streak: { currentStreak: number; longestStreak: number; historyDates: string[] } | null;
  achievements: Array<{
    id: string;
    code: string;
    title: string;
    description: string;
    xpReward: number;
    category: string;
    unlocked: boolean;
    unlockedAt: string | null;
  }>;
  xpHistory: Array<{ id: string; amount: number; source: string; note: string; createdAt: string }>;
  dailyChallenges: Array<{ id: string; title: string; progress: number; target: number; completed: boolean; rewardXp: number }>;
  leaderboards: {
    weeklyXp: Array<{ rank: number; userId: string; name: string; isMe: boolean; totalXp: number; levelName: string; currentStreak: number }>;
    simulationScore: Array<{ rank: number; userId: string; name: string; isMe: boolean; bestSimScore: number; levelName: string }>;
  };
}

export function LeaderboardPage() {
  const [tab, setTab] = useState<'weekly' | 'sim'>('weekly');
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['gamification'],
    queryFn: () => apiFetch<GamificationData>('/dashboard/gamification'),
  });

  if (isLoading || !data) {
    return (
      <AppLayout>
        <LoadingState label="Memuat papan peringkat..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge variant="indigo">Komunitas Pejuang ASN</Badge>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Papan Peringkat</h1>
            <p className="mt-1 text-sm text-slate-600">
              Menampilkan pengguna yang mengaktifkan visibilitas peringkat publik di menu Pengaturan.
            </p>
          </div>
          {user?.preferences?.isLeaderboardPublic === false && (
            <Badge variant="warning">Profil Anda sedang disembunyikan (Privat)</Badge>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setTab('weekly')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer ${
              tab === 'weekly' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            Peringkat XP Belajar
          </button>
          <button
            onClick={() => setTab('sim')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer ${
              tab === 'sim' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            Skor Tertinggi Simulasi CAT
          </button>
        </div>

        <Card>
          <CardContent className="p-0 divide-y divide-slate-100">
            {tab === 'weekly' ? (
              data.leaderboards.weeklyXp.map((row) => (
                <div
                  key={row.userId}
                  className={`flex items-center justify-between px-5 py-4 ${
                    row.isMe ? 'bg-indigo-50/70' : ''
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-800">
                      #{row.rank}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {row.name} {row.isMe && <Badge variant="indigo">Anda</Badge>}
                      </p>
                      <p className="text-xs text-slate-500">
                        {row.levelName} • Streak {row.currentStreak} hari
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-indigo-700">{row.totalXp} XP</p>
                </div>
              ))
            ) : data.leaderboards.simulationScore.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">Belum ada skor simulasi tercatat.</p>
            ) : (
              data.leaderboards.simulationScore.map((row) => (
                <div
                  key={row.userId}
                  className={`flex items-center justify-between px-5 py-4 ${
                    row.isMe ? 'bg-indigo-50/70' : ''
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-800">
                      #{row.rank}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {row.name} {row.isMe && <Badge variant="indigo">Anda</Badge>}
                      </p>
                      <p className="text-xs text-slate-500">{row.levelName}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-emerald-700">{row.bestSimScore} / 550</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export function AchievementsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['gamification'],
    queryFn: () => apiFetch<GamificationData>('/dashboard/gamification'),
  });

  if (isLoading || !data) {
    return (
      <AppLayout>
        <LoadingState label="Memuat lencana & pencapaian..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-slate-900 text-white">
            <CardContent className="p-5 space-y-2">
              <p className="text-xs text-indigo-300">Level Saat Ini</p>
              <p className="text-2xl font-bold">{data.levelInfo.name}</p>
              <ProgressBar value={data.levelInfo.progressPct} colorClass="bg-indigo-400" />
              <p className="text-xs text-slate-300">
                {data.totalXp} XP {data.levelInfo.nextXp ? `• Menuju ${data.levelInfo.nextLevelName} (${data.levelInfo.nextXp} XP)` : '• Level Tertinggi'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-1">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                <Flame className="h-4 w-4 text-amber-500" /> Rekor Streak
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {data.streak?.currentStreak ?? 0} Hari Aktif
              </p>
              <p className="text-xs text-slate-500">
                Terpanjang: {data.streak?.longestStreak ?? 0} hari berturut-turut
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-2">
              <p className="text-xs font-semibold text-slate-500">Tantangan Harian</p>
              {data.dailyChallenges.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-xs">
                  <span className={c.completed ? 'line-through text-slate-400' : 'text-slate-700'}>
                    {c.title}
                  </span>
                  <Badge variant={c.completed ? 'success' : 'neutral'}>
                    {c.progress}/{c.target}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-4 w-4 text-indigo-600" />
              Daftar Lencana Pencapaian
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.achievements.map((a) => (
              <div
                key={a.id}
                className={`rounded-xl border p-4 ${
                  a.unlocked
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-slate-200 bg-slate-50/60 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Badge variant={a.unlocked ? 'success' : 'neutral'}>
                    {a.unlocked ? <CheckCircle2 className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                    {a.unlocked ? 'Terbuka' : 'Terkunci'}
                  </Badge>
                  <span className="text-xs font-bold text-indigo-600">+{a.xpReward} XP</span>
                </div>
                <p className="mt-2.5 text-sm font-bold text-slate-900">{a.title}</p>
                <p className="mt-1 text-xs text-slate-600">{a.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export function ProfilePage() {
  const { user, fetchMe } = useAuthStore();
  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.profile?.bio ?? '');
  const [targetAgency, setTargetAgency] = useState(user?.profile?.targetAgency ?? '');
  const [targetScore, setTargetScore] = useState(user?.profile?.targetScore ?? 380);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, bio, targetAgency, targetScore }),
      });
      await fetchMe();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Profil Peserta</h1>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Nama Lengkap</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Instansi Tujuan (Opsional)</label>
                <Input
                  placeholder="Contoh: Kementerian Keuangan / Pemprov DKI"
                  value={targetAgency}
                  onChange={(e) => setTargetAgency(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Target Skor SKD</label>
                <Input
                  type="number"
                  min={150}
                  max={550}
                  value={targetScore}
                  onChange={(e) => setTargetScore(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Bio Singkat</label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
              <Button type="submit" variant="indigo" isLoading={saving}>
                {saved ? 'Profil Tersimpan ✓' : 'Simpan Perubahan'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export function SettingsPage() {
  const { user, fetchMe } = useAuthStore();
  const [isPublic, setIsPublic] = useState(user?.preferences?.isLeaderboardPublic ?? true);
  const [showTricks, setShowTricks] = useState(user?.preferences?.showQuickTricks ?? true);
  const [disabilityExtraTime, setDisabilityExtraTime] = useState(
    user?.preferences?.disabilityExtraTime ?? false,
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiFetch('/auth/preferences', {
        method: 'PUT',
        body: JSON.stringify({
          isLeaderboardPublic: isPublic,
          showQuickTricks: showTricks,
          disabilityExtraTime,
        }),
      });
      await fetchMe();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pengaturan Belajar & Privasi</h1>
          <p className="mt-1 text-sm text-slate-600">
            Kelola privasi papan peringkat, aksesibilitas durasi CAT, dan preferensi tampilan pembahasan.
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="mt-1 accent-indigo-600"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-indigo-600" /> Tampilkan Profil Saya di Papan Peringkat Publik
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Jika dimatikan, nama dan skor Anda tidak akan ditampilkan ke peserta lain.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 cursor-pointer">
              <input
                type="checkbox"
                checked={showTricks}
                onChange={(e) => setShowTricks(e.target.checked)}
                className="mt-1 accent-indigo-600"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">Tampilkan Trik Cepat pada Pembahasan</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Menampilkan bagian trik ringkas yang dapat dibuka-tutup di bawah pembahasan soal.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 cursor-pointer">
              <input
                type="checkbox"
                checked={disabilityExtraTime}
                onChange={(e) => setDisabilityExtraTime(e.target.checked)}
                className="mt-1 accent-indigo-600"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Durasi Khusus Formasi Disabilitas Sensorik Netra (130 Menit)
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Menyesuaikan timer Simulasi CAT standar penuh dari 100 menit menjadi 130 menit sesuai konfigurasi aktif.
                </p>
              </div>
            </label>

            <Button variant="indigo" onClick={handleSave} isLoading={saving}>
              {saved ? 'Pengaturan Disimpan ✓' : 'Simpan Pengaturan'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
