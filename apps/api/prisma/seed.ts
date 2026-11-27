import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import type { QuestionBankJsonItem } from '@nippia/shared';
import {
  finalizeEventAndRankings,
  freezeEventQuestionSet,
  joinLiveExamSession,
  saveLiveAnswer,
  submitLiveSession,
} from '../src/services/live-event.service.js';

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TOPIC_SEED = [
  // TWK (8)
  { subjectCode: 'TWK' as const, slug: 'nasionalisme', name: 'Nasionalisme', category: 'Wawasan Kebangsaan', description: 'Cinta tanah air, kesadaran berbangsa & bernegara, penghargaan keberagaman, dan persatuan bangsa.', orderIndex: 1 },
  { subjectCode: 'TWK' as const, slug: 'integritas', name: 'Integritas', category: 'Wawasan Kebangsaan', description: 'Keselarasan pikiran, perkataan, sikap, kejujuran, tanggung jawab, dan keteguhan moral.', orderIndex: 2 },
  { subjectCode: 'TWK' as const, slug: 'bela-negara', name: 'Bela Negara', category: 'Wawasan Kebangsaan', description: 'Kesetiaan pada Pancasila, kerelaan berkorban, dan kemampuan awal bela negara sesuai peran & regulasi.', orderIndex: 3 },
  { subjectCode: 'TWK' as const, slug: 'pancasila', name: 'Pancasila', category: 'Empat Konsensus Kebangsaan', description: 'Memahami, menganalisis, dan menerapkan nilai-nilai dasar, instrumental, dan praksis Pancasila.', orderIndex: 4 },
  { subjectCode: 'TWK' as const, slug: 'uud-1945', name: 'UUD 1945', category: 'Empat Konsensus Kebangsaan', description: 'Hukum dasar tertulis, pembukaan, pasal-pasal kunci, amandemen, dan kelembagaan negara.', orderIndex: 5 },
  { subjectCode: 'TWK' as const, slug: 'nkri', name: 'NKRI', category: 'Empat Konsensus Kebangsaan', description: 'Bentuk negara kesatuan, otonomi daerah, wawasan nusantara, dan keutuhan wilayah.', orderIndex: 6 },
  { subjectCode: 'TWK' as const, slug: 'bhinneka-tunggal-ika', name: 'Bhinneka Tunggal Ika', category: 'Empat Konsensus Kebangsaan', description: 'Semboyan persatuan dalam keberagaman, toleransi, inklusivitas, dan anti-etnosentrisme.', orderIndex: 7 },
  { subjectCode: 'TWK' as const, slug: 'bahasa-indonesia', name: 'Bahasa Indonesia', category: 'Kebahasaan', description: 'EYD V, kalimat efektif, kata baku KBBI, dan pemahaman teks informasi.', orderIndex: 8 },

  // TIU (10)
  { subjectCode: 'TIU' as const, slug: 'silogisme', name: 'Silogisme', category: 'Verbal', description: 'Penalaran deduktif menghubungkan premis untuk menarik kesimpulan logis yang pasti benar.', orderIndex: 1 },
  { subjectCode: 'TIU' as const, slug: 'penalaran-induktif', name: 'Penalaran Induktif', category: 'Verbal', description: 'Identifikasi pola hubungan, tren, atau prinsip umum dari informasi terpisah.', orderIndex: 2 },
  { subjectCode: 'TIU' as const, slug: 'analitis', name: 'Analitis', category: 'Verbal', description: 'Mengurai informasi kompleks, memetakan hubungan antarvariabel, dan evaluasi kombinasi syarat.', orderIndex: 3 },
  { subjectCode: 'TIU' as const, slug: 'berhitung', name: 'Berhitung', category: 'Numerik', description: 'Operasi hitung cepat, pecahan, persentase, eksponen, dan identitas aljabar.', orderIndex: 4 },
  { subjectCode: 'TIU' as const, slug: 'deret-angka', name: 'Deret Angka', category: 'Numerik', description: 'Melihat pola hubungan angka bertingkat, larik ganda, operasi campuran, dan variasi Fibonacci.', orderIndex: 5 },
  { subjectCode: 'TIU' as const, slug: 'perbandingan-kuantitatif', name: 'Perbandingan Kuantitatif', category: 'Numerik', description: 'Menarik kesimpulan perbandingan dua besaran P dan Q secara presisi.', orderIndex: 6 },
  { subjectCode: 'TIU' as const, slug: 'soal-cerita', name: 'Soal Cerita', category: 'Numerik', description: 'Analisis kuantitatif aplikatif: laju kerja, kecepatan, rata-rata, dan proporsi.', orderIndex: 7 },
  { subjectCode: 'TIU' as const, slug: 'figural-serial', name: 'Serial', category: 'Figural', description: 'Melihat pola hubungan perubahan gambar secara berurutan.', orderIndex: 8 },
  { subjectCode: 'TIU' as const, slug: 'figural-analogi', name: 'Analogi', category: 'Figural', description: 'Membandingkan transformasi pasangan gambar lalu menerapkannya pada pasangan lain.', orderIndex: 9 },
  { subjectCode: 'TIU' as const, slug: 'penalaran-matriks', name: 'Penalaran Matriks', category: 'Figural', description: 'Memahami pola baris, kolom, dan superposisi logika pada matriks 3×3.', orderIndex: 10 },

  // TKP (6)
  { subjectCode: 'TKP' as const, slug: 'pelayanan-publik', name: 'Pelayanan Publik', category: 'Karakteristik Pribadi', description: 'Sikap ramah, respons cekatan, tanpa pamrih, dan perbaikan kualitas layanan berkesinambungan.', orderIndex: 1 },
  { subjectCode: 'TKP' as const, slug: 'jejaring-kerja', name: 'Jejaring Kerja', category: 'Karakteristik Pribadi', description: 'Membangun dan memelihara kolaborasi internal maupun eksternal untuk tujuan organisasi.', orderIndex: 2 },
  { subjectCode: 'TKP' as const, slug: 'sosial-budaya', name: 'Sosial Budaya', category: 'Karakteristik Pribadi', description: 'Membangun hubungan sosial positif dengan menghargai keberagaman sosial budaya.', orderIndex: 3 },
  { subjectCode: 'TKP' as const, slug: 'adaptasi-tik', name: 'Adaptasi terhadap Perkembangan TIK', category: 'Karakteristik Pribadi', description: 'Menyesuaikan diri dan memanfaatkan teknologi informasi secara bijak, aman, dan etis.', orderIndex: 4 },
  { subjectCode: 'TKP' as const, slug: 'profesionalisme', name: 'Profesionalisme', category: 'Karakteristik Pribadi', description: 'Menampilkan keahlian, mengedepankan akuntabilitas, integritas, dan netralitas.', orderIndex: 5 },
  { subjectCode: 'TKP' as const, slug: 'anti-radikalisme', name: 'Anti Radikalisme', category: 'Karakteristik Pribadi', description: 'Menolak kekerasan dan pemaksaan kehendak serta menerima perbedaan dalam koridor ideologi bangsa.', orderIndex: 6 },
];

async function main() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_SEED !== 'true') {
    console.error(
      '[SEED BLOCKED] Menolak menjalankan seed.ts secara otomatis di NODE_ENV=production. Untuk seeding data referensi saja di produksi, jalankan dengan ALLOW_PRODUCTION_SEED=true SEED_REFERENCE_ONLY=true.',
    );
    process.exit(1);
  }

  console.log('Mulai seeding database Nippia - SKD Master...');

  // 1. Subjects
  const subjectDefs = [
    { code: 'TWK' as const, name: 'Tes Wawasan Kebangsaan', description: 'Pengetahuan dan pengamalan nilai kebangsaan, konsensus dasar, dan Bahasa Indonesia.', orderIndex: 1 },
    { code: 'TIU' as const, name: 'Tes Intelegensia Umum', description: 'Kemampuan penalaran verbal, numerik, dan figural.', orderIndex: 2 },
    { code: 'TKP' as const, name: 'Tes Karakteristik Pribadi', description: 'Kompetensi perilaku kerja aparatur dalam pelayanan, kolaborasi, TIK, dan integritas sosial.', orderIndex: 3 },
  ];

  const subjectMap = new Map<string, string>();
  for (const s of subjectDefs) {
    const upserted = await prisma.subject.upsert({
      where: { code: s.code },
      update: { name: s.name, description: s.description, orderIndex: s.orderIndex },
      create: s,
    });
    subjectMap.set(s.code, upserted.id);
  }

  // 2. Topics
  const topicMap = new Map<string, { id: string; subjectId: string }>();
  for (const t of TOPIC_SEED) {
    const subjectId = subjectMap.get(t.subjectCode)!;
    const upserted = await prisma.topic.upsert({
      where: { slug: t.slug },
      update: {
        subjectId,
        name: t.name,
        category: t.category,
        description: t.description,
        orderIndex: t.orderIndex,
      },
      create: {
        subjectId,
        slug: t.slug,
        name: t.name,
        category: t.category,
        description: t.description,
        orderIndex: t.orderIndex,
      },
    });
    topicMap.set(t.slug, { id: upserted.id, subjectId });
  }

  // 3. Questions (Paket 1–5 + Top-up Topik + 90 TIU Figural PDF = 642 published SKD questions)
  const questionSources: Array<{ file: string; packageCode: string }> = [
    { file: 'twk.json', packageCode: 'PAKET_1' },
    { file: 'tiu.json', packageCode: 'PAKET_1' },
    { file: 'tkp.json', packageCode: 'PAKET_1' },
    { file: 'paket2-twk.json', packageCode: 'PAKET_2' },
    { file: 'paket2-tiu.json', packageCode: 'PAKET_2' },
    { file: 'paket2-tkp.json', packageCode: 'PAKET_2' },
    { file: 'paket3-twk.json', packageCode: 'PAKET_3' },
    { file: 'paket3-tiu.json', packageCode: 'PAKET_3' },
    { file: 'paket3-tkp.json', packageCode: 'PAKET_3' },
    { file: 'paket4-twk.json', packageCode: 'PAKET_4' },
    { file: 'paket4-tiu.json', packageCode: 'PAKET_4' },
    { file: 'paket4-tkp.json', packageCode: 'PAKET_4' },
    { file: 'paket5-twk.json', packageCode: 'PAKET_5' },
    { file: 'paket5-tiu.json', packageCode: 'PAKET_5' },
    { file: 'paket5-tkp.json', packageCode: 'PAKET_5' },
    { file: 'topup-topics.json', packageCode: 'TOPUP' },
    { file: 'pdf-figural.json', packageCode: 'PDF_FIGURAL' },
  ];
  let totalQuestions = 0;
  for (const { file, packageCode } of questionSources) {
    const fullPath = path.resolve(__dirname, `../data/questions/${file}`);
    if (!fs.existsSync(fullPath)) continue;
    const items = JSON.parse(fs.readFileSync(fullPath, 'utf8')) as QuestionBankJsonItem[];
    for (const q of items) {
      const topicRef = topicMap.get(q.topicSlug);
      if (!topicRef) {
        throw new Error(`Topic slug ${q.topicSlug} not found for question ${q.id}`);
      }

      const sub = await prisma.subtopic.upsert({
        where: { topicId_name: { topicId: topicRef.id, name: q.subtopic } },
        update: {},
        create: { topicId: topicRef.id, name: q.subtopic },
      });

      const existingQ = await prisma.question.findUnique({ where: { code: q.id } });
      if (!existingQ) {
        await prisma.question.create({
          data: {
            code: q.id,
            packageCode,
            subjectId: topicRef.subjectId,
            topicId: topicRef.id,
            subtopicId: sub.id,
            questionType: q.questionType,
            difficulty: q.difficulty,
            stem: q.stem,
            visualSpec: q.visualSpec ? (q.visualSpec as object) : undefined,
            explanation: q.explanation.correctReason,
            conceptSummary: q.explanation.concept,
            stepByStep: q.explanation.stepByStep as object,
            whyOthersWrong: q.explanation.distractorAnalysis as object,
            quickTrick: q.explanation.quickTrick,
            commonMistakes: q.explanation.commonMistakes,
            studyTip: q.explanation.studyMaterialTip,
            status: 'PUBLISHED',
            isAiGenerated: false,
            options: {
              create: q.options.map((o) => ({
                optionKey: o.key,
                text: o.text,
                scoreValue: o.score,
                isCorrect: o.isCorrect,
                optionFeedback: o.rationale,
                visualSpec: o.visualSpec ? (o.visualSpec as object) : undefined,
              })),
            },
            references: {
              create: q.references.map((r) => ({
                title: r.title,
                source: r.source,
                note: r.note,
              })),
            },
          },
        });
      } else if (existingQ.packageCode !== packageCode) {
        await prisma.question.update({
          where: { id: existingQ.id },
          data: { packageCode },
        });
      }
      totalQuestions++;
    }
  }
  console.log(`Seeded ${totalQuestions} soal SKD (Paket 1–5, Top-Up Topik, dan 90 TIU Figural PDF).`);

  // 4. Scoring Configuration (Versioned & Configurable)
  const existingConfig = await prisma.scoringConfiguration.findFirst({
    where: { year: 2026, isOfficialStyle: true },
  });
  if (!existingConfig) {
    await prisma.scoringConfiguration.create({
      data: {
        name: 'Konfigurasi Standar SKD (110 Soal / 100 Menit)',
        year: 2026,
        isOfficialStyle: true,
        isActive: true,
        sourceReference: 'Konfigurasi awal berbasis kisi-kisi SKD (dapat diperbarui Admin sesuai pengumuman resmi tahun berjalan)',
        durationMinutes: 100,
        disabilityMins: 130,
        twkQuestionCount: 30,
        tiuQuestionCount: 35,
        tkpQuestionCount: 45,
        twkCorrectPoints: 5,
        twkWrongPoints: 0,
        tiuCorrectPoints: 5,
        tiuWrongPoints: 0,
        tkpMinPoints: 1,
        tkpMaxPoints: 5,
        unansweredPoints: 0,
        passingGrades: {
          create: [
            {
              formationType: 'UMUM',
              year: 2026,
              twkThreshold: 65,
              tiuThreshold: 80,
              tkpThreshold: 166,
              totalThreshold: 311,
              sourceDocument: 'Acuan Awal Formasi Umum (Dapat disesuaikan oleh Admin sesuai KepmenPAN-RB terbaru)',
              isActive: true,
            },
            {
              formationType: 'CUMLAUDE',
              year: 2026,
              twkThreshold: 0,
              tiuThreshold: 85,
              tkpThreshold: 0,
              totalThreshold: 311,
              sourceDocument: 'Acuan Awal Formasi Cumlaude (Dapat disesuaikan oleh Admin)',
              isActive: true,
            },
            {
              formationType: 'DISABILITAS',
              year: 2026,
              twkThreshold: 0,
              tiuThreshold: 60,
              tkpThreshold: 0,
              totalThreshold: 286,
              sourceDocument: 'Acuan Awal Formasi Disabilitas (Dapat disesuaikan oleh Admin)',
              isActive: true,
            },
          ],
        },
      },
    });
  }

  // 5. Achievements
  const achievements = [
    { code: 'FIRST_STEPS', title: 'Langkah Pertama', description: 'Menyelesaikan 10 soal latihan pertama.', icon: 'Sparkles', xpReward: 50, category: 'VOLUME', threshold: 10 },
    { code: 'FIRST_100', title: '100 Soal Pertama', description: 'Menuntaskan total 100 soal latihan atau simulasi.', icon: 'Award', xpReward: 150, category: 'VOLUME', threshold: 100 },
    { code: 'STREAK_7', title: 'Streak 7 Hari', description: 'Belajar konsisten selama 7 hari berturut-turut.', icon: 'Flame', xpReward: 150, category: 'STREAK', threshold: 7 },
    { code: 'TWK_SPECIALIST', title: 'Spesialis TWK', description: 'Mencapai akurasi minimal 80% pada subtes TWK (min. 15 soal).', icon: 'Landmark', xpReward: 120, category: 'MASTERY', threshold: 80 },
    { code: 'TIU_SOLVER', title: 'Pemecah Masalah TIU', description: 'Mencapai akurasi minimal 80% pada subtes TIU (min. 15 soal).', icon: 'Brain', xpReward: 120, category: 'MASTERY', threshold: 80 },
    { code: 'TKP_STRATEGIST', title: 'Ahli Strategi TKP', description: 'Mencapai skor rata-rata ≥80% dari skor maksimal TKP (min. 15 soal).', icon: 'ShieldCheck', xpReward: 120, category: 'MASTERY', threshold: 80 },
    { code: 'PERFECT_PRACTICE', title: 'Latihan Sempurna', description: 'Menjawab 100% tepat dalam sesi latihan minimal 5 soal.', icon: 'CheckCircle2', xpReward: 100, category: 'ACCURACY', threshold: 100 },
    { code: 'FIRST_SIMULATION', title: 'Pejuang CAT', description: 'Menyelesaikan Simulasi CAT SKD pertama.', icon: 'Timer', xpReward: 100, category: 'SIMULATION', threshold: 1 },
    { code: 'SIM_CHAMPION', title: 'Juara Simulasi', description: 'Melampaui ambang batas seluruh subtes pada Simulasi CAT.', icon: 'Trophy', xpReward: 250, category: 'SIMULATION', threshold: 1 },
    { code: 'TOPIC_MASTER', title: 'Penguasa Topik', description: 'Menguasai minimal 3 topik dengan status Menguasai (≥85%).', icon: 'Crown', xpReward: 200, category: 'MASTERY', threshold: 3 },
  ];

  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { code: a.code },
      update: a,
      create: a,
    });
  }

  // 6. Study Materials & Flashcards
  const materialsSeed = [
    {
      subjectCode: 'TWK',
      topicSlug: 'pancasila',
      slug: 'ringkasan-pancasila-nilai-dasar',
      title: 'Ringkasan Nilai Dasar, Instrumental, dan Praksis Pancasila',
      summary: 'Memahami kedudukan Pancasila sebagai Staatsfundamentalnorm, ideologi terbuka, serta pembedaan implementasi sila ke-1 sampai ke-5 dalam studi kasus ASN.',
      contentMd: `### Kedudukan Pancasila\n- **Sumber dari segala sumber hukum negara** (Pasal 2 UU No. 12/2011): seluruh regulasi dari UUD hingga Perda wajib selaras dengan Pancasila.\n- **Ideologi Terbuka**: Nilai dasar (5 sila) bersifat tetap, sedangkan nilai instrumental (UU/kebijakan) dan nilai praksis (perilaku harian) berkembang mengikuti zaman.\n\n### Kunci Pembedaan Sila dalam Soal\n- **Sila 1**: Kebebasan beragama & toleransi antarumat tanpa pemaksaan.\n- **Sila 2**: Martabat manusia, HAM, empati kemanusiaan universal.\n- **Sila 3**: Persatuan nasional, cinta tanah air, mendahulukan kepentingan bangsa.\n- **Sila 4**: Musyawarah mufakat, hikmat kebijaksanaan, menghormati keputusan bersama.\n- **Sila 5**: Keadilan distributif, pemerataan ekonomi, keseimbangan hak dan kewajiban.`,
      keyPoints: [
        'Nilai dasar tetap, nilai instrumental dan praksis dinamis.',
        'Sila 2 berfokus pada martabat/empati; Sila 5 berfokus pada keadilan sosial dan pemerataan ekonomi.',
        'Voting pada Sila 4 ditempuh hanya bila musyawarah mufakat tidak tercapai.',
      ],
      formulas: [],
      readMinutes: 6,
    },
    {
      subjectCode: 'TWK',
      topicSlug: 'uud-1945',
      slug: 'pasal-kunci-uud-1945-lembaga-ham',
      title: 'Pasal Kunci UUD 1945, Amandemen, dan Kelembagaan Negara',
      summary: 'Peta ringkas Pembukaan UUD 1945, 5 kesepakatan dasar amandemen, pembagian kewenangan MA vs MK vs KY, serta hak non-derogable.',
      contentMd: `### 5 Kesepakatan Dasar Amandemen (1999–2002)\n1. Tidak mengubah Pembukaan UUD 1945.\n2. Tetap mempertahankan NKRI.\n3. Mempertegas sistem presidensial.\n4. Penjelasan yang normatif dimasukkan ke pasal.\n5. Dilakukan dengan cara adendum.\n\n### Pasal Kunci\n- **Pasal 22**: Perppu dalam kegentingan memaksa; jika tidak disetujui DPR pada sidang berikut, **harus dicabut**.\n- **Pasal 24A vs 24C**: MA menguji aturan di bawah UU terhadap UU; MK menguji UU terhadap UUD (final).\n- **Pasal 27(3) vs 30(1)**: 27(3) tentang upaya pembelaan negara; 30(1) tentang pertahanan & keamanan.\n- **Pasal 28I(1)**: 7 hak non-derogable termasuk asas non-retroaktif.\n- **Pasal 37(5)**: Bentuk NKRI tidak dapat dilakukan perubahan.`,
      keyPoints: [
        'MK menguji UU terhadap UUD; MA menguji peraturan di bawah UU terhadap UU.',
        'Perppu yang ditolak DPR harus dicabut (Pasal 22 ayat 3).',
        'Bentuk NKRI tidak dapat diubah (Pasal 37 ayat 5).',
      ],
      formulas: [],
      readMinutes: 7,
    },
    {
      subjectCode: 'TWK',
      topicSlug: 'bahasa-indonesia',
      slug: 'kaidah-eyd-v-kalimat-efektif',
      title: 'Kaidah EYD V, Kalimat Efektif, dan Kata Baku KBBI',
      summary: 'Panduan cepat membedakan kata depan vs imbuhan, menghindari kalimat tak bersubjek, dan daftar kata baku yang sering diujikan.',
      contentMd: `### Di- Imbuhan vs Di Kata Depan\n- **Imbuhan pasif** (bisa diubah menjadi *me-*): tulis serangkai (*ditempel, diwajibkan, ditulis*).\n- **Kata depan tempat/arah**: tulis terpisah (*di papan, di portal, ke dalam*).\n\n### Syarat Kalimat Efektif\n- Hindari kata depan (*Bagi, Untuk, Kepada*) sebelum Subjek.\n- Hindari pleonasme (*semua para, agar supaya, saling bantu-membantu*).\n\n### Kata Baku Populer\n- *analisis* (bukan analisa), *risiko* (bukan resiko), *sistem* (bukan sistim), *aktivitas* (bukan aktifitas), *sekadar* (bukan sekedar), *konkret* (bukan konkrit), *jadwal* (bukan jadual).`,
      keyPoints: [
        'Uji imbuhan di- dengan mengubahnya ke bentuk aktif me-.',
        'Kalimat efektif wajib memiliki Subjek + Predikat jelas.',
      ],
      formulas: [],
      readMinutes: 5,
    },
    {
      subjectCode: 'TIU',
      topicSlug: 'silogisme',
      slug: 'rumus-penalaran-logis-silogisme',
      title: 'Aturan Logika Deduktif: Silogisme, Kontraposisi, dan De Morgan',
      summary: 'Formula cepat penarikan kesimpulan sah dari premis universal, partikular, dan implikasi bersyarat.',
      contentMd: `### Aturan Cepat Silogisme\n- **Semua + Sebagian = Sebagian** (tidak boleh menarik kesimpulan 'Semua').\n- **Modus Ponens**: \`P → Q\`, diketahui \`P\` ⇒ simpulan \`Q\`.\n- **Modus Tollens**: \`P → Q\`, diketahui \`~Q\` ⇒ simpulan \`~P\`.\n- **Ekuivalensi Implikasi**: \`P → Q ≡ ~Q → ~P ≡ ~P ∨ Q\`.\n\n### Hukum De Morgan & Negasi Kuantor\n- \`~(A ∧ B) ≡ ~A ∨ ~B\` (negasi DAN adalah ATAU).\n- \`~(A ∨ B) ≡ ~A ∧ ~B\`.\n- Negasi *"Semua A adalah B"* adalah *"Ada/Beberapa A bukan B"*.`,
      keyPoints: [
        'Jangan pernah menambah asumsi yang tidak tertulis di premis.',
        'Konvers (Q → P) dan Invers (~P → ~Q) TIDAK ekuivalen dengan P → Q.',
      ],
      formulas: ['P → Q ≡ ~Q → ~P', '~(A ∧ B) ≡ ~A ∨ ~B'],
      readMinutes: 6,
    },
    {
      subjectCode: 'TIU',
      topicSlug: 'berhitung',
      slug: 'trik-hitungan-cepat-deret-perbandingan',
      title: 'Trik Hitungan Cepat, Pecahan Istimewa, dan Pola Deret',
      summary: 'Tabel konversi persen istimewa, identitas selisih kuadrat, rumus kerja bersama, dan trik susul-menyusul.',
      contentMd: `### Pecahan & Persen Istimewa\n- \`12,5% = 1/8\`, \`37,5% = 3/8\`, \`62,5% = 5/8\`, \`87,5% = 7/8\`\n- \`33,33% = 1/3\`, \`66,67% = 2/3\`, \`16,67% = 1/6\`\n\n### Identitas & Soal Cerita\n- Selisih kuadrat: \`a² - b² = (a + b)(a - b)\`\n- Kerja bersama 2 objek: \`T = (A × B) / (A + B)\`\n- Susul menyusul: \`t = (selisih jarak awal) / (v₂ - v₁)\`\n- Diskon bertingkat d₁ + d₂: \`d_total = d₁ + d₂ - (d₁×d₂)/100\``,
      keyPoints: [
        'Ubah desimal berpola (0,375; 0,25; 0,5) ke pecahan sebelum menghitung.',
        'Jika deret angka naik-turun, uji pola dua larik (lompat 1 suku).',
      ],
      formulas: ['a² - b² = (a+b)(a-b)', 'T_gab = (A×B)/(A+B)', 'd = d₁ + d₂ - (d₁d₂)/100'],
      readMinutes: 6,
    },
    {
      subjectCode: 'TKP',
      topicSlug: 'pelayanan-publik',
      slug: 'prinsip-kompetensi-6-aspek-tkp',
      title: 'Strategi Menjawab TKP Berbasis 6 Kompetensi Inti ASN',
      summary: 'Peta perilaku skor tertinggi (poin 5) pada Pelayanan Publik, Jejaring Kerja, Sosial Budaya, TIK, Profesionalisme, dan Anti Radikalisme.',
      contentMd: `### Ciri Opsi Skor Tertinggi (5 Poin)\n1. **Pelayanan Publik**: Ramah, cekatan, inklusif pada kelompok rentan, memberi solusi konkret **tanpa melanggar SOP**.\n2. **Jejaring Kerja**: Meruntuhkan ego sektoral, dialog setara, kolaborasi lintas unit sejak perencanaan.\n3. **Sosial Budaya**: Menghormati adat/ibadah beragam, menengahi konflik secara netral, membina pembauran.\n4. **Adaptasi TIK**: Cepat belajar sistem baru, membantu rekan senior, patuh keamanan siber & UU PDP.\n5. **Profesionalisme**: Akuntabel, jujur pada data/biaya riil, berani mengingatkan atasan secara santun, netral dari politik praktis.\n6. **Anti Radikalisme**: Menolak tegas kekerasan & eksklusivisme, dialog persuasif, taat ideologi Pancasila dan jalur hukum.`,
      keyPoints: [
        'Jangan pernah melanggar aturan/SOP hanya demi tampak baik atau cepat.',
        'Tindakan yang berdampak positif bagi tim/organisasi lebih tinggi nilainya daripada menyelamatkan diri sendiri saja.',
      ],
      formulas: [],
      readMinutes: 5,
    },

    // === PAKET 2 PUSAT MATERI (6 Modul Lanjutan Kisi-Kisi SKD) ===
    {
      subjectCode: 'TWK',
      topicSlug: 'nasionalisme',
      slug: 'paket2-nasionalisme-bela-negara-psdn',
      title: 'Nasionalisme Pancasila, Pergerakan Nasional, dan Bela Negara',
      summary: 'Membedakan nasionalisme terbuka dari chauvinisme, tonggak kebangkitan bangsa 1908–1945, serta 5 nilai dasar Bela Negara menurut UU PSDN.',
      contentMd: `### Nasionalisme Pancasila vs Chauvinisme\n- **Nasionalisme Pancasila**: Cinta tanah air yang berpadu dengan Sila ke-2 (*kemanusiaan yang adil dan beradab*), menolak merendahkan bangsa lain.\n- **Chauvinisme**: Mengagungkan bangsa sendiri secara berlebihan dan memandang rendah bangsa lain (bertentangan dengan Pembukaan UUD 1945 alinea I & IV).\n\n### Tonggak Pergerakan Nasional\n1. **20 Mei 1908 (Budi Utomo)**: Awal kebangkitan nasional melalui organisasi modern terpelajar.\n2. **28 Oktober 1928 (Sumpah Pemuda)**: Ikrar satu tanah air, satu bangsa, dan bahasa persatuan bahasa Indonesia.\n3. **17 Agustus 1945 (Proklamasi)**: Puncak penentuan nasib sendiri sebagai bangsa berdaulat.\n\n### 5 Nilai Dasar Bela Negara (UU No. 23/2019 PSDN)\n- **Cinta tanah air**, **sadar berbangsa dan bernegara**, **setia pada Pancasila** sebagai ideologi negara, **rela berkorban** untuk bangsa dan negara, serta **kemampuan awal bela negara**.\n\n> Bagi ASN, bela negara diwujudkan lewat pengabdian profesi yang jujur, melawan hoaks, menjaga rahasia negara, dan taat konstitusi.`,
      keyPoints: [
        'Bela negara tidak identik dengan wajib militer; pengabdian sesuai profesi adalah bentuk resmi bela negara (Pasal 9 UU PSDN).',
        'Bedakan dasar hukum: Pasal 27 ayat (3) mengatur upaya pembelaan negara, sedangkan Pasal 30 ayat (1) mengatur pertahanan dan keamanan.',
        'Sumpah Pemuda menandai pergeseran perjuangan bersifat kedaerahan menuju kesadaran nasional.',
      ],
      formulas: [],
      readMinutes: 7,
    },
    {
      subjectCode: 'TWK',
      topicSlug: 'integritas',
      slug: 'paket2-integritas-antikorupsi-berakhlak',
      title: 'Integritas ASN, 9 Nilai Antikorupsi KPK, dan Pencegahan Gratifikasi',
      summary: 'Pedoman integritas moral aparatur, pengelompokan 9 nilai antikorupsi, perbedaan suap vs gratifikasi vs pemerasan, dan Core Values BerAKHLAK.',
      contentMd: `### Pilar Integritas Aparatur\n- **Definisi**: Keselarasan antara hati, pikiran, ucapan, dan tindakan nyata secara konsisten meski tidak ada pengawasan.\n- **9 Nilai Antikorupsi KPK**:\n  1. **Inti**: Jujur, Disiplin, Tanggung Jawab.\n  2. **Sikap**: Adil, Berani, Peduli.\n  3. **Etos Kerja**: Kerja Keras, Mandiri, Sederhana.\n\n### Membedakan Suap, Gratifikasi, dan Pemerasan\n- **Gratifikasi** (\`Pasal 12B UU Tipikor\`): Pemberian dalam arti luas terkait jabatan; dianggap suap jika berhubungan dengan jabatan dan berlawanan dengan kewajiban, **kecuali dilaporkan ke KPK paling lambat 30 hari kerja** (\`Pasal 12C\`).\n- **Suap**: Adanya kesepakatan transaksional (*meeting of minds*) untuk berbuat atau tidak berbuat sesuai jabatan.\n- **Pemerasan**: Penyelenggara negara menyalahgunakan kekuasaan untuk memaksa pihak lain memberi sesuatu.\n\n### Core Values ASN BerAKHLAK\n- **Berorientasi Pelayanan, Akuntabel, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif**.`,
      keyPoints: [
        'Batas wajib lapor gratifikasi ke KPK adalah 30 hari kerja (bukan 30 hari kalender) sejak diterima.',
        'Pada suap, pemberi dan penerima sama-sama dapat dipidana karena ada niat transaksional.',
        'Konflik kepentingan wajib diungkap dan dihindari melalui penarikan diri dari proses pengambilan keputusan.',
      ],
      formulas: [],
      readMinutes: 7,
    },
    {
      subjectCode: 'TIU',
      topicSlug: 'analitis',
      slug: 'paket2-penalaran-analitis-induktif',
      title: 'Strategi Penalaran Analitis (Urutan, Jadwal, Meja Bundar) & Induktif',
      summary: 'Teknik pemetaan cepat soal analitis kompleks dengan notasi simbolik serta cara membedakan generalisasi sah dan sesat pikir induktif.',
      contentMd: `### 4 Langkah Cepat Soal Analitis\n1. **Siapkan slot tetap**: Buat garis posisi \`1 - 2 - 3 - 4 - 5\` atau tabel hari/ruang.\n2. **Kunci syarat mutlak lebih dulu**: Tempatkan pernyataan pasti (misal *C di kursi 3* atau *A tepat di kiri B*).\n3. **Notasikan syarat relatif**: Gunakan simbol \`>\` (lebih awal/tinggi), \`<\`, \`AB\` (berdampingan), atau \`≠\` (tidak bersebelahan).\n4. **Uji opsi dari belakang jika belum tunggal**: Sering kali 1 kondisi cukup menggugurkan 3–4 pilihan jawaban sekaligus.\n\n### Kasus Meja Melingkar (Sirkular)\n- Pada meja bundar berisi \`n\` orang, tidak ada ujung kiri/kanan absolut; tentukan 1 tokoh patokan (misal di posisi jam 12) lalu baca searah/berlawanan jarum jam.\n- Dua orang saling **berhadapan** pada meja bundar genap berjarak tepat \`n/2\` langkah.\n\n### Penalaran Induktif yang Valid\n- **Generalisasi sah**: Sampel representatif dan ciri relevan konsisten (waspadai *hasty generalization*).\n- **Analogi induktif**: Sah jika kesamaan sifat bersifat esensial terhadap kesimpulan, bukan sekadar kebetulan.`,
      keyPoints: [
        'Jangan membaca teks soal berulang-ulang tanpa menulis sketsa atau tabel.',
        'Perhatikan kata pembeda kritis: "di sebelah kiri" (bisa berjarak) vs "tepat di sebelah kiri" (wajib menempel).',
        'Kesimpulan induktif bersifat probabilistik, tidak boleh mengklaim kepastian mutlak di luar dukungan data.',
      ],
      formulas: ['Meja bundar: saling berhadapan = jarak n/2 kursi', 'Permutasi siklik: (n − 1)!'],
      readMinutes: 7,
    },
    {
      subjectCode: 'TIU',
      topicSlug: 'deret-angka',
      slug: 'paket2-deret-angka-perbandingan-kuantitatif',
      title: 'Pola Deret Angka Lanjutan & Uji Presisi Perbandingan P vs Q',
      summary: 'Identifikasi deret osilasi multi-larik, selisih bertingkat, dan daftar nilai uji wajib agar akurat menentukan hubungan P dan Q.',
      contentMd: `### Peta Pola Deret Angka\n- **Naik atau turun konsisten**: Cek selisih tingkat 1; jika belum konstan, cek selisih tingkat 2 atau rasio perkalian.\n- **Naik lalu turun (osilasi)**: Segera uji **pola 2 larik** (suku ganjil vs suku genap) atau **3 larik** (lompat 2 suku).\n- **Operasi campuran**: Pola seperti \`×2 + 1\`, \`×2 − 1\`, atau penjumlahan dua suku sebelumnya (**Fibonacci / Tribonacci**).\n- **Pola bilangan khusus**: Bilangan kuadrat (\`1, 4, 9, 16, 25\`), kubik (\`1, 8, 27, 64\`), dan bilangan prima (\`2, 3, 5, 7, 11, 13\`).\n\n### Strategi Perbandingan Kuantitatif (P vs Q)\n1. Sederhanakan bentuk aljabar kedua sisi sebelum memasukkan angka.\n2. Bila syarat variabel tidak membatasi positif/bulat, wajib uji **4 tipe nilai**: bilangan negatif besar (\`x = −2\`), nol (\`x = 0\`), pecahan di antara 0 dan 1 (\`x = 1/2\`), serta bilangan positif \`> 1\` (\`x = 2\`).\n3. Jika hasil perbandingan berubah antar nilai uji (kadang \`P > Q\`, kadang \`P < Q\`), maka jawaban pasti **"Informasi yang diberikan tidak cukup"**.\n\n> Hati-hati jebakan kuadrat: jika \`x² = 16\`, maka \`x\` bisa bernilai \`+4\` atau \`−4\`.`,
      keyPoints: [
        'Untuk bilangan pecahan 0 < x < 1, berlaku x² < x < √x (kebalikan dari bilangan > 1).',
        'Jangan langsung menghitung perkalian besar pada P vs Q jika bisa disederhanakan atau dibandingkan faktornya.',
        'Uji 2 larik adalah langkah pertama wajib tiap melihat deret angka yang melonjak lalu mengecil.',
      ],
      formulas: ['0 < x < 1 ⇒ x² < x < √x', 'x² = a² ⇒ x = +a atau x = −a'],
      readMinutes: 6,
    },
    {
      subjectCode: 'TKP',
      topicSlug: 'jejaring-kerja',
      slug: 'paket2-jejaring-kerja-sosial-budaya',
      title: 'Kompetensi Jejaring Kerja & Sosial Budaya ASN Perekat Bangsa',
      summary: 'Cara mengambil keputusan bernilai 5 poin dalam kolaborasi lintas unit, mediasi konflik tim, serta adaptasi di lingkungan masyarakat majemuk.',
      contentMd: `### Ciri Jawaban Poin 5: Jejaring Kerja\n- **Runtuhkan ego sektoral**: Proaktif menginisiasi koordinasi lintas unit sejak perencanaan, berbagi data yang relevan sesuai kewenangan, dan fokus pada target organisasi.\n- **Menjaga hubungan profesional**: Saat mitra/rekan kerja terlambat atau berbeda pendapat, bangun komunikasi konstruktif dan cari solusi bersama daripada saling menyalahkan atau memutus kerja sama.\n- **Sinergi eksternal**: Libatkan pemangku kepentingan secara transparan tanpa konflik kepentingan.\n\n### Ciri Jawaban Poin 5: Sosial Budaya\n- **Adaptif terhadap kearifan lokal**: Saat bertugas di daerah baru, aktif mempelajari bahasa/adat setempat dan menghormati tata krama tanpa meninggalkan profesionalisme ASN.\n- **Inklusif & bebas diskriminasi**: Memberi ruang dan perlakuan setara kepada rekan maupun masyarakat dari beragam suku, agama, ras, dan budaya.\n- **Penengah netral**: Jika muncul gesekan sosial di kantor atau masyarakat, fasilitasi dialog saling menghargai dan arahkan pada kepentingan bersama.`,
      keyPoints: [
        'Hindari opsi yang bersifat pasif ("menunggu perintah saja") atau konfrontatif ("memarahi/menjauhi rekan").',
        'ASN berfungsi sebagai pelaksana kebijakan, pelayan publik, sekaligus perekat dan pemersatu bangsa (UU ASN).',
        'Kolaborasi selalu mengutamakan kesepakatan profesional dan saling menghormati.',
      ],
      formulas: [],
      readMinutes: 5,
    },
    {
      subjectCode: 'TKP',
      topicSlug: 'adaptasi-tik',
      slug: 'paket2-adaptasi-tik-keamanan-data',
      title: 'Adaptasi Perkembangan TIK, SPBE, dan Keamanan Informasi ASN',
      summary: 'Prinsip pemanfaatan teknologi digital untuk efisiensi layanan, pendampingan tim lintas generasi, serta proteksi data pribadi dan keamanan siber.',
      contentMd: `### Transformasi Digital ASN (SPBE)\n- **Cepat beradaptasi**: Pelajari sistem/aplikasi baru secara mandiri dan terapkan langsung untuk mempercepat kualitas layanan publik.\n- **Berbagi pengetahuan**: Jika rekan senior kesulitan memakai teknologi baru, pilih opsi yang **membimbing dengan sabar atau membuat panduan ringkas**—bukan mengambil alih seluruh pekerjaan mereka atau mengizinkan kembali ke cara manual.\n\n### Keamanan Siber & Perlindungan Data Pribadi (UU PDP)\n1. **Tolak jalur tidak resmi**: Jangan mengirim dokumen rahasia, NIK, atau data pemohon melalui pesan pribadi/aplikasi tidak terenkripsi.\n2. **Waspada rekayasa sosial (*phishing*)**: Selalu verifikasi tautan, OTP, atau permintaan mendesak yang mengatasnamakan pimpinan.\n3. **Etika AI Generatif**: Dilarang mengunggah data rahasia negara ke layanan AI publik; gunakan hanya sebagai alat bantu penyusunan dan lakukan verifikasi manusia (*human-in-the-loop*).\n\n> Efisiensi teknologi tidak pernah boleh mengorbankan keamanan informasi dan privasi warga.`,
      keyPoints: [
        'Skor tertinggi muncul pada kombinasi: cepat belajar + membantu rekan lain beradaptasi + patuh keamanan data.',
        'Jangan pernah meminjamkan akun/kata sandi dinas kepada siapa pun meski sedang terburu-buru.',
        'Jika sistem utama mengalami gangguan sementara, koordinasikan prosedur cadangan resmi sesuai SOP.',
      ],
      formulas: [],
      readMinutes: 5,
    },

    // === PAKET 3 PUSAT MATERI (6 Modul Pemantapan & Aplikasi Kisi-Kisi SKD) ===
    {
      subjectCode: 'TWK',
      topicSlug: 'nkri',
      slug: 'paket3-nkri-otonomi-wawasan-nusantara',
      title: 'Kedaulatan NKRI, Otonomi Daerah, dan Wawasan Nusantara',
      summary: 'Pemahaman bentuk negara kesatuan, pembagian urusan pemerintahan pusat vs daerah, Deklarasi Djuanda 1957, dan batas maritim UNCLOS 1982.',
      contentMd: `### Bentuk Negara Kesatuan & Konstitusi\n- **Pasal 1 ayat (1) UUD 1945**: Negara Indonesia ialah Negara Kesatuan, yang berbentuk Republik.\n- **Pasal 37 ayat (5)**: Khusus mengenai bentuk NKRI tidak dapat dilakukan perubahan.\n\n### Asas & Urusan Pemerintahan Daerah (UU No. 23/2014)\n- **Desentralisasi**: Penyerahan wewenang pusat ke daerah otonom.\n- **Dekonsentrasi**: Pelimpahan wewenang pusat kepada gubernur/instansi vertikal.\n- **Tugas Pembantuan**: Penugasan dari pemerintah lebih tinggi untuk melaksanakan tugas tertentu.\n- **6 Urusan Pemerintahan Absolut Pusat**: Politik luar negeri, pertahanan, keamanan, yustisi, moneter & fiskal nasional, serta agama.\n\n### Wawasan Nusantara & Wilayah Laut (UNCLOS 1982)\n- **Deklarasi Djuanda (13 Desember 1957)**: Laut antarpulau bukan pemisah, melainkan pemersatu wilayah kedaulatan NKRI (Negara Kepulauan).\n- **Laut Teritorial (12 mil laut)**: Kedaulatan penuh atas laut, dasar laut, dan ruang udara di atasnya.\n- **Zona Tambahan (24 mil laut)**: Pengawasan bea cukai, fiskal, imigrasi, dan saniter.\n- **ZEE (200 mil laut)**: Hak berdaulat eksplorasi dan konservasi sumber daya alam.`,
      keyPoints: [
        'Ingat 6 urusan absolut pusat: Polugri, Pertahanan, Keamanan, Yustisi, Moneter-Fiskal, Agama.',
        'Deklarasi Djuanda diperingati setiap 13 Desember sebagai Hari Nusantara.',
        'Pada ZEE (200 mil), negara lain masih memiliki kebebasan berlayar dan terbang selama tidak mengeksploitasi sumber daya.',
      ],
      formulas: [],
      readMinutes: 7,
    },
    {
      subjectCode: 'TWK',
      topicSlug: 'bhinneka-tunggal-ika',
      slug: 'paket3-bhinneka-tunggal-ika-multikultural',
      title: 'Bhinneka Tunggal Ika: Landasan Filosofis dan Praktik Inklusivitas',
      summary: 'Makna historis Kakawin Sutasoma, prinsip persatuan dalam kemajemukan, serta pembedaan toleransi aktif dari etnosentrisme dan asimilasi paksa.',
      contentMd: `### Akar Sejarah & Filosofi\n- Diambil dari **Kakawin Sutasoma** karya **Mpu Tantular** pada era Majapahit (*Bhinna Ika Tunggal Ika, Tan Hana Dharma Mangrwa* — berbeda-beda namun satu, tiada kebenaran yang mendua).\n- Ditetapkan secara resmi dalam **Pasal 36A UUD 1945**: Lambang Negara ialah Garuda Pancasila dengan semboyan Bhinneka Tunggal Ika.\n\n### Prinsip Pengamalan dalam Soal SKD\n- **Common Denominator (Titik Temu)**: Mencari nilai persamaan di atas perbedaan suku, agama, ras, dan antargolongan.\n- **Tidak Bersifat Sektarian & Eksklusif**: Kebijakan publik harus mengakomodasi keragaman, bukan menyeragamkan secara paksa (*asimilasi paksa*).\n- **Inklusif & Toleransi Aktif**: Menghormati kebebasan keyakinan dan budaya lain tanpa mengorbankan prinsip identitas nasional.\n\n### Ancaman terhadap Keberagaman\n- **Etnosentrisme**: Menilai budaya kelompok lain menggunakan ukuran superioritas budaya sendiri.\n- **Primordialisme sempit**: Loyalitas berlebihan pada golongan/daerah sehingga menyingkirkan kepentingan bangsa.`,
      keyPoints: [
        'Jangan tertukar: Bhinneka Tunggal Ika berasal dari Kakawin Sutasoma (Mpu Tantular), bukan Negarakertagama (Mpu Prapanca).',
        'Integrasi nasional bermakna menyatukan perbedaan tanpa menghapus jati diri budaya masing-masing.',
        'Dasar hukum semboyan negara tercantum pada Pasal 36A UUD NRI Tahun 1945.',
      ],
      formulas: [],
      readMinutes: 5,
    },
    {
      subjectCode: 'TIU',
      topicSlug: 'soal-cerita',
      slug: 'paket3-soal-cerita-kuantitatif-aplikatif',
      title: 'Master Soal Cerita TIU: Proporsi, Laju Kerja, Gerak, dan Himpunan',
      summary: 'Kumpulan rumus praktis untuk perbandingan senilai vs berbalik nilai, kecepatan rata-rata, aritmetika sosial, diagram Venn, dan peluang dasar.',
      contentMd: `### Perbandingan Senilai vs Berbalik Nilai\n- **Senilai** (bahan bakar vs jarak, barang vs harga): \`a₁ / b₁ = a₂ / b₂\`.\n- **Berbalik Nilai** (pekerja vs waktu, kecepatan vs waktu): \`a₁ × b₁ = a₂ × b₂\`.\n- **Kerja Terhenti di Tengah Jalan**: Hitung sisa beban \`(target_hari − berjalan − libur) × pekerja_awal = sisa_hari × pekerja_total\`.\n\n### Gerak & Laju Kerja\n- **Kecepatan rata-rata jarak sama** (\`S_pergi = S_pulang\`): \`v_rata = (2 × v₁ × v₂) / (v₁ + v₂)\` (bukan rata-rata biasa).\n- **Berpapasan (berangkat bersamaan)**: \`t = S_total / (v₁ + v₂)\`.\n- **Susul-menyusul**: \`t = (v_depan × Δt) / (v_susul − v_depan)\`.\n- **Kerja bersama 2 pihak**: \`T = (A × B) / (A + B)\`.\n\n### Aritmetika Sosial, Himpunan & Peluang\n- **Harga sebelum diskon**: \`Harga_awal = Harga_bayar / (1 − %diskon)\`.\n- **Dua himpunan**: \`Total = A + B − Irisan + Luar\`.\n- **Kombinasi vs Permutasi**: Gunakan **Kombinasi** \`C(n,r)\` jika urutan tidak diperhatikan (memilih tim), dan **Permutasi** \`P(n,r)\` jika urutan/jabatan diperhatikan (ketua-sekretaris).`,
      keyPoints: [
        'Untuk soal pekerja terhenti, selalu kurangi hari berjalan sebelum menyamakan beban sisa pekerja.',
        'Kecepatan rata-rata pergi-pulang jarak sama selalu lebih kecil dari rata-rata aritmetika (v₁ + v₂)/2.',
        'Diskon 20% + 10% bernilai 28%, bukan 30%.',
      ],
      formulas: ['a₁×b₁ = a₂×b₂', 'v_rata = 2v₁v₂/(v₁+v₂)', 'n(S) = A + B − (A∩B) + Luar'],
      readMinutes: 8,
    },
    {
      subjectCode: 'TIU',
      topicSlug: 'figural-serial',
      slug: 'paket3-figural-serial-analogi-matriks',
      title: 'Panduan Lengkap Figural TIU: Serial, Analogi, Ketidaksamaan & Matriks',
      summary: 'Metode inspeksi visual terstruktur agar cepat membaca rotasi, pencerminan, pembeda tunggal, dan aturan baris-kolom pada matriks figural 3×3.',
      contentMd: `### 1. Figural Serial (Deret Gambar)\n- Lacak **satu elemen kunci** dari kotak 1 → 2 → 3 → 4 secara berurutan:\n  1. **Rotasi**: Searah jarum jam (CW) atau berlawanan (CCW) sebesar \`45°\`, \`90°\`, atau \`135°\`.\n  2. **Pergeseran posisi**: Pindah sudut atau langkah melompati sisi persegi.\n  3. **Jumlah sisi/elemen**: Bertambah atau berkurang tetap (misal segitiga → segiempat → segilima → segienam).\n  4. **Warna/Arsiran**: Bergantian penuh (hitam ↔ putih ↔ arsir).\n\n### 2. Figural Analogi (A : B :: C : ?)\n- Rumuskan transformasi tepat dari **A ke B**, lalu terapkan identik dari **C ke D**.\n- Waspadai jebakan klasik: **rotasi 180°** membalik arah atas-bawah sekaligus kiri-kanan, sedangkan **pencerminan vertikal** hanya membalik kiri-kanan.\n\n### 3. Ketidaksamaan (Mencari Gambar Berbeda)\n- Cek kesamaan 4 dari 5 gambar pada jumlah sisi, arah panah/rotasi kongruen, jumlah titik dalam vs luar, atau simetri bentuk.\n\n### 4. Penalaran Matriks 3×3\n- Uji aturan secara horizontal (baris 1 & 2) lalu verifikasi vertikal (kolom 1 & 2):\n  - **Distribusi unik**: Tiap baris berisi 3 bentuk/posisi berbeda tanpa duplikasi.\n  - **Superposisi / XOR**: Elemen yang bertumpuk pada kolom 1 & 2 **saling menghilangkan** atau **bergabung** di kolom 3.`,
      keyPoints: [
        'Jangan analisis semua elemen sekaligus; eliminasi opsi cukup dengan 1–2 elemen yang paling jelas polanya.',
        'Untuk menguji apakah dua gambar hasil rotasi atau pencerminan, bayangkan memutar kertas secara 2D tanpa membaliknya.',
        'Pada matriks 3×3, jika pola baris belum terbaca, segera periksa pola kolom dari atas ke bawah.',
      ],
      formulas: ['Rotasi 90° CW = 270° CCW', 'XOR Matriks: sama ⇒ hilang, beda ⇒ muncul'],
      readMinutes: 7,
    },
    {
      subjectCode: 'TKP',
      topicSlug: 'profesionalisme',
      slug: 'paket3-profesionalisme-sop-netralitas-asn',
      title: 'Profesionalisme ASN: Keteguhan SOP, Manajemen Prioritas, dan Netralitas',
      summary: 'Strategi memilih opsi paling berintegritas pada dilema tekanan atasan, tenggat ganda, transparansi anggaran, serta aturan netralitas politik ASN.',
      contentMd: `### Menghadapi Tekanan & Dilema SOP\n- **Perintah atasan menyalahi aturan**: Tolak dengan **sikap santun dan berargumentasi regulasi**, lalu tawarkan alternatif solusi sah agar target tetap tercapai tanpa melanggar SOP.\n- **Kesalahan kerja pribadi/tim**: Segera akui secara jujur, ambil tanggung jawab memperbaiki dampak kesalahan, dan evaluasi agar tidak terulang.\n\n### Manajemen Prioritas & Akuntabilitas\n- Jika ada beberapa tugas mendesak bersamaan, susun prioritas berdasarkan **urgensi dan dampak pelayanan publik**, koordinasikan tenggat secara terbuka, dan selesaikan tuntas.\n- Gunakan anggaran, aset, dan jam kerja kantor semata-mata untuk kepentingan dinas.\n\n### Rambu Netralitas ASN (UU ASN & SKB Netralitas)\n- ASN dilarang menghadiri deklarasi, memasang atribut, menjadi tim sukses, maupun memberi *like*, komentar, atau unggahan dukungan calon/parpol di media sosial—**baik pada jam kerja maupun di luar jam kerja**.`,
      keyPoints: [
        'Loyalitas ASN diberikan kepada Pancasila, UUD 1945, negara, dan aturan hukum—bukan kepatuhan buta pada pelanggaran.',
        'Integritas keuangan berarti mencatat seluruh pengeluaran dan bukti pertanggungjawaban sesuai biaya riil.',
        'Netralitas media sosial ASN berlaku penuh 24 jam selama berstatus ASN aktif.',
      ],
      formulas: [],
      readMinutes: 5,
    },
    {
      subjectCode: 'TKP',
      topicSlug: 'anti-radikalisme',
      slug: 'paket3-anti-radikalisme-ketahanan-ideologi',
      title: 'Anti Radikalisme, Literasi Informasi, dan Ketahanan Ideologi ASN',
      summary: 'Mengenali ciri sikap radikal-eksklusif, langkah terukur merespons provokasi atau hoaks kebencian, dan cara menjaga ruang kerja yang damai.',
      contentMd: `### Mengenali Indikator Sikap Radikal dalam Soal TKP\n- **Intoleransi aktif**: Tidak sekadar berbeda pandangan, melainkan **memaksakan kehendak** dan menolak hak hidup berdampingan kelompok lain.\n- **Eksklusivisme & penolakan konsensus**: Menganggap sistem hukum dan ideologi negara (Pancasila/UUD 1945) tidak sah.\n- **Pembenaran kekerasan**: Menyetujui intimidasi atau perusakan demi tujuan tertentu.\n\n### Langkah Bertahap Bernilai Poin 5\n1. **Saring sebelum berbagi (*tabayyun*)**: Verifikasi setiap kabar provokatif melalui kanal resmi sebelum menanggapi.\n2. **Pendekatan persuasif dan edukatif**: Jika rekan mulai terpapar narasi eksklusif, ajak berdiskusi empat mata secara sejuk dengan mengedepankan nilai Pancasila dan toleransi.\n3. **Eskalasi struktural & hukum**: Bila provokasi mengancam keselamatan, melanggar hukum, atau terus berlanjut di lingkungan kerja, laporkan berjenjang ke pimpinan/unit pembinaan kepegawaian atau aparat berwenang.\n\n> Ketegasan menolak radikalisme tetap harus ditempuh lewat cara damai, dialogis, dan sesuai koridor hukum—bukan main hakim sendiri.`,
      keyPoints: [
        'Hindari dua ekstrem dalam soal TKP Anti Radikalisme: bersikap apatis ("biarkan saja") maupun agresif tanpa prosedur ("langsung menghakimi/membubarkan sendiri").',
        'Kombinasi sikap terbaik adalah dialog persuasif + penguatan literasi kebangsaan + pelaporan resmi jika eskalasi diperlukan.',
        'ASN wajib setia dan taat sepenuhnya kepada Pancasila, UUD 1945, NKRI, dan pemerintah yang sah.',
      ],
      formulas: [],
      readMinutes: 6,
    },
  ];

  for (const m of materialsSeed) {
    const subjId = subjectMap.get(m.subjectCode)!;
    const topicId = topicMap.get(m.topicSlug)?.id;
    await prisma.studyMaterial.upsert({
      where: { slug: m.slug },
      update: {
        subjectId: subjId,
        topicId,
        title: m.title,
        summary: m.summary,
        contentMd: m.contentMd,
        keyPoints: m.keyPoints,
        formulas: m.formulas,
        readMinutes: m.readMinutes,
      },
      create: {
        subjectId: subjId,
        topicId,
        slug: m.slug,
        title: m.title,
        summary: m.summary,
        contentMd: m.contentMd,
        keyPoints: m.keyPoints,
        formulas: m.formulas,
        readMinutes: m.readMinutes,
      },
    });
  }

  // 7. Flashcards (idempotent per topicId + front; total 45 kartu: 18 TWK, 13 TIU, 14 TKP)
  const flashcardsData = [
    // TWK (8 awal + 10 tambahan = 18 kartu)
    { slug: 'uud-1945', front: 'Lembaga mana yang menguji UU terhadap UUD 1945, dan pasal berapa dasarnya?', back: 'Mahkamah Konstitusi (MK), berdasarkan Pasal 24C ayat (1) UUD NRI Tahun 1945 (putusan final).', hint: 'Bandingkan dengan MA pada Pasal 24A.' },
    { slug: 'uud-1945', front: 'Apa status Perppu jika TIDAK disetujui DPR dalam persidangan berikutnya?', back: 'Harus dicabut (Pasal 22 ayat 3 UUD NRI Tahun 1945).', hint: 'Pasal 22 ayat (1)-(3).' },
    { slug: 'bela-negara', front: 'Sebutkan pasal UUD 1945 tentang hak & kewajiban upaya pembelaan negara!', back: 'Pasal 27 ayat (3) UUD NRI Tahun 1945.', hint: 'Bedakan dengan Pasal 30 ayat (1) tentang hankam.' },
    { slug: 'nkri', front: 'Apa isi Pasal 37 ayat (5) UUD 1945?', back: 'Khusus mengenai bentuk Negara Kesatuan Republik Indonesia tidak dapat dilakukan perubahan.', hint: 'Klausul abadi konstitusi.' },
    { slug: 'nkri', front: 'Apa makna utama Deklarasi Djuanda 13 Desember 1957?', back: 'Laut di antara dan yang menghubungkan pulau-pulau Indonesia merupakan satu kesatuan wilayah kedaulatan NKRI (Negara Kepulauan).', hint: 'Diakui dalam UNCLOS 1982.' },
    { slug: 'bhinneka-tunggal-ika', front: 'Dari kitab apakah semboyan Bhinneka Tunggal Ika diambil dan siapa pengarangnya?', back: 'Kakawin Sutasoma karya Mpu Tantular.', hint: 'Majapahit, bukan Negarakertagama.' },
    { slug: 'pancasila', front: 'Apa perbedaan nilai dasar, nilai instrumental, dan nilai praksis Pancasila?', back: 'Nilai dasar (5 sila) tetap; nilai instrumental (UU/kebijakan) & nilai praksis (praktik harian) dinamis mengikuti zaman.', hint: 'Pancasila sebagai ideologi terbuka.' },
    { slug: 'bahasa-indonesia', front: 'Kapan "di" ditulis serangkai vs terpisah menurut EYD V?', back: 'Serangkai jika imbuhan kata kerja pasif (bisa diubah jadi me-); terpisah jika kata depan penunjuk tempat/arah.', hint: 'Uji dengan awalan me-.' },
    { slug: 'nasionalisme', front: 'Apa beda Nasionalisme sempit (Chauvinisme) dan Nasionalisme Pancasila?', back: 'Chauvinisme mengagungkan bangsa sendiri dan merendahkan bangsa lain; Nasionalisme Pancasila berpadu dengan perikemanusiaan.', hint: 'Keselarasan Sila ke-2 dan Sila ke-3.' },
    { slug: 'nasionalisme', front: 'Sebutkan tiga ikrar Sumpah Pemuda 28 Oktober 1928 secara berurutan!', back: 'Bertumpah darah satu (tanah Indonesia), berbangsa satu (bangsa Indonesia), menjunjung bahasa persatuan (bahasa Indonesia).', hint: 'Tanah air — Bangsa — Bahasa.' },
    { slug: 'integritas', front: 'Sebutkan 9 nilai antikorupsi KPK (kelompok inti, sikap, dan etos kerja)!', back: 'Inti: Jujur, Disiplin, Tanggung Jawab. Sikap: Adil, Berani, Peduli. Etos: Kerja Keras, Mandiri, Sederhana.', hint: 'Ju-Di-Ta | A-Be-Pe | Ke-Ma-Se.' },
    { slug: 'integritas', front: 'Berapa batas waktu wajib lapor gratifikasi ke KPK agar terbebas dari pidana suap?', back: 'Paling lambat 30 hari kerja sejak tanggal gratifikasi diterima (Pasal 12C ayat 2 UU Tipikor).', hint: 'Hitungan hari kerja, bukan hari kalender.' },
    { slug: 'bela-negara', front: 'Sebutkan 5 nilai dasar Bela Negara menurut UU No. 23 Tahun 2019 (PSDN)!', back: 'Cinta tanah air, sadar berbangsa & bernegara, setia pada Pancasila, rela berkorban, dan kemampuan awal bela negara.', hint: 'Mencakup peran sipil dan profesi ASN.' },
    { slug: 'pancasila', front: 'Bagaimana kedudukan Pembukaan UUD 1945 terhadap Batang Tubuh dan Pancasila?', back: 'Sebagai Staatsfundamentalnorm yang memuat rumusan Pancasila (alinea IV) dan tidak dapat diubah oleh MPR.', hint: 'Kesepakatan dasar amandemen ke-1.' },
    { slug: 'uud-1945', front: 'Apa beda kewenangan MA (Ps 24A), MK (Ps 24C), dan KY (Ps 24B)?', back: 'MA: kasasi & uji aturan di bawah UU. MK: uji UU vs UUD & sengketa pemilu. KY: usul hakim agung & awasi etik hakim.', hint: 'MK menguji UU; MA menguji PP/Perpres/Perda.' },
    { slug: 'uud-1945', front: 'Sebutkan 7 hak non-derogable pada Pasal 28I ayat (1) UUD 1945!', back: 'Hidup, bebas siksaan, pikiran & hati nurani, beragama, bebas perbudakan, diakui pribadi di hukum, dan asas non-retroaktif.', hint: 'Tidak boleh dikurangi dalam keadaan apa pun.' },
    { slug: 'nkri', front: 'Berapa batas Laut Teritorial, Zona Tambahan, dan ZEE Indonesia (UNCLOS 1982)?', back: 'Laut Teritorial: 12 mil (kedaulatan penuh); Zona Tambahan: 24 mil; ZEE: 200 mil (hak berdaulat sumber daya).', hint: 'Diukur dari garis pangkal kepulauan.' },
    { slug: 'bahasa-indonesia', front: 'Kapan huruf kapital dipakai untuk jabatan dan tanda koma dipakai pada kalimat majemuk (EYD V)?', back: 'Kapital jika jabatan diikuti nama orang atau sapaan langsung; koma wajib sebelum kata "melainkan" dan "sedangkan".', hint: 'Misal: "Selamat pagi, Ibu." & "Presiden Hatta".' },

    // TIU (3 awal + 10 tambahan = 13 kartu)
    { slug: 'silogisme', front: 'Apa bentuk kontraposisi dari (A ∧ B) → C?', back: '~C → (~A ∨ ~B) berdasarkan Kontraposisi + Hukum De Morgan.', hint: 'Negasi DAN menjadi ATAU.' },
    { slug: 'berhitung', front: 'Berapakah bentuk pecahan dari 37,5% dan 62,5%?', back: '37,5% = 3/8 dan 62,5% = 5/8.', hint: 'Kelipatan 12,5% = 1/8.' },
    { slug: 'soal-cerita', front: 'Rumus cepat waktu kerja bersama dua mesin (A dan B)?', back: 'T = (A × B) / (A + B).', hint: 'Laju kerja dijumlahkan.' },
    { slug: 'silogisme', front: 'Apa negasi dari "Semua peserta membawa kartu ujian DAN datang tepat waktu"?', back: '"Ada peserta yang tidak membawa kartu ujian ATAU tidak datang tepat waktu."', hint: 'Negasi Semua = Ada; negasi DAN = ATAU.' },
    { slug: 'penalaran-induktif', front: 'Kapan penalaran analogi induktif sah, dan apa jebakan generalisasi terburu-buru?', back: 'Sah jika kedua hal punya kesamaan sifat esensial yang relevan; cacat jika menyimpulkan umum dari sampel terlalu sempit.', hint: 'Bedakan ciri esensial vs ciri kebetulan.' },
    { slug: 'analitis', front: 'Bagaimana langkah tercepat memecahkan soal TIU Analitis urutan & penjadwalan?', back: 'Buat slot/tabel tetap, kunci syarat mutlak dulu, catat pertidaksamaan (<, >, ≠) untuk syarat relatif, lalu eliminasi opsi.', hint: 'Jangan baca berulang dari awal tanpa sketsa.' },
    { slug: 'berhitung', front: 'Sebutkan identitas selisih kuadrat serta bentuk persen dari 1/6, 1/3, 2/3, dan 1/12!', back: 'a² − b² = (a + b)(a − b). Konversi: 1/6 ≈ 16,67%, 1/3 ≈ 33,33%, 2/3 ≈ 66,67%, 1/12 ≈ 8,33%.', hint: 'Ubah angka besar ke selisih kuadrat.' },
    { slug: 'deret-angka', front: 'Jika deret angka naik lalu turun bergantian (osilasi), pola apa yang diuji lebih dulu?', back: 'Pola dua larik (lompat 1 suku). Jika masih tidak teratur, cek pola tiga larik atau variasi Fibonacci.', hint: 'Pisahkan suku ganjil dan suku genap.' },
    { slug: 'perbandingan-kuantitatif', front: 'Dalam Perbandingan Kuantitatif (P vs Q), kapan jawabannya "Informasi tidak cukup"?', back: 'Saat uji nilai yang memenuhi syarat menghasilkan kondisi berubah-ubah (kadang P > Q, kadang P < Q atau P = Q).', hint: 'Uji nilai x negatif, 0, pecahan (0 < x < 1), dan > 1.' },
    { slug: 'soal-cerita', front: 'Apa rumus cepat berpapasan, susul-menyusul, dan diskon bertingkat d₁ lalu d₂?', back: 'Papasan: t = S / (v₁ + v₂). Susul: t = ΔS / (v₂ − v₁). Diskon: d_total = d₁ + d₂ − (d₁ × d₂)/100.', hint: 'Papasan kecepatan ditambah; susul dikurang.' },
    { slug: 'figural-serial', front: '4 komponen apa yang wajib dilacak pada soal TIU Figural Serial (deret gambar)?', back: '1) Rotasi (45°/90°/135°), 2) Pergeseran posisi, 3) Perubahan jumlah/sisi objek, dan 4) Alternasi warna hitam-putih.', hint: 'Fokus lacak SATU elemen dulu dari gambar 1→4.' },
    { slug: 'figural-analogi', front: 'Bagaimana cara cepat memastikan aturan transformasi pada Figural Analogi (A : B :: C : ?)?', back: 'Identifikasi transformasi pasti A→B (rotasi, pencerminan, inversi warna, tukar dalam-luar), lalu terapkan persis ke C→D.', hint: 'Waspadai beda rotasi 180° vs cermin horizontal/vertikal.' },
    { slug: 'penalaran-matriks', front: 'Sebutkan 3 pola utama pada soal TIU Penalaran Matriks 3×3!', back: '1) Distribusi unik (setiap baris/kolom lengkap seperti Sudoku), 2) Progresi rotasi/jumlah, 3) Superposisi/XOR (sama hilang).', hint: 'Uji konsistensi pola baris 1 dan baris 2 lebih dulu.' },

    // TKP (4 awal + 10 tambahan = 14 kartu)
    { slug: 'pelayanan-publik', front: 'Jika warga lansia datang dengan berkas belum lengkap saat jam istirahat hampir tiba, apa sikap terbaik?', back: 'Jelaskan kekurangan secara ramah dan tertulis serta arahkan cara melengkapinya tanpa melanggar SOP.', hint: 'Ramah + Solutif + Taat SOP.' },
    { slug: 'adaptasi-tik', front: 'Bagaimana etika aman menggunakan AI generatif dalam penyusunan kajian instansi?', back: 'Jangan input data rahasia negara, gunakan sebagai asisten draf, dan verifikasi 100% fakta & regulasi.', hint: 'Lindungi data + Human-in-the-loop.' },
    { slug: 'profesionalisme', front: 'Apakah ASN boleh menghadiri deklarasi atau me-like poster kampanye di akhir pekan?', back: 'Tidak boleh. Netralitas ASN berlaku penuh baik di dalam maupun di luar jam kerja serta di media sosial.', hint: 'SKB Netralitas ASN.' },
    { slug: 'anti-radikalisme', front: 'Bagaimana menyikapi rekan kerja yang menyebarkan konten anti-Pancasila di grup obrolan?', back: 'Dialog persuasif empat mata, ingatkan komitmen ASN pada Pancasila, dan lapor ke unit pembinaan jika berlanjut.', hint: 'Persuasif + Terukur + Struktural.' },
    { slug: 'pelayanan-publik', front: 'Warga mengadu masalah yang bukan wewenang unit Anda, tetapi tampak bingung. Apa opsi poin 5?', back: 'Sambut ramah, dengarkan inti kebutuhannya, beri info jelas, lalu arahkan/hubungkan ke unit atau loket yang berwenang.', hint: 'Jangan menolak kaku dan jangan melampaui kewenangan.' },
    { slug: 'pelayanan-publik', front: 'Bagaimana standar pelayanan TKP terhadap kelompok rentan (lansia, disabilitas, ibu hamil)?', back: 'Memberikan akses prioritas, sarana ramah disabilitas, dan pendampingan komunikatif secara setara sesuai prosedur.', hint: 'UU No. 25/2009 tentang Pelayanan Publik.' },
    { slug: 'jejaring-kerja', front: 'Ego sektoral antarbidang menghambat pertukaran data proyek lintas unit. Apa tindakan poin 5?', back: 'Menginisiasi komunikasi terbuka dan koordinasi lintas unit untuk menyamakan target organisasi dan berbagi data resmi.', hint: 'Hilangkan sekat unit demi tujuan bersama.' },
    { slug: 'jejaring-kerja', front: 'Dua rekan tim berdebat keras dalam rapat hingga suasana memanas. Bagaimana sikap Jejaring Kerja terbaik?', back: 'Menengahi dengan tenang, merangkum keunggulan tiap usulan secara objektif, dan mengembalikan fokus ke target tim.', hint: 'Kolaboratif, objektif, dan jaga harmoni kerja.' },
    { slug: 'sosial-budaya', front: 'Anda ditempatkan di daerah dengan bahasa dan adat kerja berbeda dari daerah asal. Apa sikap poin 5?', back: 'Berinisiatif mempelajari adat & etika lokal, menghormati perbedaan, dan membaur aktif sambil menjaga etos ASN.', hint: 'Adaptif, inklusif, dan hormati kearifan lokal.' },
    { slug: 'sosial-budaya', front: 'Terjadi kesalahpahaman antarwarga/pegawai akibat perbedaan latar budaya saat kegiatan kantor. Apa peran Anda?', back: 'Menjadi penengah netral, memfasilitasi dialog saling menghormati, dan mendorong solusi inklusif bersama.', hint: 'Fungsi ASN sebagai perekat dan pemersatu bangsa.' },
    { slug: 'adaptasi-tik', front: 'Aplikasi baru diluncurkan, namun rekan senior kesulitan memakainya dan ingin kembali ke manual. Sikap poin 5?', back: 'Cepat menguasai sistem baru lalu mendampingi rekan senior dengan sabar atau membuat panduan ringkas agar tim kompak beralih.', hint: 'Adaptif + Berbagi keterampilan ke tim.' },
    { slug: 'adaptasi-tik', front: 'Ada pesan chat pribadi meminta data KTP pemohon layanan dengan alasan mendesak. Apa respons poin 5?', back: 'Menolak mengirim data lewat jalur tidak resmi, memverifikasi lewat saluran resmi instansi, dan melindungi privasi data.', hint: 'Keamanan siber & kepatuhan UU PDP.' },
    { slug: 'profesionalisme', front: 'Atasan meminta Anda meloloskan berkas belum lengkap karena alasan mendesak. Bagaimana sikap poin 5?', back: 'Menolak secara santun dengan dasar aturan, lalu proaktif menawarkan cara tercepat melengkapi syarat secara sah.', hint: 'Teguh pada integritas & SOP sekaligus solutif.' },
    { slug: 'anti-radikalisme', front: 'Di grup komunitas beredar narasi penolakan ideologi negara yang dikemas isu sosial. Apa sikap ASN terbaik?', back: 'Tidak ikut menyebarkan, verifikasi fakta dari sumber resmi, beri edukasi damai Pancasila, dan lapor jika ada unsur hasutan.', hint: 'Cerdas verifikasi, damai, dan taat hukum.' },
  ];

  for (const fc of flashcardsData) {
    const t = topicMap.get(fc.slug);
    if (!t) continue;
    const existing = await prisma.flashcard.findFirst({
      where: { topicId: t.id, front: fc.front },
    });
    if (existing) {
      await prisma.flashcard.update({
        where: { id: existing.id },
        data: { back: fc.back, hint: fc.hint },
      });
    } else {
      await prisma.flashcard.create({
        data: {
          topicId: t.id,
          front: fc.front,
          back: fc.back,
          hint: fc.hint,
        },
      });
    }
  }

  // 8. Demo Users, Sample Sessions & Live Showcase (NEVER executed in production or SEED_REFERENCE_ONLY=true)
  const shouldSeedDemoData =
    process.env.NODE_ENV !== 'production' && process.env.SEED_REFERENCE_ONLY !== 'true';
  if (!shouldSeedDemoData) {
    console.log(
      'Mode referensi aktif: demo users, riwayat latihan contoh, dan event live sampel dilewati. Menjamin SubscriptionPlan default...',
    );
  }

  const adminEmail = 'admin@nippia.id';
  const adminHash = await bcrypt.hash('AdminSkd2026!', 12);
  if (shouldSeedDemoData) {
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        name: 'Administrator Nippia',
        email: adminEmail,
        passwordHash: adminHash,
        role: 'ADMIN',
        emailVerified: true,
        profile: { create: { onboardingCompleted: true, totalXp: 1800, levelName: 'Menengah' } },
        preferences: { create: { isLeaderboardPublic: false } },
        streak: { create: { currentStreak: 3, longestStreak: 5 } },
      },
    });
  }

  const demoEmail = 'peserta@nippia.id';
  const demoHash = await bcrypt.hash('BelajarSkd2026!', 12);
  const existingDemo = shouldSeedDemoData
    ? await prisma.user.findUnique({ where: { email: demoEmail } })
    : null;
  let demoUser = existingDemo;
  if (shouldSeedDemoData && !demoUser) {
    demoUser = await prisma.user.create({
      data: {
        name: 'Siti Rahmawati',
        email: demoEmail,
        passwordHash: demoHash,
        role: 'USER',
        emailVerified: true,
        profile: {
          create: {
            bio: 'Pejuang CPNS Formasi Analis Kebijakan 2026',
            targetAgency: 'Kementerian Keuangan / Pemda',
            experienceLevel: 'FIRST_TIME',
            dailyStudyMinutes: 45,
            targetScore: 410,
            confidenceTwk: 3,
            confidenceTiu: 2,
            confidenceTkp: 4,
            onboardingCompleted: true,
            totalXp: 780,
            levelName: 'Pembelajar',
          },
        },
        preferences: {
          create: {
            dailyTwkTarget: 10,
            dailyTiuTarget: 10,
            dailyTkpTarget: 10,
            preferredStudyDays: [1, 2, 3, 4, 5, 6],
            isLeaderboardPublic: true,
          },
        },
        streak: {
          create: {
            currentStreak: 4,
            longestStreak: 6,
            lastActiveDate: new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10),
          },
        },
      },
    });

    // Seed sample historical practice & topic mastery for realistic analytics out-of-the-box
    const sampleTopics = await prisma.topic.findMany({
      include: { subject: true, questions: { include: { options: true }, take: 6 } },
    });
    const todayStr = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);
    for (let i = 5; i >= 0; i--) {
      const dt = new Date(`${todayStr}T00:00:00Z`);
      dt.setUTCDate(dt.getUTCDate() - i);
      const dStr = dt.toISOString().slice(0, 10);
      await prisma.dailyActivity.create({
        data: {
          userId: demoUser.id,
          date: dStr,
          questionsAnswered: i === 0 ? 12 : 18 + (i % 3) * 5,
          correctCount: i === 0 ? 9 : 13 + (i % 3) * 3,
          studyTimeSec: 1600,
          xpEarned: 110,
        },
      });
    }

    // Create 1 completed practice session with real answers across a few topics so weakness dashboard & error notebook have data
    const selectedQs = sampleTopics
      .filter((t) => ['deret-angka', 'uud-1945', 'pelayanan-publik', 'silogisme'].includes(t.slug))
      .flatMap((t) => t.questions);

    if (selectedQs.length > 0) {
      const sess = await prisma.practiceSession.create({
        data: {
          userId: demoUser.id,
          sessionType: 'TOPIC_DRILL',
          mode: 'PRACTICE',
          status: 'SUBMITTED',
          title: 'Latihan Diagnostik Awal',
          questionIds: selectedQs.map((q) => q.id),
          totalQuestions: selectedQs.length,
          answeredCount: selectedQs.length,
          correctCount: Math.floor(selectedQs.length * 0.65),
          earnedScore: selectedQs.length * 3,
          maxScore: selectedQs.length * 5,
          xpAwarded: 120,
          timeSpentSec: 950,
          completedAt: new Date(),
        },
      });

      for (let idx = 0; idx < selectedQs.length; idx++) {
        const q = selectedQs[idx];
        // Deliberately make deret-angka lower accuracy so weakness detection highlights it
        const forceWrong = q.topicId === topicMap.get('deret-angka')?.id && idx % 3 !== 0;
        const bestOpt = q.options.find((o) => o.isCorrect) ?? q.options[0];
        const wrongOpt = q.options.find((o) => !o.isCorrect) ?? q.options[1];
        const chosen = forceWrong ? wrongOpt : bestOpt;

        await prisma.practiceAnswer.create({
          data: {
            sessionId: sess.id,
            userId: demoUser.id,
            questionId: q.id,
            selectedKey: chosen.optionKey,
            isCorrect: chosen.isCorrect,
            scoreEarned: chosen.scoreValue,
            maxScore: 5,
            timeSpentSec: 45,
          },
        });

        if (!chosen.isCorrect) {
          await prisma.errorNotebook.upsert({
            where: { userId_questionId: { userId: demoUser.id, questionId: q.id } },
            update: {},
            create: {
              userId: demoUser.id,
              questionId: q.id,
              lastSelectedKey: chosen.optionKey,
              wrongCount: 1,
              nextReviewAt: new Date(),
            },
          });
        }
      }
    }
  }

  // Second learner for leaderboard (Demo only)
  const rizkyEmail = 'rizky@nippia.id';
  let rizkyUser = shouldSeedDemoData
    ? await prisma.user.findUnique({ where: { email: rizkyEmail } })
    : null;
  if (shouldSeedDemoData && !rizkyUser) {
    rizkyUser = await prisma.user.create({
      data: {
        name: 'Rizky Pratama',
        email: rizkyEmail,
        passwordHash: demoHash,
        role: 'USER',
        emailVerified: true,
        profile: {
          create: {
            onboardingCompleted: true,
            totalXp: 1620,
            levelName: 'Menengah',
            targetScore: 425,
          },
        },
        preferences: { create: { isLeaderboardPublic: true } },
        streak: { create: { currentStreak: 8, longestStreak: 12 } },
      },
    });
  }

  // Host Operator & Event Admin accounts for Live Akbar RBAC + Content Partner Demo
  const staffAccounts = [
    { email: 'operator@nippia.id', name: 'Host Operator Live Akbar', role: 'HOST_OPERATOR' as const },
    { email: 'eventadmin@nippia.id', name: 'Event Admin Nippia', role: 'EVENT_ADMIN' as const },
    { email: 'kontributor@nippia.id', name: 'Kontributor Soal Nippia', role: 'CONTENT_PARTNER' as const },
  ];
  if (shouldSeedDemoData) {
    for (const s of staffAccounts) {
      let staff = await prisma.user.findUnique({ where: { email: s.email } });
      if (!staff) {
        staff = await prisma.user.create({
          data: {
            name: s.name,
            email: s.email,
            passwordHash: demoHash,
            role: s.role,
            emailVerified: true,
            profile: { create: { onboardingCompleted: true, levelName: 'Ahli', totalXp: 8000 } },
            preferences: { create: { isLeaderboardPublic: false } },
            streak: { create: { currentStreak: 1, longestStreak: 1 } },
          },
        });
      }
      if (s.role === 'CONTENT_PARTNER') {
        await prisma.partnerVoucher.upsert({
          where: { ownerId: staff.id },
          update: {},
          create: {
            ownerId: staff.id,
            code: 'NIPPIA4K',
            discountIdr: 4000,
            commissionIdr: 5000,
            newUsersOnly: true,
            isActive: true,
          },
        });
      }
    }
  }

  // Seed Live Akbar Events (1 Open Registration + 1 Completed Showcase with Leaderboard - Demo only)
  const adminCreator = shouldSeedDemoData ? await prisma.user.findFirst({ where: { role: 'ADMIN' } }) : null;
  const activeCfg = shouldSeedDemoData ? await prisma.scoringConfiguration.findFirst({ where: { isActive: true } }) : null;

  if (adminCreator && activeCfg) {
    const openSlug = 'tryout-akbar-nasional-2026-gelombang-1';
    let openEvent = await prisma.liveEvent.findUnique({ where: { slug: openSlug } });
    if (!openEvent) {
      const now = new Date();
      openEvent = await prisma.liveEvent.create({
        data: {
          title: 'Tryout Akbar Nasional SKD CPNS 2026 — Gelombang I',
          slug: openSlug,
          description:
            'Tryout CAT SKD nasional serentak 110 soal (TWK 30, TIU 35, TKP 45) dengan sinkronisasi waktu server, ruang tunggu interaktif, pemeringkatan resmi, dan pembahasan lengkap.',
          hostName: 'Tim Akademik Nasional Nippia',
          eventStatus: 'REGISTRATION_OPEN',
          registrationStartAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
          registrationEndAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          scheduledStartAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
          durationSeconds: 100 * 60,
          maxParticipants: 2000,
          visibility: 'PUBLIC',
          eventType: 'FREE',
          packageCode: 'ALL',
          twkCount: 30,
          tiuCount: 35,
          tkpCount: 45,
          scoringConfigId: activeCfg.id,
          randomizeOptions: true,
          reviewPolicy: 'IMMEDIATE',
          rulesMd:
            '### Tata Tertib Live Akbar Nippia\n- Hadir di **Ruang Tunggu** minimal 15 menit sebelum jadwal mulai.\n- Timer dan tenggat pengumpulan mengikuti **waktu server** secara serentak.\n- Jawaban tersimpan otomatis ke server; koneksi terputus sementara dapat disambung ulang tanpa kehilangan jawaban.',
          eligibilityText: 'Terbuka gratis untuk seluruh peserta terdaftar Nippia SKD Master.',
          faqJson: [
            {
              q: 'Apakah keterlambatan masuk mendapat tambahan waktu?',
              a: 'Tidak. Seluruh peserta berbagi tenggat akhir serentak sesuai waktu server.',
            },
            {
              q: 'Kapan peringkat nasional dan pembahasan dibuka?',
              a: 'Peringkat dan pembahasan otomatis tersedia setelah event difinalisasi oleh penyelenggara.',
            },
          ],
          createdBy: adminCreator.id,
        },
      });
      await freezeEventQuestionSet(openEvent.id);
      if (demoUser) {
        await prisma.liveEventRegistration.create({
          data: {
            eventId: openEvent.id,
            userId: demoUser.id,
            registrationStatus: 'CONFIRMED',
          },
        });
      }
      if (rizkyUser) {
        await prisma.liveEventRegistration.create({
          data: {
            eventId: openEvent.id,
            userId: rizkyUser.id,
            registrationStatus: 'CONFIRMED',
            isReady: true,
            readyAt: now,
          },
        });
      }
    }

    const doneSlug = 'tryout-akbar-pemanasan-nasional-2026';
    const existingDone = await prisma.liveEvent.findUnique({ where: { slug: doneSlug } });
    if (!existingDone && demoUser && rizkyUser) {
      const pastStart = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      const pastDeadline = new Date(pastStart.getTime() + 100 * 60 * 1000);
      const doneEvent = await prisma.liveEvent.create({
        data: {
          title: 'Tryout Akbar Pemanasan Nasional SKD 2026',
          slug: doneSlug,
          description:
            'Arsip Tryout Akbar Pemanasan dengan papan peringkat nasional dan pembahasan lengkap sebagai contoh hasil & pemeringkatan.',
          hostName: 'Tim Akademik Nasional Nippia',
          eventStatus: 'WAITING_ROOM',
          registrationStartAt: new Date(pastStart.getTime() - 5 * 24 * 60 * 60 * 1000),
          registrationEndAt: new Date(pastStart.getTime() - 60 * 60 * 1000),
          scheduledStartAt: pastStart,
          actualStartAt: pastStart,
          deadlineAt: new Date(Date.now() + 60 * 60 * 1000),
          durationSeconds: 100 * 60,
          maxParticipants: 1000,
          visibility: 'PUBLIC',
          eventType: 'FREE',
          packageCode: 'PAKET_2',
          twkCount: 30,
          tiuCount: 35,
          tkpCount: 45,
          scoringConfigId: activeCfg.id,
          randomizeOptions: false,
          leaderboardPublished: false,
          reviewPolicy: 'IMMEDIATE',
          createdBy: adminCreator.id,
        },
      });
      await freezeEventQuestionSet(doneEvent.id);
      await prisma.liveEvent.update({
        where: { id: doneEvent.id },
        data: { eventStatus: 'LIVE' },
      });

      for (const participant of [demoUser, rizkyUser]) {
        await prisma.liveEventRegistration.create({
          data: {
            eventId: doneEvent.id,
            userId: participant.id,
            registrationStatus: 'CONFIRMED',
            isReady: true,
            readyAt: pastStart,
          },
        });
        await joinLiveExamSession(doneEvent.id, participant.id);
      }

      const qSets = await prisma.liveEventQuestionSet.findMany({
        where: { eventId: doneEvent.id },
        orderBy: { questionOrder: 'asc' },
      });

      for (const qs of qSets) {
        const snap = qs.questionSnapshot as {
          subjectCode: 'TWK' | 'TIU' | 'TKP';
          options: Array<{ optionKey: 'A' | 'B' | 'C' | 'D' | 'E'; isCorrect: boolean; scoreValue: number }>;
        };
        const bestOpt =
          snap.subjectCode === 'TKP'
            ? [...snap.options].sort((a, b) => b.scoreValue - a.scoreValue)[0]!
            : snap.options.find((o) => o.isCorrect)!;
        const altOpt =
          snap.options.find((o) => o.optionKey !== bestOpt.optionKey) ?? snap.options[0]!;

        // Give Rizky slightly higher accuracy than demoUser for realistic ranking
        await saveLiveAnswer({
          eventId: doneEvent.id,
          userId: rizkyUser.id,
          questionId: qs.questionId,
          displayOption: qs.questionOrder % 6 === 0 ? altOpt.optionKey : bestOpt.optionKey,
        });
        await saveLiveAnswer({
          eventId: doneEvent.id,
          userId: demoUser.id,
          questionId: qs.questionId,
          displayOption: qs.questionOrder % 4 === 0 ? altOpt.optionKey : bestOpt.optionKey,
        });
      }

      await submitLiveSession(doneEvent.id, rizkyUser.id, 'MANUAL');
      await submitLiveSession(doneEvent.id, demoUser.id, 'MANUAL');
      await prisma.liveEvent.update({
        where: { id: doneEvent.id },
        data: { deadlineAt: pastDeadline },
      });
      await finalizeEventAndRankings(doneEvent.id, adminCreator.id);
      await prisma.liveEvent.update({
        where: { id: doneEvent.id },
        data: { eventStatus: 'COMPLETED', leaderboardPublished: true },
      });
    }
  }

  // 10. Subscription Plans & Demo Pro User (Rizky)
  const proMonthlyPlan = await prisma.subscriptionPlan.upsert({
    where: { code: 'PRO_MONTHLY' },
    update: {
      name: 'Nippia Pro Bulanan',
      description:
        'Akses penuh seluruh 41 Unit Campaign, 420+ soal Drilling 24 Topik, Simulasi CAT Unlimited, Live Akbar Premium, Jadwal 14 Hari, & Spaced Repetition.',
      priceIdr: 29000,
      originalIdr: 49000,
      durationDays: 30,
      isActive: true,
      isPopular: true,
      orderIndex: 1,
      features: [
        '41 Unit Campaign Belajar Harian (TWK, TIU, TKP) lengkap',
        'Drilling 24 Topik tanpa batas + filter HARD/MEDIUM & mode EXAM',
        'Simulasi CAT 110 soal unlimited + mode Disabilitas 130 menit',
        'Gratis semua event Nippia Live Akbar Premium',
        '45 Kartu Hafalan 3D & 18 Modul Pusat Materi (Paket 1–3)',
        'Buku Kesalahan tanpa batas + Latih Ulang Spaced Repetition',
        'Generator Jadwal 14 Hari & Analisis Kelemahan 24 Topik penuh',
        'Badge eksklusif PRO di Profil, Sidebar, dan Leaderboard',
      ],
    },
    create: {
      code: 'PRO_MONTHLY',
      name: 'Nippia Pro Bulanan',
      description:
        'Akses penuh seluruh 41 Unit Campaign, 420+ soal Drilling 24 Topik, Simulasi CAT Unlimited, Live Akbar Premium, Jadwal 14 Hari, & Spaced Repetition.',
      priceIdr: 29000,
      originalIdr: 49000,
      durationDays: 30,
      isActive: true,
      isPopular: true,
      orderIndex: 1,
      features: [
        '41 Unit Campaign Belajar Harian (TWK, TIU, TKP) lengkap',
        'Drilling 24 Topik tanpa batas + filter HARD/MEDIUM & mode EXAM',
        'Simulasi CAT 110 soal unlimited + mode Disabilitas 130 menit',
        'Gratis semua event Nippia Live Akbar Premium',
        '45 Kartu Hafalan 3D & 18 Modul Pusat Materi (Paket 1–3)',
        'Buku Kesalahan tanpa batas + Latih Ulang Spaced Repetition',
        'Generator Jadwal 14 Hari & Analisis Kelemahan 24 Topik penuh',
        'Badge eksklusif PRO di Profil, Sidebar, dan Leaderboard',
      ],
    },
  });

  await prisma.subscriptionPlan.upsert({
    where: { code: 'PRO_QUARTERLY' },
    update: {
      name: 'Nippia Pro 3 Bulan (Hemat)',
      description: 'Paket persiapan intensif 90 hari menjelang seleksi CPNS dengan biaya lebih hemat.',
      priceIdr: 79000,
      originalIdr: 87000,
      durationDays: 90,
      isActive: true,
      isPopular: false,
      orderIndex: 2,
      features: [
        'Semua fitur Nippia Pro Bulanan aktif selama 90 hari penuh',
        'Hemat Rp 8.000 dibanding perpanjangan bulanan reguler',
        'Prioritas akses Tryout Live Akbar Premium sepanjang periode',
      ],
    },
    create: {
      code: 'PRO_QUARTERLY',
      name: 'Nippia Pro 3 Bulan (Hemat)',
      description: 'Paket persiapan intensif 90 hari menjelang seleksi CPNS dengan biaya lebih hemat.',
      priceIdr: 79000,
      originalIdr: 87000,
      durationDays: 90,
      isActive: true,
      isPopular: false,
      orderIndex: 2,
      features: [
        'Semua fitur Nippia Pro Bulanan aktif selama 90 hari penuh',
        'Hemat Rp 8.000 dibanding perpanjangan bulanan reguler',
        'Prioritas akses Tryout Live Akbar Premium sepanjang periode',
      ],
    },
  });

  if (rizkyUser) {
    const existingRizkySub = await prisma.userSubscription.findFirst({
      where: { userId: rizkyUser.id, status: 'ACTIVE', expiresAt: { gt: new Date() } },
    });
    if (!existingRizkySub) {
      await prisma.userSubscription.create({
        data: {
          userId: rizkyUser.id,
          planId: proMonthlyPlan.id,
          status: 'ACTIVE',
          startedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          source: 'ORDER',
          note: 'Seeded Pro Member',
        },
      });
    }
  }

  console.log('Seeding database selesai dengan sukses!');
}

main()
  .catch((e) => {
    console.error('Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
