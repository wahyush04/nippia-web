import {
  arrowLine,
  cell,
  circle,
  ellipse,
  g,
  line,
  PAT,
  path,
  plusCross,
  poly,
  rect,
  regularPoly,
  sectorPath,
  txt,
  type CellSpec,
} from './figural-helpers.js';
import type { PdfFiguralQuestionDef } from './pdf-matriks-data.js';

const ana = (pairA: CellSpec[], pairB: CellSpec[]) => ({ kind: 'analogy', pairA, pairB });

export const PDF_ANALOGI_30: PdfFiguralQuestionDef[] = [
  {
    num: 1, kind: 'analogy', difficulty: 'EASY', subtopic: 'Analogi Jumlah Titik Sudut (Latihan 6 #1)',
    stem: 'Perhatikan perubahan jumlah titik sudut dari gambar pertama ke gambar kedua, lalu tentukan pasangan yang tepat untuk gambar ketiga.',
    visualSpec: ana(
      [cell([poly('62,16 62,84 28,84', PAT.WHITE)]), cell([rect(28, 16, 44, 68, PAT.WHITE)])],
      [cell([poly('20,24 52,24 80,76 28,76', PAT.WHITE)])],
    ),
    options: [
      { key: 'A', text: 'Segilima beraturan (5 titik sudut)', visualSpec: cell([regularPoly(50, 50, 34, 5, PAT.WHITE)]) },
      { key: 'B', text: 'Setengah kapsul tegak', visualSpec: cell([path('M 30 18 L 56 18 A 20 32 0 0 1 56 82 L 30 82 Z', PAT.WHITE)]) },
      { key: 'C', text: 'Persegi (4 titik sudut)', visualSpec: cell([rect(20, 20, 60, 60, PAT.WHITE)]) },
      { key: 'D', text: 'Segilima tidak beraturan sisi tegak', visualSpec: cell([poly('24,20 68,20 78,42 78,76 24,76', PAT.WHITE)]) },
      { key: 'E', text: 'Segienam (6 titik sudut)', visualSpec: cell([regularPoly(50, 50, 34, 6, PAT.WHITE)]) },
    ],
    correctOption: 'A',
    explanation: 'Jumlah titik sudut bertambah +1: 3 titik sudut → 4 titik sudut, sehingga 4 titik sudut berpasangan dengan bangun 5 titik sudut (A).',
    quickTrick: 'Hitung titik sudut: 3→4, maka 4→5!',
  },
  {
    num: 2, kind: 'analogy', difficulty: 'EASY', subtopic: 'Analogi Rotasi 90° Searah Jarum Jam (Latihan 6 #2)',
    stem: 'Tentukan gambar keempat yang memiliki hubungan rotasi sama dengan pasangan pertama.',
    visualSpec: ana(
      [cell([poly('38,16 64,16 58,84 32,84', PAT.WHITE)]), cell([poly('16,32 84,40 84,66 16,58', PAT.WHITE)])],
      [cell([ellipse(50, 50, 18, 34, PAT.WHITE)])],
    ),
    options: [
      { key: 'A', text: 'Trapesium mendatar', visualSpec: cell([poly('16,34 84,42 84,68 16,60', PAT.WHITE)]) },
      { key: 'B', text: 'Elips tegak', visualSpec: cell([ellipse(50, 50, 18, 34, PAT.WHITE)]) },
      { key: 'C', text: 'Persegi panjang miring', visualSpec: cell([poly('16,32 84,42 84,68 16,58', PAT.WHITE)]) },
      { key: 'D', text: 'Elips tidur/mendatar (rotasi 90°)', visualSpec: cell([ellipse(50, 50, 34, 18, PAT.WHITE)]) },
      { key: 'E', text: 'Persegi panjang tegak', visualSpec: cell([rect(36, 16, 28, 68, PAT.WHITE)]) },
    ],
    correctOption: 'D',
    explanation: 'Gambar pertama diputar 90° searah jarum jam menjadi mendatar. Elips tegak diputar 90° menjadi elips tidur (D).',
    quickTrick: 'Tegak → Tidur (rotasi 90°).',
  },
  {
    num: 3, kind: 'analogy', difficulty: 'EASY', subtopic: 'Analogi Rotasi Huruf 180° (Latihan 6 #3)',
    stem: 'Berdasarkan transformasi pasangan pertama, tentukan gambar keempat.',
    visualSpec: ana(
      [cell([path('M 66 24 A 28 28 0 1 0 66 76', PAT.NONE, 4)]), cell([path('M 34 24 A 28 28 0 1 1 34 76', PAT.NONE, 4)])],
      [cell([path('M 70 22 L 32 22 L 32 78 L 70 78 M 32 50 L 64 50', PAT.NONE, 4)])],
    ),
    options: [
      { key: 'A', text: 'Bentuk menghadap atas', visualSpec: cell([path('M 22 30 L 22 70 L 78 70 L 78 30 M 50 70 L 50 36', PAT.NONE, 4)]) },
      { key: 'B', text: 'Bentuk menghadap bawah', visualSpec: cell([path('M 22 70 L 22 30 L 78 30 L 78 70 M 50 30 L 50 64', PAT.NONE, 4)]) },
      { key: 'C', text: 'Bentuk E diputar 180° menghadap kiri (∃)', visualSpec: cell([path('M 30 22 L 68 22 L 68 78 L 30 78 M 68 50 L 36 50', PAT.NONE, 4)]) },
      { key: 'D', text: 'Bentuk E tetap menghadap kanan', visualSpec: cell([path('M 70 22 L 32 22 L 32 78 L 70 78 M 32 50 L 64 50', PAT.NONE, 4)]) },
      { key: 'E', text: 'Bentuk E miring 45°', visualSpec: cell([path('M 70 22 L 32 22 L 32 78 L 70 78 M 32 50 L 64 50', PAT.NONE, 4)], -45) },
    ],
    correctOption: 'C',
    explanation: 'Gambar pertama diputar 180°, sehingga huruf E yang menghadap kanan berubah menjadi menghadap kiri (C).',
    quickTrick: 'Rotasi 180° membalik arah kanan ↔ kiri.',
  },
  {
    num: 4, kind: 'analogy', difficulty: 'EASY', subtopic: 'Analogi Lanjutan Pergerakan Garis (Latihan 6 #4)',
    stem: 'Perhatikan pergeseran garis dan kotak kecil dari tiga gambar pertama, lalu tentukan kelanjutan untuk gambar ke-4 pasangan kedua.',
    visualSpec: ana(
      [
        cell([rect(24, 24, 52, 52, PAT.WHITE), rect(42, 42, 16, 16, PAT.BLACK), line(50, 42, 76, 24, 2.2)]),
        cell([rect(24, 24, 52, 52, PAT.WHITE), rect(42, 42, 16, 16, PAT.BLACK), line(58, 50, 86, 50, 2.2)]),
        cell([rect(24, 24, 52, 52, PAT.WHITE), rect(42, 42, 16, 16, PAT.BLACK), line(58, 58, 84, 84, 2.2)]),
      ],
      [
        cell([circle(50, 50, 32, PAT.WHITE), rect(43, 43, 14, 14, PAT.BLACK), line(50, 18, 50, 43, 2.2)]),
        cell([circle(50, 50, 32, PAT.WHITE), rect(43, 43, 14, 14, PAT.BLACK), line(57, 50, 82, 50, 2.2)]),
        cell([circle(50, 50, 32, PAT.WHITE), rect(43, 43, 14, 14, PAT.BLACK), line(50, 57, 50, 82, 2.2)]),
      ],
    ),
    options: [
      { key: 'A', text: 'Garis menghadap kiri (pukul 9)', visualSpec: cell([circle(50, 50, 32, PAT.WHITE), rect(43, 43, 14, 14, PAT.BLACK), line(18, 50, 43, 50, 2.2)]) },
      { key: 'B', text: 'Garis ke kiri-atas/kiri melanjutkan putaran', visualSpec: cell([circle(50, 50, 32, PAT.WHITE), rect(43, 43, 14, 14, PAT.BLACK), line(18, 50, 43, 50, 2.2), line(50, 18, 50, 18, 1)]) },
      { key: 'C', text: 'Garis miring ke kiri atas', visualSpec: cell([circle(50, 50, 32, PAT.WHITE), rect(43, 43, 14, 14, PAT.BLACK), line(26, 26, 43, 43, 2.2)]) },
      { key: 'D', text: 'Garis ke atas', visualSpec: cell([circle(50, 50, 32, PAT.WHITE), rect(43, 43, 14, 14, PAT.BLACK), line(50, 18, 50, 43, 2.2)]) },
      { key: 'E', text: 'Garis ke kanan bawah', visualSpec: cell([circle(50, 50, 32, PAT.WHITE), rect(43, 43, 14, 14, PAT.BLACK), line(57, 57, 74, 74, 2.2)]) },
    ],
    correctOption: 'B',
    explanation: 'Garis berputar searah jarum jam 90° setiap langkah: atas → kanan → bawah → kiri (B).',
    quickTrick: 'Lacak arah jarum: 12 → 3 → 6 → 9.',
  },
  {
    num: 5, kind: 'analogy', difficulty: 'EASY', subtopic: 'Analogi Pencerminan Vertikal (Latihan 6 #5)',
    stem: 'Tentukan hasil transformasi gambar ketiga menggunakan aturan pencerminan pasangan pertama.',
    visualSpec: ana(
      [cell([poly('20,30 68,50 20,70 40,50', PAT.WHITE)]), cell([poly('80,30 32,50 80,70 60,50', PAT.WHITE)])],
      [cell([poly('18,68 58,20 82,42 52,72', PAT.WHITE), line(58, 20, 52, 72, 1.8), line(18, 68, 82, 42, 1.8)])],
    ),
    options: [
      { key: 'A', text: 'Bangun tegak tanpa rotasi cermin', visualSpec: cell([poly('50,14 68,54 50,86 32,54', PAT.WHITE), line(50, 14, 50, 86, 1.8)]) },
      { key: 'B', text: 'Bangun miring ke kanan atas', visualSpec: cell([poly('20,76 54,24 84,36 62,76', PAT.WHITE), line(54, 24, 62, 76, 1.8)]) },
      { key: 'C', text: 'Bangun horizontal simetris', visualSpec: cell([poly('16,50 64,28 86,50 64,72', PAT.WHITE), line(16, 50, 86, 50, 1.8)]) },
      { key: 'D', text: 'Bangun terbalik menghadap kiri atas', visualSpec: cell([poly('28,22 66,30 78,78 38,62', PAT.WHITE), line(28, 22, 78, 78, 1.8)]) },
      { key: 'E', text: 'Hasil pencerminan vertikal ke atas', visualSpec: cell([poly('18,32 58,80 82,58 52,28', PAT.WHITE), line(58, 80, 52, 28, 1.8), line(18, 32, 82, 58, 1.8)]) },
    ],
    correctOption: 'E',
    explanation: 'Gambar dicerminkan ke atas (pencerminan sumbu horizontal), membalik bagian atas-bawah secara simetris (E).',
    quickTrick: 'Bayangkan cermin datar diletakkan tepat di atas gambar ke-3.',
  },
  {
    num: 6, kind: 'analogy', difficulty: 'MEDIUM', subtopic: 'Analogi Rotasi Label Sudut A-B-C-D (Latihan 6 #6)',
    stem: 'Perhatikan rotasi bangun sekaligus perpindahan huruf label A dan B pada pasangan pertama, lalu terapkan pada gambar ketiga.',
    visualSpec: ana(
      [
        cell([rect(36, 28, 28, 44, PAT.WHITE), rect(45, 40, 10, 20, PAT.WHITE), txt(28, 24, 'A', 11), txt(72, 24, 'B', 11), txt(72, 76, 'C', 11), txt(28, 76, 'D', 11)]),
        cell([rect(28, 36, 44, 28, PAT.WHITE), rect(40, 45, 20, 10, PAT.WHITE), txt(24, 72, 'A', 11), txt(24, 28, 'B', 11), txt(76, 28, 'C', 11), txt(76, 72, 'D', 11)]),
      ],
      [
        cell([circle(44, 44, 24, PAT.WHITE), circle(44, 44, 11, PAT.WHITE), line(62, 62, 78, 78, 2.5), txt(74, 46, 'B', 11), txt(44, 76, 'A', 11)]),
      ],
    ),
    options: [
      { key: 'A', text: 'Tangkai di kiri bawah dengan label A dan B berotasi -90°', visualSpec: cell([circle(56, 44, 24, PAT.WHITE), circle(56, 44, 11, PAT.WHITE), line(38, 62, 22, 78, 2.5), txt(72, 74, 'A', 11), txt(48, 20, 'B', 11)]) },
      { key: 'B', text: 'Tangkai di kanan atas', visualSpec: cell([circle(44, 56, 24, PAT.WHITE), circle(44, 56, 11, PAT.WHITE), line(62, 38, 78, 22, 2.5), txt(78, 42, 'A', 11), txt(52, 78, 'B', 11)]) },
      { key: 'C', text: 'Tangkai di kanan bawah', visualSpec: cell([circle(44, 44, 24, PAT.WHITE), circle(44, 44, 11, PAT.WHITE), line(62, 62, 78, 78, 2.5), txt(24, 52, 'B', 11), txt(48, 78, 'A', 11)]) },
      { key: 'D', text: 'Tangkai di kiri atas', visualSpec: cell([circle(56, 56, 24, PAT.WHITE), circle(56, 56, 11, PAT.WHITE), line(38, 38, 22, 22, 2.5), txt(26, 44, 'A', 11), txt(56, 24, 'B', 11)]) },
      { key: 'E', text: 'Tangkai di kiri atas dengan B di atas', visualSpec: cell([circle(44, 56, 24, PAT.WHITE), circle(44, 56, 11, PAT.WHITE), line(26, 38, 14, 24, 2.5), txt(24, 50, 'A', 11), txt(44, 24, 'B', 11)]) },
    ],
    correctOption: 'A',
    explanation: 'Gambar diputar 90° berlawanan arah jarum jam sehingga seluruh bangun beserta label huruf ikut bergeser -90° (A).',
    quickTrick: 'Putar gambar ke-3 berlawanan arah jarum jam 90°.',
  },
  {
    num: 7, kind: 'analogy', difficulty: 'MEDIUM', subtopic: 'Analogi Rotasi Berurutan Sudut A-F (Latihan 6 #7)',
    stem: 'Amati rotasi bangun bersudut A–F pada tiga gambar pertama, lalu tentukan gambar keempat.',
    visualSpec: ana(
      [
        cell([poly('30,22 72,22 52,44 72,72 30,72', PAT.WHITE), txt(24, 16, 'A', 10), txt(76, 16, 'B', 10), txt(60, 44, 'C', 10), txt(76, 76, 'D', 10)]),
        cell([poly('30,22 72,22 52,44 72,72 30,72', PAT.WHITE), txt(24, 16, 'A', 10), txt(76, 16, 'B', 10), txt(64, 48, 'C', 10), txt(30, 82, 'D', 10)]),
        cell([poly('30,22 72,72 52,44 30,72', PAT.WHITE), txt(24, 16, 'A', 10), txt(76, 16, 'B', 10), txt(60, 44, 'C', 10), txt(30, 82, 'D', 10)]),
      ],
      [cell([poly('30,22 72,22 52,44 72,72 30,72', PAT.WHITE), txt(24, 16, 'A', 10), txt(76, 16, 'B', 10), txt(60, 44, 'C', 10), txt(76, 76, 'D', 10)])],
    ),
    options: [
      { key: 'A', text: 'Segitiga besar menghadap atas dengan label A-B-C-D', visualSpec: cell([poly('20,76 50,24 80,76 50,58', PAT.WHITE), txt(50, 14, 'A', 10), txt(24, 50, 'B', 10), txt(78, 76, 'C', 10), txt(16, 78, 'D', 10)]) },
      { key: 'B', text: 'Hasil rotasi 90° berlawanan jarum jam dengan urutan sudut konsisten', visualSpec: cell([poly('20,24 20,76 52,48 80,48', PAT.WHITE), txt(20, 14, 'A', 10), txt(52, 36, 'B', 10), txt(82, 56, 'C', 10), txt(20, 86, 'D', 10)]) },
      { key: 'C', text: 'Segitiga menghadap kanan bawah', visualSpec: cell([poly('24,68 74,26 74,76', PAT.WHITE), txt(74, 16, 'A', 10), txt(18, 72, 'D', 10)]) },
      { key: 'D', text: 'Sudut C di kiri dan B di bawah', visualSpec: cell([poly('24,26 52,50 76,26 76,76 24,76', PAT.WHITE), txt(78, 16, 'A', 10), txt(78, 84, 'B', 10)]) },
      { key: 'E', text: 'Sudut A di kanan atas, B di kanan bawah', visualSpec: cell([poly('20,44 78,24 78,76 50,50', PAT.WHITE), txt(80, 14, 'A', 10), txt(80, 84, 'B', 10)]) },
    ],
    correctOption: 'B',
    explanation: 'Gambar dirotasi 90° berlawanan arah jarum jam lalu penamaan sudut A, B, C, D mengikuti urutan rotasinya (B).',
    quickTrick: 'Putar gambar 90° berlawanan arah jarum jam dan cek urutan huruf A→B→C→D.',
  },
  {
    num: 8, kind: 'analogy', difficulty: 'MEDIUM', subtopic: 'Analogi Rotasi Bingkai Luar, Isi Tetap (Latihan 6 #8)',
    stem: 'Perhatikan bagian mana yang berputar dan bagian mana yang tetap diam pada gambar ketiga untuk menemukan gambar keempat.',
    visualSpec: ana(
      [
        cell([rect(22, 22, 56, 56, PAT.WHITE), path('M 50 50 m -16 0 a 16 16 0 1 0 32 0 a 12 12 0 1 0 -24 0 a 8 8 0 1 0 16 0', PAT.NONE, 2)]),
        cell([rect(22, 22, 56, 56, PAT.WHITE), path('M 50 50 m -16 0 a 16 16 0 1 0 32 0 a 12 12 0 1 0 -24 0 a 8 8 0 1 0 16 0', PAT.NONE, 2)]),
      ],
      [
        cell([poly('22,30 74,18 82,76 18,74', PAT.WHITE), path('M 50 50 m -16 0 a 16 16 0 1 0 32 0 a 12 12 0 1 0 -24 0 a 8 8 0 1 0 16 0', PAT.NONE, 2)]),
      ],
    ),
    options: [
      { key: 'A', text: 'Bingkai menghadap kiri-bawah', visualSpec: cell([poly('18,22 76,30 74,82 30,74', PAT.WHITE), path('M 50 50 m -16 0 a 16 16 0 1 0 32 0 a 12 12 0 1 0 -24 0 a 8 8 0 1 0 16 0', PAT.NONE, 2)]) },
      { key: 'B', text: 'Bingkai datar dengan spiral', visualSpec: cell([rect(18, 28, 64, 44, PAT.WHITE), path('M 50 50 m -16 0 a 16 16 0 1 0 32 0 a 12 12 0 1 0 -24 0 a 8 8 0 1 0 16 0', PAT.NONE, 2)]) },
      { key: 'C', text: 'Bingkai trapesium tegak', visualSpec: cell([poly('26,20 74,24 80,78 20,74', PAT.WHITE), path('M 50 50 m -16 0 a 16 16 0 1 0 32 0 a 12 12 0 1 0 -24 0 a 8 8 0 1 0 16 0', PAT.NONE, 2)]) },
      { key: 'D', text: 'Bingkai miring kanan', visualSpec: cell([poly('30,18 82,28 70,80 18,72', PAT.WHITE), path('M 50 50 m -16 0 a 16 16 0 1 0 32 0 a 12 12 0 1 0 -24 0 a 8 8 0 1 0 16 0', PAT.NONE, 2)]) },
      { key: 'E', text: 'Bingkai luar diputar 90° berlawanan arah jarum jam, spiral tetap', visualSpec: cell([poly('20,24 76,18 72,82 26,74', PAT.WHITE, 2.4), path('M 50 50 m -16 0 a 16 16 0 1 0 32 0 a 12 12 0 1 0 -24 0 a 8 8 0 1 0 16 0', PAT.NONE, 2)]) },
    ],
    correctOption: 'E',
    explanation: 'Gambar luar dirotasi 90° berlawanan arah jarum jam sedangkan gambar spiral di dalamnya tetap tidak ikut berotasi (E).',
    quickTrick: 'Putar bingkai luar -90°, biarkan spiral tengah tetap sama.',
  },
  {
    num: 9, kind: 'analogy', difficulty: 'MEDIUM', subtopic: 'Analogi Rotasi & Pergerakan Blok Hitam (Latihan 6 #9)',
    stem: 'Tentukan gambar keempat yang sesuai dengan pola transformasi pasangan pertama.',
    visualSpec: ana(
      [
        cell([rect(12, 34, 14, 32, PAT.BLACK), poly('26,34 86,50 26,66', PAT.WHITE)]),
        cell([rect(34, 74, 32, 14, PAT.BLACK), poly('34,74 50,14 66,74', PAT.WHITE)]),
      ],
      [
        cell([rect(36, 24, 28, 52, PAT.WHITE), rect(43, 14, 14, 10, PAT.BLACK), rect(43, 76, 14, 10, PAT.WHITE)]),
      ],
    ),
    options: [
      { key: 'A', text: 'Diputar -90° menjadi mendatar dengan blok hitam pindah ke ujung lain', visualSpec: cell([rect(24, 36, 52, 28, PAT.WHITE), rect(12, 43, 12, 14, PAT.WHITE), rect(76, 43, 12, 14, PAT.BLACK)]) },
      { key: 'B', text: 'Miring ke kanan atas', visualSpec: cell([rect(24, 36, 52, 28, PAT.WHITE), rect(12, 43, 12, 14, PAT.BLACK)], -25) },
      { key: 'C', text: 'Miring ke kiri atas', visualSpec: cell([rect(24, 36, 52, 28, PAT.WHITE), rect(76, 43, 12, 14, PAT.BLACK)], 25) },
      { key: 'D', text: 'Mendatar putih semua', visualSpec: cell([rect(24, 36, 52, 28, PAT.WHITE), rect(12, 43, 12, 14, PAT.WHITE), rect(76, 43, 12, 14, PAT.WHITE)]) },
      { key: 'E', text: 'Tetap tegak dengan blok hitam di bawah', visualSpec: cell([rect(36, 24, 28, 52, PAT.WHITE), rect(43, 14, 14, 10, PAT.WHITE), rect(43, 76, 14, 10, PAT.BLACK)]) },
    ],
    correctOption: 'A',
    explanation: 'Gambar luar diputar 90° berlawanan arah jarum jam lalu ujung berblok hitam berpindah ke ujung seberangnya (A).',
    quickTrick: 'Tegak → Mendatar (-90°) dan ujung hitam pindah ke sisi kanan.',
  },
  {
    num: 10, kind: 'analogy', difficulty: 'HARD', subtopic: 'Analogi Rotasi + Tukar Posisi + Inversi (Latihan 6 #10)',
    stem: 'Perhatikan rotasi 90°, pertukaran posisi segitiga & persegi, serta pembalikan segitiga untuk menemukan gambar keempat.',
    visualSpec: ana(
      [
        cell([circle(32, 32, 10, PAT.WHITE), line(50, 14, 50, 86, 2.4), rect(22, 54, 16, 16, PAT.WHITE), poly('60,54 78,54 69,72', PAT.WHITE)]),
        cell([circle(50, 26, 10, PAT.WHITE), line(18, 44, 82, 44, 2.4), poly('28,54 44,54 36,72', PAT.WHITE), rect(56, 54, 16, 16, PAT.WHITE)]),
      ],
      [
        cell([circle(50, 26, 10, PAT.WHITE), line(18, 44, 82, 44, 2.4), rect(30, 54, 16, 16, PAT.WHITE), poly('56,72 72,72 64,54', PAT.WHITE)]),
      ],
    ),
    options: [
      { key: 'A', text: 'Garis datar dengan segitiga menghadap bawah', visualSpec: cell([circle(50, 26, 10, PAT.WHITE), line(18, 44, 82, 44, 2.4), rect(30, 54, 16, 16, PAT.WHITE), poly('56,54 72,54 64,72', PAT.WHITE)]) },
      { key: 'B', text: 'Garis datar dengan segitiga di kiri', visualSpec: cell([circle(50, 26, 10, PAT.WHITE), line(18, 44, 82, 44, 2.4), poly('28,72 44,72 36,54', PAT.WHITE), rect(56, 54, 16, 16, PAT.WHITE)]) },
      { key: 'C', text: 'Diputar 90° searah jarum jam, tukar posisi persegi-segitiga & balik segitiga', visualSpec: cell([line(50, 16, 50, 84, 2.4), circle(72, 50, 10, PAT.WHITE), rect(26, 56, 16, 16, PAT.WHITE), poly('26,30 42,30 34,46', PAT.WHITE)]) },
      { key: 'D', text: 'Diputar 90° dengan segitiga tidak terbalik', visualSpec: cell([line(50, 16, 50, 84, 2.4), circle(72, 50, 10, PAT.WHITE), rect(26, 28, 16, 16, PAT.WHITE), poly('26,72 42,72 34,56', PAT.WHITE)]) },
      { key: 'E', text: 'Diputar -90° dengan lingkaran di kiri', visualSpec: cell([line(50, 16, 50, 84, 2.4), circle(28, 50, 10, PAT.WHITE), rect(58, 28, 16, 16, PAT.WHITE), poly('58,72 74,72 66,56', PAT.WHITE)]) },
    ],
    correctOption: 'C',
    explanation: 'Pertama gambar diputar 90° searah jarum jam, lalu posisi segitiga dan persegi ditukarkan, dan segitiga diputar 180° (C).',
    quickTrick: 'Tiga langkah: Putar +90° → Tukar persegi & segitiga → Balik segitiga 180°.',
  },
  {
    num: 11, kind: 'analogy', difficulty: 'MEDIUM', subtopic: 'Analogi Rotasi 45° & Balik Arah Panah (Latihan 6 #11)',
    stem: 'Perhatikan rotasi kotak luar dan arah panah di dalamnya untuk menemukan gambar keempat.',
    visualSpec: ana(
      [
        cell([rect(24, 26, 52, 48, PAT.WHITE), arrowLine(34, 50, 66, 50, 3.5, 9), txt(28, 32, 'C', 9), txt(72, 32, 'D', 9)]),
        cell([regularPoly(50, 50, 36, 4, PAT.WHITE, 0), arrowLine(66, 50, 34, 50, 3.5, 9), txt(50, 22, 'C', 9), txt(76, 50, 'D', 9)]),
      ],
      [
        cell([regularPoly(50, 50, 36, 4, PAT.WHITE, 0), arrowLine(34, 50, 66, 50, 3.5, 9), txt(50, 22, 'M', 9), txt(24, 50, 'L', 9)]),
      ],
    ),
    options: [
      { key: 'A', text: 'Belah ketupat miring dengan panah ke kanan', visualSpec: cell([regularPoly(50, 50, 36, 4, PAT.WHITE, 0), arrowLine(34, 50, 66, 50, 3.5, 9)]) },
      { key: 'B', text: 'Belah ketupat dengan panah ke kiri', visualSpec: cell([regularPoly(50, 50, 36, 4, PAT.WHITE, 0), arrowLine(66, 50, 34, 50, 3.5, 9)]) },
      { key: 'C', text: 'Persegi tegak dengan M di kiri', visualSpec: cell([rect(22, 22, 56, 56, PAT.WHITE), arrowLine(66, 50, 34, 50, 3.5, 9), txt(30, 30, 'L', 9), txt(70, 30, 'M', 9)]) },
      { key: 'D', text: 'Persegi tegak dengan panah ke kanan', visualSpec: cell([rect(22, 22, 56, 56, PAT.WHITE), arrowLine(34, 50, 66, 50, 3.5, 9)]) },
      { key: 'E', text: 'Persegi tegak (rotasi 45° searah jarum jam) dengan panah berbalik & M-L sesuai rotasi', visualSpec: cell([rect(22, 22, 56, 56, PAT.WHITE), arrowLine(66, 50, 34, 50, 3.5, 9), txt(30, 30, 'M', 9), txt(70, 30, 'L', 9)]) },
    ],
    correctOption: 'E',
    explanation: 'Bingkai luar diputar 45° searah jarum jam (belah ketupat menjadi persegi tegak), dan arah panah di dalamnya dibalik berlawanan arah (E).',
    quickTrick: 'Belah ketupat +45° = Persegi tegak, lalu balik arah anak panah.',
  },
  {
    num: 12, kind: 'analogy', difficulty: 'EASY', subtopic: 'Analogi Rotasi 45° & Pengurangan Titik (Latihan 6 #12)',
    stem: 'Tentukan gambar keempat berdasarkan rotasi kotak dan perubahan jumlah titik hitam.',
    visualSpec: ana(
      [
        cell([rect(24, 24, 52, 52, PAT.WHITE), circle(36, 36, 5, PAT.BLACK), circle(50, 50, 5, PAT.BLACK), circle(64, 64, 5, PAT.BLACK)]),
        cell([regularPoly(50, 50, 36, 4, PAT.WHITE, 0), circle(50, 50, 5, PAT.BLACK)]),
      ],
      [
        cell([rect(24, 24, 52, 52, PAT.WHITE), circle(36, 36, 5, PAT.BLACK), circle(64, 36, 5, PAT.BLACK), circle(50, 50, 5, PAT.BLACK), circle(36, 64, 5, PAT.BLACK), circle(64, 64, 5, PAT.BLACK)]),
      ],
    ),
    options: [
      { key: 'A', text: 'Belah ketupat berisi 2 titik', visualSpec: cell([regularPoly(50, 50, 36, 4, PAT.WHITE, 0), circle(40, 50, 5, PAT.BLACK), circle(60, 50, 5, PAT.BLACK)]) },
      { key: 'B', text: 'Persegi berisi 4 titik', visualSpec: cell([rect(24, 24, 52, 52, PAT.WHITE), circle(38, 38, 5, PAT.BLACK), circle(62, 38, 5, PAT.BLACK), circle(38, 62, 5, PAT.BLACK), circle(62, 62, 5, PAT.BLACK)]) },
      { key: 'C', text: 'Belah ketupat berisi 3 titik (5 - 2 = 3)', visualSpec: cell([regularPoly(50, 50, 36, 4, PAT.WHITE, 0), circle(50, 36, 5, PAT.BLACK), circle(50, 50, 5, PAT.BLACK), circle(50, 64, 5, PAT.BLACK)]) },
      { key: 'D', text: 'Belah ketupat berisi 4 titik', visualSpec: cell([regularPoly(50, 50, 36, 4, PAT.WHITE, 0), circle(38, 42, 5, PAT.BLACK), circle(62, 42, 5, PAT.BLACK), circle(50, 58, 5, PAT.BLACK), circle(50, 28, 5, PAT.BLACK)]) },
      { key: 'E', text: 'Belah ketupat berisi 5 titik', visualSpec: cell([regularPoly(50, 50, 36, 4, PAT.WHITE, 0), circle(50, 50, 5, PAT.BLACK), circle(36, 50, 5, PAT.BLACK), circle(64, 50, 5, PAT.BLACK), circle(50, 36, 5, PAT.BLACK), circle(50, 64, 5, PAT.BLACK)]) },
    ],
    correctOption: 'C',
    explanation: 'Kotak dirotasi 45° menjadi belah ketupat, kemudian jumlah bulatan hitam berkurang 2 buah (3→1, maka 5→3) yaitu pilihan C.',
    quickTrick: 'Kotak → Belah ketupat (45°) dan kurangi 2 titik (5 - 2 = 3).',
  },
  {
    num: 13, kind: 'analogy', difficulty: 'HARD', subtopic: 'Analogi Rotasi + Tukar & Cermin Simbol (Latihan 6 #13)',
    stem: 'Amati bagaimana simbol dan garis paralel pada pasangan pertama berubah menjadi pasangan kedua, lalu terapkan pada gambar ketiga.',
    visualSpec: ana(
      [
        cell([line(44, 16, 44, 84, 2.4), line(56, 16, 56, 84, 2.4), txt(24, 28, 'Y', 16), rect(16, 58, 16, 16, PAT.WHITE), circle(76, 28, 9, PAT.WHITE), poly('68,58 84,66 68,74', PAT.BLACK)]),
        cell([line(16, 44, 84, 44, 2.4), line(16, 56, 84, 56, 2.4), txt(28, 24, 'Y', 16), rect(64, 16, 16, 16, PAT.WHITE), poly('42,66 58,66 50,82', PAT.BLACK), line(18, 74, 34, 74, 2.4)]),
      ],
      [
        cell([line(44, 16, 44, 84, 2.4), line(56, 16, 56, 84, 2.4), txt(24, 28, 'Y', 16), txt(24, 70, '+', 18), circle(74, 22, 3.5, PAT.BLACK), circle(74, 34, 3.5, PAT.BLACK), line(74, 56, 74, 78, 2.4)]),
      ],
    ),
    options: [
      { key: 'A', text: 'Simbol atas terbalik dan + di kanan tanpa Y', visualSpec: cell([line(16, 44, 84, 44, 2.4), line(16, 56, 84, 56, 2.4), txt(30, 24, '人', 15), txt(64, 24, '+', 17), circle(36, 72, 3.5, PAT.BLACK), circle(48, 72, 3.5, PAT.BLACK), line(18, 72, 30, 72, 2.4)]) },
      { key: 'B', text: 'Titik dua di atas dan Y di bawah', visualSpec: cell([line(16, 44, 84, 44, 2.4), line(16, 56, 84, 56, 2.4), line(28, 24, 44, 24, 2.4), circle(64, 20, 3.5, PAT.BLACK), circle(64, 28, 3.5, PAT.BLACK), txt(32, 74, 'Y', 15), txt(64, 74, '+', 16)]) },
      { key: 'C', text: 'Y di kiri atas dan + di kanan atas', visualSpec: cell([line(16, 44, 84, 44, 2.4), line(16, 56, 84, 56, 2.4), txt(28, 24, 'Y', 16), txt(68, 24, '+', 17), circle(36, 74, 3.5, PAT.BLACK), circle(48, 74, 3.5, PAT.BLACK), line(62, 74, 78, 74, 2.4)]) },
      { key: 'D', text: '+ di kiri atas dan Y terbalik di kanan atas', visualSpec: cell([line(16, 44, 84, 44, 2.4), line(16, 56, 84, 56, 2.4), txt(28, 24, '+', 17), txt(66, 24, '人', 15), line(24, 74, 40, 74, 2.4), circle(60, 74, 3.5, PAT.BLACK), circle(72, 74, 3.5, PAT.BLACK)]) },
      { key: 'E', text: 'Diputar 90° searah jarum jam, dua simbol atas bertukar & dicerminkan ke atas (Y tegak di kiri, + di kanan)', visualSpec: cell([line(16, 44, 84, 44, 2.4), line(16, 56, 84, 56, 2.4), txt(30, 24, 'Y', 16), txt(68, 24, '+', 17), line(24, 74, 42, 74, 2.4), circle(62, 74, 3.5, PAT.BLACK), circle(74, 74, 3.5, PAT.BLACK)]) },
    ],
    correctOption: 'E',
    explanation: 'Gambar diputar 90° searah jarum jam, lalu dua simbol bagian atas bertukar posisi dan dicerminkan ke atas (E).',
    quickTrick: 'Putar +90° (garis jadi mendatar) lalu cerminkan simbol atas.',
  },
  {
    num: 14, kind: 'analogy', difficulty: 'MEDIUM', subtopic: 'Analogi Rotasi 90° & Perubahan Ujung Kait (Latihan 6 #14)',
    stem: 'Perhatikan bagaimana ujung garis lurus dan lengkung berubah pada pasangan pertama, lalu terapkan pada gambar ketiga.',
    visualSpec: ana(
      [
        cell([path('M 24 22 L 50 22 L 50 78 C 50 86 38 86 38 78', PAT.NONE, 2.4)]),
        cell([path('M 20 50 L 76 50 C 86 50 86 34 76 34 C 66 34 66 44 72 44', PAT.NONE, 2.4)]),
      ],
      [
        cell([path('M 22 36 L 60 36 C 68 36 68 24 60 24 C 52 24 52 32 58 32', PAT.NONE, 2.4), line(22, 36, 22, 62, 2.4)]),
      ],
    ),
    options: [
      { key: 'A', text: 'Batang mendatar melengkung ke bawah', visualSpec: cell([path('M 20 26 L 68 26 L 68 72 C 68 82 50 82 50 72', PAT.NONE, 2.4)]) },
      { key: 'B', text: 'Batang tegak dengan kait ke kanan', visualSpec: cell([path('M 48 16 L 48 76 C 48 86 64 86 64 76', PAT.NONE, 2.4)]) },
      { key: 'C', text: 'Batang tegak dengan lengkung ke atas', visualSpec: cell([path('M 50 20 L 50 76 C 50 86 36 86 36 76', PAT.NONE, 2.4), path('M 50 20 C 50 12 62 12 62 20', PAT.NONE, 2.4)]) },
      { key: 'D', text: 'Batang mendatar tanpa rotasi', visualSpec: cell([path('M 24 50 L 74 50 C 84 50 84 36 74 36', PAT.NONE, 2.4)]) },
      { key: 'E', text: 'Diputar 90° searah jarum jam dan ujung tegak lurus berubah jadi lengkung berlawanan arah', visualSpec: cell([path('M 54 20 L 54 78 C 54 86 42 86 42 78', PAT.NONE, 2.4), path('M 54 20 C 54 12 68 12 68 22', PAT.NONE, 2.4)]) },
    ],
    correctOption: 'E',
    explanation: 'Gambar diputar 90° searah jarum jam sehingga batang utama menjadi tegak, kemudian bagian ujung yang tegak lurus berubah menjadi lengkung berlawanan arah (E).',
    quickTrick: 'Putar +90° (jadi tegak) + ubah sudut siku menjadi lengkung.',
  },
  {
    num: 15, kind: 'analogy', difficulty: 'MEDIUM', subtopic: 'Analogi Cermin & Gabung Bertolak Belakang (Latihan 6 #15)',
    stem: 'Tentukan gambar keempat berdasarkan pola pencerminan dan penggabungan bertolak belakang dari pasangan pertama.',
    visualSpec: ana(
      [
        cell([poly('20,24 38,24 38,44 62,44 62,24 80,24 80,76 20,76', PAT.WHITE), line(50, 44, 50, 76, 1.8)]),
        cell([poly('20,26 42,26 42,74 20,74', PAT.WHITE), poly('58,26 80,26 80,74 58,74', PAT.WHITE), line(32, 50, 68, 50, 2)]),
      ],
      [
        cell([poly('30,22 70,22 70,52 50,72 30,52', PAT.WHITE), line(30, 52, 70, 52, 1.8)], 45),
      ],
    ),
    options: [
      { key: 'A', text: 'Dua bangun sejajar sama arah', visualSpec: cell([rect(24, 24, 30, 50, PAT.WHITE), rect(54, 24, 24, 50, PAT.WHITE)], 45) },
      { key: 'B', text: 'Dua persegi berdampingan miring', visualSpec: cell([rect(22, 34, 28, 32, PAT.WHITE), rect(50, 34, 28, 32, PAT.WHITE)], -30) },
      { key: 'C', text: 'Dua belah ketupat bertemu di sudut', visualSpec: cell([regularPoly(34, 50, 18, 4, PAT.WHITE), regularPoly(66, 50, 18, 4, PAT.WHITE)]) },
      { key: 'D', text: 'Dua belah ketupat/segitiga digabung bertolak belakang simetris', visualSpec: cell([regularPoly(34, 50, 20, 4, PAT.WHITE), regularPoly(66, 50, 20, 4, PAT.WHITE), line(34, 30, 34, 70, 1.6)]) },
      { key: 'E', text: 'Dua trapesium saling bertumpuk', visualSpec: cell([poly('20,30 50,30 40,70 20,70', PAT.WHITE), poly('50,30 80,30 80,70 60,70', PAT.WHITE)]) },
    ],
    correctOption: 'D',
    explanation: 'Satu bagian dilepas, bagian yang lain dicerminkan, lalu kedua bagian digabungkan secara bertolak belakang (D).',
    quickTrick: 'Cari dua bagian identik yang menempel bertolak belakang.',
  },
  {
    num: 16, kind: 'analogy', difficulty: 'EASY', subtopic: 'Analogi Pergeseran Sudut Kotak & Lingkaran (Latihan 6 #16)',
    stem: 'Perhatikan pola pergeseran elemen kecil pada tiga gambar pertama, lalu tentukan gambar keempat.',
    visualSpec: ana(
      [
        cell([rect(22, 22, 56, 56, PAT.WHITE), rect(22, 22, 12, 12, PAT.WHITE), circle(28, 28, 2.5, PAT.BLACK)]),
        cell([rect(22, 22, 56, 56, PAT.WHITE), rect(66, 22, 12, 12, PAT.WHITE), circle(72, 28, 2.5, PAT.BLACK)]),
        cell([rect(22, 22, 56, 56, PAT.WHITE), rect(66, 66, 12, 12, PAT.WHITE), circle(72, 72, 2.5, PAT.BLACK)]),
      ],
      [
        cell([circle(50, 50, 30, PAT.WHITE), circle(50, 20, 7, PAT.WHITE), circle(50, 50, 7, PAT.WHITE)]),
        cell([circle(50, 50, 30, PAT.WHITE), circle(80, 50, 7, PAT.WHITE), circle(50, 50, 7, PAT.WHITE)]),
        cell([circle(50, 50, 30, PAT.WHITE), circle(50, 80, 7, PAT.WHITE), circle(50, 50, 7, PAT.WHITE)]),
      ],
    ),
    options: [
      { key: 'A', text: 'Lingkaran kecil di sisi kiri', visualSpec: cell([circle(50, 50, 30, PAT.WHITE), circle(20, 50, 7, PAT.WHITE)]) },
      { key: 'B', text: 'Lingkaran kecil di sisi kanan', visualSpec: cell([circle(50, 50, 30, PAT.WHITE), circle(80, 50, 7, PAT.WHITE)]) },
      { key: 'C', text: 'Lingkaran kecil di sisi bawah', visualSpec: cell([circle(50, 50, 30, PAT.WHITE), circle(50, 80, 7, PAT.WHITE)]) },
      { key: 'D', text: 'Lingkaran kecil di tengah saja', visualSpec: cell([circle(50, 50, 30, PAT.WHITE), circle(50, 50, 7, PAT.WHITE)]) },
      { key: 'E', text: 'Lingkaran kecil di puncak atas dan kiri melanjutkan siklus', visualSpec: cell([circle(50, 50, 30, PAT.WHITE), circle(50, 20, 7, PAT.WHITE), circle(50, 50, 7, PAT.WHITE)]) },
    ],
    correctOption: 'E',
    explanation: 'Elemen kecil bergeser searah jarum jam mengelilingi sisi bangun utama: atas → kanan → bawah → kembali melingkar (E).',
    quickTrick: 'Ikuti arah gerak searah jarum jam: 12 → 3 → 6 → 9/12.',
  },
  {
    num: 17, kind: 'analogy', difficulty: 'MEDIUM', subtopic: 'Analogi Gabung 3 Gambar + Rotasi 45° (Latihan 6 #17)',
    stem: 'Ketiga gambar di sebelah kiri digabungkan lalu diputar sesuai aturan pasangan pertama. Tentukan gambar keempat.',
    visualSpec: ana(
      [
        cell([regularPoly(50, 50, 36, 4, PAT.WHITE, 0), rect(44, 44, 12, 12, PAT.BLACK), line(50, 14, 50, 44, 2)]),
        cell([regularPoly(50, 50, 36, 4, PAT.WHITE, 0), rect(44, 44, 12, 12, PAT.BLACK), line(50, 56, 50, 86, 2)]),
        cell([regularPoly(50, 50, 36, 4, PAT.WHITE, 0), rect(44, 44, 12, 12, PAT.BLACK), line(14, 50, 44, 50, 2)]),
      ],
      [
        cell([circle(50, 50, 34, PAT.WHITE), rect(44, 44, 12, 12, PAT.BLACK), line(50, 16, 50, 44, 2)]),
        cell([circle(50, 50, 34, PAT.WHITE), rect(44, 44, 12, 12, PAT.BLACK), line(50, 56, 50, 84, 2)]),
        cell([circle(50, 50, 34, PAT.WHITE), rect(44, 44, 12, 12, PAT.BLACK), line(16, 50, 44, 50, 2)]),
      ],
    ),
    options: [
      { key: 'A', text: 'Lingkaran dengan garis + dan X lengkap', visualSpec: cell([circle(50, 50, 34, PAT.WHITE), line(16, 50, 84, 50, 2), line(50, 16, 50, 84, 2), line(26, 26, 74, 74, 2)]) },
      { key: 'B', text: 'Lingkaran dengan kotak tengah dan garis tegak', visualSpec: cell([circle(50, 50, 34, PAT.WHITE), rect(44, 44, 12, 12, PAT.BLACK), line(50, 16, 50, 84, 2)]) },
      { key: 'C', text: 'Gabungan ketiga gambar diputar 45° berlawanan jarum jam (X dengan kotak tengah)', visualSpec: cell([circle(50, 50, 34, PAT.WHITE), line(26, 26, 74, 74, 2), line(74, 26, 26, 74, 2), rect(44, 44, 12, 12, PAT.BLACK)]) },
      { key: 'D', text: 'Lingkaran dengan silang dan kotak kosong', visualSpec: cell([circle(50, 50, 34, PAT.WHITE), line(26, 26, 74, 74, 2), rect(42, 42, 16, 16, PAT.WHITE)]) },
      { key: 'E', text: 'Lingkaran dengan tambah (+) dan kotak tengah', visualSpec: cell([circle(50, 50, 34, PAT.WHITE), rect(44, 44, 12, 12, PAT.BLACK), line(16, 50, 84, 50, 2), line(50, 16, 50, 84, 2)]) },
    ],
    correctOption: 'C',
    explanation: 'Ketiga gambar disatukan kemudian hasilnya dirotasi 45° berlawanan arah jarum jam menjadi bentuk silang di dalam lingkaran (C).',
    quickTrick: 'Gabungkan semua garis → putar 45° → garis tegak/datar berubah menjadi silang X!',
  },
  {
    num: 18, kind: 'analogy', difficulty: 'MEDIUM', subtopic: 'Analogi Irisan Tiga Gambar (Latihan 6 #18)',
    stem: 'Apabila tiga gambar pertama digabungkan, bagian lingkaran kecil yang tepat berimpit di posisi sama pada ketiga gambar menjadi hasilnya.',
    visualSpec: ana(
      [
        cell([rect(24, 24, 52, 52, PAT.WHITE), circle(24, 24, 7, PAT.NONE), circle(50, 50, 9, PAT.WHITE), circle(24, 76, 7, PAT.NONE)]),
        cell([rect(24, 24, 52, 52, PAT.WHITE), circle(50, 24, 7, PAT.NONE), circle(50, 50, 9, PAT.WHITE), circle(24, 76, 7, PAT.NONE)]),
        cell([rect(24, 24, 52, 52, PAT.WHITE), circle(24, 24, 7, PAT.NONE), circle(50, 50, 9, PAT.WHITE), circle(76, 24, 7, PAT.NONE)]),
      ],
      [
        cell([regularPoly(50, 50, 34, 4, PAT.WHITE, 0), circle(26, 26, 7, PAT.NONE), circle(50, 50, 9, PAT.WHITE), circle(74, 26, 7, PAT.NONE)]),
        cell([regularPoly(50, 50, 34, 4, PAT.WHITE, 0), circle(50, 16, 7, PAT.NONE), circle(50, 50, 9, PAT.WHITE), circle(74, 26, 7, PAT.NONE)]),
        cell([regularPoly(50, 50, 34, 4, PAT.WHITE, 0), circle(26, 74, 7, PAT.NONE), circle(50, 50, 9, PAT.WHITE), circle(50, 84, 7, PAT.NONE)]),
      ],
    ),
    options: [
      { key: 'A', text: 'Belah ketupat dengan titik kiri & kanan', visualSpec: cell([regularPoly(50, 50, 34, 4, PAT.WHITE, 0), circle(16, 50, 7, PAT.NONE), circle(84, 50, 7, PAT.NONE)]) },
      { key: 'B', text: 'Belah ketupat dengan titik kiri & kanan saja', visualSpec: cell([regularPoly(50, 50, 34, 4, PAT.WHITE, 0), circle(22, 50, 7, PAT.NONE), circle(78, 50, 7, PAT.NONE)]) },
      { key: 'C', text: 'Belah ketupat dengan posisi lingkaran yang berimpit pada ketiganya (sisi kanan)', visualSpec: cell([regularPoly(50, 50, 34, 4, PAT.WHITE, 0), circle(84, 50, 7, PAT.NONE)]) },
      { key: 'D', text: 'Belah ketupat dengan titik bawah', visualSpec: cell([regularPoly(50, 50, 34, 4, PAT.WHITE, 0), circle(50, 84, 7, PAT.NONE)]) },
      { key: 'E', text: 'Belah ketupat dengan titik atas', visualSpec: cell([regularPoly(50, 50, 34, 4, PAT.WHITE, 0), circle(50, 16, 7, PAT.NONE)]) },
    ],
    correctOption: 'C',
    explanation: 'Elemen yang berimpit di posisi yang sama pada ketiga gambar akan bertahan sebagai hasil akhir (C).',
    quickTrick: 'Cari satu titik/lingkaran yang muncul di gambar 1, 2, DAN 3!',
  },
  {
    num: 19, kind: 'analogy', difficulty: 'MEDIUM', subtopic: 'Analogi Irisan Titik Hitam (Latihan 6 #19)',
    stem: 'Gunakan aturan irisan tiga gambar: titik hitam yang selalu muncul di posisi yang sama pada ketiga gambar akan tampil di hasil.',
    visualSpec: ana(
      [
        cell([regularPoly(50, 50, 36, 4, PAT.WHITE, 0), circle(50, 30, 5, PAT.BLACK), circle(34, 56, 5, PAT.BLACK)]),
        cell([regularPoly(50, 50, 36, 4, PAT.WHITE, 0), circle(50, 30, 5, PAT.BLACK), circle(64, 56, 5, PAT.BLACK)]),
        cell([regularPoly(50, 50, 36, 4, PAT.WHITE, 0), circle(50, 30, 5, PAT.BLACK), circle(50, 68, 5, PAT.BLACK)]),
      ],
      [
        cell([circle(50, 50, 34, PAT.WHITE), circle(34, 38, 5, PAT.BLACK), circle(66, 38, 5, PAT.BLACK), circle(50, 54, 5, PAT.BLACK)]),
        cell([circle(50, 50, 34, PAT.WHITE), circle(50, 30, 5, PAT.BLACK), circle(50, 54, 5, PAT.BLACK), circle(66, 66, 5, PAT.BLACK)]),
        cell([circle(50, 50, 34, PAT.WHITE), circle(34, 62, 5, PAT.BLACK), circle(50, 54, 5, PAT.BLACK), circle(66, 46, 5, PAT.BLACK)]),
      ],
    ),
    options: [
      { key: 'A', text: 'Lingkaran dengan titik atas kanan', visualSpec: cell([circle(50, 50, 34, PAT.WHITE), circle(66, 36, 5, PAT.BLACK)]) },
      { key: 'B', text: 'Lingkaran dengan titik kiri atas', visualSpec: cell([circle(50, 50, 34, PAT.WHITE), circle(34, 34, 5, PAT.BLACK)]) },
      { key: 'C', text: 'Lingkaran dengan titik bawah', visualSpec: cell([circle(50, 50, 34, PAT.WHITE), circle(50, 70, 5, PAT.BLACK)]) },
      { key: 'D', text: 'Lingkaran dengan titik atas tengah', visualSpec: cell([circle(50, 50, 34, PAT.WHITE), circle(50, 36, 5, PAT.BLACK)]) },
      { key: 'E', text: 'Lingkaran dengan satu titik hitam di posisi berimpit (tengah)', visualSpec: cell([circle(50, 50, 34, PAT.WHITE), circle(50, 54, 5, PAT.BLACK)]) },
    ],
    correctOption: 'E',
    explanation: 'Hanya titik tengah yang selalu muncul berimpit pada ketiga lingkaran sebelumnya, sehingga hasilnya lingkaran dengan satu titik di posisi tengah tersebut (E).',
    quickTrick: 'Irisan (AND): pilih titik yang ada di ketiganya.',
  },
  {
    num: 20, kind: 'analogy', difficulty: 'EASY', subtopic: 'Analogi Tukar Posisi & Ukuran (Latihan 6 #20)',
    stem: 'Perhatikan pertukaran posisi dan ukuran antara dua bangun pada pasangan pertama.',
    visualSpec: ana(
      [
        cell([poly('12,68 24,52 36,68', PAT.WHITE), ellipse(62, 54, 24, 14, PAT.BLACK), circle(86, 66, 5, PAT.WHITE)]),
        cell([ellipse(28, 60, 12, 7, PAT.WHITE), poly('48,68 64,42 80,68', PAT.BLACK)]),
      ],
      [
        cell([ellipse(50, 56, 22, 14, PAT.BLACK), rect(76, 60, 10, 10, PAT.WHITE)]),
      ],
    ),
    options: [
      { key: 'A', text: 'Segitiga kecil dan persegi hitam', visualSpec: cell([poly('18,68 28,54 38,68', PAT.WHITE), rect(52, 46, 22, 22, PAT.BLACK)]) },
      { key: 'B', text: 'Elips besar dengan segitiga kecil', visualSpec: cell([ellipse(38, 56, 22, 14, PAT.BLACK), poly('72,68 80,54 88,68', PAT.WHITE)]) },
      { key: 'C', text: 'Persegi hitam dengan persegi kecil', visualSpec: cell([rect(40, 44, 24, 24, PAT.BLACK), rect(74, 58, 12, 12, PAT.WHITE)]) },
      { key: 'D', text: 'Persegi besar putih dengan elips kecil', visualSpec: cell([rect(26, 44, 24, 24, PAT.WHITE), ellipse(68, 58, 14, 9, PAT.BLACK)]) },
      { key: 'E', text: 'Persegi besar hitam di kiri dan elips kecil putih di kanan', visualSpec: cell([rect(26, 42, 28, 28, PAT.BLACK), ellipse(74, 60, 14, 9, PAT.WHITE)]) },
    ],
    correctOption: 'E',
    explanation: 'Dua bangun saling bertukar posisi dan ukuran: elips besar hitam mengecil menjadi elips putih di kanan, sedangkan persegi kecil putih membesar menjadi persegi hitam di kiri (E).',
    quickTrick: 'Tukar tempat + tukar ukuran (besar ↔ kecil) + tukar warna!',
  },
  {
    num: 21, kind: 'analogy', difficulty: 'EASY', subtopic: 'Analogi Tukar Luar & Dalam (Latihan 6 #21)',
    stem: 'Tentukan gambar keempat menggunakan pola pertukaran bangun luar dan bangun dalam.',
    visualSpec: ana(
      [
        cell([regularPoly(50, 50, 32, 5, PAT.WHITE), regularPoly(50, 20, 8, 5, PAT.WHITE), regularPoly(22, 40, 8, 5, PAT.WHITE), regularPoly(78, 40, 8, 5, PAT.WHITE), regularPoly(32, 74, 8, 5, PAT.WHITE), regularPoly(68, 74, 8, 5, PAT.WHITE)]),
        cell([regularPoly(50, 50, 32, 5, PAT.WHITE), regularPoly(50, 20, 7, 5, PAT.WHITE), regularPoly(22, 40, 7, 5, PAT.WHITE), regularPoly(78, 40, 7, 5, PAT.WHITE)]),
      ],
      [
        cell([rect(24, 24, 52, 52, PAT.WHITE), circle(34, 34, 7, PAT.WHITE), circle(66, 34, 7, PAT.WHITE), circle(34, 66, 7, PAT.WHITE), circle(66, 66, 7, PAT.WHITE)]),
      ],
    ),
    options: [
      { key: 'A', text: 'Lingkaran besar dengan kotak menempel luar', visualSpec: cell([circle(50, 50, 30, PAT.WHITE), rect(16, 44, 12, 12, PAT.WHITE), rect(72, 44, 12, 12, PAT.WHITE)]) },
      { key: 'B', text: 'Lingkaran besar di luar dengan persegi kecil menempel di sisi-sisinya (luar jadi dalam, dalam jadi luar)', visualSpec: cell([circle(50, 50, 30, PAT.WHITE), rect(44, 14, 12, 12, PAT.WHITE), rect(44, 74, 12, 12, PAT.WHITE), rect(14, 44, 12, 12, PAT.WHITE), rect(74, 44, 12, 12, PAT.WHITE)]) },
      { key: 'C', text: 'Lingkaran di dalam segitiga', visualSpec: cell([poly('50,16 84,80 16,80', PAT.WHITE), circle(50, 58, 16, PAT.WHITE)]) },
      { key: 'D', text: 'Segitiga dengan titik sudut kotak', visualSpec: cell([poly('50,18 82,78 18,78', PAT.WHITE), rect(44, 12, 12, 12, PAT.WHITE)]) },
      { key: 'E', text: 'Kisi-kisi persegi', visualSpec: cell([rect(28, 28, 44, 44, PAT.WHITE), line(50, 14, 50, 86, 2), line(14, 50, 86, 50, 2)]) },
    ],
    correctOption: 'B',
    explanation: 'Bangun di dalam (lingkaran kecil) menjadi bangun besar di luar, sedangkan bangun besar (persegi) menjadi kecil (B).',
    quickTrick: 'Luar ↔ Dalam: Persegi luar + lingkaran dalam → Lingkaran besar + persegi kecil.',
  },
  {
    num: 22, kind: 'analogy', difficulty: 'MEDIUM', subtopic: 'Analogi Rotasi 90° & Tambah Garis Kuadran (Latihan 6 #22)',
    stem: 'Perhatikan perubahan dari gambar ke-1 ke gambar ke-2, lalu tentukan gambar ke-4 untuk gambar ke-3.',
    visualSpec: ana(
      [
        cell([circle(50, 50, 32, PAT.WHITE), line(50, 18, 50, 82, 2), line(18, 50, 82, 50, 2), circle(36, 36, 4, PAT.BLACK), circle(64, 64, 4, PAT.WHITE)]),
        cell([circle(50, 50, 32, PAT.WHITE), line(50, 18, 50, 82, 2), line(18, 50, 82, 50, 2), sectorPath(50, 50, 32, 0, 90, PAT.BLACK), circle(36, 36, 4, PAT.BLACK), circle(64, 64, 4, PAT.WHITE)]),
      ],
      [
        cell([circle(50, 50, 32, PAT.WHITE), line(50, 18, 50, 82, 2), line(18, 50, 82, 50, 2), rect(34, 34, 10, 10, PAT.BLACK), circle(64, 64, 4, PAT.WHITE)]),
      ],
    ),
    options: [
      { key: 'A', text: 'Kuadran kiri atas berarsir garis', visualSpec: cell([circle(50, 50, 32, PAT.WHITE), line(50, 18, 50, 82, 2), line(18, 50, 82, 50, 2), sectorPath(50, 50, 32, 270, 360, PAT.DIAG)]) },
      { key: 'B', text: 'Kuadran kanan atas berblok hitam', visualSpec: cell([circle(50, 50, 32, PAT.WHITE), line(50, 18, 50, 82, 2), line(18, 50, 82, 50, 2), sectorPath(50, 50, 32, 0, 90, PAT.BLACK)]) },
      { key: 'C', text: 'Kuadran kanan atas bergaris dengan kotak hitam di kiri atas', visualSpec: cell([circle(50, 50, 32, PAT.WHITE), line(50, 18, 50, 82, 2), line(18, 50, 82, 50, 2), sectorPath(50, 50, 32, 0, 90, PAT.DIAG), rect(34, 34, 10, 10, PAT.BLACK)]) },
      { key: 'D', text: 'Diputar 90° dengan salah satu kuadran diberi 3 garis arsiran', visualSpec: cell([circle(50, 50, 32, PAT.WHITE), line(50, 18, 50, 82, 2), line(18, 50, 82, 50, 2), sectorPath(50, 50, 32, 0, 90, PAT.DIAG), rect(34, 60, 10, 10, PAT.BLACK), circle(64, 36, 4, PAT.WHITE)]) },
      { key: 'E', text: 'Kuadran kiri bawah hitam penuh', visualSpec: cell([circle(50, 50, 32, PAT.WHITE), line(50, 18, 50, 82, 2), line(18, 50, 82, 50, 2), sectorPath(50, 50, 32, 180, 270, PAT.BLACK)]) },
    ],
    correctOption: 'D',
    explanation: 'Gambar diputar 90° kemudian salah satu kuadran di ujungnya diberi 3 garis arsiran (D).',
    quickTrick: 'Cek posisi objek setelah rotasi 90° + kuadran berarsir 3 garis.',
  },
  {
    num: 23, kind: 'analogy', difficulty: 'HARD', subtopic: 'Analogi Rotasi 180° & Tukar Bentuk Kotak-Bundar (Latihan 6 #23)',
    stem: 'Amati bagaimana bentuk bundar menjadi kotak dan kotak menjadi bundar beserta rotasi 180° pada pasangan pertama.',
    visualSpec: ana(
      [
        cell([circle(50, 28, 16, PAT.WHITE), line(34, 28, 66, 28, 2), line(50, 44, 50, 56, 2), circle(50, 72, 16, PAT.WHITE), line(34, 72, 66, 72, 2)]),
        cell([rect(34, 14, 32, 32, PAT.WHITE), line(50, 14, 50, 46, 2), line(50, 46, 50, 54, 2), rect(34, 54, 32, 32, PAT.WHITE), line(50, 54, 50, 86, 2)]),
      ],
      [
        cell([rect(34, 14, 32, 32, PAT.WHITE), line(34, 30, 66, 30, 2), rect(34, 54, 32, 32, PAT.WHITE), line(34, 70, 66, 70, 2)]),
      ],
    ),
    options: [
      { key: 'A', text: 'Dua lingkaran bergaris mendatar', visualSpec: cell([circle(50, 28, 16, PAT.WHITE), line(34, 28, 66, 28, 2), circle(50, 72, 16, PAT.WHITE), line(34, 72, 66, 72, 2)]) },
      { key: 'B', text: 'Dua lingkaran menyambung garis', visualSpec: cell([circle(50, 28, 16, PAT.WHITE), line(50, 44, 50, 56, 2), circle(50, 72, 16, PAT.WHITE)]) },
      { key: 'C', text: 'Dua lingkaran dengan palang (+)', visualSpec: cell([circle(50, 28, 16, PAT.WHITE), line(50, 12, 50, 44, 2), line(34, 28, 66, 28, 2), circle(50, 72, 16, PAT.WHITE), line(50, 56, 50, 88, 2), line(34, 72, 66, 72, 2)]) },
      { key: 'D', text: 'Dua lingkaran (kotak jadi bundar) dengan garis vertikal (diputar 180°)', visualSpec: cell([circle(50, 28, 16, PAT.WHITE), line(50, 12, 50, 44, 2), line(50, 44, 50, 56, 2), circle(50, 72, 16, PAT.WHITE), line(50, 56, 50, 88, 2)]) },
      { key: 'E', text: 'Dua kapsul tegak', visualSpec: cell([rect(34, 14, 32, 32, PAT.WHITE, 2, { rx: 12 }), rect(34, 54, 32, 32, PAT.WHITE, 2, { rx: 12 })]) },
    ],
    correctOption: 'D',
    explanation: 'Gambar diputar/diubah dari kotak menjadi bundar, garis dalam berubah orientasi dari mendatar menjadi tegak (D).',
    quickTrick: 'Kotak → Bundar + garis mendatar → garis tegak!',
  },
  {
    num: 24, kind: 'analogy', difficulty: 'EASY', subtopic: 'Analogi Penambahan Sudut Luar & Dalam (Latihan 6 #24)',
    stem: 'Perhatikan penambahan jumlah titik sudut bangun luar dan bangun dalam pada pasangan pertama.',
    visualSpec: ana(
      [
        cell([rect(22, 22, 56, 56, PAT.WHITE), poly('50,34 68,66 32,66', PAT.WHITE, 2)]),
        cell([regularPoly(50, 50, 34, 5, PAT.WHITE), rect(38, 38, 24, 24, PAT.WHITE, 2)]),
      ],
      [
        cell([poly('50,16 84,80 16,80', PAT.WHITE), rect(38, 48, 24, 24, PAT.WHITE, 2)]),
      ],
    ),
    options: [
      { key: 'A', text: 'Persegi luar (4 sudut) berisi segilima dalam (5 sudut)', visualSpec: cell([rect(20, 20, 60, 60, PAT.WHITE), regularPoly(50, 50, 18, 5, PAT.WHITE, 0, 2)]) },
      { key: 'B', text: 'Segilima luar berisi segilima dalam', visualSpec: cell([regularPoly(50, 50, 34, 5, PAT.WHITE), regularPoly(50, 50, 16, 5, PAT.WHITE, 0, 2)]) },
      { key: 'C', text: 'Segilima luar berisi segilima kecil', visualSpec: cell([regularPoly(50, 50, 34, 5, PAT.WHITE), regularPoly(50, 50, 12, 5, PAT.WHITE, 0, 2)]) },
      { key: 'D', text: 'Persegi luar berisi persegi dalam', visualSpec: cell([rect(20, 20, 60, 60, PAT.WHITE), rect(36, 36, 28, 28, PAT.WHITE, 2)]) },
      { key: 'E', text: 'Segienam luar berisi persegi dalam', visualSpec: cell([regularPoly(50, 50, 34, 6, PAT.WHITE), rect(36, 36, 28, 28, PAT.WHITE, 2)]) },
    ],
    correctOption: 'A',
    explanation: 'Sudut luar bertambah +1 (4→5, maka 3→4 = persegi) dan sudut dalam bertambah +1 (3→4, maka 4→5 = segilima), sehingga hasilnya persegi berisi segilima (A).',
    quickTrick: 'Luar: 3+1 = 4 (Persegi); Dalam: 4+1 = 5 (Segilima).',
  },
  {
    num: 25, kind: 'analogy', difficulty: 'MEDIUM', subtopic: 'Analogi Pencerminan & Penggabungan Bangun (Latihan 6 #25)',
    stem: 'Tentukan gambar keempat yang dibentuk dengan pola pencerminan dan penggabungan yang sama dengan pasangan pertama.',
    visualSpec: ana(
      [
        cell([poly('24,22 70,76 24,76', PAT.WHITE)]),
        cell([poly('22,42 54,42 36,24 54,24 54,78 36,56 22,56', PAT.WHITE)]),
      ],
      [
        cell([poly('30,22 68,22 68,78 46,78 30,52', PAT.WHITE)]),
      ],
    ),
    options: [
      { key: 'A', text: 'Bangun bertakik kanan bawah', visualSpec: cell([poly('30,20 70,20 70,44 52,50 70,78 30,78', PAT.WHITE)]) },
      { key: 'B', text: 'Bangun melengkung kanan', visualSpec: cell([poly('30,78 58,78 72,56 58,20 30,20', PAT.WHITE)]) },
      { key: 'C', text: 'Bangun miring kiri', visualSpec: cell([poly('42,20 74,20 74,80 42,80 28,50', PAT.WHITE)]) },
      { key: 'D', text: 'Dua sisi bersudut ke dalam simetris', visualSpec: cell([poly('26,20 74,20 58,50 74,80 26,80 42,50', PAT.WHITE)]) },
      { key: 'E', text: 'Bangun dibentuk dengan pencerminan dan pergeseran sesuai pola pembentukan', visualSpec: cell([poly('34,20 68,20 50,48 68,48 68,80 34,80', PAT.WHITE)]) },
    ],
    correctOption: 'E',
    explanation: 'Pola pembentukan gambar menggabungkan cerminan bagian miring di sisi kanan seperti pada pasangan pertama (E).',
    quickTrick: 'Bandingkan takik garis diagonal pada pasangan pertama untuk memilih siluet E.',
  },
  {
    num: 26, kind: 'analogy', difficulty: 'EASY', subtopic: 'Analogi Cekungan Sisi Atas Poligon (Latihan 6 #26)',
    stem: 'Perhatikan perubahan sisi atas segilima pada pasangan pertama, lalu terapkan pada segienam.',
    visualSpec: ana(
      [
        cell([regularPoly(50, 50, 32, 5, PAT.WHITE)]),
        cell([poly('20,32 50,52 80,32 70,74 30,74', PAT.WHITE)]),
      ],
      [
        cell([regularPoly(50, 50, 32, 6, PAT.WHITE)]),
      ],
    ),
    options: [
      { key: 'A', text: 'Dua puncak segitiga berdempetan', visualSpec: cell([poly('16,74 34,28 50,54 66,28 84,74', PAT.WHITE)]) },
      { key: 'B', text: 'Menghadap kanan seperti panah', visualSpec: cell([poly('22,22 68,50 22,78 44,50', PAT.WHITE)]) },
      { key: 'C', text: 'Dua segitiga bertolak ujung', visualSpec: cell([poly('20,24 50,50 20,76', PAT.WHITE), poly('80,24 50,50 80,76', PAT.WHITE)]) },
      { key: 'D', text: 'Segienam dengan bagian atas terlipat/cekung ke dalam', visualSpec: cell([poly('20,30 50,52 80,30 80,70 50,82 20,70', PAT.WHITE)]) },
      { key: 'E', text: 'Menghadap kiri seperti panah', visualSpec: cell([poly('78,22 32,50 78,78 56,50', PAT.WHITE)]) },
    ],
    correctOption: 'D',
    explanation: 'Puncak atas poligon dilipat/ditekuk ke dalam membentuk cekungan V di bagian atas sementara bagian bawahnya tetap utuh (D).',
    quickTrick: 'Tekuk puncak atas ke dalam, pertahankan bagian bawah.',
  },
  {
    num: 27, kind: 'analogy', difficulty: 'EASY', subtopic: 'Analogi Gabung Vertikal Atas-Bawah (Latihan 6 #27)',
    stem: 'Pada pasangan pertama, bagian atas diturunkan dan bagian bawah dinaikkan hingga bertumpuk. Tentukan hasilnya untuk gambar ketiga.',
    visualSpec: ana(
      [
        cell([poly('32,16 68,16 50,48', PAT.WHITE), poly('32,80 68,80 50,48', PAT.WHITE)]),
        cell([poly('32,34 68,34 50,66', PAT.WHITE), poly('32,66 68,66 50,34', PAT.WHITE)]),
      ],
      [
        cell([circle(50, 32, 18, PAT.WHITE), circle(50, 68, 18, PAT.WHITE), line(37, 55, 63, 81, 2), line(63, 55, 37, 81, 2)]),
      ],
    ),
    options: [
      { key: 'A', text: 'Satu lingkaran dengan silang X', visualSpec: cell([circle(50, 50, 28, PAT.WHITE), line(30, 30, 70, 70, 2), line(70, 30, 30, 70, 2)]) },
      { key: 'B', text: 'Lingkaran atas turun bertumpuk tepat dengan lingkaran bersilang bawah', visualSpec: cell([circle(50, 50, 28, PAT.WHITE), line(30, 30, 70, 70, 2), line(70, 30, 30, 70, 2), line(50, 22, 50, 78, 2)]) },
      { key: 'C', text: 'Lingkaran dengan segitiga dalam', visualSpec: cell([circle(50, 50, 28, PAT.WHITE), poly('50,22 74,64 26,64', PAT.WHITE)]) },
      { key: 'D', text: 'Lingkaran dengan belah ketupat dalam', visualSpec: cell([circle(50, 50, 28, PAT.WHITE), regularPoly(50, 50, 28, 4, PAT.WHITE, 0)]) },
      { key: 'E', text: 'Lingkaran terbelah garis vertikal saja', visualSpec: cell([circle(50, 50, 28, PAT.WHITE), line(50, 22, 50, 78, 2)]) },
    ],
    correctOption: 'B',
    explanation: 'Bagian atas diturunkan dan bagian bawah dinaikkan sehingga keduanya bertumpuk menjadi satu kesatuan gambar (B).',
    quickTrick: 'Tumpukkan lingkaran atas tepat di atas lingkaran bersilang bawah.',
  },
  {
    num: 28, kind: 'analogy', difficulty: 'MEDIUM', subtopic: 'Analogi Tukar Besar & Kecil Dua Bangun (Latihan 6 #28)',
    stem: 'Perhatikan perubahan ukuran antara bangun luar dan bangun dalam pada pasangan pertama.',
    visualSpec: ana(
      [
        cell([rect(18, 28, 64, 44, PAT.WHITE), regularPoly(50, 50, 22, 4, PAT.WHITE, 0)]),
        cell([regularPoly(50, 50, 34, 4, PAT.WHITE, 0), rect(34, 34, 32, 32, PAT.WHITE)]),
      ],
      [
        cell([plusCross(50, 50, 32, 14, PAT.WHITE), rect(26, 26, 48, 48, PAT.WHITE)]),
      ],
    ),
    options: [
      { key: 'A', text: 'Palang kecil di luar persegi besar', visualSpec: cell([rect(24, 24, 52, 52, PAT.WHITE), plusCross(50, 50, 36, 12, PAT.WHITE)]) },
      { key: 'B', text: 'Belah ketupat di luar palang', visualSpec: cell([regularPoly(50, 50, 34, 4, PAT.WHITE, 0), plusCross(50, 50, 24, 10, PAT.WHITE)]) },
      { key: 'C', text: 'Palang besar polos', visualSpec: cell([plusCross(50, 50, 34, 14, PAT.WHITE)]) },
      { key: 'D', text: 'Persegi besar berisi palang kecil di dalam', visualSpec: cell([rect(18, 24, 64, 52, PAT.WHITE), plusCross(50, 50, 16, 6, PAT.WHITE)]) },
      { key: 'E', text: 'Persegi dibesarkan dan palang dikecilkan saling berpotongan', visualSpec: cell([rect(22, 22, 56, 56, PAT.WHITE), plusCross(50, 50, 26, 10, PAT.WHITE)]) },
    ],
    correctOption: 'E',
    explanation: 'Gambar yang berukuran kecil dibesarkan, sedangkan gambar yang berukuran besar dikecilkan (E).',
    quickTrick: 'Bangun kecil → membesar; bangun besar → mengecil.',
  },
  {
    num: 29, kind: 'analogy', difficulty: 'EASY', subtopic: 'Analogi Inversi Luar-Dalam & Ukuran (Latihan 6 #29)',
    stem: 'Tentukan gambar keempat menggunakan aturan: besar menjadi kecil (masuk ke dalam) dan kecil menjadi besar (berada di luar).',
    visualSpec: ana(
      [
        cell([regularPoly(50, 50, 28, 5, PAT.WHITE), circle(50, 20, 6, PAT.WHITE), circle(24, 42, 6, PAT.WHITE), circle(76, 42, 6, PAT.WHITE), circle(34, 72, 6, PAT.WHITE), circle(66, 72, 6, PAT.WHITE)]),
        cell([circle(50, 50, 32, PAT.WHITE), regularPoly(50, 24, 6, 5, PAT.WHITE), regularPoly(26, 44, 6, 5, PAT.WHITE), regularPoly(74, 44, 6, 5, PAT.WHITE), regularPoly(36, 72, 6, 5, PAT.WHITE), regularPoly(64, 72, 6, 5, PAT.WHITE)]),
      ],
      [
        cell([regularPoly(50, 50, 28, 4, PAT.WHITE, 0), plusCross(50, 24, 6, 2, PAT.WHITE), plusCross(24, 50, 6, 2, PAT.WHITE), plusCross(76, 50, 6, 2, PAT.WHITE), plusCross(50, 76, 6, 2, PAT.WHITE)]),
      ],
    ),
    options: [
      { key: 'A', text: 'Belah ketupat ganda bersilang', visualSpec: cell([regularPoly(50, 50, 32, 4, PAT.WHITE, 0), line(24, 24, 76, 76, 2), line(76, 24, 24, 76, 2)]) },
      { key: 'B', text: 'Empat persegi kecil mengelilingi palang', visualSpec: cell([plusCross(50, 50, 28, 10, PAT.WHITE), rect(16, 44, 12, 12, PAT.WHITE), rect(72, 44, 12, 12, PAT.WHITE)]) },
      { key: 'C', text: 'Palang besar bergerigi', visualSpec: cell([plusCross(50, 50, 34, 14, PAT.WHITE)]) },
      { key: 'D', text: 'Palang kecil menjadi silang besar dan belah ketupat besar mengecil di dalamnya', visualSpec: cell([regularPoly(50, 50, 30, 4, PAT.BLACK, 0), regularPoly(50, 50, 14, 4, PAT.WHITE, 0)]) },
      { key: 'E', text: 'Belah ketupat terbagi empat ruang', visualSpec: cell([regularPoly(50, 50, 32, 4, PAT.WHITE, 0), line(34, 34, 66, 66, 2), line(66, 34, 34, 66, 2)]) },
    ],
    correctOption: 'D',
    explanation: 'Elemen yang besar menjadi kecil di dalam dan elemen yang kecil di luar menjadi besar (D).',
    quickTrick: 'Tukar peran bangun besar dan kecil (luar ↔ dalam).',
  },
  {
    num: 30, kind: 'analogy', difficulty: 'EASY', subtopic: 'Analogi Tukar Ukuran & Posisi Segitiga-Lingkaran (Latihan 6 #30)',
    stem: 'Terapkan aturan yang sama dari pasangan pertama: bangun besar mengecil masuk ke dalam, dan bangun kecil membesar di luar.',
    visualSpec: ana(
      [
        cell([poly('20,24 80,24 50,78', PAT.WHITE), line(50, 24, 50, 78, 2), line(36, 24, 50, 52, 1.8), line(64, 24, 50, 52, 1.8)]),
        cell([poly('50,20 82,78 18,78', PAT.WHITE), path('M 50 32 L 50 44 M 44 50 L 50 44 L 56 50', PAT.NONE, 2)]),
      ],
      [
        cell([poly('50,22 76,72 24,72', PAT.WHITE), circle(24, 72, 8, PAT.WHITE), circle(76, 72, 8, PAT.WHITE), circle(50, 22, 8, PAT.WHITE)]),
      ],
    ),
    options: [
      { key: 'A', text: 'Segitiga besar berisi simbol plus kecil', visualSpec: cell([poly('50,18 82,78 18,78', PAT.WHITE), plusCross(50, 38, 6, 2, PAT.WHITE), plusCross(36, 68, 6, 2, PAT.WHITE), plusCross(64, 68, 6, 2, PAT.WHITE)]) },
      { key: 'B', text: 'Segitiga besar berisi palang kecil', visualSpec: cell([poly('50,18 82,78 18,78', PAT.WHITE), plusCross(50, 58, 12, 4, PAT.WHITE)]) },
      { key: 'C', text: 'Lingkaran besar dengan kotak sudut', visualSpec: cell([circle(50, 50, 32, PAT.WHITE), rect(20, 62, 10, 10, PAT.WHITE), rect(70, 62, 10, 10, PAT.WHITE)]) },
      { key: 'D', text: 'Lingkaran besar berisi tanda plus (+)', visualSpec: cell([circle(50, 50, 32, PAT.WHITE), plusCross(50, 32, 6, 2, PAT.WHITE), plusCross(34, 62, 6, 2, PAT.WHITE), plusCross(66, 62, 6, 2, PAT.WHITE)]) },
      { key: 'E', text: 'Lingkaran besar di luar berisi 3 segitiga kecil di dalam', visualSpec: cell([circle(50, 50, 32, PAT.WHITE), poly('50,28 57,42 43,42', PAT.WHITE, 1.8), poly('34,58 41,72 27,72', PAT.WHITE, 1.8), poly('66,58 73,72 59,72', PAT.WHITE, 1.8)]) },
    ],
    correctOption: 'E',
    explanation: 'Lingkaran kecil di sudut segitiga membesar menjadi lingkaran utama di luar, sedangkan segitiga besar mengecil menjadi segitiga-segitiga kecil di dalam lingkaran (E).',
    quickTrick: 'Segitiga + 3 Lingkaran kecil → Lingkaran besar + Segitiga kecil di dalam!',
  },
];
