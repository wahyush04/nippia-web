import type { DifficultyLevel, QuestionBankJsonItem, SubjectCode } from '@nippia/shared';

type OptKey = 'A' | 'B' | 'C' | 'D' | 'E';
const KEYS: OptKey[] = ['A', 'B', 'C', 'D', 'E'];

export const TOPIC_NAMES: Record<string, string> = {
  // TWK
  'nasionalisme': 'Nasionalisme',
  'integritas': 'Integritas',
  'bela-negara': 'Bela Negara',
  'pancasila': 'Pancasila',
  'uud-1945': 'UUD 1945',
  'nkri': 'NKRI',
  'bhinneka-tunggal-ika': 'Bhinneka Tunggal Ika',
  'bahasa-indonesia': 'Bahasa Indonesia',
  // TIU
  'silogisme': 'Silogisme',
  'penalaran-induktif': 'Penalaran Induktif',
  'analitis': 'Analitis',
  'berhitung': 'Berhitung',
  'deret-angka': 'Deret Angka',
  'perbandingan-kuantitatif': 'Perbandingan Kuantitatif',
  'soal-cerita': 'Soal Cerita',
  'figural-serial': 'Serial',
  'figural-analogi': 'Analogi',
  'penalaran-matriks': 'Penalaran Matriks',
  // TKP
  'pelayanan-publik': 'Pelayanan Publik',
  'jejaring-kerja': 'Jejaring Kerja',
  'sosial-budaya': 'Sosial Budaya',
  'adaptasi-tik': 'Adaptasi terhadap Perkembangan TIK',
  'profesionalisme': 'Profesionalisme',
  'anti-radikalisme': 'Anti Radikalisme',
};

export interface McqInput {
  id: string;
  subject: 'TWK' | 'TIU';
  topicSlug: string;
  subtopic: string;
  difficulty: DifficultyLevel;
  stem: string;
  visualSpec?: Record<string, unknown> | null;
  options: Record<OptKey, { text: string; why: string; visualSpec?: Record<string, unknown> | null }>;
  correct: OptKey;
  concept: string;
  steps: string[];
  correctReason: string;
  quickTrick: string;
  commonMistakes: string;
  tip: string;
  refs: Array<{ title: string; source: string; note?: string }>;
}

export function buildMcq(q: McqInput): QuestionBankJsonItem {
  const topic = TOPIC_NAMES[q.topicSlug];
  if (!topic) throw new Error(`Unknown topicSlug ${q.topicSlug} on ${q.id}`);

  const distractorAnalysis: Record<string, string> = {};
  const options = KEYS.map((k) => {
    const o = q.options[k];
    const isCorrect = k === q.correct;
    if (!isCorrect) distractorAnalysis[k] = o.why;
    return {
      key: k,
      text: o.text,
      score: isCorrect ? 5 : 0,
      isCorrect,
      rationale: o.why,
      ...(o.visualSpec ? { visualSpec: o.visualSpec } : {}),
    };
  });

  return {
    id: q.id,
    subject: q.subject as SubjectCode,
    topic,
    topicSlug: q.topicSlug,
    subtopic: q.subtopic,
    questionType: q.visualSpec ? 'FIGURAL' : 'MULTIPLE_CHOICE',
    difficulty: q.difficulty,
    stem: q.stem,
    ...(q.visualSpec ? { visualSpec: q.visualSpec } : {}),
    options,
    correctOption: q.correct,
    explanation: {
      concept: q.concept,
      stepByStep: q.steps,
      correctReason: q.correctReason,
      distractorAnalysis,
      quickTrick: q.quickTrick,
      commonMistakes: q.commonMistakes,
      studyMaterialTip: q.tip,
    },
    references: q.refs,
    disclaimer: 'Soal latihan orisinal untuk persiapan SKD; bukan soal resmi BKN.',
  };
}

export interface TkpInput {
  id: string;
  topicSlug: string;
  subtopic: string;
  difficulty: DifficultyLevel;
  stem: string;
  options: Record<OptKey, { text: string; score: 1 | 2 | 3 | 4 | 5; why: string }>;
  concept: string;
  steps: string[];
  quickTrick: string;
  commonMistakes: string;
  tip: string;
  refs: Array<{ title: string; source: string; note?: string }>;
}

export function buildTkp(q: TkpInput): QuestionBankJsonItem {
  const topic = TOPIC_NAMES[q.topicSlug];
  if (!topic) throw new Error(`Unknown topicSlug ${q.topicSlug} on ${q.id}`);

  const scores = KEYS.map((k) => q.options[k].score).sort((a, b) => a - b);
  if (scores.join(',') !== '1,2,3,4,5') {
    throw new Error(`TKP ${q.id} must have unique scores 1..5, got ${scores.join(',')}`);
  }

  let bestKey: OptKey = 'A';
  const distractorAnalysis: Record<string, string> = {};
  const options = KEYS.map((k) => {
    const o = q.options[k];
    const isCorrect = o.score === 5;
    if (isCorrect) bestKey = k;
    else distractorAnalysis[k] = `Skor ${o.score} — ${o.why}`;
    return {
      key: k,
      text: o.text,
      score: o.score,
      isCorrect,
      rationale: `Skor ${o.score}: ${o.why}`,
    };
  });

  return {
    id: q.id,
    subject: 'TKP',
    topic,
    topicSlug: q.topicSlug,
    subtopic: q.subtopic,
    questionType: 'SITUATIONAL_JUDGEMENT',
    difficulty: q.difficulty,
    stem: q.stem,
    options,
    correctOption: bestKey,
    explanation: {
      concept: q.concept,
      stepByStep: q.steps,
      correctReason: `Opsi ${bestKey} (skor 5): ${q.options[bestKey].why}`,
      distractorAnalysis,
      quickTrick: q.quickTrick,
      commonMistakes: q.commonMistakes,
      studyMaterialTip: q.tip,
    },
    references: q.refs,
    disclaimer: 'Soal latihan orisinal untuk persiapan SKD; pembobotan 1–5 disusun untuk latihan kompetensi dan bukan kunci resmi BKN.',
  };
}
