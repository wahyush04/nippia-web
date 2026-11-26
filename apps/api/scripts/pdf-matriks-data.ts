import {
  arrowLine,
  cell,
  circle,
  dominoDots,
  ellipse,
  g,
  heartPath,
  line,
  PAT,
  path,
  plusCross,
  poly,
  rect,
  regularPoly,
  sectorPath,
  starShape,
  type CellSpec,
  type SvgNode,
} from './figural-helpers.js';

export interface PdfFiguralQuestionDef {
  num: number;
  kind: 'matrix' | 'analogy' | 'serial';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  subtopic: string;
  stem: string;
  visualSpec: Record<string, unknown>;
  options: Array<{ key: 'A' | 'B' | 'C' | 'D' | 'E'; text: string; visualSpec: CellSpec }>;
  correctOption: 'A' | 'B' | 'C' | 'D' | 'E';
  explanation: string;
  quickTrick: string;
}

const mat = (grid: Array<Array<CellSpec | null>>) => ({ kind: 'matrix', grid });

// Helper builders for Latihan 4 (30 Matriks questions)
function q1Star(rotDeg: number): CellSpec {
  // 5-pointed star with slightly elongated top tip at 0 deg
  return cell([starShape(50, 52, 34, 14, 5, PAT.WHITE, rotDeg, 2.4)]);
}

function q3Arrows(vertCount: number, horizCount: number): CellSpec {
  const nodes: SvgNode[] = [];
  const vXs = vertCount === 1 ? [50] : vertCount === 2 ? [42, 58] : [35, 50, 65];
  vXs.forEach((x) => {
    nodes.push(line(x, 20, x, 80, 2));
    nodes.push(poly(`${x},12 ${x - 4},22 ${x + 4},22`, PAT.WHITE, 1.8));
    nodes.push(poly(`${x},88 ${x - 4},78 ${x + 4},78`, PAT.WHITE, 1.8));
  });
  const hYs = horizCount === 1 ? [50] : horizCount === 2 ? [42, 58] : [35, 50, 65];
  hYs.forEach((y) => {
    nodes.push(line(20, y, 80, y, 2));
    nodes.push(poly(`12,${y} 22,${y - 4} 22,${y + 4}`, PAT.WHITE, 1.8));
    nodes.push(poly(`88,${y} 78,${y - 4} 78,${y + 4}`, PAT.WHITE, 1.8));
  });
  return cell(nodes);
}

function q4Box(centerDir: 'up' | 'down' | 'left' | 'right', side: 'left' | 'right' | 'bottom' | 'none', sideDir: 'up' | 'down' | 'left' | 'right', sideCount = 2): CellSpec {
  const nodes: SvgNode[] = [rect(24, 24, 52, 52, PAT.WHITE, 2.4)];
  if (centerDir === 'up') nodes.push(arrowLine(50, 76, 50, 14, 2.2, 7));
  if (centerDir === 'down') nodes.push(arrowLine(50, 24, 50, 86, 2.2, 7));
  if (centerDir === 'left') nodes.push(arrowLine(76, 50, 14, 50, 2.2, 7));
  if (centerDir === 'right') nodes.push(arrowLine(24, 50, 86, 50, 2.2, 7));

  if (side === 'left') {
    for (let i = 0; i < sideCount; i++) {
      const x = 14 + i * 7;
      nodes.push(sideDir === 'up' ? arrowLine(x, 76, x, 36, 1.8, 5) : arrowLine(x, 24, x, 64, 1.8, 5));
    }
  } else if (side === 'right') {
    for (let i = 0; i < sideCount; i++) {
      const x = 84 - i * 7;
      nodes.push(sideDir === 'up' ? arrowLine(x, 76, x, 36, 1.8, 5) : arrowLine(x, 24, x, 64, 1.8, 5));
    }
  } else if (side === 'bottom') {
    for (let i = 0; i < sideCount; i++) {
      const x = 42 + i * 10;
      nodes.push(sideDir === 'down' ? arrowLine(x, 76, x, 92, 1.8, 5) : arrowLine(x, 92, x, 76, 1.8, 5));
    }
  }
  return cell(nodes);
}

function q5Partition(kind: 'X' | 'diag-TR-mid' | 'Y' | 'cross' | 'T-up' | 'T-right' | 'full' | 'half-cross'): CellSpec {
  const nodes: SvgNode[] = [rect(14, 14, 72, 72, PAT.WHITE, 2.4)];
  if (kind === 'X') {
    nodes.push(line(14, 14, 86, 86, 2), line(86, 14, 14, 86, 2));
  } else if (kind === 'diag-TR-mid') {
    nodes.push(line(14, 14, 86, 86, 2), line(50, 50, 86, 14, 2), line(50, 50, 50, 86, 2));
  } else if (kind === 'Y') {
    nodes.push(line(14, 14, 50, 50, 2), line(86, 14, 50, 50, 2), line(50, 50, 50, 86, 2));
  } else if (kind === 'cross') {
    nodes.push(line(50, 14, 50, 86, 2), line(14, 50, 86, 50, 2));
  } else if (kind === 'T-up') {
    nodes.push(line(14, 50, 86, 50, 2), line(50, 14, 50, 50, 2));
  } else if (kind === 'T-right') {
    nodes.push(line(50, 14, 50, 86, 2), line(50, 50, 86, 50, 2));
  } else if (kind === 'full') {
    nodes.push(line(50, 14, 50, 86, 2), line(14, 50, 86, 50, 2), line(14, 14, 86, 86, 2), line(86, 14, 14, 86, 2));
  } else if (kind === 'half-cross') {
    nodes.push(line(50, 14, 50, 86, 2), line(14, 50, 86, 50, 2), line(14, 86, 86, 14, 2));
  }
  return cell(nodes);
}

function q6Capsule(vertical: boolean, centerFill: string, sideFill: string): CellSpec {
  const nodes: SvgNode[] = vertical
    ? [
        path('M 34 26 A 16 14 0 0 1 66 26', sideFill, 2.2),
        path('M 34 74 A 16 14 0 0 0 66 74', sideFill, 2.2),
        ellipse(50, 50, 13, 28, centerFill, 2.4),
      ]
    : [
        path('M 26 34 A 14 16 0 0 0 26 66', sideFill, 2.2),
        path('M 74 34 A 14 16 0 0 1 74 66', sideFill, 2.2),
        ellipse(50, 50, 28, 13, centerFill, 2.4),
      ];
  return cell(nodes);
}

function q8Hex(outerFill: string, innerFill: string, innerPos: 'top' | 'center' | 'bottom' | 'left' | 'right'): CellSpec {
  const coords = {
    top: { x: 50, y: 31 },
    center: { x: 50, y: 50 },
    bottom: { x: 50, y: 69 },
    left: { x: 34, y: 50 },
    right: { x: 66, y: 50 },
  }[innerPos];
  return cell([
    regularPoly(50, 50, 38, 6, outerFill, 0, 2.5),
    regularPoly(coords.x, coords.y, 14, 6, innerFill, 0, 2.2),
  ]);
}

function q9Stars(fills: [string, string, string]): CellSpec {
  return cell([
    starShape(26, 30, 15, 6, 8, fills[0], 0, 1.8),
    starShape(74, 30, 15, 6, 8, fills[1], 0, 1.8),
    starShape(50, 72, 15, 6, 8, fills[2], 0, 1.8),
  ]);
}

function q11Arrows(shape: 'hex' | 'para' | 'diamond', dir: 'right' | 'left' | 'both'): CellSpec {
  const nodes: SvgNode[] = [];
  if (shape === 'hex') nodes.push(regularPoly(50, 50, 34, 6, PAT.WHITE, 30, 2.4));
  if (shape === 'para') nodes.push(poly('26,26 84,26 74,74 16,74', PAT.WHITE, 2.4));
  if (shape === 'diamond') nodes.push(poly('50,18 84,50 50,82 16,50', PAT.WHITE, 2.4));

  if (dir === 'right') nodes.push(arrowLine(32, 50, 68, 50, 2.4, 7));
  if (dir === 'left') nodes.push(arrowLine(68, 50, 32, 50, 2.4, 7));
  if (dir === 'both') {
    nodes.push(line(32, 50, 68, 50, 2.4));
    nodes.push(poly('28,50 37,45 37,55', PAT.BLACK, 1.5));
    nodes.push(poly('72,50 63,45 63,55', PAT.BLACK, 1.5));
  }
  return cell(nodes);
}

function q12Totem(top: 'circle' | 'square' | 'dots', midFill: string, bot: 'circle' | 'tri', botFill: string): CellSpec {
  const nodes: SvgNode[] = [];
  if (top === 'circle') nodes.push(circle(50, 16, 7, PAT.WHITE, 2));
  if (top === 'square') nodes.push(rect(43, 10, 14, 14, PAT.WHITE, 2));
  if (top === 'dots') nodes.push(circle(50, 17, 9, PAT.DOTS, 1.8));
  nodes.push(poly('50,24 68,54 32,54', midFill, 2.2));
  if (bot === 'circle') nodes.push(circle(50, 72, 16, botFill, 2.2));
  else nodes.push(rect(44, 54, 12, 34, botFill, 2));
  return cell(nodes);
}

function q14Puzzle(rotDeg: number): CellSpec {
  return cell([
    g([
      plusCross(50, 50, 26, 10, PAT.WHITE),
      arrowLine(24, 50, 10, 50, 2, 6),
      circle(50, 24, 4, PAT.BLACK, 1.5),
    ], { transform: `rotate(${rotDeg} 50 50)` }),
  ]);
}

function q16Lines(hasBox: boolean, hasPlus: boolean, hasX: boolean, hasCircle = false): CellSpec {
  const nodes: SvgNode[] = [];
  if (hasBox) nodes.push(rect(20, 20, 60, 60, PAT.NONE, 2.2));
  if (hasCircle) nodes.push(circle(50, 50, 30, PAT.NONE, 2.2));
  if (hasPlus) nodes.push(line(50, 14, 50, 86, 2.2), line(14, 50, 86, 50, 2.2));
  if (hasX) nodes.push(line(18, 18, 82, 82, 2.2), line(82, 18, 18, 82, 2.2));
  return cell(nodes);
}

function q17Domino2(left: 'empty' | 'big' | 'small', right: 'empty' | 'big' | 'small'): CellSpec {
  const nodes: SvgNode[] = [rect(10, 24, 80, 52, PAT.WHITE, 2.4), line(50, 24, 50, 76, 2)];
  const drawHalf = (kind: string, cx: number) => {
    if (kind === 'big') nodes.push(circle(cx, 50, 8, PAT.BLACK, 1.5));
    if (kind === 'small') {
      nodes.push(circle(cx - 7, 42, 3, PAT.BLACK, 1));
      nodes.push(circle(cx + 7, 58, 3, PAT.BLACK, 1));
    }
  };
  drawHalf(left, 30);
  drawHalf(right, 70);
  return cell(nodes);
}

function q19Scale(head: 'heart' | 'plus' | 'tri', leftArm: 'heart' | 'plus' | 'tri', rightArm: 'heart' | 'plus' | 'tri'): CellSpec {
  const icon = (kind: string, cx: number, cy: number) => {
    if (kind === 'heart') return heartPath(cx, cy, 0.7, PAT.WHITE);
    if (kind === 'plus') return plusCross(cx, cy, 8, 3, PAT.WHITE);
    return regularPoly(cx, cy, 8, 3, PAT.WHITE, 0, 2);
  };
  return cell([
    line(50, 24, 50, 82, 2.2),
    path('M 20 56 Q 50 32 80 56', PAT.NONE, 2.2),
    icon(head, 50, 16),
    icon(leftArm, 20, 66),
    icon(rightArm, 80, 66),
  ]);
}

function q20Rods(orient: 'h' | 'v' | 'diag', fill: string, headPos: 'start' | 'end'): CellSpec {
  const nodes: SvgNode[] = [];
  if (orient === 'h') {
    nodes.push(rect(22, 34, 50, 8, fill, 2), rect(22, 58, 50, 8, fill, 2));
    const cx = headPos === 'end' ? 80 : 14;
    nodes.push(circle(cx, 38, 6, PAT.WHITE, 2), circle(cx, 62, 6, PAT.WHITE, 2));
  } else if (orient === 'v') {
    nodes.push(rect(34, 24, 8, 54, fill, 2), rect(58, 24, 8, 54, fill, 2));
    const cy = headPos === 'start' ? 16 : 84;
    nodes.push(circle(38, cy, 6, PAT.WHITE, 2), circle(62, cy, 6, PAT.WHITE, 2));
  } else {
    nodes.push(
      g([rect(26, 22, 8, 52, fill, 2), circle(30, 16, 6, PAT.WHITE, 2)], { transform: 'rotate(-20 50 50)' }),
      g([rect(62, 22, 8, 52, fill, 2), circle(66, 16, 6, PAT.WHITE, 2)], { transform: 'rotate(20 50 50)' }),
    );
  }
  return cell(nodes);
}

function q21Cross(hasCircle: boolean, topArc: boolean, rightArc: boolean, botArc: boolean, leftArc: boolean): CellSpec {
  const nodes: SvgNode[] = [line(50, 14, 50, 86, 2.2), line(14, 50, 86, 50, 2.2)];
  if (hasCircle) nodes.push(circle(50, 50, 32, PAT.NONE, 2.2));
  if (topArc) nodes.push(path('M 18 50 A 32 32 0 0 1 50 18', PAT.NONE, 2.4));
  if (rightArc) nodes.push(path('M 50 18 A 32 32 0 0 1 82 50', PAT.NONE, 2.4));
  if (botArc) nodes.push(path('M 82 50 A 32 32 0 0 1 50 82', PAT.NONE, 2.4));
  if (leftArc) nodes.push(path('M 50 82 A 32 32 0 0 1 18 50', PAT.NONE, 2.4));
  return cell(nodes);
}

function q25Plus(fill: string, tips: 'none' | 'arrow' | 'box'): CellSpec {
  const nodes: SvgNode[] = [plusCross(50, 50, 28, 12, fill)];
  if (tips === 'arrow') {
    nodes.push(
      poly('50,10 42,22 58,22', PAT.WHITE, 1.8),
      poly('50,90 42,78 58,78', PAT.WHITE, 1.8),
      poly('10,50 22,42 22,58', PAT.WHITE, 1.8),
      poly('90,50 78,42 78,58', PAT.WHITE, 1.8),
    );
  } else if (tips === 'box') {
    nodes.push(
      rect(45, 14, 10, 8, PAT.WHITE, 1.8),
      rect(45, 78, 10, 8, PAT.WHITE, 1.8),
      rect(14, 45, 8, 10, PAT.WHITE, 1.8),
      rect(78, 45, 8, 10, PAT.WHITE, 1.8),
    );
  }
  return cell(nodes);
}

function q26Hearts(count: number, fill: string): CellSpec {
  const positions: Record<number, Array<[number, number]>> = {
    1: [[30, 30]],
    2: [[28, 28], [66, 66]],
    3: [[28, 28], [72, 28], [50, 68]],
    4: [[30, 30], [70, 30], [30, 70], [70, 70]],
    5: [[26, 26], [74, 26], [50, 50], [26, 74], [74, 74]],
    6: [[28, 24], [72, 24], [28, 50], [72, 50], [28, 76], [72, 76]],
  };
  const nodes: SvgNode[] = [rect(10, 10, 80, 80, PAT.WHITE, 2.2)];
  (positions[count] || []).forEach(([x, y]) => nodes.push(heartPath(x, y, 0.85, fill)));
  return cell(nodes);
}

function q28Badge(center: 'star' | 'heart' | 'none', slash: boolean, outerStar: boolean): CellSpec {
  const nodes: SvgNode[] = [
    circle(50, 50, 34, PAT.WHITE, 2.2),
    circle(50, 50, 26, PAT.WHITE, 1.8),
  ];
  if (center === 'star') nodes.push(starShape(50, 50, 14, 6, 5, PAT.WHITE, 0, 2));
  if (center === 'heart') nodes.push(heartPath(50, 52, 1.1, PAT.WHITE));
  if (slash) nodes.push(line(26, 26, 74, 74, 2.5));
  if (outerStar) nodes.push(starShape(18, 18, 9, 4, 5, PAT.WHITE, 0, 1.5));
  return cell(nodes);
}

export const PDF_MATRIKS_30: PdfFiguralQuestionDef[] = [
  {
    num: 1, kind: 'matrix', difficulty: 'EASY', subtopic: 'Matriks Rotasi Bintang (Latihan 4 #1)',
    stem: 'Perhatikan matriks gambar 3×3 berikut (Sumber adaptasi latihan persepsi gambar). Tentukan gambar yang paling tepat menggantikan tanda tanya (?).',
    visualSpec: mat([
      [q1Star(0), q1Star(90), q1Star(180)],
      [q1Star(90), q1Star(180), q1Star(270)],
      [q1Star(180), q1Star(270), null],
    ]),
    options: [
      { key: 'A', text: 'Bintang menghadap kanan (90°)', visualSpec: q1Star(90) },
      { key: 'B', text: 'Bintang menghadap bawah (180°)', visualSpec: q1Star(180) },
      { key: 'C', text: 'Bintang menghadap atas (0°)', visualSpec: q1Star(0) },
      { key: 'D', text: 'Bintang berujung enam miring', visualSpec: cell([starShape(50, 50, 32, 13, 6, PAT.WHITE, 20, 2.2)]) },
      { key: 'E', text: 'Bintang berotasi 225°', visualSpec: q1Star(225) },
    ],
    correctOption: 'C',
    explanation: 'Polanya menggunakan rotasi bintang 90° searah jarum jam pada setiap langkah dari kiri ke kanan (dan 180° -> 270° -> 0° pada baris ketiga).',
    quickTrick: 'Tandai puncak bintang utama: 180° (bawah) → 270° (kiri) → 0° (atas).',
  },
  {
    num: 2, kind: 'matrix', difficulty: 'MEDIUM', subtopic: 'Matriks Domino Titik Hitam (Latihan 4 #2)',
    stem: 'Perhatikan pola jumlah titik hitam di dalam 4 kolom setiap kotak pada matriks 3×3 berikut. Kotak manakah yang tepat mengisi tanda tanya (?)?',
    visualSpec: mat([
      [cell(dominoDots([4, 2, 1, 3])), cell(dominoDots([2, 1, 3, 4])), cell(dominoDots([1, 3, 4, 2]))],
      [cell(dominoDots([3, 4, 2, 1])), cell(dominoDots([4, 2, 1, 3])), cell(dominoDots([2, 1, 3, 4]))],
      [cell(dominoDots([1, 3, 4, 2])), cell(dominoDots([3, 4, 2, 1])), null],
    ]),
    options: [
      { key: 'A', text: 'Kolom titik [3, 4, 2, 1]', visualSpec: cell(dominoDots([3, 4, 2, 1])) },
      { key: 'B', text: 'Kolom titik [2, 1, 3, 4]', visualSpec: cell(dominoDots([2, 1, 3, 4])) },
      { key: 'C', text: 'Kolom titik [4, 2, 1, 3]', visualSpec: cell(dominoDots([4, 2, 1, 3])) },
      { key: 'D', text: 'Kolom titik [1, 3, 2, 4]', visualSpec: cell(dominoDots([1, 3, 2, 4])) },
      { key: 'E', text: 'Kolom titik [4, 1, 3, 2]', visualSpec: cell(dominoDots([4, 1, 3, 2])) },
    ],
    correctOption: 'C',
    explanation: 'Jumlah titik pada tiap kolom mengalami pergeseran siklis antarbaris sehingga pada baris ke-3 kolom bersesuaian melengkapi urutan [4, 2, 1, 3].',
    quickTrick: 'Hitung jumlah titik per kolom (misal kolom pertama: 1, 3, lalu harus 4).',
  },
  {
    num: 3, kind: 'matrix', difficulty: 'MEDIUM', subtopic: 'Matriks Panah Tegak & Mendatar (Latihan 4 #3)',
    stem: 'Amati kombinasi jumlah panah tegak dan panah mendatar pada matriks 3×3 berikut. Gambar yang tepat mengisi posisi (?) adalah...',
    visualSpec: mat([
      [q3Arrows(1, 3), q3Arrows(3, 1), q3Arrows(2, 2)],
      [q3Arrows(2, 1), q3Arrows(1, 2), q3Arrows(3, 3)],
      [q3Arrows(1, 2), q3Arrows(2, 3), null],
    ]),
    options: [
      { key: 'A', text: '3 panah tegak dan 2 panah mendatar', visualSpec: q3Arrows(3, 2) },
      { key: 'B', text: '3 panah tegak dan 1 panah mendatar', visualSpec: q3Arrows(3, 1) },
      { key: 'C', text: '2 panah tegak dan 1 panah mendatar', visualSpec: q3Arrows(2, 1) },
      { key: 'D', text: '2 panah tegak dan 3 panah mendatar', visualSpec: q3Arrows(2, 3) },
      { key: 'E', text: '1 panah tegak dan 3 panah mendatar', visualSpec: q3Arrows(1, 3) },
    ],
    correctOption: 'B',
    explanation: 'Pada setiap baris, jumlah panah tegak (1, 2, 3) dan jumlah panah mendatar (1, 2, 3) masing-masing muncul satu kali. Baris ke-3 sudah memiliki 1 & 2 panah tegak serta 2 & 3 panah mendatar, sehingga kurang 3 panah tegak dan 1 panah mendatar.',
    quickTrick: 'Cek jumlah panah tegak dan mendatar secara terpisah per baris: harus lengkap {1, 2, 3}.',
  },
  {
    num: 4, kind: 'matrix', difficulty: 'HARD', subtopic: 'Matriks Persegi & Arah Panah (Latihan 4 #4)',
    stem: 'Perhatikan arah panah di tengah dan posisi panah sisi pada matriks 3×3 berikut. Pilihan manakah yang melengkapi tanda tanya (?)?',
    visualSpec: mat([
      [q4Box('up', 'left', 'up', 1), q4Box('left', 'bottom', 'down', 2), q4Box('down', 'right', 'down', 3)],
      [q4Box('down', 'left', 'down', 3), q4Box('up', 'right', 'up', 1), q4Box('left', 'bottom', 'up', 2)],
      [q4Box('left', 'bottom', 'up', 2), q4Box('down', 'left', 'down', 2), null],
    ]),
    options: [
      { key: 'A', text: 'Panah tengah ke atas, sisi kanan kosong', visualSpec: q4Box('up', 'none', 'up', 1) },
      { key: 'B', text: 'Panah tengah ke kanan, sisi bawah', visualSpec: q4Box('right', 'bottom', 'down', 1) },
      { key: 'C', text: 'Panah tengah ke kiri, sisi kanan', visualSpec: q4Box('left', 'right', 'up', 1) },
      { key: 'D', text: 'Panah tengah ke atas dengan garis panah mengarah ke atas di sisi kanan', visualSpec: q4Box('up', 'right', 'up', 2) },
      { key: 'E', text: 'Panah tengah ke bawah, sisi kanan ke bawah', visualSpec: q4Box('down', 'right', 'down', 2) },
    ],
    correctOption: 'D',
    explanation: 'Di tiap baris terdapat dua panah tengah tegak berlawanan arah (atas & bawah) dan satu panah mendatar. Baris ke-3 memiliki panah tengah kiri dan bawah, sehingga membutuhkan panah tengah ke atas dan panah sisi kanan mengarah ke atas.',
    quickTrick: 'Cek dua hal: (1) arah panah tengah yang belum ada di baris 3 (atas), (2) sisi kanan dengan arah ke atas.',
  },
  {
    num: 5, kind: 'matrix', difficulty: 'EASY', subtopic: 'Matriks Rotasi Partisi Persegi (Latihan 4 #5)',
    stem: 'Amati pola rotasi partisi garis di dalam persegi pada matriks 3×3 berikut. Gambar yang tepat untuk tanda tanya (?) adalah...',
    visualSpec: mat([
      [q5Partition('X'), q5Partition('diag-TR-mid'), q5Partition('Y')],
      [q5Partition('cross'), q5Partition('T-up'), q5Partition('T-right')],
      [q5Partition('full'), q5Partition('half-cross'), null],
    ]),
    options: [
      { key: 'A', text: 'Partisi penuh delapan arah', visualSpec: q5Partition('full') },
      { key: 'B', text: 'Partisi silang dengan garis vertikal', visualSpec: q5Partition('half-cross') },
      { key: 'C', text: 'Partisi diagonal X saja', visualSpec: q5Partition('X') },
      { key: 'D', text: 'Partisi tambah dengan diagonal kiri', visualSpec: q5Partition('diag-TR-mid') },
      { key: 'E', text: 'Partisi silang diagonal penuh (X) tanpa garis tegak tambahan', visualSpec: cell([rect(14, 14, 72, 72, PAT.WHITE, 2.4), line(14, 14, 86, 86, 2), line(86, 14, 14, 86, 2), line(14, 50, 86, 50, 2)]) },
    ],
    correctOption: 'E',
    explanation: 'Gambar pertama pada setiap baris diputar 90° searah jarum jam dan dilanjutkan 90° lagi pada kolom ketiga sehingga menghasilkan konfigurasi E.',
    quickTrick: 'Lacak satu garis pembeda yang berputar 90° searah jarum jam dari kolom 1 → 2 → 3.',
  },
  {
    num: 6, kind: 'matrix', difficulty: 'MEDIUM', subtopic: 'Matriks Elips & Raster Lengkung (Latihan 4 #6)',
    stem: 'Perhatikan orientasi elips, pola arsiran elips, dan lengkungan samping pada matriks 3×3 berikut. Gambar yang tepat mengisi (?) adalah...',
    visualSpec: mat([
      [q6Capsule(false, PAT.WHITE, PAT.BLACK), q6Capsule(true, PAT.BLACK, PAT.WHITE), q6Capsule(false, PAT.GRID, PAT.BLACK)],
      [q6Capsule(true, PAT.BLACK, PAT.GRID), q6Capsule(false, PAT.GRID, PAT.WHITE), q6Capsule(true, PAT.WHITE, PAT.BLACK)],
      [q6Capsule(false, PAT.GRID, PAT.BLACK), q6Capsule(true, PAT.WHITE, PAT.BLACK), null],
    ]),
    options: [
      { key: 'A', text: 'Elips tidur berarsir penuh', visualSpec: q6Capsule(false, PAT.BLACK, PAT.WHITE) },
      { key: 'B', text: 'Elips berdiri dengan blok hitam dan lengkung samping berarsir sesuai pola', visualSpec: q6Capsule(true, PAT.BLACK, PAT.GRID) },
      { key: 'C', text: 'Elips tidur putih polos', visualSpec: q6Capsule(false, PAT.WHITE, PAT.BLACK) },
      { key: 'D', text: 'Elips berdiri putih dengan lengkung titik', visualSpec: q6Capsule(true, PAT.WHITE, PAT.DOTS) },
      { key: 'E', text: 'Elips berdiri berarsir garis dengan lengkung hitam', visualSpec: q6Capsule(true, PAT.GRID, PAT.BLACK) },
    ],
    correctOption: 'B',
    explanation: 'Setiap baris memuat distribusi arsiran elips (putih, hitam penuh, raster jaring) serta lengkung samping pelengkap. Pada baris ke-3 tersisa kombinasi elips berdiri blok hitam dengan lengkung samping raster.',
    quickTrick: 'Pastikan setiap baris memiliki tepat 1 putih, 1 hitam penuh, dan 1 raster jaring pada elips.',
  },
  {
    num: 7, kind: 'matrix', difficulty: 'EASY', subtopic: 'Matriks Penggabungan Bangun Luar-Dalam (Latihan 4 #7)',
    stem: 'Perhatikan hubungan bangun besar dan bangun kecil pada setiap baris matriks 3×3 berikut. Gambar manakah yang tepat menggantikan (?)?',
    visualSpec: mat([
      [cell([rect(18, 18, 64, 64, PAT.WHITE), circle(32, 32, 8, PAT.WHITE, 2)]), cell([poly('50,22 82,78 18,78', PAT.WHITE), rect(42, 62, 16, 16, PAT.WHITE, 2)]), cell([circle(50, 50, 32, PAT.WHITE), poly('50,26 72,66 28,66', PAT.WHITE, 2)])],
      [cell([circle(50, 50, 32, PAT.WHITE), poly('50,26 72,66 28,66', PAT.WHITE, 2)]), cell([rect(18, 18, 64, 64, PAT.WHITE), circle(50, 50, 14, PAT.WHITE, 2)]), cell([circle(50, 50, 32, PAT.WHITE), poly('50,30 68,62 32,62', PAT.WHITE, 2)])],
      [cell([poly('50,22 82,78 18,78', PAT.WHITE), rect(42, 64, 16, 14, PAT.WHITE, 2)]), cell([poly('50,22 82,78 18,78', PAT.WHITE), circle(50, 58, 10, PAT.WHITE, 2)]), null],
    ]),
    options: [
      { key: 'A', text: 'Segitiga besar berisi lingkaran', visualSpec: cell([poly('50,20 84,80 16,80', PAT.WHITE), circle(50, 60, 14, PAT.WHITE, 2)]) },
      { key: 'B', text: 'Lingkaran besar berisi segitiga', visualSpec: cell([circle(50, 50, 32, PAT.WHITE), poly('50,26 72,66 28,66', PAT.WHITE, 2)]) },
      { key: 'C', text: 'Persegi besar berisi segitiga kecil di dalamnya', visualSpec: cell([rect(18, 18, 64, 64, PAT.WHITE), poly('50,32 68,66 32,66', PAT.WHITE, 2)]) },
      { key: 'D', text: 'Persegi dan segitiga berdampingan', visualSpec: cell([rect(12, 30, 34, 34, PAT.WHITE), poly('72,28 90,64 54,64', PAT.WHITE, 2)]) },
      { key: 'E', text: 'Persegi terbelah diagonal segitiga', visualSpec: cell([rect(20, 20, 60, 60, PAT.WHITE), line(50, 20, 50, 80, 2)]) },
    ],
    correctOption: 'C',
    explanation: 'Gambar ketiga merupakan penggabungan bidang besar yang melengkapi pasangan baris dan bidang kecil dari gambar pertama: segitiga kecil dimasukkan ke dalam persegi besar.',
    quickTrick: 'Bangun besar pada baris 3 tinggal Persegi, bangun kecilnya Segitiga → Segitiga di dalam Persegi.',
  },
  {
    num: 8, kind: 'matrix', difficulty: 'MEDIUM', subtopic: 'Matriks Segienam Raster & Posisi (Latihan 4 #8)',
    stem: 'Amati pola arsiran segienam besar serta posisi dan arsiran segienam kecil di dalamnya pada matriks 3×3 berikut.',
    visualSpec: mat([
      [q8Hex(PAT.CHECKER, PAT.WHITE, 'top'), q8Hex(PAT.VERT, PAT.BLACK, 'center'), q8Hex(PAT.BLACK, PAT.CHECKER, 'bottom')],
      [q8Hex(PAT.VERT, PAT.BLACK, 'bottom'), q8Hex(PAT.BLACK, PAT.CHECKER, 'center'), q8Hex(PAT.CHECKER, PAT.WHITE, 'top')],
      [q8Hex(PAT.VERT, PAT.WHITE, 'top'), q8Hex(PAT.BLACK, PAT.CHECKER, 'center'), null],
    ]),
    options: [
      { key: 'A', text: 'Segienam besar hitam, kecil di atas', visualSpec: q8Hex(PAT.BLACK, PAT.WHITE, 'top') },
      { key: 'B', text: 'Segienam besar hitam, kecil di tengah', visualSpec: q8Hex(PAT.BLACK, PAT.VERT, 'center') },
      { key: 'C', text: 'Segienam besar garis vertikal, kecil catur', visualSpec: q8Hex(PAT.VERT, PAT.CHECKER, 'bottom') },
      { key: 'D', text: 'Segienam besar raster catur dengan segienam kecil hitam di bawah', visualSpec: q8Hex(PAT.CHECKER, PAT.BLACK, 'bottom') },
      { key: 'E', text: 'Segienam besar garis vertikal, kecil hitam di atas', visualSpec: q8Hex(PAT.VERT, PAT.BLACK, 'top') },
    ],
    correctOption: 'D',
    explanation: 'Setiap baris memiliki 3 raster besar (garis vertikal, hitam penuh, kotak catur) dan 3 posisi segienam kecil (atas, tengah, bawah) dengan arsiran yang melengkapi himpunan baris.',
    quickTrick: 'Baris 3 sudah punya Vertikal (atas) dan Hitam (tengah) → butuh Catur (bawah).',
  },
  {
    num: 9, kind: 'matrix', difficulty: 'MEDIUM', subtopic: 'Matriks Tiga Bintang Berarsir (Latihan 4 #9)',
    stem: 'Perhatikan kombinasi warna/arsiran ketiga bintang dalam tiap kotak pada matriks 3×3 berikut.',
    visualSpec: mat([
      [q9Stars([PAT.BLACK, PAT.BLACK, PAT.WHITE]), q9Stars([PAT.BLACK, PAT.WHITE, PAT.BLACK]), q9Stars([PAT.WHITE, PAT.DIAG, PAT.BLACK])],
      [q9Stars([PAT.DIAG, PAT.BLACK, PAT.WHITE]), q9Stars([PAT.WHITE, PAT.DIAG, PAT.BLACK]), q9Stars([PAT.BLACK, PAT.WHITE, PAT.BLACK])],
      [q9Stars([PAT.WHITE, PAT.WHITE, PAT.DIAG]), q9Stars([PAT.WHITE, PAT.BLACK, PAT.WHITE]), null],
    ]),
    options: [
      { key: 'A', text: 'Kiri hitam, kanan diagonal, bawah hitam', visualSpec: q9Stars([PAT.BLACK, PAT.DIAG, PAT.BLACK]) },
      { key: 'B', text: 'Kiri putih, kanan putih, bawah diagonal', visualSpec: q9Stars([PAT.WHITE, PAT.WHITE, PAT.DIAG]) },
      { key: 'C', text: 'Kiri diagonal, kanan putih, bawah hitam', visualSpec: q9Stars([PAT.DIAG, PAT.WHITE, PAT.BLACK]) },
      { key: 'D', text: 'Ketiga bintang hitam semua', visualSpec: q9Stars([PAT.BLACK, PAT.BLACK, PAT.BLACK]) },
      { key: 'E', text: 'Kiri hitam, kanan putih, bawah putih', visualSpec: q9Stars([PAT.BLACK, PAT.WHITE, PAT.WHITE]) },
    ],
    correctOption: 'C',
    explanation: 'Setiap kotak selalu memiliki minimal satu bintang putih polos sementara dua bintang lain melengkapi kombinasi hitam dan arsiran diagonal pada baris tersebut.',
    quickTrick: 'Pastikan selalu ada bintang putih polos dan kombinasi arsiran baris ke-3 lengkap.',
  },
  {
    num: 10, kind: 'matrix', difficulty: 'EASY', subtopic: 'Matriks Bangun Polos & Garis (Latihan 4 #10)',
    stem: 'Amati pola garis di dalam bangun datar pada setiap baris matriks 3×3 berikut.',
    visualSpec: mat([
      [cell([rect(20, 20, 60, 60, PAT.WHITE), line(20, 20, 80, 80, 2)]), cell([rect(20, 20, 60, 60, PAT.WHITE)]), cell([rect(20, 20, 60, 60, PAT.WHITE), line(20, 20, 80, 80, 2), line(80, 20, 20, 80, 2)])],
      [cell([poly('50,16 84,82 16,82', PAT.WHITE), line(50, 16, 50, 82, 2)]), cell([poly('50,16 84,82 16,82', PAT.WHITE), line(50, 16, 40, 82, 2)]), cell([poly('50,16 84,82 16,82', PAT.WHITE)])],
      [cell([rect(20, 20, 60, 60, PAT.WHITE), line(50, 20, 50, 80, 2), line(20, 20, 80, 80, 2)]), cell([rect(20, 20, 60, 60, PAT.WHITE)]), null],
    ]),
    options: [
      { key: 'A', text: 'Persegi dengan silang X penuh', visualSpec: cell([rect(20, 20, 60, 60, PAT.WHITE), line(20, 20, 80, 80, 2), line(80, 20, 20, 80, 2)]) },
      { key: 'B', text: 'Persegi dengan satu garis diagonal', visualSpec: cell([rect(20, 20, 60, 60, PAT.WHITE), line(20, 20, 80, 80, 2)]) },
      { key: 'C', text: 'Persegi dengan garis lengkung', visualSpec: cell([rect(20, 20, 60, 60, PAT.WHITE), path('M 50 20 Q 38 50 50 80', PAT.NONE, 2)]) },
      { key: 'D', text: 'Segitiga dengan garis tegak', visualSpec: cell([poly('50,16 84,82 16,82', PAT.WHITE), line(50, 16, 50, 82, 2)]) },
      { key: 'E', text: 'Segienam dengan garis diagonal', visualSpec: cell([regularPoly(50, 50, 32, 6, PAT.WHITE), line(25, 25, 75, 75, 2)]) },
    ],
    correctOption: 'B',
    explanation: 'Setiap baris memiliki satu gambar polos tanpa garis dalam, sedangkan dua gambar lain hanya berselisih satu garis.',
    quickTrick: 'Gambar kolom 1 punya 2 garis, kolom 2 polos → kolom 3 berselisih 1 garis dari kolom 1 (tinggal 1 garis diagonal).',
  },
  {
    num: 11, kind: 'matrix', difficulty: 'EASY', subtopic: 'Matriks Bangun & Panah Arah (Latihan 4 #11)',
    stem: 'Perhatikan kombinasi bentuk bangun (segienam, jajargenjang, belah ketupat) dan arah anak panah di dalamnya.',
    visualSpec: mat([
      [q11Arrows('hex', 'both'), q11Arrows('diamond', 'left'), q11Arrows('para', 'right')],
      [q11Arrows('para', 'left'), q11Arrows('hex', 'right'), q11Arrows('diamond', 'both')],
      [q11Arrows('para', 'right'), q11Arrows('hex', 'both'), null],
    ]),
    options: [
      { key: 'A', text: 'Segienam dengan panah dua arah', visualSpec: q11Arrows('hex', 'both') },
      { key: 'B', text: 'Belah ketupat dengan panah dua arah', visualSpec: q11Arrows('diamond', 'both') },
      { key: 'C', text: 'Jajargenjang dengan panah ke kanan', visualSpec: q11Arrows('para', 'right') },
      { key: 'D', text: 'Belah ketupat dengan panah ke kiri', visualSpec: q11Arrows('diamond', 'left') },
      { key: 'E', text: 'Jajargenjang dengan panah ke kiri', visualSpec: q11Arrows('para', 'left') },
    ],
    correctOption: 'D',
    explanation: 'Setiap baris memuat tepat satu segienam, satu jajargenjang, dan satu belah ketupat, serta tepat satu panah kanan, panah kiri, dan panah dua arah. Baris ke-3 kekurangan belah ketupat dan panah ke kiri.',
    quickTrick: 'Cek bentuk yang hilang (belah ketupat) + arah panah yang hilang (kiri).',
  },
  {
    num: 12, kind: 'matrix', difficulty: 'MEDIUM', subtopic: 'Matriks Tiga Susun Bangun Datar (Latihan 4 #12)',
    stem: 'Cermati bangun bagian atas, tengah, dan bawah beserta pola arsirannya pada matriks 3×3 berikut.',
    visualSpec: mat([
      [q12Totem('circle', PAT.BLACK, 'circle', PAT.WHITE), q12Totem('circle', PAT.DIAG, 'circle', PAT.DIAG), q12Totem('square', PAT.WHITE, 'circle', PAT.DIAG)],
      [q12Totem('circle', PAT.WHITE, 'circle', PAT.DIAG), q12Totem('square', PAT.DIAG, 'tri', PAT.DIAG), q12Totem('dots', PAT.WHITE, 'tri', PAT.BLACK)],
      [q12Totem('circle', PAT.DIAG, 'tri', PAT.DIAG), q12Totem('dots', PAT.WHITE, 'tri', PAT.WHITE), null],
    ]),
    options: [
      { key: 'A', text: 'Kepala lingkaran putih, tengah hitam, alas batang', visualSpec: q12Totem('circle', PAT.BLACK, 'tri', PAT.BLACK) },
      { key: 'B', text: 'Kepala lingkaran putih, tengah hitam penuh, alas lingkaran diagonal', visualSpec: q12Totem('circle', PAT.BLACK, 'circle', PAT.DIAG) },
      { key: 'C', text: 'Kepala lingkaran putih, tengah putih, alas lingkaran diagonal', visualSpec: q12Totem('circle', PAT.WHITE, 'circle', PAT.DIAG) },
      { key: 'D', text: 'Kepala titik-titik, tengah hitam, alas lingkaran diagonal', visualSpec: q12Totem('dots', PAT.BLACK, 'circle', PAT.DIAG) },
      { key: 'E', text: 'Kepala persegi, tengah diagonal, alas batang', visualSpec: q12Totem('square', PAT.DIAG, 'tri', PAT.WHITE) },
    ],
    correctOption: 'B',
    explanation: 'Setiap baris mengombinasikan jenis kepala (lingkaran/persegi/titik), arsiran segitiga tengah, dan bentuk alas bawah lengkap dengan rasternya.',
    quickTrick: 'Pada baris 3: kepala tinggal putih/lingkaran, tengah butuh blok hitam, alas butuh lingkaran diagonal.',
  },
  {
    num: 13, kind: 'matrix', difficulty: 'EASY', subtopic: 'Matriks Jumlah Sudut Bangun (Latihan 4 #13)',
    stem: 'Perhatikan kategori jumlah sudut bangun datar pada tiap baris matriks 3×3 berikut.',
    visualSpec: mat([
      [cell([poly('20,74 50,24 80,74', PAT.WHITE)]), cell([rect(22, 22, 56, 56, PAT.WHITE)]), cell([ellipse(50, 50, 34, 22, PAT.WHITE)])],
      [cell([ellipse(50, 50, 38, 16, PAT.WHITE)]), cell([poly('16,32 70,32 84,68 30,68', PAT.WHITE)]), cell([poly('50,20 82,78 18,78', PAT.WHITE)])],
      [cell([rect(40, 18, 20, 64, PAT.WHITE)]), cell([poly('22,76 50,22 78,76', PAT.WHITE)]), null],
    ]),
    options: [
      { key: 'A', text: 'Bangun bersisi lima tidak beraturan', visualSpec: cell([poly('20,24 62,24 82,56 76,78 20,78', PAT.WHITE)]) },
      { key: 'B', text: 'Persegi (4 sudut)', visualSpec: cell([rect(22, 22, 56, 56, PAT.WHITE)]) },
      { key: 'C', text: 'Segitiga terbalik (3 sudut)', visualSpec: cell([poly('18,24 82,24 50,80', PAT.WHITE)]) },
      { key: 'D', text: 'Jajargenjang (4 sudut)', visualSpec: cell([poly('30,28 84,28 70,72 16,72', PAT.WHITE)]) },
      { key: 'E', text: 'Bangun tanpa sudut (kapsul/oval memanjang)', visualSpec: cell([rect(14, 34, 72, 32, PAT.WHITE, 2.4, { rx: 16 })]) },
    ],
    correctOption: 'E',
    explanation: 'Masing-masing baris berisi satu bangun tanpa sudut (oval/elips), satu bangun bersudut 3 (segitiga), dan satu bangun bersudut 4 (segiempat). Baris ke-3 belum memiliki bangun tanpa sudut.',
    quickTrick: 'Kelompokkan jadi {0 sudut, 3 sudut, 4 sudut} → baris 3 kurang 0 sudut.',
  },
  {
    num: 14, kind: 'matrix', difficulty: 'MEDIUM', subtopic: 'Matriks Rotasi Bentuk Plus Panah (Latihan 4 #14)',
    stem: 'Amati rotasi bentuk palang dengan panah ujungnya pada matriks 3×3 berikut.',
    visualSpec: mat([
      [q14Puzzle(0), q14Puzzle(90), q14Puzzle(270)],
      [q14Puzzle(180), q14Puzzle(270), q14Puzzle(90)],
      [q14Puzzle(270), q14Puzzle(0), null],
    ]),
    options: [
      { key: 'A', text: 'Panah menghadap kanan-atas', visualSpec: q14Puzzle(90) },
      { key: 'B', text: 'Panah menghadap atas', visualSpec: q14Puzzle(45) },
      { key: 'C', text: 'Panah menghadap kiri', visualSpec: q14Puzzle(0) },
      { key: 'D', text: 'Diputar 180° dari kolom ke-2 (panah menghadap kanan)', visualSpec: q14Puzzle(180) },
      { key: 'E', text: 'Diputar 270°', visualSpec: q14Puzzle(270) },
    ],
    correctOption: 'D',
    explanation: 'Pada setiap baris, gambar pertama diputar 90° searah jarum jam ke kolom ke-2, lalu diputar 180° ke kolom ke-3 (270° → 0° → 180°).',
    quickTrick: 'Aturan tiap baris: +90° lalu +180°.',
  },
  {
    num: 15, kind: 'matrix', difficulty: 'EASY', subtopic: 'Matriks Bangun Besar & Kecil Sama (Latihan 4 #15)',
    stem: 'Perhatikan kombinasi bangun besar dan bangun kecil di dalamnya pada matriks 3×3 berikut.',
    visualSpec: mat([
      [cell([circle(50, 50, 34, PAT.WHITE), poly('50,28 70,66 30,66', PAT.WHITE, 2)]), cell([poly('50,18 82,80 18,80', PAT.WHITE), poly('50,40 64,68 36,68', PAT.WHITE, 2)]), cell([rect(18, 18, 64, 64, PAT.WHITE), rect(38, 38, 24, 24, PAT.WHITE, 2)])],
      [cell([poly('50,18 82,80 18,80', PAT.WHITE), circle(50, 58, 13, PAT.WHITE, 2)]), cell([poly('50,18 82,80 18,80', PAT.WHITE), rect(38, 48, 24, 24, PAT.WHITE, 2)]), cell([circle(50, 50, 34, PAT.WHITE), circle(50, 50, 15, PAT.WHITE, 2)])],
      [cell([rect(18, 18, 64, 64, PAT.WHITE), rect(40, 40, 20, 20, PAT.WHITE, 2)]), cell([circle(50, 50, 34, PAT.WHITE), circle(50, 50, 15, PAT.WHITE, 2)]), null],
    ]),
    options: [
      { key: 'A', text: 'Segitiga besar berisi persegi kecil', visualSpec: cell([poly('50,18 82,80 18,80', PAT.WHITE), rect(38, 48, 24, 24, PAT.WHITE, 2)]) },
      { key: 'B', text: 'Segitiga besar berisi segitiga kecil', visualSpec: cell([poly('50,18 82,80 18,80', PAT.WHITE), poly('50,40 65,68 35,68', PAT.WHITE, 2)]) },
      { key: 'C', text: 'Segitiga besar berisi segitiga kecil terisi hitam', visualSpec: cell([poly('50,18 82,80 18,80', PAT.WHITE), poly('50,40 65,68 35,68', PAT.BLACK, 2)]) },
      { key: 'D', text: 'Persegi besar berisi persegi kecil', visualSpec: cell([rect(18, 18, 64, 64, PAT.WHITE), rect(38, 38, 24, 24, PAT.WHITE, 2)]) },
      { key: 'E', text: 'Persegi besar berisi kotak kecil tipis', visualSpec: cell([rect(22, 22, 56, 56, PAT.WHITE), rect(40, 40, 20, 20, PAT.WHITE, 1.5)]) },
    ],
    correctOption: 'B',
    explanation: 'Baris ke-3 memuat pasangan bangun luar dan dalam yang sama jenisnya (persegi dalam persegi, lingkaran dalam lingkaran), sehingga kurang segitiga besar berisi segitiga kecil putih.',
    quickTrick: 'Baris 3 = bangun luar & dalam kembar (Persegi-Persegi, Lingkaran-Lingkaran → Segitiga-Segitiga).',
  },
  {
    num: 16, kind: 'matrix', difficulty: 'MEDIUM', subtopic: 'Matriks Pengurangan Garis (Latihan 4 #16)',
    stem: 'Kolom ketiga pada setiap baris dibentuk dengan mengurangkan elemen kolom kedua dari kolom pertama. Gambar manakah yang tepat menggantikan (?)?',
    visualSpec: mat([
      [q16Lines(true, true, true), q16Lines(false, true, true), q16Lines(true, false, false)],
      [q16Lines(false, true, true), q16Lines(false, true, false), q16Lines(false, false, true)],
      [q16Lines(false, true, true, true), q16Lines(false, false, true, true), null],
    ]),
    options: [
      { key: 'A', text: 'Lingkaran dengan X', visualSpec: q16Lines(false, false, true, true) },
      { key: 'B', text: 'Lingkaran dengan tanda tambah (+)', visualSpec: q16Lines(false, true, false, true) },
      { key: 'C', text: 'Tanda tambah (+) saja', visualSpec: q16Lines(false, true, false, false) },
      { key: 'D', text: 'Tanda silang (X) saja', visualSpec: q16Lines(false, false, true, false) },
      { key: 'E', text: 'Tanda tambah (+) dan silang (X)', visualSpec: q16Lines(false, true, true, false) },
    ],
    correctOption: 'C',
    explanation: 'Kolom 1 memuat Lingkaran + X + Tambah (+). Kolom 2 memuat Lingkaran + X. Jika kolom 1 dikurangi kolom 2, tersisa tanda tambah (+) saja.',
    quickTrick: 'Aturan pengurangan: garis yang muncul di kolom 1 DAN kolom 2 dicoret/dihilangkan.',
  },
  {
    num: 17, kind: 'matrix', difficulty: 'EASY', subtopic: 'Matriks Domino Dua Ruang (Latihan 4 #17)',
    stem: 'Perhatikan distribusi ruang kosong, bintik hitam besar, dan dua bintik kecil pada setiap baris matriks 3×3 berikut.',
    visualSpec: mat([
      [q17Domino2('big', 'empty'), q17Domino2('small', 'big'), q17Domino2('empty', 'small')],
      [q17Domino2('small', 'big'), q17Domino2('empty', 'small'), q17Domino2('big', 'empty')],
      [q17Domino2('small', 'big'), q17Domino2('empty', 'empty'), null],
    ]),
    options: [
      { key: 'A', text: 'Kiri dua bintik kecil, kanan kosong', visualSpec: q17Domino2('small', 'empty') },
      { key: 'B', text: 'Kiri satu bintik besar, kanan dua bintik kecil', visualSpec: q17Domino2('big', 'small') },
      { key: 'C', text: 'Kiri dua bintik kecil, kanan satu bintik besar', visualSpec: q17Domino2('small', 'big') },
      { key: 'D', text: 'Kiri satu bintik besar, kanan satu bintik besar', visualSpec: q17Domino2('big', 'big') },
      { key: 'E', text: 'Kiri kosong, kanan satu bintik besar', visualSpec: q17Domino2('empty', 'big') },
    ],
    correctOption: 'C',
    explanation: 'Setiap baris harus memuat tepat dua ruang kosong, dua ruang bintik besar, dan dua ruang bintik kecil. Baris ke-3 sudah punya 2 kosong, 1 kecil, dan 1 besar, sehingga kurang 1 bintik kecil dan 1 bintik besar.',
    quickTrick: 'Hitung per baris: harus ada 2 kosong, 2 besar, 2 kecil.',
  },
  {
    num: 18, kind: 'matrix', difficulty: 'HARD', subtopic: 'Matriks Garis Orientasi & Ujung (Latihan 4 #18)',
    stem: 'Cermati orientasi garis (mendatar, tegak, miring) serta bentuk pangkal dan ujung garis pada matriks 3×3 berikut.',
    visualSpec: mat([
      [cell([arrowLine(18, 50, 82, 50, 2.2, 7, false)]), cell([line(50, 22, 50, 78, 2.2), rect(46, 16, 8, 8, PAT.WHITE, 1.8), circle(50, 82, 4, PAT.WHITE, 1.8)]), cell([arrowLine(78, 22, 22, 78, 2.2, 7, true)])],
      [cell([arrowLine(22, 78, 78, 22, 2.2, 7, false)]), cell([arrowLine(82, 50, 18, 50, 2.2, 7, true), circle(84, 50, 4, PAT.WHITE, 1.8)]), cell([line(50, 22, 50, 82, 2.2), rect(46, 14, 8, 8, PAT.WHITE, 1.8), poly('45,86 55,86 50,76', PAT.WHITE, 1.8)])],
      [cell([line(50, 18, 50, 82, 2.2), rect(46, 14, 8, 8, PAT.WHITE, 1.8), poly('45,76 55,76 50,86', PAT.WHITE, 1.8)]), cell([arrowLine(78, 22, 22, 78, 2.2, 7, false)]), null],
    ]),
    options: [
      { key: 'A', text: 'Garis mendatar dengan panah kiri', visualSpec: cell([arrowLine(82, 50, 18, 50, 2.2, 7, true), rect(80, 46, 8, 8, PAT.WHITE, 1.8)]) },
      { key: 'B', text: 'Garis miring ke kiri bawah', visualSpec: cell([arrowLine(22, 22, 78, 78, 2.2, 7, false), circle(20, 20, 4, PAT.WHITE, 1.8)]) },
      { key: 'C', text: 'Garis miring ke kanan atas', visualSpec: cell([arrowLine(22, 78, 78, 22, 2.2, 7, true)]) },
      { key: 'D', text: 'Garis mendatar dengan pangkal garis tegak kecil dan ujung lingkaran', visualSpec: cell([line(20, 50, 76, 50, 2.2), line(20, 42, 20, 58, 2.2), circle(80, 50, 4, PAT.WHITE, 1.8)]) },
      { key: 'E', text: 'Garis tegak dengan panah ke atas', visualSpec: cell([arrowLine(50, 80, 50, 20, 2.2, 7, false)]) },
    ],
    correctOption: 'D',
    explanation: 'Setiap baris harus memiliki satu garis tegak, satu miring, dan satu mendatar. Baris ke-3 baru memiliki garis tegak dan miring, sehingga jawabannya pasti garis mendatar dengan pangkal palang dan ujung lingkaran (D).',
    quickTrick: 'Cek orientasi garis di baris 3: sudah ada tegak + miring → pasti mendatar!',
  },
  {
    num: 19, kind: 'matrix', difficulty: 'MEDIUM', subtopic: 'Matriks Timbangan Kepala & Lengan (Latihan 4 #19)',
    stem: 'Perhatikan kombinasi simbol di puncak tengah, lengan kiri, dan lengan kanan gambar timbangan pada matriks 3×3 berikut.',
    visualSpec: mat([
      [q19Scale('plus', 'heart', 'tri'), q19Scale('heart', 'tri', 'plus'), q19Scale('tri', 'tri', 'plus')],
      [q19Scale('heart', 'tri', 'tri'), q19Scale('tri', 'plus', 'plus'), q19Scale('plus', 'tri', 'heart')],
      [q19Scale('tri', 'plus', 'heart'), q19Scale('plus', 'heart', 'heart'), null],
    ]),
    options: [
      { key: 'A', text: 'Puncak hati, kiri plus, kanan segitiga', visualSpec: q19Scale('heart', 'plus', 'tri') },
      { key: 'B', text: 'Puncak hati, kiri segitiga, kanan plus', visualSpec: q19Scale('heart', 'tri', 'plus') },
      { key: 'C', text: 'Puncak segitiga, kiri hati, kanan plus', visualSpec: q19Scale('tri', 'heart', 'plus') },
      { key: 'D', text: 'Puncak segitiga, kiri plus, kanan hati', visualSpec: q19Scale('tri', 'plus', 'heart') },
      { key: 'E', text: 'Puncak hati, kiri segitiga, kanan plus penuh', visualSpec: q19Scale('heart', 'tri', 'tri') },
    ],
    correctOption: 'B',
    explanation: 'Pada baris ke-3, simbol puncak yang belum muncul adalah Hati, lengan kiri yang belum muncul adalah Segitiga, dan lengan kanan yang melengkapi adalah Plus (B).',
    quickTrick: 'Lacak 3 bagian terpisah pada baris 3: Puncak {tri, plus → heart}; Lengan kiri; Lengan kanan.',
  },
  {
    num: 20, kind: 'matrix', difficulty: 'EASY', subtopic: 'Matriks Batang Selang-Seling (Latihan 4 #20)',
    stem: 'Amati pola warna batang (putih-hitam selang-seling) dan posisi lingkaran kepala pada matriks 3×3 berikut.',
    visualSpec: mat([
      [q20Rods('h', PAT.WHITE, 'end'), q20Rods('h', PAT.BLACK, 'start'), q20Rods('h', PAT.WHITE, 'end')],
      [q20Rods('v', PAT.BLACK, 'start'), q20Rods('v', PAT.WHITE, 'start'), q20Rods('v', PAT.BLACK, 'start')],
      [q20Rods('diag', PAT.WHITE, 'start'), q20Rods('diag', PAT.BLACK, 'start'), null],
    ]),
    options: [
      { key: 'A', text: 'Batang miring V berwarna putih dengan posisi kepala beraturan', visualSpec: q20Rods('diag', PAT.WHITE, 'start') },
      { key: 'B', text: 'Batang miring V berwarna hitam dengan kepala di atas', visualSpec: q20Rods('diag', PAT.BLACK, 'start') },
      { key: 'C', text: 'Batang miring satu hitam satu putih', visualSpec: q20Rods('diag', PAT.DIAG, 'start') },
      { key: 'D', text: 'Batang miring hitam menghadap bawah', visualSpec: q20Rods('diag', PAT.BLACK, 'end') },
      { key: 'E', text: 'Batang miring putih tanpa kepala', visualSpec: cell([line(25, 20, 42, 76, 3), line(75, 20, 58, 76, 3)]) },
    ],
    correctOption: 'A',
    explanation: 'Pola warna batang pada tiap baris berselang-seling (putih-hitam-putih atau hitam-putih-hitam). Baris ke-3 dimulai putih → hitam → maka berikutnya putih (A).',
    quickTrick: 'Baris 3 = Putih → Hitam → Putih!',
  },
  {
    num: 21, kind: 'matrix', difficulty: 'MEDIUM', subtopic: 'Matriks Pengurangan Busur Lingkaran (Latihan 4 #21)',
    stem: 'Kolom ketiga diperoleh dengan mengurangkan bagian lengkung lingkaran pada kolom kedua dari kolom pertama.',
    visualSpec: mat([
      [q21Cross(true, false, false, false, false), q21Cross(false, false, false, true, true), q21Cross(false, true, true, false, false)],
      [q21Cross(false, true, false, false, true), q21Cross(false, false, false, false, true), q21Cross(false, true, false, false, false)],
      [q21Cross(false, false, true, true, false), q21Cross(false, false, true, false, false), null],
    ]),
    options: [
      { key: 'A', text: 'Palang dengan busur kiri atas', visualSpec: q21Cross(false, true, false, false, false) },
      { key: 'B', text: 'Palang dengan busur kanan atas', visualSpec: q21Cross(false, false, true, false, false) },
      { key: 'C', text: 'Palang dengan busur kanan bawah tersisa', visualSpec: q21Cross(false, false, false, true, false) },
      { key: 'D', text: 'Palang polos tanpa busur', visualSpec: q21Cross(false, false, false, false, false) },
      { key: 'E', text: 'Palang dengan dua busur diagonal', visualSpec: q21Cross(false, true, false, true, false) },
    ],
    correctOption: 'C',
    explanation: 'Kolom 1 memiliki busur kanan-atas dan kanan-bawah; kolom 2 memiliki busur kanan-atas. Saat dikurangkan, tersisa busur kanan-bawah (C).',
    quickTrick: 'Cukup kurangkan kuadran busur lingkaran pada kolom 1 oleh kolom 2.',
  },
  {
    num: 22, kind: 'matrix', difficulty: 'EASY', subtopic: 'Matriks Rotasi Kuadran Lingkaran (Latihan 4 #22)',
    stem: 'Perhatikan arah perputaran garis jari-jari lingkaran di setiap baris matriks 3×3 berikut.',
    visualSpec: mat([
      [cell([circle(50, 50, 34, PAT.WHITE), line(50, 16, 50, 50, 2.2), line(50, 50, 84, 50, 2.2)]), cell([circle(50, 50, 34, PAT.WHITE), line(50, 50, 84, 50, 2.2), line(50, 50, 50, 84, 2.2)]), cell([circle(50, 50, 34, PAT.WHITE), line(50, 50, 50, 84, 2.2), line(16, 50, 50, 50, 2.2)])],
      [cell([circle(50, 50, 34, PAT.WHITE), line(16, 50, 84, 50, 2.2), line(50, 16, 50, 50, 2.2)]), cell([circle(50, 50, 34, PAT.WHITE), line(50, 16, 50, 84, 2.2), line(50, 50, 84, 50, 2.2)]), cell([circle(50, 50, 34, PAT.WHITE), line(16, 50, 84, 50, 2.2), line(50, 50, 50, 84, 2.2)])],
      [cell([circle(50, 50, 34, PAT.WHITE), line(50, 16, 50, 84, 2.2), line(16, 50, 50, 50, 2.2)]), cell([circle(50, 50, 34, PAT.WHITE), line(16, 50, 84, 50, 2.2), line(50, 16, 50, 50, 2.2)]), null],
    ]),
    options: [
      { key: 'A', text: 'Lingkaran dengan diameter mendatar', visualSpec: cell([circle(50, 50, 34, PAT.WHITE), line(16, 50, 84, 50, 2.2)]) },
      { key: 'B', text: 'Lingkaran terbagi dua vertikal', visualSpec: cell([circle(50, 50, 34, PAT.WHITE), line(50, 16, 50, 84, 2.2)]) },
      { key: 'C', text: 'Lingkaran kuadran kanan atas', visualSpec: cell([circle(50, 50, 34, PAT.WHITE), line(50, 16, 50, 50, 2.2), line(50, 50, 84, 50, 2.2)]) },
      { key: 'D', text: 'Lingkaran kuadran kiri bawah', visualSpec: cell([circle(50, 50, 34, PAT.WHITE), line(16, 50, 50, 50, 2.2), line(50, 50, 50, 84, 2.2)]) },
      { key: 'E', text: 'Hasil rotasi +90° searah jarum jam (diameter vertikal + jari-jari kanan)', visualSpec: cell([circle(50, 50, 34, PAT.WHITE), line(50, 16, 50, 84, 2.2), line(50, 50, 84, 50, 2.2)]) },
    ],
    correctOption: 'E',
    explanation: 'Setiap baris memutar gambar ke kanan sebesar +90° searah jarum jam secara berturut-turut.',
    quickTrick: 'Putar gambar kolom ke-2 baris ke-3 sebesar +90° searah jarum jam.',
  },
  {
    num: 23, kind: 'matrix', difficulty: 'MEDIUM', subtopic: 'Matriks Irisan Bangun (Latihan 4 #23)',
    stem: 'Gambar pada kolom ketiga merupakan irisan (bagian yang berimpit sama) antara gambar kolom pertama dan kolom kedua.',
    visualSpec: mat([
      [cell([rect(18, 40, 64, 20, PAT.WHITE)]), cell([plusCross(50, 50, 32, 10, PAT.WHITE)]), cell([rect(18, 40, 64, 20, PAT.WHITE), line(39, 40, 39, 60, 1.8), line(61, 40, 61, 60, 1.8)])],
      [cell([plusCross(50, 50, 32, 10, PAT.WHITE)]), cell([rect(40, 40, 20, 20, PAT.WHITE)]), cell([plusCross(50, 50, 32, 10, PAT.WHITE)])],
      [cell([rect(40, 16, 20, 68, PAT.WHITE)]), cell([plusCross(50, 50, 32, 10, PAT.WHITE)]), null],
    ]),
    options: [
      { key: 'A', text: 'Batang vertikal terpotong irisan tengah', visualSpec: cell([rect(40, 16, 20, 68, PAT.WHITE), line(40, 40, 60, 40, 1.8), line(40, 60, 60, 60, 1.8)]) },
      { key: 'B', text: 'Bentuk L kanan', visualSpec: cell([poly('40,18 60,18 60,82 40,82 40,60 22,60 22,40 40,40', PAT.WHITE)]) },
      { key: 'C', text: 'Palang penuh', visualSpec: cell([plusCross(50, 50, 32, 10, PAT.WHITE)]) },
      { key: 'D', text: 'Dua palang berdempetan', visualSpec: cell([plusCross(36, 50, 22, 8, PAT.WHITE), plusCross(68, 50, 22, 8, PAT.WHITE)]) },
      { key: 'E', text: 'Setengah palang', visualSpec: cell([rect(40, 18, 20, 64, PAT.WHITE), rect(40, 40, 34, 20, PAT.WHITE)]) },
    ],
    correctOption: 'A',
    explanation: 'Irisan batang vertikal (kolom 1) dan palang plus (kolom 2) menghasilkan batang vertikal dengan batas garis pertemuan di tengah (A).',
    quickTrick: 'Cari bagian yang sama-sama tertutupi oleh gambar kolom 1 dan kolom 2.',
  },
  {
    num: 24, kind: 'matrix', difficulty: 'MEDIUM', subtopic: 'Matriks Kapsul Orientasi & Arsiran (Latihan 4 #24)',
    stem: 'Perhatikan orientasi kapsul (tegak, miring, mendatar) serta pola arsiran masing-masing bagian pada matriks 3×3 berikut.',
    visualSpec: mat([
      [cell([rect(28, 16, 44, 68, PAT.BLACK, 2.2, { rx: 14 }), line(50, 16, 50, 84, 2.2), rect(50, 16, 22, 68, PAT.WHITE, 2.2)]), cell([circle(50, 50, 32, PAT.HORIZ, 2.2), line(18, 50, 82, 50, 2)]), cell([rect(26, 18, 48, 64, PAT.WHITE, 2.2, { rx: 18 }), line(28, 44, 72, 56, 2)])],
      [cell([circle(50, 50, 32, PAT.WHITE, 2.2), line(18, 50, 82, 50, 2)]), cell([rect(28, 18, 44, 64, PAT.BLACK, 2.2, { rx: 18 }), line(28, 50, 72, 50, 2)], 35), cell([rect(22, 24, 56, 52, PAT.HORIZ, 2.2, { rx: 16 }), line(50, 24, 50, 76, 2)])],
      [cell([rect(26, 20, 48, 60, PAT.WHITE, 2.2, { rx: 18 }), line(28, 44, 72, 56, 2)], -35), cell([circle(50, 50, 32, PAT.HORIZ, 2.2), line(18, 50, 82, 50, 2)]), null],
    ]),
    options: [
      { key: 'A', text: 'Kapsul mendatar berarsir blok hitam', visualSpec: cell([rect(18, 28, 64, 44, PAT.WHITE, 2.2, { rx: 16 }), path('M 18 44 Q 50 44 82 44 L 82 56 A 16 16 0 0 1 66 72 L 34 72 A 16 16 0 0 1 18 56 Z', PAT.BLACK, 2)]) },
      { key: 'B', text: 'Kapsul penuh bergaris', visualSpec: cell([circle(50, 50, 32, PAT.HORIZ, 2.2)]) },
      { key: 'C', text: 'Kapsul miring bergaris', visualSpec: cell([rect(26, 20, 48, 60, PAT.HORIZ, 2.2, { rx: 16 })], 35) },
      { key: 'D', text: 'Lingkaran putih terbagi garis', visualSpec: cell([circle(50, 50, 32, PAT.WHITE, 2.2), line(18, 50, 82, 50, 2)]) },
      { key: 'E', text: 'Kapsul tegak separuh hitam', visualSpec: cell([rect(28, 18, 44, 64, PAT.BLACK, 2.2, { rx: 16 })]) },
    ],
    correctOption: 'A',
    explanation: 'Setiap baris memuat kombinasi orientasi (tegak, miring, mendatar) dan tiga jenis isian (putih, garis horizontal, blok hitam). Baris ke-3 kekurangan bentuk mendatar berarsir blok hitam (A).',
    quickTrick: 'Cek isian baris 3: putih + garis horizontal → kurang blok hitam.',
  },
  {
    num: 25, kind: 'matrix', difficulty: 'MEDIUM', subtopic: 'Matriks Palang & Ujung Berarsir (Latihan 4 #25)',
    stem: 'Perhatikan kombinasi bentuk ujung palang dan pola arsirannya pada matriks 3×3 berikut.',
    visualSpec: mat([
      [q25Plus(PAT.GRID, 'none'), q25Plus(PAT.BLACK, 'arrow'), q25Plus(PAT.DOTS, 'box')],
      [q25Plus(PAT.BLACK, 'arrow'), q25Plus(PAT.DOTS, 'none'), q25Plus(PAT.GRID, 'box')],
      [q25Plus(PAT.DOTS, 'arrow'), q25Plus(PAT.GRID, 'box'), null],
    ]),
    options: [
      { key: 'A', text: 'Palang blok hitam dengan ujung kotak', visualSpec: q25Plus(PAT.BLACK, 'none') },
      { key: 'B', text: 'Palang titik dengan ujung kotak', visualSpec: q25Plus(PAT.DOTS, 'box') },
      { key: 'C', text: 'Palang blok hitam dengan ujung panah', visualSpec: q25Plus(PAT.BLACK, 'arrow') },
      { key: 'D', text: 'Palang titik polos', visualSpec: q25Plus(PAT.DOTS, 'none') },
      { key: 'E', text: 'Palang jaring polos', visualSpec: q25Plus(PAT.GRID, 'none') },
    ],
    correctOption: 'A',
    explanation: 'Setiap baris memiliki tiga arsiran palang (jaring, blok hitam, titik) dan tiga jenis ujung. Pada baris ke-3 sudah ada titik dan jaring, sehingga tersisa palang blok hitam (A).',
    quickTrick: 'Lengkapkan tiga pola arsiran per baris: {jaring, titik, blok hitam}.',
  },
  {
    num: 26, kind: 'matrix', difficulty: 'EASY', subtopic: 'Matriks Penambahan Jumlah Hati (Latihan 4 #26)',
    stem: 'Amati penambahan jumlah ikon hati dan pola arsirannya pada matriks 3×3 berikut.',
    visualSpec: mat([
      [q26Hearts(2, PAT.WHITE), q26Hearts(3, PAT.DOTS), q26Hearts(4, PAT.WHITE)],
      [q26Hearts(3, PAT.WHITE), q26Hearts(4, PAT.WHITE), q26Hearts(5, PAT.DOTS)],
      [q26Hearts(4, PAT.DOTS), q26Hearts(5, PAT.WHITE), null],
    ]),
    options: [
      { key: 'A', text: '6 hati putih polos', visualSpec: q26Hearts(6, PAT.WHITE) },
      { key: 'B', text: '6 hati berarsir titik', visualSpec: q26Hearts(6, PAT.DOTS) },
      { key: 'C', text: '5 hati berarsir titik', visualSpec: q26Hearts(5, PAT.DOTS) },
      { key: 'D', text: '4 hati putih polos', visualSpec: q26Hearts(4, PAT.WHITE) },
      { key: 'E', text: '3 hati putih polos', visualSpec: q26Hearts(3, PAT.WHITE) },
    ],
    correctOption: 'A',
    explanation: 'Jumlah hati selalu bertambah +1 ke kanan (4 → 5 → 6), dan pada setiap baris hanya ada satu kotak kelompok hati berarsir titik sedangkan dua lainnya putih polos.',
    quickTrick: '4 → 5 → 6 hati, dan baris 3 sudah punya yang berarsir di kolom 1 → jawaban pasti 6 hati putih polos!',
  },
  {
    num: 27, kind: 'matrix', difficulty: 'EASY', subtopic: 'Matriks Posisi Bintang, Garis & Panah (Latihan 4 #27)',
    stem: 'Perhatikan unsur garis diagonal, bintang 4-sudut, dan anak panah di dalam persegi panjang pada matriks 3×3 berikut.',
    visualSpec: mat([
      [cell([rect(12, 22, 76, 56, PAT.WHITE), line(12, 22, 46, 78, 2), starShape(62, 50, 14, 5, 4, PAT.WHITE)]), cell([rect(12, 22, 76, 56, PAT.WHITE), arrowLine(30, 50, 62, 50, 2, 6)]), cell([rect(12, 22, 76, 56, PAT.WHITE), starShape(34, 50, 14, 5, 4, PAT.WHITE)])],
      [cell([rect(12, 22, 76, 56, PAT.WHITE), line(12, 22, 46, 78, 2), arrowLine(36, 50, 66, 50, 2, 6)]), cell([rect(12, 22, 76, 56, PAT.WHITE), starShape(36, 50, 14, 5, 4, PAT.WHITE)]), cell([rect(12, 22, 76, 56, PAT.WHITE), starShape(62, 50, 14, 5, 4, PAT.WHITE)])],
      [cell([rect(12, 22, 76, 56, PAT.WHITE), starShape(36, 50, 14, 5, 4, PAT.WHITE)]), cell([rect(12, 22, 76, 56, PAT.WHITE)]), null],
    ]),
    options: [
      { key: 'A', text: 'Garis diagonal + bintang kiri + panah kanan', visualSpec: cell([rect(12, 22, 76, 56, PAT.WHITE), line(12, 22, 46, 78, 2), starShape(66, 50, 13, 5, 4, PAT.WHITE), arrowLine(34, 50, 54, 50, 2, 5)]) },
      { key: 'B', text: 'Hanya garis diagonal tanpa bintang', visualSpec: cell([rect(12, 22, 76, 56, PAT.WHITE), line(12, 22, 46, 78, 2)]) },
      { key: 'C', text: 'Garis miring kanan dengan bintang', visualSpec: cell([rect(12, 22, 76, 56, PAT.WHITE), line(54, 22, 88, 78, 2), starShape(34, 50, 13, 5, 4, PAT.WHITE)]) },
      { key: 'D', text: 'Garis diagonal + bintang di pojok bawah', visualSpec: cell([rect(12, 22, 76, 56, PAT.WHITE), line(12, 22, 46, 78, 2), starShape(36, 62, 13, 5, 4, PAT.WHITE)]) },
      { key: 'E', text: 'Dua bintang tanpa garis dan panah', visualSpec: cell([rect(12, 22, 76, 56, PAT.WHITE), starShape(32, 50, 12, 4, 4, PAT.WHITE), starShape(68, 50, 12, 4, 4, PAT.WHITE)]) },
    ],
    correctOption: 'A',
    explanation: 'Setiap baris harus memuat total satu garis diagonal, dua bintang, dan satu anak panah. Baris ke-3 baru memiliki satu bintang, sehingga kotak ke-3 harus memuat garis, satu anak panah, dan satu bintang pada posisi yang melengkapi (A).',
    quickTrick: 'Hitung per baris: 1 garis + 2 bintang + 1 panah.',
  },
  {
    num: 28, kind: 'matrix', difficulty: 'MEDIUM', subtopic: 'Matriks Lencana Bintang & Hati (Latihan 4 #28)',
    stem: 'Perhatikan distribusi simbol bintang dan hati di dalam lingkaran ganda pada matriks 3×3 berikut.',
    visualSpec: mat([
      [q28Badge('star', false, true), q28Badge('heart', false, false), q28Badge('none', true, false)],
      [q28Badge('none', true, false), q28Badge('heart', false, false), q28Badge('heart', false, false)],
      [q28Badge('none', true, false), q28Badge('star', false, false), null],
    ]),
    options: [
      { key: 'A', text: 'Lingkaran berisi hati (tanpa garis miring)', visualSpec: q28Badge('heart', false, false) },
      { key: 'B', text: 'Lingkaran berisi bintang', visualSpec: q28Badge('star', false, false) },
      { key: 'C', text: 'Lingkaran berisi bintang miring', visualSpec: q28Badge('star', true, false) },
      { key: 'D', text: 'Lingkaran berisi bintang besar', visualSpec: q28Badge('star', false, true) },
      { key: 'E', text: 'Lingkaran dicoret miring kosong', visualSpec: q28Badge('none', true, false) },
    ],
    correctOption: 'A',
    explanation: 'Pada setiap baris terdapat unsur bintang dan hati yang melengkapi kombinasi baris tersebut. Baris ke-3 sudah memiliki unsur coret dan bintang, sehingga membutuhkan lingkaran berisi hati (A).',
    quickTrick: 'Lihat unsur baris 3: sudah ada bintang → lengkapi dengan ikon hati (A).',
  },
  {
    num: 29, kind: 'matrix', difficulty: 'MEDIUM', subtopic: 'Matriks Kunci Siluet & Arsiran (Latihan 4 #29)',
    stem: 'Amati kombinasi bentuk dan pola arsiran (hitam, putih, titik, garis) pada matriks 3×3 berikut.',
    visualSpec: mat([
      [cell([poly('20,26 56,26 74,50 56,74 20,74', PAT.BLACK), rect(28, 38, 22, 24, PAT.WHITE, 2)]), cell([poly('20,26 56,26 74,50 56,74 20,74', PAT.WHITE), poly('48,26 66,50 48,74 74,74 74,26', PAT.BLACK)]), cell([poly('20,26 56,26 74,50 56,74 20,74', PAT.DOTS), rect(30, 38, 20, 24, PAT.BLACK, 2)])],
      [cell([plusCross(50, 50, 28, 10, PAT.BLACK), rect(24, 42, 16, 16, PAT.WHITE, 1.8)]), cell([plusCross(50, 50, 28, 10, PAT.DOTS)]), cell([plusCross(50, 50, 28, 10, PAT.BLACK), circle(32, 50, 8, PAT.WHITE, 1.8)])],
      [cell([plusCross(50, 50, 28, 10, PAT.WHITE), plusCross(40, 50, 12, 4, PAT.DOTS)]), cell([poly('24,30 62,30 78,54 58,76 24,76', PAT.WHITE)]), null],
    ]),
    options: [
      { key: 'A', text: 'Siluet blok hitam dengan potongan putih sesuai pola arsiran', visualSpec: cell([poly('20,24 60,24 78,50 60,76 20,76', PAT.BLACK), plusCross(36, 50, 12, 4, PAT.WHITE)]) },
      { key: 'B', text: 'Palang putih dengan palang kecil titik', visualSpec: cell([plusCross(50, 50, 28, 10, PAT.WHITE), plusCross(50, 50, 14, 5, PAT.BLACK)]) },
      { key: 'C', text: 'Siluet hitam penuh tanpa ikon dalam', visualSpec: cell([poly('20,24 60,24 78,50 60,76 20,76', PAT.BLACK)]) },
      { key: 'D', text: 'Palang titik tanpa latar', visualSpec: cell([plusCross(50, 50, 28, 10, PAT.DOTS)]) },
      { key: 'E', text: 'Siluet titik dengan palang hitam', visualSpec: cell([poly('20,24 60,24 78,50 60,76 20,76', PAT.DOTS), plusCross(38, 50, 12, 4, PAT.BLACK)]) },
    ],
    correctOption: 'A',
    explanation: 'Pola arsiran pada setiap baris mengombinasikan blok hitam, putih, dan arsiran titik. Baris ke-3 telah memiliki putih dan kombinasi palang, sehingga memerlukan bentuk berblok hitam (A).',
    quickTrick: 'Lacak variasi arsiran: tiap baris harus memiliki komponen blok hitam.',
  },
  {
    num: 30, kind: 'matrix', difficulty: 'EASY', subtopic: 'Matriks Himpitan Dua Gambar (Latihan 4 #30)',
    stem: 'Gambar pada kolom ketiga merupakan hasil gabungan (himpitan) antara gambar kolom pertama dan gambar kolom kedua.',
    visualSpec: mat([
      [cell([poly('30,26 76,26 62,74 16,74', PAT.WHITE)]), cell([line(22, 26, 22, 74, 2.4), line(78, 26, 78, 74, 2.4)]), cell([line(30, 50, 74, 50, 2.4)])],
      [cell([line(22, 20, 76, 80, 2.4), line(76, 20, 22, 80, 2.4), line(62, 34, 84, 50, 2.2), line(84, 50, 62, 66, 2.2)]), cell([poly('64,26 32,50 64,74', PAT.WHITE)]), cell([poly('64,26 32,50 64,74', PAT.WHITE), poly('64,34 44,50 64,66', PAT.WHITE)])],
      [cell([path('M 64 20 A 30 30 0 1 0 64 80', PAT.WHITE, 2.4), path('M 64 32 A 18 18 0 1 0 64 68', PAT.WHITE, 2.4)]), cell([path('M 54 24 A 26 26 0 1 0 54 76', PAT.WHITE, 2.4), poly('54,38 72,50 54,62', PAT.WHITE, 2.2)]), null],
    ]),
    options: [
      { key: 'A', text: 'Dua lingkaran konsentris penuh', visualSpec: cell([circle(50, 50, 32, PAT.WHITE), circle(50, 50, 18, PAT.WHITE)]) },
      { key: 'B', text: 'Hasil berimpit lengkung C besar dengan lengkung dan segitiga gambar kedua', visualSpec: cell([path('M 64 20 A 30 30 0 1 0 64 80', PAT.WHITE, 2.4), path('M 64 32 A 18 18 0 1 0 64 68', PAT.WHITE, 2.4), poly('58,38 74,50 58,62', PAT.WHITE, 2.2)]) },
      { key: 'C', text: 'Lengkung C menghadap kanan terpotong', visualSpec: cell([path('M 36 20 A 30 30 0 1 1 36 80', PAT.WHITE, 2.4), line(36, 20, 36, 80, 2.4)]) },
      { key: 'D', text: 'Dua segitiga berlawanan', visualSpec: cell([poly('44,34 18,50 44,66', PAT.WHITE), poly('56,34 82,50 56,66', PAT.WHITE)]) },
      { key: 'E', text: 'Lengkung C menghadap kanan dengan segitiga', visualSpec: cell([path('M 42 20 A 30 30 0 1 1 42 80', PAT.WHITE, 2.4), poly('42,36 62,50 42,64', PAT.WHITE)]) },
    ],
    correctOption: 'B',
    explanation: 'Gambar ketiga adalah hasil berimpitnya gambar pertama (lengkung ganda) dan gambar kedua (lengkung dan sudut kanan).',
    quickTrick: 'Gabungkan seluruh garis gambar kolom 1 dan kolom 2 menjadi satu gambar utuh.',
  },
];
