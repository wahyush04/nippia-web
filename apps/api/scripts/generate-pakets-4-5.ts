import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildMcq, buildTkp, QuestionBankJsonItem } from './paket-builder';
import { PAKET4_TWK } from './paket4-twk-data';
import { PAKET5_TWK, TOPUP_TWK } from './paket5-twk-data';
import { PAKET4_TIU_DATA } from './paket4-tiu-data';
import { PAKET5_TIU_DATA } from './paket5-tiu-data';
import { PAKET4_TKP_DATA } from './paket4-tkp-data';
import { PAKET5_TKP_DATA } from './paket5-tkp-data';

const FORBIDDEN_TOPICS = new Set([
  'pancasila',
  'figural-serial',
  'figural-analogi',
  'penalaran-matriks',
]);

function validateAndCollect(
  name: string,
  items: QuestionBankJsonItem[],
  expectedSubject: 'TWK' | 'TIU' | 'TKP',
  expectedCount: number,
  checkForbiddenTopics: boolean,
) {
  if (items.length !== expectedCount) {
    throw new Error(`${name}: expected ${expectedCount} questions, got ${items.length}`);
  }
  const seenIds = new Set<string>();
  const topicCounts: Record<string, number> = {};

  for (const item of items) {
    if (seenIds.has(item.id)) throw new Error(`${name}: duplicate id ${item.id}`);
    seenIds.add(item.id);
    if (item.subject !== expectedSubject) {
      throw new Error(`${name}: ${item.id} has wrong subject ${item.subject}`);
    }
    if (checkForbiddenTopics && FORBIDDEN_TOPICS.has(item.topicSlug)) {
      throw new Error(`${name}: ${item.id} targets topic ${item.topicSlug} (> 20 soal, forbidden!)`);
    }
    topicCounts[item.topicSlug] = (topicCounts[item.topicSlug] || 0) + 1;

    if (item.options.length !== 5) {
      throw new Error(`${name}: ${item.id} must have 5 options`);
    }
    const keys = item.options.map((o) => o.key).join('');
    if (keys !== 'ABCDE') {
      throw new Error(`${name}: ${item.id} option keys mismatch (${keys})`);
    }
    if (expectedSubject === 'TKP') {
      const scores = item.options.map((o) => o.score).sort((a, b) => a - b);
      if (scores.join(',') !== '1,2,3,4,5') {
        throw new Error(`${name}: TKP ${item.id} must have unique scores 1..5, got ${scores.join(',')}`);
      }
    } else {
      const correctCount = item.options.filter((o) => o.isCorrect && o.score === 5).length;
      const zeroCount = item.options.filter((o) => !o.isCorrect && o.score === 0).length;
      if (correctCount !== 1 || zeroCount !== 4) {
        throw new Error(`${name}: ${item.id} must have 1 correct (5) & 4 wrong (0)`);
      }
    }
  }
  console.log(`OK: ${name} (${items.length}) ->`, topicCounts);
}

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(currentDir, '../data/questions');

const paket4Twk = PAKET4_TWK;
const paket4Tiu = PAKET4_TIU_DATA.map(buildMcq);
const paket4Tkp = PAKET4_TKP_DATA.map(buildTkp);

const paket5Twk = PAKET5_TWK;
const paket5Tiu = PAKET5_TIU_DATA.map(buildMcq);
const paket5Tkp = PAKET5_TKP_DATA.map(buildTkp);

const topupTwk = TOPUP_TWK;

validateAndCollect('paket4-twk.json', paket4Twk, 'TWK', 30, true);
validateAndCollect('paket4-tiu.json', paket4Tiu, 'TIU', 35, true);
validateAndCollect('paket4-tkp.json', paket4Tkp, 'TKP', 45, false);

validateAndCollect('paket5-twk.json', paket5Twk, 'TWK', 30, true);
validateAndCollect('paket5-tiu.json', paket5Tiu, 'TIU', 35, true);
validateAndCollect('paket5-tkp.json', paket5Tkp, 'TKP', 45, false);

validateAndCollect('topup-topics.json', topupTwk, 'TWK', 2, true);

// Check global uniqueness against all existing JSON files
const existingFiles = [
  'twk.json',
  'tiu.json',
  'tkp.json',
  'paket2-twk.json',
  'paket2-tiu.json',
  'paket2-tkp.json',
  'paket3-twk.json',
  'paket3-tiu.json',
  'paket3-tkp.json',
  'pdf-figural.json',
];

const globalIds = new Set<string>();
const globalStems = new Map<string, string>();
for (const file of existingFiles) {
  const fullPath = path.join(outDir, file);
  if (!fs.existsSync(fullPath)) continue;
  const rows = JSON.parse(fs.readFileSync(fullPath, 'utf8')) as QuestionBankJsonItem[];
  for (const r of rows) {
    globalIds.add(r.id);
    const norm = r.stem.trim().toLowerCase().replace(/\s+/g, ' ');
    globalStems.set(norm, r.id);
  }
}

const allNew = [
  ...paket4Twk,
  ...paket4Tiu,
  ...paket4Tkp,
  ...paket5Twk,
  ...paket5Tiu,
  ...paket5Tkp,
  ...topupTwk,
];

for (const item of allNew) {
  if (globalIds.has(item.id)) {
    throw new Error(`Global ID collision: ${item.id}`);
  }
  globalIds.add(item.id);
  const norm = item.stem.trim().toLowerCase().replace(/\s+/g, ' ');
  if (globalStems.has(norm)) {
    throw new Error(`Global stem collision between ${item.id} and ${globalStems.get(norm)}`);
  }
  globalStems.set(norm, item.id);
}

fs.writeFileSync(path.join(outDir, 'paket4-twk.json'), JSON.stringify(paket4Twk, null, 2), 'utf8');
fs.writeFileSync(path.join(outDir, 'paket4-tiu.json'), JSON.stringify(paket4Tiu, null, 2), 'utf8');
fs.writeFileSync(path.join(outDir, 'paket4-tkp.json'), JSON.stringify(paket4Tkp, null, 2), 'utf8');

fs.writeFileSync(path.join(outDir, 'paket5-twk.json'), JSON.stringify(paket5Twk, null, 2), 'utf8');
fs.writeFileSync(path.join(outDir, 'paket5-tiu.json'), JSON.stringify(paket5Tiu, null, 2), 'utf8');
fs.writeFileSync(path.join(outDir, 'paket5-tkp.json'), JSON.stringify(paket5Tkp, null, 2), 'utf8');

fs.writeFileSync(path.join(outDir, 'topup-topics.json'), JSON.stringify(topupTwk, null, 2), 'utf8');

console.log(`SUCCESS: Generated 7 JSON files (${allNew.length} total new questions) with 0 collisions.`);
