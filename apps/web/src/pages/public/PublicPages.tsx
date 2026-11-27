import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookMarked,
  BookOpen,
  Bot,
  CalendarDays,
  CheckCircle2,
  Compass,
  Flag,
  Flame,
  Layers,
  Radio,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Timer,
  Trophy,
  Zap,
} from 'lucide-react';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { Badge, Button, Card, CardContent } from '../../components/ui';
import { NippiaLogo } from '../../components/ui/NippiaLogo';

export function LandingPage() {
  const coreFeatures = [
    {
      icon: Trophy,
      badge: 'Mode Bertahap',
      title: 'Campaign Belajar Harian (10 Soal/Unit)',
      desc: '41 unit belajar berurutan untuk TWK, TIU, dan TKP. Tuntaskan unit aktif untuk membuka level berikutnya, raih hingga 3 bintang penguasaan, dan klaim bonus XP.',
    },
    {
      icon: Radio,
      badge: 'Real-Time Event',
      title: 'Tryout Nippia Live Akbar Serentak',
      desc: 'Uji kesiapan bersama ratusan hingga ribuan peserta sekaligus dengan ruang tunggu tersinkron, timer otoritatif server, auto-save, peringkat nasional, dan sertifikat.',
    },
    {
      icon: Timer,
      badge: 'Standar BKN-Style',
      title: 'Simulasi CAT 110 Soal / 100 Menit',
      desc: 'Antarmuka ujian lengkap dengan navigasi 110 nomor, penanda ragu-ragu, pembagian subtes TWK/TIU/TKP, serta bobot skor TKP individual skala 1–5.',
    },
    {
      icon: Compass,
      badge: '24 Topik + Figural SVG',
      title: 'Drilling per Topik & Soal Figural Interaktif',
      desc: 'Latih 24 topik resmi kisi-kisi termasuk TIU Figural Serial, Analogi, dan Penalaran Matriks 3×3 yang dirender tajam secara visual di semua ukuran layar.',
    },
    {
      icon: BookMarked,
      badge: 'Spaced Repetition',
      title: 'Buku Kesalahan Pintar (H+1 s/d H+14)',
      desc: 'Setiap jawaban keliru otomatis masuk catatan lengkap berisi perbandingan pilihan Anda vs jawaban benar, visual figural, trik cepat, langkah solusi, dan catatan pribadi.',
    },
    {
      icon: Layers,
      badge: '45 Dek Kartu 3D',
      title: 'Kartu Hafalan 3D & 18 Modul Materi',
      desc: 'Hafalkan pasal kunci UUD 1945, 9 nilai antikorupsi, rumus cepat numerik, dan strategi poin 5 TKP melalui flashcard interaktif dan Pusat Materi terstruktur.',
    },
    {
      icon: BarChart3,
      badge: 'Diagnostik Akurat',
      title: 'Analisis Kelemahan Berbasis Data',
      desc: 'Peta penguasaan per topik dengan batas sampel minimal agar diagnosa tidak bias—langsung tunjukkan topik mana yang paling perlu diprioritaskan.',
    },
    {
      icon: Bot,
      badge: 'Terpandu Referensi',
      title: 'Tutor AI Pribadi Berbasis Bank Materi',
      desc: 'Tanyakan soal sulit langsung dari halaman pembahasan dan dapatkan penjelasan langkah demi langkah yang berpijak pada materi terverifikasi Nippia.',
    },
    {
      icon: CalendarDays,
      badge: 'Adaptif + Kualitas',
      title: 'Perencana 14 Hari, Streak & Report Soal',
      desc: 'Jadwal belajar otomatis menyesuaikan target skor dan tanggal ujian Anda, dilengkapi pengingat streak harian serta ikon bendera report soal untuk validasi tim admin.',
    },
  ];

  const kisiKisiGroups = [
    {
      code: 'TWK',
      badge: 'navy' as const,
      title: 'Tes Wawasan Kebangsaan',
      subtitle: '8 Topik Inti • Penilaian +5 / 0',
      topics: [
        'Nasionalisme',
        'Integritas & Antikorupsi',
        'Bela Negara (UU PSDN)',
        'Pancasila (Dasar, Instrumental, Praksis)',
        'UUD 1945 & Kelembagaan',
        'NKRI & Wawasan Nusantara',
        'Bhinneka Tunggal Ika',
        'Bahasa Indonesia (EYD V & KBBI)',
      ],
    },
    {
      code: 'TIU',
      badge: 'indigo' as const,
      title: 'Tes Intelegensia Umum',
      subtitle: '10 Topik Verbal, Numerik & Figural',
      topics: [
        'Silogisme & Kontraposisi',
        'Penalaran Induktif',
        'Penalaran Analitis (Urutan & Jadwal)',
        'Berhitung Cepat & Pecahan',
        'Deret Angka Multi-Larik',
        'Perbandingan Kuantitatif (P vs Q)',
        'Soal Cerita Aplikatif',
        'Figural Serial, Analogi & Matriks 3×3',
      ],
    },
    {
      code: 'TKP',
      badge: 'success' as const,
      title: 'Tes Karakteristik Pribadi',
      subtitle: '6 Kompetensi ASN • Skala 1–5',
      topics: [
        'Pelayanan Publik Ramah & Taat SOP',
        'Jejaring Kerja & Kolaborasi Lintas Unit',
        'Sosial Budaya & Perekat Bangsa',
        'Adaptasi TIK, SPBE & Keamanan Data',
        'Profesionalisme & Netralitas ASN',
        'Anti Radikalisme & Ketahanan Ideologi',
      ],
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Masuk Instan & Atur Target',
      desc: 'Daftar dengan Google atau Email dalam hitungan detik, lalu tentukan target skor, instansi impian, dan durasi belajar harian saat onboarding.',
    },
    {
      num: '02',
      title: 'Ikuti Campaign Harian 10 Soal',
      desc: 'Kerjakan minimal 1 unit Campaign (10 soal) dan tinjau Kartu Hafalan 3D setiap hari untuk menjaga Streak serta membuka unit lanjutan.',
    },
    {
      num: '03',
      title: 'Uji Nyali di CAT & Live Akbar',
      desc: 'Biasakan ritme 100 menit pada Simulasi CAT 110 soal atau ikuti event Tryout Live Akbar untuk mengukur peringkat Anda terhadap peserta lain.',
    },
    {
      num: '04',
      title: 'Tambal Kelemahan sampai Siap',
      desc: 'Ulangi soal yang keliru lewat Buku Kesalahan berjadwal, pelajari Pusat Materi, dan diskusikan konsep tersulit bersama Tutor AI.',
    },
  ];

  return (
    <PublicLayout>
      {/* 1. Hero Section */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-indigo-50/70 via-white to-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Badge variant="indigo" className="mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                Platform Persiapan CPNS SKD Terpadu • Berbasis Analitik & AI
              </Badge>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl leading-[1.14]">
                Taklukkan Seleksi Kompetensi Dasar dengan{' '}
                <span className="text-indigo-600">Campaign Harian</span>, Simulasi CAT & Live Akbar.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Nippia — SKD Master menyatukan bank soal terkurasi TWK, TIU (termasuk Figural visual),
                dan TKP dengan pembelajaran bertahap 10 soal per unit, Buku Kesalahan <em>spaced repetition</em>,
                Kartu Hafalan 3D, dan Tutor AI dalam satu dasbor.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/register">
                  <Button variant="indigo" size="lg">
                    Mulai Belajar Gratis
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">
                    Masuk dengan Google / Demo
                  </Button>
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Login Instan via Google
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Pembahasan + Trik Cepat
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Sesuai Kisi-Kisi SKD
                </span>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-200/80 pt-6 sm:grid-cols-4 max-w-xl">
                <div>
                  <p className="text-xl font-extrabold text-slate-900">420+ Soal</p>
                  <p className="text-xs text-slate-500">TWK, TIU Figural & TKP</p>
                </div>
                <div>
                  <p className="text-xl font-extrabold text-slate-900">41 Unit</p>
                  <p className="text-xs text-slate-500">Campaign 10 soal/unit</p>
                </div>
                <div>
                  <p className="text-xl font-extrabold text-slate-900">24 Topik</p>
                  <p className="text-xs text-slate-500">Kisi-kisi resmi lengkap</p>
                </div>
                <div>
                  <p className="text-xl font-extrabold text-slate-900">45 Kartu</p>
                  <p className="text-xs text-slate-500">Hafalan 3D + 18 Modul</p>
                </div>
              </div>
            </div>

            {/* Hero Right Preview Card */}
            <div className="lg:col-span-5">
              <Card className="border-slate-800 bg-slate-900 text-white p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="space-y-1.5">
                    <NippiaLogo variant="wordmark" onDark size="sm" />
                    <p className="text-base font-bold">Simulasi CAT Terukur</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                    Siap Ujian
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-slate-800/90 px-2.5 py-2 border border-slate-700/60">
                    <p className="text-[10px] text-slate-400">Streak Belajar</p>
                    <p className="mt-0.5 flex items-center justify-center gap-1 text-xs font-bold text-amber-400">
                      <Flame className="h-3.5 w-3.5" /> 14 Hari
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-800/90 px-2.5 py-2 border border-slate-700/60">
                    <p className="text-[10px] text-slate-400">Campaign</p>
                    <p className="mt-0.5 flex items-center justify-center gap-1 text-xs font-bold text-indigo-300">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> Unit 12
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-800/90 px-2.5 py-2 border border-slate-700/60">
                    <p className="text-[10px] text-slate-400">Live Akbar</p>
                    <p className="mt-0.5 text-xs font-bold text-emerald-400">437 Poin</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {[
                    { name: 'TWK — Wawasan Kebangsaan', score: '115 / 150', pct: 77, pg: 'Min. 65' },
                    { name: 'TIU — Intelegensia Umum', score: '130 / 175', pct: 74, pg: 'Min. 80' },
                    { name: 'TKP — Karakteristik Pribadi', score: '192 / 225', pct: 85, pg: 'Min. 166' },
                  ].map((s) => (
                    <div key={s.name} className="rounded-xl bg-slate-800/80 p-3.5 border border-slate-700/50">
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

      {/* 2. Spotlight: Nippia Live Akbar */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
          <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-400/30 px-3 py-1 text-xs font-semibold text-rose-200">
                <Radio className="h-3.5 w-3.5 animate-pulse" /> Event Ujian Serentak Real-Time
              </span>
              <h2 className="text-2xl font-bold sm:text-3xl leading-snug">
                Nippia Live Akbar: Rasakan Atmosfer Tryout Nasional Bersama Ribuan Peserta
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-slate-300">
                Bukan sekadar simulasi sendirian. Daftar event terjadwal, masuk ruang tunggu resmi dengan hitung mundur
                tersinkron dari server, kerjakan 110 soal dengan perlindungan auto-save, dan bandingkan peringkat
                Anda secara objektif di papan peringkat event.
              </p>
              <div className="grid gap-2.5 sm:grid-cols-2 pt-1 text-xs text-slate-200">
                {[
                  'Waktu server tersinkron untuk semua peserta',
                  'Auto-submit & pemulihan jawaban saat putus koneksi',
                  'Papan peringkat resmi & analisis subtes lengkap',
                  'Sertifikat partisipasi & pembahasan pasca-ujian',
                ].map((pt) => (
                  <p key={pt} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{pt}</span>
                  </p>
                ))}
              </div>
              <div className="pt-2">
                <Link to="/register">
                  <Button variant="indigo" size="md">
                    Daftar & Ikuti Event Live Akbar <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-700/80 bg-slate-800/70 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-indigo-500/20 text-indigo-200 border-indigo-400/30">
                    Jadwal Event Akbar
                  </Badge>
                  <span className="text-xs font-semibold text-emerald-400">Pendaftaran Dibuka</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Tryout Akbar SKD Nasional</h3>
                  <p className="mt-1 text-xs text-slate-300">
                    110 Soal Standar (30 TWK • 35 TIU • 45 TKP) • Durasi 100 Menit
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-900/80 p-3 text-center">
                  <div>
                    <p className="text-[10px] text-slate-400">Ruang Tunggu</p>
                    <p className="text-xs font-bold text-white">Tersinkron</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Auto-Save</p>
                    <p className="text-xs font-bold text-emerald-400">Real-Time</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Sertifikat</p>
                    <p className="text-xs font-bold text-indigo-300">Otomatis</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-700/70 pt-3">
                  <span>Ranking berdasarkan Skor & Kecepatan</span>
                  <span className="font-semibold text-white">Gratis</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Full Feature Ecosystem Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <Badge variant="indigo">Ekosistem Belajar Lengkap</Badge>
          <h2 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
            9 Fitur Unggulan yang Saling Terhubung Otomatis
          </h2>
          <p className="mt-2 text-slate-600">
            Setiap sesi latihan, Campaign harian, atau Simulasi CAT langsung memperbarui peta kelemahan,
            Buku Kesalahan, progres XP, dan jadwal belajar Anda.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {coreFeatures.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="hover:border-indigo-300 transition-all hover:shadow-sm">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="neutral" className="text-[11px]">{f.badge}</Badge>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{f.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 4. Interactive Preview Highlights: Campaign & Flashcards */}
      <section className="border-y border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Campaign Spotlight */}
            <Card className="border-indigo-200/90 bg-gradient-to-br from-indigo-50/50 via-white to-white">
              <CardContent className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="navy">
                    <Zap className="h-3.5 w-3.5 text-amber-400" /> Skema Campaign Harian
                  </Badge>
                  <span className="text-xs font-semibold text-indigo-700">10 Soal per Unit</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Belajar Konsisten Seperti Bermain Level, Tanpa Kewalahan
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Alih-alih bingung memilih dari ratusan soal, kerjakan 1 unit berisi <strong>10 soal</strong> terarah
                  pada jalur TWK, TIU, atau TKP. Unit berikutnya otomatis terbuka setelah Anda menuntaskan unit sebelumnya.
                </p>
                <div className="space-y-2 pt-1">
                  {[
                    { unit: 'Unit 1 • Nasionalisme', status: 'Selesai • ★★★ (45/50)', tone: 'border-emerald-200 bg-emerald-50/70 text-emerald-900' },
                    { unit: 'Unit 2 • Integritas & Antikorupsi', status: 'Terbuka • Siap Dikerjakan', tone: 'border-indigo-300 bg-indigo-50/80 text-indigo-950' },
                    { unit: 'Unit 3 • Bela Negara', status: 'Terkunci • Tuntaskan Unit 2', tone: 'border-slate-200 bg-slate-50 text-slate-500' },
                  ].map((u) => (
                    <div key={u.unit} className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs font-semibold ${u.tone}`}>
                      <span>{u.unit}</span>
                      <span>{u.status}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Buku Kesalahan & Kartu Hafalan Spotlight */}
            <Card className="border-slate-200 bg-gradient-to-br from-emerald-50/40 via-white to-white">
              <CardContent className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="success">
                    <BookOpen className="h-3.5 w-3.5" /> Retensi Jangka Panjang
                  </Badge>
                  <span className="text-xs font-semibold text-emerald-700">Buku Kesalahan + 3D Flashcards</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Jangan Ulangi Kesalahan yang Sama Saat Hari Ujian
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Setiap kekeliruan saat latihan maupun simulasi langsung tercatat di <strong>Buku Kesalahan</strong> dengan
                  perbandingan jawaban Anda vs pembahasan lengkap jawaban benar, gambar figural, dan catatan pribadi.
                </p>
                <div className="grid gap-3 sm:grid-cols-2 pt-1">
                  <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1">
                    <p className="text-xs font-bold text-slate-900">45 Kartu Hafalan 3D</p>
                    <p className="text-xs text-slate-600">
                      Mencakup seluruh 24 topik: pasal UUD 1945, rumus cepat TIU, figural, dan sikap skor 5 TKP.
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1">
                    <p className="text-xs font-bold text-slate-900">Kontrol Kualitas Kolaboratif</p>
                    <p className="text-xs text-slate-600">
                      Menemukan typo atau kunci membingungkan? Gunakan ikon{' '}
                      <Flag className="inline h-3 w-3 text-rose-500" /> Report di setiap soal agar segera diperbaiki admin.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. 24 Topik Resmi Kisi-Kisi SKD */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <Badge variant="navy">Kisi-Kisi Lengkap TWK • TIU • TKP</Badge>
          <h2 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
            Cakupan 24 Topik Sesuai Struktur Ujian SKD
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Seluruh bank soal, Pusat Materi, Kartu Hafalan, dan Campaign disusun mengikuti kisi-kisi terbaru.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {kisiKisiGroups.map((g) => (
            <Card key={g.code}>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Badge variant={g.badge}>{g.code}</Badge>
                  <h3 className="mt-2.5 text-lg font-bold text-slate-900">{g.title}</h3>
                  <p className="text-xs text-slate-500">{g.subtitle}</p>
                </div>
                <ul className="space-y-2 border-t border-slate-100 pt-3">
                  {g.topics.map((tp) => (
                    <li key={tp} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{tp}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 6. Alur Belajar 4 Langkah */}
      <section className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <Badge variant="indigo">Alur Persiapan Efektif</Badge>
            <h2 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
              Dari Pemula hingga Siap Tempur dalam 4 Langkah
            </h2>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((st) => (
              <div key={st.num} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-2.5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-xs font-extrabold text-white">
                  {st.num}
                </span>
                <h3 className="text-sm font-bold text-slate-900">{st.title}</h3>
                <p className="text-xs leading-relaxed text-slate-600">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ & Final CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 space-y-12">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              q: 'Apakah bisa langsung daftar dan coba fitur secara gratis?',
              a: 'Ya. Anda dapat mendaftar gratis menggunakan akun Google atau Email, ataupun masuk memakai akun demo untuk mencoba Campaign harian, Simulasi CAT, Flashcard, dan Tutor AI.',
            },
            {
              q: 'Apakah soal TIU Figural sudah memiliki gambar?',
              a: 'Ya. Tersedia ratusan soal Figural (Serial, Analogi, dan Penalaran Matriks 3×3) yang tampil lengkap dengan diagram SVG presisi baik di latihan, CAT, pembahasan, maupun Buku Kesalahan.',
            },
            {
              q: 'Bagaimana sistem skor Simulasi CAT dan TKP di Nippia?',
              a: 'TWK & TIU dinilai benar +5 dan salah/kosong 0, sedangkan setiap opsi A–E pada TKP dinilai individual pada skala 1–5. Konfigurasi passing grade dapat diperbarui Admin sesuai aturan tahun berjalan.',
            },
            {
              q: 'Apakah Nippia berafiliasi dengan BKN atau KemenPAN-RB?',
              a: 'Tidak. Nippia adalah platform pembelajaran mandiri independen untuk membantu calon peserta berlatih. Seluruh aturan resmi seleksi tetap mengacu pada pengumuman pemerintah.',
            },
          ].map((faq) => (
            <Card key={faq.q}>
              <CardContent className="p-5 space-y-1.5">
                <h3 className="text-sm font-bold text-slate-900">{faq.q}</h3>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-600">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="rounded-3xl bg-indigo-600 px-6 py-10 text-center text-white shadow-xl sm:px-12">
          <Target className="mx-auto h-9 w-9 text-indigo-200" />
          <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">
            Siap Membangun Konsistensi Lolos SKD?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm sm:text-base text-indigo-100">
            Mulai dari Unit 1 Campaign hari ini, pantau perkembangan skor per topik, dan ukur kesiapan Anda
            di Simulasi CAT maupun Live Akbar.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/register">
              <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50">
                Daftar Gratis Sekarang <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-indigo-300 bg-indigo-700/40 text-white hover:bg-indigo-700">
                Masuk / Coba Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

export function FeaturesPage() {
  const modules = [
    {
      badge: 'Kisi-Kisi Lengkap',
      title: 'Cakupan 24 Topik Resmi TWK, TIU, dan TKP (420+ Soal)',
      points: [
        'TWK: Nasionalisme, Integritas, Bela Negara, Pancasila, UUD 1945, NKRI, Bhinneka Tunggal Ika, Bahasa Indonesia.',
        'TIU Verbal, Numerik, dan Figural dengan diagram SVG interaktif untuk soal Serial, Analogi, dan Penalaran Matriks 3×3.',
        'TKP: Pelayanan Publik, Jejaring Kerja, Sosial Budaya, TIK, Profesionalisme, dan Anti Radikalisme dengan pembobotan 1–5.',
      ],
    },
    {
      badge: 'Campaign & Live Akbar',
      title: 'Campaign Harian 10 Soal/Unit & Tryout Nasional Live Akbar',
      points: [
        'Campaign bertahap membuka unit berikutnya setelah unit sebelumnya tuntas, lengkap dengan sistem 3 bintang dan bonus XP.',
        'Nippia Live Akbar menyediakan ruang tunggu tersinkron, timer server otoritatif, auto-save, peringkat resmi, dan sertifikat.',
        'Simulasi CAT 110 soal / 100 menit dengan mesin skor terversi dan dukungan waktu tambahan disabilitas.',
      ],
    },
    {
      badge: 'Ekosistem Retensi',
      title: 'Buku Kesalahan, Kartu Hafalan 3D, Pusat Materi & Tutor AI',
      points: [
        'Jawaban keliru otomatis tersimpan ke Buku Kesalahan lengkap dengan pembahasan langkah demi langkah, gambar figural, dan jadwal ulang berjarak.',
        '45 Kartu Hafalan 3D interaktif serta 18 modul Pusat Materi untuk pasal UUD 1945, rumus cepat TIU, dan prinsip kompetensi TKP.',
        'Setiap soal dilengkapi tombol laporan kesalahan (ikon bendera) yang langsung masuk panel moderasi Admin.',
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
