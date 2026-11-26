import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  CalendarDays,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
} from 'lucide-react';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { Badge, Button, Card, CardContent } from '../../components/ui';

export function LandingPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Badge variant="indigo" className="mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                Platform Persiapan CPNS SKD Berbasis Analitik & AI
              </Badge>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl leading-[1.15]">
                Taklukkan Seleksi Kompetensi Dasar dengan{' '}
                <span className="text-indigo-600">Latihan Adaptif</span> & Simulasi CAT Nyata.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Nippia — SKD Master membantu calon ASN membangun kebiasaan belajar harian yang
                terukur pada subtes TWK, TIU, dan TKP. Lengkap dengan deteksi kelemahan otomatis,
                pembahasan trik cepat, buku kesalahan, dan Tutor AI pribadi.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/register">
                  <Button variant="indigo" size="lg">
                    Mulai Persiapan Sekarang
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">
                    Masuk dengan Akun Demo
                  </Button>
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-100 pt-6 max-w-lg">
                <div>
                  <p className="text-xl font-bold text-slate-900">110+ Soal</p>
                  <p className="text-xs text-slate-500">Orisinal sesuai kisi-kisi</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">24 Topik</p>
                  <p className="text-xs text-slate-500">TWK, TIU & TKP lengkap</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">CAT 100 mnt</p>
                  <p className="text-xs text-slate-500">Skor dinamis & real-time</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <Card className="border-slate-200 bg-slate-900 text-white p-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <p className="text-xs font-medium text-indigo-300">Ringkasan Kesiapan SKD</p>
                    <p className="text-lg font-bold mt-0.5">Simulasi CAT Terukur</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                    Siap Ujian
                  </Badge>
                </div>
                <div className="mt-5 space-y-4">
                  {[
                    { name: 'TWK — Wawasan Kebangsaan', score: '115 / 150', pct: 77, pg: 'Min. 65' },
                    { name: 'TIU — Intelegensia Umum', score: '130 / 175', pct: 74, pg: 'Min. 80' },
                    { name: 'TKP — Karakteristik Pribadi', score: '192 / 225', pct: 85, pg: 'Min. 166' },
                  ].map((s) => (
                    <div key={s.name} className="rounded-xl bg-slate-800/80 p-3.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-200">{s.name}</span>
                        <span className="font-bold text-white">{s.score}</span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-slate-700 overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${s.pct}%` }} />
                      </div>
                      <p className="mt-1.5 text-[11px] text-slate-400">
                        Acuan ambang batas awal: {s.pg} (dapat disesuaikan admin)
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-[11px] text-slate-400">
                  * Nippia adalah platform belajar independen, bukan layanan resmi BKN.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Dirancang untuk Konsistensi, Bukan Sekadar Kumpulan Soal
          </h2>
          <p className="mt-2 text-slate-600">
            Setiap fitur saling terhubung: hasil latihan Anda langsung memperbarui peta kelemahan,
            buku kesalahan, dan jadwal belajar otomatis.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Target,
              title: 'Latihan Harian Adaptif',
              desc: 'Target harian terstruktur yang memprioritaskan topik terlemah dan soal yang perlu diulang.',
            },
            {
              icon: BarChart3,
              title: 'Analisis Kelemahan Cerdas',
              desc: 'Peta penguasaan per topik dengan guard sampel minimal agar diagnosis tidak bias.',
            },
            {
              icon: Timer,
              title: 'Simulasi CAT Profesional',
              desc: '110 soal TWK/TIU/TKP lengkap dengan navigasi soal, tanda ragu-ragu, dan auto-save.',
            },
            {
              icon: BookOpen,
              title: 'Pembahasan & Trik Cepat',
              desc: 'Langkah demi langkah, analisis pengecoh, bobot 1–5 TKP, dan referensi hukum terverifikasi.',
            },
            {
              icon: Bot,
              title: 'Tutor AI Terpandu',
              desc: 'Tanyakan soal yang membingungkan dan dapatkan penjelasan sederhana berbasis materi platform.',
            },
            {
              icon: CalendarDays,
              title: 'Perencana & Spaced Repetition',
              desc: 'Jadwal belajar dinamis dan pengulangan soal salah pada interval H+1, H+3, H+7, H+14.',
            },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="hover:border-indigo-200 transition-colors">
                <CardContent className="p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{f.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </PublicLayout>
  );
}

export function FeaturesPage() {
  const modules = [
    {
      badge: 'Kisi-Kisi Lengkap',
      title: 'Cakupan 24 Topik Resmi TWK, TIU, dan TKP',
      points: [
        'TWK: Nasionalisme, Integritas, Bela Negara, Pancasila, UUD 1945, NKRI, Bhinneka Tunggal Ika, Bahasa Indonesia.',
        'TIU Verbal, Numerik, dan Figural dengan diagram SVG interaktif untuk soal Serial, Analogi, dan Penalaran Matriks.',
        'TKP: Pelayanan Publik, Jejaring Kerja, Sosial Budaya, TIK, Profesionalisme, dan Anti Radikalisme dengan pembobotan 1–5.',
      ],
    },
    {
      badge: 'Penilaian Dinamis',
      title: 'Mesin Skor Terversi & Dapat Dikonfigurasi',
      points: [
        'TWK & TIU dinilai benar +5, salah 0, kosong 0 sesuai konfigurasi aktif.',
        'TKP menilai setiap opsi A–E secara individual (skala 1–5) dan tidak pernah menyamaratakan.',
        'Memisahkan skor simulasi bergaya resmi dari latihan khusus dengan catatan tahun acuan.',
      ],
    },
    {
      badge: 'Ekosistem Retensi',
      title: 'Buku Kesalahan, Kartu Hafalan & Perencana Belajar',
      points: [
        'Jawaban keliru otomatis tersimpan ke Buku Kesalahan dengan jadwal pengulangan berjarak.',
        'Kartu hafalan (flashcard) interaktif untuk pasal UUD 1945, rumus cepat TIU, dan prinsip TKP.',
        'Perencana belajar otomatis menyesuaikan target tanggal ujian dan jam belajar harian Anda.',
      ],
    },
  ];

  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 space-y-10">
        <div>
          <Badge variant="indigo">Kapabilitas Platform</Badge>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Fitur Lengkap Nippia — SKD Master</h1>
          <p className="mt-2 text-slate-600">
            Seluruh modul dibangun untuk membantu pemula maupun peserta berpengalaman meningkatkan skor SKD secara terstruktur.
          </p>
        </div>

        <div className="space-y-6">
          {modules.map((m) => (
            <Card key={m.title}>
              <CardContent className="p-6">
                <Badge variant="navy">{m.badge}</Badge>
                <h2 className="mt-3 text-xl font-bold text-slate-900">{m.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {m.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}

export function AboutPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 space-y-6">
        <Badge variant="indigo">Tentang Nippia</Badge>
        <h1 className="text-3xl font-bold text-slate-900">Misi Kami untuk Calon ASN Indonesia</h1>
        <Card>
          <CardContent className="p-6 space-y-4 text-sm leading-relaxed text-slate-700">
            <p>
              <strong>Nippia — SKD Master</strong> lahir dari kebutuhan akan platform persiapan CPNS
              Seleksi Kompetensi Dasar yang tidak hanya menyajikan latihan soal, melainkan membimbing
              proses belajar harian dengan data yang jujur dan pembahasan yang mendidik.
            </p>
            <p>
              Kami percaya keberhasilan dalam ujian CAT SKD ditentukan oleh kebiasaan belajar yang
              konsisten, kesadaran atas topik kelemahan pribadi, pemahaman konsep di balik soal, serta
              ketenangan mengelola waktu ujian.
            </p>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="h-4 w-4 text-amber-700" />
                Pernyataan Independensi
              </div>
              <p className="mt-1 text-xs leading-relaxed">
                Nippia adalah platform persiapan mandiri dan <strong>bukan</strong> lembaga pemerintah
                serta tidak berafiliasi dengan Badan Kepegawaian Negara (BKN) atau Kementerian PAN-RB.
                Seluruh soal merupakan soal latihan orisinal untuk pembelajaran. Peraturan dan nilai
                ambang batas resmi selalu mengacu pada pengumuman resmi pemerintah pada tahun seleksi terkait.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}

export function PrivacyPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Kebijakan Privasi</h1>
        <Card>
          <CardContent className="p-6 space-y-4 text-sm leading-relaxed text-slate-700">
            <p>
              Kami menghargai privasi setiap pengguna Nippia — SKD Master. Data yang dikumpulkan
              meliputi informasi akun (nama, email terenkripsi kata sandinya), preferensi belajar,
              serta riwayat jawaban latihan dan simulasi Anda.
            </p>
            <p>
              <strong>Kontrol Peringkat Publik:</strong> Anda memiliki kendali penuh di menu Pengaturan
              untuk menampilkan atau menyembunyikan profil Anda dari papan peringkat publik.
            </p>
            <p>
              <strong>Keamanan Data & AI:</strong> Kunci API layanan AI disimpan sepenuhnya di sisi
              server. Data pribadi pengguna tidak dijual kepada pihak ketiga mana pun.
            </p>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}

export function TermsPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Syarat & Ketentuan Layanan</h1>
        <Card>
          <CardContent className="p-6 space-y-4 text-sm leading-relaxed text-slate-700">
            <p>
              Dengan mendaftar dan menggunakan Nippia — SKD Master, Anda setuju untuk menggunakan
              materi soal latihan dan pembahasan hanya untuk keperluan pembelajaran pribadi dan tidak
              mendistribusikan ulang secara komersial tanpa izin.
            </p>
            <p>
              Skor simulasi, klasifikasi penguasaan topik, dan rekomendasi AI di platform ini
              bersifat estimasi edukatif untuk membantu persiapan Anda dan tidak menjamin kelulusan
              seleksi resmi CPNS.
            </p>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
