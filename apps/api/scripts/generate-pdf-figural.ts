import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { QuestionBankJsonItem } from '@nippia/shared';
import { PDF_MATRIKS_30, type PdfFiguralQuestionDef } from './pdf-matriks-data.js';
import { PDF_ANALOGI_30 } from './pdf-analogi-data.js';
import { PDF_SERIAL_30 } from './pdf-serial-data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function toQuestionBankItem(def: PdfFiguralQuestionDef): QuestionBankJsonItem {
  const topicMeta = {
    matrix: {
      prefix: 'TIU-PDF-MAT',
      topic: 'Penalaran Matriks',
      topicSlug: 'penalaran-matriks',
      questionType: 'FIGURAL_MATRIX',
    },
    analogy: {
      prefix: 'TIU-PDF-ANA',
      topic: 'Analogi',
      topicSlug: 'figural-analogi',
      questionType: 'FIGURAL_ANALOGY',
    },
    serial: {
      prefix: 'TIU-PDF-SER',
      topic: 'Serial',
      topicSlug: 'figural-serial',
      questionType: 'FIGURAL_SERIAL',
    },
  }[def.kind];

  const id = `${topicMeta.prefix}-${String(def.num).padStart(3, '0')}`;
  const distractorAnalysis: Record<string, string> = {};
  for (const o of def.options) {
    if (o.key !== def.correctOption) {
      distractorAnalysis[o.key] = `Tidak memenuhi pola transformasi soal (${o.text}).`;
    }
  }

  return {
    id,
    subject: 'TIU',
    topic: topicMeta.topic,
    topicSlug: topicMeta.topicSlug,
    subtopic: def.subtopic,
    questionType: topicMeta.questionType,
    difficulty: def.difficulty,
    stem: def.stem,
    visualSpec: def.visualSpec,
    options: def.options.map((o) => ({
      key: o.key,
      text: o.text,
      score: o.key === def.correctOption ? 5 : 0,
      isCorrect: o.key === def.correctOption,
      rationale:
        o.key === def.correctOption
          ? `Tepat (${o.key}): ${def.explanation}`
          : `Kurang tepat: ${o.text} belum memenuhi pola pada soal.`,
      visualSpec: o.visualSpec as unknown as Record<string, unknown>,
    })),
    correctOption: def.correctOption,
    explanation: {
      concept: `Penalaran Figural — ${topicMeta.topic}: identifikasi atribut bentuk, rotasi, pencerminan, pengurangan/penambahan elemen, atau distribusi baris-kolom secara konsisten.`,
      stepByStep: [
        'Amati perubahan tiap elemen satu per satu (bentuk luar, elemen dalam, rotasi, arsiran, dan jumlah).',
        def.explanation,
      ],
      correctReason: def.explanation,
      distractorAnalysis,
      quickTrick: def.quickTrick,
      commonMistakes: 'Menilai gambar secara keseluruhan sekaligus sehingga tertukar antara rotasi dan pencerminan atau melupakan pola arsiran.',
      studyMaterialTip: `Latih lebih banyak soal ${topicMeta.topic} untuk mempercepat pengenalan pola visual.`,
    },
    references: [
      {
        title: 'Latihan Persepsi, Analogi, dan Konsistensi Logis Gambar (PDF Modul Latihan 4, 6, 8)',
        source: 'Modul Referensi Figural Pengguna',
      },
    ],
    disclaimer: 'Soal latihan figural yang disusun ulang ke format digital Nippia; bukan soal resmi BKN.',
  };
}

const all90 = [
  ...PDF_MATRIKS_30.map(toQuestionBankItem),
  ...PDF_ANALOGI_30.map(toQuestionBankItem),
  ...PDF_SERIAL_30.map(toQuestionBankItem),
];

const outPath = path.resolve(__dirname, '../data/questions/pdf-figural.json');
fs.writeFileSync(outPath, JSON.stringify(all90, null, 2), 'utf8');
console.log(`Generated ${all90.length} PDF figural questions -> ${outPath}`);
