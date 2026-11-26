import {
  arrowLine,
  cell,
  circle,
  g,
  line,
  PAT,
  path,
  plusCross,
  poly,
  rect,
  regularPoly,
  sectorPath,
  type CellSpec,
  type SvgNode,
} from './figural-helpers.js';
import type { PdfFiguralQuestionDef } from './pdf-matriks-data.js';

const ser = (frames: CellSpec[]) => ({ kind: 'serial', frames });

function q2Quad(filledIdx: number): CellSpec {
  const coords = [
    [16, 16],
    [50, 16],
    [50, 50],
    [16, 50],
  ];
  const [fx, fy] = coords[filledIdx];
  return cell([
    rect(16, 16, 68, 68, PAT.WHITE, 2.2),
    rect(fx, fy, 34, 34, PAT.DIAG, 1.8),
    line(50, 16, 50, 84, 2),
    line(16, 50, 84, 50, 2),
  ]);
}

function q5Pin(rotDeg: number): CellSpec {
  return cell([
    rect(18, 18, 64, 64, PAT.WHITE, 2.4),
    g([line(50, 50, 82, 18, 2.2)], { transform: `rotate(${rotDeg} 50 50)` }),
    rect(38, 38, 24, 24, PAT.WHITE, 2.2),
  ]);
}

function q6HexPin(rotDeg: number): CellSpec {
  return cell([
    rect(16, 18, 68, 64, PAT.WHITE, 2.4),
    g([line(50, 50, 16, 18, 2.4)], { transform: `rotate(${rotDeg} 50 50)` }),
    regularPoly(50, 50, 18, 6, PAT.WHITE, 30, 2.2),
  ]);
}

function q10Comb(rotDeg: number, teeth: number): CellSpec {
  const toothNodes: SvgNode[] = [];
  for (let i = 0; i < teeth; i++) {
    const y = 60 + i * 5;
    toothNodes.push(line(18, y, 32, y, 2));
  }
  return cell([
    g([
      path('M 32 16 L 18 16 L 18 84 L 32 84', PAT.NONE, 2.4),
      ...toothNodes,
    ], { transform: `rotate(${rotDeg} 50 50)` }),
  ]);
}

function q13Panel(rotDeg: number): CellSpec {
  return cell([
    g([
      rect(16, 16, 68, 68, PAT.WHITE, 2.2),
      line(16, 46, 84, 46, 2),
      line(48, 16, 48, 84, 2),
      rect(16, 46, 32, 38, PAT.VERT, 1.8),
      plusCross(62, 28, 6, 2, PAT.WHITE),
      plusCross(74, 38, 6, 2, PAT.WHITE),
      poly('24,72 36,72 30,60', PAT.WHITE, 1.8),
    ], { transform: `rotate(${rotDeg} 50 50)` }),
  ]);
}

function q15HexDots(dots: Array<{ pos: number; fill: string }>): CellSpec {
  const pts = [
    [50, 16],
    [79, 33],
    [79, 67],
    [50, 84],
    [21, 67],
    [21, 33],
  ];
  const nodes: SvgNode[] = [regularPoly(50, 50, 34, 6, PAT.WHITE, 0, 2.4)];
  dots.forEach((d) => {
    const [cx, cy] = pts[d.pos % 6];
    nodes.push(circle(cx, cy, 5, d.fill, 1.8));
  });
  return cell(nodes);
}

function q24Corners(items: Array<{ corner: 0 | 1 | 2 | 3; kind: 'sq' | 'triUp' | 'triDown' | 'circ'; fill: string }>): CellSpec {
  const coords = [
    [28, 28],
    [72, 28],
    [72, 72],
    [28, 72],
  ];
  const nodes: SvgNode[] = [rect(14, 14, 72, 72, PAT.WHITE, 2.4)];
  items.forEach((it) => {
    const [cx, cy] = coords[it.corner];
    if (it.kind === 'sq') nodes.push(rect(cx - 8, cy - 8, 16, 16, it.fill, 2));
    if (it.kind === 'circ') nodes.push(circle(cx, cy, 8, it.fill, 2));
    if (it.kind === 'triUp') nodes.push(poly(`${cx},${cy - 9} ${cx + 9},${cy + 8} ${cx - 9},${cy + 8}`, it.fill, 2));
    if (it.kind === 'triDown') nodes.push(poly(`${cx - 9},${cy - 8} ${cx + 9},${cy - 8} ${cx},${cy + 9}`, it.fill, 2));
  });
  return cell(nodes);
}

function q28DotsBox(leftCount: number, rightCount: number): CellSpec {
  const nodes: SvgNode[] = [rect(14, 14, 72, 72, PAT.WHITE, 2.4)];
  const posL = [[28, 28], [28, 50], [28, 72], [42, 28], [42, 50], [42, 72]];
  const posR = [[72, 28], [72, 50], [72, 72], [58, 28], [58, 50], [58, 72], [72, 39], [58, 39]];
  for (let i = 0; i < Math.min(leftCount, posL.length); i++) {
    nodes.push(circle(posL[i][0], posL[i][1], 4.5, PAT.BLACK));
  }
  for (let i = 0; i < Math.min(rightCount, posR.length); i++) {
    nodes.push(circle(posR[i][0], posR[i][1], 4.5, PAT.BLACK));
  }
  return cell(nodes);
}

function q29Capsule(vertical: boolean, fill: string, dotSide: 'bot' | 'top' | 'left' | 'right'): CellSpec {
  const nodes: SvgNode[] = [];
  if (vertical) {
    nodes.push(path('M 30 16 Q 50 26 70 16 L 70 72 Q 50 62 30 72 Z', fill, 2.2));
    nodes.push(circle(50, dotSide === 'bot' ? 84 : 10, 6, PAT.WHITE, 2));
  } else {
    nodes.push(path('M 22 30 Q 32 50 22 70 L 78 70 Q 68 50 78 30 Z', fill, 2.2));
    nodes.push(circle(dotSide === 'left' ? 12 : 88, 50, 6, PAT.WHITE, 2));
  }
  return cell(nodes);
}

export const PDF_SERIAL_30: PdfFiguralQuestionDef[] = [
  {
    num: 1, kind: 'serial', difficulty: 'EASY', subtopic: 'Serial Penambahan Sektor Lingkaran (Latihan 8 #1)',
    stem: 'Perhatikan penambahan bagian juring lingkaran dari kiri ke kanan, lalu pilih gambar yang tepat untuk melanjutkan seri.',
    visualSpec: ser([
      cell([sectorPath(50, 50, 34, 45, 90, PAT.BLACK)]),
      cell([sectorPath(50, 50, 34, 0, 90, PAT.BLACK)]),
      cell([sectorPath(50, 50, 34, 0, 90, PAT.BLACK), sectorPath(50, 50, 34, 270, 360, PAT.BLACK)]),
      cell([sectorPath(50, 50, 34, 0, 90, PAT.BLACK), sectorPath(50, 50, 34, 270, 360, PAT.BLACK), sectorPath(50, 50, 34, 180, 270, PAT.BLACK)]),
    ]),
    options: [
      { key: 'A', text: 'Tiga kuadran tersambung atas dan kanan', visualSpec: cell([sectorPath(50, 50, 34, 270, 360, PAT.BLACK), sectorPath(50, 50, 34, 0, 180, PAT.BLACK)]) },
      { key: 'B', text: 'Lingkaran hitam penuh', visualSpec: cell([circle(50, 50, 34, PAT.BLACK)]) },
      { key: 'C', text: 'Empat kuadran terpisah garis silang', visualSpec: cell([circle(50, 50, 34, PAT.BLACK), line(16, 50, 84, 50, 2, { stroke: '#ffffff' }), line(50, 16, 50, 84, 2, { stroke: '#ffffff' })]) },
      { key: 'D', text: 'Tiga kuadran kanan dan bawah', visualSpec: cell([sectorPath(50, 50, 34, 0, 270, PAT.BLACK)]) },
      { key: 'E', text: 'Penambahan bagian searah jarum jam (seperempat + setengah bawah)', visualSpec: cell([sectorPath(50, 50, 34, 90, 180, PAT.BLACK), sectorPath(50, 50, 34, 270, 360, PAT.BLACK), sectorPath(50, 50, 34, 180, 270, PAT.BLACK)]) },
    ],
    correctOption: 'E',
    explanation: 'Pola seri menunjukkan penambahan juring secara berurutan searah jarum jam (E).',
    quickTrick: 'Lacak sektor tambahan yang bergerak berputar searah jarum jam.',
  },
  {
    num: 2, kind: 'serial', difficulty: 'EASY', subtopic: 'Serial Pergeseran Kotak Terarsir (Latihan 8 #2)',
    stem: 'Perhatikan pergeseran kotak yang diarsir di dalam grid 2×2 berikut, lalu tentukan kelanjutannya.',
    visualSpec: ser([q2Quad(0), q2Quad(1), q2Quad(2), q2Quad(3)]),
    options: [
      { key: 'A', text: 'Kotak arsir di kanan atas', visualSpec: q2Quad(1) },
      { key: 'B', text: 'Kotak arsir di kanan bawah', visualSpec: q2Quad(2) },
      { key: 'C', text: 'Kotak arsir di kiri bawah & kanan bawah', visualSpec: cell([rect(16, 16, 68, 68, PAT.WHITE), rect(16, 50, 68, 34, PAT.DIAG), line(50, 16, 50, 84, 2)]) },
      { key: 'D', text: 'Kotak arsir di kiri bawah melanjutkan pergeseran searah jarum jam', visualSpec: q2Quad(3) },
      { key: 'E', text: 'Dua kotak berarsir kiri atas & kanan bawah', visualSpec: cell([rect(16, 16, 68, 68, PAT.WHITE), rect(16, 16, 34, 34, PAT.DIAG), rect(50, 50, 34, 34, PAT.DIAG)]) },
    ],
    correctOption: 'D',
    explanation: 'Kotak berarsir bergeser searah jarum jam dari kiri atas → kanan atas → kanan bawah → kiri bawah (D).',
    quickTrick: 'Gerak searah jarum jam pada 4 kuadran.',
  },
  {
    num: 3, kind: 'serial', difficulty: 'MEDIUM', subtopic: 'Serial Pergeseran Satu Sisi Segienam (Latihan 8 #3)',
    stem: 'Amati pergeseran satu garis sisi pada segienam berurutan berikut.',
    visualSpec: ser([
      cell([regularPoly(50, 50, 34, 6, PAT.WHITE, 30)]),
      cell([path('M 33 20 L 67 20 L 84 50 L 67 80 L 33 80 L 16 50 L 58 32', PAT.NONE, 2.4)]),
      cell([path('M 33 20 L 67 20 L 84 50 L 67 80 L 33 80 L 16 50 L 84 50', PAT.NONE, 2.4)]),
    ]),
    options: [
      { key: 'A', text: 'Segienam utuh polos', visualSpec: cell([regularPoly(50, 50, 34, 6, PAT.WHITE, 30)]) },
      { key: 'B', text: 'Satu sisi terpotong di atas', visualSpec: cell([path('M 33 20 L 67 20 L 84 50 L 67 80 L 33 80 L 16 50', PAT.NONE, 2.4)]) },
      { key: 'C', text: 'Sisi terus bergeser searah jarum jam membentuk tarikan garis ke sudut kanan-bawah', visualSpec: cell([path('M 67 20 L 84 50 L 67 80 L 33 80 L 16 50 L 54 66', PAT.NONE, 2.4)]) },
      { key: 'D', text: 'Garis memanjang keluar di kiri atas', visualSpec: cell([path('M 14 20 L 67 20 L 84 50 L 67 80 L 33 80', PAT.NONE, 2.4)]) },
      { key: 'E', text: 'Segienam terbuka di kanan atas', visualSpec: cell([path('M 33 20 L 67 20 M 84 50 L 67 80 L 33 80 L 16 50', PAT.NONE, 2.4)]) },
    ],
    correctOption: 'C',
    explanation: 'Satu sisi dari segienam bergeser masuk dan berputar searah jarum jam pada setiap langkah (C).',
    quickTrick: 'Ikuti ujung garis yang masuk searah jarum jam ke kuadran bawah.',
  },
  {
    num: 4, kind: 'serial', difficulty: 'EASY', subtopic: 'Serial Dua Objek Berlawanan Arah (Latihan 8 #4)',
    stem: 'Perhatikan arah gerak lingkaran dan segitiga di dalam persegi panjang berikut.',
    visualSpec: ser([
      cell([rect(26, 12, 48, 76, PAT.WHITE), circle(60, 24, 7, PAT.WHITE), poly('38,60 48,80 28,80', PAT.WHITE)]),
      cell([rect(26, 12, 48, 76, PAT.WHITE), circle(50, 24, 7, PAT.WHITE), poly('38,60 48,80 28,80', PAT.WHITE)]),
      cell([rect(26, 12, 48, 76, PAT.WHITE), circle(38, 24, 7, PAT.WHITE), poly('38,38 48,58 28,58', PAT.WHITE)]),
    ]),
    options: [
      { key: 'A', text: 'Segitiga di kiri atas, lingkaran bergerak ke kiri tengah', visualSpec: cell([rect(26, 12, 48, 76, PAT.WHITE), poly('38,18 48,38 28,38', PAT.WHITE), circle(38, 52, 7, PAT.WHITE)]) },
      { key: 'B', text: 'Lingkaran di kanan atas, segitiga di bawah', visualSpec: cell([rect(26, 12, 48, 76, PAT.WHITE), circle(60, 24, 7, PAT.WHITE), poly('50,60 60,80 40,80', PAT.WHITE)]) },
      { key: 'C', text: 'Segitiga dan lingkaran sejajar di atas', visualSpec: cell([rect(26, 12, 48, 76, PAT.WHITE), poly('38,20 48,40 28,40', PAT.WHITE), circle(60, 28, 7, PAT.WHITE)]) },
      { key: 'D', text: 'Segitiga di atas, lingkaran di bawah', visualSpec: cell([rect(26, 12, 48, 76, PAT.WHITE), poly('50,18 60,38 40,38', PAT.WHITE), circle(60, 74, 7, PAT.WHITE)]) },
      { key: 'E', text: 'Segitiga di atas, lingkaran di tengah', visualSpec: cell([rect(26, 12, 48, 76, PAT.WHITE), poly('50,18 60,38 40,38', PAT.WHITE), circle(50, 54, 7, PAT.WHITE)]) },
    ],
    correctOption: 'A',
    explanation: 'Lingkaran bergerak berlawanan arah jarum jam (kanan atas → kiri atas → turun sisi kiri), sedangkan segitiga bergerak searah jarum jam (kiri bawah → naik ke kiri atas) sehingga keduanya bertemu di sisi kiri (A).',
    quickTrick: 'Lacak masing-masing objek: Lingkaran turun di kiri, Segitiga naik ke kiri atas.',
  },
  {
    num: 5, kind: 'serial', difficulty: 'EASY', subtopic: 'Serial Rotasi Garis Penghubung Sudut-Sisi (Latihan 8 #5)',
    stem: 'Amati perputaran garis lurus yang menghubungkan kotak kecil dengan bingkai luar.',
    visualSpec: ser([q5Pin(0), q5Pin(45), q5Pin(90), q5Pin(135)]),
    options: [
      { key: 'A', text: 'Garis menghadap kiri atas', visualSpec: q5Pin(-45) },
      { key: 'B', text: 'Garis menghadap kiri atas tipis', visualSpec: q5Pin(-45) },
      { key: 'C', text: 'Garis menghadap kiri bawah (180° dari awal)', visualSpec: q5Pin(180) },
      { key: 'D', text: 'Garis diagonal penuh melintasi kotak', visualSpec: cell([rect(18, 18, 64, 64, PAT.WHITE), line(18, 82, 82, 18, 2.2), rect(38, 38, 24, 24, PAT.WHITE)]) },
      { key: 'E', text: 'Garis menghadap kiri (225°)', visualSpec: q5Pin(225) },
    ],
    correctOption: 'C',
    explanation: 'Garis lurus berputar searah jarum jam bertahap: sudut kanan atas → sisi kanan → sudut kanan bawah → sisi bawah → sudut kiri bawah (C).',
    quickTrick: '0° → 45° → 90° → 135° → 180° (sudut kiri bawah).',
  },
  {
    num: 6, kind: 'serial', difficulty: 'MEDIUM', subtopic: 'Serial Rotasi Bertahap Segienam (Latihan 8 #6)',
    stem: 'Perhatikan perubahan posisi garis sudut segienam dengan langkah rotasi yang makin mengecil.',
    visualSpec: ser([q6HexPin(0), q6HexPin(120), q6HexPin(180), q6HexPin(210)]),
    options: [
      { key: 'A', text: 'Garis di sisi kiri bawah (seperempat sisi berikutnya)', visualSpec: q6HexPin(225) },
      { key: 'B', text: 'Garis di sudut kiri atas', visualSpec: q6HexPin(0) },
      { key: 'C', text: 'Garis lurus mendatar ke kiri', visualSpec: q6HexPin(315) },
      { key: 'D', text: 'Garis di sudut kanan bawah', visualSpec: q6HexPin(180) },
      { key: 'E', text: 'Garis ke sudut bawah', visualSpec: q6HexPin(240) },
    ],
    correctOption: 'A',
    explanation: 'Garis berputar searah jarum jam secara bertahap: bergeser 2 sisi → 1 sisi → 1/2 sisi → maka selanjutnya bergeser 1/4 sisi ke posisi kiri bawah (A).',
    quickTrick: 'Jarak putaran dibagi dua setiap langkah: 2 → 1 → 1/2 → 1/4.',
  },
  {
    num: 7, kind: 'serial', difficulty: 'MEDIUM', subtopic: 'Serial Rotasi Bergantian Atas & Bawah (Latihan 8 #7)',
    stem: 'Amati bagian atas dan bagian bawah batang yang berputar secara bergantian.',
    visualSpec: ser([
      cell([rect(40, 26, 20, 48, PAT.BLACK), poly('50,12 62,26 38,26', PAT.WHITE), poly('50,88 62,74 38,74', PAT.WHITE)]),
      cell([poly('40,26 60,26 60,74 30,74 30,56 40,56', PAT.BLACK), poly('50,12 62,26 38,26', PAT.WHITE), poly('16,65 30,56 30,74', PAT.WHITE)]),
      cell([rect(26, 40, 48, 20, PAT.BLACK), poly('12,50 26,38 26,62', PAT.WHITE), poly('88,50 74,38 74,62', PAT.WHITE)]),
      cell([poly('40,26 60,26 60,74 30,74 30,56 40,56', PAT.BLACK), poly('50,12 62,26 38,26', PAT.WHITE), poly('16,65 30,56 30,74', PAT.WHITE)]),
    ]),
    options: [
      { key: 'A', text: 'Batang tegak lurus dengan kedua ujung berhadapan berputar sesuai giliran atas', visualSpec: cell([rect(40, 26, 20, 48, PAT.BLACK), poly('50,12 62,26 38,26', PAT.WHITE), poly('50,88 62,74 38,74', PAT.WHITE)]) },
      { key: 'B', text: 'Batang mendatar', visualSpec: cell([rect(26, 40, 48, 20, PAT.BLACK), poly('12,50 26,38 26,62', PAT.WHITE), poly('88,50 74,38 74,62', PAT.WHITE)]) },
      { key: 'C', text: 'Bentuk siku kanan atas', visualSpec: cell([poly('30,24 66,24 66,44 48,44 48,76 30,76', PAT.BLACK)]) },
      { key: 'D', text: 'Batang miring 45°', visualSpec: cell([rect(40, 26, 20, 48, PAT.BLACK), poly('50,12 62,26 38,26', PAT.WHITE)], -45) },
      { key: 'E', text: 'Bentuk L terbalik', visualSpec: cell([poly('42,24 62,24 62,76 26,76 26,56 42,56', PAT.BLACK)]) },
    ],
    correctOption: 'A',
    explanation: 'Bagian bawah dan atas berputar bergantian: bawah ke kiri → atas menyusul → bawah lagi → giliran atas kembali sejajar lurus (A).',
    quickTrick: 'Giliran ke-4 adalah bagian atas berputar menyusul menjadi tegak lurus kembali.',
  },
  {
    num: 8, kind: 'serial', difficulty: 'EASY', subtopic: 'Serial Pasangan Pencerminan (Latihan 8 #8)',
    stem: 'Setiap dua gambar membentuk pasangan hasil pencerminan. Tentukan gambar keempat untuk melengkapi pasangan gambar ketiga.',
    visualSpec: ser([
      cell([poly('16,32 76,32 76,68 16,68', PAT.WHITE), line(76, 32, 90, 20, 2)]),
      cell([poly('24,32 84,32 84,68 24,68', PAT.WHITE), line(24, 32, 10, 20, 2)]),
      cell([rect(30, 18, 40, 64, PAT.WHITE)]),
      cell([path('M 76 22 Q 50 66 20 74 Q 76 74 76 74 Z', PAT.WHITE)]),
    ]),
    options: [
      { key: 'A', text: 'Hasil pencerminan lengkung menghadap kanan (simetris ke kiri)', visualSpec: cell([path('M 24 22 Q 50 66 80 74 L 24 74 Z', PAT.WHITE)]) },
      { key: 'B', text: 'Dua sisi melengkung simetris', visualSpec: cell([path('M 50 20 Q 64 58 84 74 L 16 74 Q 36 58 50 20 Z', PAT.WHITE)]) },
      { key: 'C', text: 'Segitiga terbalik melengkung', visualSpec: cell([path('M 20 26 L 80 26 Q 60 54 50 80 Q 40 54 20 26 Z', PAT.WHITE)]) },
      { key: 'D', text: 'Juring kanan bawah', visualSpec: cell([sectorPath(24, 74, 52, 0, 90, PAT.WHITE)]) },
      { key: 'E', text: 'Segitiga melengkung tanpa alas datar', visualSpec: cell([path('M 50 20 Q 74 56 80 76 Q 50 66 20 76 Q 26 56 50 20 Z', PAT.WHITE)]) },
    ],
    correctOption: 'A',
    explanation: 'Setiap pasangan gambar merupakan hasil pencerminan kiri-kanan. Gambar ke-4 adalah cerminan vertikal dari lengkung segitiga sebelumnya (A).',
    quickTrick: 'Cerminkan kiri ↔ kanan bentuk ekor lengkung tersebut.',
  },
  {
    num: 9, kind: 'serial', difficulty: 'MEDIUM', subtopic: 'Serial Dua Jarum Jam & Lingkaran Kecil (Latihan 8 #9)',
    stem: 'Amati perputaran dua jarum jam dan perubahan jumlah lingkaran kecil di dalamnya.',
    visualSpec: ser([
      cell([arrowLine(26, 22, 26, 82, 2.2, 7, false), arrowLine(26, 22, 86, 22, 2.2, 7, false), circle(26, 30, 2.5, PAT.WHITE), circle(42, 22, 2.5, PAT.WHITE), circle(50, 22, 2.5, PAT.WHITE), circle(58, 22, 2.5, PAT.WHITE)]),
      cell([arrowLine(60, 22, 24, 58, 2.2, 7, false), arrowLine(60, 22, 86, 62, 2.2, 7, false), circle(52, 30, 2.5, PAT.WHITE), circle(44, 38, 2.5, PAT.WHITE), circle(66, 32, 2.5, PAT.WHITE), circle(72, 42, 2.5, PAT.WHITE)]),
      cell([arrowLine(74, 24, 18, 24, 2.2, 7, false), arrowLine(74, 24, 74, 82, 2.2, 7, false), circle(42, 24, 2.5, PAT.WHITE), circle(52, 24, 2.5, PAT.WHITE), circle(62, 24, 2.5, PAT.WHITE), circle(74, 42, 2.5, PAT.WHITE), circle(74, 52, 2.5, PAT.WHITE)]),
      cell([arrowLine(80, 42, 26, 16, 2.2, 7, false), arrowLine(80, 42, 54, 86, 2.2, 7, false), circle(48, 26, 2.5, PAT.WHITE), circle(56, 30, 2.5, PAT.WHITE), circle(64, 34, 2.5, PAT.WHITE), circle(66, 64, 2.5, PAT.WHITE)]),
    ]),
    options: [
      { key: 'A', text: 'Kedua jarum berputar searah jarum jam ke atas dan ke kiri dengan jumlah lingkaran kecil sesuai pola', visualSpec: cell([arrowLine(72, 72, 72, 16, 2.2, 7, false), arrowLine(72, 72, 18, 72, 2.2, 7, false), circle(72, 34, 2.5, PAT.WHITE), circle(72, 44, 2.5, PAT.WHITE), circle(72, 54, 2.5, PAT.WHITE), circle(34, 72, 2.5, PAT.WHITE)]) },
      { key: 'B', text: 'Jarum menghadap kanan dengan 2 lingkaran bawah', visualSpec: cell([arrowLine(26, 72, 26, 16, 2.2, 7, false), arrowLine(26, 72, 82, 72, 2.2, 7, false), circle(26, 40, 2.5, PAT.WHITE), circle(50, 72, 2.5, PAT.WHITE), circle(60, 72, 2.5, PAT.WHITE)]) },
      { key: 'C', text: 'Kembali ke posisi sudut kiri atas', visualSpec: cell([arrowLine(26, 22, 26, 82, 2.2, 7, false), arrowLine(26, 22, 86, 22, 2.2, 7, false)]) },
      { key: 'D', text: 'Jarum miring ke kiri atas & kanan atas', visualSpec: cell([arrowLine(50, 78, 16, 44, 2.2, 7, false), arrowLine(50, 78, 84, 44, 2.2, 7, false)]) },
      { key: 'E', text: 'Jarum miring dengan satu lingkaran', visualSpec: cell([arrowLine(50, 78, 20, 38, 2.2, 7, false), arrowLine(50, 78, 80, 38, 2.2, 7, false), circle(26, 44, 2.5, PAT.WHITE)]) },
    ],
    correctOption: 'A',
    explanation: 'Kedua jarum jam berputar searah jarum jam (+45° tiap langkah) dari sudut kiri atas → atas → kanan → bawah, disertai penambahan lingkaran kecil pada salah satu jarum dan pengurangan pada jarum lainnya (A).',
    quickTrick: 'Lacak sudut siku dua jarum: kiri atas → atas → kanan → kanan bawah (0°, 45°, 90°, 135°, 180°).',
  },
  {
    num: 10, kind: 'serial', difficulty: 'EASY', subtopic: 'Serial Rotasi 90° & Pengurangan Gigi Sisir (Latihan 8 #10)',
    stem: 'Perhatikan arah putaran dan banyaknya jari-jari menyerupai sisir pada seri berikut.',
    visualSpec: ser([q10Comb(0, 6), q10Comb(90, 5), q10Comb(180, 4), q10Comb(270, 3)]),
    options: [
      { key: 'A', text: 'Menghadap kanan dengan 6 gigi', visualSpec: q10Comb(0, 6) },
      { key: 'B', text: 'Menghadap kanan dengan 4 gigi', visualSpec: q10Comb(0, 4) },
      { key: 'C', text: 'Menghadap kanan (rotasi +90° searah jarum jam) dengan 2 gigi tersisa', visualSpec: q10Comb(0, 2) },
      { key: 'D', text: 'Menghadap bawah dengan 4 gigi', visualSpec: q10Comb(90, 4) },
      { key: 'E', text: 'Menghadap bawah dengan 2 gigi', visualSpec: q10Comb(90, 2) },
    ],
    correctOption: 'C',
    explanation: 'Gambar diputar 90° searah jarum jam setiap langkah (0° → 90° → 180° → 270° → 0°) dan jumlah jari-jari sisir berkurang satu per langkah (6 → 5 → 4 → 3 → 2) yaitu pilihan C.',
    quickTrick: 'Putar +90° dan hitung jari sisir: 6, 5, 4, 3 → 2!',
  },
  {
    num: 11, kind: 'serial', difficulty: 'HARD', subtopic: 'Serial Rotasi & Pola Titik Ujung (Latihan 8 #11)',
    stem: 'Amati rotasi anak panah, pergantian warna lingkaran kecil, dan arah garis kecil di lingkaran ujung.',
    visualSpec: ser([
      cell([line(22, 50, 74, 50, 2.4), poly('70,34 88,50 70,66', PAT.BLACK), circle(16, 50, 5, PAT.WHITE), line(16, 45, 16, 36, 2)]),
      cell([line(50, 22, 50, 74, 2.4), poly('34,70 50,88 66,70', PAT.BLACK), circle(50, 16, 5, PAT.BLACK), line(55, 16, 64, 16, 2)]),
      cell([line(26, 50, 78, 50, 2.4), poly('30,34 12,50 30,66', PAT.BLACK), circle(84, 50, 5, PAT.WHITE), line(84, 55, 84, 64, 2)]),
      cell([line(50, 26, 50, 78, 2.4), poly('34,30 50,12 66,30', PAT.BLACK), circle(50, 84, 5, PAT.BLACK), line(45, 84, 36, 84, 2)]),
    ]),
    options: [
      { key: 'A', text: 'Menghadap kanan, titik putih di kiri dengan garis kecil di atas', visualSpec: cell([line(22, 50, 74, 50, 2.4), poly('70,34 88,50 70,66', PAT.BLACK), circle(16, 50, 5, PAT.WHITE), line(16, 45, 16, 36, 2)]) },
      { key: 'B', text: 'Menghadap kanan atas 45°', visualSpec: cell([line(28, 72, 70, 30, 2.4), poly('58,24 78,22 76,42', PAT.BLACK), circle(24, 76, 5, PAT.WHITE)]) },
      { key: 'C', text: 'Menghadap kanan dengan titik tanpa garis', visualSpec: cell([line(22, 50, 74, 50, 2.4), poly('70,34 88,50 70,66', PAT.BLACK), circle(16, 50, 5, PAT.WHITE), line(16, 55, 16, 64, 2)]) },
      { key: 'D', text: 'Menghadap kiri dengan titik putih di kiri', visualSpec: cell([line(26, 50, 78, 50, 2.4), poly('30,34 12,50 30,66', PAT.BLACK), circle(16, 50, 5, PAT.WHITE)]) },
      { key: 'E', text: 'Menghadap kiri dengan titik hitam di kanan', visualSpec: cell([line(26, 50, 78, 50, 2.4), poly('30,34 12,50 30,66', PAT.BLACK), circle(84, 50, 5, PAT.BLACK)]) },
    ],
    correctOption: 'A',
    explanation: 'Gambar berputar 90° searah jarum jam sebanyak 4 kali sehingga kembali ke posisi awal (A), dengan titik kembali putih dan garis kecil di atas.',
    quickTrick: '4 × 90° = 360° (kembali ke gambar 1!).',
  },
  {
    num: 12, kind: 'serial', difficulty: 'EASY', subtopic: 'Serial Pelebaran Sektor Hitam (Latihan 8 #12)',
    stem: 'Perhatikan perluasan bagian sektor hitam di dalam lingkaran berikut.',
    visualSpec: ser([
      cell([circle(50, 50, 34, PAT.WHITE), sectorPath(50, 50, 34, 290, 340, PAT.BLACK)]),
      cell([circle(50, 50, 34, PAT.WHITE), sectorPath(50, 50, 34, 250, 360, PAT.BLACK)]),
      cell([circle(50, 50, 34, PAT.WHITE), sectorPath(50, 50, 34, 210, 360, PAT.BLACK), sectorPath(50, 50, 34, 0, 25, PAT.BLACK)]),
    ]),
    options: [
      { key: 'A', text: 'Bagian hitam semakin lebar melebihi setengah lingkaran', visualSpec: cell([circle(50, 50, 34, PAT.WHITE), sectorPath(50, 50, 34, 160, 360, PAT.BLACK), sectorPath(50, 50, 34, 0, 20, PAT.BLACK)]) },
      { key: 'B', text: 'Tiga kuadran selain kanan atas', visualSpec: cell([circle(50, 50, 34, PAT.WHITE), sectorPath(50, 50, 34, 90, 360, PAT.BLACK)]) },
      { key: 'C', text: 'Hanya seperempat kanan atas hitam', visualSpec: cell([circle(50, 50, 34, PAT.WHITE), sectorPath(50, 50, 34, 0, 90, PAT.BLACK)]) },
      { key: 'D', text: 'Hampir penuh dengan celah kecil kanan atas', visualSpec: cell([circle(50, 50, 34, PAT.WHITE), sectorPath(50, 50, 34, 40, 360, PAT.BLACK)]) },
      { key: 'E', text: 'Tiga seperempat penuh di bawah dan kiri', visualSpec: cell([circle(50, 50, 34, PAT.WHITE), sectorPath(50, 50, 34, 65, 345, PAT.BLACK)]) },
    ],
    correctOption: 'A',
    explanation: 'Bagian berwarna hitam terus melebar secara progresif ke arah berlawanan jarum jam (A).',
    quickTrick: 'Pilih lingkaran dengan juring hitam yang bertambah lebar paling bertahap dari gambar ke-3.',
  },
  {
    num: 13, kind: 'serial', difficulty: 'MEDIUM', subtopic: 'Serial Rotasi 90° Panel Partisi (Latihan 8 #13)',
    stem: 'Perhatikan rotasi kotak berpartisi dengan simbol di dalamnya pada seri berikut.',
    visualSpec: ser([q13Panel(0), q13Panel(90), q13Panel(180), q13Panel(270)]),
    options: [
      { key: 'A', text: 'Kotak kembali ke orientasi awal (garis tegak arsir di kiri bawah)', visualSpec: q13Panel(0) },
      { key: 'B', text: 'Kotak berorientasi dengan simbol dan arsir garis mendatar sesuai rotasi 90° keempat', visualSpec: cell([rect(16, 16, 68, 68, PAT.WHITE, 2.2), line(16, 46, 84, 46, 2), line(48, 16, 48, 84, 2), rect(48, 46, 36, 38, PAT.HORIZ, 1.8), plusCross(62, 28, 6, 2, PAT.WHITE), plusCross(74, 38, 6, 2, PAT.WHITE), poly('24,72 36,72 30,60', PAT.WHITE, 1.8)]) },
      { key: 'C', text: 'Arsir vertikal di kanan bawah', visualSpec: cell([rect(16, 16, 68, 68, PAT.WHITE, 2.2), line(16, 46, 84, 46, 2), line(48, 16, 48, 84, 2), rect(48, 46, 36, 38, PAT.VERT, 1.8)]) },
      { key: 'D', text: 'Arsir horizontal di kiri atas', visualSpec: cell([rect(16, 16, 68, 68, PAT.WHITE, 2.2), line(16, 46, 84, 46, 2), line(48, 16, 48, 84, 2), rect(16, 16, 32, 30, PAT.HORIZ, 1.8)]) },
      { key: 'E', text: 'Arsir horizontal di kiri atas dan segitiga terbalik', visualSpec: q13Panel(270) },
    ],
    correctOption: 'B',
    explanation: 'Gambar mengalami rotasi searah jarum jam secara bertahap dan penyesuaian arah arsiran menjadi horizontal di posisi B.',
    quickTrick: 'Cek arah garis arsir dan posisi kuadran +90° searah jarum jam.',
  },
  {
    num: 14, kind: 'serial', difficulty: 'EASY', subtopic: 'Serial Pertambahan Jumlah Sisi Poligon (Latihan 8 #14)',
    stem: 'Tentukan bangun berikutnya berdasarkan pertambahan jumlah titik sudut.',
    visualSpec: ser([
      cell([poly('20,24 20,76 80,76', PAT.WHITE)]),
      cell([poly('34,26 84,26 66,74 16,74', PAT.WHITE)]),
      cell([regularPoly(50, 50, 34, 5, PAT.WHITE)]),
    ]),
    options: [
      { key: 'A', text: 'Segitiga sama sisi (3 sudut)', visualSpec: cell([regularPoly(50, 54, 34, 3, PAT.WHITE)]) },
      { key: 'B', text: 'Segidelapan (8 sudut)', visualSpec: cell([regularPoly(50, 50, 34, 8, PAT.WHITE)]) },
      { key: 'C', text: 'Trapesium (4 sudut)', visualSpec: cell([poly('22,28 78,28 70,74 30,74', PAT.WHITE)]) },
      { key: 'D', text: 'Belah ketupat (4 sudut)', visualSpec: cell([regularPoly(50, 50, 34, 4, PAT.WHITE)]) },
      { key: 'E', text: 'Segienam (6 titik sudut)', visualSpec: cell([regularPoly(50, 50, 34, 6, PAT.WHITE, 30)]) },
    ],
    correctOption: 'E',
    explanation: 'Jumlah titik sudut bertambah +1 setiap langkah: 3 → 4 → 5 → 6 titik sudut (segienam, E).',
    quickTrick: '3, 4, 5 → 6 sudut (Segienam)!',
  },
  {
    num: 15, kind: 'serial', difficulty: 'MEDIUM', subtopic: 'Serial Penambahan & Pergeseran Titik Segienam (Latihan 8 #15)',
    stem: 'Amati pergeseran dan penambahan bulatan di sudut-sudut segienam searah jarum jam.',
    visualSpec: ser([
      q15HexDots([{ pos: 5, fill: PAT.BLACK }]),
      q15HexDots([{ pos: 0, fill: PAT.BLACK }, { pos: 1, fill: PAT.WHITE }]),
      q15HexDots([{ pos: 2, fill: PAT.WHITE }, { pos: 3, fill: PAT.WHITE }, { pos: 4, fill: PAT.WHITE }]),
      q15HexDots([{ pos: 5, fill: PAT.WHITE }, { pos: 1, fill: PAT.BLACK }, { pos: 2, fill: PAT.WHITE }, { pos: 4, fill: PAT.BLACK }]),
    ]),
    options: [
      { key: 'A', text: '6 titik (putih & hitam)', visualSpec: q15HexDots([{ pos: 0, fill: PAT.WHITE }, { pos: 1, fill: PAT.WHITE }, { pos: 2, fill: PAT.BLACK }, { pos: 3, fill: PAT.WHITE }, { pos: 4, fill: PAT.WHITE }, { pos: 5, fill: PAT.BLACK }]) },
      { key: 'B', text: '5 titik searah jarum jam (berisi 3 putih dan 2 hitam sesuai urutan)', visualSpec: q15HexDots([{ pos: 0, fill: PAT.BLACK }, { pos: 1, fill: PAT.WHITE }, { pos: 2, fill: PAT.BLACK }, { pos: 4, fill: PAT.WHITE }, { pos: 5, fill: PAT.WHITE }]) },
      { key: 'C', text: '5 titik dengan 3 hitam', visualSpec: q15HexDots([{ pos: 0, fill: PAT.WHITE }, { pos: 1, fill: PAT.BLACK }, { pos: 2, fill: PAT.BLACK }, { pos: 3, fill: PAT.WHITE }, { pos: 5, fill: PAT.BLACK }]) },
      { key: 'D', text: '4 titik pada sudut atas dan tengah', visualSpec: q15HexDots([{ pos: 0, fill: PAT.BLACK }, { pos: 1, fill: PAT.WHITE }, { pos: 3, fill: PAT.WHITE }, { pos: 5, fill: PAT.WHITE }]) },
      { key: 'E', text: '3 titik', visualSpec: q15HexDots([{ pos: 0, fill: PAT.BLACK }, { pos: 1, fill: PAT.WHITE }, { pos: 3, fill: PAT.BLACK }]) },
    ],
    correctOption: 'B',
    explanation: 'Jumlah bulatan bertambah +1 tiap langkah (1 → 2 → 3 → 4 → 5) sambil bergeser searah jarum jam pada sudut segienam (B).',
    quickTrick: 'Jumlah bulatan 1, 2, 3, 4 → pasti 5 bulatan!',
  },
  {
    num: 16, kind: 'serial', difficulty: 'EASY', subtopic: 'Serial Pertambahan Titik Sudut Bangun Tak Beraturan (Latihan 8 #16)',
    stem: 'Tentukan bangun berikutnya berdasarkan banyaknya titik sudut.',
    visualSpec: ser([
      cell([poly('50,20 82,78 18,78', PAT.WHITE)]),
      cell([poly('30,22 70,22 80,78 20,78', PAT.WHITE)]),
      cell([poly('18,22 66,22 82,40 82,78 18,78', PAT.WHITE)]),
    ]),
    options: [
      { key: 'A', text: 'Lingkaran (0 sudut)', visualSpec: cell([circle(50, 50, 32, PAT.WHITE)]) },
      { key: 'B', text: 'Jajargenjang (4 sudut)', visualSpec: cell([poly('32,26 82,26 68,74 18,74', PAT.WHITE)]) },
      { key: 'C', text: 'Persegi panjang (4 sudut)', visualSpec: cell([rect(18, 28, 64, 44, PAT.WHITE)]) },
      { key: 'D', text: 'Bangun bersudut 6 (segienam tidak beraturan)', visualSpec: cell([poly('18,40 36,24 64,24 82,40 82,76 18,76', PAT.WHITE)]) },
      { key: 'E', text: 'Bangun sisi atas bergelombang', visualSpec: cell([path('M 18 26 Q 35 18 50 28 T 82 28 L 82 76 L 18 76 Z', PAT.WHITE)]) },
    ],
    correctOption: 'D',
    explanation: 'Jumlah titik sudut bertambah secara berurutan: 3 → 4 → 5 → 6 titik sudut (D).',
    quickTrick: 'Hitung sudut: 3, 4, 5 → cari yang bersudut 6!',
  },
  {
    num: 17, kind: 'serial', difficulty: 'HARD', subtopic: 'Serial Rotasi Ganda Berbeda Sudut (+90° & +45°) (Latihan 8 #17)',
    stem: 'Perhatikan rotasi bagian lengkung berujung belah ketupat dan anak panah lurus di dalamnya.',
    visualSpec: ser([
      cell([path('M 20 50 A 30 30 0 1 1 80 50', PAT.NONE, 2.2), line(50, 14, 50, 82, 2.2), line(36, 82, 64, 82, 2.2), arrowLine(24, 62, 76, 62, 2.2, 6, false), regularPoly(20, 50, 6, 4, PAT.BLACK), regularPoly(80, 50, 6, 4, PAT.BLACK)]),
      cell([path('M 50 20 A 30 30 0 1 0 50 80', PAT.NONE, 2.2), line(18, 50, 82, 50, 2.2), arrowLine(26, 26, 74, 74, 2.2, 6, false), regularPoly(50, 20, 6, 4, PAT.BLACK), regularPoly(50, 80, 6, 4, PAT.BLACK)]),
      cell([path('M 20 50 A 30 30 0 1 0 80 50', PAT.NONE, 2.2), line(50, 18, 50, 82, 2.2), arrowLine(50, 18, 50, 82, 2.2, 6, false), regularPoly(20, 50, 6, 4, PAT.BLACK), regularPoly(80, 50, 6, 4, PAT.BLACK)]),
    ]),
    options: [
      { key: 'A', text: 'Lengkung di kiri dengan panah datar', visualSpec: cell([path('M 50 20 A 30 30 0 1 0 50 80', PAT.NONE, 2.2), line(18, 50, 82, 50, 2.2), arrowLine(20, 62, 80, 62, 2.2, 6, false), regularPoly(50, 20, 6, 4, PAT.BLACK), regularPoly(50, 80, 6, 4, PAT.BLACK)]) },
      { key: 'B', text: 'Lengkung di bawah dengan panah kanan bawah', visualSpec: cell([path('M 20 50 A 30 30 0 1 0 80 50', PAT.NONE, 2.2), arrowLine(28, 30, 70, 70, 2.2, 6, false)]) },
      { key: 'C', text: 'Lengkung di kanan dengan panah miring ke kanan bawah', visualSpec: cell([path('M 50 20 A 30 30 0 1 1 50 80', PAT.NONE, 2.2), arrowLine(72, 28, 28, 72, 2.2, 6, false)]) },
      { key: 'D', text: 'Lengkung di kiri (rotasi -90°) dan panah berputar +45° ke kiri bawah', visualSpec: cell([path('M 50 20 A 30 30 0 1 0 50 80', PAT.NONE, 2.2), line(18, 50, 82, 50, 2.2), arrowLine(72, 28, 28, 72, 2.2, 6, false), regularPoly(50, 20, 6, 4, PAT.BLACK), regularPoly(50, 80, 6, 4, PAT.BLACK)]) },
      { key: 'E', text: 'Lengkung di atas dengan panah kiri bawah', visualSpec: cell([path('M 20 50 A 30 30 0 1 1 80 50', PAT.NONE, 2.2), arrowLine(70, 32, 30, 70, 2.2, 6, false)]) },
    ],
    correctOption: 'D',
    explanation: 'Busur lengkung berputar 90° setiap langkah (atas → kanan/kiri → bawah → kiri), sementara panah di tengah berotasi +45° searah jarum jam (kanan → kanan bawah → bawah → kiri bawah) menghasilkan D.',
    quickTrick: 'Panah berputar 45° searah jarum jam: pukul 3 → 4:30 → 6 → 7:30 (kiri bawah).',
  },
  {
    num: 18, kind: 'serial', difficulty: 'EASY', subtopic: 'Serial Penambahan Susunan Kubus (Latihan 8 #18)',
    stem: 'Perhatikan pertambahan banyaknya kubus satuan pada rangkaian berikut.',
    visualSpec: ser([
      cell([rect(36, 36, 28, 28, PAT.WHITE), poly('36,36 48,24 76,24 64,36', PAT.WHITE), poly('64,36 76,24 76,52 64,64', PAT.WHITE)]),
      cell([rect(22, 40, 24, 24, PAT.WHITE), rect(46, 40, 24, 24, PAT.WHITE), poly('22,40 34,28 82,28 70,40', PAT.WHITE), line(46, 40, 58, 28, 2), poly('70,40 82,28 82,52 70,64', PAT.WHITE)]),
      cell([rect(14, 42, 22, 22, PAT.WHITE), rect(36, 42, 22, 22, PAT.WHITE), rect(58, 42, 22, 22, PAT.WHITE), poly('14,42 26,30 90,30 78,42', PAT.WHITE)]),
    ]),
    options: [
      { key: 'A', text: 'Susunan 3 kubus sejajar', visualSpec: cell([rect(14, 42, 22, 22, PAT.WHITE), rect(36, 42, 22, 22, PAT.WHITE), rect(58, 42, 22, 22, PAT.WHITE)]) },
      { key: 'B', text: 'Susunan 2 kubus saja', visualSpec: cell([rect(26, 40, 24, 24, PAT.WHITE), rect(50, 40, 24, 24, PAT.WHITE)]) },
      { key: 'C', text: 'Susunan 4 buah kubus bertingkat', visualSpec: cell([rect(18, 48, 20, 20, PAT.WHITE), rect(38, 48, 20, 20, PAT.WHITE), rect(58, 48, 20, 20, PAT.WHITE), rect(38, 28, 20, 20, PAT.WHITE), poly('38,28 48,18 68,18 58,28', PAT.WHITE)]) },
      { key: 'D', text: '1 kubus tunggal', visualSpec: cell([rect(36, 36, 28, 28, PAT.WHITE)]) },
      { key: 'E', text: 'Susunan 6 kubus panjang', visualSpec: cell([rect(14, 48, 16, 16, PAT.WHITE), rect(30, 48, 16, 16, PAT.WHITE), rect(46, 48, 16, 16, PAT.WHITE), rect(62, 48, 16, 16, PAT.WHITE), rect(24, 38, 16, 16, PAT.WHITE), rect(40, 38, 16, 16, PAT.WHITE)]) },
    ],
    correctOption: 'C',
    explanation: 'Jumlah kubus bertambah 1 setiap langkah: 1 kubus → 2 kubus → 3 kubus → 4 kubus (C).',
    quickTrick: 'Hitung jumlah kubus: 1, 2, 3 → cari yang berjumlah 4 kubus!',
  },
  {
    num: 19, kind: 'serial', difficulty: 'EASY', subtopic: 'Serial Penambahan Jumlah Garis Penyusun (Latihan 8 #19)',
    stem: 'Hitung banyaknya ruas garis penyusun tiap gambar dari kiri ke kanan untuk menentukan gambar kelima.',
    visualSpec: ser([
      cell([line(28, 28, 72, 28, 2.4), line(72, 28, 72, 72, 2.4)]),
      cell([line(50, 18, 50, 82, 2.4), line(18, 50, 82, 50, 2.4)]),
      cell([line(50, 18, 50, 82, 2.4), line(18, 50, 82, 50, 2.4), line(50, 18, 82, 18, 2.4), line(82, 18, 82, 50, 2.4)]),
      cell([rect(50, 18, 32, 32, PAT.WHITE), rect(18, 50, 32, 32, PAT.WHITE)]),
    ]),
    options: [
      { key: 'A', text: 'Susunan 10 ruas garis (2 kotak + 2 garis tambahan)', visualSpec: cell([rect(50, 18, 32, 32, PAT.WHITE), rect(18, 50, 32, 32, PAT.WHITE), line(18, 50, 18, 50, 2.4), line(50, 82, 82, 82, 2.4), line(82, 50, 82, 82, 2.4)]) },
      { key: 'B', text: 'Susunan 11 ruas garis (3 kotak)', visualSpec: cell([rect(18, 18, 32, 32, PAT.WHITE), rect(18, 50, 32, 32, PAT.WHITE), rect(50, 50, 32, 32, PAT.WHITE)]) },
      { key: 'C', text: 'Susunan 8 garis terbuka', visualSpec: cell([rect(50, 18, 32, 32, PAT.WHITE), line(50, 50, 50, 82, 2.4), line(18, 82, 50, 82, 2.4)]) },
      { key: 'D', text: '4 kotak penuh (12 ruas garis)', visualSpec: cell([rect(18, 18, 64, 64, PAT.WHITE), line(50, 18, 50, 82, 2.4), line(18, 50, 82, 50, 2.4)]) },
      { key: 'E', text: 'Pola swastika terbuka (9 ruas garis)', visualSpec: cell([line(50, 18, 50, 82, 2.4), line(18, 50, 82, 50, 2.4), line(18, 18, 18, 50, 2.4), line(50, 18, 82, 18, 2.4), line(82, 50, 82, 82, 2.4)]) },
    ],
    correctOption: 'A',
    explanation: 'Jumlah ruas garis bertambah +2 pada setiap langkah: 2 garis → 4 garis → 6 garis → 8 garis → 10 garis (A).',
    quickTrick: 'Hitung ruas garis satuan: 2, 4, 6, 8 → cari yang tepat 10 ruas garis.',
  },
  {
    num: 20, kind: 'serial', difficulty: 'MEDIUM', subtopic: 'Serial Pelipatgandaan Jumlah Ruangan (1, 2, 3, 4 -> 5) (Latihan 8 #20)',
    stem: 'Perhatikan banyaknya ruangan di dalam setiap bangun dari kiri ke kanan.',
    visualSpec: ser([
      cell([circle(50, 50, 30, PAT.WHITE)]),
      cell([path('M 18 36 L 82 36 A 32 32 0 0 1 18 36 Z', PAT.WHITE), line(50, 36, 50, 68, 2)]),
      cell([circle(50, 50, 32, PAT.WHITE), line(18, 50, 82, 50, 2), line(50, 50, 50, 82, 2)]),
      cell([rect(20, 20, 60, 60, PAT.WHITE), line(50, 20, 50, 80, 2), line(20, 50, 80, 50, 2)]),
    ]),
    options: [
      { key: 'A', text: 'Segitiga dengan 4 ruangan', visualSpec: cell([poly('18,22 82,22 50,80', PAT.WHITE), line(50, 22, 50, 80, 2), line(34, 50, 66, 50, 2)]) },
      { key: 'B', text: 'Trapesium dengan 2 ruangan', visualSpec: cell([poly('20,22 80,22 72,78 28,78', PAT.WHITE), line(50, 22, 50, 78, 2)]) },
      { key: 'C', text: 'Segitiga dengan 2 ruangan', visualSpec: cell([poly('22,22 22,78 82,78', PAT.WHITE), line(22, 56, 62, 56, 2)]) },
      { key: 'D', text: 'Gabungan kotak berjumlah tepat 5 ruangan', visualSpec: cell([rect(14, 24, 48, 48, PAT.WHITE), line(38, 24, 38, 72, 2), line(14, 48, 62, 48, 2), rect(62, 48, 24, 24, PAT.WHITE)]) },
      { key: 'E', text: 'Persegi panjang dengan 6 ruangan', visualSpec: cell([rect(14, 26, 72, 48, PAT.WHITE), line(50, 26, 50, 74, 2), line(14, 26, 86, 74, 2), line(86, 26, 14, 74, 2)]) },
    ],
    correctOption: 'D',
    explanation: 'Banyak ruangan bertambah satu per langkah secara berurutan: 1 ruangan → 2 ruangan → 3 ruangan → 4 ruangan → 5 ruangan (D).',
    quickTrick: 'Hitung jumlah petak ruangan: 1, 2, 3, 4 → cari yang punya 5 ruangan!',
  },
  {
    num: 21, kind: 'serial', difficulty: 'MEDIUM', subtopic: 'Serial Eksponensial Ruangan (2, 4, 8 -> 16) (Latihan 8 #21)',
    stem: 'Perhatikan pola jumlah ruangan pada rangkaian gambar berikut.',
    visualSpec: ser([
      cell([poly('24,22 24,78 76,78', PAT.WHITE), line(50, 50, 50, 78, 2)]),
      cell([rect(22, 22, 56, 56, PAT.WHITE), line(22, 22, 78, 78, 2), line(50, 22, 50, 78, 2)]),
      cell([rect(14, 26, 72, 48, PAT.WHITE), line(50, 26, 50, 74, 2), line(14, 50, 86, 50, 2), line(14, 26, 50, 50, 2), line(50, 50, 86, 74, 2)]),
    ]),
    options: [
      { key: 'A', text: '6 ruangan', visualSpec: cell([rect(22, 20, 56, 60, PAT.WHITE), line(22, 20, 78, 80, 2), line(78, 20, 22, 80, 2), line(50, 20, 50, 80, 2)]) },
      { key: 'B', text: '12 ruangan', visualSpec: cell([rect(12, 26, 76, 48, PAT.WHITE), line(12, 50, 88, 50, 2), line(50, 26, 50, 74, 2), line(12, 26, 50, 74, 2), line(50, 26, 88, 74, 2), line(50, 26, 12, 74, 2), line(88, 26, 50, 74, 2)]) },
      { key: 'C', text: '8 ruangan', visualSpec: cell([rect(14, 26, 72, 48, PAT.WHITE), line(50, 26, 50, 74, 2), line(32, 26, 32, 74, 2), line(68, 26, 68, 74, 2)]) },
      { key: 'D', text: '16 ruangan (2, 4, 8 → 16)', visualSpec: cell([poly('12,24 72,24 88,76 28,76', PAT.WHITE), line(20, 50, 80, 50, 2), line(32, 24, 48, 76, 2), line(52, 24, 68, 76, 2), line(32, 24, 20, 50, 2), line(52, 24, 40, 50, 2), line(72, 24, 60, 50, 2), line(40, 50, 28, 76, 2), line(60, 50, 48, 76, 2), line(80, 50, 68, 76, 2)]) },
      { key: 'E', text: '7 ruangan', visualSpec: cell([rect(14, 26, 72, 48, PAT.WHITE), line(50, 26, 14, 74, 2), line(50, 26, 86, 74, 2), line(50, 26, 50, 74, 2)]) },
    ],
    correctOption: 'D',
    explanation: 'Jumlah ruangan berlipat ganda: 2 → 4 → 8 → 16 ruangan (D).',
    quickTrick: 'Pola ×2 ruangan: 2, 4, 8 → cari yang 16 ruangan!',
  },
  {
    num: 22, kind: 'serial', difficulty: 'MEDIUM', subtopic: 'Serial Eksponensial Ruangan (1, 2, 4 -> 8) (Latihan 8 #22)',
    stem: 'Perhatikan jumlah ruangan yang terbentuk pada tiga bangun berikut, lalu tentukan gambar keempat.',
    visualSpec: ser([
      cell([poly('20,76 74,24 74,76', PAT.WHITE)]),
      cell([poly('36,24 86,24 62,76 14,76', PAT.WHITE), line(62, 24, 38, 76, 2)]),
      cell([regularPoly(50, 50, 34, 4, PAT.WHITE, 0), line(50, 16, 50, 84, 2), line(16, 50, 84, 50, 2)]),
    ]),
    options: [
      { key: 'A', text: 'Persegi dengan 4 ruangan (silang X)', visualSpec: cell([rect(22, 22, 56, 56, PAT.WHITE), line(22, 22, 78, 78, 2), line(78, 22, 22, 78, 2)]) },
      { key: 'B', text: 'Persegi dengan 2 ruangan', visualSpec: cell([rect(22, 22, 56, 56, PAT.WHITE), line(22, 50, 78, 50, 2)]) },
      { key: 'C', text: 'Persegi dengan 2 ruangan diagonal', visualSpec: cell([rect(22, 22, 56, 56, PAT.WHITE), line(22, 22, 78, 78, 2)]) },
      { key: 'D', text: 'Persegi besar terbagi menjadi 8 ruangan', visualSpec: cell([rect(18, 18, 64, 64, PAT.WHITE), line(50, 18, 50, 82, 2), line(18, 50, 82, 50, 2), line(18, 82, 82, 18, 2), line(50, 50, 82, 50, 2), line(18, 50, 50, 18, 2), line(50, 82, 82, 50, 2)]) },
      { key: 'E', text: 'Deretan 6 segitiga sejajar', visualSpec: cell([poly('10,72 30,28 88,28 68,72', PAT.WHITE), line(30, 28, 30, 72, 2), line(50, 28, 50, 72, 2), line(70, 28, 70, 72, 2)]) },
    ],
    correctOption: 'D',
    explanation: 'Jumlah ruangan bertambah kelipatan dua: 1 → 2 → 4 → 8 ruangan (D).',
    quickTrick: '1, 2, 4 → 8 ruangan!',
  },
  {
    num: 23, kind: 'serial', difficulty: 'EASY', subtopic: 'Serial Penggabungan Fibonacci Gambar (Latihan 8 #23)',
    stem: 'Amati pola penggabungan dua gambar sebelumnya untuk menghasilkan gambar berikutnya.',
    visualSpec: ser([
      cell([circle(50, 50, 28, PAT.BLACK)]),
      cell([poly('50,16 84,80 16,80', PAT.WHITE)]),
      cell([poly('50,16 84,80 16,80', PAT.WHITE), circle(50, 58, 14, PAT.BLACK)]),
    ]),
    options: [
      { key: 'A', text: 'Bintang dan lingkaran kecil', visualSpec: cell([poly('50,14 58,40 86,40 64,56 72,82 50,66 28,82 36,56 14,40 42,40', PAT.WHITE), circle(50, 50, 10, PAT.BLACK)]) },
      { key: 'B', text: 'Penggabungan gambar 2 dan gambar 3 (segitiga ganda berisi lingkaran hitam)', visualSpec: cell([poly('50,14 86,82 14,82', PAT.WHITE), poly('50,32 72,74 28,74', PAT.WHITE), circle(50, 60, 10, PAT.BLACK)]) },
      { key: 'C', text: 'Persegi berisi lingkaran hitam', visualSpec: cell([rect(22, 22, 56, 56, PAT.WHITE), circle(50, 50, 20, PAT.BLACK)]) },
      { key: 'D', text: 'Dua segitiga berdampingan', visualSpec: cell([poly('28,22 48,78 8,78', PAT.WHITE), circle(28, 62, 10, PAT.BLACK), poly('72,22 92,78 52,78', PAT.WHITE)]) },
      { key: 'E', text: 'Dua segitiga masing-masing berisi lingkaran hitam', visualSpec: cell([poly('28,22 48,78 8,78', PAT.WHITE), circle(28, 62, 10, PAT.BLACK), poly('72,22 92,78 52,78', PAT.WHITE), circle(72, 62, 10, PAT.BLACK)]) },
    ],
    correctOption: 'B',
    explanation: 'Pola mirip deret Fibonacci: gambar ke-3 adalah gabungan gambar 1 & 2, sehingga gambar ke-4 adalah gabungan gambar 2 & 3 (B).',
    quickTrick: 'Gabung gambar ke-2 (segitiga putih) + gambar ke-3 (segitiga isi lingkaran hitam).',
  },
  {
    num: 24, kind: 'serial', difficulty: 'MEDIUM', subtopic: 'Serial Penambahan Bangun Sudut & Selang-Seling Warna (Latihan 8 #24)',
    stem: 'Perhatikan penambahan bangun di setiap sudut searah jarum jam dan pergantian warna hitam-putihnya.',
    visualSpec: ser([
      q24Corners([{ corner: 0, kind: 'sq', fill: PAT.BLACK }]),
      q24Corners([{ corner: 0, kind: 'sq', fill: PAT.WHITE }, { corner: 1, kind: 'triUp', fill: PAT.BLACK }]),
      q24Corners([{ corner: 0, kind: 'sq', fill: PAT.BLACK }, { corner: 1, kind: 'triUp', fill: PAT.WHITE }, { corner: 2, kind: 'circ', fill: PAT.WHITE }]),
      q24Corners([{ corner: 0, kind: 'sq', fill: PAT.WHITE }, { corner: 1, kind: 'triUp', fill: PAT.BLACK }, { corner: 2, kind: 'circ', fill: PAT.WHITE }, { corner: 3, kind: 'triDown', fill: PAT.BLACK }]),
    ]),
    options: [
      { key: 'A', text: 'Kotak kanan bawah hitam, kiri atas putih', visualSpec: q24Corners([{ corner: 0, kind: 'sq', fill: PAT.WHITE }, { corner: 1, kind: 'triUp', fill: PAT.WHITE }, { corner: 2, kind: 'circ', fill: PAT.WHITE }, { corner: 3, kind: 'triDown', fill: PAT.WHITE }]) },
      { key: 'B', text: 'Kiri atas hitam, kiri bawah hitam', visualSpec: q24Corners([{ corner: 0, kind: 'sq', fill: PAT.BLACK }, { corner: 1, kind: 'triUp', fill: PAT.WHITE }, { corner: 2, kind: 'circ', fill: PAT.BLACK }, { corner: 3, kind: 'triDown', fill: PAT.BLACK }]) },
      { key: 'C', text: 'Pola warna hitam-putih selang-seling tepat (kiri atas hitam, kanan atas putih, tengah lingkaran putih, kiri bawah putih, kanan bawah hitam)', visualSpec: cell([rect(14, 14, 72, 72, PAT.WHITE, 2.4), rect(20, 20, 14, 14, PAT.BLACK, 2), poly('72,18 82,34 62,34', PAT.WHITE, 2), circle(50, 50, 9, PAT.WHITE, 2), poly('20,66 36,66 28,82', PAT.WHITE, 2), rect(66, 66, 14, 14, PAT.BLACK, 2)]) },
      { key: 'D', text: 'Dua blok hitam di kiri', visualSpec: q24Corners([{ corner: 0, kind: 'sq', fill: PAT.BLACK }, { corner: 1, kind: 'triUp', fill: PAT.WHITE }, { corner: 3, kind: 'triDown', fill: PAT.BLACK }]) },
      { key: 'E', text: 'Segitiga atas hitam, kotak bawah putih', visualSpec: q24Corners([{ corner: 0, kind: 'sq', fill: PAT.WHITE }, { corner: 1, kind: 'triUp', fill: PAT.BLACK }, { corner: 2, kind: 'circ', fill: PAT.WHITE }, { corner: '3' as unknown as 3, kind: 'triDown', fill: PAT.WHITE }]) },
    ],
    correctOption: 'C',
    explanation: 'Setiap langkah menambah satu bangun searah jarum jam dan menukar warna hitam-putih antarlangkah secara selang-seling (C).',
    quickTrick: 'Cek jumlah bangun (5 unsur) dan warna kiri atas harus kembali ke hitam!',
  },
  {
    num: 25, kind: 'serial', difficulty: 'EASY', subtopic: 'Serial Pengurangan Garis Tegak & Mendatar (Latihan 8 #25)',
    stem: 'Perhatikan berkurangnya garis tegak dan garis mendatar pada kisi-kisi berikut.',
    visualSpec: ser([
      cell([rect(18, 18, 64, 64, PAT.WHITE), line(34, 18, 34, 82, 2), line(50, 18, 50, 82, 2), line(66, 18, 66, 82, 2), line(18, 39, 82, 39, 2), line(18, 61, 82, 61, 2)]),
      cell([rect(18, 18, 64, 64, PAT.WHITE), line(39, 18, 39, 82, 2), line(61, 18, 61, 82, 2), line(18, 50, 82, 50, 2)]),
    ]),
    options: [
      { key: 'A', text: 'Belah ketupat berkisi', visualSpec: cell([regularPoly(50, 50, 34, 4, PAT.WHITE, 0), line(32, 32, 68, 68, 2), line(68, 32, 32, 68, 2)]) },
      { key: 'B', text: 'Persegi dengan 1 garis tegak dan 0 garis mendatar', visualSpec: cell([rect(18, 18, 64, 64, PAT.WHITE), line(50, 18, 50, 82, 2)]) },
      { key: 'C', text: 'Persegi dengan 2 garis tegak tanpa garis mendatar', visualSpec: cell([rect(18, 18, 64, 64, PAT.WHITE), line(39, 18, 39, 82, 2), line(61, 18, 61, 82, 2)]) },
      { key: 'D', text: 'Belah ketupat 2×2', visualSpec: cell([regularPoly(50, 50, 34, 4, PAT.WHITE, 0), line(36, 36, 64, 64, 2)]) },
      { key: 'E', text: 'Persegi kosong (0 garis tegak, 0 mendatar)', visualSpec: cell([rect(18, 18, 64, 64, PAT.WHITE)]) },
    ],
    correctOption: 'B',
    explanation: 'Garis tegak berkurang satu (3 → 2 → 1) dan garis mendatar juga berkurang satu (2 → 1 → 0), sehingga tersisa satu garis tegak tanpa garis mendatar (B).',
    quickTrick: 'Tegak: 3, 2 → 1; Datar: 2, 1 → 0.',
  },
  {
    num: 26, kind: 'serial', difficulty: 'EASY', subtopic: 'Serial Jumlah Titik Sudut Kelipatan 2 (Latihan 8 #26)',
    stem: 'Perhatikan penambahan jumlah titik sudut keliling bangun luar dari kiri ke kanan.',
    visualSpec: ser([
      cell([path('M 14 66 A 36 34 0 0 1 86 66 Z', PAT.WHITE)]),
      cell([poly('30,24 84,24 70,76 16,76', PAT.WHITE), line(30, 24, 70, 76, 1.8), line(84, 24, 16, 76, 1.8)]),
      cell([regularPoly(50, 50, 34, 6, PAT.WHITE, 30), line(33, 20, 67, 80, 1.8), line(67, 20, 33, 80, 1.8), line(16, 50, 84, 50, 1.8)]),
    ]),
    options: [
      { key: 'A', text: 'Trapesium (4 sudut)', visualSpec: cell([poly('24,26 76,26 86,74 14,74', PAT.WHITE), line(24, 26, 86, 74, 1.8), line(76, 26, 14, 74, 1.8)]) },
      { key: 'B', text: 'Segitiga (3 sudut)', visualSpec: cell([poly('50,18 82,80 18,80', PAT.WHITE), line(50, 18, 50, 80, 1.8)]) },
      { key: 'C', text: 'Segidelapan berjari-jari (8 titik sudut)', visualSpec: cell([regularPoly(50, 50, 34, 8, PAT.WHITE, 22.5), line(50, 16, 50, 84, 1.8), line(16, 50, 84, 50, 1.8), line(26, 26, 74, 74, 1.8), line(74, 26, 26, 74, 1.8)]) },
      { key: 'D', text: 'Persegi dengan silang X (4 sudut)', visualSpec: cell([rect(22, 22, 56, 56, PAT.WHITE), line(22, 22, 78, 78, 1.8), line(78, 22, 22, 78, 1.8)]) },
      { key: 'E', text: 'Lingkaran berjari-jari (0 sudut)', visualSpec: cell([circle(50, 50, 32, PAT.WHITE), line(50, 18, 50, 82, 1.8), line(18, 50, 82, 50, 1.8), line(27, 27, 73, 73, 1.8), line(73, 27, 27, 73, 1.8)]) },
    ],
    correctOption: 'C',
    explanation: 'Jumlah titik sudut bertambah +2 setiap langkah: 2 → 4 → 6 → 8 titik sudut (segidelapan, C).',
    quickTrick: 'Sudut luar: 2, 4, 6 → 8 (Segidelapan)!',
  },
  {
    num: 27, kind: 'serial', difficulty: 'MEDIUM', subtopic: 'Serial Kesamaan Banyak Garis Lurus (Latihan 8 #27)',
    stem: 'Setiap gambar pada seri berikut disusun dari jumlah garis lurus yang sama. Manakah gambar yang mengikuti aturan konsisten tersebut?',
    visualSpec: ser([
      cell([line(22, 20, 22, 80, 2.2), line(22, 20, 74, 66, 2.2), line(22, 20, 78, 32, 2.2), line(58, 78, 78, 52, 2.2)]),
      cell([line(26, 20, 74, 44, 2.2), line(74, 44, 26, 68, 2.2), line(26, 40, 74, 64, 2.2), line(74, 64, 26, 84, 2.2)]),
      cell([line(24, 20, 24, 80, 2.2), line(24, 20, 78, 20, 2.2), line(78, 20, 24, 50, 2.2), line(24, 50, 78, 50, 2.2)]),
    ]),
    options: [
      { key: 'A', text: 'Segitiga (3 garis lurus)', visualSpec: cell([poly('24,20 24,80 80,80', PAT.WHITE)]) },
      { key: 'B', text: 'Persegi dengan silang X (6 garis lurus)', visualSpec: cell([rect(20, 20, 60, 60, PAT.WHITE), line(20, 20, 80, 80, 2), line(80, 20, 20, 80, 2)]) },
      { key: 'C', text: 'Persegi dengan 1 diagonal (5 garis lurus)', visualSpec: cell([rect(20, 20, 60, 60, PAT.WHITE), line(20, 20, 80, 80, 2)]) },
      { key: 'D', text: 'Persegi (dibentuk dari tepat 4 garis lurus)', visualSpec: cell([rect(20, 20, 60, 60, PAT.WHITE)]) },
      { key: 'E', text: 'Huruf N (3 garis lurus)', visualSpec: cell([line(26, 20, 26, 80, 2.2), line(26, 20, 74, 80, 2.2), line(74, 80, 74, 20, 2.2)]) },
    ],
    correctOption: 'D',
    explanation: 'Masing-masing gambar sebelumnya dibentuk dari tepat 4 garis lurus. Satu-satunya pilihan yang terdiri dari 4 garis lurus adalah persegi (D).',
    quickTrick: 'Hitung jumlah ruas garis penyusun tiap gambar: semuanya 4 garis → Persegi (4 garis)!',
  },
  {
    num: 28, kind: 'serial', difficulty: 'MEDIUM', subtopic: 'Serial Pertukaran Titik Hitam Kiri-Kanan (Latihan 8 #28)',
    stem: 'Perhatikan perubahan jumlah bulatan hitam pada sisi kiri dan sisi kanan di dalam kotak berikut.',
    visualSpec: ser([
      q28DotsBox(6, 2),
      q28DotsBox(4, 4),
      q28DotsBox(2, 6),
    ]),
    options: [
      { key: 'A', text: 'Kiri 2 titik, kanan 6 titik', visualSpec: q28DotsBox(2, 6) },
      { key: 'B', text: 'Kiri 3 titik, kanan 5 titik', visualSpec: q28DotsBox(3, 5) },
      { key: 'C', text: 'Kiri 4 titik, kanan 6 titik', visualSpec: q28DotsBox(4, 6) },
      { key: 'D', text: 'Kiri 0 titik, kanan 8 titik', visualSpec: q28DotsBox(0, 8) },
      { key: 'E', text: 'Sisi kiri berkurang 2 menjadi 0, sisi kanan bertambah mengikuti pola (E)', visualSpec: q28DotsBox(0, 6) },
    ],
    correctOption: 'E',
    explanation: 'Bulatan hitam di sisi kiri berkurang dua pada setiap langkah sementara sisi kanan bertambah sesuai keseimbangan pola, menghasilkan posisi kosong di kiri dan kelompok titik penuh di kanan (E).',
    quickTrick: 'Sisi kiri: 6 → 4 → 2 → 0 (sisi kiri kosong!).',
  },
  {
    num: 29, kind: 'serial', difficulty: 'EASY', subtopic: 'Serial Kombinasi Warna Badan & Lingkaran (Latihan 8 #29)',
    stem: 'Perhatikan perubahan orientasi, arsiran badan, dan letak lingkaran kecil pada seri berikut.',
    visualSpec: ser([
      q29Capsule(true, PAT.DIAG, 'bot'),
      q29Capsule(true, PAT.BLACK, 'bot'),
      q29Capsule(false, PAT.WHITE, 'left'),
      q29Capsule(false, PAT.DIAG, 'left'),
    ]),
    options: [
      { key: 'A', text: 'Berdiri berblok hitam dengan lingkaran kecil di bawah', visualSpec: q29Capsule(true, PAT.BLACK, 'bot') },
      { key: 'B', text: 'Berdiri putih dengan lingkaran di atas', visualSpec: q29Capsule(true, PAT.WHITE, 'top') },
      { key: 'C', text: 'Tidur arsir dengan lingkaran di kanan', visualSpec: q29Capsule(false, PAT.DIAG, 'right') },
      { key: 'D', text: 'Berdiri blok hitam dengan lingkaran di atas', visualSpec: q29Capsule(true, PAT.BLACK, 'top') },
      { key: 'E', text: 'Berdiri arsir dengan lingkaran di atas', visualSpec: q29Capsule(true, PAT.DIAG, 'top') },
    ],
    correctOption: 'A',
    explanation: 'Mengikuti kombinasi posisi berdiri-berdiri-tidur-tidur serta siklus warna dan posisi lingkaran kecil di bawah (A).',
    quickTrick: 'Pasangan orientasi (2 berdiri, 2 tidur → kembali berdiri) dan lingkaran kecil di bawah.',
  },
  {
    num: 30, kind: 'serial', difficulty: 'EASY', subtopic: 'Serial Urutan Bentuk & Pengisian (Latihan 8 #30)',
    stem: 'Perhatikan urutan bentuk dan pasangan terisinya pada rangkaian berikut, lalu tentukan gambar kelima.',
    visualSpec: ser([
      cell([poly('50,18 82,78 18,78', PAT.WHITE), circle(50, 56, 10, PAT.BLACK)]),
      cell([poly('50,18 82,78 18,78', PAT.WHITE), poly('50,42 66,70 34,70', PAT.BLACK)]),
      cell([circle(50, 50, 32, PAT.WHITE), rect(38, 38, 24, 24, PAT.BLACK)]),
      cell([poly('50,18 82,78 18,78', PAT.WHITE), circle(50, 56, 10, PAT.WHITE)]),
    ]),
    options: [
      { key: 'A', text: 'Lingkaran besar berisi segitiga putih', visualSpec: cell([circle(50, 50, 32, PAT.WHITE), poly('50,30 68,64 32,64', PAT.WHITE)]) },
      { key: 'B', text: 'Segitiga besar berisi segitiga kecil putih (melanjutkan pasangan putih dari pola hitam sebelumnya)', visualSpec: cell([poly('50,18 82,78 18,78', PAT.WHITE), poly('50,42 66,70 34,70', PAT.WHITE)]) },
      { key: 'C', text: 'Segitiga ganda bersarang besar', visualSpec: cell([poly('50,14 86,82 14,82', PAT.WHITE), poly('50,32 72,74 28,74', PAT.WHITE)]) },
      { key: 'D', text: 'Lingkaran besar berisi persegi putih', visualSpec: cell([circle(50, 50, 32, PAT.WHITE), rect(38, 38, 24, 24, PAT.WHITE)]) },
      { key: 'E', text: 'Persegi besar berisi lingkaran putih', visualSpec: cell([rect(20, 20, 60, 60, PAT.WHITE), circle(50, 50, 15, PAT.WHITE)]) },
    ],
    correctOption: 'B',
    explanation: 'Tiga gambar pertama memiliki isi hitam (segitiga+lingkaran hitam → segitiga+segitiga hitam → lingkaran+persegi hitam). Rangkaian berikutnya mengulang urutan yang sama dengan isi putih polos: segitiga+lingkaran putih → segitiga+segitiga putih (B).',
    quickTrick: 'Siklus 1 (isi hitam): Δ(●) → Δ(▲) → ○(■). Siklus 2 (isi putih): Δ(○) → Δ(△)!',
  },
];
