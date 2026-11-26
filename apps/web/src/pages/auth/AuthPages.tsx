import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, registerSchema } from '@nippia/shared';
import { z } from 'zod';
import { GraduationCap } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { useAuthStore, type AuthUser } from '../../stores/authStore';
import { Button, Card, CardContent, Input } from '../../components/ui';

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuthStore();
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginForm) => {
    setErrorMsg('');
    try {
      const res = await apiFetch<{ user: AuthUser; accessToken: string; refreshToken: string }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify(values) },
      );
      setSession(res.user, res.accessToken, res.refreshToken);
      if (!res.user.profile?.onboardingCompleted && res.user.role !== 'ADMIN') {
        navigate('/onboarding');
      } else {
        navigate(res.user.role === 'ADMIN' ? '/admin' : '/dashboard');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal masuk.');
    }
  };

  const fillDemo = (email: string, pass: string) => {
    setValue('email', email);
    setValue('password', pass);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-slate-900">Nippia — SKD Master</span>
          </Link>
          <p className="mt-2 text-sm text-slate-600">Masuk untuk melanjutkan persiapan SKD Anda</p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            {errorMsg && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Email</label>
                <Input type="email" placeholder="nama@email.com" {...register('email')} />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Kata Sandi</label>
                  <Link to="/forgot-password" className="text-xs font-medium text-indigo-600 hover:underline">
                    Lupa kata sandi?
                  </Link>
                </div>
                <Input type="password" placeholder="••••••••" {...register('password')} />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" variant="indigo" className="w-full" isLoading={isSubmitting}>
                Masuk
              </Button>
            </form>

            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-medium text-slate-500 mb-2">Akses Cepat Akun Demo:</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemo('peserta@nippia.id', 'BelajarSkd2026!')}
                >
                  Isi Demo Peserta
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemo('admin@nippia.id', 'AdminSkd2026!')}
                >
                  Isi Demo Admin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-600">
          Belum punya akun?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:underline">
            Daftar Gratis
          </Link>
        </p>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { setSession } = useAuthStore();
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterForm) => {
    setErrorMsg('');
    try {
      const res = await apiFetch<{ user: AuthUser; accessToken: string; refreshToken: string }>(
        '/auth/register',
        { method: 'POST', body: JSON.stringify(values) },
      );
      setSession(res.user, res.accessToken, res.refreshToken);
      navigate('/onboarding');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal mendaftar.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-slate-900">Nippia — SKD Master</span>
          </Link>
          <p className="mt-2 text-sm text-slate-600">Buat akun dan dapatkan rencana belajar adaptif Anda</p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            {errorMsg && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Nama Lengkap</label>
                <Input placeholder="Contoh: Budi Santoso" {...register('name')} />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Email</label>
                <Input type="email" placeholder="nama@email.com" {...register('email')} />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Kata Sandi</label>
                <Input type="password" placeholder="Minimal 8 karakter" {...register('password')} />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>
              <Button type="submit" variant="indigo" className="w-full" isLoading={isSubmitting}>
                Daftar & Mulai Onboarding
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-600">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ sent?: boolean; devResetToken?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiFetch<{ sent: boolean; devResetToken?: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setStatus(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-4">
          <h1 className="text-xl font-bold text-slate-900">Lupa Kata Sandi</h1>
          <p className="text-sm text-slate-600">
            Masukkan email terdaftar Anda untuk membuat tautan pengaturan ulang kata sandi.
          </p>
          <form onSubmit={handleRequest} className="space-y-3">
            <Input
              type="email"
              required
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" variant="indigo" className="w-full" isLoading={loading}>
              Kirim Permintaan Reset
            </Button>
          </form>
          {status?.sent && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 space-y-1">
              <p>Jika email terdaftar, instruksi reset telah dibuat.</p>
              {status.devResetToken && (
                <p>
                  Mode Dev — Token:{' '}
                  <Link
                    to={`/reset-password?token=${status.devResetToken}`}
                    className="font-bold underline"
                  >
                    Klik untuk Reset Sekarang
                  </Link>
                </p>
              )}
            </div>
          )}
          <Link to="/login" className="block text-center text-xs font-medium text-indigo-600 hover:underline">
            Kembali ke halaman masuk
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const [token, setToken] = useState(params.get('token') ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengatur ulang kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-4">
          <h1 className="text-xl font-bold text-slate-900">Atur Ulang Kata Sandi</h1>
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {error}
            </div>
          )}
          <form onSubmit={handleReset} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Token Reset</label>
              <Input value={token} onChange={(e) => setToken(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Kata Sandi Baru</label>
              <Input
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" variant="indigo" className="w-full" isLoading={loading}>
              Simpan Kata Sandi Baru
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
