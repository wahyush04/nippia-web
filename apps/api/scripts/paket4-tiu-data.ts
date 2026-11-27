import { McqInput } from './paket-builder';

export const PAKET4_TIU_DATA: McqInput[] = [
  // ================= SILOGISME (5) =================
  {
    id: 'TIU-P4-001',
    subject: 'TIU',
    topicSlug: 'silogisme',
    subtopic: 'Silogisme Kategorial (Semua–Sebagian)',
    difficulty: 'MEDIUM',
    stem: 'Semua auditor yang bertugas di lapangan wajib membawa surat tugas resmi. Sebagian pegawai Inspektorat adalah auditor yang bertugas di lapangan. Kesimpulan yang paling tepat adalah...',
    options: {
      A: { text: 'Sebagian pegawai Inspektorat wajib membawa surat tugas resmi.', why: 'Tepat: bagian pegawai Inspektorat yang merupakan auditor lapangan ikut terkena syarat wajib membawa surat tugas.' },
      B: { text: 'Semua pegawai Inspektorat wajib membawa surat tugas resmi.', why: 'Salah karena hanya sebagian pegawai Inspektorat yang menjadi auditor lapangan.' },
      C: { text: 'Semua auditor yang membawa surat tugas resmi adalah pegawai Inspektorat.', why: 'Konversi tidak sah; kelompok auditor lapangan bisa berasal dari instansi lain.' },
      D: { text: 'Sebagian pegawai Inspektorat tidak perlu mematuhi aturan surat tugas meski bertugas di lapangan.', why: 'Bertentangan dengan premis pertama yang berlaku untuk semua auditor lapangan.' },
      E: { text: 'Tidak ada pegawai Inspektorat yang membawa surat tugas resmi.', why: 'Bertentangan langsung dengan irisan premis pertama dan kedua.' }
    },
    correct: 'A',
    concept: 'Aturan silogisme Semua A adalah B dan Sebagian C adalah A menghasilkan Sebagian C adalah B.',
    steps: [
      'Identifikasi premis mayor universal: Semua auditor lapangan -> wajib bawa surat tugas.',
      'Identifikasi premis minor partikular: Sebagian pegawai Inspektorat -> auditor lapangan.',
      'Tarik simpulan partikular: Sebagian pegawai Inspektorat wajib membawa surat tugas resmi.'
    ],
    correctReason: 'Kuantor universal "semua" dipadukan dengan kuantor partikular "sebagian" selalu menurunkan simpulan partikular "sebagian".',
    quickTrick: 'Coret term tengah "auditor yang bertugas di lapangan", sisa kuantor mengikuti yang lebih lemah ("sebagian").',
    commonMistakes: 'Menggeneralisasi menjadi "semua pegawai Inspektorat".',
    tip: 'Jangan pernah memperluas kuantor "sebagian" menjadi "semua" dalam kesimpulan.',
    refs: [{ title: 'Logika Kategorial SKD TIU', source: 'Modul Penalaran Verbal BKN', note: 'Silogisme Barbara-Darii' }]
  },
  {
    id: 'TIU-P4-002',
    subject: 'TIU',
    topicSlug: 'silogisme',
    subtopic: 'Modus Tollens Berantai',
    difficulty: 'MEDIUM',
    stem: 'Jika anggaran disetujui sebelum Oktober, maka pembangunan irigasi dimulai awal November. Jika pembangunan irigasi dimulai awal November, maka petani dapat melakukan tanam serentak. Faktanya, petani tidak dapat melakukan tanam serentak. Kesimpulan yang sah adalah...',
    options: {
      A: { text: 'Pembangunan irigasi dimulai awal November, tetapi terkendala cuaca.', why: 'Menambahkan asumsi luar dan bertentangan dengan modus tollens premis kedua.' },
      B: { text: 'Anggaran tidak disetujui sebelum Oktober.', why: 'Benar: menggunakan silogisme hipotetis lalu modus tollens.' },
      C: { text: 'Anggaran disetujui tepat pada bulan Oktober.', why: 'Tidak ada kepastian kapan disetujui atau apakah ditolak seluruhnya; yang pasti hanya tidak sebelum Oktober.' },
      D: { text: 'Petani menolak program pembangunan irigasi.', why: 'Asumsi di luar premis.' },
      E: { text: 'Jika petani tidak tanam serentak, maka anggaran pasti disetujui.', why: 'Kebalikan logis yang keliru.' }
    },
    correct: 'B',
    concept: 'Silogisme hipotetis (P -> Q, Q -> R => P -> R) digabung Modus Tollens (¬R => ¬P).',
    steps: [
      'Misalkan P = anggaran disetujui sebelum Oktober, Q = irigasi dimulai awal November, R = petani tanam serentak.',
      'Dari P -> Q dan Q -> R diperoleh P -> R.',
      'Karena diketahui ¬R (petani tidak dapat tanam serentak), maka berdasarkan modus tollens berlaku ¬P.'
    ],
    correctReason: 'Akibat akhir tidak terjadi sehingga sebab awal secara logis tidak terjadi.',
    quickTrick: 'Rantai A -> B -> C ditambah "tidak C" pasti menyimpulkan "tidak A".',
    commonMistakes: 'Mengganti negasi "tidak sebelum Oktober" menjadi "tepat Oktober".',
    tip: 'Negasi kalimat harus mempertahankan batas logis yang persis berlawanan dengan premis.',
    refs: [{ title: 'Inferensi Kondisional', source: 'Pedoman TIU Penalaran Logis', note: 'Silogisme Hipotetis & Tollens' }]
  },
  {
    id: 'TIU-P4-003',
    subject: 'TIU',
    topicSlug: 'silogisme',
    subtopic: 'Silogisme Negatif Universal',
    difficulty: 'EASY',
    stem: 'Tidak ada dokumen rahasia negara yang boleh disalin ke perangkat pribadi. Semua arsip perencanaan strategis kementerian merupakan dokumen rahasia negara. Kesimpulan yang paling tepat adalah...',
    options: {
      A: { text: 'Sebagian arsip perencanaan strategis kementerian boleh disalin ke perangkat pribadi.', why: 'Bertentangan dengan larangan universal.' },
      B: { text: 'Semua dokumen yang tidak boleh disalin ke perangkat pribadi adalah arsip perencanaan strategis.', why: 'Konversi ilegal.' },
      C: { text: 'Tidak ada arsip perencanaan strategis kementerian yang boleh disalin ke perangkat pribadi.', why: 'Tepat: Celarent (Tidak ada B yang C; Semua A adalah B; maka Tidak ada A yang C).' },
      D: { text: 'Perangkat pribadi hanya boleh menyimpan dokumen perencanaan daerah.', why: 'Di luar cakupan premis.' },
      E: { text: 'Sebagian dokumen rahasia negara bukan arsip kementerian, sehingga boleh disalin.', why: 'Melanggar premis pertama bahwa tidak ada satu pun dokumen rahasia yang boleh disalin.' }
    },
    correct: 'C',
    concept: 'Silogisme universal negatif: Tidak ada M yang P; Semua S adalah M => Tidak ada S yang P.',
    steps: [
      'Semua arsip perencanaan strategis (S) termasuk dokumen rahasia negara (M).',
      'Tidak ada satu pun dokumen rahasia negara (M) yang boleh disalin ke perangkat pribadi (P).',
      'Jadi tidak ada arsip perencanaan strategis (S) yang boleh disalin ke perangkat pribadi (P).'
    ],
    correctReason: 'Larangan menyeluruh terhadap himpunan induk berlaku otomatis bagi seluruh himpunan bagiannya.',
    quickTrick: 'Semua A masuk B, B dilarang total -> A juga dilarang total.',
    commonMistakes: 'Membalik subjek dan predikat pada kalimat negatif.',
    tip: 'Gunakan diagram himpunan: lingkaran S di dalam lingkaran M, dan M terpisah total dari P.',
    refs: [{ title: 'Diagram Venn Logika', source: 'Referensi TIU BKN', note: 'Bentuk Celarent' }]
  },
  {
    id: 'TIU-P4-004',
    subject: 'TIU',
    topicSlug: 'silogisme',
    subtopic: 'Silogisme Disjungtif',
    difficulty: 'MEDIUM',
    stem: 'Setiap peserta diklat yang lulus uji kompetensi berhak memperoleh sertifikat kelulusan atau rekomendasi penempatan. Raka merupakan peserta diklat yang lulus uji kompetensi, tetapi ia tidak memperoleh sertifikat kelulusan. Kesimpulan yang sah adalah...',
    options: {
      A: { text: 'Raka gagal dalam uji kompetensi diklat.', why: 'Bertentangan dengan premis bahwa Raka lulus uji kompetensi.' },
      B: { text: 'Raka tidak memperoleh hak apa pun dari panitia diklat.', why: 'Salah karena salah satu alternatif hak harus terpenuhi.' },
      C: { text: 'Semua peserta diklat hanya boleh memilih rekomendasi penempatan.', why: 'Tidak dinyatakan dalam premis.' },
      D: { text: 'Raka berhak memperoleh rekomendasi penempatan.', why: 'Benar: disjungsi P ∨ Q dengan ¬P menghasilkan Q.' },
      E: { text: 'Jika Raka mendapat rekomendasi penempatan, ia wajib mengulang uji kompetensi.', why: 'Asumsi tambahan yang tidak berdasar.' }
    },
    correct: 'D',
    concept: 'Silogisme disjungtif: Jika (P atau Q) benar dan ¬P terjadi, maka Q pasti benar.',
    steps: [
      'Karena Raka lulus uji kompetensi, berlaku disjungsi: sertifikat kelulusan (P) ATAU rekomendasi penempatan (Q).',
      'Diketahui Raka tidak memperoleh sertifikat kelulusan (¬P).',
      'Maka berdasarkan aturan silogisme disjungtif, Raka berhak memperoleh rekomendasi penempatan (Q).'
    ],
    correctReason: 'Dalam disjungsi inklusif maupun eksklusif, mengingkari salah satu pilihan memaksa pilihan lain berlaku.',
    quickTrick: 'Harus dapat A atau B; ternyata tidak dapat A -> pasti dapat B.',
    commonMistakes: 'Menganggap gagal di opsi pertama berarti premis awal tidak berlaku.',
    tip: 'Pastikan terlebih dahulu bahwa syarat awal ("lulus uji kompetensi") memang terpenuhi pada subjek.',
    refs: [{ title: 'Aturan Penarikan Kesimpulan', source: 'Logika Proposisional Dasar', note: 'Disjunctive Syllogism' }]
  },
  {
    id: 'TIU-P4-005',
    subject: 'TIU',
    topicSlug: 'silogisme',
    subtopic: 'Implikasi Konjungtif & Hukum De Morgan',
    difficulty: 'HARD',
    stem: 'Jika instansi menerapkan sistem digital terintegrasi dan memperbarui basis data secara berkala, maka antrean layanan fisik akan hilang. Faktanya, antrean layanan fisik masih terjadi di instansi tersebut. Simpulan yang paling tepat adalah...',
    options: {
      A: { text: 'Instansi tersebut tidak menerapkan sistem digital terintegrasi dan tidak memperbarui basis data secara berkala.', why: 'Terlalu kuat: negasi "A dan B" adalah "tidak A ATAU tidak B", bukan harus keduanya sekaligus gagal.' },
      B: { text: 'Instansi tersebut telah menerapkan sistem digital terintegrasi, namun pegawainya kurang ramah.', why: 'Menambahkan faktor di luar premis.' },
      C: { text: 'Antrean layanan fisik terjadi karena masyarakat belum terbiasa menggunakan aplikasi.', why: 'Spekulasi kausal di luar premis.' },
      D: { text: 'Instansi tersebut pasti sudah memperbarui basis data secara berkala.', why: 'Tidak dapat dipastikan.' },
      E: { text: 'Instansi tersebut tidak menerapkan sistem digital terintegrasi atau tidak memperbarui basis data secara berkala.', why: 'Benar: ¬(P ∧ Q) ≡ ¬P ∨ ¬Q sesuai hukum De Morgan.' }
    },
    correct: 'E',
    concept: 'Modus tollens atas implikasi beranteseden konjungtif: (P ∧ Q) -> R dan ¬R menghasilkan ¬P ∨ ¬Q.',
    steps: [
      'P = menerapkan sistem digital terintegrasi; Q = memperbarui basis data berkala; R = antrean fisik hilang.',
      'Premis: (P ∧ Q) -> R dan ¬R.',
      'Modus tollens menghasilkan ¬(P ∧ Q).',
      'Menurut hukum De Morgan, ¬(P ∧ Q) setara dengan ¬P ∨ ¬Q ("tidak P atau tidak Q").'
    ],
    correctReason: 'Untuk menggagalkan syarat gabungan "dan", cukup salah satu komponen (atau keduanya) tidak terpenuhi.',
    quickTrick: 'Negasi dari "A DAN B" adalah "tidak A ATAU tidak B".',
    commonMistakes: 'Memilih kata hubung "dan" alih-alih "atau" pada opsi A.',
    tip: 'Waspadai soal jebakan De Morgan di TIU CPNS: kata "dan" berubah menjadi "atau" saat dinegasikan.',
    refs: [{ title: 'Hukum De Morgan dalam TIU', source: 'Bank Soal Penalaran Logis', note: 'Negasi Konjungsi' }]
  },

  // ================= PENALARAN INDUKTIF (5) =================
  {
    id: 'TIU-P4-006',
    subject: 'TIU',
    topicSlug: 'penalaran-induktif',
    subtopic: 'Generalisasi Data Empiris',
    difficulty: 'MEDIUM',
    stem: 'Hasil pengamatan di lima kecamatan menunjukkan bahwa setiap penambahan sepuluh titik akses internet publik diikuti penurunan rata-rata waktu pengurusan surat administrasi warga sekitar 18 menit. Simpulan induktif yang paling tepat berdasarkan data tersebut adalah...',
    options: {
      A: { text: 'Penambahan titik akses internet publik berkorelasi dengan percepatan rata-rata waktu pengurusan surat warga di kelima kecamatan tersebut.', why: 'Tepat: merangkum pola empiris dari sampel tanpa melampaui cakupan data atau mengklaim jaminan absolut.' },
      B: { text: 'Semua daerah di Indonesia akan bebas dari keterlambatan administrasi jika memasang sepuluh titik akses internet.', why: 'Overgeneralisasi dari 5 kecamatan ke seluruh Indonesia dengan kata mutlak.' },
      C: { text: 'Petugas kelurahan tidak lagi diperlukan apabila titik akses internet terus ditambah.', why: 'Ekstrapolasi ekstrem yang tidak didukung data.' },
      D: { text: 'Waktu pengurusan surat akan menjadi nol menit jika dipasang tiga puluh titik internet.', why: 'Asumsi linear tanpa batas yang keliru secara logika.' },
      E: { text: 'Peningkatan anggaran daerah adalah satu-satunya penyebab cepatnya layanan administrasi.', why: 'Membahas faktor yang tidak ada dalam pengamatan.' }
    },
    correct: 'A',
    concept: 'Generalisasi induktif yang baik merangkum kecenderungan sampel secara proporsional tanpa klaim mutlak.',
    steps: [
      'Cermati ruang lingkup bukti: lima kecamatan.',
      'Cermati pola: penambahan titik internet publik beriringan dengan turunnya waktu layanan rata-rata.',
      'Pilih pernyataan yang mencerminkan korelasi/kecenderungan sesuai ruang lingkup data.'
    ],
    correctReason: 'Opsi A akurat terhadap pola pengamatan dan membatasi klaim pada konteks kelima kecamatan.',
    quickTrick: 'Pilih simpulan yang memakai bahasa proporsional (berkorelasi, cenderung, di wilayah pengamatan) dan hindari kata "semua/pasti/satu-satunya".',
    commonMistakes: 'Tergoda memperluas hasil sampel kecil menjadi hukum mutlak nasional.',
    tip: 'Dalam penalaran induktif, kehati-hatian cakupan klaim adalah ciri jawaban benar.',
    refs: [{ title: 'Penalaran Induktif & Evaluasi Bukti', source: 'Materi TIU Verbal', note: 'Generalisasi Proporsional' }]
  },
  {
    id: 'TIU-P4-007',
    subject: 'TIU',
    topicSlug: 'penalaran-induktif',
    subtopic: 'Membaca Tren Beruntun',
    difficulty: 'EASY',
    stem: 'Selama empat tahun berturut-turut, persentase kelulusan peserta latihan yang rutin mengerjakan evaluasi kesalahan mingguan naik dari 64%, 71%, 79%, hingga 86%. Simpulan induktif yang paling logis adalah...',
    options: {
      A: { text: 'Setiap peserta yang mengerjakan evaluasi mingguan dijamin seratus persen lulus seleksi.', why: 'Kata "dijamin 100%" bertentangan dengan data tertinggi 86%.' },
      B: { text: 'Rutinitas evaluasi kesalahan mingguan cenderung berkaitan positif dengan peningkatan peluang kelulusan peserta.', why: 'Tepat: sesuai tren kenaikan konsisten selama empat tahun.' },
      C: { text: 'Peserta yang tidak mengikuti latihan sama sekali tidak mungkin lulus.', why: 'Data tidak membahas kelompok yang belajar mandiri tanpa latihan.' },
      D: { text: 'Pada tahun kelima, tingkat kelulusan dipastikan menyentuh tepat 93%.', why: 'Prediksi angka eksak masa depan tidak dijamin oleh induksi.' },
      E: { text: 'Jumlah soal ujian semakin mudah dari tahun ke tahun.', why: 'Penjelasan alternatif yang tidak tertera pada data.' }
    },
    correct: 'B',
    concept: 'Menyimpulkan tren historis secara hati-hati tanpa meramal angka pasti atau mengklaim kepastian mutlak.',
    steps: [
      'Amati urutan angka: 64% -> 71% -> 79% -> 86% (meningkat konsisten).',
      'Hubungkan dengan variabel perlakuan: rutin mengerjakan evaluasi kesalahan mingguan.',
      'Singkirkan klaim kepastian 100% dan prediksi angka pasti.'
    ],
    correctReason: 'Tren naik beruntun mendukung hubungan positif antara evaluasi mingguan dan peluang kelulusan.',
    quickTrick: 'Tren naik -> "berkaitan positif / cenderung meningkatkan peluang".',
    commonMistakes: 'Menganggap kenaikan historis menjamin angka eksak di tahun berikutnya.',
    tip: 'Perbedaan utama induksi yang benar vs jebakan ada pada kata modalitas ("cenderung" vs "pasti/100%").',
    refs: [{ title: 'Interpretasi Tren Induktif', source: 'Modul SKD TIU', note: 'Tren Data' }]
  },
  {
    id: 'TIU-P4-008',
    subject: 'TIU',
    topicSlug: 'penalaran-induktif',
    subtopic: 'Metode Perbedaan Mill (Kausal)',
    difficulty: 'MEDIUM',
    stem: 'Di Kabupaten X, tiga desa yang membangun embung penampung air hujan tetap memiliki cadangan air irigasi yang cukup sepanjang musim kemarau, sedangkan dua desa bertipologi sama yang tidak membangun embung mengalami kekeringan sawah. Simpulan kausal yang paling tepat adalah...',
    options: {
      A: { text: 'Kekeringan di seluruh provinsi hanya disebabkan oleh ketiadaan embung.', why: 'Melampaui Kabupaten X dan mengklaim faktor tunggal.' },
      B: { text: 'Dua desa yang kekeringan memiliki tanah yang tidak cocok untuk pertanian.', why: 'Bertentangan dengan keterangan bahwa tipologi kelima desa sama.' },
      C: { text: 'Keberadaan embung penampung air hujan berperan menjaga ketersediaan air irigasi pada musim kemarau di desa tersebut.', why: 'Tepat: membandingkan kelompok bertipologi sama yang berbeda pada satu variabel (embung).' },
      D: { text: 'Petani di tiga desa pertama tidak memerlukan hujan sama sekali sepanjang tahun.', why: 'Justru embung menampung air hujan.' },
      E: { text: 'Membangun embung lebih murah daripada memperbaiki saluran irigasi sungai.', why: 'Tidak ada data biaya dalam bacaan.' }
    },
    correct: 'C',
    concept: 'Metode perbedaan John Stuart Mill: dua kelompok serupa yang berbeda hasil umumnya dipengaruhi faktor pembeda utama di antara keduanya.',
    steps: [
      'Kelima desa memiliki tipologi sama.',
      'Faktor pembeda: ada/tidaknya embung penampung air hujan.',
      'Hasil berbeda: ada embung -> air cukup; tanpa embung -> kekeringan.',
      'Simpulkan peran embung dalam menjaga cadangan air irigasi kemarau.'
    ],
    correctReason: 'Kontrol terhadap kesamaan tipologi memperkuat kesimpulan bahwa embung berperan menjaga pasokan air.',
    quickTrick: 'Cari satu-satunya faktor pembeda antara kelompok berhasil dan kelompok gagal.',
    commonMistakes: 'Memasukkan isu biaya atau menggeneralisasi melampaui bukti.',
    tip: 'Perhatikan frasa "bertipologi sama" yang menjadi penanda kuat perbandingan kausal.',
    refs: [{ title: 'Penalaran Kausal Induktif', source: 'Logika Ilmiah Terapan', note: 'Metode Perbedaan Mill' }]
  },
  {
    id: 'TIU-P4-009',
    subject: 'TIU',
    topicSlug: 'penalaran-induktif',
    subtopic: 'Korelasi Kebijakan & Perilaku',
    difficulty: 'MEDIUM',
    stem: 'Setelah kebijakan tarif terintegrasi berlaku di koridor utama kota, jumlah penumpang bus kota meningkat 22%, sementara volume kendaraan pribadi di koridor yang sama turun 14%. Simpulan yang paling didukung oleh informasi tersebut adalah...',
    options: {
      A: { text: 'Kemacetan di seluruh jalan raya kota telah berkurang hingga nol persen.', why: 'Hiperbola yang tidak disebut dalam data.' },
      B: { text: 'Semua pemilik mobil pribadi menjual kendaraannya setelah tarif terintegrasi diterapkan.', why: 'Ekstrapolasi tidak masuk akal dan jauh melebihi penurunan 14%.' },
      C: { text: 'Penumpang bus kota naik karena harga bahan bakar kendaraan pribadi naik tiga kali lipat.', why: 'Menyisipkan penyebab eksternal yang tidak ada dalam bacaan.' },
      D: { text: 'Kebijakan tarif terintegrasi berkaitan dengan pergeseran sebagian pengguna kendaraan pribadi ke bus kota di koridor tersebut.', why: 'Tepat: kenaikan penumpang bus bersamaan dengan turunnya volume kendaraan pribadi di koridor yang sama.' },
      E: { text: 'Armada bus kota menjadi tidak cukup menampung seluruh penduduk kota.', why: 'Tidak ada informasi kapasitas armada.' }
    },
    correct: 'D',
    concept: 'Membaca dua indikator berlawanan arah pascakebijakan di lokasi dan waktu yang sama.',
    steps: [
      'Amati peristiwa pemicu: tarif terintegrasi di koridor utama.',
      'Amati dua akibat bersamaan: penumpang bus +22%, kendaraan pribadi -14% di koridor yang sama.',
      'Pilih simpulan tentang pergeseran moda di koridor tersebut.'
    ],
    correctReason: 'Kedua angka di koridor yang sama konsisten menunjukkan pergeseran sebagian pengguna menuju bus kota.',
    quickTrick: 'Dua indikator bergerak berlawanan di lokasi yang sama -> indikasi substitusi/peralihan.',
    commonMistakes: 'Menebak alasan di luar teks seperti kenaikan BBM.',
    tip: 'Jangan mengarang penyebab baru yang tidak tertulis di soal.',
    refs: [{ title: 'Analisis Informasi Kuantitatif Verbal', source: 'Pedoman TIU', note: 'Data Kebijakan Publik' }]
  },
  {
    id: 'TIU-P4-010',
    subject: 'TIU',
    topicSlug: 'penalaran-induktif',
    subtopic: 'Klasifikasi & Pola Kualitas Layanan',
    difficulty: 'EASY',
    stem: 'Evaluasi terhadap enam unit pelayanan terpadu menunjukkan seluruh unit yang menerapkan sistem antrean digital memiliki indeks kepuasan di atas 88, sedangkan unit yang masih memakai loket manual seluruhnya memperoleh indeks di bawah 76. Simpulan yang paling tepat adalah...',
    options: {
      A: { text: 'Unit layanan dengan indeks di bawah 76 pasti mengalami kerusakan komputer.', why: 'Asumsi teknis di luar teks (mereka memakai loket manual).' },
      B: { text: 'Tidak ada perbedaan kualitas layanan antara sistem digital dan sistem manual.', why: 'Bertentangan dengan jarak skor (>88 vs <76).' },
      C: { text: 'Masyarakat hanya menilai keramahan petugas, bukan kecepatan sistem antrean.', why: 'Tidak ada informasi mengenai keramahan petugas.' },
      D: { text: 'Semua unit layanan wajib mengganti seluruh gedungnya sebelum menerapkan sistem digital.', why: 'Irrelevan dengan informasi.' },
      E: { text: 'Penerapan sistem antrean digital berhubungan dengan indeks kepuasan yang lebih tinggi pada enam unit yang dievaluasi.', why: 'Tepat: konsisten membandingkan dua kelompok pada sampel evaluasi.' }
    },
    correct: 'E',
    concept: 'Menyimpulkan perbandingan dua kategori berdasarkan distribusi hasil evaluasi yang konsisten.',
    steps: [
      'Kelompok antrean digital: semua skor > 88.',
      'Kelompok loket manual: semua skor < 76.',
      'Simpulkan hubungan positif antara sistem antrean digital dan tingginya indeks kepuasan pada unit yang dievaluasi.'
    ],
    correctReason: 'Seluruh sampel terbelah rapi antara dua kelompok tanpa tumpang tindih nilai.',
    quickTrick: 'Kelompok A konsisten tinggi, kelompok B konsisten rendah -> ada asosiasi kuat pada sampel.',
    commonMistakes: 'Mengambil simpulan yang bertentangan dengan fakta skor atau menambah syarat fisik gedung.',
    tip: 'Pastikan istilah dalam pilihan jawaban tetap setia pada kata kunci di soal.',
    refs: [{ title: 'Penalaran Induktif Berbasis Evaluasi', source: 'Bank Soal TIU CPNS', note: 'Perbandingan Kelompok' }]
  },

  // ================= ANALITIS (5) =================
  {
    id: 'TIU-P4-011',
    subject: 'TIU',
    topicSlug: 'analitis',
    subtopic: 'Penempatan Vertikal (Lantai Gedung)',
    difficulty: 'MEDIUM',
    stem: 'Lima ruang kerja pada Lantai 1 hingga Lantai 5 ditempati oleh lima tim berbeda (P, Q, R, S, dan T) dengan ketentuan: (1) Tim R berada tepat satu lantai di atas Tim P; (2) Tim T berada di lantai yang lebih tinggi daripada Tim Q, namun bukan di Lantai 5; (3) Tim S tidak berada di lantai yang bersebelahan dengan Tim P maupun Tim R; (4) Tim Q berada di Lantai 2. Tim manakah yang menempati Lantai 4?',
    options: {
      A: { text: 'Tim R', why: 'Tim R harus berada di Lantai 5 agar berada tepat di atas Tim P dan terpisah dari Tim S.' },
      B: { text: 'Tim P', why: 'Benar: susunan unik dari bawah ke atas adalah L1: S, L2: Q, L3: T, L4: P, L5: R.' },
      C: { text: 'Tim T', why: 'Tim T menempati Lantai 3 karena harus di atas Lantai 2 (Q) dan bukan di Lantai 5.' },
      D: { text: 'Tim S', why: 'Jika S di Lantai 4, tidak tersisa posisi berurutan P–R yang tidak bersebelahan dengan S.' },
      E: { text: 'Tim Q', why: 'Diketahui jelas Tim Q menempati Lantai 2.' }
    },
    correct: 'B',
    concept: 'Mengunci posisi absolut terlebih dahulu lalu menguji kombinasi blok berurutan.',
    steps: [
      'Tetapkan posisi pasti: Q = Lantai 2.',
      'Dari syarat (2), T > 2 dan T ≠ 5, sehingga T hanya mungkin di Lantai 3 atau Lantai 4.',
      'Jika T = 4, sisa lantai adalah {1, 3, 5}. Padahal R = P + 1 membutuhkan dua lantai berurutan, dan tidak ada angka berurutan di {1, 3, 5}. Maka T pasti di Lantai 3.',
      'Sisa lantai adalah {1, 4, 5}. Pasangan berurutan R = P + 1 wajib di P = 4 dan R = 5.',
      'Otomatis S = Lantai 1, dan Lantai 1 memang tidak bersebelahan dengan Lantai 4 maupun Lantai 5.'
    ],
    correctReason: 'Hanya penempatan S=1, Q=2, T=3, P=4, R=5 yang memenuhi seluruh empat syarat sekaligus.',
    quickTrick: 'Pasangan berurutan P–R memaksa T turun ke Lantai 3 karena {1, 3, 5} tidak punya dua lantai berdampingan.',
    commonMistakes: 'Lupa menguji apakah sisa lantai masih memuat pasangan berurutan untuk P dan R.',
    tip: 'Tuliskan angka 1–5 vertikal lalu coret slot yang mustahil untuk mempercepat eliminasi.',
    refs: [{ title: 'Penalaran Analitis Penempatan', source: 'Kisi-Kisi TIU BKN', note: 'Urutan Lantai Unik' }]
  },
  {
    id: 'TIU-P4-012',
    subject: 'TIU',
    topicSlug: 'analitis',
    subtopic: 'Urutan Antrean Bersyarat',
    difficulty: 'MEDIUM',
    stem: 'Enam kandidat pegawai (A, B, C, D, E, dan F) masuk ruang wawancara secara berurutan dari nomor urut 1 sampai 6: (1) C masuk tepat sebelum E; (2) A masuk setelah D, tetapi sebelum F; (3) B mendapat nomor urut 1; (4) D mendapat nomor urut 2; (5) F bukan nomor urut 6. Siapakah yang mendapat nomor urut 4?',
    options: {
      A: { text: 'A', why: 'A mendapat nomor urut 3 karena berada setelah D(2) dan sebelum F(4).' },
      B: { text: 'C', why: 'Jika C=4 dan E=5, sisa {3, 6} memaksa F=6, melanggar syarat (5).' },
      C: { text: 'E', why: 'E mendapat nomor urut 6 tepat setelah C(5).' },
      D: { text: 'F', why: 'Benar: urutan unik adalah 1: B, 2: D, 3: A, 4: F, 5: C, 6: E.' },
      E: { text: 'D', why: 'D diketahui berada pada nomor urut 2.' }
    },
    correct: 'D',
    concept: 'Menyelesaikan urutan linear dengan blok rapat (CE) dan pertidaksamaan relatif (D < A < F).',
    steps: [
      'Slot 1 = B dan Slot 2 = D. Tersisa slot {3, 4, 5, 6} untuk {A, F, C, E}.',
      'Blok berurutan [C, E] dapat menempati (3,4), (4,5), atau (5,6).',
      'Jika [C, E] di (3,4) atau (4,5), maka slot 6 terisi oleh salah satu dari {A, F}. Karena A < F, otomatis F harus di 6 — bertentangan dengan syarat F ≠ 6.',
      'Maka [C, E] wajib di slot (5, 6), dan sisa slot (3, 4) diisi A = 3 serta F = 4.'
    ],
    correctReason: 'Larangan F = 6 mendorong pasangan rapat C–E ke ujung belakang (5–6), sehingga F tepat di posisi 4.',
    quickTrick: 'Syarat F ≠ 6 langsung memaksa blok C–E mengambil posisi terakhir (5 dan 6).',
    commonMistakes: 'Lupa bahwa A harus lebih awal dari F ketika menyisakan dua slot terakhir.',
    tip: 'Perlakukan dua objek berurutan rapat seperti satu blok utuh.',
    refs: [{ title: 'Urutan Linear TIU', source: 'Bank Soal Analitis', note: 'Blok Rapat & Pembatasan Ujung' }]
  },
  {
    id: 'TIU-P4-013',
    subject: 'TIU',
    topicSlug: 'analitis',
    subtopic: 'Posisi Duduk Melingkar',
    difficulty: 'HARD',
    stem: 'Enam peserta rapat (K, L, M, N, O, dan P) duduk mengelilingi meja bundar dengan kursi bernomor 1 hingga 6 berurutan searah jarum jam (kursi 2 di sebelah kanan kursi 1, kursi 6 di sebelah kiri kursi 1). Diketahui: (1) K duduk di kursi 1; (2) M duduk tepat berseberangan dengan K; (3) L duduk tepat di sebelah kiri K; (4) P duduk di antara M dan N (masing-masing berselisih satu kursi dari P). Siapakah yang duduk tepat berseberangan dengan N?',
    options: {
      A: { text: 'K', why: 'K(1) berseberangan dengan M(4).' },
      B: { text: 'L', why: 'L(6) berseberangan dengan P(3).' },
      C: { text: 'M', why: 'M(4) berseberangan dengan K(1).' },
      D: { text: 'P', why: 'P(3) berseberangan dengan L(6).' },
      E: { text: 'O', why: 'Benar: susunan kursi 1–6 adalah K, N, P, M, O, L sehingga N(2) berseberangan dengan O(5).' }
    },
    correct: 'E',
    concept: 'Pada meja bundar 6 kursi, kursi berseberangan berselisih 3 (1↔4, 2↔5, 3↔6).',
    steps: [
      'K = 1. Lawan kursi 1 adalah kursi 4, maka M = 4.',
      'L tepat di sebelah kiri K(1), maka L = 6.',
      'Kursi tersisa: {2, 3, 5}. Agar P berada tepat di antara M(4) dan N, maka salah satu tetangga M(4) harus P, yaitu 3 atau 5.',
      'Jika P = 5, tetangga satunya adalah 6, padahal kursi 6 sudah ditempati L. Jadi P harus di kursi 3, dan N di kursi 2.',
      'Tersisa O di kursi 5. Kursi 5 tepat berseberangan dengan kursi 2 (N).'
    ],
    correctReason: 'Posisi L di kursi 6 menutup kemungkinan P–N di sisi 5–6, sehingga P=3 dan N=2 menjadi satu-satunya penempatan sah.',
    quickTrick: 'Selisih kursi berhadapan di meja isi 6 selalu +3 (2 ↔ 5, 3 ↔ 6).',
    commonMistakes: 'Salah menentukan arah kiri/kanan pada lingkaran.',
    tip: 'Selalu gambar segienam kecil dengan nomor 1–6 searah jarum jam di kertas buram.',
    refs: [{ title: 'Analitis Meja Bundar', source: 'Latihan Resmi TIU', note: 'Circular Arrangement' }]
  },
  {
    id: 'TIU-P4-014',
    subject: 'TIU',
    topicSlug: 'analitis',
    subtopic: 'Penjadwalan Harian',
    difficulty: 'EASY',
    stem: 'Empat analis (Wulan, Xaverius, Yuni, dan Zaki) dijadwalkan piket masing-masing tepat satu hari dari Senin sampai Kamis dengan syarat: (1) Yuni tidak piket pada hari Senin maupun Kamis; (2) Wulan piket lebih awal daripada Xaverius; (3) Zaki piket tepat satu hari setelah Yuni; (4) Xaverius piket pada hari Kamis. Siapakah yang bertugas piket pada hari Rabu?',
    options: {
      A: { text: 'Wulan', why: 'Wulan mengisi satu-satunya hari kosong tersisa, yaitu Senin.' },
      B: { text: 'Xaverius', why: 'Xaverius ditetapkan piket pada hari Kamis.' },
      C: { text: 'Zaki', why: 'Benar: jadwal unik adalah Senin Wulan, Selasa Yuni, Rabu Zaki, Kamis Xaverius.' },
      D: { text: 'Yuni', why: 'Jika Yuni di Rabu, Zaki harus di Kamis, bentrok dengan Xaverius.' },
      E: { text: 'Tidak dapat ditentukan', why: 'Keempat aturan menghasilkan jadwal tunggal tanpa ambiguitas.' }
    },
    correct: 'C',
    concept: 'Mengisi jadwal tetap terlebih dahulu lalu mengecek pasangan hari berturutan (Yuni -> Zaki).',
    steps: [
      'Kamis = Xaverius.',
      'Yuni bukan Senin dan bukan Kamis -> Yuni hanya bisa Selasa atau Rabu.',
      'Karena Zaki tepat satu hari setelah Yuni, Yuni tidak mungkin di Rabu (jika ya, Zaki bentrok dengan Xaverius di Kamis).',
      'Maka Yuni = Selasa dan Zaki = Rabu, menyisakan Senin untuk Wulan (memenuhi Wulan < Xaverius).'
    ],
    correctReason: 'Posisi Kamis yang sudah terisi menutup peluang pasangan Yuni–Zaki di Rabu–Kamis.',
    quickTrick: 'Pasangan [Yuni, Zaki] hanya bisa masuk di (Selasa, Rabu) karena Kamis sudah ditempati Xaverius.',
    commonMistakes: 'Mengabaikan bentrokan hari Kamis saat menaruh Yuni di hari Rabu.',
    tip: 'Uji elemen yang punya syarat berurutan terhadap slot terakhir yang sudah terpakai.',
    refs: [{ title: 'Penjadwalan Analitis', source: 'Pedoman TIU SKD', note: 'Jadwal Harian' }]
  },
  {
    id: 'TIU-P4-015',
    subject: 'TIU',
    topicSlug: 'analitis',
    subtopic: 'Kombinasi Seleksi Tim',
    difficulty: 'HARD',
    stem: 'Sebuah tim audit beranggotakan tepat 3 orang akan dipilih dari 5 kandidat: H, I, J, K, dan L dengan syarat: (1) Jika H dipilih, I tidak boleh dipilih; (2) J hanya bersedia bergabung jika K juga dipilih; (3) L wajib dipilih; (4) H dan K tidak dapat berada dalam satu tim yang sama. Kandidat manakah yang PASTI selalu masuk bersama L dalam setiap susunan tim yang sah?',
    options: {
      A: { text: 'K', why: 'Benar: satu-satunya tim sah beranggotakan 3 orang adalah {L, I, K} dan {L, J, K}; keduanya selalu memuat K.' },
      B: { text: 'H', why: 'Jika H dipilih bersama L, I, K, dan J semuanya gugur sehingga anggota tim tidak bisa mencapai 3 orang.' },
      C: { text: 'I', why: 'Susunan {L, J, K} sah tanpa melibatkan I.' },
      D: { text: 'J', why: 'Susunan {L, I, K} sah tanpa melibatkan J.' },
      E: { text: 'H dan I', why: 'H dan I justru tidak boleh dipilih bersamaan menurut syarat (1).' }
    },
    correct: 'A',
    concept: 'Mendaftar himpunan kandidat yang gugur jika satu anggota kontradiktif dipilih, lalu mengiris semua kombinasi valid.',
    steps: [
      'L wajib masuk -> perlu memilih 2 orang lagi dari {H, I, J, K}.',
      'Coba pilih H: syarat (1) menggugurkan I; syarat (4) menggugurkan K; syarat (2) menggugurkan J karena K gugur. Tim hanya punya {L, H} (2 orang), gagal.',
      'Jadi H pasti TIDAK terpilih. Tersisa kandidat {I, J, K} untuk diambil 2 orang.',
      'Kombinasi dari {I, J, K}: {I, J} gagal karena J butuh K; {I, K} sah; {J, K} sah.',
      'Dari kedua kombinasi sah ({L, I, K} dan {L, J, K}), K selalu muncul.'
    ],
    correctReason: 'Kegagalan H membentuk tim 3 orang memaksa pemilihan 2 dari {I, J, K}, dan aturan J -> K memaksa K hadir di seluruh opsi valid.',
    quickTrick: 'Uji dulu kandidat dengan larangan terbanyak (H); begitu H gugur, syarat "J butuh K" langsung mengunci K.',
    commonMistakes: 'Mengira tim {L, I, J} sah tanpa mengecek syarat J harus bersama K.',
    tip: 'Untuk soal "PASTI selalu ada", cari irisan semua kemungkinan valid, bukan hanya satu contoh valid.',
    refs: [{ title: 'Logika Seleksi & Implikasi Tim', source: 'Materi TIU HOTS BKN', note: 'Kombinasi Terikat' }]
  },

  // ================= BERHITUNG (5) =================
  {
    id: 'TIU-P4-016',
    subject: 'TIU',
    topicSlug: 'berhitung',
    subtopic: 'Operasi Pecahan, Desimal & Persen',
    difficulty: 'EASY',
    stem: 'Hasil dari (3/4 × 0,8) + (15% × 40) - (2 1/2 ÷ 5) adalah...',
    options: {
      A: { text: '5,1', why: 'Salah pengurangan suku terakhir atau salah mengonversi pecahan.' },
      B: { text: '5,6', why: 'Keliru menghitung 3/4 × 0,8 sebagai 0,1.' },
      C: { text: '6,1', why: 'Benar: 0,6 + 6 - 0,5 = 6,1.' },
      D: { text: '6,6', why: 'Salah menjumlahkan +0,5 alih-alih mengurangi 0,5.' },
      E: { text: '7,1', why: 'Keliru menghitung 15% × 40 sebagai 7.' }
    },
    correct: 'C',
    concept: 'Menyeragamkan bentuk pecahan dan desimal lalu menjalankan perkalian/pembagian sebelum penjumlahan/pengurangan.',
    steps: [
      'Suku 1: 3/4 × 0,8 = 0,75 × 0,8 = 0,6.',
      'Suku 2: 15% × 40 = (15/100) × 40 = 6.',
      'Suku 3: 2 1/2 ÷ 5 = 2,5 ÷ 5 = 0,5.',
      'Gabungkan: 0,6 + 6 - 0,5 = 6,1.'
    ],
    correctReason: 'Ketiga suku bernilai 0,6, 6, dan -0,5 sehingga jumlahnya tepat 6,1.',
    quickTrick: '0,8 dibagi 4 = 0,2 dikali 3 = 0,6; 10% dari 40 = 4 tambah setengahnya = 6.',
    commonMistakes: 'Lupa tanda kurang pada suku pembagian terakhir.',
    tip: 'Pecahkan soal operasi campuran menjadi kurung-kurung kecil agar bebas salah hitung.',
    refs: [{ title: 'Aritmetika Dasar TIU', source: 'Modul Numerik BKN', note: 'Operasi Campuran' }]
  },
  {
    id: 'TIU-P4-017',
    subject: 'TIU',
    topicSlug: 'berhitung',
    subtopic: 'Aljabar Selisih Kuadrat',
    difficulty: 'MEDIUM',
    stem: 'Nilai dari (175² - 125²) / (15 × 20) adalah...',
    options: {
      A: { text: '25', why: 'Salah membagi 15.000 dengan 600.' },
      B: { text: '40', why: 'Salah mengurangkan 175 - 125 sebagai 40.' },
      C: { text: '45', why: 'Perkiraan keliru tanpa faktorisasi.' },
      D: { text: '50', why: 'Benar: ((175-125)(175+125)) / 300 = (50 × 300) / 300 = 50.' },
      E: { text: '60', why: 'Salah menjumlahkan 175 + 125.' }
    },
    correct: 'D',
    concept: 'Identitas aljabar selisih dua kuadrat: a² - b² = (a - b)(a + b).',
    steps: [
      'Faktorkan pembilang: 175² - 125² = (175 - 125)(175 + 125) = 50 × 300.',
      'Hitung penyebut: 15 × 20 = 300.',
      'Coret faktor 300 pada pembilang dan penyebut sehingga tersisa 50.'
    ],
    correctReason: 'Pemfaktoran selisih kuadrat memunculkan angka 300 yang langsung saling meniadakan dengan penyebut.',
    quickTrick: 'Jangan pernah mengkuadratkan manual; langsung pecah menjadi (a - b)(a + b).',
    commonMistakes: 'Menghitung 175² dan 125² secara manual sehingga rawan salah dan memakan waktu.',
    tip: 'Bentuk a² - b² hampir selalu dirancang untuk dicoret dengan penyebut.',
    refs: [{ title: 'Aljabar Cepat Berhitung', source: 'Panduan TIU Numerik', note: 'Identitas a² - b²' }]
  },
  {
    id: 'TIU-P4-018',
    subject: 'TIU',
    topicSlug: 'berhitung',
    subtopic: 'Akar Desimal & Pangkat Pecahan',
    difficulty: 'MEDIUM',
    stem: 'Nilai dari √(1,44) × 25 - (3/5)³ × 125 adalah...',
    options: {
      A: { text: '3', why: 'Benar: (1,2 × 25) - ((27/125) × 125) = 30 - 27 = 3.' },
      B: { text: '6', why: 'Salah menaksir √1,44 atau memangkatkan 3³.' },
      C: { text: '9', why: 'Salah mengira 3³ = 9 atau mengalikan 1,2 × 25.' },
      D: { text: '12', why: 'Salah menghitung (3/5)³ sebagai 18/125.' },
      E: { text: '15', why: 'Keliru menghitung 1,2 × 25 sebagai 42.' }
    },
    correct: 'A',
    concept: 'Akar bilangan desimal dua angka di belakang koma (√1,44 = 1,2) dan penyederhanaan pangkat pecahan (5³ = 125).',
    steps: [
      '√(1,44) = 1,2 sehingga 1,2 × 25 = 30.',
      '(3/5)³ = 3³ / 5³ = 27 / 125.',
      '(27 / 125) × 125 = 27.',
      '30 - 27 = 3.'
    ],
    correctReason: 'Faktor 5³ pada penyebut tepat sama dengan 125 sehingga suku kedua menyisakan 3³ = 27.',
    quickTrick: '125 = 5³, langsung coret penyebut 5³ -> sisa 30 - 27 = 3.',
    commonMistakes: 'Mengira √1,44 = 0,12 (padahal 0,12² = 0,0144).',
    tip: 'Jumlah angka di belakang koma setelah ditarik akar berkurang setengahnya (2 digit -> 1 digit).',
    refs: [{ title: 'Operasi Akar dan Eksponen', source: 'Modul Berhitung TIU', note: 'Desimal Kuadrat & Kubik' }]
  },
  {
    id: 'TIU-P4-019',
    subject: 'TIU',
    topicSlug: 'berhitung',
    subtopic: 'Diskon Bertingkat',
    difficulty: 'EASY',
    stem: 'Sebuah buku referensi berharga Rp250.000 mendapat diskon bertingkat 20% + 10%. Harga bersih yang harus dibayar pembeli adalah...',
    options: {
      A: { text: 'Rp175.000', why: 'Salah menjumlahkan diskon menjadi 30% langsung.' },
      B: { text: 'Rp180.000', why: 'Benar: setelah diskon 20% menjadi Rp200.000, lalu diskon 10% menjadi Rp180.000.' },
      C: { text: 'Rp185.000', why: 'Salah menghitung 10% dari Rp200.000.' },
      D: { text: 'Rp190.000', why: 'Keliru menghitung diskon kedua dari Rp100.000.' },
      E: { text: 'Rp200.000', why: 'Baru menghitung diskon pertama 20% saja.' }
    },
    correct: 'B',
    concept: 'Diskon bertingkat a% + b% berarti potongan kedua dikenakan atas harga setelah potongan pertama: H × (1 - a%) × (1 - b%).',
    steps: [
      'Harga setelah diskon 20% = 80% × Rp250.000 = Rp200.000.',
      'Harga setelah diskon lanjutan 10% = 90% × Rp200.000 = Rp180.000.'
    ],
    correctReason: 'Pengalian faktor sisa bayar 0,8 × 0,9 = 0,72 memberikan 0,72 × 250.000 = 180.000.',
    quickTrick: '0,8 × 0,9 = 72% -> 72% × 250.000 = 180.000.',
    commonMistakes: 'Menjumlahkan 20% + 10% menjadi diskon tunggal 30% (Rp175.000).',
    tip: 'Diskon bertingkat selalu menghasilkan total potongan lebih kecil daripada penjumlahan langsung persennya.',
    refs: [{ title: 'Aritmetika Sosial Diskon', source: 'Materi Numerik SKD', note: 'Diskon Majemuk' }]
  },
  {
    id: 'TIU-P4-020',
    subject: 'TIU',
    topicSlug: 'berhitung',
    subtopic: 'Sifat Bilangan Berpangkat',
    difficulty: 'MEDIUM',
    stem: 'Hasil dari (4⁸ × 2⁻⁶) / 8² adalah...',
    options: {
      A: { text: '4', why: 'Salah mengonversi 8² menjadi 2⁸ alih-alih 2⁶.' },
      B: { text: '8', why: 'Salah menghitung 4⁸ sebagai 2¹⁵.' },
      C: { text: '16', why: 'Benar: (2¹⁶ × 2⁻⁶) / 2⁶ = 2¹⁰ / 2⁶ = 2⁴ = 16.' },
      D: { text: '32', why: 'Salah menjumlahkan eksponen pada pembagian.' },
      E: { text: '64', why: 'Salah menghitung 8² sebagai 2⁴.' }
    },
    correct: 'C',
    concept: 'Mengubah semua basis menjadi bilangan prima yang sama (basis 2) lalu menerapkan aturan pangkat.',
    steps: [
      'Ubah basis ke 2: 4⁸ = (2²)⁸ = 2¹⁶, dan 8² = (2³)² = 2⁶.',
      'Pembilang: 2¹⁶ × 2⁻⁶ = 2^(16 - 6) = 2¹⁰.',
      'Bagi dengan penyebut: 2¹⁰ / 2⁶ = 2^(10 - 6) = 2⁴ = 16.'
    ],
    correctReason: 'Seluruh faktor merupakan perpangkatan 2 dengan eksponen akhir 16 - 6 - 6 = 4.',
    quickTrick: 'Tulis pangkatnya saja dalam basis 2: (2×8) + (-6) - (3×2) = 16 - 6 - 6 = 4 -> 2⁴ = 16.',
    commonMistakes: 'Mengalikan 4 × 8 menjadi 32 atau keliru saat memangkatkan pangkat (4⁸ menjadi 2¹⁰).',
    tip: 'Ubah basis 4, 8, 16, 32, 64 ke 2^n di awal sebelum menyentuh operasi kali atau bagi.',
    refs: [{ title: 'Eksponen Dasar TIU', source: 'Kumpulan Rumus Numerik', note: 'Konversi Basis Prima' }]
  },

  // ================= DERET ANGKA (5) =================
  {
    id: 'TIU-P4-021',
    subject: 'TIU',
    topicSlug: 'deret-angka',
    subtopic: 'Deret Selisih Bertingkat Geometri',
    difficulty: 'EASY',
    stem: 'Perhatikan barisan bilangan berikut: 3, 7, 15, 31, 63, ... Bilangan yang tepat untuk melengkapi titik-titik tersebut adalah...',
    options: {
      A: { text: '95', why: 'Menambah +32 lagi, bukan +64.' },
      B: { text: '115', why: 'Salah penjumlahan 63 + 52.' },
      C: { text: '125', why: 'Keliru menghitung 2×63 - 1.' },
      D: { text: '127', why: 'Benar: selisih berlipat dua (+4, +8, +16, +32, +64), sehingga 63 + 64 = 127.' },
      E: { text: '129', why: 'Keliru menghitung 2×63 + 3.' }
    },
    correct: 'D',
    concept: 'Barisan dengan beda membentuk deret geometri (+4, +8, +16, +32, ...) atau relasi rekursif 2n + 1.',
    steps: [
      'Cek selisih antarsuku: 7-3=4, 15-7=8, 31-15=16, 63-31=32.',
      'Pola selisih selalu dikali 2, maka selisih berikutnya adalah 32 × 2 = 64.',
      'Suku berikutnya = 63 + 64 = 127 (atau 2 × 63 + 1 = 127).'
    ],
    correctReason: 'Baik aturan selisih ×2 maupun rumus 2n + 1 menghasilkan 127.',
    quickTrick: 'Terlihat hampir berlipat dua: 63 × 2 + 1 = 127.',
    commonMistakes: 'Menggunakan selisih aritmetika tetap atau lupa menggandakan selisih terakhir.',
    tip: 'Jika suku melompat sekitar 2 kali lipat, cek pola 2n ± k.',
    refs: [{ title: 'Pola Deret Rekursif', source: 'Modul TIU Deret', note: 'Selisih Berlipat Dua' }]
  },
  {
    id: 'TIU-P4-022',
    subject: 'TIU',
    topicSlug: 'deret-angka',
    subtopic: 'Deret Penjumlahan Dua Suku Sebelumnya',
    difficulty: 'EASY',
    stem: 'Perhatikan deret berikut: 5, 8, 13, 21, 34, 55, ... Angka selanjutnya adalah...',
    options: {
      A: { text: '76', why: 'Mengira selisih tetap +21.' },
      B: { text: '84', why: 'Salah menjumlahkan 34 + 50.' },
      C: { text: '89', why: 'Benar: setiap suku merupakan jumlah dua suku sebelumnya (34 + 55 = 89).' },
      D: { text: '91', why: 'Salah penjumlahan 36 + 55.' },
      E: { text: '94', why: 'Mengira pola selisih kelipatan 10.' }
    },
    correct: 'C',
    concept: 'Deret tipe Fibonacci: U(n) = U(n-1) + U(n-2).',
    steps: [
      '5 + 8 = 13.',
      '8 + 13 = 21.',
      '13 + 21 = 34.',
      '21 + 34 = 55.',
      'Maka suku selanjutnya = 34 + 55 = 89.'
    ],
    correctReason: 'Setiap angka sejak suku ketiga tepat sama dengan jumlah dua angka di depannya.',
    quickTrick: '5+8=13, 8+13=21 -> langsung kenali pola Fibonacci, jumlahkan dua angka terakhir 34+55 = 89.',
    commonMistakes: 'Mencari selisih tingkat kedua terlalu lama padahal deret Fibonacci lebih cepat terlihat.',
    tip: 'Biasakan cek apakah suku ke-3 merupakan jumlah dua suku pertama.',
    refs: [{ title: 'Deret Fibonacci dalam TIU', source: 'Bank Soal Numerik BKN', note: 'Penjumlahan Dua Suku' }]
  },
  {
    id: 'TIU-P4-023',
    subject: 'TIU',
    topicSlug: 'deret-angka',
    subtopic: 'Deret Pengurangan Bertingkat',
    difficulty: 'EASY',
    stem: 'Lengkapi deret angka berikut: 120, 118, 114, 108, 100, 90, ...',
    options: {
      A: { text: '76', why: 'Mengurangi dengan 14 alih-alih 12.' },
      B: { text: '78', why: 'Benar: pengurangan berturut-turut -2, -4, -6, -8, -10, lalu -12 -> 90 - 12 = 78.' },
      C: { text: '80', why: 'Mengulangi pengurangan -10.' },
      D: { text: '82', why: 'Mengira pola selisih berbalik menjadi -8.' },
      E: { text: '84', why: 'Mengurangi 90 dengan 6.' }
    },
    correct: 'B',
    concept: 'Deret aritmetika bertingkat dengan beda negatif berpola bilangan genap (-2, -4, -6, ...).',
    steps: [
      'Hitung selisih tiap langkah: 118-120 = -2; 114-118 = -4; 108-114 = -6; 100-108 = -8; 90-100 = -10.',
      'Pola pengurangan bertambah 2 setiap langkah, sehingga langkah berikutnya adalah -12.',
      '90 - 12 = 78.'
    ],
    correctReason: 'Selisih membentuk barisan genap negatif sehingga setelah -10 wajib turun 12.',
    quickTrick: 'Selisih: -2, -4, -6, -8, -10, berikutnya pasti -12 -> 90 - 12 = 78.',
    commonMistakes: 'Terburu-buru mengira -10 diikuti -14 atau mengulang -10.',
    tip: 'Tuliskan selisih di bawah tanda panah antarangka agar pola tingkat 1 langsung tampak.',
    refs: [{ title: 'Deret Aritmetika Bertingkat', source: 'Modul Deret CPNS', note: 'Beda Genap Negatif' }]
  },
  {
    id: 'TIU-P4-024',
    subject: 'TIU',
    topicSlug: 'deret-angka',
    subtopic: 'Operasi Bergantian (Kali dan Bagi)',
    difficulty: 'MEDIUM',
    stem: 'Perhatikan pola barisan: 8, 24, 12, 36, 18, 54, ... Bilangan selanjutnya adalah...',
    options: {
      A: { text: '18', why: 'Membagi 54 dengan 3, padahal operasi bagi yang digunakan adalah ÷2.' },
      B: { text: '24', why: 'Mengurangi 54 dengan 30, bukan membagi 2.' },
      C: { text: '27', why: 'Benar: polanya bergantian ×3 dan ÷2, sehingga 54 ÷ 2 = 27.' },
      D: { text: '36', why: 'Mengira pola selisih +18.' },
      E: { text: '162', why: 'Mengulang operasi ×3 dua kali berturut-turut.' }
    },
    correct: 'C',
    concept: 'Deret satu larik dengan dua operator yang bekerja bergantian (×3, ÷2, ×3, ÷2, ...).',
    steps: [
      '8 × 3 = 24.',
      '24 ÷ 2 = 12.',
      '12 × 3 = 36.',
      '36 ÷ 2 = 18.',
      '18 × 3 = 54.',
      'Langkah berikutnya adalah ÷2: 54 ÷ 2 = 27.'
    ],
    correctReason: 'Pola naik-turun bergantian disebabkan siklus ×3 kemudian ÷2.',
    quickTrick: 'Barisan naik lalu turun teratur: cek ×3 lalu ÷2; setelah ×3 menghasilkan 54, giliran ÷2 -> 27.',
    commonMistakes: 'Menerapkan ×3 kembali (162) karena tidak menandai urutan operator.',
    tip: 'Tandai setiap langkah naik/turun secara berurutan agar tidak tertukar giliran operasinya.',
    refs: [{ title: 'Deret Operasi Bergantian', source: 'Materi TIU Numerik', note: 'Siklus Kali-Bagi' }]
  },
  {
    id: 'TIU-P4-025',
    subject: 'TIU',
    topicSlug: 'deret-angka',
    subtopic: 'Deret Dua Larik (Selang-Seling)',
    difficulty: 'MEDIUM',
    stem: 'Diketahui deret dua larik: 2, 40, 6, 36, 18, 32, 54, ... Bilangan yang tepat mengisi posisi selanjutnya adalah...',
    options: {
      A: { text: '26', why: 'Mengurangi 32 dengan 6 alih-alih 4.' },
      B: { text: '28', why: 'Benar: larik genap turun 4 setiap langkah (40, 36, 32, 28).' },
      C: { text: '30', why: 'Mengurangi 32 dengan 2.' },
      D: { text: '60', why: 'Mencampur pola larik ganjil dan genap.' },
      E: { text: '162', why: 'Menghitung suku ke-9 (larik ganjil: 54 × 3), padahal yang ditanya suku ke-8.' }
    },
    correct: 'B',
    concept: 'Memisahkan suku posisi ganjil dan posisi genap saat nilai barisan berosilasi besar-kecil secara terpisah.',
    steps: [
      'Larik posisi ganjil (suku ke-1, 3, 5, 7): 2, 6, 18, 54 (aturan ×3).',
      'Larik posisi genap (suku ke-2, 4, 6, 8): 40, 36, 32, ... (aturan -4).',
      'Posisi yang ditanyakan adalah suku ke-8 (posisi genap), sehingga 32 - 4 = 28.'
    ],
    correctReason: 'Suku ke-8 berada pada larik genap yang berkurang 4 secara konstan.',
    quickTrick: 'Suku yang ditanya terletak setelah 54 (larik ganjil), jadi ikuti deret 40 -> 36 -> 32 -> 28.',
    commonMistakes: 'Menghitung suku berikutnya untuk larik ganjil (162) padahal gilirannya milik larik genap.',
    tip: 'Lingkari suku genap agar langsung terlihat posisi mana yang sedang ditanyakan.',
    refs: [{ title: 'Deret Multi-Larik SKD', source: 'Pedoman TIU BKN', note: 'Dua Larik Berbeda Operator' }]
  },

  // ================= PERBANDINGAN KUANTITATIF (5) =================
  {
    id: 'TIU-P4-026',
    subject: 'TIU',
    topicSlug: 'perbandingan-kuantitatif',
    subtopic: 'Persentase & Pecahan Bilangan Bulat',
    difficulty: 'EASY',
    stem: 'Diketahui P = (2/5 dari 150) + 12 dan Q = 18% dari 400. Berdasarkan informasi tersebut, hubungan yang tepat antara P dan Q adalah...',
    options: {
      A: { text: 'P > Q', why: 'Kedua nilai sama besar (72).' },
      B: { text: 'P < Q', why: 'Kedua nilai sama besar (72).' },
      C: { text: 'P = Q', why: 'Benar: P = 60 + 12 = 72 dan Q = 0,18 × 400 = 72.' },
      D: { text: 'P = 2Q', why: 'Tidak sesuai perhitungan (72 ≠ 144).' },
      E: { text: 'Hubungan P dan Q tidak dapat ditentukan', why: 'Kedua kuantitas bernilai pasti.' }
    },
    correct: 'C',
    concept: 'Menghitung nilai numerik eksak kedua kolom lalu membandingkan hasilnya.',
    steps: [
      'Hitung P: (2/5 × 150) + 12 = 60 + 12 = 72.',
      'Hitung Q: (18/100) × 400 = 18 × 4 = 72.',
      'Karena P = 72 dan Q = 72, maka P = Q.'
    ],
    correctReason: 'Nilai numerik P dan Q sama-sama tepat 72.',
    quickTrick: '18% × 400 sama cepatnya dengan 18 × 4 = 72.',
    commonMistakes: 'Salah menghitung 2/5 × 150 sebagai 50.',
    tip: 'Sederhanakan persen kelipatan 100 dengan mencoret dua nol lebih dahulu.',
    refs: [{ title: 'Perbandingan Kuantitatif Dasar', source: 'Modul TIU BKN', note: 'Nilai Eksak Sama' }]
  },
  {
    id: 'TIU-P4-027',
    subject: 'TIU',
    topicSlug: 'perbandingan-kuantitatif',
    subtopic: 'Sifat Bilangan Pecahan Positif (0 < x < 1)',
    difficulty: 'MEDIUM',
    stem: 'Diketahui bilangan real x memenuhi 0 < x < 1. Jika P = x² dan Q = x, manakah pernyataan yang paling tepat?',
    options: {
      A: { text: 'P > Q', why: 'Berlaku bila x > 1 atau x < 0, bukan saat 0 < x < 1.' },
      B: { text: 'P < Q', why: 'Benar: untuk bilangan di antara 0 dan 1, nilai kuadratnya selalu lebih kecil daripada bilangan asalnya.' },
      C: { text: 'P = Q', why: 'Hanya terjadi bila x = 0 atau x = 1, sedangkan syaratnya terbuka 0 < x < 1.' },
      D: { text: 'P + Q = 1', why: 'Tidak harus (misal x = 1/2 -> 1/4 + 1/2 = 3/4 ≠ 1).' },
      E: { text: 'Hubungan P dan Q tidak dapat ditentukan', why: 'Tanda ketidaksamaan berlaku konsisten untuk semua x di interval (0, 1).' }
    },
    correct: 'B',
    concept: 'Mengkuadratkan pecahan sejati positif (0 < x < 1) menghasilkan nilai yang lebih kecil.',
    steps: [
      'Karena x > 0 dan x < 1, kalikan kedua ruas pertidaksamaan x < 1 dengan bilangan positif x.',
      'Diperoleh x² < x, yaitu P < Q.',
      'Uji sampel x = 1/2: P = 1/4 dan Q = 1/2, jelas P < Q.'
    ],
    correctReason: 'Perkalian dengan bilangan di antara 0 dan 1 memperkecil nilai positif awal.',
    quickTrick: 'Substitusi cepat x = 0,5 -> P = 0,25 < Q = 0,5.',
    commonMistakes: 'Terbiasa dengan bilangan bulat ≥ 2 sehingga mengira x² selalu lebih besar daripada x.',
    tip: 'Untuk pertidaksamaan aljabar di TIU, uji batas atau sampel seperti 1/2, 2, -1/2, -2 sesuai domain soal.',
    refs: [{ title: 'Aljabar Interval Pecahan', source: 'Pedoman TIU Kuantitatif', note: 'Domain (0, 1)' }]
  },
  {
    id: 'TIU-P4-028',
    subject: 'TIU',
    topicSlug: 'perbandingan-kuantitatif',
    subtopic: 'Akar Genap vs Akar Ganjil (Ambiguitas Tanda)',
    difficulty: 'HARD',
    stem: 'Diketahui a dan b adalah bilangan bulat yang memenuhi a² = 25 dan b³ = 125. Jika P = a + b dan Q = 10, maka hubungan P dan Q adalah...',
    options: {
      A: { text: 'P > Q', why: 'Nilai terbesar P hanya 5 + 5 = 10, tidak pernah melebihi 10.' },
      B: { text: 'P < Q', why: 'P memang 0 saat a = -5, tetapi saat a = 5 nilainya P = 10 = Q.' },
      C: { text: 'P = Q', why: 'Hanya benar jika a = 5; mengabaikan solusi a = -5.' },
      D: { text: 'P - Q = 5', why: 'Tidak konsisten dengan a = ±5 dan b = 5.' },
      E: { text: 'Hubungan P dan Q tidak dapat ditentukan', why: 'Benar: jika a = 5 maka P = Q (10 = 10), sedangkan jika a = -5 maka P < Q (0 < 10).' }
    },
    correct: 'E',
    concept: 'Persamaan kuadrat a² = k (k > 0) selalu memiliki dua akar real ±√k, sedangkan persamaan pangkat ganjil b³ = 125 hanya punya satu solusi real.',
    steps: [
      'Dari a² = 25 diperoleh dua kemungkinan: a = 5 atau a = -5.',
      'Dari b³ = 125 diperoleh satu solusi real: b = 5.',
      'Jika a = 5, maka P = 5 + 5 = 10 sehingga P = Q.',
      'Jika a = -5, maka P = -5 + 5 = 0 sehingga P < Q.',
      'Karena bisa menghasilkan P = Q maupun P < Q, hubungan keduanya tidak dapat ditentukan.'
    ],
    correctReason: 'Dua kemungkinan nilai a memberikan kesimpulan hubungan yang berbeda terhadap Q.',
    quickTrick: 'Pangkat genap (a² = 25) selalu memberi ±5 -> langsung cek apakah tanda negatif mengubah perbandingan.',
    commonMistakes: 'Lupa bahwa (-5)² juga menghasilkan 25.',
    tip: 'Setiap kali melihat x² = angka positif tanpa syarat x > 0, wajib uji x negatif.',
    refs: [{ title: 'Jebakan Pangkat Genap', source: 'Bank Soal TIU Kuantitatif', note: 'Dua Solusi Persamaan Kuadrat' }]
  },
  {
    id: 'TIU-P4-029',
    subject: 'TIU',
    topicSlug: 'perbandingan-kuantitatif',
    subtopic: 'Perbandingan Luas Bangun Datar',
    difficulty: 'EASY',
    stem: 'Sebuah persegi memiliki keliling 48 cm. Jika P adalah luas persegi tersebut (dalam cm²) dan Q adalah luas persegi panjang berukuran 16 cm × 8 cm (dalam cm²), maka...',
    options: {
      A: { text: 'P > Q', why: 'Benar: sisi persegi = 48/4 = 12 cm sehingga P = 12² = 144, sedangkan Q = 16 × 8 = 128.' },
      B: { text: 'P < Q', why: '144 lebih besar daripada 128.' },
      C: { text: 'P = Q', why: 'Keliling keduanya memang sama (48 cm), tetapi luas persegi selalu maksimal.' },
      D: { text: '2Q < P', why: '2Q = 256 tidak lebih kecil daripada 144.' },
      E: { text: 'Hubungan P dan Q tidak dapat ditentukan', why: 'Nilai P dan Q jelas dapat dihitung.' }
    },
    correct: 'A',
    concept: 'Untuk keliling yang sama, luas persegi selalu lebih besar daripada persegi panjang mana pun yang sisinya tidak sama.',
    steps: [
      'Keliling persegi = 48 cm -> panjang sisi s = 48 ÷ 4 = 12 cm.',
      'P = s² = 12 × 12 = 144 cm².',
      'Q = 16 × 8 = 128 cm².',
      'Karena 144 > 128, maka P > Q.'
    ],
    correctReason: 'P = 144 cm² melampaui Q = 128 cm² meskipun keliling kedua bangun sama-sama 48 cm.',
    quickTrick: 'Persegi dan persegi panjang berkeliling sama (2(16+8)=48): luas persegi SELALU paling besar!',
    commonMistakes: 'Mengira keliling sama otomatis menghasilkan luas sama.',
    tip: 'Ingat sifat isoperimetrik: untuk keliling tertentu, persegi memaksimalkan luas segi empat siku-siku.',
    refs: [{ title: 'Geometri Bangun Datar TIU', source: 'Modul Numerik CPNS', note: 'Keliling Sama vs Luas' }]
  },
  {
    id: 'TIU-P4-030',
    subject: 'TIU',
    topicSlug: 'perbandingan-kuantitatif',
    subtopic: 'Perbandingan Senilai Harga Satuan',
    difficulty: 'EASY',
    stem: 'Harga 3 rim kertas HVS adalah Rp165.000. Jika P adalah harga 5 rim kertas yang sama dan Q = Rp260.000, maka hubungan yang tepat antara P dan Q adalah...',
    options: {
      A: { text: 'P > Q', why: 'Benar: harga 1 rim = Rp55.000 sehingga P = 5 × Rp55.000 = Rp275.000 > Rp260.000.' },
      B: { text: 'P < Q', why: 'Rp275.000 lebih mahal daripada Rp260.000.' },
      C: { text: 'P = Q', why: 'Selisih keduanya adalah Rp15.000.' },
      D: { text: 'Q - P = Rp15.000', why: 'Terbalik: P - Q = Rp15.000.' },
      E: { text: 'Hubungan P dan Q tidak dapat ditentukan', why: 'Nilai P dapat dihitung pasti.' }
    },
    correct: 'A',
    concept: 'Perbandingan senilai untuk menghitung harga banyak barang dari harga satuan.',
    steps: [
      'Harga 1 rim = Rp165.000 ÷ 3 = Rp55.000.',
      'P = 5 × Rp55.000 = Rp275.000.',
      'Bandingkan dengan Q = Rp260.000 -> P > Q.'
    ],
    correctReason: 'Lima rim berharga Rp275.000, melebihi Rp260.000.',
    quickTrick: '165 ÷ 3 = 55; 55 × 5 = 275 -> 275 > 260.',
    commonMistakes: 'Salah membagi 165 ÷ 3 menjadi 52.',
    tip: 'Sederhanakan nol ribuan terlebih dahulu (165 dan 260) agar hitungan lebih ringan.',
    refs: [{ title: 'Perbandingan Senilai Sederhana', source: 'Latihan TIU Numerik', note: 'Harga Satuan' }]
  },

  // ================= SOAL CERITA (5) =================
  {
    id: 'TIU-P4-031',
    subject: 'TIU',
    topicSlug: 'soal-cerita',
    subtopic: 'Perbandingan Berbalik Nilai (Pekerja & Hari Terhenti)',
    difficulty: 'MEDIUM',
    stem: 'Proyek penataan arsip direncanakan selesai dalam 24 hari oleh 15 pekerja. Setelah bekerja selama 8 hari, pekerjaan terpaksa terhenti selama 4 hari karena kendala pasokan. Agar proyek tetap selesai tepat waktu sesuai rencana awal, berapa banyak pekerja tambahan yang diperlukan?',
    options: {
      A: { text: '3 orang', why: 'Tidak cukup menutup kekurangan beban kerja selama 4 hari terhenti.' },
      B: { text: '4 orang', why: 'Salah membagi sisa beban kerja dengan sisa hari.' },
      C: { text: '5 orang', why: 'Benar: total pekerja dibutuhkan = (15 × 16) / 12 = 20 orang, sehingga perlu tambahan 20 - 15 = 5 orang.' },
      D: { text: '6 orang', why: 'Berlebih dari kebutuhan minimum tepat waktu.' },
      E: { text: '20 orang', why: '20 adalah jumlah TOTAL pekerja, bukan pekerja TAMBAHAN.' }
    },
    correct: 'C',
    concept: 'Total beban kerja tersisa (pekerja awal × sisa hari rencana) dibagi sisa hari efektif yang benar-benar tersedia.',
    steps: [
      'Sisa hari rencana setelah 8 hari kerja = 24 - 8 = 16 hari.',
      'Sisa hari efektif setelah terhenti 4 hari = 16 - 4 = 12 hari.',
      'Sisa beban kerja = 15 pekerja × 16 hari = 240 orang-hari.',
      'Kebutuhan pekerja pada sisa waktu = 240 ÷ 12 = 20 pekerja.',
      'Tambahan pekerja = 20 - 15 = 5 orang.'
    ],
    correctReason: 'Empat hari libur pada beban 15 orang harus dikejar selama 12 hari efektif: (15×4)/12 = 5 orang tambahan.',
    quickTrick: 'Trik cepat: Tambahan = (Pekerja × Hari Berhenti) / Sisa Hari Efektif = (15 × 4) / 12 = 5 orang.',
    commonMistakes: 'Memilih 20 orang tanpa mengurangkan dengan 15 pekerja yang sudah ada.',
    tip: 'Baca ulang kalimat pertanyaan: apakah yang ditanya "total pekerja" atau "pekerja tambahan".',
    refs: [{ title: 'Rumus Cepat Proyek Terhenti', source: 'Modul Soal Cerita BKN', note: 'Perbandingan Berbalik Nilai' }]
  },
  {
    id: 'TIU-P4-032',
    subject: 'TIU',
    topicSlug: 'soal-cerita',
    subtopic: 'Jarak, Kecepatan & Waktu dengan Jeda',
    difficulty: 'EASY',
    stem: 'Sebuah mobil dinas berangkat dari Kota A menuju Kota B yang berjarak 210 km pada pukul 07.30 dengan kecepatan rata-rata 60 km/jam. Di tengah perjalanan, pengemudi berhenti istirahat selama 15 menit. Pukul berapa mobil tersebut tiba di Kota B?',
    options: {
      A: { text: '10.45', why: 'Kurang 30 menit karena keliru membagi 210 ÷ 60.' },
      B: { text: '11.00', why: 'Belum menambahkan waktu istirahat 15 menit.' },
      C: { text: '11.15', why: 'Benar: waktu berkendara 3 jam 30 menit + istirahat 15 menit = 3 jam 45 menit; tiba 07.30 + 03.45 = 11.15.' },
      D: { text: '11.30', why: 'Menambahkan istirahat 30 menit alih-alih 15 menit.' },
      E: { text: '11.45', why: 'Menghitung waktu tempuh sebagai 4 jam.' }
    },
    correct: 'C',
    concept: 'Waktu total perjalanan = (Jarak / Kecepatan) + total waktu jeda/istirahat.',
    steps: [
      'Waktu tempuh gerak = 210 km ÷ 60 km/jam = 3,5 jam = 3 jam 30 menit.',
      'Total durasi termasuk istirahat = 3 jam 30 menit + 15 menit = 3 jam 45 menit.',
      'Waktu tiba = 07.30 + 03.45 = 11.15.'
    ],
    correctReason: 'Konversi 0,5 jam = 30 menit ditambah istirahat 15 menit memberi total perjalanan 3 jam 45 menit.',
    quickTrick: '210 ÷ 60 = 3,5 jam (11.00) + 15 menit = 11.15.',
    commonMistakes: 'Mengira 3,5 jam berarti 3 jam 50 menit.',
    tip: 'Kalikan angka di belakang koma jam dengan 60 sebelum menjumlahkannya ke menit jam.',
    refs: [{ title: 'Kecepatan & Waktu Perjalanan', source: 'Materi Numerik SKD', note: 'Konversi Desimal Jam' }]
  },
  {
    id: 'TIU-P4-033',
    subject: 'TIU',
    topicSlug: 'soal-cerita',
    subtopic: 'Perbandingan Umur',
    difficulty: 'MEDIUM',
    stem: 'Perbandingan umur Ayah dan Budi saat ini adalah 7 : 2. Lima tahun yang akan datang, jumlah umur mereka menjadi 55 tahun. Berapakah selisih umur Ayah dan Budi saat ini?',
    options: {
      A: { text: '20 tahun', why: 'Salah menghitung jumlah umur saat ini sebagai 50 tahun.' },
      B: { text: '25 tahun', why: 'Benar: jumlah umur sekarang = 55 - 10 = 45; selisih = ((7-2)/(7+2)) × 45 = (5/9) × 45 = 25 tahun.' },
      C: { text: '28 tahun', why: 'Keliru menghitung 1 bagian rasio.' },
      D: { text: '30 tahun', why: 'Menggunakan selisih rasio tanpa mengurang 10 tahun dulu.' },
      E: { text: '35 tahun', why: '35 tahun adalah umur Ayah saat ini, bukan selisihnya.' }
    },
    correct: 'B',
    concept: 'Lima tahun mendatang, umur MASING-MASING dari kedua orang bertambah 5 tahun, sehingga jumlah umur bertambah 2 × 5 = 10 tahun.',
    steps: [
      'Jumlah umur saat ini = 55 - (5 + 5) = 45 tahun.',
      'Jumlah perbandingan = 7 + 2 = 9 bagian -> 1 bagian = 45 ÷ 9 = 5 tahun.',
      'Selisih perbandingan = 7 - 2 = 5 bagian.',
      'Selisih umur = 5 × 5 = 25 tahun.'
    ],
    correctReason: 'Kenaikan umur terjadi pada kedua orang secara bersamaan sebelum disamakan dengan rasio saat ini.',
    quickTrick: 'Selalu kurangi 2×5 = 10 untuk dua orang saat mundur 5 tahun -> 45 × (5/9) = 25.',
    commonMistakes: 'Hanya mengurangi 5 tahun (bukan 10 tahun) ketika kembali ke masa sekarang.',
    tip: 'Ingat bahwa waktu berjalan serentak untuk semua orang dalam perbandingan umur.',
    refs: [{ title: 'Soal Cerita Rasio Umur', source: 'Bank Soal TIU', note: 'Dua Orang Lima Tahun Lagi' }]
  },
  {
    id: 'TIU-P4-034',
    subject: 'TIU',
    topicSlug: 'soal-cerita',
    subtopic: 'Rata-Rata Gabungan',
    difficulty: 'MEDIUM',
    stem: 'Rata-rata nilai tryout 18 peserta adalah 75. Setelah 2 peserta susulan digabungkan, rata-rata nilai seluruh peserta naik menjadi 76. Berapakah rata-rata nilai kedua peserta susulan tersebut?',
    options: {
      A: { text: '82', why: 'Menghitung total tambahan nilai secara keliru.' },
      B: { text: '84', why: 'Lupa menambahkan kenaikan rata-rata pada 18 peserta lama.' },
      C: { text: '85', why: 'Benar: ((20 × 76) - (18 × 75)) / 2 = (1.520 - 1.350) / 2 = 170 / 2 = 85.' },
      D: { text: '86', why: 'Salah membagi 172 dengan 2.' },
      E: { text: '88', why: 'Menghitung tambahan beban untuk 24 orang.' }
    },
    correct: 'C',
    concept: 'Jumlah nilai kelompok baru = Total nilai gabungan - Total nilai kelompok awal.',
    steps: [
      'Total nilai awal (18 orang) = 18 × 75 = 1.350.',
      'Total nilai gabungan (20 orang) = 20 × 76 = 1.520.',
      'Jumlah nilai 2 peserta susulan = 1.520 - 1.350 = 170.',
      'Rata-rata 2 peserta susulan = 170 ÷ 2 = 85.'
    ],
    correctReason: 'Kedua peserta menyumbang total 170 poin sehingga rata-ratanya tepat 85.',
    quickTrick: 'Trik kenaikan: setiap dari 18 orang lama "disubsidi" +1 (total +18), dibagi rata untuk 2 orang susulan (+9 masing-masing di atas 76) -> 76 + 9 = 85!',
    commonMistakes: 'Membagi 170 untuk 1 orang atau lupa mengganti penyebut 18 menjadi 20.',
    tip: 'Metode "subsidi kenaikan" (76 + 18/2 = 85) menghindarkan perkalian ribuan.',
    refs: [{ title: 'Statistika Deskriptif Dasar', source: 'Modul TIU Numerik', note: 'Rata-Rata Gabungan' }]
  },
  {
    id: 'TIU-P4-035',
    subject: 'TIU',
    topicSlug: 'soal-cerita',
    subtopic: 'Laju Pengisian Gabungan',
    difficulty: 'HARD',
    stem: 'Sebuah tangki air kosong dapat diisi penuh oleh Keran A saja dalam waktu 4 jam, atau oleh Keran B saja dalam waktu 6 jam. Kedua keran dibuka bersamaan selama 2 jam, lalu Keran B ditutup. Berapa lama lagi Keran A harus tetap dibuka agar tangki tepat penuh?',
    options: {
      A: { text: '20 menit', why: 'Mengira sisa tangki hanya 1/12 bagian.' },
      B: { text: '30 menit', why: 'Mengira Keran A mengisi dengan laju gabungan.' },
      C: { text: '40 menit', why: 'Benar: dalam 2 jam terisi 2×(1/4 + 1/6) = 5/6 bagian; sisa 1/6 diisi Keran A dalam (1/6) ÷ (1/4) = 2/3 jam = 40 menit.' },
      D: { text: '45 menit', why: 'Salah menghitung sisa bagian tangki.' },
      E: { text: '60 menit', why: 'Mengira sisa tangki 1/4 bagian.' }
    },
    correct: 'C',
    concept: 'Menjumlahkan laju kerja per jam (1/t1 + 1/t2) untuk porsi kerja bersama, lalu membagi sisa bagian dengan laju keran yang tersisa.',
    steps: [
      'Laju Keran A = 1/4 tangki/jam; laju Keran B = 1/6 tangki/jam.',
      'Laju gabungan = 1/4 + 1/6 = 3/12 + 2/12 = 5/12 tangki/jam.',
      'Dalam 2 jam bersama, bagian terisi = 2 × 5/12 = 10/12 = 5/6 tangki.',
      'Sisa yang belum terisi = 1 - 5/6 = 1/6 tangki.',
      'Waktu tambahan oleh Keran A sendiri = (1/6) ÷ (1/4) = 4/6 = 2/3 jam = 40 menit.'
    ],
    correctReason: 'Sisa seperenam tangki diisi Keran A berkecepatan seperempat per jam selama dua pertiga jam (40 menit).',
    quickTrick: 'Misalkan kapasitas tangki KPK(4,6) = 12 liter -> A = 3 L/jam, B = 2 L/jam. 2 jam bersama = 2×5 = 10 L. Sisa 2 L diisi A (3 L/jam) dalam 2/3 jam = 40 menit.',
    commonMistakes: 'Lupa mengonversi pecahan jam 2/3 ke menit (mengira 2/3 jam = 23 menit).',
    tip: 'Mengganti kapasitas tangki dengan KPK waktu (12 liter) mengubah pecahan menjadi bilangan bulat yang jauh lebih cepat dihitung.',
    refs: [{ title: 'Laju Kerja Bersama', source: 'Bank Soal TIU HOTS', note: 'Metode KPK Kapasitas' }]
  }
];
