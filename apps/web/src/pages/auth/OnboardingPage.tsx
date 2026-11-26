import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { Badge, Button, Card, CardContent, Input, ProgressBar } from '../../components/ui';

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user, fetchMe } = useAuthStore();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [experienceLevel, setExperienceLevel] = useState<'FIRST_TIME' | 'REPEAT_CANDIDATE' | 'REFRESHING'>('FIRST_TIME');
  const [targetExamDate, setTargetExamDate] = useState('');
  const [dailyStudyMinutes, setDailyStudyMinutes] = useState(45);
  const [dailyQuestionTarget, setDailyQuestionTarget] = useState(30);
  const [targetScore, setTargetScore] = useState(400);
  const [confidenceTwk, setConfidenceTwk] = useState(3);
  const [confidenceTiu, setConfidenceTiu] = useState(3);
  const [confidenceTkp, setConfidenceTkp] = useState(3);

  const handleFinish = async (skipped = false) => {
    setSubmitting(true);
    try {
      await apiFetch('/auth/onboarding', {
        method: 'POST',
        body: JSON.stringify({
          experienceLevel,
          targetExamDate: targetExamDate || null,
          dailyStudyMinutes,
          dailyQuestionTarget,
          targetScore,
          confidenceTwk,
          confidenceTiu,
          confidenceTkp,
          skipped,
        }),
      });
      await fetchMe();
      navigate('/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-2xl space-y-5">
        <div className="flex items-center justify-between">
          <Badge variant="indigo">Langkah {step} dari 7</Badge>
          <Button variant="ghost" size="sm" onClick={() => handleFinish(true)} disabled={submitting}>
            Lewati & Masuk ke Dasbor
          </Button>
        </div>

        <ProgressBar value={(step / 7) * 100} />

        <Card>
          <CardContent className="p-6 sm:p-8 space-y-6">
            {step === 1 && (
              <div className="space-y-4 text-center py-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Selamat datang, {user?.name || 'Pejuang ASN'}!
                </h1>
                <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-600">
                  Mari sesuaikan target latihan harian, simulasi, dan rencana belajar Nippia — SKD
                  Master agar selaras dengan kesiapan Anda saat ini.
                </p>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">
                  Bagaimana pengalaman Anda mengikuti SKD CPNS?
                </h2>
                <div className="grid gap-3">
                  {[
                    {
                      id: 'FIRST_TIME' as const,
                      title: 'Baru Pertama Kali Mengikuti CPNS',
                      desc: 'Ingin memahami kisi-kisi, strategi dasar, dan ritme CAT dari awal.',
                    },
                    {
                      id: 'REPEAT_CANDIDATE' as const,
                      title: 'Pernah Mengikuti SKD Sebelumnya',
                      desc: 'Sudah mengenal pola CAT dan ingin mendongkrak skor melampaui kompetitor.',
                    },
                    {
                      id: 'REFRESHING' as const,
                      title: 'Menyegarkan Kembali Materi',
                      desc: 'Butuh latihan harian terarah dan simulasi cepat untuk menjaga ketajaman.',
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setExperienceLevel(opt.id)}
                      className={`rounded-xl border p-4 text-left transition-all cursor-pointer ${
                        experienceLevel === opt.id
                          ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <p className="text-sm font-semibold text-slate-900">{opt.title}</p>
                      <p className="mt-1 text-xs text-slate-600">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">
                  Kapan target perkiraan tanggal ujian Anda? (Opsional)
                </h2>
                <p className="text-sm text-slate-600">
                  Digunakan oleh Perencana Belajar untuk menata jadwal simulasi dan ulasan materi.
                </p>
                <Input
                  type="date"
                  value={targetExamDate}
                  onChange={(e) => setTargetExamDate(e.target.value)}
                />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-slate-900">
                  Berapa waktu & target latihan harian Anda?
                </h2>
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Ketersediaan Waktu Belajar per Hari: {dailyStudyMinutes} menit
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[20, 45, 60, 90].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setDailyStudyMinutes(m)}
                        className={`rounded-xl border py-2.5 text-sm font-semibold cursor-pointer ${
                          dailyStudyMinutes === m
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 text-slate-700'
                        }`}
                      >
                        {m} mnt
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Target Soal Harian: {dailyQuestionTarget} soal/hari
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[15, 30, 45, 60].map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setDailyQuestionTarget(q)}
                        className={`rounded-xl border py-2.5 text-sm font-semibold cursor-pointer ${
                          dailyQuestionTarget === q
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 text-slate-700'
                        }`}
                      >
                        {q} soal
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">
                  Berapa target skor kumulatif SKD Anda? (Maks. 550)
                </h2>
                <p className="text-sm text-slate-600">
                  Target kompetitif umumnya berada di kisaran 380–440 (tetap sesuaikan formasi Anda).
                </p>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={250}
                    max={520}
                    step={5}
                    value={targetScore}
                    onChange={(e) => setTargetScore(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <span className="min-w-[68px] rounded-xl bg-slate-900 px-3 py-2 text-center text-sm font-bold text-white">
                    {targetScore}
                  </span>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-slate-900">
                  Seberapa percaya diri Anda pada tiap subtes saat ini?
                </h2>
                {[
                  { label: 'TWK (Wawasan Kebangsaan)', val: confidenceTwk, set: setConfidenceTwk },
                  { label: 'TIU (Intelegensia Umum)', val: confidenceTiu, set: setConfidenceTiu },
                  { label: 'TKP (Karakteristik Pribadi)', val: confidenceTkp, set: setConfidenceTkp },
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{item.label}</span>
                      <span className="text-indigo-600">Skala {item.val} / 5</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => item.set(n)}
                          className={`rounded-xl border py-2 text-xs font-semibold cursor-pointer ${
                            item.val === n
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {step === 7 && (
              <div className="space-y-4 text-center py-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Rencana Belajar Awal Siap Dibuat!
                </h2>
                <p className="text-sm text-slate-600">
                  Kami akan menyusun jadwal belajar adaptif selama 14 hari dengan prioritas pada
                  subtes yang paling perlu penguatan, target harian{' '}
                  <strong>{dailyQuestionTarget} soal</strong>, dan target skor{' '}
                  <strong>{targetScore}/550</strong>.
                </p>
              </div>
            )}

            {/* Navigation Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={step === 1}
                onClick={() => setStep((s) => Math.max(1, s - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
                Sebelumnya
              </Button>
              {step < 7 ? (
                <Button type="button" variant="indigo" onClick={() => setStep((s) => s + 1)}>
                  Lanjut
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="indigo"
                  isLoading={submitting}
                  onClick={() => handleFinish(false)}
                >
                  Buat Rencana & Masuk Dasbor
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
