import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import type { DifficultyLevel, SubjectCode } from '@nippia/shared';

const AI_SYSTEM_GUARDRAILS = `Anda adalah Tutor AI Nippia - SKD Master, asisten belajar independen untuk persiapan CPNS SKD (TWK, TIU, TKP) berbahasa Indonesia.
Aturan wajib:
1. Gunakan konten terverifikasi platform yang diberikan di konteks sebagai sumber utama.
2. JANGAN pernah mengarang pasal hukum, fakta sejarah, atau aturan resmi BKN/KemenPAN-RB. Jika tidak yakin atau informasi tahun terbaru perlu diverifikasi, nyatakan secara eksplisit.
3. Bedakan fakta terverifikasi dari saran belajar umum.
4. JANGAN pernah mengklaim soal latihan yang dibuat adalah soal resmi BKN.
5. Gunakan bahasa Indonesia yang jelas, ramah, terstruktur, dan edukatif.`;

async function callExternalLlm(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>): Promise<string | null> {
  if (env.aiProvider === 'openai' && env.openaiApiKey) {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: env.aiModel || 'gpt-4o-mini',
        messages,
        temperature: 0.4,
      }),
    });
    if (resp.ok) {
      const data = (await resp.json()) as { choices?: Array<{ message?: { content?: string } }> };
      return data.choices?.[0]?.message?.content ?? null;
    }
  }

  if (env.aiProvider === 'gemini' && env.geminiApiKey) {
    const systemInstruction = messages.find((m) => m.role === 'system')?.content ?? AI_SYSTEM_GUARDRAILS;
    const userPrompt = messages
      .filter((m) => m.role !== 'system')
      .map((m) => `${m.role === 'user' ? 'Pengguna' : 'Asisten'}: ${m.content}`)
      .join('\n\n');

    const model = env.aiModel || 'gemini-2.5-flash';
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: { temperature: 0.4 },
        }),
      },
    );
    if (resp.ok) {
      const data = (await resp.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    }
  }

  return null;
}

/**
 * Grounded AI Tutor response using platform question bank, study materials, and user's weakness telemetry.
 */
export async function generateTutorReply(
  userId: string,
  userMessage: string,
  contextQuestionId?: string,
): Promise<{ content: string; citations: Array<{ label: string; source: string }> }> {
  const citations: Array<{ label: string; source: string }> = [];

  const [question, weakTopics, materials] = await Promise.all([
    contextQuestionId
      ? prisma.question.findUnique({
          where: { id: contextQuestionId },
          include: { subject: true, topic: true, options: true, references: true },
        })
      : null,
    prisma.topicMastery.findMany({
      where: { userId, attemptsCount: { gte: 3 } },
      orderBy: { accuracyPct: 'asc' },
      take: 3,
      include: { topic: { include: { subject: true } } },
    }),
    prisma.studyMaterial.findMany({
      take: 5,
      include: { subject: true, topic: true },
    }),
  ]);

  let groundedContext = '';
  if (question) {
    const correctOpt = question.options.find((o) => o.isCorrect);
    groundedContext += `\n[KONTEKS SOAL PLATFORM (${question.code} - ${question.subject.code} / ${question.topic.name})]\n`;
    groundedContext += `Pertanyaan: ${question.stem}\n`;
    groundedContext += `Pilihan:\n${question.options.map((o) => `${o.optionKey}. ${o.text} (Skor: ${o.scoreValue})`).join('\n')}\n`;
    if (correctOpt) groundedContext += `Opsi terbaik/benar: ${correctOpt.optionKey}\n`;
    groundedContext += `Konsep: ${question.conceptSummary ?? ''}\nPembahasan: ${question.explanation}\nTrik Cepat: ${question.quickTrick ?? ''}\n`;
    citations.push({ label: `${question.code}: ${question.topic.name}`, source: 'Bank Soal Terverifikasi Nippia' });
    for (const ref of question.references) {
      citations.push({ label: ref.title, source: ref.source });
    }
  }

  if (weakTopics.length > 0) {
    groundedContext += `\n[KELEMAHAN PENGGUNA TERKINI]\n`;
    for (const w of weakTopics) {
      groundedContext += `- ${w.topic.subject.code} ${w.topic.name}: akurasi ${w.accuracyPct}% (${w.attemptsCount} soal)\n`;
    }
  }

  const lowerMsg = userMessage.toLowerCase();
  const matchedMaterial = materials.find(
    (m) =>
      lowerMsg.includes(m.title.toLowerCase()) ||
      (m.topic && lowerMsg.includes(m.topic.name.toLowerCase())) ||
      lowerMsg.includes(m.subject.code.toLowerCase()),
  );

  if (matchedMaterial) {
    groundedContext += `\n[MATERI TERVERIFIKASI PLATFORM: ${matchedMaterial.title}]\n${matchedMaterial.summary}\n`;
    citations.push({ label: matchedMaterial.title, source: 'Pusat Materi Nippia' });
  }

  // Try external LLM if configured
  try {
    const external = await callExternalLlm([
      { role: 'system', content: AI_SYSTEM_GUARDRAILS },
      {
        role: 'user',
        content: `Konteks Platform Terverifikasi:\n${groundedContext || 'Tidak ada soal spesifik dipilih.'}\n\nPertanyaan Pengguna:\n${userMessage}`,
      },
    ]);
    if (external) {
      return { content: external, citations };
    }
  } catch (err) {
    console.warn('[AI EXTERNAL CALL FAILED - USING GROUNDED FALLBACK]', err);
  }

  // Grounded deterministic Indonesian tutor engine (always reliable, zero hallucination)
  if (question) {
    const bestOpt =
      question.options.find((o) => o.isCorrect) ??
      [...question.options].sort((a, b) => b.scoreValue - a.scoreValue)[0];
    const steps = Array.isArray(question.stepByStep) ? (question.stepByStep as string[]) : [];

    const replyParts: string[] = [
      `Mari kita bedah soal **${question.code}** (${question.subject.code} — ${question.topic.name}) dengan bahasa yang lebih sederhana:`,
      '',
      `**1. Inti Konsep (Fakta Terverifikasi)**`,
      question.conceptSummary || question.explanation,
      '',
      `**2. Langkah Penalarannya**`,
      ...(steps.length > 0 ? steps.map((s, idx) => `${idx + 1}. ${s}`) : [question.explanation]),
      '',
      `**3. Mengapa Jawaban Terbaik adalah ${bestOpt?.optionKey}**`,
      `${bestOpt?.optionFeedback || question.explanation}`,
    ];

    if (question.quickTrick) {
      replyParts.push('', `**4. Trik Cepat Mengingat**`, question.quickTrick);
    }
    if (question.commonMistakes) {
      replyParts.push('', `**5. Jebakan yang Sering Terjadi**`, question.commonMistakes);
    }

    replyParts.push(
      '',
      `> *Catatan: Penjelasan di atas bersumber langsung dari materi pembahasan terverifikasi Nippia. Ini adalah soal latihan orisinal, bukan soal resmi BKN.*`,
    );

    return { content: replyParts.join('\n'), citations };
  }

  if (lowerMsg.includes('lemah') || lowerMsg.includes('rekomendasi') || lowerMsg.includes('rencana') || lowerMsg.includes('fokus')) {
    const weakText =
      weakTopics.length > 0
        ? weakTopics
            .map(
              (w, i) =>
                `${i + 1}. **${w.topic.subject.code} — ${w.topic.name}** (Akurasi ${w.accuracyPct}% dari ${w.attemptsCount} soal) → Disarankan latihan 10–15 soal tingkat Mudah/Sedang hari ini.`,
            )
            .join('\n')
        : 'Belum ada cukup sampel jawaban (minimal 5 soal per topik) untuk menentukan topik terlemah. Mulai dengan **Latihan Harian** (10 TWK, 10 TIU, 10 TKP) agar sistem dapat memetakan profil kemampuan Anda secara akurat.';

    return {
      content: [
        'Berikut **Rekomendasi Belajar Terpersonalisasi** berdasarkan riwayat latihan Anda di Nippia:',
        '',
        weakText,
        '',
        '**Saran Metode Belajar (Umum):**',
        '- Terapkan siklus *Latihan → Baca Pembahasan Trik Cepat → Ulangi di Buku Kesalahan (H+1, H+3, H+7)*.',
        '- Gunakan menu **Perencana Belajar** untuk menjadwalkan simulasi CAT berkala.',
      ].join('\n'),
      citations,
    };
  }

  if (lowerMsg.includes('silogisme') || lowerMsg.includes('tiu') || lowerMsg.includes('deret')) {
    const related = await prisma.question.findFirst({
      where: { subject: { code: 'TIU' }, status: 'PUBLISHED' },
      include: { topic: true, options: true },
    });
    return {
      content: [
        'Untuk menguasai **TIU (Silogisme, Deret Angka, maupun Perbandingan Kuantitatif)**, fokuslah pada pola berikut:',
        '',
        '1. **Silogisme:** Semua + Sebagian = Sebagian. Kontraposisi `P → Q` setara dengan `~Q → ~P`. Jangan menambahkan asumsi di luar premis.',
        '2. **Deret Angka:** Selalu cek selisih antarangka dahulu; jika naik-turun, langsung pisah menjadi dua larik (ganjil vs genap).',
        '3. **Hitungan Cepat:** Ubah persen ke pecahan istimewa (`12,5% = 1/8`, `37,5% = 3/8`).',
        related
          ? `\n**Contoh Soal Latihan Serupa (${related.code} — ${related.topic.name}):**\n${related.stem}\n*(Buka menu Latihan per Topik untuk mengerjakannya secara interaktif.)*`
          : '',
        '',
        '> *Catatan: Contoh di atas adalah soal latihan orisinal Nippia, bukan soal resmi BKN.*',
      ].join('\n'),
      citations: [{ label: 'Panduan Trik Cepat TIU', source: 'Pusat Materi Nippia' }],
    };
  }

  if (matchedMaterial) {
    const kps = Array.isArray(matchedMaterial.keyPoints) ? (matchedMaterial.keyPoints as string[]) : [];
    return {
      content: [
        `Berikut ringkasan terverifikasi mengenai **${matchedMaterial.title}**:`,
        '',
        matchedMaterial.summary,
        '',
        ...(kps.length > 0 ? ['**Poin Kunci:**', ...kps.map((k) => `- ${k}`)] : []),
        '',
        'Jika Anda ingin membahas soal tertentu, pilih tombol **"Tanya Tutor AI"** langsung dari halaman pembahasan soal atau sebutkan topik spesifik (misal: *Silogisme*, *UUD 1945*, *Pelayanan Publik*).',
      ].join('\n'),
      citations,
    };
  }

  return {
    content: [
      'Halo! Saya **Tutor AI Nippia (SKD Master)**.',
      '',
      'Saya dapat membantu Anda dengan:',
      '- **Membedah soal** TWK, TIU, atau TKP dengan bahasa sederhana dan langkah demi langkah.',
      '- **Menjelaskan alasan** mengapa suatu opsi salah dan trik cepat menghindari pengecoh.',
      '- **Menganalisis kelemahan Anda** dan menyarankan topik latihan berikutnya.',
      '- **Merangkum materi inti** (Pancasila, UUD 1945, EYD V, Silogisme, Deret, dan 6 kompetensi TKP).',
      '',
      'Silakan tanyakan topik spesifik, misalnya: *"Apa kelemahan belajar saya saat ini?"*, *"Jelaskan aturan silogisme"*, atau klik **"Tanya Tutor AI"** di halaman pembahasan soal.',
    ].join('\n'),
    citations,
  };
}

/**
 * Generates draft original practice questions for Admin CMS review (always saved as DRAFT, never auto-published).
 */
export async function generateDraftQuestionsForAdmin(params: {
  subjectCode: SubjectCode;
  topicSlug: string;
  subtopicName?: string;
  difficulty: DifficultyLevel;
  count: number;
}) {
  const topic = await prisma.topic.findUnique({
    where: { slug: params.topicSlug },
    include: { subject: true },
  });
  if (!topic) {
    throw new Error(`Topik ${params.topicSlug} tidak ditemukan`);
  }

  const safeCount = Math.max(1, Math.min(5, params.count));

  // Try external LLM if configured
  if ((env.aiProvider === 'openai' && env.openaiApiKey) || (env.aiProvider === 'gemini' && env.geminiApiKey)) {
    try {
      const prompt = `Buat ${safeCount} soal latihan ORISINAL SKD CPNS berbahasa Indonesia (bukan soal resmi BKN) untuk:
Subtes: ${params.subjectCode}
Topik: ${topic.name}
Subtopik: ${params.subtopicName || topic.name}
Tingkat Kesulitan: ${params.difficulty}

Kembalikan JSON array valid tanpa markdown fence, tiap item berformat:
{
  "stem": "teks soal",
  "explanation": "pembahasan lengkap",
  "conceptSummary": "ringkasan konsep",
  "quickTrick": "trik cepat",
  "commonMistakes": "kesalahan umum",
  "options": [
    {"optionKey":"A","text":"...","scoreValue":5,"isCorrect":true,"optionFeedback":"..."},
    ... (5 opsi A-E; untuk TKP skor harus unik 1..5, untuk TWK/TIU tepat satu 5 dan lainnya 0)
  ]
}`;
      const raw = await callExternalLlm([
        { role: 'system', content: AI_SYSTEM_GUARDRAILS },
        { role: 'user', content: prompt },
      ]);
      if (raw) {
        const cleaned = raw.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[AI GEN EXTERNAL FALLBACK]', err);
    }
  }

  // Structured verified template generator (drafts marked for human review)
  const drafts = [];
  for (let i = 1; i <= safeCount; i++) {
    const codeSuffix = `${Date.now().toString().slice(-4)}-${i}`;
    if (params.subjectCode === 'TKP') {
      drafts.push({
        code: `DRAFT-TKP-${codeSuffix}`,
        subjectCode: 'TKP',
        topicSlug: topic.slug,
        subtopicName: params.subtopicName || topic.name,
        difficulty: params.difficulty,
        stem: `[Draf AI #${i} - Perlu Review Admin] Dalam pelaksanaan tugas terkait ${topic.name}, seorang pegawai menghadapi perbedaan preferensi antara prosedur standar dan permintaan mendesak pemangku kepentingan. Tindakan yang paling mencerminkan kompetensi ${topic.name} adalah...`,
        conceptSummary: `Kompetensi ${topic.name} menuntut keseimbangan integritas, solusi konstruktif, dan pelayanan terbaik.`,
        explanation: `Opsi terbaik (skor 5) menyelesaikan kebutuhan pemangku kepentingan secara solutif tanpa melanggar aturan. (Draf ini dihasilkan sistem untuk ditinjau ulang oleh editor sebelum dipublikasikan).`,
        quickTrick: 'Pilih tindakan paling proaktif, kolaboratif, dan tetap taat regulasi.',
        commonMistakes: 'Mengorbankan SOP demi kecepatan atau menolak tanpa memberi alternatif.',
        options: [
          { optionKey: 'A', text: 'Menyampaikan batas aturan dengan ramah sekaligus menawarkan solusi alternatif resmi yang paling cepat', scoreValue: 5, isCorrect: true, optionFeedback: 'Skor 5: Solutif, ramah, dan taat prosedur.' },
          { optionKey: 'B', text: 'Menanyakan arahan teknis kepada rekan senior sembari menenangkan pemohon', scoreValue: 4, isCorrect: false, optionFeedback: 'Skor 4: Kooperatif namun agak lambat.' },
          { optionKey: 'C', text: 'Menjelaskan aturan baku secara normatif tanpa alternatif tambahan', scoreValue: 3, isCorrect: false, optionFeedback: 'Skor 3: Patuh aturan tetapi kaku.' },
          { optionKey: 'D', text: 'Meminta pemohon kembali lagi minggu depan saat antrean sepi', scoreValue: 2, isCorrect: false, optionFeedback: 'Skor 2: Menunda layanan.' },
          { optionKey: 'E', text: 'Meloloskan permintaan di luar prosedur agar cepat selesai', scoreValue: 1, isCorrect: false, optionFeedback: 'Skor 1: Melanggar SOP.' },
        ],
      });
    } else if (params.subjectCode === 'TIU') {
      const a = 4 + i * 2;
      const b = 5 + i;
      const sum = a + b;
      const ans = a * 10 + b * 10;
      drafts.push({
        code: `DRAFT-TIU-${codeSuffix}`,
        subjectCode: 'TIU',
        topicSlug: topic.slug,
        subtopicName: params.subtopicName || topic.name,
        difficulty: params.difficulty,
        stem: `[Draf AI #${i} - Perlu Review Admin] Terkait latihan ${topic.name}: Jika nilai P = ${a} × 10 dan Q = ${b} × 10, maka nilai P + Q adalah...`,
        conceptSummary: `Operasi distributif aritmetika: (${a} + ${b}) × 10 = ${sum} × 10.`,
        explanation: `Gunakan sifat distributif: ${a}×10 + ${b}×10 = (${a}+${b})×10 = ${sum}×10 = ${ans}.`,
        quickTrick: 'Keluarkan faktor pengali yang sama (×10) sebelum menjumlahkan.',
        commonMistakes: 'Salah menjumlahkan angka satuan.',
        options: [
          { optionKey: 'A', text: String(ans - 10), scoreValue: 0, isCorrect: false, optionFeedback: 'Kurang 10.' },
          { optionKey: 'B', text: String(ans), scoreValue: 5, isCorrect: true, optionFeedback: `Benar: (${a}+${b}) × 10 = ${ans}.` },
          { optionKey: 'C', text: String(ans + 10), scoreValue: 0, isCorrect: false, optionFeedback: 'Kelebihan 10.' },
          { optionKey: 'D', text: String(ans + 20), scoreValue: 0, isCorrect: false, optionFeedback: 'Kelebihan 20.' },
          { optionKey: 'E', text: String(sum), scoreValue: 0, isCorrect: false, optionFeedback: 'Lupa dikalikan 10.' },
        ],
      });
    } else {
      drafts.push({
        code: `DRAFT-TWK-${codeSuffix}`,
        subjectCode: 'TWK',
        topicSlug: topic.slug,
        subtopicName: params.subtopicName || topic.name,
        difficulty: params.difficulty,
        stem: `[Draf AI #${i} - Perlu Review Admin] Dalam implementasi nilai ${topic.name}, tindakan aparatur negara yang paling selaras dengan konstitusi dan kepentingan persatuan bangsa adalah...`,
        conceptSummary: `Pengamalan ${topic.name} memadukan kesadaran berbangsa, kepatuhan hukum, dan penghargaan terhadap keberagaman.`,
        explanation: `Opsi B mencerminkan penerapan nilai ${topic.name} secara konstitusional, adil, dan inklusif. (Draf AI memerlukan verifikasi referensi hukum oleh Admin sebelum publikasi).`,
        quickTrick: 'Pilih tindakan yang memperkuat persatuan, keadilan hukum, dan hak seluruh warga negara.',
        commonMistakes: 'Memilih opsi yang mengutamakan golongan tertentu.',
        options: [
          { optionKey: 'A', text: 'Mengutamakan kepentingan kelompok tertentu demi stabilitas lokal', scoreValue: 0, isCorrect: false, optionFeedback: 'Tidak adil.' },
          { optionKey: 'B', text: 'Menjalankan tugas secara adil, taat konstitusi, dan merangkul keberagaman masyarakat', scoreValue: 5, isCorrect: true, optionFeedback: 'Selaras dengan nilai kebangsaan dan konstitusi.' },
          { optionKey: 'C', text: 'Mengabaikan aspirasi masyarakat daerah demi penyeragaman penuh', scoreValue: 0, isCorrect: false, optionFeedback: 'Mengabaikan Bhinneka Tunggal Ika.' },
          { optionKey: 'D', text: 'Menunda penegakan aturan agar terhindar dari perbedaan pendapat', scoreValue: 0, isCorrect: false, optionFeedback: 'Abai terhadap tanggung jawab hukum.' },
          { optionKey: 'E', text: 'Memisahkan layanan publik berdasarkan latar belakang warga', scoreValue: 0, isCorrect: false, optionFeedback: 'Diskriminatif.' },
        ],
      });
    }
  }

  return drafts;
}
