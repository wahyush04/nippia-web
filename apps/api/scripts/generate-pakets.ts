import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { QuestionBankJsonItem } from '@nippia/shared';
import { PAKET2_TWK } from './paket2-twk-data.js';
import { PAKET2_TIU } from './paket2-tiu-data.js';
import { PAKET2_TKP } from './paket2-tkp-data.js';
import { PAKET3_TWK } from './paket3-twk-data.js';
import { PAKET3_TIU } from './paket3-tiu-data.js';
import { PAKET3_TKP } from './paket3-tkp-data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../data/questions');

function validateSet(name: string, items: QuestionBankJsonItem[], expectedSubject: 'TWK' | 'TIU' | 'TKP', expectedCount: number) {
  if (items.length !== expectedCount) {
    throw new Error(`${name}: expected ${expectedCount} questions, got ${items.length}`);
  }
  const seen = new Set<string>();
  for (const q of items) {
    if (seen.has(q.id)) throw new Error(`${name}: duplicate id ${q.id}`);
    seen.add(q.id);
    if (q.subject !== expectedSubject) throw new Error(`${name}: wrong subject ${q.subject} on ${q.id}`);
    if (q.options.length !== 5) throw new Error(`${name}: ${q.id} does not have 5 options`);
    if (expectedSubject === 'TKP') {
      const scores = q.options.map((o) => o.score).sort((a, b) => a - b);
      if (scores.join(',') !== '1,2,3,4,5') {
        throw new Error(`${name}: TKP ${q.id} scores invalid (${scores.join(',')})`);
      }
      const best = q.options.filter((o) => o.isCorrect);
      if (best.length !== 1 || best[0].score !== 5 || best[0].key !== q.correctOption) {
        throw new Error(`${name}: TKP ${q.id} correctOption mismatch`);
      }
    } else {
      const cor = q.options.filter((o) => o.isCorrect);
      if (cor.length !== 1 || cor[0].score !== 5 || cor[0].key !== q.correctOption) {
        throw new Error(`${name}: ${q.id} correctOption mismatch`);
      }
      if (q.options.some((o) => !o.isCorrect && o.score !== 0)) {
        throw new Error(`${name}: ${q.id} distractor has non-zero score`);
      }
    }
  }
  const byTopic: Record<string, number> = {};
  items.forEach((q) => {
    byTopic[q.topicSlug] = (byTopic[q.topicSlug] || 0) + 1;
  });
  console.log(`Validated ${name}: ${items.length} items`, byTopic);
}

const outputs: Array<{ filename: string; items: QuestionBankJsonItem[]; subject: 'TWK' | 'TIU' | 'TKP'; count: number }> = [
  { filename: 'paket2-twk.json', items: PAKET2_TWK, subject: 'TWK', count: 30 },
  { filename: 'paket2-tiu.json', items: PAKET2_TIU, subject: 'TIU', count: 35 },
  { filename: 'paket2-tkp.json', items: PAKET2_TKP, subject: 'TKP', count: 45 },
  { filename: 'paket3-twk.json', items: PAKET3_TWK, subject: 'TWK', count: 30 },
  { filename: 'paket3-tiu.json', items: PAKET3_TIU, subject: 'TIU', count: 35 },
  { filename: 'paket3-tkp.json', items: PAKET3_TKP, subject: 'TKP', count: 45 },
];

for (const out of outputs) {
  validateSet(out.filename, out.items, out.subject, out.count);
  fs.writeFileSync(path.join(outDir, out.filename), JSON.stringify(out.items, null, 2), 'utf8');
}

console.log('All Paket 2 & Paket 3 question files generated and validated successfully!');
