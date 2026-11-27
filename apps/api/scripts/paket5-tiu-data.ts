import { McqInput } from './paket-builder';

export const PAKET5_TIU_DATA: McqInput[] = [
  // ================= SILOGISME (4) =================
  {
    id: 'TIU-P5-001',
    subject: 'TIU',
    topicSlug: 'silogisme',
    subtopic: 'Ekuivalensi Kontraposisi',
    difficulty: 'MEDIUM',
    stem: 'Jika tingkat literasi digital ASN tinggi, maka risiko kebocoran data layanan menurun. Pernyataan yang secara logis ekuivalen dengan premis tersebut adalah...',
    options: {
      A: { text: 'Jika risiko kebocoran data layanan menurun, maka tingkat literasi digital ASN tinggi.', why: 'Ini adalah konvers (Q -> P), tidak ekuivalen dengan P -> Q.' },
      B: { text: 'Jika tingkat literasi digital ASN tidak tinggi, maka risiko kebocoran data layanan tidak menurun.', why: 'Ini adalah invers (¬P -> ¬Q), tidak ekuivalen dengan P -> Q.' },
      C: { text: 'Jika risiko kebocoran data layanan tidak menurun, maka tingkat literasi digital ASN tidak tinggi.', why: 'Benar: kontraposisi (¬Q -> ¬P) selalu ekuivalen secara logis dengan P -> Q.' },
      D: { text: 'Tingkat literasi digital ASN tinggi dan risiko kebocoran data layanan tidak menurun.', why: 'Justru ini negasi dari implikasi P -> Q.' },
      E: { text: 'Risiko kebocoran data layanan hanya dipengaruhi oleh faktor literasi digital.', why: 'Menambahkan klaim faktor tunggal yang tidak ada di premis.' }
    },
    correct: 'C',
    concept: 'Suatu pernyataan implikasi P -> Q selalu bernilai sama dengan kontraposisinya (¬Q -> ¬P) dan disjungsinya (¬P ∨ Q).',
    steps: [
      'Identifikasi P = tingkat literasi digital ASN tinggi, Q = risiko kebocoran data menurun.',
      'Bentuk implikasi: P -> Q.',
      'Bentuk kontraposisi: ¬Q -> ¬P ("Jika risiko kebocoran data layanan tidak menurun, maka tingkat literasi digital ASN tidak tinggi").'
    ],
    correctReason: 'Hukum kontraposisi menyatakan P -> Q ≡ ¬Q -> ¬P.',
    quickTrick: 'Balik posisi sebab-akibat lalu tambahkan kata "tidak" pada keduanya.',
    commonMistakes: 'Mengira invers (¬P -> ¬Q) atau konvers (Q -> P) setara dengan implikasi awal.',
    tip: 'Hafalkan: implikasi = kontraposisi, sedangkan konvers = invers.',
    refs: [{ title: 'Ekuivalensi Logika Implikasi', source: 'Pedoman TIU Verbal BKN', note: 'Kontraposisi' }]
  },
  {
    id: 'TIU-P5-002',
    subject: 'TIU',
    topicSlug: 'silogisme',
    subtopic: 'Negasi Kalimat Berkuantor Universal',
    difficulty: 'EASY',
    stem: 'Ingkaran (negasi) yang tepat dari pernyataan "Semua berkas pengadaan tahun 2026 telah diarsipkan secara elektronik" adalah...',
    options: {
      A: { text: 'Ada berkas pengadaan tahun 2026 yang belum diarsipkan secara elektronik.', why: 'Benar: ingkaran dari "Semua A bersifat B" adalah "Ada/beberapa A yang tidak bersifat B".' },
      B: { text: 'Tidak ada berkas pengadaan tahun 2026 yang diarsipkan secara elektronik.', why: 'Terlalu ekstrem; cukup satu berkas saja yang belum diarsipkan untuk menggugurkan klaim "semua".' },
      C: { text: 'Semua berkas pengadaan tahun 2025 telah diarsipkan secara elektronik.', why: 'Mengubah tahun objek pernyataan.' },
      D: { text: 'Sebagian berkas pengadaan tahun 2026 telah diarsipkan secara elektronik.', why: 'Tidak mengingkari klaim karena "sebagian" belum tentu meniadakan "semua" dalam logika baku, dan tidak menegaskan adanya penyangkalan predikat.' },
      E: { text: 'Semua berkas pengadaan selain tahun 2026 belum diarsipkan secara elektronik.', why: 'Keluar dari himpunan subjek yang dibahas.' }
    },
    correct: 'A',
    concept: 'Negasi kuantor universal ∀x P(x) adalah kuantor eksistensial ∃x ¬P(x).',
    steps: [
      'Ubah kuantor "Semua" menjadi "Ada" / "Beberapa" / "Terdapat".',
      'Negasikan predikat "telah diarsipkan secara elektronik" menjadi "belum/tidak diarsipkan secara elektronik".',
      'Gabungkan menjadi: Ada berkas pengadaan tahun 2026 yang belum diarsipkan secara elektronik.'
    ],
    correctReason: 'Satu contoh penyangkal sudah cukup untuk mematahkan pernyataan universal "semua".',
    quickTrick: 'Lawan "Semua X adalah Y" bukan "Tidak ada X yang Y", melainkan "Ada X yang bukan Y".',
    commonMistakes: 'Memilih "Tidak ada satu pun..." sebagai negasi dari "Semua...".',
    tip: 'Gunakan pola tetap: Semua ↔ Ada...tidak; Tidak ada ↔ Ada.',
    refs: [{ title: 'Negasi Kuantor', source: 'Materi Logika SKD TIU', note: 'Universal vs Eksistensial' }]
  },
  {
    id: 'TIU-P5-003',
    subject: 'TIU',
    topicSlug: 'silogisme',
    subtopic: 'Silogisme dengan Premis Distraktor',
    difficulty: 'MEDIUM',
    stem: 'Semua peserta seminar kebijakan publik wajib mengisi daftar hadir daring. Sebagian staf kelurahan adalah peserta seminar kebijakan publik. Sementara itu, tidak ada pekerja lepas yang merupakan staf kelurahan. Simpulan yang pasti benar adalah...',
    options: {
      A: { text: 'Semua staf kelurahan wajib mengisi daftar hadir daring.', why: 'Hanya sebagian staf kelurahan yang menjadi peserta seminar.' },
      B: { text: 'Sebagian staf kelurahan wajib mengisi daftar hadir daring.', why: 'Benar: bagian staf kelurahan yang menjadi peserta seminar pasti terkena kewajiban mengisi daftar hadir daring.' },
      C: { text: 'Tidak ada pekerja lepas yang wajib mengisi daftar hadir daring.', why: 'Pekerja lepas bisa saja menjadi peserta seminar secara terpisah meski bukan staf kelurahan.' },
      D: { text: 'Semua peserta seminar kebijakan publik adalah staf kelurahan.', why: 'Konversi tidak sah.' },
      E: { text: 'Sebagian pekerja lepas adalah staf kelurahan yang mengisi daftar hadir.', why: 'Bertentangan dengan premis ketiga.' }
    },
    correct: 'B',
    concept: 'Mengenali premis yang saling terhubung dan mengabaikan premis pemecah konsentrasi yang tidak membentuk kesimpulan.',
    steps: [
      'Hubungkan premis 1 (Semua peserta seminar -> isi daftar hadir daring) dengan premis 2 (Sebagian staf kelurahan -> peserta seminar).',
      'Didapat: Sebagian staf kelurahan wajib mengisi daftar hadir daring.',
      'Premis 3 mengenai pekerja lepas tidak menghalangi kemungkinan pekerja lepas ikut seminar lewat jalur lain.'
    ],
    correctReason: 'Irisan langsung dari dua premis pertama bersifat pasti, sedangkan hubungan pekerja lepas dan seminar tidak ditentukan.',
    quickTrick: 'Abaikan kalimat ketiga bila tidak tersambung langsung ke term "peserta seminar".',
    commonMistakes: 'Menyimpulkan tidak ada pekerja lepas yang menjadi peserta seminar hanya karena mereka bukan staf kelurahan.',
    tip: 'Cek selalu apakah dua himpunan benar-benar memiliki relasi pada premis sebelum menyimpulkan.',
    refs: [{ title: 'Silogisme Tiga Premis', source: 'Bank Soal TIU HOTS', note: 'Pemilah Distraktor' }]
  },
  {
    id: 'TIU-P5-004',
    subject: 'TIU',
    topicSlug: 'silogisme',
    subtopic: 'Dilema Konstruktif',
    difficulty: 'HARD',
    stem: 'Jika rapat dipimpin oleh Sekretaris Daerah, maka seluruh kepala dinas hadir. Jika rapat dilaksanakan pada hari Jumat, maka agenda evaluasi anggaran dibahas. Diketahui bahwa rapat tersebut dipimpin oleh Sekretaris Daerah atau dilaksanakan pada hari Jumat. Simpulan yang sah adalah...',
    options: {
      A: { text: 'Seluruh kepala dinas hadir dan agenda evaluasi anggaran pasti dibahas bersamaan.', why: 'Premis ketiga menggunakan "atau", bukan "dan", sehingga tidak menjamin keduanya terjadi sekaligus.' },
      B: { text: 'Sekretaris Daerah pasti memimpin rapat setiap hari Jumat.', why: 'Tidak ada hubungan sebab-akibat antara kepemimpinan rapat dan hari Jumat.' },
      C: { text: 'Jika seluruh kepala dinas tidak hadir, maka rapat tidak dipimpin Sekretaris Daerah dan tidak dilaksanakan Jumat.', why: 'Bisa saja rapat dilaksanakan Jumat dan membahas anggaran.' },
      D: { text: 'Seluruh kepala dinas hadir atau agenda evaluasi anggaran dibahas.', why: 'Benar: aturan dilema konstruktif dari (P -> Q), (R -> S), dan (P ∨ R) menurunkan (Q ∨ S).' },
      E: { text: 'Agenda evaluasi anggaran dibahas hanya apabila seluruh kepala dinas tidak hadir.', why: 'Tidak memiliki dasar dalam premis.' }
    },
    correct: 'D',
    concept: 'Dilema Konstruktif: Jika (P -> Q) dan (R -> S), serta (P atau R) terjadi, maka (Q atau S) pasti terjadi.',
    steps: [
      'Misalkan P = dipimpin Sekda, Q = seluruh kepala dinas hadir, R = dilaksanakan Jumat, S = evaluasi anggaran dibahas.',
      'Premis: P -> Q, R -> S, dan P ∨ R.',
      'Jika P terjadi maka Q terjadi; jika R terjadi maka S terjadi. Maka minimal salah satu dari Q atau S pasti terjadi (Q ∨ S).'
    ],
    correctReason: 'Disjungsi sebab pada dua implikasi terpisah menurunkan disjungsi akibat.',
    quickTrick: '(A -> B), (C -> D), dan (A atau C) otomatis menghasilkan (B atau D).',
    commonMistakes: 'Mengganti kata "atau" menjadi "dan" pada kesimpulan.',
    tip: 'Perhatikan tanda penghubung "atau" vs "dan" karena itulah penentu kekuatan klaim kesimpulan.',
    refs: [{ title: 'Aturan Inferensi Lanjut', source: 'Logika Proposisional', note: 'Constructive Dilemma' }]
  },

  // ================= PENALARAN INDUKTIF (6) =================
  {
    id: 'TIU-P5-005',
    subject: 'TIU',
    topicSlug: 'penalaran-induktif',
    subtopic: 'Evaluasi Faktor Pemeliharaan',
    difficulty: 'EASY',
    stem: 'Di empat puskesmas daerah terpencil, suhu penyimpanan vaksin tetap stabil pada rentang 2°C–8°C selama enam bulan karena dilengkapi genset otomatis dan alarm pemantau suhu. Sebaliknya, satu puskesmas tanpa alarm pemantau suhu mengalami keterlambatan deteksi saat terjadi lonjakan suhu. Simpulan induktif yang paling tepat adalah...',
    options: {
      A: { text: 'Keberadaan alarm pemantau suhu berperan membantu deteksi dini perubahan suhu penyimpanan vaksin di puskesmas yang diamati.', why: 'Tepat: merujuk langsung pada perbedaan kejadian antara puskesmas beralarm dan tanpa alarm.' },
      B: { text: 'Semua puskesmas di seluruh dunia wajib mengganti kulkas vaksinnya setiap enam bulan.', why: 'Tidak berkaitan dan melebihi ruang lingkup.' },
      C: { text: 'Genset otomatis tidak memiliki peran apa pun terhadap kestabilan listrik puskesmas.', why: 'Bertentangan dengan keterangan bahwa keempat puskesmas juga dilengkapi genset otomatis.' },
      D: { text: 'Vaksin akan selalu rusak dalam satu jam apabila tidak dipantau setiap menit secara manual.', why: 'Klaim spesifik tanpa dasar di teks.' },
      E: { text: 'Puskesmas kelima sengaja mematikan alat pendingin vaksinnya.', why: 'Tuduhan tidak berdasar.' }
    },
    correct: 'A',
    concept: 'Mengisolasi fungsi variabel pembeda pada kasus perbandingan fasilitas layanan publik.',
    steps: [
      'Identifikasi kondisi puskesmas stabil: ada genset otomatis + alarm pemantau suhu.',
      'Identifikasi masalah puskesmas pembanding: tidak ada alarm -> keterlambatan deteksi lonjakan suhu.',
      'Tarik simpulan tentang peran alarm pemantau suhu dalam deteksi dini.'
    ],
    correctReason: 'Perbedaan hasil pada teks berpusat pada ketiadaan alarm pemantau suhu dan keterlambatan deteksi.',
    quickTrick: 'Fokus tepat pada akibat spesifik yang muncul saat satu fasilitas hilang.',
    commonMistakes: 'Menolak peran genset otomatis padahal hanya alarm yang sedang dibandingkan.',
    tip: 'Pastikan simpulan tidak menegasikan faktor pendukung lain yang sudah disebut positif.',
    refs: [{ title: 'Penalaran Induktif Kasus Lapangan', source: 'Modul TIU Verbal', note: 'Evaluasi Fasilitas' }]
  },
  {
    id: 'TIU-P5-006',
    subject: 'TIU',
    topicSlug: 'penalaran-induktif',
    subtopic: 'Generalisasi Sampel Kebijakan Daerah',
    difficulty: 'MEDIUM',
    stem: 'Pembukaan pos layanan konsultasi pajak keliling di tiga pasar tradisional besar menghasilkan peningkatan rata-rata kepatuhan pelaporan SPT pelaku UMKM sebesar 19% dibandingkan tahun sebelumnya. Kesimpulan yang paling logis adalah...',
    options: {
      A: { text: 'Pos layanan konsultasi keliling berpotensi meningkatkan kepatuhan pelaporan SPT pelaku UMKM di ketiga pasar tradisional tersebut.', why: 'Benar: mencerminkan hasil pengamatan tanpa mengklaim kepastian seratus persen di luar sampel.' },
      B: { text: 'Seluruh pelaku UMKM di Indonesia kini sudah seratus persen patuh melaporkan SPT.', why: 'Overgeneralisasi dari tiga pasar dan kenaikan 19%.' },
      C: { text: 'Penghapusan seluruh kantor pajak permanen adalah langkah paling efisien.', why: 'Kesimpulan kebijakan ekstrem di luar bacaan.' },
      D: { text: 'Pedagang pasar tradisional hanya mau membayar pajak jika diberi insentif tunai.', why: 'Membahas insentif tunai yang tidak disebutkan.' },
      E: { text: 'Kepatuhan pajak tahun sebelumnya berada pada angka nol persen.', why: 'Tidak ada data angka dasar tahun sebelumnya.' }
    },
    correct: 'A',
    concept: 'Menyimpulkan dampak program berbasis data peningkatan rata-rata pada lokasi uji.',
    steps: [
      'Intervensi: pos layanan konsultasi pajak keliling di tiga pasar.',
      'Hasil: kepatuhan pelaporan SPT naik rata-rata 19%.',
      'Rumuskan kesimpulan yang setia pada lingkup ketiga pasar.'
    ],
    correctReason: 'Bahasa "berpotensi meningkatkan ... di ketiga pasar" tepat secara induktif.',
    quickTrick: 'Hindari opsi dengan angka mengarang (0%, 100%) atau cakupan berlebihan ("seluruh Indonesia").',
    commonMistakes: 'Tergoda pada opsi dramatis yang melampaui hasil survei.',
    tip: 'Jawaban induktif yang paling aman hampir selalu menyebut kembali konteks sampelnya.',
    refs: [{ title: 'Logika Induktif Evaluasi Program', source: 'Pedoman TIU BKN', note: 'Sampel vs Populasi' }]
  },
  {
    id: 'TIU-P5-007',
    subject: 'TIU',
    topicSlug: 'penalaran-induktif',
    subtopic: 'Pola Pertumbuhan Berkelanjutan',
    difficulty: 'EASY',
    stem: 'Sejak warga menerapkan pemilahan sampah organik dari rumah tangga, volume produksi kompos di bank sampah kelurahan naik berturut-turut: 1,2 ton pada bulan pertama, 1,5 ton pada bulan kedua, 1,9 ton pada bulan ketiga, dan 2,4 ton pada bulan keempat. Simpulan yang paling tepat adalah...',
    options: {
      A: { text: 'Pada bulan kelima volume kompos dipastikan turun tajam karena warga bosan memilah.', why: 'Bertentangan dengan tren kenaikan empat bulan beruntun.' },
      B: { text: 'Volume sampah plastik di kelurahan tersebut telah hilang sepenuhnya.', why: 'Teks hanya membahas produksi kompos dari sampah organik.' },
      C: { text: 'Kebiasaan pemilahan sampah organik dari rumah berkaitan dengan tren kenaikan produksi kompos selama empat bulan pengamatan.', why: 'Tepat: menggambarkan tren naik konsisten pascaperlakuan selama periode pengamatan.' },
      D: { text: 'Bank sampah tidak membutuhkan mesin pencacah organik lagi.', why: 'Tidak disebutkan dalam teks.' },
      E: { text: 'Selisih produksi kompos setiap bulan pasti selalu bertambah 0,1 ton selamanya.', why: 'Meramal pola matematis selamanya tidak sah dalam penalaran induktif sosial.' }
    },
    correct: 'C',
    concept: 'Membedakan deskripsi tren berkelanjutan yang sah dari prediksi permanen ("selamanya") atau topik yang tidak dibahas.',
    steps: [
      'Periksa deret capaian: 1,2 -> 1,5 -> 1,9 -> 2,4 ton (selalu naik).',
      'Periksa konteks awal: sejak penerapan pemilahan sampah organik rumah tangga.',
      'Pilih pernyataan korelasional yang dibatasi masa pengamatan.'
    ],
    correctReason: 'Keempat titik data memperlihatkan kenaikan progresif yang selaras dengan penerapan pemilahan organik.',
    quickTrick: 'Tren naik beruntun -> pilih simpulan "berkaitan dengan tren kenaikan selama pengamatan".',
    commonMistakes: 'Menggunakan selisih angka (+0,3; +0,4; +0,5) untuk memaksakan ramalan "selamanya".',
    tip: 'Bedakan soal TIU Deret Angka (mencari suku ke-5) dengan TIU Induktif (menyimpulkan gejala empiris).',
    refs: [{ title: 'Analisis Tren Induktif', source: 'Bank Soal TIU', note: 'Data Berkala' }]
  },
  {
    id: 'TIU-P5-008',
    subject: 'TIU',
    topicSlug: 'penalaran-induktif',
    subtopic: 'Studi Banding Kelompok Kontrol',
    difficulty: 'MEDIUM',
    stem: 'Pemasangan penerangan jalan umum tenaga surya di empat ruas jalan pinggiran kota diikuti penurunan kecelakaan malam hari dari 14 kasus menjadi 5 kasus per semester, sedangkan pada ruas jalan pembanding tanpa penerangan angka kecelakaan tetap berkisar 13–15 kasus per semester. Simpulan yang paling didukung data adalah...',
    options: {
      A: { text: 'Semua kecelakaan lalu lintas di kota terjadi akibat lampu jalan mati.', why: 'Mengabaikan kecelakaan siang hari dan penyebab lain.' },
      B: { text: 'Ruas jalan pembanding memiliki jumlah kendaraan sepuluh kali lipat lebih padat.', why: 'Menyisipkan klaim kuantitatif yang tidak ada dalam bacaan.' },
      C: { text: 'Kecelakaan di empat ruas jalan pinggiran turun hanya karena cuaca cerah.', why: 'Menolak pembanding tanpa bukti.' },
      D: { text: 'Pemasangan penerangan jalan tenaga surya berkorelasi dengan penurunan kecelakaan malam hari pada ruas jalan yang diuji.', why: 'Benar: perbandingan sebelum-sesudah serta kelompok kontrol mendukung korelasi kuat.' },
      E: { text: 'Lampu tenaga surya lebih terang daripada lampu jaringan listrik konvensional.', why: 'Tidak membandingkan dua jenis lampu tersebut.' }
    },
    correct: 'D',
    concept: 'Kombinasi data sebelum-sesudah (14 -> 5) dan kelompok kontrol (tetap 13–15) dalam penalaran eksperimental kuasi.',
    steps: [
      'Kelompok perlakuan (4 ruas jalan dengan PJU tenaga surya): turun dari 14 ke 5 kasus.',
      'Kelompok kontrol (tanpa penerangan): tetap di 13–15 kasus.',
      'Simpulkan korelasi positif pemasangan PJU tenaga surya dengan turunnya kecelakaan malam hari di lokasi uji.'
    ],
    correctReason: 'Keberadaan kelompok kontrol yang stagnan memperkuat kesimpulan bahwa perubahan di ruas uji bukan sekadar kebetulan musim.',
    quickTrick: 'Kelompok perlakuan membaik, kelompok pembanding tetap -> intervensi berkorelasi dengan perbaikan.',
    commonMistakes: 'Membandingkan teknologi lampu dengan sesuatu yang tidak disebut di teks (listrik konvensional).',
    tip: 'Hati-hati pada opsi yang terdengar masuk akal di dunia nyata tetapi tidak pernah muncul di premis.',
    refs: [{ title: 'Desain Kelompok Kontrol Induktif', source: 'Materi Penalaran Ilmiah TIU', note: 'Before-After Control' }]
  },
  {
    id: 'TIU-P5-009',
    subject: 'TIU',
    topicSlug: 'penalaran-induktif',
    subtopic: 'Generalisasi Mayoritas Sampel',
    difficulty: 'EASY',
    stem: 'Dari 50 sekolah dasar yang membuka pojok baca kelas dan menerapkan pembiasaan membaca 15 menit sebelum pelajaran, sebanyak 44 sekolah mencatat kenaikan skor literasi minimum siswa pada asesmen semester. Simpulan yang paling sesuai adalah...',
    options: {
      A: { text: 'Enam sekolah lainnya mengalami penutupan pojok baca oleh dinas.', why: 'Teks tidak menyebut penutupan pojok baca.' },
      B: { text: 'Skor matematika siswa juga dipastikan naik di seluruh 50 sekolah.', why: 'Skor matematika tidak dibahas.' },
      C: { text: 'Pembiasaan membaca kurang dari 15 menit pasti gagal total menaikkan literasi.', why: 'Tidak ada data variasi durasi di bawah 15 menit.' },
      D: { text: 'Program pojok baca adalah satu-satunya program pendidikan yang berhasil.', why: 'Klaim ekstrem "satu-satunya".' },
      E: { text: 'Kombinasi pojok baca kelas dan pembiasaan membaca 15 menit berpotensi meningkatkan literasi siswa pada mayoritas sekolah peserta.', why: 'Tepat: 44 dari 50 sekolah (88%) merupakan mayoritas jelas tanpa mengklaim 100%.' }
    },
    correct: 'E',
    concept: 'Menginterpretasi proporsi 44/50 secara akurat sebagai mayoritas dan bukan seluruhnya.',
    steps: [
      'Hitung proporsi keberhasilan: 44/50 = 88% (mayoritas besar).',
      'Catatan: masih ada 6 sekolah yang tidak tercatat naik, sehingga kata "semua" salah.',
      'Pilih pernyataan dengan kata "mayoritas" dan "berpotensi".'
    ],
    correctReason: 'Angka 44 dari 50 secara tepat diterjemahkan menjadi mayoritas sekolah peserta.',
    quickTrick: '44/50 = sebagian besar/mayoritas, bukan semua dan bukan tidak efektif.',
    commonMistakes: 'Menebak kondisi 6 sekolah sisanya secara mengarang.',
    tip: 'Jika proporsi disebutkan (44 dari 50), cek apakah opsi menjaga akurasi "mayoritas/sebagian besar".',
    refs: [{ title: 'Penalaran Proporsional', source: 'Modul TIU Verbal', note: 'Mayoritas Sampel' }]
  },
  {
    id: 'TIU-P5-010',
    subject: 'TIU',
    topicSlug: 'penalaran-induktif',
    subtopic: 'Perbandingan Efektivitas Metode',
    difficulty: 'MEDIUM',
    stem: 'Evaluasi tiga angkatan pelatihan dasar CPNS menunjukkan bahwa peserta yang menyusun proyek aktualisasi langsung di unit kerjanya mencapai ketepatan waktu penyelesaian laporan sebesar 96%, jauh di atas kelompok yang hanya menyusun studi kasus teoretis sebesar 68%. Simpulan induktif yang paling kuat adalah...',
    options: {
      A: { text: 'Penyusunan proyek aktualisasi langsung di unit kerja berkaitan dengan tingkat ketepatan waktu penyelesaian laporan yang lebih tinggi dibanding studi kasus teoretis semata pada tiga angkatan tersebut.', why: 'Benar: membandingkan dua metode dan capaian terukur sesuai cakupan evaluasi.' },
      B: { text: 'Peserta studi kasus teoretis kurang cerdas dibandingkan peserta proyek aktualisasi.', why: 'Menilai kecerdasan individu tanpa bukti data.' },
      C: { text: 'Semua teori manajemen pemerintahan harus dihapus dari kurikulum pelatihan dasar.', why: 'Rekomendasi ekstrem yang melampaui bukti.' },
      D: { text: 'Sebesar 4% peserta proyek aktualisasi diberhentikan dari pelatihan.', why: 'Tidak lulus/terlambat tidak berarti diberhentikan.' },
      E: { text: 'Tingkat ketepatan waktu selalu bergantung pada jumlah mentor penguji.', why: 'Mentor penguji tidak disebut dalam bacaan.' }
    },
    correct: 'A',
    concept: 'Menarik perbandingan keunggulan metode berdasarkan selisih persentase terukur (96% vs 68%) pada sampel yang dievaluasi.',
    steps: [
      'Kelompok A (proyek aktualisasi langsung): ketepatan waktu 96%.',
      'Kelompok B (studi kasus teoretis): ketepatan waktu 68%.',
      'Simpulkan kaitan metode terhadap tingkat ketepatan waktu pada tiga angkatan yang dievaluasi.'
    ],
    correctReason: 'Selisih 28 poin persentase di tiga angkatan mendukung keunggulan ketepatan waktu pada metode proyek langsung.',
    quickTrick: 'Bandingkan persis dua metode dan variabel ukurannya tanpa menyalahkan kecerdasan subjek.',
    commonMistakes: 'Memilih kesimpulan kebijakan ekstrem ("hapus semua teori").',
    tip: 'Simpulan induktif bersifat deskriptif-evaluatif terhadap data, bukan usulan radikal tanpa premis.',
    refs: [{ title: 'Evaluasi Metode Pelatihan', source: 'Latihan TIU Verbal', note: 'Komparasi Empiris' }]
  },

  // ================= ANALITIS (5) =================
  {
    id: 'TIU-P5-011',
    subject: 'TIU',
    topicSlug: 'analitis',
    subtopic: 'Susunan Berkas Vertikal',
    difficulty: 'MEDIUM',
    stem: 'Lima map berkas tender (V, W, X, Y, dan Z) disusun bertumpuk dari posisi 1 (paling atas) hingga posisi 5 (paling bawah) dengan ketentuan: (1) Berkas Y diletakkan tepat di atas Berkas W; (2) Berkas X berada pada posisi lebih atas daripada Berkas V; (3) Berkas Z berada di posisi nomor 3; (4) Berkas V tidak berada di posisi nomor 5. Berkas apakah yang menempati posisi nomor 2?',
    options: {
      A: { text: 'X', why: 'X menempati posisi nomor 1 (paling atas) karena harus di atas V.' },
      B: { text: 'V', why: 'Benar: susunan unik dari atas ke bawah adalah 1: X, 2: V, 3: Z, 4: Y, 5: W.' },
      C: { text: 'W', why: 'W berada di posisi nomor 5 tepat di bawah Y(4).' },
      D: { text: 'Y', why: 'Jika Y=1 dan W=2, maka X=4 dan V=5, yang melanggar syarat V ≠ 5.' },
      E: { text: 'Z', why: 'Z diketahui pasti berada di posisi nomor 3.' }
    },
    correct: 'B',
    concept: 'Membagi slot atas dan bawah di sekitar elemen tengah yang terkunci (Z=3) untuk mencari tempat pasangan berurutan.',
    steps: [
      'Posisi 3 = Z. Pasangan rapat [Y, W] hanya dapat berada di (1, 2) atau (4, 5).',
      'Jika [Y, W] di (1, 2), sisa posisi adalah (4, 5) untuk X dan V. Karena X lebih atas dari V, maka V = 5 — melanggar syarat (4).',
      'Oleh sebab itu [Y, W] wajib di posisi (4, 5), dan sisa posisi (1, 2) ditempati X = 1 serta V = 2.'
    ],
    correctReason: 'Larangan V di posisi paling bawah memaksa pasangan Y–W mengisi posisi 4–5 sehingga V tepat di posisi 2.',
    quickTrick: 'Z di tengah membelah tumpukan menjadi {1,2} dan {4,5}; V tidak boleh ke-5 -> V harus di {1,2} tepatnya nomor 2.',
    commonMistakes: 'Menukar urutan Y dan W menjadi W di atas Y.',
    tip: 'Pastikan selalu memeriksa arah kata "tepat di atas" (nomor lebih kecil jika nomor 1 paling atas).',
    refs: [{ title: 'Urutan Tumpukan Analitis', source: 'Modul TIU Analitis', note: 'Pembagian Blok oleh Pusat' }]
  },
  {
    id: 'TIU-P5-012',
    subject: 'TIU',
    topicSlug: 'analitis',
    subtopic: 'Jadwal Pekan Olahraga',
    difficulty: 'MEDIUM',
    stem: 'Lima cabang lomba antarinstansi (Badminton, Catur, Futsal, Renang, dan Tenis) diselenggarakan masing-masing satu cabang per hari dari Senin hingga Jumat dengan ketentuan: (1) Futsal dilaksanakan tepat satu hari sebelum Renang; (2) Badminton hanya boleh dijadwalkan pada hari Senin atau Jumat, dan tidak boleh bersebelahan harinya dengan Catur; (3) Catur dilaksanakan pada hari Kamis; (4) Tenis dilaksanakan setelah Futsal. Cabang lomba apakah yang digelar pada hari Rabu?',
    options: {
      A: { text: 'Badminton', why: 'Badminton harus di hari Senin agar tidak bersebelahan dengan Catur di hari Kamis.' },
      B: { text: 'Futsal', why: 'Futsal berada di hari Selasa agar Renang tepat sesudahnya di hari Rabu.' },
      C: { text: 'Renang', why: 'Benar: jadwal unik adalah Senin Badminton, Selasa Futsal, Rabu Renang, Kamis Catur, Jumat Tenis.' },
      D: { text: 'Tenis', why: 'Tenis mengisi hari Jumat setelah Futsal dan Catur.' },
      E: { text: 'Catur', why: 'Catur sudah ditetapkan berlangsung pada hari Kamis.' }
    },
    correct: 'C',
    concept: 'Mengeliminasi salah satu kandidat hari ujung untuk elemen bersyarat, lalu menempatkan pasangan hari berturutan.',
    steps: [
      'Kamis = Catur.',
      'Badminton boleh Senin atau Jumat, tetapi tidak boleh bersebelahan dengan Catur (Kamis). Maka Badminton ≠ Jumat, sehingga Badminton = Senin.',
      'Hari tersisa adalah {Selasa, Rabu, Jumat}. Pasangan rapat [Futsal, Renang] hanya dapat masuk di (Selasa, Rabu).',
      'Maka Selasa = Futsal, Rabu = Renang, dan Jumat = Tenis (memenuhi Tenis setelah Futsal).'
    ],
    correctReason: 'Larangan bersebelahan dengan Kamis memaksa Badminton ke Senin, menyisakan Selasa–Rabu bagi blok Futsal–Renang.',
    quickTrick: 'Kamis = Catur menutup hari Jumat untuk Badminton -> Badminton pasti Senin -> Futsal-Renang wajib Selasa-Rabu.',
    commonMistakes: 'Menaruh Badminton di Jumat lalu lupa bahwa Kamis dan Jumat bersebelahan.',
    tip: 'Cek selalu hubungan bersebelahan dengan hari sebelum dan sesudahnya sekaligus.',
    refs: [{ title: 'Penjadwalan Pekan Analitis', source: 'Bank Soal TIU BKN', note: 'Hari Berdekatan' }]
  },
  {
    id: 'TIU-P5-013',
    subject: 'TIU',
    topicSlug: 'analitis',
    subtopic: 'Matriks Rak 3×2',
    difficulty: 'HARD',
    stem: 'Enam kotak arsip (M, N, O, P, Q, dan R) disimpan dalam rak berisi 3 baris (Atas, Tengah, Bawah) dan 2 kolom (Kiri, Kanan) sehingga setiap sel memuat tepat 1 kotak: (1) M berada di Baris Atas Kolom Kiri; (2) O dan P berada pada baris yang sama, dengan P di sebelah kanan O; (3) R dan N berada pada kolom yang sama, dengan R tepat satu baris di atas N; (4) O tidak berada di Baris Tengah. Kotak apakah yang menempati Baris Tengah Kolom Kiri?',
    options: {
      A: { text: 'M', why: 'M berada di Baris Atas Kolom Kiri.' },
      B: { text: 'N', why: 'N berada di Baris Tengah Kolom Kanan, tepat di bawah R.' },
      C: { text: 'O', why: 'O berada di Baris Bawah Kolom Kiri.' },
      D: { text: 'Q', why: 'Benar: susunan unik rak (Kiri | Kanan) adalah Atas [M | R], Tengah [Q | N], Bawah [O | P].' },
      E: { text: 'R', why: 'R berada di Baris Atas Kolom Kanan.' }
    },
    correct: 'D',
    concept: 'Penalaran spasial kisi 2D (baris × kolom) dengan memperhatikan kapasitas kolom bagi pasangan vertikal.',
    steps: [
      'Atas-Kiri = M. Oleh karena O dan P berbagi satu baris penuh, mereka tidak mungkin di Baris Atas.',
      'Karena O tidak di Baris Tengah, maka [O | P] wajib menempati Baris Bawah (Bawah-Kiri = O, Bawah-Kanan = P).',
      'Sel tersisa: Tengah-Kiri, Atas-Kanan, Tengah-Kanan.',
      'Karena R tepat satu baris di atas N pada kolom yang sama, satu-satunya kolom yang masih punya 2 sel bersebelahan adalah Kolom Kanan (Atas-Kanan = R, Tengah-Kanan = N).',
      'Satu-satunya sel tersisa (Tengah-Kiri) diisi oleh Q.'
    ],
    correctReason: 'Baris Bawah terisi O–P dan Atas-Kiri terisi M, sehingga pasangan vertikal R–N wajib menempati Kolom Kanan dan Q menempati Tengah-Kiri.',
    quickTrick: 'Gambar tabel 3×2: isi M di pojok kiri atas dan O–P di baris paling bawah, lalu masukkan R–N di kolom kanan.',
    commonMistakes: 'Mengabaikan syarat O dan P harus satu baris dengan P di kanan O.',
    tip: 'Untuk soal rak atau denah meja, langsung sketsa kotak 3×2 agar tidak membayangkan di kepala.',
    refs: [{ title: 'Penalaran Spasial Tabel 2D', source: 'Materi TIU HOTS', note: 'Kisi 3×2' }]
  },
  {
    id: 'TIU-P5-014',
    subject: 'TIU',
    topicSlug: 'analitis',
    subtopic: 'Pemeringkatan Skor Komparatif',
    difficulty: 'EASY',
    stem: 'Lima peserta seleksi (Adi, Bela, Candra, Dini, dan Eko) memperoleh nilai akhir yang semuanya berbeda: (1) Nilai Candra lebih tinggi daripada Adi, tetapi lebih rendah daripada Bela; (2) Nilai Dini lebih rendah daripada Adi; (3) Nilai Eko berada di antara Bela dan Candra. Siapakah yang memperoleh nilai tertinggi ke-3?',
    options: {
      A: { text: 'Bela', why: 'Bela menempati peringkat tertinggi ke-1.' },
      B: { text: 'Eko', why: 'Eko menempati peringkat tertinggi ke-2.' },
      C: { text: 'Candra', why: 'Benar: urutan nilai dari tertinggi ke terendah adalah Bela > Eko > Candra > Adi > Dini.' },
      D: { text: 'Adi', why: 'Adi berada pada peringkat ke-4.' },
      E: { text: 'Dini', why: 'Dini memperoleh nilai paling rendah (peringkat ke-5).' }
    },
    correct: 'C',
    concept: 'Menggabungkan rantai pertidaksamaan transitivity menjadi satu garis urutan tunggal.',
    steps: [
      'Dari syarat (1): Bela > Candra > Adi.',
      'Dari syarat (3), Eko berada di antara Bela dan Candra: Bela > Eko > Candra > Adi.',
      'Dari syarat (2), Dini < Adi: Bela > Eko > Candra > Adi > Dini.',
      'Peringkat ke-3 dari yang tertinggi adalah Candra.'
    ],
    correctReason: 'Seluruh 5 peserta terhubung dalam satu rantai ketaksamaan ketat.',
    quickTrick: 'Susun dari kiri (tertinggi) ke kanan (terendah) memakai tanda ">".',
    commonMistakes: 'Menghitung peringkat ke-3 dari bawah alih-alih dari tertinggi (yang kebetulan sama, tetapi berisiko di soal peringkat 2 atau 4).',
    tip: 'Selalu cek apakah urutan diminta dari tertinggi atau terendah.',
    refs: [{ title: 'Perbandingan Bertingkat', source: 'Pedoman TIU Analitis', note: 'Transitivitas Skor' }]
  },
  {
    id: 'TIU-P5-015',
    subject: 'TIU',
    topicSlug: 'analitis',
    subtopic: 'Tata Letak Lahan Barat–Timur',
    difficulty: 'MEDIUM',
    stem: 'Lima jenis tanaman obat (Jahe, Kunyit, Lengkuas, Sereh, dan Temulawak) ditanam masing-masing pada satu petak berurutan bernomor 1 sampai 5 dari barat ke timur: (1) Temulawak ditanam di petak nomor 3; (2) Lengkuas ditanam tepat di sebelah barat Temulawak; (3) Sereh tidak ditanam di petak paling ujung (nomor 1 maupun 5); (4) Kunyit ditanam lebih ke timur daripada Jahe dan tidak bersebelahan dengannya. Tanaman apakah yang berada di petak nomor 4?',
    options: {
      A: { text: 'Jahe', why: 'Jahe harus di petak nomor 1 agar Kunyit bisa di timur tanpa bersebelahan.' },
      B: { text: 'Lengkuas', why: 'Lengkuas berada di petak nomor 2 tepat di sebelah barat Temulawak(3).' },
      C: { text: 'Temulawak', why: 'Temulawak sudah menempati petak nomor 3.' },
      D: { text: 'Kunyit', why: 'Kunyit berada di petak nomor 5 (paling timur).' },
      E: { text: 'Sereh', why: 'Benar: susunan petak 1–5 adalah Jahe, Lengkuas, Temulawak, Sereh, Kunyit.' }
    },
    correct: 'E',
    concept: 'Mengunci petak tengah dan bukan-ujung lebih dulu untuk mempersempit slot yang tersisa.',
    steps: [
      'Petak 3 = Temulawak.',
      'Lengkuas tepat di barat Temulawak -> Petak 2 = Lengkuas.',
      'Sereh bukan petak 1 dan bukan petak 5. Karena petak 2 dan 3 sudah terisi, Sereh wajib di Petak 4.',
      'Petak tersisa adalah {1, 5} untuk Jahe dan Kunyit. Karena Kunyit lebih ke timur daripada Jahe, maka Jahe = 1 dan Kunyit = 5 (memenuhi syarat tidak bersebelahan).'
    ],
    correctReason: 'Larangan posisi ujung bagi Sereh di tengah petak 2 dan 3 yang sudah terisi langsung menguncinya di petak 4.',
    quickTrick: 'Setelah petak 2 dan 3 terisi, syarat "bukan di 1 dan 5" langsung memaksa Sereh = 4.',
    commonMistakes: 'Tertukar arah barat (kiri/nomor kecil) dan timur (kanan/nomor besar).',
    tip: 'Tuliskan arah B (1) — T (5) di atas garis bilangan sebelum mengisi nama tanaman.',
    refs: [{ title: 'Urutan Spasial Linear', source: 'Latihan TIU Analitis', note: 'Arah Mata Angin' }]
  },

  // ================= BERHITUNG (5) =================
  {
    id: 'TIU-P5-016',
    subject: 'TIU',
    topicSlug: 'berhitung',
    subtopic: 'Operasi Campuran Persen & Desimal',
    difficulty: 'EASY',
    stem: 'Nilai dari (2/3 × 1,5) + (35% × 60) - (0,4 × 15) adalah...',
    options: {
      A: { text: '14', why: 'Salah menghitung 35% × 60 sebagai 19.' },
      B: { text: '16', why: 'Benar: 1 + 21 - 6 = 16.' },
      C: { text: '18', why: 'Salah menghitung 0,4 × 15 sebagai 4.' },
      D: { text: '22', why: 'Lupa mengurangkan suku terakhir 6.' },
      E: { text: '28', why: 'Menjumlahkan 6 alih-alih menguranginya.' }
    },
    correct: 'B',
    concept: 'Menghitung masing-masing kelompok perkalian secara terpisah lalu menggabungkan penjumlahan dan pengurangan.',
    steps: [
      '2/3 × 1,5 = 2/3 × 3/2 = 1.',
      '35% × 60 = (35/100) × 60 = 21.',
      '0,4 × 15 = (4/10) × 15 = 6.',
      '1 + 21 - 6 = 16.'
    ],
    correctReason: 'Tiga suku masing-masing menghasilkan 1, 21, dan -6 sehingga hasil akhirnya 16.',
    quickTrick: '2/3 × 3/2 = 1; 35% × 60 = 60% × 35 = 3/5 × 35 = 21; 0,4 × 15 = 6.',
    commonMistakes: 'Salah konversi 1,5 menjadi pecahan atau terburu-buru menghitung 35% × 60.',
    tip: 'Manfaatkan sifat komutatif persen: a% dari b sama nilainya dengan b% dari a (35% × 60 = 60% × 35).',
    refs: [{ title: 'Trik Persentase Komutatif', source: 'Modul Berhitung Cepat TIU', note: 'a% × b = b% × a' }]
  },
  {
    id: 'TIU-P5-017',
    subject: 'TIU',
    topicSlug: 'berhitung',
    subtopic: 'Selisih Kuadrat Desimal',
    difficulty: 'MEDIUM',
    stem: 'Hasil dari (2,5² - 1,5²) ÷ 0,25 adalah...',
    options: {
      A: { text: '4', why: 'Belum dibagi dengan 0,25 (masih berhenti pada nilai pembilang).' },
      B: { text: '8', why: 'Salah mengira pembagian dengan 0,25 sama dengan dikali 2.' },
      C: { text: '12', why: 'Salah menjumlahkan 2,5 + 1,5 sebagai 3.' },
      D: { text: '16', why: 'Benar: ((2,5-1,5)(2,5+1,5)) ÷ (1/4) = (1 × 4) × 4 = 16.' },
      E: { text: '20', why: 'Salah memfaktorkan selisih kuadrat.' }
    },
    correct: 'D',
    concept: 'Selisih kuadrat (a - b)(a + b) dipadukan dengan pembagian oleh 0,25 yang ekuivalen dengan perkalian 4.',
    steps: [
      '2,5² - 1,5² = (2,5 - 1,5)(2,5 + 1,5) = 1 × 4 = 4.',
      'Membagi dengan 0,25 (1/4) sama dengan mengalikan dengan 4.',
      '4 ÷ 0,25 = 4 × 4 = 16.'
    ],
    correctReason: 'Pembilang tepat bernilai 4, dan 4 dibagi seperempat menghasilkan 16.',
    quickTrick: 'Bagi 0,25 = kali 4; (2,5 - 1,5)(2,5 + 1,5) = 4 -> 4 × 4 = 16.',
    commonMistakes: 'Justru mengalikan 4 × 0,25 = 1 bukannya membagi.',
    tip: 'Ingat pasangan cepat desimal: ÷0,5 = ×2, ÷0,25 = ×4, ÷0,2 = ×5, ÷0,125 = ×8.',
    refs: [{ title: 'Pembagian Desimal Cepat', source: 'Panduan Numerik SKD', note: 'Kebalikan Pecahan Satuan' }]
  },
  {
    id: 'TIU-P5-018',
    subject: 'TIU',
    topicSlug: 'berhitung',
    subtopic: 'Akar Pangkat Tiga & Kuadrat',
    difficulty: 'MEDIUM',
    stem: 'Nilai dari ∛216 + √225 - (2⁵ ÷ 4) adalah...',
    options: {
      A: { text: '11', why: 'Salah mengira ∛216 = 4.' },
      B: { text: '13', why: 'Benar: 6 + 15 - (32 ÷ 4) = 21 - 8 = 13.' },
      C: { text: '15', why: 'Salah menghitung 2⁵ ÷ 4 sebagai 6.' },
      D: { text: '17', why: 'Salah menghitung √225 sebagai 19.' },
      E: { text: '29', why: 'Menambahkan +8 alih-alih mengurangi 8.' }
    },
    correct: 'B',
    concept: 'Mengenal bilangan kubik sempurna (6³ = 216), kuadrat sempurna (15² = 225), dan penyederhanaan pangkat dua.',
    steps: [
      '∛216 = 6 karena 6 × 6 × 6 = 216.',
      '√225 = 15 karena 15 × 15 = 225.',
      '2⁵ ÷ 4 = 32 ÷ 4 = 8 (atau 2⁵ ÷ 2² = 2³ = 8).',
      '6 + 15 - 8 = 13.'
    ],
    correctReason: 'Setiap komponen menghasilkan bilangan bulat 6, 15, dan 8.',
    quickTrick: '6³=216, 15²=225, 2⁵/2²=8 -> 6 + 15 - 8 = 13.',
    commonMistakes: 'Mengira ∛216 = 16 atau salah membaca tanda pengurangan.',
    tip: 'Hafalkan bilangan kuadrat 11²–25² dan bilangan kubik 2³–10³ untuk menghemat waktu di subtes TIU.',
    refs: [{ title: 'Akar & Pangkat Istimewa', source: 'Modul Berhitung TIU', note: 'Kuadrat & Kubik Sempurna' }]
  },
  {
    id: 'TIU-P5-019',
    subject: 'TIU',
    topicSlug: 'berhitung',
    subtopic: 'Mengurutkan Pecahan, Desimal & Persen',
    difficulty: 'EASY',
    stem: 'Urutan bilangan berikut dari nilai yang TERKECIL ke TERBESAR yang benar adalah...',
    options: {
      A: { text: '3/5 ; 0,62 ; 5/8 ; 0,64 ; 65%', why: 'Benar: dalam bentuk desimal nilainya adalah 0,600 ; 0,620 ; 0,625 ; 0,640 ; 0,650.' },
      B: { text: '0,62 ; 3/5 ; 5/8 ; 65% ; 0,64', why: 'Salah menaruh 0,62 sebelum 3/5 (0,600) dan 65% sebelum 0,64.' },
      C: { text: '3/5 ; 5/8 ; 0,62 ; 0,64 ; 65%', why: '5/8 (0,625) lebih besar daripada 0,620.' },
      D: { text: '5/8 ; 3/5 ; 0,62 ; 65% ; 0,64', why: 'Menempatkan 5/8 (0,625) di posisi paling kecil.' },
      E: { text: '65% ; 0,64 ; 5/8 ; 0,62 ; 3/5', why: 'Urutan tersebut terbalik dari terbesar ke terkecil.' }
    },
    correct: 'A',
    concept: 'Mengonversi seluruh bentuk (pecahan biasa, persen, desimal) ke desimal tiga angka di belakang koma agar mudah dibandingkan.',
    steps: [
      '3/5 = 0,600.',
      '0,62 = 0,620.',
      '5/8 = 0,625.',
      '0,64 = 0,640.',
      '65% = 0,650.',
      'Urutan menaik: 3/5 ; 0,62 ; 5/8 ; 0,64 ; 65%.'
    ],
    correctReason: 'Nilai desimal berurut naik ketat: 0,600 < 0,620 < 0,625 < 0,640 < 0,650.',
    quickTrick: 'Ingat nilai hafalan 1/8 = 0,125 sehingga 5/8 = 0,625, tepat di antara 0,62 dan 0,64.',
    commonMistakes: 'Mengira 5/8 lebih kecil daripada 0,62 karena membulatkan 5/8 menjadi 0,6.',
    tip: 'Hafalkan keluarga pecahan perdelapan (1/8 = 0,125; 3/8 = 0,375; 5/8 = 0,625; 7/8 = 0,875).',
    refs: [{ title: 'Konversi Pecahan Istimewa', source: 'Materi Numerik BKN', note: 'Urutan Pecahan' }]
  },
  {
    id: 'TIU-P5-020',
    subject: 'TIU',
    topicSlug: 'berhitung',
    subtopic: 'Konversi Satuan & Proporsi Campuran',
    difficulty: 'MEDIUM',
    stem: 'Untuk membuat larutan disinfektan, cairan A dan cairan B dicampurkan dengan perbandingan volume 3 : 5. Jika tersedia 1,2 liter cairan A dan seluruhnya dihabiskan sesuai perbandingan tersebut, berapa mililiter total campuran yang terbentuk?',
    options: {
      A: { text: '2.000 mL', why: 'Baru menghitung volume cairan B saja (5 × 400 mL), bukan total campuran.' },
      B: { text: '2.400 mL', why: 'Salah mengonversi 1,2 liter atau mengalikan rasio.' },
      C: { text: '3.000 mL', why: 'Perkiraan kasar tanpa membagi rasio 3.' },
      D: { text: '3.200 mL', why: 'Benar: 3 bagian = 1.200 mL sehingga 1 bagian = 400 mL; total (3+5) = 8 bagian = 3.200 mL.' },
      E: { text: '3.600 mL', why: 'Menggunakan 9 bagian total.' }
    },
    correct: 'D',
    concept: 'Mengonversi liter ke mililiter (1 L = 1.000 mL) lalu memakai metode satuan bagian rasio.',
    steps: [
      '1,2 liter = 1.200 mL.',
      'Rasio cairan A = 3 bagian = 1.200 mL -> 1 bagian = 400 mL.',
      'Total campuran = (3 + 5) bagian = 8 bagian = 8 × 400 mL = 3.200 mL.'
    ],
    correctReason: 'Kedelapan bagian proporsi menghasilkan 8 × 400 mL = 3.200 mL.',
    quickTrick: '(8/3) × 1.200 mL = 8 × 400 = 3.200 mL.',
    commonMistakes: 'Berhenti menghitung setelah menemukan volume B (2.000 mL) padahal yang ditanya TOTAL campuran.',
    tip: 'Beri garis bawah pada kata "total" dan satuan akhir ("mililiter") pada soal cerita/berhitung.',
    refs: [{ title: 'Rasio & Konversi Satuan Volume', source: 'Modul Berhitung TIU', note: 'Liter ke Mililiter' }]
  },

  // ================= DERET ANGKA (5) =================
  {
    id: 'TIU-P5-021',
    subject: 'TIU',
    topicSlug: 'deret-angka',
    subtopic: 'Deret Selisih Kelipatan Dua',
    difficulty: 'EASY',
    stem: 'Tentukan bilangan berikutnya pada deret: 4, 9, 19, 39, 79, ...',
    options: {
      A: { text: '119', why: 'Menambah +40 lagi alih-alih +80.' },
      B: { text: '139', why: 'Salah menjumlahkan 79 + 60.' },
      C: { text: '157', why: 'Menghitung 2×79 - 1.' },
      D: { text: '159', why: 'Benar: selisihnya +5, +10, +20, +40, +80 (atau pola 2n + 1), sehingga 79 + 80 = 159.' },
      E: { text: '161', why: 'Menghitung 2×79 + 3.' }
    },
    correct: 'D',
    concept: 'Barisan dengan selisih bertambah dua kali lipat setiap langkah (+5, +10, +20, +40, +80) yang setara dengan aturan 2n + 1.',
    steps: [
      'Cek selisih: 9-4=5, 19-9=10, 39-19=20, 79-39=40.',
      'Selisih selalu dikali 2 -> selisih berikutnya 40 × 2 = 80.',
      '79 + 80 = 159 (atau 2 × 79 + 1 = 159).'
    ],
    correctReason: 'Kedua sudut pandang (selisih ×2 dan 2n + 1) menghasilkan angka 159.',
    quickTrick: '4×2+1=9, 9×2+1=19 -> maka 79×2+1 = 159.',
    commonMistakes: 'Menggunakan selisih +60 (mengira naik +20 tetap setelah 20 dan 40).',
    tip: 'Jika dua atau tiga selisih awal tampak berlipat dua (5, 10, 20), segera cek faktor kali dua pada sukunya.',
    refs: [{ title: 'Deret Rekursif Linier', source: 'Pedoman TIU Deret', note: 'Pola 2n + 1' }]
  },
  {
    id: 'TIU-P5-022',
    subject: 'TIU',
    topicSlug: 'deret-angka',
    subtopic: 'Deret Kuadrat Bergeser',
    difficulty: 'EASY',
    stem: 'Perhatikan barisan bilangan: 2, 5, 10, 17, 26, 37, ... Bilangan yang tepat untuk melanjutkan barisan tersebut adalah...',
    options: {
      A: { text: '48', why: 'Menambah +11 lagi, bukan +13.' },
      B: { text: '49', why: 'Merupakan 7² tanpa ditambah 1.' },
      C: { text: '50', why: 'Benar: polanya n² + 1 (atau selisih bilangan ganjil +3, +5, +7, +9, +11, +13), sehingga 37 + 13 = 50.' },
      D: { text: '52', why: 'Salah menjumlahkan 37 + 15.' },
      E: { text: '54', why: 'Salah mengira pola selisih +17.' }
    },
    correct: 'C',
    concept: 'Barisan dengan beda bilangan ganjil berurutan (+3, +5, +7, +9, +11, +13) atau rumus eksplisit n² + 1.',
    steps: [
      'Selisih antarsuku: +3, +5, +7, +9, +11.',
      'Selisih berikutnya adalah +13.',
      '37 + 13 = 50 (selaras dengan 7² + 1 = 49 + 1 = 50).'
    ],
    correctReason: 'Baik melihat beda ganjil berurutan maupun n² + 1 memberikan 50.',
    quickTrick: 'Selisih ganjil +3, +5, +7, +9, +11 -> lanjut +13 -> 37 + 13 = 50.',
    commonMistakes: 'Melewati +13 langsung ke +15 (mengira hanya bilangan prima atau loncat 4).',
    tip: 'Tuliskan beda tingkat pertama untuk memverifikasi langkah ganjil berurutan.',
    refs: [{ title: 'Deret Kuadrat dan Bilangan Ganjil', source: 'Modul Deret TIU', note: 'n² + 1' }]
  },
  {
    id: 'TIU-P5-023',
    subject: 'TIU',
    topicSlug: 'deret-angka',
    subtopic: 'Deret Rasio Pecahan Bergantian',
    difficulty: 'HARD',
    stem: 'Diketahui pola deret: 128, 64, 96, 48, 72, 36, ... Bilangan selanjutnya adalah...',
    options: {
      A: { text: '18', why: 'Mengulang operasi ÷2 dua kali berturut-turut.' },
      B: { text: '48', why: 'Menambah +12 tanpa memperhatikan rasio 3/2.' },
      C: { text: '52', why: 'Salah menghitung 36 × 1,5.' },
      D: { text: '54', why: 'Benar: operatornya bergantian ÷2 lalu ×1,5 (atau ×3/2), sehingga 36 × 1,5 = 54.' },
      E: { text: '72', why: 'Mengalikan 36 dengan 2 alih-alih 1,5.' }
    },
    correct: 'D',
    concept: 'Pola dua operator bergantian menggunakan pecahan/rasio (÷2 kemudian ×3/2).',
    steps: [
      '128 ÷ 2 = 64.',
      '64 × 3/2 = 96.',
      '96 ÷ 2 = 48.',
      '48 × 3/2 = 72.',
      '72 ÷ 2 = 36.',
      'Berikutnya giliran ×3/2: 36 × 3/2 = 54.'
    ],
    correctReason: 'Setiap turun dibagi 2, setiap naik dikali 1,5 (tambah setengahnya); setelah 72 ÷ 2 = 36, gilirannya 36 + 18 = 54.',
    quickTrick: 'Naik setengahnya (64+32=96, 48+24=72), lalu bagi 2 -> setelah ÷2 ke 36, tambah setengahnya 36+18 = 54!',
    commonMistakes: 'Mengira 72 ke 36 lalu kembali ke 72 (×2).',
    tip: 'Mengartikan "×1,5" sebagai "tambah setengahnya" jauh lebih cepat daripada perkalian desimal.',
    refs: [{ title: 'Deret Rasio Campuran', source: 'Bank Soal TIU HOTS', note: 'Siklus ÷2 dan ×1,5' }]
  },
  {
    id: 'TIU-P5-024',
    subject: 'TIU',
    topicSlug: 'deret-angka',
    subtopic: 'Deret Dua Larik Aritmetika–Geometri',
    difficulty: 'MEDIUM',
    stem: 'Perhatikan barisan dua larik: 7, 10, 14, 15, 28, 20, 56, ... Bilangan yang tepat untuk mengisi titik-titik adalah...',
    options: {
      A: { text: '25', why: 'Benar: suku posisi genap membentuk barisan aritmetika +5 (10, 15, 20, 25).' },
      B: { text: '30', why: 'Meloncat +10 dari 20.' },
      C: { text: '61', why: 'Menambahkan +5 pada suku larik ganjil 56.' },
      D: { text: '84', why: 'Menambahkan 56 + 28.' },
      E: { text: '112', why: 'Menghitung suku ke-9 (larik ganjil: 56 × 2), bukan suku ke-8.' }
    },
    correct: 'A',
    concept: 'Memisahkan dua barisan independen yang disisipkan selang-seling: satu geometri (×2), satu aritmetika (+5).',
    steps: [
      'Larik ganjil (suku 1, 3, 5, 7): 7, 14, 28, 56 (pola ×2).',
      'Larik genap (suku 2, 4, 6, 8): 10, 15, 20, ... (pola +5).',
      'Suku yang ditanya adalah posisi ke-8 (larik genap), maka 20 + 5 = 25.'
    ],
    correctReason: 'Suku ke-8 melanjutkan deret genap 10, 15, 20 menjadi 25.',
    quickTrick: 'Tandai suku genap (10, 15, 20, ...): selisihnya konstan +5 -> langsung jawab 25.',
    commonMistakes: 'Mengalikan 56 dengan 2 untuk mendapat 112 karena lupa memeriksa indeks suku ke-8.',
    tip: 'Tulis nomor urut kecil di atas barisan bila ada pola melompat satu suku.',
    refs: [{ title: 'Deret Dua Larik Gabungan', source: 'Materi TIU Numerik', note: 'Geometri + Aritmetika' }]
  },
  {
    id: 'TIU-P5-025',
    subject: 'TIU',
    topicSlug: 'deret-angka',
    subtopic: 'Deret Bertingkat Dua (Bilangan Segitiga)',
    difficulty: 'HARD',
    stem: 'Lengkapi deret berikut: 2, 3, 6, 12, 22, 37, ...',
    options: {
      A: { text: '52', why: 'Mengulangi selisih +15 dari langkah sebelumnya.' },
      B: { text: '55', why: 'Menambah +18 (keliru menambah selisih tingkat dua).' },
      C: { text: '58', why: 'Benar: selisih tingkat-1 adalah +1, +3, +6, +10, +15 yang selisih tingkat-2-nya naik +2, +3, +4, +5, +6 -> selisih berikutnya 15 + 6 = 21, sehingga 37 + 21 = 58.' },
      D: { text: '60', why: 'Menambah +23 alih-alih +21.' },
      E: { text: '62', why: 'Salah menjumlahkan selisih tingkat kedua.' }
    },
    correct: 'C',
    concept: 'Deret bertingkat dua di mana beda tingkat-1 (1, 3, 6, 10, 15) memiliki beda tingkat-2 (+2, +3, +4, +5, +6).',
    steps: [
      'Hitung selisih tingkat-1: 3-2=1; 6-3=3; 12-6=6; 22-12=10; 37-22=15.',
      'Hitung selisih tingkat-2: 3-1=2; 6-3=3; 10-6=4; 15-10=5.',
      'Selisih tingkat-2 berikutnya = +6 -> selisih tingkat-1 berikutnya = 15 + 6 = +21.',
      'Suku berikutnya = 37 + 21 = 58.'
    ],
    correctReason: 'Pola tingkat-2 (+2, +3, +4, +5, +6) menaikkan penambah terakhir menjadi +21 sehingga 37 + 21 = 58.',
    quickTrick: 'Bila tingkat-1 (+1, +3, +6, +10, +15) belum konstan, turun satu tingkat lagi: +2, +3, +4, +5, +6!',
    commonMistakes: 'Berhenti mencari pola setelah melihat tingkat-1 tidak tetap.',
    tip: 'Untuk deret yang naik pelan namun semakin curam tanpa perkalian rapi, selalu uji selisih tingkat kedua.',
    refs: [{ title: 'Deret Bertingkat Dua', source: 'Pedoman TIU BKN', note: 'Selisih Tingkat-2' }]
  },

  // ================= PERBANDINGAN KUANTITATIF (5) =================
  {
    id: 'TIU-P5-026',
    subject: 'TIU',
    topicSlug: 'perbandingan-kuantitatif',
    subtopic: 'Ketidaksamaan Aljabar Bilangan Negatif',
    difficulty: 'MEDIUM',
    stem: 'Diketahui x adalah bilangan real negatif (x < 0). Jika P = 3x - 4 dan Q = 5x - 4, maka hubungan yang tepat antara P dan Q adalah...',
    options: {
      A: { text: 'P > Q', why: 'Benar: P - Q = (3x - 4) - (5x - 4) = -2x; karena x < 0 maka -2x > 0 sehingga P > Q.' },
      B: { text: 'P < Q', why: 'Hanya berlaku jika x > 0.' },
      C: { text: 'P = Q', why: 'Hanya berlaku jika x = 0, padahal x < 0.' },
      D: { text: 'P + Q = -8', why: 'P + Q = 8x - 8 < -8.' },
      E: { text: 'Hubungan P dan Q tidak dapat ditentukan', why: 'Nilai selisih -2x selalu bertanda positif untuk setiap x < 0.' }
    },
    correct: 'A',
    concept: 'Mengurangkan P - Q lalu menentukan tanda aljabar berdasarkan syarat domain x < 0.',
    steps: [
      'Hitung selisih P - Q = (3x - 4) - (5x - 4) = -2x.',
      'Diketahui x < 0. Mengalikan pertidaksamaan x < 0 dengan bilangan negatif -2 membalik tanda ketidaksamaan menjadi -2x > 0.',
      'Karena P - Q > 0, maka selalu berlaku P > Q (contoh uji x = -1 -> P = -7 > Q = -9).'
    ],
    correctReason: 'Koefisien lebih kecil (3 vs 5) dikalikan bilangan negatif menghasilkan nilai lebih besar.',
    quickTrick: 'Substitusi uji x = -1: P = -7, Q = -9 -> jelas P > Q.',
    commonMistakes: 'Lupa bahwa -7 lebih besar daripada -9 di garis bilangan negatif.',
    tip: 'Selalu pakai metode P - Q dan cek ulang pada garis bilangan saat berurusan dengan bilangan negatif.',
    refs: [{ title: 'Pertidaksamaan Bilangan Negatif', source: 'Modul Kuantitatif TIU', note: 'Analisis Selisih P-Q' }]
  },
  {
    id: 'TIU-P5-027',
    subject: 'TIU',
    topicSlug: 'perbandingan-kuantitatif',
    subtopic: 'Rata-Rata Bilangan Berurutan',
    difficulty: 'EASY',
    stem: 'Jika P adalah rata-rata dari lima bilangan bulat berurutan yang dimulai dari 11, dan Q = 13, maka pernyataan yang paling tepat adalah...',
    options: {
      A: { text: 'P > Q', why: 'Rata-rata dari 11, 12, 13, 14, 15 tepat 13.' },
      B: { text: 'P < Q', why: 'Kedua nilai sama besar.' },
      C: { text: 'P = Q', why: 'Benar: untuk ganjil suku berurutan (11, 12, 13, 14, 15), rata-ratanya sama dengan nilai tengah, yakni 13.' },
      D: { text: 'P = 2Q', why: '13 tidak sama dengan 26.' },
      E: { text: 'Hubungan P dan Q tidak dapat ditentukan', why: 'Kelima bilangan bernilai spesifik.' }
    },
    correct: 'C',
    concept: 'Pada barisan aritmetika dengan jumlah suku ganjil, rata-rata tepat sama dengan median (suku tengah).',
    steps: [
      'Lima bilangan bulat berurutan mulai dari 11 adalah 11, 12, 13, 14, 15.',
      'Rata-rata P = (11 + 12 + 13 + 14 + 15) / 5 = 65 / 5 = 13 (tepat suku tengahnya).',
      'Karena Q = 13, maka P = Q.'
    ],
    correctReason: 'Nilai tengah dan rata-rata kelima bilangan berurutan sama-sama 13.',
    quickTrick: 'Rata-rata barisan berjarak sama = (awal + akhir) / 2 = (11 + 15) / 2 = 13.',
    commonMistakes: 'Keliru menghitung 11 hingga 15 hanya sampai 14 (empat angka).',
    tip: 'Gunakan rumus (awal + akhir)/2 untuk menghitung rata-rata deret berjarak konstan dalam 2 detik.',
    refs: [{ title: 'Sifat Simetri Aritmetika', source: 'Bank Soal TIU Numerik', note: 'Rata-Rata = Median' }]
  },
  {
    id: 'TIU-P5-028',
    subject: 'TIU',
    topicSlug: 'perbandingan-kuantitatif',
    subtopic: 'Konversi Kecepatan Rata-Rata',
    difficulty: 'EASY',
    stem: 'Seorang pelari menempuh lintasan sejauh 18 km dalam waktu 1 jam 30 menit. Jika P adalah kecepatan rata-rata pelari tersebut dalam satuan km/jam dan Q = 14, maka...',
    options: {
      A: { text: 'P > Q', why: '12 km/jam lebih kecil daripada 14.' },
      B: { text: 'P < Q', why: 'Benar: P = 18 / 1,5 = 12 km/jam, sehingga P < 14 (Q).' },
      C: { text: 'P = Q', why: '12 tidak sama dengan 14.' },
      D: { text: 'P - Q = 2', why: 'Terbalik, Q - P = 2.' },
      E: { text: 'Hubungan P dan Q tidak dapat ditentukan', why: 'Nilai P dapat dihitung eksak.' }
    },
    correct: 'B',
    concept: 'Kecepatan rata-rata = Jarak ÷ Waktu (dengan waktu dinyatakan dalam satuan jam).',
    steps: [
      'Ubah waktu ke jam: 1 jam 30 menit = 1,5 jam = 3/2 jam.',
      'Hitung P: 18 ÷ (3/2) = 18 × 2/3 = 12 km/jam.',
      'Bandingkan dengan Q = 14 -> 12 < 14, maka P < Q.'
    ],
    correctReason: 'Kecepatan rata-rata pelari adalah 12 km/jam yang bernilai di bawah 14.',
    quickTrick: '18 ÷ 1,5 = 36 ÷ 3 = 12 -> 12 < 14.',
    commonMistakes: 'Mengira 1 jam 30 menit = 1,3 jam.',
    tip: 'Kalikan penyebut dan pembilang dengan 2 saat membagi dengan 1,5.',
    refs: [{ title: 'Kecepatan & Konversi Menit', source: 'Modul Numerik TIU', note: 'Jarak Bagi Waktu' }]
  },
  {
    id: 'TIU-P5-029',
    subject: 'TIU',
    topicSlug: 'perbandingan-kuantitatif',
    subtopic: 'Persentase Naik–Turun Berurutan',
    difficulty: 'MEDIUM',
    stem: 'Harga sebuah jaket dinaikkan 25% dari harga awal, lalu sebulan kemudian diturunkan 20% dari harga setelah kenaikan. Jika P adalah harga akhir jaket tersebut dan Q adalah harga awal jaket sebelum dinaikkan, maka...',
    options: {
      A: { text: 'P > Q', why: 'Salah menjumlahkan +25% dan -20% menjadi +5% terhadap basis yang sama.' },
      B: { text: 'P < Q', why: 'Tidak turun karena faktor kalinya tepat 1,25 × 0,80 = 1.' },
      C: { text: 'P = Q', why: 'Benar: P = (125% × 80%) × Q = 1,25 × 0,80 × Q = 1 × Q.' },
      D: { text: 'P = 1,05Q', why: 'Kesalahan umum mengurangkan langsung 25% - 20% tanpa mengubah basis.' },
      E: { text: 'Hubungan P dan Q tidak dapat ditentukan', why: 'Perbandingan persentase tidak bergantung pada nominal harga awal.' }
    },
    correct: 'C',
    concept: 'Perubahan persentase beruntun bekerja secara multiplikatif: (1 + a%)(1 - b%), bukan penjumlahan aljabar biasa.',
    steps: [
      'Misalkan harga awal Q = 100 (atau gunakan Q langsung).',
      'Naik 25%: harga menjadi 125% × 100 = 125.',
      'Turun 20% dari harga baru: P = 80% × 125 = 100.',
      'Karena P = 100 dan Q = 100, maka P = Q.'
    ],
    correctReason: 'Penurunan 20% dihitung dari harga yang lebih tinggi (125%), sehingga pengurangannya sebesar 25 dan kembali persis ke 100.',
    quickTrick: 'Ambil permisalan Q = 100 -> naik 25% jadi 125 -> turun 20% (1/5 dari 125 = 25) -> kembali tepat 100!',
    commonMistakes: 'Menjawab P > Q dengan menghitung 25% - 20% = +5%.',
    tip: 'Jika harga awal tidak disebutkan angkanya, langsung misalkan nilai awal = 100.',
    refs: [{ title: 'Jebakan Persentase Berantai', source: 'Pedoman TIU Kuantitatif', note: 'Basis Berubah' }]
  },
  {
    id: 'TIU-P5-030',
    subject: 'TIU',
    topicSlug: 'perbandingan-kuantitatif',
    subtopic: 'Nilai Maksimum Hasil Kali Bilangan Positif',
    difficulty: 'HARD',
    stem: 'Diketahui m dan n adalah bilangan bulat positif yang memenuhi m + n = 10. Jika P = m × n dan Q = 26, maka hubungan yang benar antara P dan Q adalah...',
    options: {
      A: { text: 'P > Q', why: 'Nilai hasil kali terbesar ketika m = n = 5 hanya mencapai 25, tidak pernah melebihi 26.' },
      B: { text: 'P < Q', why: 'Benar: untuk m + n = 10 dengan m, n > 0, nilai maksimum P = 5 × 5 = 25, sehingga selalu P ≤ 25 < 26 = Q.' },
      C: { text: 'P = Q', why: 'Tidak ada pasangan bilangan real berjumlah 10 yang hasil kalinya 26.' },
      D: { text: 'P - Q = 1', why: 'Nilai terbesar P - Q justru -1.' },
      E: { text: 'Hubungan P dan Q tidak dapat ditentukan', why: 'Meskipun P bervariasi (9, 16, 21, 24, 25), seluruh kemungkinannya tetap lebih kecil dari 26.' }
    },
    correct: 'B',
    concept: 'Ketaksamaan AM-GM: untuk jumlah tetap m + n = S, hasil kali m × n mencapai maksimum ketika m = n = S/2.',
    steps: [
      'Daftar kemungkinan pasangan bulat positif (m, n) dengan m + n = 10: (1,9), (2,8), (3,7), (4,6), (5,5).',
      'Nilai P = m × n yang mungkin hanyalah: 9, 16, 21, 24, dan maksimum 25.',
      'Karena seluruh kemungkinan nilai P ≤ 25 sementara Q = 26, maka dipastikan P < Q.'
    ],
    correctReason: 'Batas atas hasil kali P adalah 25 yang secara ketat berada di bawah 26.',
    quickTrick: 'Jumlah dua bilangan tetap = 10 -> hasil kali paling besar saat sama besar (5 × 5 = 25) -> 25 < 26, pasti P < Q!',
    commonMistakes: 'Menjawab "tidak dapat ditentukan" hanya karena nilai P bisa bermacam-macam, padahal semuanya tetap < 26.',
    tip: 'Bervariasi bukan berarti tak dapat dibandingkan; bandingkan batas maksimum/minimumnya terhadap Q.',
    refs: [{ title: 'Optimasi Hasil Kali AM-GM', source: 'Materi TIU HOTS Kuantitatif', note: 'Batas Atas Perkalian' }]
  },

  // ================= SOAL CERITA (5) =================
  {
    id: 'TIU-P5-031',
    subject: 'TIU',
    topicSlug: 'soal-cerita',
    subtopic: 'Rasio & Selisih Tabungan',
    difficulty: 'EASY',
    stem: 'Perbandingan uang tabungan Rina dan Sinta adalah 5 : 3. Jika selisih uang tabungan mereka berdua adalah Rp120.000, berapakah jumlah uang tabungan Rina dan Sinta?',
    options: {
      A: { text: 'Rp360.000', why: 'Salah mengali jumlah rasio dengan Rp45.000.' },
      B: { text: 'Rp420.000', why: 'Menggunakan 7 bagian alih-alih 8 bagian.' },
      C: { text: 'Rp480.000', why: 'Benar: ((5 + 3) / (5 - 3)) × Rp120.000 = (8 / 2) × Rp120.000 = Rp480.000.' },
      D: { text: 'Rp540.000', why: 'Salah membagi selisih rasio.' },
      E: { text: 'Rp600.000', why: 'Mengira selisih rasio bernilai 1 bagian.' }
    },
    correct: 'C',
    concept: 'Mengubah informasi selisih dua rasio menjadi pengali jumlah rasio: Jumlah = ((a+b)/(a-b)) × Selisih.',
    steps: [
      'Selisih bagian rasio = 5 - 3 = 2 bagian = Rp120.000 -> 1 bagian = Rp60.000.',
      'Jumlah bagian rasio = 5 + 3 = 8 bagian.',
      'Jumlah tabungan = 8 × Rp60.000 = Rp480.000.'
    ],
    correctReason: 'Setiap satu bagian bernilai Rp60.000, sehingga gabungan 8 bagian berjumlah Rp480.000.',
    quickTrick: '(8 / 2) × 120.000 = 4 × 120.000 = Rp480.000.',
    commonMistakes: 'Membagi Rp120.000 dengan 8 (total bagian) padahal Rp120.000 adalah SELISIH.',
    tip: 'Samakan penyebut rasio dengan besaran yang diketahui di soal (diketahui selisih -> bagi selisih rasio).',
    refs: [{ title: 'Aritmetika Perbandingan Senilai', source: 'Modul Soal Cerita TIU', note: 'Selisih ke Jumlah' }]
  },
  {
    id: 'TIU-P5-032',
    subject: 'TIU',
    topicSlug: 'soal-cerita',
    subtopic: 'Aritmetika Sosial Harga Beli & Keuntungan',
    difficulty: 'MEDIUM',
    stem: 'Sebuah koperasi unit menjual perangkat pencetak dokumen seharga Rp1.800.000 dan memperoleh keuntungan sebesar 20% dari harga beli. Berapakah harga beli perangkat tersebut?',
    options: {
      A: { text: 'Rp1.400.000', why: 'Salah membagi 1.800.000 dengan 1,28.' },
      B: { text: 'Rp1.440.000', why: 'Kesalahan umum menghitung 80% × Rp1.800.000.' },
      C: { text: 'Rp1.500.000', why: 'Benar: Harga Jual = 120% × Harga Beli, sehingga Harga Beli = Rp1.800.000 ÷ 1,2 = Rp1.500.000.' },
      D: { text: 'Rp1.560.000', why: 'Menghitung persen untung secara terbalik.' },
      E: { text: 'Rp1.600.000', why: 'Mengira untung tetap Rp200.000.' }
    },
    correct: 'C',
    concept: 'Basis persentase keuntungan selalu harga beli: Harga Jual = (100% + %Untung) × Harga Beli.',
    steps: [
      'Harga Jual = 120% × Harga Beli = Rp1.800.000.',
      'Harga Beli = (100 / 120) × Rp1.800.000 = (5 / 6) × Rp1.800.000 = Rp1.500.000.',
      'Verifikasi: 20% dari Rp1.500.000 = Rp300.000; Rp1.500.000 + Rp300.000 = Rp1.800.000.'
    ],
    correctReason: 'Pembagian Rp1.800.000 oleh 120% mengembalikan modal awal tepat Rp1.500.000.',
    quickTrick: 'Untung 20% -> kalikan harga jual dengan 100/120 = 5/6 -> (5/6) × 1.800.000 = Rp1.500.000.',
    commonMistakes: 'Langsung mengurangi 20% dari Rp1.800.000 sehingga keliru menjawab Rp1.440.000.',
    tip: 'JANGAN pernah mengalikan persentase untung/rugi langsung terhadap harga jual bila yang ditanya harga beli.',
    refs: [{ title: 'Aritmetika Sosial Koperasi', source: 'Pedoman TIU BKN', note: 'Harga Jual ke Harga Beli' }]
  },
  {
    id: 'TIU-P5-033',
    subject: 'TIU',
    topicSlug: 'soal-cerita',
    subtopic: 'Diagram Venn Dua Himpunan',
    difficulty: 'EASY',
    stem: 'Dari 40 peserta pelatihan analisis data, 26 orang menguasai aplikasi spreadsheet, 19 orang menguasai pemrograman Python, dan 6 orang belum menguasai keduanya. Berapa banyak peserta yang menguasai keduanya sekaligus?',
    options: {
      A: { text: '8 orang', why: 'Salah menjumlahkan 26 + 19 sebagai 42.' },
      B: { text: '9 orang', why: 'Tidak memasukkan 6 orang yang tidak menguasai keduanya ke semesta.' },
      C: { text: '11 orang', why: 'Benar: (26 + 19 + 6) - 40 = 51 - 40 = 11 orang.' },
      D: { text: '13 orang', why: 'Mengurangi 6 dari 40 sebelum menghitung irisan secara keliru.' },
      E: { text: '15 orang', why: '15 adalah banyak peserta yang HANYA menguasai spreadsheet.' }
    },
    correct: 'C',
    concept: 'Prinsip inklusi-eksklusi himpunan: Semesta = n(A) + n(B) - n(A ∩ B) + n(di luar A ∪ B).',
    steps: [
      '40 = 26 + 19 - x + 6.',
      '40 = 51 - x.',
      'x = 51 - 40 = 11 orang.'
    ],
    correctReason: 'Jumlah peserta pada gabungan plus luar semesta melebihi 40 sebesar 11 yang merupakan irisan keduanya.',
    quickTrick: 'Trik S+I = L (Semesta + Irisan = Lainnya): 40 + x = 26 + 19 + 6 -> x = 51 - 40 = 11.',
    commonMistakes: 'Lupa memasukkan komponen "tidak keduanya" (6 orang) atau malah mengurangkannya ke arah terbalik.',
    tip: 'Rumus S + I = A + B + T (Semesta + Irisan = Himpunan A + Himpunan B + Tidak keduanya) anti-tertukar.',
    refs: [{ title: 'Himpunan & Diagram Venn', source: 'Modul TIU SKD', note: 'Trik S + I = L' }]
  },
  {
    id: 'TIU-P5-034',
    subject: 'TIU',
    topicSlug: 'soal-cerita',
    subtopic: 'Skala Peta & Konversi Jarak',
    difficulty: 'EASY',
    stem: 'Pada sebuah peta wilayah berskala 1 : 400.000, jarak lurus antara dua kantor kecamatan tercatat sepanjang 6,5 cm. Berapa kilometer jarak sebenarnya antara kedua kantor kecamatan tersebut?',
    options: {
      A: { text: '2,6 km', why: 'Kurang satu angka nol saat mengonversi cm ke km.' },
      B: { text: '24 km', why: 'Salah mengalikan 6 × 400.000 dan mengabaikan 0,5 cm.' },
      C: { text: '26 km', why: 'Benar: 6,5 × 400.000 cm = 2.600.000 cm = 26 km.' },
      D: { text: '260 km', why: 'Kelebihan satu nol saat mengonversi cm ke km (dibagi 10.000 alih-alih 100.000).' },
      E: { text: '65 km', why: 'Mengira skala 1 : 1.000.000.' }
    },
    correct: 'C',
    concept: 'Jarak sebenarnya = Jarak peta × Penyebut skala, lalu dibagi 100.000 untuk mengubah cm menjadi km.',
    steps: [
      '1 km = 100.000 cm, sehingga skala 1 : 400.000 berarti 1 cm mewakili 4 km.',
      'Jarak sebenarnya = 6,5 × 4 km = 26 km.'
    ],
    correctReason: 'Coret lima nol pada 400.000 langsung memberi faktor 4 km per sentimeter peta, dan 6,5 × 4 = 26 km.',
    quickTrick: 'Langsung coret 5 nol skala -> 1 cm = 4 km -> 6,5 × 4 = 26 km!',
    commonMistakes: 'Salah jumlah nol saat konversi cm ke km (10⁴ vs 10⁵).',
    tip: 'Selalu ubah penyebut skala ke km di awal dengan mencoret 5 angka nol.',
    refs: [{ title: 'Skala & Peta Wilayah', source: 'Latihan TIU Numerik', note: 'Konversi cm ke km' }]
  },
  {
    id: 'TIU-P5-035',
    subject: 'TIU',
    topicSlug: 'soal-cerita',
    subtopic: 'Kerja Bertahap & Kerja Sama',
    difficulty: 'HARD',
    stem: 'Andi dapat menyelesaikan penataan satu rak arsip sendirian dalam waktu 6 jam, sedangkan Bima dapat menyelesaikannya sendirian dalam waktu 3 jam. Andi mulai bekerja sendirian selama 2 jam pertama, kemudian Bima bergabung membantunya hingga seluruh rak selesai. Berapa total waktu yang dibutuhkan sejak Andi mulai bekerja hingga penataan rak selesai?',
    options: {
      A: { text: '2 jam 40 menit', why: 'Hanya menghitung sisa waktu kerja bersama setelah mengira bagian Andi sudah 2/3.' },
      B: { text: '3 jam', why: 'Mengira sisa 2/3 rak diselesaikan dalam 1 jam bersama.' },
      C: { text: '3 jam 20 menit', why: 'Benar: Andi menyelesaikan 2/6 = 1/3 bagian dalam 2 jam; sisa 2/3 dikerjakan bersama (laju 1/6 + 1/3 = 1/2 per jam) selama 4/3 jam = 1 jam 20 menit; total = 3 jam 20 menit.' },
      D: { text: '3 jam 40 menit', why: 'Salah menjumlahkan pecahan sisa pekerjaan.' },
      E: { text: '4 jam', why: 'Mengira Bima tidak ikut mempercepat bagian akhir.' }
    },
    correct: 'C',
    concept: 'Menghitung porsi awal individu lalu membagi sisa pekerjaan dengan jumlah laju gabungan dan menjumlahkan kedua fase waktu.',
    steps: [
      'Misalkan 1 rak = KPK(6, 3) = 6 unit berkas -> Laju Andi = 1 unit/jam, laju Bima = 2 unit/jam.',
      'Fase 1 (Andi sendiri 2 jam): selesai 2 × 1 = 2 unit -> sisa 6 - 2 = 4 unit.',
      'Fase 2 (Andi + Bima bersama): laju gabungan = 1 + 2 = 3 unit/jam.',
      'Waktu Fase 2 = 4 ÷ 3 = 1 1/3 jam = 1 jam 20 menit.',
      'Total waktu = 2 jam + 1 jam 20 menit = 3 jam 20 menit.'
    ],
    correctReason: 'Dua jam pertama menyisakan 4/6 beban kerja yang dituntaskan pada laju gabungan 3/6 per jam dalam 1 jam 20 menit.',
    quickTrick: 'Pakai kapasitas KPK = 6 unit: A=1/jam, B=2/jam. 2 jam sendiri dapat 2 unit, sisa 4 unit bagi (1+2)=3/jam -> 1 jam 20 menit + 2 jam = 3 jam 20 menit!',
    commonMistakes: 'Menjawab 1 jam 20 menit saja tanpa menambahkan 2 jam awal yang sudah berjalan.',
    tip: 'Cermati apakah soal menanyakan "waktu tambahan setelah bergabung" atau "total waktu sejak awal bekerja".',
    refs: [{ title: 'Laju Kerja Dua Fase', source: 'Bank Soal TIU HOTS', note: 'Metode KPK Unit' }]
  }
];
