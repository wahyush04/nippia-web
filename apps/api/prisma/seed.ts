import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import type { QuestionBankJsonItem } from '@nippia/shared';

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

  // 3. Questions (Paket 1 + Paket 2 + Paket 3 + 90 TIU Figural PDF = 420 published SKD questions)
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
  console.log(`Seeded ${totalQuestions} soal SKD (Paket 1, Paket 2, Paket 3, dan 90 TIU Figural PDF).`);

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
  ];

  for (const m of materialsSeed) {
    const subjId = subjectMap.get(m.subjectCode)!;
    const topicId = topicMap.get(m.topicSlug)?.id;
    await prisma.studyMaterial.upsert({
      where: { slug: m.slug },
      update: {
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

  // 7. Flashcards (only seed if empty)
  const fcCount = await prisma.flashcard.count();
  if (fcCount === 0) {
    const flashcardsData = [
      { slug: 'uud-1945', front: 'Lembaga mana yang menguji UU terhadap UUD 1945, dan pasal berapa dasarnya?', back: 'Mahkamah Konstitusi (MK), berdasarkan Pasal 24C ayat (1) UUD NRI Tahun 1945 (putusan final).', hint: 'Bandingkan dengan MA pada Pasal 24A.' },
      { slug: 'uud-1945', front: 'Apa status Perppu jika TIDAK disetujui DPR dalam persidangan berikutnya?', back: 'Harus dicabut (Pasal 22 ayat 3 UUD NRI Tahun 1945).', hint: 'Pasal 22 ayat (1)-(3).' },
      { slug: 'bela-negara', front: 'Sebutkan pasal UUD 1945 tentang hak & kewajiban upaya pembelaan negara!', back: 'Pasal 27 ayat (3) UUD NRI Tahun 1945.', hint: 'Bedakan dengan Pasal 30 ayat (1) tentang hankam.' },
      { slug: 'nkri', front: 'Apa isi Pasal 37 ayat (5) UUD 1945?', back: 'Khusus mengenai bentuk Negara Kesatuan Republik Indonesia tidak dapat dilakukan perubahan.', hint: 'Klausul abadi konstitusi.' },
      { slug: 'nkri', front: 'Apa makna utama Deklarasi Djuanda 13 Desember 1957?', back: 'Laut di antara dan yang menghubungkan pulau-pulau Indonesia merupakan satu kesatuan wilayah kedaulatan NKRI (Negara Kepulauan).', hint: 'Diakui dalam UNCLOS 1982.' },
      { slug: 'bhinneka-tunggal-ika', front: 'Dari kitab apakah semboyan Bhinneka Tunggal Ika diambil dan siapa pengarangnya?', back: 'Kakawin Sutasoma karya Mpu Tantular.', hint: 'Majapahit, bukan Negarakertagama.' },
      { slug: 'pancasila', front: 'Apa perbedaan nilai dasar, nilai instrumental, dan nilai praksis Pancasila?', back: 'Nilai dasar (5 sila) tetap; nilai instrumental (UU/kebijakan) & nilai praksis (praktik harian) dinamis mengikuti zaman.', hint: 'Pancasila sebagai ideologi terbuka.' },
      { slug: 'bahasa-indonesia', front: 'Kapan "di" ditulis serangkai vs terpisah menurut EYD V?', back: 'Serangkai jika imbuhan kata kerja pasif (bisa diubah jadi me-); terpisah jika kata depan penunjuk tempat/arah.', hint: 'Uji dengan awalan me-.' },
      { slug: 'silogisme', front: 'Apa bentuk kontraposisi dari (A ∧ B) → C?', back: '~C → (~A ∨ ~B) berdasarkan Kontraposisi + Hukum De Morgan.', hint: 'Negasi DAN menjadi ATAU.' },
      { slug: 'berhitung', front: 'Berapakah bentuk pecahan dari 37,5% dan 62,5%?', back: '37,5% = 3/8 dan 62,5% = 5/8.', hint: 'Kelipatan 12,5% = 1/8.' },
      { slug: 'soal-cerita', front: 'Rumus cepat waktu kerja bersama dua mesin (A dan B)?', back: 'T = (A × B) / (A + B).', hint: 'Laju kerja dijumlahkan.' },
      { slug: 'pelayanan-publik', front: 'Jika warga lansia datang dengan berkas belum lengkap saat jam istirahat hampir tiba, apa sikap terbaik?', back: 'Jelaskan kekurangan secara ramah dan tertulis serta arahkan cara melengkapinya tanpa melanggar SOP.', hint: 'Ramah + Solutif + Taat SOP.' },
      { slug: 'adaptasi-tik', front: 'Bagaimana etika aman menggunakan AI generatif dalam penyusunan kajian instansi?', back: 'Jangan input data rahasia negara, gunakan sebagai asisten draf, dan verifikasi 100% fakta & regulasi.', hint: 'Lindungi data + Human-in-the-loop.' },
      { slug: 'profesionalisme', front: 'Apakah ASN boleh menghadiri deklarasi atau me-like poster kampanye di akhir pekan?', back: 'Tidak boleh. Netralitas ASN berlaku penuh baik di dalam maupun di luar jam kerja serta di media sosial.', hint: 'SKB Netralitas ASN.' },
      { slug: 'anti-radikalisme', front: 'Bagaimana menyikapi rekan kerja yang menyebarkan konten anti-Pancasila di grup obrolan?', back: 'Dialog persuasif empat mata, ingatkan komitmen ASN pada Pancasila, dan lapor ke unit pembinaan jika berlanjut.', hint: 'Persuasif + Terukur + Struktural.' },
    ];

    for (const fc of flashcardsData) {
      const t = topicMap.get(fc.slug);
      if (t) {
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
  }

  // 8. Demo Users (Admin & Sample Learners)
  const adminEmail = 'admin@nippia.id';
  const adminHash = await bcrypt.hash('AdminSkd2026!', 12);
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

  const demoEmail = 'peserta@nippia.id';
  const demoHash = await bcrypt.hash('BelajarSkd2026!', 12);
  const existingDemo = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!existingDemo) {
    const demoUser = await prisma.user.create({
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

  // Second learner for leaderboard
  const rizkyEmail = 'rizky@nippia.id';
  if (!(await prisma.user.findUnique({ where: { email: rizkyEmail } }))) {
    await prisma.user.create({
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
