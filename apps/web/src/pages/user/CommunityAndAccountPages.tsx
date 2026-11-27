import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Award, CheckCircle2, Crown, Flame, KeyRound, Link2, Lock, Shield, Trophy, Unlink, User } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';
import { AppLayout } from '../../components/layout/AppLayout';
import { ProBadge } from '../../components/ui/ProBadge';
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
    weeklyXp: Array<{ rank: number; userId: string; name: string; isMe: boolean; isPro?: boolean; totalXp: number; levelName: string; currentStreak: number }>;
    simulationScore: Array<{ rank: number; userId: string; name: string; isMe: boolean; isPro?: boolean; bestSimScore: number; levelName: string }>;
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
                      <p className="flex flex-wrap items-center gap-1.5 text-sm font-bold text-slate-900">
                        <span>{row.name}</span>
                        {row.isPro && <ProBadge size="xs" />}
                        {row.isMe && <Badge variant="indigo">Anda</Badge>}
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
                      <p className="flex flex-wrap items-center gap-1.5 text-sm font-bold text-slate-900">
                        <span>{row.name}</span>
                        {row.isPro && <ProBadge size="xs" />}
                        {row.isMe && <Badge variant="indigo">Anda</Badge>}
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <User className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">Profil Peserta</h1>
                {user?.isPro ? <ProBadge /> : <Badge variant="neutral">Paket Free</Badge>}
              </div>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
          <Link to="/subscription">
            <Button variant={user?.isPro ? 'outline' : 'indigo'} size="sm">
              <Crown className="h-4 w-4" />
              {user?.isPro ? 'Kelola Langganan Pro' : 'Upgrade ke Pro — Rp 29.000/bln'}
            </Button>
          </Link>
        </div>

        <Card className={user?.isPro ? 'border-amber-300/80 bg-amber-50/40' : 'border-slate-200'}>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                {user?.isPro ? (
                  <>
                    Status Keanggotaan: Nippia Pro <ProBadge size="xs" />
                  </>
                ) : (
                  'Status Keanggotaan: Paket Free'
                )}
              </p>
              <p className="text-xs text-slate-600">
                {user?.subscription
                  ? `${user.subscription.planName} • Aktif hingga ${new Date(user.subscription.expiresAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })} (${user.subscription.daysRemaining} hari lagi)`
                  : user?.isPro
                    ? 'Akses Penuh Pro Aktif'
                    : 'Upgrade ke Nippia Pro (Rp 29.000/bulan) untuk membuka seluruh 41 Unit Campaign, 420+ soal, dan Simulasi CAT unlimited.'}
              </p>
            </div>
            <Link to="/subscription" className="text-xs font-semibold text-indigo-700 hover:underline">
              Lihat Detail Paket →
            </Link>
          </CardContent>
        </Card>

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

  // Account Binding & Password state
  const [bindMessage, setBindMessage] = useState<string | null>(null);
  const [bindError, setBindError] = useState<string | null>(null);
  const [unlinking, setUnlinking] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

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

  const handleLinkGoogle = async (credential: string) => {
    setBindError(null);
    setBindMessage(null);
    const res = await apiFetch<{ googleEmail: string | null }>('/auth/google/link', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
    await fetchMe();
    setBindMessage(
      `Akun Google (${res.googleEmail || 'terverifikasi'}) berhasil ditautkan! Anda kini bisa masuk via Google maupun email.`,
    );
  };

  const handleUnlinkGoogle = async () => {
    setBindError(null);
    setBindMessage(null);
    setUnlinking(true);
    try {
      await apiFetch('/auth/google/link', { method: 'DELETE' });
      await fetchMe();
      setBindMessage('Tautan akun Google berhasil diputuskan.');
    } catch (err) {
      setBindError(err instanceof Error ? err.message : 'Gagal memutus tautan Google.');
    } finally {
      setUnlinking(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBindError(null);
    setBindMessage(null);
    if (newPassword.length < 8) {
      setBindError('Kata sandi baru minimal 8 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setBindError('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    setSavingPassword(true);
    try {
      await apiFetch('/auth/set-password', {
        method: 'POST',
        body: JSON.stringify({ password: newPassword }),
      });
      await fetchMe();
      setNewPassword('');
      setConfirmPassword('');
      setBindMessage('Kata sandi lokal berhasil dibuat. Anda kini bisa masuk menggunakan email atau Google.');
    } catch (err) {
      setBindError(err instanceof Error ? err.message : 'Gagal menyimpan kata sandi.');
    } finally {
      setSavingPassword(false);
    }
  };

  const googleLinked = Boolean(user?.googleLinked);
  const hasPassword = user?.hasPassword ?? user?.authProvider !== 'GOOGLE';

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pengaturan Akun & Belajar</h1>
          <p className="mt-1 text-sm text-slate-600">
            Kelola penautan akun Google, metode masuk, privasi peringkat, dan preferensi ujian CAT.
          </p>
        </div>

        {/* Account Binding Card */}
        <Card>
          <CardHeader className="border-b border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Link2 className="h-4 w-4 text-indigo-600" />
                Koneksi Akun & Metode Masuk (Binding Google)
              </CardTitle>
              <Badge variant={googleLinked ? 'success' : 'neutral'}>
                {googleLinked && hasPassword
                  ? 'Email + Google (Hybrid)'
                  : googleLinked
                    ? 'Google Terhubung'
                    : 'Akun Email Lokal'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 text-xs space-y-1">
              <p className="text-slate-500">Email Akun Nippia:</p>
              <p className="font-semibold text-slate-900">{user?.email}</p>
            </div>

            {bindMessage && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-medium text-emerald-800">
                {bindMessage}
              </div>
            )}
            {bindError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
                {bindError}
              </div>
            )}

            {googleLinked ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Akun Google Terhubung
                  </p>
                  <p className="text-xs text-emerald-900">
                    Tertaut ke: <strong>{user?.googleEmail || user?.email}</strong>
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  isLoading={unlinking}
                  disabled={!hasPassword}
                  onClick={handleUnlinkGoogle}
                  title={
                    !hasPassword
                      ? 'Buat kata sandi lokal terlebih dahulu sebelum memutus tautan Google'
                      : 'Putuskan tautan akun Google'
                  }
                >
                  <Unlink className="h-3.5 w-3.5" /> Putuskan Tautan
                </Button>
              </div>
            ) : (
              <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/40 p-4 space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">Tautkan dengan Akun Google</p>
                  <p className="text-xs leading-relaxed text-slate-600">
                    Hubungkan akun email manual ini dengan akun Google Anda (meskipun alamat Gmail berbeda)
                    agar dapat login langsung dengan tombol <strong>Sign In with Google</strong> tanpa kehilangan progres.
                  </p>
                </div>
                <div className="max-w-sm">
                  <GoogleSignInButton
                    mode="signin"
                    onCredential={handleLinkGoogle}
                    onError={(msg) => setBindError(msg)}
                  />
                </div>
              </div>
            )}

            {!hasPassword && (
              <form
                onSubmit={handleSetPassword}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                    <KeyRound className="h-4 w-4 text-indigo-600" /> Tambah Kata Sandi Lokal
                  </p>
                  <p className="text-xs text-slate-600">
                    Akun ini dibuat lewat Google. Atur kata sandi jika ingin bisa masuk juga lewat form email & sandi.
                  </p>
                </div>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <Input
                    type="password"
                    placeholder="Kata sandi baru (min. 8 karakter)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder="Ulangi kata sandi"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" size="sm" variant="secondary" isLoading={savingPassword}>
                  Simpan Kata Sandi Lokal
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

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
                <p className="text-sm font-semibold text-slate-900 flex flex-wrap items-center gap-2">
                  <span>Durasi Khusus Formasi Disabilitas Sensorik Netra (130 Menit)</span>
                  <ProBadge size="xs" />
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Menyesuaikan timer Simulasi CAT standar penuh dari 100 menit menjadi 130 menit sesuai konfigurasi aktif (khusus Nippia Pro).
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
