import { TkpInput } from './paket-builder';

export const PAKET5_TKP_DATA: TkpInput[] = [
  // ================= PELAYANAN PUBLIK (7) =================
  {
    id: 'TKP-P5-001',
    topicSlug: 'pelayanan-publik',
    subtopic: 'Prioritas Kelompok Rentan di Ruang Tunggu',
    difficulty: 'EASY',
    stem: 'Anda melihat seorang ibu yang menggendong bayi dan seorang lansia berkursi roda berdiri di sudut ruang tunggu pelayanan karena kursi antrean penuh oleh pemohon muda yang sehat. Sementara itu, loket prioritas masih digunakan untuk layanan reguler karena antrean biasa menumpuk. Tindakan Anda adalah...',
    options: {
      A: { text: 'Membiarkan mereka berdiri sambil mempercepat ketikan agar antrean reguler segera bergeser.', score: 2, why: 'Kurang sigap memberikan kenyamanan minimum kepada kelompok rentan.' },
      B: { text: 'Segera mencarikan tempat duduk layak dan mengaktifkan kembali fungsi loket prioritas sesuai SOP dengan memberi penjelasan sopan kepada pengantre reguler.', score: 5, why: 'Tanggap atas hak kelompok rentan sekaligus menjaga ketertiban komunikasi dengan pengantre lain.' },
      C: { text: 'Menyuruh petugas keamanan memindahkan dua pengantre muda secara paksa dari kursinya.', score: 3, why: 'Niat membantu baik, namun cara paksa tanpa penjelasan dapat memicu gesekan.' },
      D: { text: 'Mengingatkan bahwa pemohon dengan bayi atau lansia sebaiknya datang saat jam sepi menjelang siang.', score: 1, why: 'Membatasi waktu akses kelompok rentan yang justru harus diprioritaskan.' },
      E: { text: 'Menawarkan mereka duduk di ruang kerja staf bagian dalam sambil tetap menunggu giliran nomor antrean reguler.', score: 4, why: 'Memberi tempat duduk, tetapi belum memulihkan hak percepatan layanan di loket prioritas.' }
    },
    concept: 'Kelompok rentan (lansia, ibu hamil/menyusui, anak-anak, disabilitas) berhak atas sarana tunggu nyaman dan jalur prioritas layanan publik.',
    steps: [
      'Segera sediakan tempat duduk yang nyaman.',
      'Aktifkan jalur prioritas sesuai ketentuan.',
      'Berikan pengertian santun kepada pengantre reguler.'
    ],
    quickTrick: 'Segera bantu duduk + aktifkan loket prioritas + edukasi pengantre lain dengan sopan.',
    commonMistakes: 'Menggunakan loket prioritas untuk reguler hingga kelompok rentan terbengkalai.',
    tip: 'Pelayanan inklusif memperhatikan kenyamanan fisik dan percepatan akses sekaligus.',
    refs: [{ title: 'Pedoman Pelayanan Ramah Kelompok Rentan', source: 'KemenPAN-RB', note: 'Fasilitas & Jalur Prioritas' }]
  },
  {
    id: 'TKP-P5-002',
    topicSlug: 'pelayanan-publik',
    subtopic: 'Keterbukaan Kanal Pengaduan Masyarakat',
    difficulty: 'MEDIUM',
    stem: 'Seorang warga mengeluhkan lambannya penerbitan izin usahanya di kolom ulasan publik daring instansi Anda dengan kalimat cukup pedas. Anda mengetahui terdapat keterlambatan teknis di sistem verifikasi lintas dinas tiga hari lalu. Sikap terbaik tim pelayanan adalah...',
    options: {
      A: { text: 'Menghapus ulasan tersebut atau menyembunyikan komentarnya agar citra kantor di internet tetap baik.', score: 1, why: 'Anti-kritik dan menghilangkan akuntabilitas pengaduan publik.' },
      B: { text: 'Menanggapi secara resmi dan santun dengan permintaan maaf, menjelaskan progres terkini secara objektif, menindaklanjuti percepatan ke dinas terkait, dan menyediakan kontak pelacakan resmi.', score: 5, why: 'Responsif, transparan, berorientasi penyelesaian masalah warga, serta menjaga marwah layanan digital.' },
      C: { text: 'Membalas bahwa keterlambatan bukan salah instansi Anda melainkan berada di dinas teknis lain.', score: 2, why: 'Saling melempar kesalahan antarinstansi tidak membantu pemohon.' },
      D: { text: 'Meminta warga tersebut menghapus ulasannya dulu baru permohonannya dibantu dipercepat.', score: 3, why: 'Menahan layanan demi menghapus kritik tidak etis.' },
      E: { text: 'Menelepon warga secara pribadi untuk meminta maaf tanpa menuliskan respons tindak lanjut di kanal ulasan publik.', score: 4, why: 'Sudah responsif ke pemohon, namun publik yang membaca ulasan belum melihat transparansi penyelesaian.' }
    },
    concept: 'Pengelolaan pengaduan publik (SP4N-LAPOR! & ulasan digital) menuntut tanggapan empatik, bebas defensif, dan fokus pada penuntasan masalah.',
    steps: [
      'Respons keluhan dengan sopan tanpa menghapus atau menyalahkan.',
      'Koordinasikan percepatan kendala lintas instansi.',
      'Berikan pembaruan status yang terukur kepada pemohon.'
    ],
    quickTrick: 'Terima keluhan terbuka + minta maaf tulus + tindak lanjuti progresnya secara nyata.',
    commonMistakes: 'Menghapus ulasan negatif atau melempar tanggung jawab ke instansi lain.',
    tip: 'Ulasan publik yang direspons cepat dan solutif justru meningkatkan kepercayaan masyarakat.',
    refs: [{ title: 'Pengelolaan Pengaduan Pelayanan Publik', source: 'Perpres No. 76 Tahun 2013', note: 'Respons Kanal Publik' }]
  },
  {
    id: 'TKP-P5-003',
    topicSlug: 'pelayanan-publik',
    subtopic: 'Menjaga Keadilan Antrean dari Kenalan Pribadi',
    difficulty: 'EASY',
    stem: 'Saat antrean loket cukup panjang, seorang tetangga dekat Anda datang menghampiri meja samping dan berbisik meminta tolong agar berkasnya langsung Anda selesaikan sekarang karena ia sedang buru-buru menjemput anak sekolah. Sikap yang paling adil dan melayani adalah...',
    options: {
      A: { text: 'Langsung memproses berkasnya di sela panggilan antrean agar tidak menyakiti hubungan bertetangga.', score: 1, why: 'Korupsi waktu antrean yang merampas hak warga lain yang datang lebih awal.' },
      B: { text: 'Memintanya menitipkan berkas untuk Anda kerjakan setelah jam tutup kantor tanpa mengambil nomor antrean.', score: 2, why: 'Tetap merupakan jalur istimewa berbasis relasi pribadi.' },
      C: { text: 'Menjelaskan dengan ramah dan hormat bahwa seluruh pemohon dilayani sesuai nomor antrean demi keadilan bersama, membantunya mengambil nomor antrean/mengecek kelengkapan berkas terlebih dahulu agar saat gilirannya langsung tuntas.', score: 5, why: 'Teguh pada keadilan antrean namun tetap bersikap hangat dan membantu kelancaran berkas secara prosedural.' },
      D: { text: 'Menolaknya dengan suara keras di depan pengantre lain supaya warga melihat Anda sangat jujur.', score: 3, why: 'Mempermalukan orang di depan umum tidak sesuai kesantunan pelayanan.' },
      E: { text: 'Menyarankannya mendaftar ulang lewat layanan daring saja tanpa membantu mengecek kelengkapan berkas yang sudah ia bawa.', score: 4, why: 'Menolak jalur istimewa secara adil, tetapi kurang membantu memeriksa kesiapan berkas atau opsi layanan mandiri.' }
    },
    concept: 'Keadilan (non-diskriminasi) adalah prinsip inti layanan publik: kenalan, kerabat, dan masyarakat umum diperlakukan sama pada urutan layanan.',
    steps: [
      'Tolak permintaan mendahului antrean secara halus dan konsisten.',
      'Bantu arahkan ke prosedur antrean resmi atau cek syarat awal.',
      'Pertahankan keramahan agar relasi sosial tetap baik.'
    ],
    quickTrick: 'Teguh tolak potong antrean + tetap ramah memandu lewat prosedur resmi.',
    commonMistakes: 'Membolehkan "titip berkas" kenalan atau menegur dengan kasar.',
    tip: 'Standar layanan adil melarang hak istimewa bagi kenalan pribadi.',
    refs: [{ title: 'Asas Persamaan Perlakuan Pelayanan Publik', source: 'UU 25/2009', note: 'Anti-Jalur Khusus Relasi' }]
  },
  {
    id: 'TKP-P5-004',
    topicSlug: 'pelayanan-publik',
    subtopic: 'Layanan Jemput Bola untuk Wilayah Terpencil',
    difficulty: 'MEDIUM',
    stem: 'Data menunjukkan banyak warga dusun pegunungan yang sulit dijangkau transportasi umum belum memiliki dokumen kependudukan lengkap meski layanan di kantor kecamatan sudah gratis. Usulan pelayanan publik terbaik yang dapat Anda ajukan adalah...',
    options: {
      A: { text: 'Mengusulkan program layanan keliling terjadwal (jemput bola) bekerja sama dengan perangkat desa agar warga dusun terpencil memperoleh dokumen secara mudah dan terkoordinasi.', score: 5, why: 'Menjangkau hambatan geografis dan ekonomi warga melalui kolaborasi layanan keliling.' },
      B: { text: 'Membuat spanduk pengumuman tambahan di pinggir jalan raya utama kecamatan.', score: 2, why: 'Tidak menyelesaikan kendala jarak dan akses transportasi warga dusun pegunungan.' },
      C: { text: 'Mengusulkan denda keterlambatan pengurusan dokumen supaya warga terpaksa turun ke kecamatan.', score: 1, why: 'Menambah beban masyarakat rentan akses alih-alih memudahkan.' },
      D: { text: 'Menunggu hingga pihak pemerintah desa mengumpulkan seluruh berkas warganya lalu mengantarkannya ke kantor.', score: 4, why: 'Sudah memudahkan lewat kolektif desa, namun untuk dokumen biometrik/verifikasi langsung, layanan keliling lebih tuntas.' },
      E: { text: 'Menyediakan air minum gratis tambahan di kantor kecamatan bagi warga yang datang dari dusun jauh.', score: 3, why: 'Baik untuk kenyamanan di kantor, tetapi belum mengatasi sulitnya perjalanan turun dari dusun.' }
    },
    concept: 'Pelayanan publik proaktif berupaya mendekatkan layanan ke masyarakat yang terhambat akses geografis melalui kolaborasi dengan perangkat lokal.',
    steps: [
      'Petakan kelompok masyarakat yang terhambat jarak/akses.',
      'Rancang layanan jemput bola terjadwal dengan desa.',
      'Pastikan persyaratan dan jadwal disosialisasikan jauh hari.'
    ],
    quickTrick: 'Atasi kendala geografis dengan layanan keliling/jemput bola terkoordinasi.',
    commonMistakes: 'Menghukum ketertinggalan akses warga dengan denda atau sosialisasi pasif.',
    tip: 'Pelayanan modern bergerak mendatangi kebutuhan warga.',
    refs: [{ title: 'Inovasi Layanan Jemput Bola Dukcapil', source: 'Kemendagri & KemenPAN-RB', note: 'Aksesibilitas Wilayah 3T' }]
  },
  {
    id: 'TKP-P5-005',
    topicSlug: 'pelayanan-publik',
    subtopic: 'Bahasa Sederhana untuk Pemohon Awam',
    difficulty: 'EASY',
    stem: 'Seorang petani lansia datang ingin mengurus surat keterangan tanah, tetapi ia terus terlihat bingung saat Anda membacakan istilah administratif seperti "validasi spasial", "konfirmasi NJOP", dan "integrasi berkas digital". Langkah Anda selanjutnya adalah...',
    options: {
      A: { text: 'Tetap membacakan daftar istilah pada SOP kata demi kata agar sesuai standar baku tertulis.', score: 2, why: 'Mengutamakan jargon teknis di atas pemahaman nyata warga.' },
      B: { text: 'Menjelaskan ulang dengan bahasa sehari-hari yang sederhana dan hangat, memberi contoh dokumen fisik yang dimaksud (seperti SPPT PBB dan fotokopi KTP), serta menuliskan urutan singkat yang mudah dipahami.', score: 5, why: 'Empatik komunikatif: menerjemahkan birokrasi teknis ke bahasa yang dipahami langsung oleh warga.' },
      C: { text: 'Menyuruhnya pulang dan mengajak anaknya yang melek teknologi pada kunjungan berikutnya.', score: 1, why: 'Menolak memberi penjelasan yang ramah sesuai kapasitas pemohon.' },
      D: { text: 'Menyerahkan brosur persyaratan bergambar tanpa menjelaskannya lagi secara lisan.', score: 3, why: 'Membantu secara visual namun kurang pendampingan lisan bagi lansia.' },
      E: { text: 'Mengulang penjelasan yang sama dengan suara lebih pelan tanpa mengganti istilah teknisnya.', score: 4, why: 'Sudah sabar, tetapi akar kebingungannya adalah istilah teknis yang belum disederhanakan.' }
    },
    concept: 'Komunikasi efektif pelayan publik menyesuaikan pilihan kata dengan latar belakang pemohon agar tidak terjadi salah paham dan bolak-balik.',
    steps: [
      'Terjemahkan jargon administratif ke contoh dokumen sehari-hari.',
      'Tulis langkah singkat yang jelas.',
      'Konfirmasi kembali apakah pemohon sudah memahaminya.'
    ],
    quickTrick: 'Ganti jargon teknis dengan bahasa sederhana & contoh dokumen nyata.',
    commonMistakes: 'Mengulang istilah teknis yang sama atau memulangkan warga awam.',
    tip: 'Pelayanan yang berhasil diukur dari pemahaman pemohon, bukan banyaknya istilah baku yang diucapkan petugas.',
    refs: [{ title: 'Komunikasi Publik Inklusif', source: 'LAN RI', note: 'Penyederhanaan Bahasa Layanan' }]
  },
  {
    id: 'TKP-P5-006',
    topicSlug: 'pelayanan-publik',
    subtopic: 'Menjaga Fokus & Keramahan Menjelang Jam Pulang',
    difficulty: 'MEDIUM',
    stem: 'Hari Jumat pukul 16.20 WIB, sepuluh menit sebelum jam layanan resmi ditutup, datang seorang pemohon terengah-engah karena terjebak macet dan hampir kehabisan waktu mengurus legalisasi berkas yang mendesak untuk seleksi kerja besok. Tindakan Anda yang tepat adalah...',
    options: {
      A: { text: 'Menolak menerimanya karena sistem loket akan segera dimatikan pukul 16.30 sehingga khawatir lembur beberapa menit.', score: 2, why: 'Loket masih dalam jam operasional (16.20 < 16.30); menolak pemohon yang datang sah merugikan warga.' },
      B: { text: 'Menerimanya dengan wajah tersenyum dan tenang, segera memeriksa kelengkapan berkas, serta memproses legalisasi dengan teliti tanpa tergesa-gesa meski sedikit melewati jam pulang.', score: 5, why: 'Memenuhi jam layanan resmi dengan tulus, teliti, dan penuh kepedulian terhadap kebutuhan mendesak warga.' },
      C: { text: 'Memprosesnya sambil menggerutu agar pemohon tahu Anda sudah hampir pulang.', score: 1, why: 'Melayani dengan sikap menggerutu merusak kenyamanan dan citra layanan publik.' },
      D: { text: 'Menerima berkasnya saja lalu memintanya mengambil hasil legalisasi pada hari Senin pagi.', score: 3, why: 'Tidak membantu kebutuhan seleksinya yang berlangsung besok (Sabtu).' },
      E: { text: 'Meminta ia memilih hanya dua lembar berkas terpenting saja karena waktu sudah mepet.', score: 4, why: 'Berusaha mengakomodasi cepat, padahal jika masih cukup waktu seluruh legalisasi bisa dituntaskan dengan cermat.' }
    },
    concept: 'Selama pemohon tiba dalam jam layanan resmi, petugas wajib melayani penuh dengan sikap ramah dan ketelitian mutu yang sama seperti pagi hari.',
    steps: [
      'Sambut dengan ramah tanpa menunjukkan keterpaksaan.',
      'Verifikasi syarat dan proses dengan cermat.',
      'Tuntaskan sebelum memutus operasional loket.'
    ],
    quickTrick: 'Selama masih jam buka, layani tuntas, ramah, dan teliti!',
    commonMistakes: 'Mengeluh di depan warga atau menutup antrean sebelum jam resmi berakhir.',
    tip: 'Kualitas pelayanan di menit-menit akhir hari kerja adalah cerminan ketulusan pengabdian.',
    refs: [{ title: 'Etika Operasional Loket', source: 'KemenPAN-RB', note: 'Disiplin Jam Layanan' }]
  },
  {
    id: 'TKP-P5-007',
    topicSlug: 'pelayanan-publik',
    subtopic: 'Mencegah Penolakan Berkas Berulang-ulang (Bolak-Balik)',
    difficulty: 'HARD',
    stem: 'Anda mendapati seorang warga sudah tiga kali bolak-balik mengurus perizinan karena setiap datang hanya diberi tahu satu kekurangan yang berbeda oleh petugas berbeda. Saat ia datang ke meja Anda dengan raut putus asa, tindakan terbaik Anda adalah...',
    options: {
      A: { text: 'Memeriksa seluruh berkasnya secara menyeluruh dari awal hingga akhir dalam satu kali pemeriksaan, menandai setiap poin kurang secara lengkap dan jelas sekaligus, lalu memandu langkah pengisiannya hingga siap diproses.', score: 5, why: 'Menghentikan siklus bolak-balik dengan audit syarat menyeluruh satu kali jalan dan pendampingan penuh.' },
      B: { text: 'Hanya memeriksa syarat tahap ini saja supaya cepat, karena tahap verifikasi berikutnya bukan bagian tugas meja Anda.', score: 2, why: 'Berpotensi mengulangi keluhan bolak-balik ke empat kalinya.' },
      C: { text: 'Meminta maaf atas pelayanan petugas sebelumnya lalu memintanya membaca formulir panduan dari situs web.', score: 3, why: 'Kurang memberikan pendampingan konkret atas kekurangan seluruh berkas saat itu juga.' },
      D: { text: 'Meloloskan berkasnya meski ada syarat yang masih kurang sedikit sebagai kompensasi rasa kasihan.', score: 1, why: 'Melanggar kepatuhan persyaratan hukum yang justru membahayakan keabsahan izin.' },
      E: { text: 'Memeriksa seluruh berkas dan menuliskan daftar kekurangan lengkap lalu menyarankan ia datang kembali besok pagi.', score: 4, why: 'Sudah memeriksa menyeluruh sekaligus, namun jika bisa dibantu pengisian atau pengunduhan syarat ringan di tempat akan jauh lebih membantu.' }
    },
    concept: 'Prinsip pemeriksaan menyeluruh sekali jalan (comprehensive first-pass check) mencegah warga dirugikan waktu dan ongkos oleh pemeriksaan sepotong-sepotong.',
    steps: [
      'Dengarkan pengalamannya dengan empati.',
      'Audit seluruh daftar persyaratan dari hulu ke hilir sekaligus.',
      'Bantu lengkapi yang bisa diselesaikan di tempat tanpa melanggar aturan.'
    ],
    quickTrick: 'Periksa tuntas seluruh syarat sekaligus + pandu penyelesaian agar tidak bolak-balik lagi.',
    commonMistakes: 'Menerobos aturan syarat sah atau memeriksa hanya sebagian tugas meja sendiri.',
    tip: 'Mengakhiri pengalaman buruk warga dengan pemeriksaan tuntas mengembalikan kepercayaan publik.',
    refs: [{ title: 'Penyederhanaan Prosedur Layanan', source: 'KemenPAN-RB', note: 'Pemeriksaan Menyeluruh Sekali Jalan' }]
  },

  // ================= JEJARING KERJA (7) =================
  {
    id: 'TKP-P5-008',
    topicSlug: 'jejaring-kerja',
    subtopic: 'Membangun Jaringan Kerja Sama Saat Ditugaskan di Proyek Baru',
    difficulty: 'EASY',
    stem: 'Anda baru saja ditunjuk menjadi koordinator gugus tugas lintas instansi daerah yang seluruh anggotanya belum saling mengenal sebelumnya. Agar kolaborasi cepat solid dan produktif sejak pekan pertama, langkah awal paling tepat adalah...',
    options: {
      A: { text: 'Langsung membagi tugas masing-masing anggota lewat surat tugas tertulis tanpa pertemuan awal supaya menghemat waktu.', score: 2, why: 'Pembagian sepihak tanpa dialog awal memicu kebingungan peran dan rasa tidak terhubung.' },
      B: { text: 'Mengadakan pertemuan perkenalan terfokus untuk menyamakan pemahaman tujuan bersama, memetakan keahlian tiap anggota, serta menyepakati kanal komunikasi dan jadwal koordinasi rutin.', score: 5, why: 'Membangun fondasi kepercayaan, kejelasan peran berbasis kompetensi, dan ritme komunikasi efektif.' },
      C: { text: 'Menunggu anggota lain berinisiatif memperkenalkan diri atau bertanya jika bingung tugasnya.', score: 1, why: 'Koordinator pasif membuat gugus tugas berjalan lambat dan terpecah.' },
      D: { text: 'Mengadakan acara makan bersama santai tanpa membahas pembagian peran proyek sama sekali di pekan pertama.', score: 3, why: 'Membangun keakraban sosial, tetapi menunda kejelasan koordinasi kerja proyek.' },
      E: { text: 'Meminta tiap anggota mengirimkan CV dan laporan harian pribadi melalui email ke Anda.', score: 4, why: 'Memetakan profil anggota secara individual, namun belum membangun dialog interaktif antarsesama anggota.' }
    },
    concept: 'Pembentukan tim lintas instansi menuntut kejelasan visi bersama, pemetaan kekuatan anggota, dan kesepakatan kanal koordinasi sejak awal.',
    steps: [
      'Inisiasi pertemuan perdana untuk membangun koneksi dan tujuan bersama.',
      'Petakan kompetensi dan peran tiap instansi.',
      'Tetapkan jadwal sinkronisasi dan kanal komunikasi bersama.'
    ],
    quickTrick: 'Pertemuan awal: samakan tujuan + petakan keahlian + sepakati kanal koordinasi.',
    commonMistakes: 'Bekerja langsung lewat surat instruksi kaku tanpa membangun keterikatan tim.',
    tip: 'Koordinator jejaring kerja berperan menyatukan arah sebelum membagi beban.',
    refs: [{ title: 'Kepemimpinan Kolaboratif Lintas Instansi', source: 'LAN RI', note: 'Pembentukan Gugus Tugas' }]
  },
  {
    id: 'TKP-P5-009',
    topicSlug: 'jejaring-kerja',
    subtopic: 'Menerima Ide Rekan Kerja Lebih Muda/Yunior',
    difficulty: 'EASY',
    stem: 'Seorang staf magang atau pegawai paling muda di tim Anda mengusulkan pendekatan baru dalam menyajikan data laporan yang lebih ringkas, namun cara ini mengubah format kebiasaan tim selama tiga tahun terakhir. Sikap Anda adalah...',
    options: {
      A: { text: 'Menolak usulan tersebut secara halus karena staf baru belum memahami sejarah panjang format lama kantor.', score: 2, why: 'Menutup inovasi hanya berdasarkan senioritas jabatan.' },
      B: { text: 'Mendengarkan presentasi idenya secara terbuka, menguji kelebihan serta kesesuaiannya dengan kebutuhan pengguna laporan, dan siap mengadopsinya bersama tim bila terbukti lebih efektif.', score: 5, why: 'Meritokratis, inklusif terhadap gagasan dari semua jenjang, dan berorientasi mutu hasil.' },
      C: { text: 'Memujinya di depan rapat namun tetap memakai format lama tanpa pernah menguji idenya.', score: 3, why: 'Pujian basa-basi tanpa tindak lanjut mematikan motivasi kontribusi anggota muda.' },
      D: { text: 'Menegurnya agar fokus menyelesaikan tugas dasar saja sebelum mengubah kebiasaan tim.', score: 1, why: 'Mematikan kreativitas dan merusak iklim jejaring kerja yang sehat.' },
      E: { text: 'Memintanya menerapkan format baru tersebut hanya untuk laporannya sendiri sebagai bahan perbandingan.', score: 4, why: 'Memberi ruang uji coba terbatas, namun keterlibatan seluruh tim untuk mengevaluasi relevansi lebih kolaboratif.' }
    },
    concept: 'Jejaring kerja sehat menghargai kontribusi gagasan berdasarkan kualitas dan manfaatnya, bukan pangkat atau lama bekerja.',
    steps: [
      'Dengarkan gagasan tanpa prasangka senioritas.',
      'Uji kelayakan dan dampaknya secara objektif bersama tim.',
      'Adopsi perubahan yang terbukti meningkatkan kualitas.'
    ],
    quickTrick: 'Nilai ide dari manfaat objektifnya, bukan dari jabatan pengusulnya.',
    commonMistakes: 'Menganggap anggota baru tidak berhak mengusulkan pembaruan sistem kerja.',
    tip: 'Sikap terbuka terhadap masukan dari siapa pun memperkuat inovasi tim.',
    refs: [{ title: 'Budaya Kerja Inklusif & Inovatif', source: 'ASN BerAKHLAK', note: 'Keterbukaan Gagasan' }]
  },
  {
    id: 'TKP-P5-010',
    topicSlug: 'jejaring-kerja',
    subtopic: 'Menjaga Komitmen Waktu Terhadap Rekan Eksternal',
    difficulty: 'MEDIUM',
    stem: 'Anda berjanji mengirimkan bahan final narasi kerja sama ke mitra perguruan tinggi paling lambat pukul 14.00 hari ini. Pukul 13.00, Anda mendapat kendala tak terduga karena pejabat penanda tangan masih berada di rapat mendadak hingga pukul 15.30. Tindakan komunikasi terbaik Anda adalah...',
    options: {
      A: { text: 'Segera menghubungi narahubung mitra sebelum pukul 14.00 untuk menginformasikan penundaan secara jujur, menjelaskan alasannya, serta menyampaikan pembaruan estimasi waktu kirim berikut draf final yang siap ditinjau.', score: 5, why: 'Menjaga kredibilitas kemitraan melalui pemberitahuan dini sebelum tenggat terlewati dan memberi bahan kerja sementara.' },
      B: { text: 'Diam saja sampai tanda tangan diperoleh pukul 16.00 lalu langsung mengirimkannya sambil meminta maaf di email.', score: 3, why: 'Membuat mitra menunggu tanpa kepastian melewati jam janji pukul 14.00.' },
      C: { text: 'Mengirimkan dokumen dengan memindai tanda tangan lama agar janji pukul 14.00 tetap terpenuhi.', score: 1, why: 'Pemalsuan administrasi yang melanggar hukum.' },
      D: { text: 'Mengirim pesan singkat tepat pukul 14.30 setelah tenggat lewat bahwa berkas menyusul sore nanti.', score: 2, why: 'Terlambat memberi kabar sehingga mitra sudah terlanjur menyusun agenda menunggu.' },
      E: { text: 'Menghubungi mitra pukul 13.15 hanya untuk mengabarkan bahwa dokumen belum ditandatangani tanpa estimasi jam baru maupun draf.', score: 4, why: 'Komunikasi awal baik, tetapi kurang memberikan kepastian jadwal revisi atau draf awal.' }
    },
    concept: 'Kepercayaan mitra dijaga dengan komunikasi proaktif SEBELUM tenggat jatuh tempo apabila terjadi penundaan di luar kendali.',
    steps: [
      'Beri tahu mitra lebih awal sebelum jam kesepakatan habis.',
      'Berikan estimasi waktu terbaru yang realistis.',
      'Kirim draf peninjauan jika memungkinkan agar mitra tetap bisa bekerja paralel.'
    ],
    quickTrick: 'Kabar sebelum tenggat terlewat + alasan jujur + estimasi baru + bantu draf paralel.',
    commonMistakes: 'Baru mengabari setelah terlambat atau nekat menerabas prosedur tanda tangan.',
    tip: 'Relasi profesional tumbuh ketika mitra tidak dibiarkan menebak-nebak dalam ketidakpastian.',
    refs: [{ title: 'Komunikasi Kemitraan Profesional', source: 'LAN RI', note: 'Manajemen Ekspektasi Mitra' }]
  },
  {
    id: 'TKP-P5-011',
    topicSlug: 'jejaring-kerja',
    subtopic: 'Menangani Anggota Tim yang Pasif (Free Rider)',
    difficulty: 'HARD',
    stem: 'Dalam kelompok kerja persiapan pameran layanan publik, ada satu anggota yang selalu absen saat rapat koordinasi dan belum mengumpulkan satu pun bagian tugasnya mendekati pekan terakhir. Anggota lain mulai kesal dan ingin mengeluarkannya begitu saja. Sebagai ketua kelompok, langkah terbaik Anda adalah...',
    options: {
      A: { text: 'Mengajaknya berbicara empat mata untuk menanyakan kendala nyatanya secara terbuka, menegaskan kembali komitmen peran dengan rincian tugas harian yang jelas dan terpantau, baru berkoordinasi dengan atasan jika tetap tidak kooperatif.', score: 5, why: 'Pendekatan pembinaan yang adil, mengklarifikasi hambatan, menetapkan akuntabilitas terukur, lalu eskalasi proporsional.' },
      B: { text: 'Langsung membagi tugas anggota tersebut ke anggota lain diam-diam agar pameran berjalan aman tanpa konflik.', score: 3, why: 'Membiarkan perilaku pasif tanpa pembinaan dan membebani anggota rajin secara tidak adil.' },
      C: { text: 'Menyindir ketidakaktifannya di grup chat tim agar ia merasa malu dan segera bekerja.', score: 1, why: 'Merusak psikologis tim dan memicu permusuhan terbuka.' },
      D: { text: 'Mengikuti desakan anggota lain untuk mencoret namanya dari daftar panitia dan langsung mengirim laporan ke pimpinan.', score: 4, why: 'Tegas menjaga keadilan tim, tetapi melewatkan dialog klarifikasi empat mata yang mungkin mengungkap kendala teknis/pribadi.' },
      E: { text: 'Mengundurkan diri dari posisi ketua kelompok karena lelah mengurus anggota yang tidak bertanggung jawab.', score: 2, why: 'Lari dari tanggung jawab kepemimpinan tim.' }
    },
    concept: 'Menangani anggota tim yang pasif memerlukan dialog personal terlebih dahulu, penetapan target terukur, dan pelibatan atasan bila komitmen tetap dilanggar.',
    steps: [
      'Ajak bicara empat mata untuk menggali penyebab pasifnya.',
      'Tetapkan komitmen target kecil yang mudah dipantau.',
      'Laporkan secara objektif ke pimpinan bila tetap mangkir.'
    ],
    quickTrick: 'Tegur & gali kendala empat mata -> kontrak tugas terukur -> eskalasi objektif bila tetap abai.',
    commonMistakes: 'Menyindir di grup atau langsung menanggung diam-diam tanpa pembinaan.',
    tip: 'Ketegasan yang diawali klarifikasi empat mata mencerminkan kedewasaan pemimpin jejaring kerja.',
    refs: [{ title: 'Dinamika Kelompok Kerja ASN', source: 'Modul Jejaring Kerja', note: 'Penanganan Anggota Pasif' }]
  },
  {
    id: 'TKP-P5-012',
    topicSlug: 'jejaring-kerja',
    subtopic: 'Sinergi Antarbidang Saat Beban Puncak',
    difficulty: 'MEDIUM',
    stem: 'Bidang Humas dan Bidang Hukum di kantor Anda sedang memiliki agenda besar bersamaan: Humas harus menyusun rilis tanggapan publik dalam 3 jam, sedangkan Bidang Hukum harus memverifikasi kesesuaian regulasinya agar tidak salah tafsir hukum. Cara kerja paling kolaboratif adalah...',
    options: {
      A: { text: 'Membentuk sesi penyusunan paralel secara bersama antara perwakilan Humas dan Hukum sehingga penulisan bahasa publik dan penelaahan pasal hukum berjalan serentak dalam satu draf.', score: 5, why: 'Menghilangkan antrean kerja berurutan (silo) lewat ko-kreasi waktu nyata lintas bidang.' },
      B: { text: 'Meminta Humas menyelesaikan draf total dalam 2,5 jam dulu lalu menyerahkannya ke Bidang Hukum pada 30 menit terakhir.', score: 3, why: 'Berisiko revisi besar di menit akhir yang membuat tenggat 3 jam terlewati.' },
      C: { text: 'Meminta Bidang Hukum menulis seluruh rilis berita menggunakan bahasa peraturan agar pasti aman.', score: 2, why: 'Mengabaikan keahlian komunikasi publik Humas sehingga rilis sulit dipahami warga.' },
      D: { text: 'Mengirimkan rilis langsung tanpa verifikasi Bidang Hukum karena mengejar kecepatan respons publik.', score: 1, why: 'Berisiko fatal menyalahi ketentuan peraturan perundang-undangan.' },
      E: { text: 'Meminta pimpinan menunda tenggat tanggapan publik hingga besok supaya masing-masing bidang bekerja santai.', score: 4, why: 'Mengurangi risiko kesalahan, tetapi mengorbankan kecepatan respons krisis publik padahal kerja paralel memungkinkan.' }
    },
    concept: 'Sinergi lintas kompetensi mengatasi keterbatasan waktu tanpa mengorbankan kualitas hukum maupun efektivitas komunikasi publik.',
    steps: [
      'Gabungkan perwakilan kedua bidang dalam satu meja kerja/dokumen bersama.',
      'Susun poin komunikasi dan verifikasi regulasi secara serentak.',
      'Finalisasi bersama sebelum tenggat 3 jam.'
    ],
    quickTrick: 'Kerja paralel/bersama dalam satu draf memadukan kecepatan dan ketepatan lintas bidang.',
    commonMistakes: 'Bekerja berurutan terpisah (silo) saat tenggat sangat sempit.',
    tip: 'Kolaborasi paralel adalah kunci respons cepat organisasi modern.',
    refs: [{ title: 'Kolaborasi Lintas Fungsi (Cross-Functional)', source: 'LAN RI', note: 'Sinergi Waktu Nyata' }]
  },
  {
    id: 'TKP-P5-013',
    topicSlug: 'jejaring-kerja',
    subtopic: 'Menghargai Kontribusi Rekan dalam Keberhasilan Tim',
    difficulty: 'EASY',
    stem: 'Proyek integrasi layanan yang Anda presentasikan mendapat pujian tinggi dari Kepala Badan. Padahal sebagian besar kerja pengolahan data di balik layar dikerjakan secara teliti oleh dua rekan Anda yang cenderung pendiam. Sikap Anda di hadapan pimpinan dan forum adalah...',
    options: {
      A: { text: 'Menyampaikan ucapan terima kasih kepada seluruh tim, menyebut secara eksplisit peran dan kontribusi berharga kedua rekan tersebut di forum, serta memastikan catatan apresiasi masuk dalam evaluasi tim.', score: 5, why: 'Adil mengakui kontribusi anggota di balik layar dan memperkuat rasa saling percaya di dalam jejaring tim.' },
      B: { text: 'Menerima pujian tersebut untuk diri sendiri karena Anda yang menyusun paparan dan mempresentasikannya dengan baik.', score: 1, why: 'Mengklaim kerja kolektif sebagai prestasi pribadi merusak kepercayaan tim.' },
      C: { text: 'Mengucapkan terima kasih atas nama "tim" secara umum lalu memberi ucapan pribadi ke dua rekan itu di luar ruangan saja.', score: 4, why: 'Sudah menghargai secara pribadi, namun pengakuan eksplisit di hadapan pimpinan memberi dampak penghargaan karier yang jauh lebih adil.' },
      D: { text: 'Merendah dengan mengatakan proyek itu sebenarnya biasa saja dan masih banyak kekurangan.', score: 2, why: 'Mengurangi makna kerja keras rekan tim yang sudah lembur.' },
      E: { text: 'Meminta salah satu rekan tersebut maju menggantikan seluruh sesi tanya jawab tanpa persiapan.', score: 3, why: 'Berisiko menyulitkan rekan yang pendiam jika tidak dipersiapkan sebelumnya.' }
    },
    concept: 'Kepercayaan jangka panjang dalam jejaring kerja dibangun saat pemimpin/presenter jujur membagi pengakuan atas kontribusi tiap anggota.',
    steps: [
      'Terima apresiasi pimpinan dengan rendah hati.',
      'Sebutkan secara terbuka kontribusi spesifik rekan tim di balik layar.',
      'Dorong pengakuan formal dalam penilaian kinerja.'
    ],
    quickTrick: 'Bagikan pujian secara terbuka kepada rekan di balik layar yang berkontribusi nyata.',
    commonMistakes: 'Menunggangi kerja keras tim untuk pencitraan pribadi.',
    tip: 'Berbagi pengakuan adalah perekat loyalitas jejaring kerja.',
    refs: [{ title: 'Integritas & Kepemimpinan Tim', source: 'BerAKHLAK BKN', note: 'Kredit Kontribusi Adil' }]
  },
  {
    id: 'TKP-P5-014',
    topicSlug: 'jejaring-kerja',
    subtopic: 'Memelihara Relasi Pascakegiatan Bersama',
    difficulty: 'MEDIUM',
    stem: 'Kegiatan seminar regional bersama antara instansi Anda, organisasi profesi, dan tiga pemerintah kabupaten telah selesai dilaksanakan dengan sukses. Agar jejaring kerja yang sudah terbangun tidak putus setelah acara usai, langkah strategis yang Anda lakukan adalah...',
    options: {
      A: { text: 'Mengirimkan laporan ringkas dampak kegiatan dan ucapan apresiasi resmi kepada seluruh mitra, mendokumentasikan rekomendasi tindak lanjut bersama, serta menjaga komunikasi berkala terkait implementasinya.', score: 5, why: 'Mengubah momentum acara menjadi kemitraan berkelanjutan berbasis tindak lanjut nyata.' },
      B: { text: 'Langsung menutup grup koordinasi acara di aplikasi pesan keesokan paginya supaya memori ponsel bersih.', score: 1, why: 'Memutus jaringan komunikasi mitra sebelum tindak lanjut atau evaluasi bersama tuntas.' },
      C: { text: 'Hanya menghubungi mereka kembali jika tahun depan instansi Anda mengadakan acara serupa.', score: 2, why: 'Relasi transaksional sesaat, bukan jejaring kerja berkelanjutan.' },
      D: { text: 'Mengunggah foto bersama seluruh panitia di media sosial pribadi sambil menandai akun mitra.', score: 3, why: 'Menunjukkan keakraban simbolis tanpa tindak lanjut substantif.' },
      E: { text: 'Mengirimkan sertifikat elektronik dan ucapan terima kasih formal lewat email satu minggu kemudian.', score: 4, why: 'Sopan secara administratif, tetapi belum membangun jembatan kolaborasi tindak lanjut.' }
    },
    concept: 'Jejaring kerja sejati dipelihara setelah kegiatan seremonial selesai melalui evaluasi bersama, berbagi hasil, dan tindak lanjut program.',
    steps: [
      'Sampaikan apresiasi dan rangkuman hasil kegiatan ke seluruh mitra.',
      'Catat dan pantau kesepakatan tindak lanjut.',
      'Pelihara komunikasi berkala meski belum ada proyek baru.'
    ],
    quickTrick: 'Tutup acara dengan laporan hasil + apresiasi + komunikasi tindak lanjut berkala.',
    commonMistakes: 'Menjalin relasi hanya saat butuh atau memutus kontak begitu acara berakhir.',
    tip: 'Keberlanjutan tindak lanjut membedakan kemitraan strategis dari kepanitiaan sesaat.',
    refs: [{ title: 'Manajemen Kemitraan Berkelanjutan', source: 'LAN RI', note: 'Pasca-Kegiatan Bersama' }]
  },

  // ================= SOSIAL BUDAYA (7) =================
  {
    id: 'TKP-P5-015',
    topicSlug: 'sosial-budaya',
    subtopic: 'Menghargai Perbedaan Pola Makan & Keyakinan Rekan Kerja',
    difficulty: 'EASY',
    stem: 'Saat merencanakan rapat kerja dan jamuan makan siang bersama tim yang terdiri atas anggota dengan beragam agama dan pantangan makanan tertentu, tindakan Anda sebagai penanggung jawab konsumsi adalah...',
    options: {
      A: { text: 'Memesan menu seragam dari satu restoran favorit pimpinan tanpa mengecek pantangan makanan peserta.', score: 1, why: 'Mengabaikan kebutuhan dan keyakinan sebagian anggota tim.' },
      B: { text: 'Mendata kebutuhan/pantangan makanan peserta sebelumnya, menyediakan pilihan menu halal serta opsi ramah bagi yang berpantang atau berpuasa dengan pelabelan jelas.', score: 5, why: 'Peka, menghormati keberagaman keyakinan maupun kondisi kesehatan, dan inklusif bagi semua.' },
      C: { text: 'Menyuruh peserta yang memiliki pantangan khusus membawa bekal sendiri dari rumah masing-masing.', score: 2, why: 'Meminggirkan anggota minoritas dari kebersamaan acara tim.' },
      D: { text: 'Memberikan uang pengganti tunai hanya kepada peserta yang pantangannya tidak terakomodasi di menu utama.', score: 3, why: 'Lebih baik dari mengabaikan, namun memisahkan anggota saat jamuan bersama.' },
      E: { text: 'Memesan menu vegetarian untuk seluruh peserta tanpa berkonsultasi agar dianggap aman untuk semua.', score: 4, why: 'Bermaksud inklusif, tetapi mendata preferensi dan menyediakan varian berlabel lebih menghargai keberagaman pilihan.' }
    },
    concept: 'Kepedulian terhadap hal sehari-hari seperti pantangan makanan berbasis keyakinan atau kesehatan mencerminkan praktik nyata nilai Harmonis.',
    steps: [
      'Identifikasi pantangan agama dan kesehatan sebelum memesan.',
      'Sediakan pilihan menu yang aman dan berlabel jelas.',
      'Pastikan semua anggota merasakan kehangatan kebersamaan yang setara.'
    ],
    quickTrick: 'Data kebutuhan & pantangan sebelumnya -> sediakan pilihan aman berlabel jelas untuk semua.',
    commonMistakes: 'Menganggap selera mayoritas otomatis berlaku untuk semua anggota.',
    tip: 'Detail kecil yang inklusif membangun rasa dihargai di tim majemuk.',
    refs: [{ title: 'Nilai Harmonis dalam Aktivitas Kantor', source: 'BerAKHLAK BKN', note: 'Akomodasi Keberagaman' }]
  },
  {
    id: 'TKP-P5-016',
    topicSlug: 'sosial-budaya',
    subtopic: 'Empati Terhadap Rekan yang Berduka',
    difficulty: 'EASY',
    stem: 'Salah satu rekan satu unit kerja yang berbeda agama dengan Anda baru saja mengalami musibah meninggalnya orang tua. Sementara itu, besok ada target laporan mingguan yang harus dikumpulkan. Sikap sosial dan empati Anda yang paling tepat adalah...',
    options: {
      A: { text: 'Mengucapkan belasungkawa yang tulus dengan tetap menghormati tata cara duka keyakinannya, ikut menggalang dukungan rekan, serta membantu mengambil alih sementara porsi tugas mendesak agar ia tenang mendampingi keluarga.', score: 5, why: 'Menyatukan penghormatan lintas keyakinan dengan dukungan moral dan solidaritas kerja konkret.' },
      B: { text: 'Mengirimkan pesan singkat turut berduka namun menanyakan kapan ia bisa mengirim file laporan sebelum besok sore.', score: 1, why: 'Tidak memiliki kepekaan empati saat rekan sedang berduka.' },
      C: { text: 'Tidak mengucapkan belasungkawa secara langsung karena khawatir salah memakai istilah doa agama yang berbeda.', score: 2, why: 'Ketakutan berlebihan membuat tampak acuh tak acuh saat rekan berduka.' },
      D: { text: 'Hadir melayat bersama rekan kerja lain tanpa membahas atau membantu pekerjaan kantornya yang tertinggal.', score: 4, why: 'Kehadiran melayat sangat baik, dan melengkapinya dengan dukungan pengalihan tugas sementara jauh lebih menenangkan rekan.' },
      E: { text: 'Mengirim karangan bunga atas nama pribadi saja dan tetap fokus mengerjakan porsi tugas sendiri.', score: 3, why: 'Minimal secara formalitas, namun kurang kepekaan solidaritas tim.' }
    },
    concept: 'Solidaritas kemanusiaan melintasi batas agama melalui ucapan belasungkawa yang tulus, penghormatan tradisi duka, dan keringanan beban tugas tim.',
    steps: [
      'Sampaikan simpati dengan bahasa universal yang menghormati keyakinannya.',
      'Koordinasikan pengambilalihan sementara tugas mendesak dengan atasan.',
      'Dukung secara moral bersama rekan satu unit.'
    ],
    quickTrick: 'Belasungkawa santun lintas keyakinan + bantu sementara porsi tugasnya.',
    commonMistakes: 'Ragu berbelasungkawa karena beda keyakinan atau menagih tugas saat hari duka.',
    tip: 'Kemanusiaan dan kepedulian rekan kerja selalu menuntut empati nyata.',
    refs: [{ title: 'Toleransi dan Solidaritas Sosial ASN', source: 'LAN RI', note: 'Empati Lintas Keyakinan' }]
  },
  {
    id: 'TKP-P5-017',
    topicSlug: 'sosial-budaya',
    subtopic: 'Pelestarian Kearifan Lokal dalam Program Dinas',
    difficulty: 'MEDIUM',
    stem: 'Instansi Anda hendak menyosialisasikan program ketahanan pangan dan perilaku hidup sehat kepada masyarakat desa adat yang memiliki tradisi musyawarah balai dan bahasa kiasan khas daerah. Pendekatan paling efektif dan berwawasan sosial budaya adalah...',
    options: {
      A: { text: 'Berdialog lebih dulu dengan tokoh adat setempat untuk menyelaraskan pesan program dengan nilai kearifan lokal yang sudah hidup di masyarakat, lalu menyampaikannya secara santun melalui forum musyawarah desa.', score: 5, why: 'Menghormati struktur sosial lokal dan mengawinkan program pemerintah dengan budaya setempat agar diterima tulus.' },
      B: { text: 'Membawa spanduk seragam dari pusat dan membacakan modul teknis kesehatan persis seperti di ibu kota.', score: 2, why: 'Tidak kontekstual dan terasa asing bagi warga desa adat.' },
      C: { text: 'Mengganti seluruh tradisi musyawarah desa menjadi penyuluhan formal satu arah yang dipimpin pejabat dinas.', score: 1, why: 'Mengabaikan kearifan lokal dan merusak penerimaan sosial.' },
      D: { text: 'Membuat pamflet berbahasa Indonesia yang diterjemahkan seadanya lewat mesin penerjemah otomatis.', score: 3, why: 'Berisiko menghasilkan terjemahan kaku atau salah makna budaya.' },
      E: { text: 'Meminta izin kepala desa terlebih dahulu untuk membagikan paket bantuan sambil menyelipkan materi program.', score: 4, why: 'Menghormati otoritas administratif desa, namun dialog mendalam dengan tokoh adat atas pesan kearifan lokal lebih berkelanjutan.' }
    },
    concept: 'Program publik berhasil apabila dikomunikasikan melalui pintu gerbang budaya dan tokoh adat setempat dengan menghormati tata nilai masyarakat.',
    steps: [
      'Konsultasikan substansi program dengan tokoh adat dan desa.',
      'Selaraskan penyampaian dengan kearifan lokal tanpa mengubah tujuan sehat/pangan.',
      'Gunakan forum musyawarah warga yang partisipatif.'
    ],
    quickTrick: 'Gandeng tokoh adat + selaraskan pesan dengan kearifan lokal + musyawarah warga.',
    commonMistakes: 'Memaksakan format seragam tanpa membaca konteks budaya lokal.',
    tip: 'Pendekatan kultural mempercepat penerimaan kebijakan publik.',
    refs: [{ title: 'Pembangunan Berbasis Kearifan Lokal', source: 'Kemendesa & LAN RI', note: 'Komunikasi Lintas Budaya' }]
  },
  {
    id: 'TKP-P5-018',
    topicSlug: 'sosial-budaya',
    subtopic: 'Menjaga Kerukunan di Tengah Polarisasi Opini Sosial',
    difficulty: 'MEDIUM',
    stem: 'Di media sosial maupun obrolan kantin, rekan-rekan kantor mulai terpolarisasi menjadi dua kubu akibat isu sosial-politik nasional yang sedang panas hingga mulai saling melabeli dengan sebutan merendahkan. Sebagai rekan kerja yang menjaga persatuan, sikap Anda adalah...',
    options: {
      A: { text: 'Tidak ikut memanaskan perdebatan dengan label merendahkan, mengingatkan pentingnya menjaga profesionalitas serta persaudaraan di lingkungan kerja meski berbeda pandangan, dan mengajak kembali fokus pada tugas melayani masyarakat.', score: 5, why: 'Menjadi penyejuk (perekat bangsa), menghargai perbedaan pendapat secara dewasa, dan mengembalikan fokus pelayanan.' },
      B: { text: 'Membela salah satu kubu yang menurut Anda paling benar secara vokal supaya kelompok lawan diam.', score: 1, why: 'Memperdalam perpecahan dan membawa polarisasi ke ruang kerja ASN.' },
      C: { text: 'Memilih makan di meja terpisah sendirian selama berminggu-minggu sampai isu mereda.', score: 3, why: 'Menghindari masalah tanpa berusaha meredakan ketegangan rekan kerja.' },
      D: { text: 'Ikut menimpali sindiran halus kepada kedua kubu agar tampak netral namun tetap menghibur.', score: 2, why: 'Sindiran justru memperkeruh suasana emosional kedua pihak.' },
      E: { text: 'Mengingatkan bahwa perbedaan politik dilarang dibahas sama sekali selama berada di dalam gedung kantor.', score: 4, why: 'Menjaga kondusivitas ruang kerja, tetapi pendekatan persuasif yang menekankan persaudaraan dan fokus layanan lebih membangun kesadaran jangka panjang.' }
    },
    concept: 'ASN berperan sebagai perekat dan pemersatu bangsa dengan meredam polarisasi sosial tanpa memperkeruh suasana dengan pelabelan.',
    steps: [
      'Jaga jarak dari pelabelan dan provokasi.',
      'Redakan suasana dengan ajakan saling menghargai.',
      'Arahkan energi kembali ke pelayanan publik yang menyatukan.'
    ],
    quickTrick: 'Netral menenangkan + tolak pelabelan + ajak bersatu dalam tugas pelayanan.',
    commonMistakes: 'Ikut kubu-kubuan atau menyindir kedua belah pihak.',
    tip: 'Dalam TKP Perekat Bangsa, penyejuk konflik dan pengutamaan persatuan selalu bernilai 5.',
    refs: [{ title: 'ASN Perekat dan Pemersatu Bangsa', source: 'UU ASN', note: 'Meredam Polarisasi' }]
  },
  {
    id: 'TKP-P5-019',
    topicSlug: 'sosial-budaya',
    subtopic: 'Sikap Inklusif terhadap Rekan Penyandang Disabilitas',
    difficulty: 'EASY',
    stem: 'Kantor Anda menerima pegawai baru melalui formasi disabilitas yang menggunakan kursi roda. Anda menyadari akses masuk menuju ruang rapat lantai dua belum memiliki jalur landai (ram) sementara beberapa rapat tim kerap diadakan di sana. Sikap paling peduli dan solutif adalah...',
    options: {
      A: { text: 'Mengusulkan pemindahan lokasi rapat tim ke ruang pertemuan lantai dasar yang mudah diakses kursi roda sekaligus mengajukan usulan pengadaan aksesibilitas ramah disabilitas ke bagian umum/sarana prasarana.', score: 5, why: 'Solusi cepat jangka pendek (pindah ke lantai dasar) berpadu dengan perbaikan fasilitas jangka panjang.' },
      B: { text: 'Mengikutsertakan rekan tersebut lewat panggilan video dari meja kerjanya setiap kali tim rapat di lantai dua.', score: 4, why: 'Memungkinkan keterlibatan teknis, tetapi tetap memisahkannya secara fisik dari tim padahal lantai dasar bisa digunakan.' },
      C: { text: 'Menggendongnya bersama-sama menaiki tangga setiap kali ada rapat tanpa mengubah lokasi maupun fasilitas.', score: 2, why: 'Tidak praktis, berisiko keselamatan, dan mengabaikan kemandirian penyandang disabilitas.' },
      D: { text: 'Membebaskannya dari kewajiban menghadiri rapat tim supaya ia tidak kerepotan naik tangga.', score: 1, why: 'Mengecualikan hak partisipasi rekan disabilitas dari pengambilan keputusan tim.' },
      E: { text: 'Menunggu hingga rekan tersebut mengajukan surat keluhan resmi kepada pimpinan terlebih dahulu.', score: 3, why: 'Pasif; seharusnya kepekaan sosial membuat rekan lain berinisiatif sebelum diminta.' }
    },
    concept: 'Lingkungan kerja inklusif menciptakan akomodasi yang layak agar pegawai disabilitas dapat bekerja dan berpartisipasi setara dengan bermartabat.',
    steps: [
      'Pindahkan aktivitas rapat ke ruang aksesibel seketika.',
      'Usulkan pembenahan sarana fisik (ram/lift/toilet aksesibel).',
      'Jamin hak partisipasi penuh tanpa diskriminasi.'
    ],
    quickTrick: 'Pindah rapat ke ruang aksesibel segera + usulkan perbaikan fasilitas ramah disabilitas.',
    commonMistakes: 'Menghilangkan keterlibatannya rapat atau menunggu komplain darinya.',
    tip: 'Aksesibilitas adalah hak infrastruktur, bukan belas kasihan.',
    refs: [{ title: 'UU No. 8 Tahun 2016 tentang Penyandang Disabilitas', source: 'KemenPAN-RB', note: 'Akomodasi Layak ASN' }]
  },
  {
    id: 'TKP-P5-020',
    topicSlug: 'sosial-budaya',
    subtopic: 'Menghadapi Prasangka Kedaerahan dalam Perekrutan Tugas',
    difficulty: 'HARD',
    stem: 'Saat membentuk tim pelaksana acara budaya nusantara di kantor, seorang rekan menyarankan agar hanya pegawai dari suku mayoritas daerah tersebut yang menjadi panitia inti dengan alasan lebih paham adat setempat. Sikap Anda adalah...',
    options: {
      A: { text: 'Menyarankan agar panitia inti tetap terbuka bagi seluruh pegawai berkompeten dari beragam latar belakang sambil melibatkan pegawai putra daerah sebagai penasihat konten adat agar acara tetap autentik sekaligus mencerminkan kebersamaan.', score: 5, why: 'Memadukan keautentikan pengetahuan budaya lokal dengan prinsip inklusivitas Bhinneka Tunggal Ika.' },
      B: { text: 'Menyetujui usulan itu sepenuhnya karena acara budaya memang urusan eksklusif suku tertentu.', score: 2, why: 'Membentuk sekat eksklusivisme di lingkungan instansi pemerintah yang majemuk.' },
      C: { text: 'Melarang sama sekali pegawai suku setempat menjadi ketua panitia agar tidak terkesan dikuasai satu kelompok.', score: 1, why: 'Diskriminatif ke arah sebaliknya.' },
      D: { text: 'Menarik diri dari kepanitiaan karena tidak berasal dari suku daerah acara tersebut.', score: 3, why: 'Pasif mengalah pada eksklusivitas tanpa memberi perspektif persatuan.' },
      E: { text: 'Menyetujui susunan tertutup asalkan seluruh pegawai lain tetap diundang menonton pada hari pelaksanaan.', score: 4, why: 'Masih membatasi partisipasi aktif panitia inti berdasarkan asal suku.' }
    },
    concept: 'Bhinneka Tunggal Ika di tempat kerja berarti merayakan keunikan budaya lokal secara terbuka melalui kolaborasi seluruh elemen, bukan eksklusivisme identitas.',
    steps: [
      'Libatkan tokoh/pegawai setempat untuk keakuratan tradisi.',
      'Buka kepanitiaan secara inklusif lintas latar belakang.',
      'Jadikan acara budaya sebagai wahana pemersatu seluruh pegawai.'
    ],
    quickTrick: 'Panitia inklusif lintas latar belakang + manfaatkan keahlian lokal untuk autentisitas budaya.',
    commonMistakes: 'Mengeksklusifkan acara budaya hanya untuk satu suku atau menolak peran putra daerah.',
    tip: 'Budaya daerah adalah kekayaan bersama bangsa Indonesia.',
    refs: [{ title: 'Wawasan Nusantara & Kebhinnekaan', source: 'BPIP', note: 'Inklusivitas Budaya' }]
  },
  {
    id: 'TKP-P5-021',
    topicSlug: 'sosial-budaya',
    subtopic: 'Menghindari Gaya Hidup Pamer (Flexing) sebagai ASN',
    difficulty: 'MEDIUM',
    stem: 'Beberapa rekan di unit kerja Anda kerap mengunggah gaya hidup mewah, barang bermerek, dan makan di restoran mahal saat masih memakai seragam dinas ke akun media sosial publik mereka, padahal masyarakat sekitar kantor banyak berasal dari kalangan sederhana. Sikap bijak Anda adalah...',
    options: {
      A: { text: 'Menjaga kesederhanaan dan kepantasan perilaku baik luring maupun di media sosial sesuai etika ASN, serta mengingatkan rekan secara halus dalam obrolan akrab mengenai kepekaan sosial dan menjaga kepercayaan masyarakat terhadap instansi.', score: 5, why: 'Memberi teladan hidup sederhana (low profile) sekaligus peduli mengingatkan rekan dengan cara santun.' },
      B: { text: 'Ikut memamerkan pencapaian pribadi di media sosial agar masyarakat melihat ASN juga mampu hidup sejahtera.', score: 1, why: 'Mengabaikan kepekaan sosial dan arahan etika kesederhanaan ASN.' },
      C: { text: 'Membuat unggahan sindiran panjang di akun sendiri untuk menyentil rekan-rekan yang suka pamer.', score: 2, why: 'Menambah konflik internal melalui sindiran publik.' },
      D: { text: 'Diam menjaga sikap diri sendiri tanpa pernah menegur karena gaya hidup adalah hak pribadi di luar jam kerja.', score: 4, why: 'Menjaga diri sendiri sudah baik, tetapi saat memakai seragam dinas hal itu menyangkut citra publik instansi sehingga mengingatkan rekan secara santun lebih bertanggung jawab.' },
      E: { text: 'Menjauhi dan memutus pertemanan dengan seluruh rekan yang gemar mengunggah foto mewah.', score: 3, why: 'Ekstrem secara relasi sosial dan tidak membantu mengingatkan.' }
    },
    concept: 'Kepekaan sosial budaya ASN mencakup sikap hidup sederhana dan menghindari pamer kemewahan yang melukai rasa keadilan masyarakat.',
    steps: [
      'Terapkan kesederhanaan dan etika bermedia sosial pada diri sendiri.',
      'Sampaikan pengingat empatik secara pribadi kepada rekan bila membawa atribut dinas.',
      'Prioritaskan kepercayaan publik di atas validasi media sosial.'
    ],
    quickTrick: 'Teladani kesederhanaan + ingatkan rekan secara santun & pribadi demi kepekaan publik.',
    commonMistakes: 'Menyindir di media sosial atau membela flexing memakai seragam sebagai privasi penuh.',
    tip: 'Kepekaan terhadap kondisi ekonomi masyarakat sekitar adalah bagian dari kecerdasan sosial budaya.',
    refs: [{ title: 'Arahan Hidup Sederhana & Etika Bermedsos ASN', source: 'KemenPAN-RB', note: 'Kepekaan Sosial Publik' }]
  },

  // ================= ADAPTASI TIK (8) =================
  {
    id: 'TKP-P5-022',
    topicSlug: 'adaptasi-tik',
    subtopic: 'Kerahasiaan Data Pribadi Warga di Dokumen Publik',
    difficulty: 'HARD',
    stem: 'Anda diminta mengunggah pengumuman daftar penerima bantuan sosial beserta jadwal pencairannya ke situs web resmi instansi. Dalam file Excel mentah dari tim pendata terdapat kolom NIK lengkap, nomor rekening, dan nomor telepon pribadi seluruh penerima. Langkah paling tepat sebelum mengunggah adalah...',
    options: {
      A: { text: 'Langsung mengunggah file apa adanya supaya transparan dan memudahkan warga mengecek data mereka secara cepat.', score: 1, why: 'Pelanggaran serius perlindungan data pribadi (UU PDP) yang membuka peluang penipuan.' },
      B: { text: 'Memilah dan menyamarkan (masking) data sensitif seperti NIK, nomor rekening, dan nomor telepon dengan hanya menampilkan informasi aman yang dibutuhkan warga (nama, wilayah, dan kode registrasi/sebagian digit tersensor), sesuai prinsip perlindungan data pribadi.', score: 5, why: 'Menyeimbangkan transparansi informasi publik dengan perlindungan data pribadi sesuai regulasi.' },
      C: { text: 'Mengunggah file lengkap namun mengubah formatnya menjadi PDF agar sulit disalin langsung.', score: 2, why: 'Data sensitif di PDF tetap terbaca publik dan mudah disalahgunakan.' },
      D: { text: 'Memutuskan tidak mengumumkan daftar penerima sama sekali di situs web agar tidak mengambil risiko hukum.', score: 3, why: 'Mengorbankan hak transparansi informasi publik padahal penyamaran digit (masking) adalah solusi aman.' },
      E: { text: 'Menghapus kolom nomor rekening dan telepon saja sementara NIK 16 digit dibiarkan terbuka lengkap.', score: 4, why: 'Sudah mengurangi risiko sebagian, tetapi NIK lengkap masih tergolong data pribadi strategis yang rentan disalahgunakan.' }
    },
    concept: 'Transformasi layanan publik digital wajib patuh terhadap UU Pelindungan Data Pribadi (UU PDP) dengan prinsip minimisasi data dan penyamaran informasi sensitif.',
    steps: [
      'Identifikasi kolom data pribadi spesifik/sensitif (NIK, rekening, telepon).',
      'Lakukan penyaringan atau penyamaran (masking) sebagian digit.',
      'Terbitkan informasi publik yang akurat sekaligus aman.'
    ],
    quickTrick: 'Samarkan/saring data sensitif (NIK, rekening, HP) sebelum publikasi digital terbuka.',
    commonMistakes: 'Mengunggah data mentah demi alasan "transparansi" atau tidak mengumumkan sama sekali.',
    tip: 'Transparansi publik bukan berarti menelanjangi data pribadi warga di internet.',
    refs: [{ title: 'UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi', source: 'Kominfo', note: 'Minimisasi & Masking Data Publik' }]
  },
  {
    id: 'TKP-P5-023',
    topicSlug: 'adaptasi-tik',
    subtopic: 'Penerapan Tanda Tangan Elektronik Tersertifikasi',
    difficulty: 'EASY',
    stem: 'Kantor Anda mulai memberlakukan Tanda Tangan Elektronik (TTE) tersertifikasi pada sistem persuratan. Seorang rekan mengeluh merasa proses verifikasi kode sandinya merepotkan dan menyarankan agar surat penting tetap dipindai dengan gambar tanda tangan basah tempelan saja supaya cepat. Sikap Anda adalah...',
    options: {
      A: { text: 'Menjelaskan keunggulan legalitas, keamanan anti-pemalsuan, dan kemudahan pelacakan TTE tersertifikasi, lalu membantu mendemonstrasikan cara penggunaannya agar rekan tidak lagi merasa repot.', score: 5, why: 'Mengedukasi aspek hukum dan keamanan digital secara ramah serta mendampingi adopsi teknologi.' },
      B: { text: 'Setuju memakai gambar tanda tangan tempelan saja untuk surat-surat internal yang dianggap tidak terlalu penting.', score: 1, why: 'Gambar tanda tangan yang ditempel sangat mudah dipalsukan dan tidak memiliki kekuatan hukum TTE tersertifikasi.' },
      C: { text: 'Menyuruhnya tetap memakai TTE karena itu perintah pimpinan tanpa mau menjelaskan cara pakainya.', score: 3, why: 'Benar secara kepatuhan, namun kurang membantu menghilangkan hambatan adaptasi rekan.' },
      D: { text: 'Meminjamkan akun TTE milik Anda sendiri untuk menandatangani surat rekan tersebut sementara waktu.', score: 2, why: 'Pelanggaran fatal keamanan identitas elektronik pribadi.' },
      E: { text: 'Menggunakan TTE dengan konsisten untuk semua surat tugas Anda sendiri sambil membiarkan rekan memilih sesuai kenyamanannya.', score: 4, why: 'Konsisten secara pribadi tetapi kurang menjaga standar keamanan persuratan unit.' }
    },
    concept: 'TTE tersertifikasi menjamin keaslian, keutuhan, dan nir-penyangkalan dokumen digital; jauh lebih aman dibanding gambar tanda tangan tempelan.',
    steps: [
      'Tolak praktik tempel gambar tanda tangan maupun berbagi akun TTE.',
      'Jelaskan manfaat keabsahan hukum dan efisiensi TTE.',
      'Bantu ajarkan alur klik tanda tangan agar terasa mudah.'
    ],
    quickTrick: 'Edukasi manfaat hukum/keamanan TTE + bantu praktikkan agar mudah dipakai.',
    commonMistakes: 'Menganggap gambar tanda tangan (.png) setara TTE tersertifikasi.',
    tip: 'TTE tidak boleh dipindahtangankan atau diwakilkan akunnya kepada siapa pun.',
    refs: [{ title: 'Penerapan Tanda Tangan Elektronik Pemerintah', source: 'BSrE - BSSN', note: 'TTE Tersertifikasi vs Tanda Tangan Pindai' }]
  },
  {
    id: 'TKP-P5-024',
    topicSlug: 'adaptasi-tik',
    subtopic: 'Menjaga Keamanan Perangkat & Layar di Area Bersama',
    difficulty: 'EASY',
    stem: 'Anda sedang mengakses sistem basis data kepegawaian pada komputer kantor yang terhubung jaringan, lalu dipanggil mendadak ke ruang rapat di lantai lain selama 20 menit. Banyak tamu dan rekan lalu-lalang di sekitar meja Anda. Langkah keamanan TIK paling tepat sebelum beranjak adalah...',
    options: {
      A: { text: 'Mengunci layar komputer (Win+L / Lock Screen) serta menutup/keluar dari sesi sistem sensitif sebelum meninggalkan meja, dan membiasakan perilaku serupa di unit kerja.', score: 5, why: 'Kebiasaan dasar keamanan fisik-digital (clear screen policy) mencegah akses tidak sah saat meja ditinggal.' },
      B: { text: 'Mengecilkan jendela peramban (minimize) saja supaya cepat dilanjutkan saat kembali dari rapat.', score: 2, why: 'Siapa pun yang menggerakkan tetikus bisa langsung membuka kembali sistem yang masih login.' },
      C: { text: 'Membiarkannya terbuka sambil berpesan ke rekan di meja sebelah untuk sesekali melirik layar Anda.', score: 3, why: 'Rekan bisa lengah atau ikut berpindah tempat.' },
      D: { text: 'Menutup layar dengan selembar kertas kalender atau membalik arah monitor saja.', score: 1, why: 'Tidak melindungi akses sistem sama sekali.' },
      E: { text: 'Mematikan tombol daya monitor tanpa mengunci sistem operasi komputer.', score: 4, why: 'Menyembunyikan tampilan sementara, namun jika monitor dinyalakan kembali sesi login masih terbuka.' }
    },
    concept: 'Kebijakan layar bersih (Clear Screen Policy) adalah standar keamanan informasi paling mendasar di perkantoran modern.',
    steps: [
      'Selalu tekan kunci layar (Lock) saat beranjak dari meja walau sebentar.',
      'Logout dari sistem berisiko tinggi jika ditinggal lama.',
      'Ajak tim membudayakan keamanan fisik perangkat.'
    ],
    quickTrick: 'Selalu Lock Screen + logout sesi sensitif setiap kali meninggalkan meja.',
    commonMistakes: 'Sekadar minimize jendela atau mematikan layar monitor saja.',
    tip: 'Satu detik mengunci layar melindungi data instansi dari penyalahgunaan pihak tak berwenang.',
    refs: [{ title: 'Kebijakan Keamanan Informasi SMKI / ISO 27001', source: 'BSSN', note: 'Clear Desk & Clear Screen Policy' }]
  },
  {
    id: 'TKP-P5-025',
    topicSlug: 'adaptasi-tik',
    subtopic: 'Pemanfaatan Dasbor Data untuk Pengambilan Keputusan',
    difficulty: 'MEDIUM',
    stem: 'Instansi Anda baru meluncurkan dasbor analitik layanan publik waktu nyata (real-time), namun atasan Anda masih sering meminta tim mengetik ulang ringkasan angka harian ke dokumen Word panjang setiap sore. Langkah adaptif dan konstruktif Anda adalah...',
    options: {
      A: { text: 'Menyajikan paparan singkat kepada atasan mengenai cara membaca indikator kunci di dasbor baru beserta fitur ekspor ringkasnya, sehingga pelaporan menjadi lebih cepat dan akurat.', score: 5, why: 'Membantu pimpinan merasakan nilai praktis teknologi baru tanpa menolak tugas secara konfrontatif.' },
      B: { text: 'Langsung berhenti membuat laporan Word tanpa memberi tahu atasan dan menyuruh beliau membuka dasbor sendiri.', score: 1, why: 'Tidak etis dan memutus arus informasi yang dibutuhkan atasan.' },
      C: { text: 'Tetap menyalin angka dari dasbor ke Word setiap sore sampai tahun anggaran berganti.', score: 2, why: 'Kerja ganda yang membuang manfaat investasi dasbor digital.' },
      D: { text: 'Menyarankan rekan kerja menolak perintah mengetik manual karena tidak sesuai semangat digitalisasi.', score: 3, why: 'Memicu penolakan tanpa mengedukasi kemudahan solusi.' },
      E: { text: 'Mengirimkan tangkapan layar grafik dasbor melalui chat tiap sore sebagai pelengkap laporan Word.', score: 4, why: 'Memperkenalkan visualisasi dasbor perlahan, namun mendampingi penggunaan dasbor dan ekspor otomatis jauh lebih efisien.' }
    },
    concept: 'Transformasi TIK berhasil apabila pegawai mampu menjembatani adopsi teknologi hingga ke level pengambil keputusan.',
    steps: [
      'Pahami alur kerja pelaporan yang dibutuhkan pimpinan.',
      'Tunjukkan cara cepat memperoleh data sama lewat dasbor/ekspor otomatis.',
      'Bantu masa transisi hingga atasan nyaman menggunakannya.'
    ],
    quickTrick: 'Demonstrasikan kemudahan dasbor + fitur ekspor ringkas kepada pimpinan secara santun.',
    commonMistakes: 'Menolak perintah mentah-mentah atau pasrah melakukan kerja ganda selamanya.',
    tip: 'Menghemat waktu pimpinan adalah cara tercepat mendorong adopsi teknologi di birokrasi.',
    refs: [{ title: 'Pengambilan Keputusan Berbasis Data', source: 'Satu Data Indonesia', note: 'Adopsi Dasbor Eksekutif' }]
  },
  {
    id: 'TKP-P5-026',
    topicSlug: 'adaptasi-tik',
    subtopic: 'Mengatasi Kendala Koneksi saat Presentasi Penting',
    difficulty: 'MEDIUM',
    stem: 'Sepuluh menit sebelum Anda mempresentasikan laporan program menggunakan aplikasi daring di aula dinas, jaringan Wi-Fi gedung tiba-tiba putus total dan teknisi memperkirakan pemulihan butuh 20 menit. Tindakan antisipatif dan solutif terbaik adalah...',
    options: {
      A: { text: 'Segera beralih ke salinan cadangan presentasi luring (offline PDF/PPT) yang sudah Anda siapkan atau memakai koneksi tethering sementara yang aman agar acara tetap berjalan tepat waktu.', score: 5, why: 'Memiliki rencana cadangan (backup offline & jalur alternatif) sehingga teknologi gagal tidak melumpuhkan acara.' },
      B: { text: 'Meminta pembawa acara menunda pembukaan selama 20 menit sampai Wi-Fi gedung menyala kembali.', score: 3, why: 'Mengganggu jadwal peserta tanpa memanfaatkan opsi cadangan.' },
      C: { text: 'Menyalahkan petugas TI di depan seluruh hadirin karena jaringan gedung sering bermasalah.', score: 1, why: 'Tidak profesional dan tidak menyelesaikan jalannya presentasi.' },
      D: { text: 'Membatalkan tampilan slide dan langsung membacakan seluruh angka statistik panjang tanpa alat bantu visual.', score: 2, why: 'Mengurangi pemahaman audiens jika materi penuh angka tanpa salinan offline.' },
      E: { text: 'Meminjam ponsel rekan secara mendadak untuk tethering sambil mengunduh ulang file dari cloud saat peserta sudah duduk menunggu.', score: 4, why: 'Mencari solusi koneksi cadangan, meski menyimpan salinan offline jauh lebih tangguh dan minim jeda.' }
    },
    concept: 'Kesiapan digital profesional selalu menyertakan rencana cadangan luring (offline fallback) saat menghadapi kegagalan infrastruktur jaringan.',
    steps: [
      'Selalu bawa salinan file offline di perangkat presentasi.',
      'Aktifkan jalur alternatif (offline atau hotspot aman) dengan cepat.',
      'Jaga kelancaran acara tanpa menyalahkan pihak lain.'
    ],
    quickTrick: 'Gunakan cadangan file offline atau koneksi alternatif agar presentasi berjalan mulus.',
    commonMistakes: 'Bergantung 100% pada tautan internet tanpa mengunduh salinan offline.',
    tip: 'Siapkan file offline adalah aturan emas setiap presentasi berbasis TIK.',
    refs: [{ title: 'Ketahanan Operasional TIK', source: 'LAN RI', note: 'Rencana Cadangan Luring' }]
  },
  {
    id: 'TKP-P5-027',
    topicSlug: 'adaptasi-tik',
    subtopic: 'Penggunaan Perangkat Lunak Berlisensi Resmi',
    difficulty: 'EASY',
    stem: 'Anda membutuhkan aplikasi desain grafis untuk membuat infografis layanan publik, tetapi anggaran unit belum membeli lisensi aplikasi berbayar populer tersebut. Seorang teman menyarankan Anda mengunduh versi bajakan (crack) agar pekerjaan cepat selesai. Sikap Anda adalah...',
    options: {
      A: { text: 'Menolak penggunaan perangkat lunak bajakan karena melanggar hak cipta dan rawan disisipi malware berbahaya bagi jaringan kantor, lalu memilih menggunakan aplikasi desain legal berbasis web gratis atau perangkat lunak sumber terbuka (open source) yang aman.', score: 5, why: 'Mematuhi hukum HAKI dan keamanan siber sekaligus tetap produktif memakai alternatif legal gratis/open source.' },
      B: { text: 'Menginstal versi bajakan sementara lalu segera menghapusnya setelah infografis selesai dibuat.', score: 1, why: 'Sekali dijalankan, program crack berisiko menanamkan ransomware/trojan ke jaringan instansi.' },
      C: { text: 'Menolak membuat infografis sama sekali sampai tahun anggaran depan tersedia dana lisensi berbayar.', score: 2, why: 'Menghambat output layanan informasi padahal tersedia alternatif legal gratis.' },
      D: { text: 'Meminta teman tersebut membuatkan desainnya di laptop pribadinya menggunakan aplikasi bajakan lalu mengirim hasilnya.', score: 3, why: 'Memindahkan risiko pelanggaran lisensi ke pihak lain.' },
      E: { text: 'Menggunakan aplikasi pengolah kata seadanya yang tersedia di komputer meski tampilan visualnya kurang komunikatif.', score: 4, why: 'Aman dan legal, tetapi memanfaatkan platform desain web resmi/open source memberi kualitas visual jauh lebih baik.' }
    },
    concept: 'Adaptasi TIK berintegritas menolak perangkat lunak bajakan (risiko hukum & malware) dan cakap memanfaatkan ekosistem perangkat lunak legal gratis atau sumber terbuka.',
    steps: [
      'Tolak aplikasi crack/bajakan di seluruh perangkat kerja.',
      'Cari alternatif resmi gratis (freemium legal) atau open source.',
      'Tetap hasilkan infografis layanan publik yang berkualitas.'
    ],
    quickTrick: 'Tolak software bajakan + pakai alternatif legal gratis/open source.',
    commonMistakes: 'Menganggap crack aman dipakai sementara atau menyerah tidak berkarya.',
    tip: 'Software bajakan adalah pintu utama infeksi ransomware di jaringan perkantoran.',
    refs: [{ title: 'HAKI & Penggunaan Perangkat Lunak Legal di Instansi', source: 'Kominfo & BSSN', note: 'Risiko Malware Software Bajakan' }]
  },
  {
    id: 'TKP-P5-028',
    topicSlug: 'adaptasi-tik',
    subtopic: 'Pembaruan Pengetahuan Teknologi Berkelanjutan',
    difficulty: 'MEDIUM',
    stem: 'Di akhir tahun, kantor Anda berencana mengadopsi alur kerja berbasis kecerdasan analitik dan integrasi API antaraplikasi yang istilah serta cara kerjanya belum pernah Anda pelajari saat kuliah. Sikap paling adaptif Anda adalah...',
    options: {
      A: { text: 'Mulai mempelajari konsep dasarnya secara mandiri melalui sumber belajar resmi/pelatihan daring terpercaya, mencatat potensi penerapannya di unit Anda, dan berdiskusi dengan tim TI kantor.', score: 5, why: 'Proaktif melakukan upskilling lebih awal sebelum teknologi resmi diterapkan.' },
      B: { text: 'Menunggu hingga kantor memanggil instruktur dan mewajibkan seluruh pegawai mengikuti kelas tatap muka.', score: 3, why: 'Bergantung penuh pada dorongan eksternal tanpa inisiatif belajar mandiri.' },
      C: { text: 'Merasa sudah terlalu terlambat belajar teknologi baru dan berharap dipindahkan ke bagian arsip manual.', score: 1, why: 'Menyerah pada perubahan dan menghambat pengembangan kompetensi ASN.' },
      D: { text: 'Membaca sekilas artikel berita tentang tren teknologi tersebut hanya sebagai bahan obrolan santai.', score: 2, why: 'Pengetahuan dangkal tanpa upaya mengaitkan dengan kebutuhan kerja.' },
      E: { text: 'Menyarankan teman muda saja yang mempelajari bidang teknis baru tersebut sementara Anda mengurus administrasi.', score: 4, why: 'Memanfaatkan kekuatan tim, namun kurang mau ikut memperbarui literasi pribadi.' }
    },
    concept: 'Pembelajar sepanjang hayat (continuous learning) membuat ASN tetap relevan menghadapi evolusi teknologi tata kelola pemerintahan.',
    steps: [
      'Hilangkan rasa takut terhadap istilah teknologi baru.',
      'Pelajari dasar konseptualnya dari sumber resmi.',
      'Kaitkan dengan perbaikan layanan di unit kerja sendiri.'
    ],
    quickTrick: 'Belajar proaktif mandiri + diskusi dengan ahli internal + petakan manfaat kerja.',
    commonMistakes: 'Menghindar ke pekerjaan manual atau menunggu pelatihan wajib.',
    tip: 'Nilai Kompeten dan Adaptif mendorong ASN belajar sebelum disuruh.',
    refs: [{ title: 'ASN Pembelajar (Corporate University)', source: 'LAN RI', note: 'Upskilling Digital Berkelanjutan' }]
  },
  {
    id: 'TKP-P5-029',
    topicSlug: 'adaptasi-tik',
    subtopic: 'Menjaga Etika & Keamanan Jaringan Wi-Fi Publik Saat Dinas Luar',
    difficulty: 'HARD',
    stem: 'Saat melakukan perjalanan dinas di bandara atau kafe, Anda mendadak diminta atasan mengakses portal keuangan internal kantor untuk mengunduh dan memverifikasi dokumen penting segera. Di lokasi hanya tersedia jaringan Wi-Fi publik gratis tanpa kata sandi. Tindakan paling aman adalah...',
    options: {
      A: { text: 'Menghindari koneksi Wi-Fi publik terbuka untuk mengakses sistem sensitif kantor, dan memilih menggunakan koneksi seluler pribadi/tethering aman atau VPN resmi kantor yang terenkripsi.', score: 5, why: 'Mengamankan transmisi data rahasia negara dari risiko penyadapan di jaringan publik (man-in-the-middle).' },
      B: { text: 'Langsung terhubung ke Wi-Fi publik bandara agar kuota internet pribadi tidak cepat habis.', score: 1, why: 'Sangat membahayakan kredensial dan data keuangan instansi di jaringan terbuka.' },
      C: { text: 'Menggunakan Wi-Fi publik dengan mengaktifkan mode penyamaran (Incognito) pada peramban karena dianggap sudah terenkripsi.', score: 2, why: 'Mode Incognito hanya menghapus riwayat lokal di perangkat, TIDAK mengenkripsi lalu lintas Wi-Fi dari penyadap jaringan.' },
      D: { text: 'Menolak permintaan atasan dan menunda pengunduhan dokumen hingga tiba di hotel malam hari.', score: 3, why: 'Aman dari Wi-Fi publik, tetapi menunda kebutuhan mendesak padahal jaringan seluler/VPN tersedia.' },
      E: { text: 'Tetap memakai Wi-Fi publik namun segera mengganti kata sandi akun portal kepegawaian seminggu kemudian.', score: 4, why: 'Data dokumen keuangan tetap berisiko tersadap saat diunduh di jaringan terbuka.' }
    },
    concept: 'Keamanan siber saat kerja jarak jauh (remote work) menuntut penghindaran Wi-Fi publik tanpa enkripsi untuk akses sistem pemerintahan, beralih ke tethering pribadi dan VPN resmi.',
    steps: [
      'Jangan pernah login sistem sensitif di Wi-Fi publik terbuka.',
      'Gunakan jaringan seluler/tethering pribadi serta VPN resmi instansi.',
      'Penuhi kebutuhan kerja mendesak secara cepat dan aman.'
    ],
    quickTrick: 'Pakai tethering pribadi / VPN resmi kantor saat dinas luar, hindari Wi-Fi publik terbuka.',
    commonMistakes: 'Mengira mode Incognito melindungi lalu lintas Wi-Fi publik.',
    tip: 'Literasi keamanan jaringan seluler jauh lebih aman daripada Wi-Fi gratis tanpa sandi.',
    refs: [{ title: 'Keamanan Kerja Jarak Jauh ASN', source: 'BSSN', note: 'Risiko Wi-Fi Publik & VPN' }]
  },

  // ================= PROFESIONALISME (8) =================
  {
    id: 'TKP-P5-030',
    topicSlug: 'profesionalisme',
    subtopic: 'Menjaga Kualitas Meski Terjadi Perubahan Kebijakan Mendadak',
    difficulty: 'MEDIUM',
    stem: 'Anda telah mengerjakan draf kajian kebijakan hampir rampung 90% selama dua minggu. Mendadak rapat pimpinan mengubah arah fokus kajian karena ada peraturan menteri yang baru terbit kemarin sehingga separuh bagian harus ditulis ulang dalam waktu empat hari. Sikap profesional Anda adalah...',
    options: {
      A: { text: 'Memahami alasan perubahan regulasi tersebut dengan tenang, menyelamatkan bagian data yang masih relevan, lalu menyusun rencana kerja padat untuk menyelesaikan penyesuaian sesuai peraturan baru tepat waktu.', score: 5, why: 'Tangguh, fleksibel terhadap dinamika hukum terbaru, dan tetap berorientasi kualitas serta tenggat.' },
      B: { text: 'Tetap mengumpulkan draf lama dengan menambahkan catatan kaki bahwa peraturan baru baru saja terbit.', score: 1, why: 'Menghasilkan kajian yang langsung usang dan menyalahi aturan terkini.' },
      C: { text: 'Mengeluh berkepanjangan di depan rekan kerja karena merasa jerih payah dua minggu sia-sia.', score: 2, why: 'Membuang energi produktif dan menurunkan moral tim.' },
      D: { text: 'Meminta penambahan waktu selama dua minggu lagi persis seperti durasi penyusunan awal.', score: 3, why: 'Kurang berupaya memilah bagian yang masih bisa digunakan ulang (reusable).' },
      E: { text: 'Menyelesaikan penyesuaian dalam empat hari dengan hanya mengganti judul dan bagian kesimpulan saja.', score: 4, why: 'Mengejar tenggat, namun kurang menjaga ketuntasan substansi isi kajian.' }
    },
    concept: 'Profesionalisme kebijakan berarti mengutamakan validitas regulasi terkini dengan ketahanan mental (resilience) dan pemanfaatan ulang aset data yang masih sah.',
    steps: [
      'Terima perubahan regulasi secara objektif.',
      'Audit bagian riset lama yang masih sah agar hemat waktu.',
      'Susun eksekusi terfokus mengejar tenggat empat hari.'
    ],
    quickTrick: 'Audit data relevan + sesuaikan isi utuh dengan regulasi baru + kelola waktu padat.',
    commonMistakes: 'Mempertahankan produk usang atau sekadar mengganti sampul dan kesimpulan.',
    tip: 'Ketangguhan menghadapi revisi regulasi adalah keseharian analis pemerintahan.',
    refs: [{ title: 'Resiliensi dan Mutu Kerja ASN', source: 'LAN RI', note: 'Adaptasi Revisi Regulasi' }]
  },
  {
    id: 'TKP-P5-031',
    topicSlug: 'profesionalisme',
    subtopic: 'Objektivitas Penilaian Rekan/Vendor',
    difficulty: 'HARD',
    stem: 'Anda tergabung dalam panitia penilai proposal hibah program masyarakat. Salah satu proposal berasal dari yayasan milik teman akrab Anda di masa kuliah, dan hasilnya memang cukup baik namun masih kalah skor teknis dibanding dua proposal dari lembaga lain yang tidak Anda kenal. Keputusan berintegritas Anda adalah...',
    options: {
      A: { text: 'Menyatakan potensi benturan kepentingan (conflict of interest) sejak awal kepada ketua panitia atau mundur dari penilaian proposal tersebut, serta memastikan skor seluruh proposal dinilai murni berdasarkan rubrik objektif.', score: 5, why: 'Standar tertinggi tata kelola antikorupsi: deklarasi benturan kepentingan dan objektivitas mutlak berbasis rubrik.' },
      B: { text: 'Memberi nilai sedikit lebih tinggi pada proposal teman agar masuk urutan pemenang karena tujuannya juga untuk kegiatan sosial.', score: 1, why: 'Kecurangan penilaian berbasis nepotisme/pertemanan.' },
      C: { text: 'Menilai tetap berdasarkan rubrik secara diam-diam tanpa memberi tahu ketua panitia bahwa Anda mengenal pemilik yayasan.', score: 4, why: 'Hasil penilaiannya adil, tetapi mendeklarasikan hubungan pertemanan menjaga akuntabilitas dari gugatan di kemudian hari.' },
      D: { text: 'Mengusulkan penambahan kuota pemenang di menit akhir supaya proposal teman ikut lolos tanpa menggeser dua teratas.', score: 2, why: 'Mengubah aturan kuota demi mengakomodasi kepentingan kenalan.' },
      E: { text: 'Meminta teman tersebut memperbaiki proposalnya secara diam-diam di luar jadwal resmi supaya nilainya mengalahkan dua lembaga lain.', score: 3, why: 'Memberi perlakuan istimewa dan bocoran penilaian melanggar keadilan kompetisi.' }
    },
    concept: 'Penanganan benturan kepentingan (Conflict of Interest) mewajibkan pengungkapan transparan dan pelepasan diri (recusal) dari pengambilan keputusan terkait pihak dekat.',
    steps: [
      'Deklarasikan hubungan kedekatan kepada ketua tim.',
      'Hindari menilai berkas pihak terkait (recusal).',
      'Pertahankan integritas rubrik untuk seluruh peserta.'
    ],
    quickTrick: 'Deklarasikan benturan kepentingan sejak awal + jaga penilaian 100% objektif berbasis rubrik.',
    commonMistakes: 'Diam tidak melapor kedekatan atau memberi bocoran revisi diam-diam.',
    tip: 'Deklarasi conflict of interest melindungi Anda sekaligus menjaga marwah keputusan panitia.',
    refs: [{ title: 'Pedoman Penanganan Benturan Kepentingan', source: 'PermenPAN-RB No. 37 Tahun 2012', note: 'Deklarasi & Recusal' }]
  },
  {
    id: 'TKP-P5-032',
    topicSlug: 'profesionalisme',
    subtopic: 'Pengakuan Batas Kompetensi & Konsultasi Ahli',
    difficulty: 'MEDIUM',
    stem: 'Dalam memeriksa berkas perizinan lingkungan hidup, Anda menemukan parameter uji limbah kimia yang berada di luar pengetahuan teknis Anda dan berpotensi berdampak besar bila salah ditafsirkan. Tenggat persetujuan tinggal dua hari lagi. Tindakan paling profesional adalah...',
    options: {
      A: { text: 'Segera berkonsultasi dengan pejabat fungsional/ahli teknis terkait di instansi atau unit verifikasi laboratorium guna memvalidasi angka tersebut sebelum menerbitkan persetujuan.', score: 5, why: 'Menjunjung prinsip kehati-hatian (prudent), jujur atas batas keahlian, dan berkolaborasi mencari akurasi sebelum memutuskan.' },
      B: { text: 'Langsung menyetujui berkas tersebut karena seluruh lampiran tanda tangan laboratorium swasta sudah lengkap.', score: 2, why: 'Meloloskan potensi risiko lingkungan tanpa memahami validitas substansinya.' },
      C: { text: 'Mengira-ngira sendiri makna angkanya berdasarkan artikel populer di internet agar terlihat serba bisa.', score: 1, why: 'Sangat berbahaya mengambil keputusan teknis berdampak lingkungan berdasarkan tebakan.' },
      D: { text: 'Menolak berkas tersebut secara sepihak agar aman dari risiko tanggung jawab di kemudian hari.', score: 3, why: 'Mengorbankan pemohon yang mungkin sudah memenuhi syarat hanya karena ketidaktahuan verifikator.' },
      E: { text: 'Meminta pemohon menjelaskan sendiri arti angka kimianya melalui telepon lalu mempercayainya penuh.', score: 4, why: 'Ada upaya mencari kejelasan, namun memvalidasi ke pihak independen/ahli internal jauh lebih objektif daripada sekadar penjelasan pemohon.' }
    },
    concept: 'Profesionalisme bukan berarti berpura-pura tahu segalanya, melainkan mengenali batas keahlian dan segera memvalidasi ke pakar berwenang sebelum mengambil keputusan berisiko.',
    steps: [
      'Identifikasi parameter kritis di luar keahlian pribadi.',
      'Segera konsultasikan dengan pejabat fungsional/ahli internal.',
      'Terbitkan keputusan berbasis verifikasi ilmiah dan regulasi.'
    ],
    quickTrick: 'Jujur pada batas kompetensi -> segera konsultasi ahli berwenang sebelum memutuskan.',
    commonMistakes: 'Menebak-nebak demi gengsi atau asal menolak/menyetujui.',
    tip: 'Kesalahan pada izin lingkungan berisiko merugikan masyarakat luas; validasi ahli selalu tepat.',
    refs: [{ title: 'Etika Pengambilan Keputusan Profesional', source: 'LAN RI', note: 'Prinsip Kehati-hatian' }]
  },
  {
    id: 'TKP-P5-033',
    topicSlug: 'profesionalisme',
    subtopic: 'Disiplin Keuangan Perjalanan Dinas',
    difficulty: 'EASY',
    stem: 'Anda mendapat uang muka biaya perjalanan dinas untuk kegiatan tiga hari di luar kota. Ternyata panitia pusat menyediakan penginapan penuh pada malam kedua sehingga sebagian anggaran penginapan tidak terpakai dan tanpa kuitansi. Sikap akuntabel Anda adalah...',
    options: {
      A: { text: 'Melaporkan pengeluaran riil secara jujur dalam pertanggungjawaban SPJ dan mengembalikan sisa anggaran penginapan yang tidak terpakai ke kas negara/bendahara sesuai aturan.', score: 5, why: 'Integritas keuangan negara yang ketat (at cost / riil) tanpa merekayasa bukti pengeluaran.' },
      B: { text: 'Menggunakan sisa uang penginapan tersebut untuk membeli oleh-oleh khas daerah bagi rekan-rekan satu kantor.', score: 2, why: 'Penyalahgunaan anggaran perjalanan dinas meski dibagikan ke rekan kantor.' },
      C: { text: 'Meminta kuitansi kosong dari resepsionis hotel pada malam pertama dan mengisinya seolah menginap dua malam penuh.', score: 1, why: 'Manipulasi SPJ/kuitansi fiktif merupakan tindak pidana korupsi.' },
      D: { text: 'Menyimpan sisa uang tersebut sebagai kompensasi rasa lelah perjalanan dinas yang padat.', score: 3, why: 'Mengambil dana negara di luar hak riil yang ditetapkan peraturan.' },
      E: { text: 'Menanyakan terlebih dahulu ke rekan senior bagaimana biasanya mereka menyikapi sisa biaya penginapan agar tidak berbeda sendiri.', score: 4, why: 'Mencari referensi aturan sebelum memutuskan, meski aturan akuntabilitas pengembalian sisa riil sudah sangat jelas.' }
    },
    concept: 'Pertanggungjawaban keuangan negara menganut prinsip pengeluaran riil (at cost) untuk komponen hotel/transportasi dan melarang keras kuitansi fiktif.',
    steps: [
      'Catat seluruh pengeluaran sesuai bukti transaksi nyata.',
      'Tolak pembuatan kuitansi kosong atau mark-up.',
      'Setorkan kembali sisa dana yang tidak terpakai ke bendahara/kas negara.'
    ],
    quickTrick: 'Laporkan biaya riil apa adanya + kembalikan sisa tak terpakai ke kas negara.',
    commonMistakes: 'Menganggap sisa anggaran penginapan sebagai hak pribadi atau membuat nota fiktif untuk oleh-oleh.',
    tip: 'SPJ fiktif adalah salah satu temuan audit BPK yang paling fatal bagi ASN.',
    refs: [{ title: 'Standar Biaya Masukan & Perjalanan Dinas', source: 'PMK Kemenkeu RI', note: 'Prinsip At Cost & Pengembalian Sisa' }]
  },
  {
    id: 'TKP-P5-034',
    topicSlug: 'profesionalisme',
    subtopic: 'Menjaga Ketenangan dan Solusi Saat Rapat Tegang',
    difficulty: 'MEDIUM',
    stem: 'Saat Anda memaparkan temuan evaluasi kinerja yang kurang baik pada suatu program, salah satu kepala seksi langsung memotong pembicaraan dengan nada kesal dan menuduh data tim Anda keliru. Suasana rapat mendadak menegang. Sikap profesional Anda adalah...',
    options: {
      A: { text: 'Tetap tenang menjaga intonasi suara yang sopan, mempersilakan beliau menyampaikan poin keberatannya secara spesifik, lalu menyandingkan sumber data mentah secara terbuka agar forum dapat memeriksa dan menyepakati perbaikan bersama.', score: 5, why: 'Kendali emosi matang, fokus pada verifikasi data objektif, dan menjaga martabat semua peserta rapat.' },
      B: { text: 'Membalas dengan nada lebih tinggi bahwa data Anda 100% benar dan kinerja seksi beliaulah yang buruk.', score: 1, why: 'Konfrontatif, menyerang pribadi, dan membakar suasana rapat.' },
      C: { text: 'Langsung menutup slide paparan dan menyerahkan berkas ke pimpinan rapat karena merasa tidak dihargai.', score: 2, why: 'Baper dan menghentikan pembahasan substansi evaluasi penting.' },
      D: { text: 'Langsung meminta maaf dan menarik kembali seluruh angka temuan Anda supaya suasana rapat kembali damai.', score: 3, why: 'Mengorbankan kebenaran data evaluasi demi menghindari ketegangan.' },
      E: { text: 'Tetap melanjutkan membaca slide paparan tanpa menanggapi keberatan beliau sampai selesai baru menawarkan diskusi nanti.', score: 4, why: 'Menjaga ketenangan, tetapi mengabaikan keberatan mendadak membuat peserta lain ikut meragukan paparan jika tidak segera diklarifikasi.' }
    },
    concept: 'Kecerdasan emosional di forum profesional terlihat saat menghadapi sanggahan keras dengan ketenangan berbasis bukti objektif.',
    steps: [
      'Jaga ekspresi dan nada suara tetap tenang.',
      'Ajak mengidentifikasi titik perbedaan data secara spesifik.',
      'Uji silang sumber data bersama demi perbaikan program.'
    ],
    quickTrick: 'Tenang -> minta poin spesifik -> sandingkan data objektif demi perbaikan bersama.',
    commonMistakes: 'Terpancing adu emosi atau langsung mencabut data benar tanpa verifikasi.',
    tip: 'Biarkan data yang berbicara dengan tenang tanpa perlu menaikkan suara.',
    refs: [{ title: 'Kecerdasan Emosional & Komunikasi Eksekutif', source: 'LAN RI', note: 'Menghadapi Keberatan Data' }]
  },
  {
    id: 'TKP-P5-035',
    topicSlug: 'profesionalisme',
    subtopic: 'Berani Menolak Instruksi yang Melanggar Prosedur Hukum',
    difficulty: 'HARD',
    stem: 'Menjelang penutupan tahun anggaran, atasan langsung meminta Anda menandatangani berita acara serah terima barang bahwa pekerjaan pengadaan sudah selesai 100% agar anggaran tidak hangus, padahal di gudang baru tiba 70% barang dan sisanya baru dijanjikan penyedia minggu depan. Sikap paling berintegritas adalah...',
    options: {
      A: { text: 'Menolak menandatangani berita acara serah terima 100% secara sopan dengan memaparkan fakta fisik 70% di gudang serta risiko hukum pidananya, lalu menawarkan opsi pencatatan kemajuan riil atau skema perpanjangan sesuai aturan pengadaan.', score: 5, why: 'Integritas teguh menolak pemalsuan dokumen resmi negara sambil memberi solusi administratif yang sah.' },
      B: { text: 'Menandatanganinya karena atasan berjanji siap bertanggung jawab penuh secara pribadi jika ada pemeriksaan.', score: 1, why: 'Tanda tangan pejabat/panitia pada BAST fiktif tetap mengikat tanggung jawab hukum pidana penanda tangan.' },
      C: { text: 'Menandatangani namun diam-diam menuliskan keterangan kecil "sebagian menyusul" di belakang berkas tanpa memberi tahu atasan.', score: 2, why: 'Dokumen BAST tetap menjadi cacat hukum dan memicu kekacauan akuntabilitas.' },
      D: { text: 'Langsung menolak dengan suara keras sambil mengancam akan melaporkan atasan ke aparat penegak hukum detik itu juga.', score: 3, why: 'Niat menjaga hukum benar, tetapi cara konfrontatif mengancam sebelum memberi penjelasan sopan dan solusi sah memperburuk relasi kerja.' },
      E: { text: 'Mengambil cuti mendadak pada hari penandatanganan agar orang lain saja yang menandatangani dokumen tersebut.', score: 4, why: 'Menghindari keterlibatan pribadi, tetapi tidak berani mengingatkan risiko hukum atau membenahi proses unit.' }
    },
    concept: 'Loyalitas ASN adalah kepada peraturan perundang-undangan dan kebenaran fakta, bukan pada perintah atasan yang melanggar hukum (seperti BAST fiktif).',
    steps: [
      'Verifikasi kondisi fisik barang di lapangan secara jujur.',
      'Tolak penandatanganan BAST fiktif secara santun namun tegas.',
      'Tawarkan mekanisme pembayaran progres/adendum sah sesuai peraturan pengadaan.'
    ],
    quickTrick: 'Tolak tegas & sopan perintah melanggar hukum + tawarkan solusi prosedural yang sah.',
    commonMistakes: 'Luluh oleh janji atasan "saya yang tanggung jawab" atau menghindar dengan cuti.',
    tip: 'Dalam pengadaan pemerintah, BAST fiktif adalah pelanggaran berat tanpa pengecualian.',
    refs: [{ title: 'Perpres Pengadaan Barang/Jasa Pemerintah', source: 'LKPP & BPK', note: 'Larangan BAST Fiktif' }]
  },
  {
    id: 'TKP-P5-036',
    topicSlug: 'profesionalisme',
    subtopic: 'Evaluasi Diri & Keterbukaan Menerima Umpan Balik',
    difficulty: 'EASY',
    stem: 'Dalam sesi evaluasi kinerja triwulan, atasan Anda memberi catatan bahwa kualitas analisis laporan Anda sangat tajam, namun penyajian tabelnya terlalu padat sehingga sulit dibaca cepat oleh pemangku kepentingan. Respons terbaik Anda adalah...',
    options: {
      A: { text: 'Berterima kasih atas masukan konstruktif tersebut, menanyakan contoh format ringkas yang diharapkan, dan langsung memperbarui standar penyajian tabel pada laporan berikutnya.', score: 5, why: 'Berpola pikir bertumbuh (growth mindset): menerima kritik objektif tanpa defensif lalu segera mengeksekusi perbaikan.' },
      B: { text: 'Menjelaskan bahwa tabel padat tersebut memang sengaja dibuat lengkap agar tidak ada angka yang terlewat.', score: 3, why: 'Cenderung defensif membela kebiasaan lama meski atasan sudah menyoroti keterbacaan.' },
      C: { text: 'Merasa kecewa karena atasan tidak cukup menghargai keakuratan analisis yang sudah Anda buat susah payah.', score: 1, why: 'Baper terhadap kritik konstruktif padahal atasan sudah mengapresiasi ketajaman analisis.' },
      D: { text: 'Mengurangi separuh isi analisisnya juga pada laporan berikutnya supaya halamannya terlihat lebih kosong.', score: 2, why: 'Salah menafsirkan masukan: yang perlu disederhanakan adalah penyajian visual tabelnya, bukan memangkas mutu analisis.' },
      E: { text: 'Menerima masukan dengan baik saat rapat namun baru akan mengubah formatnya jika tahun depan dimintai lagi.', score: 4, why: 'Sikap menerima baik, namun lambat menindaklanjuti perbaikan.' }
    },
    concept: 'Pegawai profesional menyambut umpan balik sebagai cermin peningkatan mutu kerja dan segera menerjemahkannya menjadi perbaikan nyata.',
    steps: [
      'Apresiasi umpan balik tanpa pembelaan berlebihan.',
      'Klarifikasi standar keterbacaan yang diharapkan.',
      'Terapkan perbaikan nyata di laporan terdekat.'
    ],
    quickTrick: 'Terima masukan + klarifikasi contoh harapan + langsung perbaiki pada karya berikutnya.',
    commonMistakes: 'Defensif atau salah membuang substansi analisis.',
    tip: 'Pujian plus catatan perbaikan berarti peluang naik kelas kompetensi.',
    refs: [{ title: 'Pengelolaan Kinerja Pegawai ASN', source: 'PermenPAN-RB No. 6 Tahun 2022', note: 'Umpan Balik Berkelanjutan' }]
  },
  {
    id: 'TKP-P5-037',
    topicSlug: 'profesionalisme',
    subtopic: 'Konsistensi Mutu pada Tugas Rutin Administratif',
    difficulty: 'EASY',
    stem: 'Anda sering mendapat tugas pengarsipan dan pengecekan ulang nomor surat keluar yang terasa monoton dibandingkan tugas penyusunan konsep program strategis. Rekan lain menyarankan Anda mengerjakannya cepat-cepatan saja karena jarang diperiksa detail. Sikap Anda adalah...',
    options: {
      A: { text: 'Tetap mengerjakannya dengan ketelitian tinggi dan standar mutu konsisten karena satu kesalahan nomor atau arsip surat dapat menimbulkan masalah hukum atau hambatan pencarian di kemudian hari.', score: 5, why: 'Memahami dampak krusial tugas administratif dan menjaga etos profesional pada pekerjaan besar maupun rutin.' },
      B: { text: 'Mengerjakannya seadanya saja agar sisa energi Anda fokus ke tugas penyusunan program strategis.', score: 2, why: 'Meremehkan tugas rutin hingga berpotensi menimbulkan cacat administrasi.' },
      C: { text: 'Mengajukan pengalihan seluruh tugas pengarsipan kepada tenaga honorer supaya Anda fokus pada tugas bergengsi.', score: 1, why: 'Merendahkan nilai tugas administratif dan melimpahkan tanggung jawab pribadi.' },
      D: { text: 'Mengecek agak cepat dulu dan baru merapikannya enam bulan sekali menjelang pemeriksaan auditor.', score: 3, why: 'Menumpuk risiko kesalahan dan kerja lembur mendadak saat audit.' },
      E: { text: 'Mengikuti saran rekan untuk mengecek bagian tanggal saja tanpa memverifikasi ulang penomoran lampiran.', score: 4, why: 'Kelalaian sebagian tetap berisiko salah rujukan surat.' }
    },
    concept: 'Profesionalisme sejati menaruh rasa hormat dan ketelitian yang sama baik pada tugas strategis maupun ketertiban administrasi rutin.',
    steps: [
      'Jaga daftar periksa singkat untuk ketepatan penomoran dan arsip.',
      'Selesaikan secara tertib tiap hari agar tidak menumpuk.',
      'Pahami peran strategis arsip sebagai bukti akuntabilitas instansi.'
    ],
    quickTrick: 'Teliti dan konsisten menjaga mutu pada setiap skala tugas kedinasan.',
    commonMistakes: 'Menganggap pekerjaan administratif rutin tidak perlu dikerjakan cermat.',
    tip: 'Tertib arsip adalah benteng pertama saat terjadi sengketa atau audit.',
    refs: [{ title: 'Tata Naskah Dinas & Kearsipan ASN', source: 'ANRI', note: 'Akuntabilitas Administrasi' }]
  },

  // ================= ANTI RADIKALISME (8) =================
  {
    id: 'TKP-P5-038',
    topicSlug: 'anti-radikalisme',
    subtopic: 'Mendampingi Anggota Keluarga/Lingkungan Terpapar Informasi Ekstrem',
    difficulty: 'MEDIUM',
    stem: 'Anda menyadari seorang keponakan atau anggota keluarga dekat yang baru lulus kuliah mulai menarik diri dari keluarga, kerap menonton video ceramah anonim bernada keras yang mengajak memusuhi negara serta menyebut seluruh pegawai pemerintah sebagai bagian sistem sesat. Sikap paling bijak dan bertanggung jawab adalah...',
    options: {
      A: { text: 'Menjaga komunikasi hangat penuh empati tanpa menghakimi secara kasar, perlahan mengajak dialog terbuka dengan menghadirkan sumber pengetahuan/tokoh keagamaan moderat terpercaya, serta berkonsultasi ke layanan konseling atau pencegahan deradikalisasi resmi jika diperlukan.', score: 5, why: 'Menggunakan pendekatan kasih sayang keluarga yang memeluk sambil membimbing ke sumber otoritatif moderat serta bantuan resmi bila berlanjut.' },
      B: { text: 'Langsung memarahinya keras-keras dan membuang semua bukunya di depan keluarga agar ia takut.', score: 2, why: 'Konfrontasi keras sering membuat anak muda merasa terasing dan makin terdorong masuk lebih dalam ke jaringan ekstrem.' },
      C: { text: 'Membiarkannya saja karena ia sudah dewasa dan berhak memilih tontonan serta pandangan hidupnya.', score: 1, why: 'Pembiaran pada fase awal penarikan diri berisiko membiarkannya direkrut sel radikal.' },
      D: { text: 'Diam-diam memblokir situs internet di rumah tanpa pernah berbicara dengannya mengenai isi pemikirannya.', score: 3, why: 'Ia tetap bisa mengakses lewat kuota seluler dan jarak emosional keluarga tetap melebar.' },
      E: { text: 'Menasihatinya berkali-kali bahwa menjadi ASN tidak sesat lalu menyuruhnya sibuk melamar kerja agar lupa sendiri.', score: 4, why: 'Niat baik dan berusaha menyibukkan ke arah positif, namun mengabaikan pelurusan akar pemahaman bersama tokoh moderat.' }
    },
    concept: 'Pencegahan dini (early intervention) di lingkup keluarga menuntut kehangatan dialog tanpa menghakimi, penawaran narasi moderat dari tokoh kredibel, dan dukungan konseling ahli.',
    steps: [
      'Pertahankan jembatan komunikasi yang hangat (jangan dijauhi).',
      'Gali keresahan di balik ketertarikannya pada konten keras.',
      'Hubungkan dengan tokoh agama moderat atau konselor resmi BNPT/FKPT.'
    ],
    quickTrick: 'Rangkul dialog hangat tanpa menghakimi + kenalkan rujukan moderat kredibel + konsultasi layanan resmi bila perlu.',
    commonMistakes: 'Memusuhi/mengusir atau justru membiarkan tanpa pendampingan.',
    tip: 'Isolasi emosional mempercepat radikalisasi; rangkulan yang bijak membukakan jalan kembali.',
    refs: [{ title: 'Panduan Keluarga Tangguh Anti-Radikalisme', source: 'BNPT & KemenPPPA', note: 'Intervensi Dini Persuasif' }]
  },
  {
    id: 'TKP-P5-039',
    topicSlug: 'anti-radikalisme',
    subtopic: 'Menjaga Integritas Rekrutmen Pembicara Kegiatan Kantor',
    difficulty: 'MEDIUM',
    stem: 'Sebagai panitia kegiatan pembinaan mental dan kebangsaan di kantor, Anda mendapat usulan narasumber dari seorang rekan. Setelah menelusuri rekam jejak digitalnya secara objektif, narasumber tersebut pernah berulang kali menyampaikan ujaran kebencian terhadap keberagaman dan mempertanyakan keabsahan Pancasila. Langkah Anda adalah...',
    options: {
      A: { text: 'Menyampaikan temuan rekam jejak objektif tersebut kepada ketua panitia dan pimpinan, lalu merekomendasikan penggantian narasumber dengan figur kompeten yang berwawasan kebangsaan dan moderat.', score: 5, why: 'Menerapkan penyaringan preventif berbasis fakta rekam jejak untuk menjaga marwah acara instansi negara.' },
      B: { text: 'Tetap mengundangnya dengan syarat di dalam kontrak acara ia tidak boleh membahas politik atau negara.', score: 3, why: 'Berisiko tinggi narasumber menyisipkan narasi terselubung dan mencoreng nama instansi.' },
      C: { text: 'Langsung membatalkan tanpa memberi penjelasan berbasis fakta kepada rekan pengusul sehingga memicu salah paham.', score: 4, why: 'Tindakan pencegahan benar, tetapi penyampaian tertutup tanpa basis fakta memicu gesekan internal.' },
      D: { text: 'Tetap meloloskannya karena rekan pengusul menjamin bahwa pembicara tersebut adalah temannya sendiri.', score: 2, why: 'Mengabaikan uji kelayakan demi sungkan kepada rekan.' },
      E: { text: 'Mengundangnya dalam sesi tertutup non-resmi di luar kantor saja agar tidak tercatat di laporan instansi.', score: 1, why: 'Justru memfasilitasi penyebaran paham anti-Pancasila secara terselubung ke pegawai.' }
    },
    concept: 'Instansi pemerintah wajib melakukan penapisan (vetting) rekam jejak narasumber kegiatan resmi guna mencegah masuknya paham intoleransi dan anti-Pancasila.',
    steps: [
      'Lakukan verifikasi rekam jejak publik kandidat narasumber.',
      'Laporkan temuan faktual ke panitia dan pimpinan.',
      'Pilih pengganti yang kredibel dan meneguhkan nilai kebangsaan.'
    ],
    quickTrick: 'Sampaikan temuan fakta rekam jejak + ganti narasumber dengan figur moderat berwawasan kebangsaan.',
    commonMistakes: 'Tetap mengundang karena sungkan pada pengusul atau berharap narasumber menahan diri.',
    tip: 'Pencegahan dini pada pintu masuk acara kantor jauh lebih mudah daripada membersihkan dampaknya.',
    refs: [{ title: 'SKB Pembinaan Ideologi Pancasila di Instansi Pemerintah', source: 'BKN & BPIP', note: 'Seleksi Narasumber Kantor' }]
  },
  {
    id: 'TKP-P5-040',
    topicSlug: 'anti-radikalisme',
    subtopic: 'Sikap Terhadap Penolakan Kerja Sama Berbasis Identitas dalam Layanan Publik',
    difficulty: 'HARD',
    stem: 'Seorang petugas pelayanan di loket sebelah menolak melayani pemohon warga negara tertentu hanya karena pemohon tersebut mengenakan simbol agama yang berbeda dengannya, dan berdalih hal itu melanggar prinsip pribadinya. Sebagai rekan kerja sekaligus saksi kejadian, tindakan Anda adalah...',
    options: {
      A: { text: 'Segera mengambil alih pelayanan pemohon tersebut dengan ramah dan adil agar hak warganya terpenuhi tanpa tertunda, lalu melaporkan tindakan diskriminatif petugas tersebut kepada atasan untuk ditindak dan dibina sesuai kode etik ASN.', score: 5, why: 'Melindungi hak warga secara instan dengan pelayanan setara sekaligus menegakkan disiplin anti-diskriminasi birokrasi.' },
      B: { text: 'Membiarkan pemohon pindah mencari kantor kecamatan lain supaya petugas sebelah tidak merasa terpaksa.', score: 2, why: 'Mengizinkan diskriminasi merampas hak konstitusional warga negara.' },
      C: { text: 'Menyalahkan pemohon dengan menyarankan melepas atribut keagamaannya sementara jika ingin cepat dilayani.', score: 1, why: 'Memaksa warga menanggalkan kebebasan ekspresi agama yang sah demi dilayani negara adalah pelanggaran berat.' },
      D: { text: 'Mengambil alih pelayanan pemohon secara ramah tanpa pernah melaporkan kejadian penolakan petugas tersebut ke atasan.', score: 4, why: 'Berhasil menyelamatkan layanan warga saat itu, tetapi tanpa laporan pembinaan, petugas tersebut bisa mengulangi diskriminasi kepada warga lain.' },
      E: { text: 'Berdebat panjang di depan loket dengan petugas sebelah sementara pemohon dibiarkan menunggu kebingungan.', score: 3, why: 'Mengutamakan debat sebelum menuntaskan hak warga yang berdiri di depan loket.' }
    },
    concept: 'Aparatur negara wajib melayani seluruh warga negara tanpa membedakan suku, agama, ras, atau golongan; diskriminasi di loket adalah pelanggaran sumpah jabatan.',
    steps: [
      'Selamatkan layanan warga segera dengan sikap hangat dan netral.',
      'Hindari pertengkaran terbuka di hadapan pemohon.',
      'Laporkan pelanggaran kode etik pelayan publik ke atasan untuk pembinaan.'
    ],
    quickTrick: 'Ambil alih & layani warga dengan ramah segera + laporkan tindakan diskriminatif ke atasan.',
    commonMistakes: 'Menyuruh warga mengalah atau mendiamkan perilaku diskriminatif rekan.',
    tip: 'Pelayanan publik dan anti-intoleransi selalu mendahulukan hak warga yang dirugikan.',
    refs: [{ title: 'Asas Non-Diskriminatif Pelayanan Publik', source: 'UU 25/2009 & UUD 1945', note: 'Layanan Tanpa Sekat Identitas' }]
  },
  {
    id: 'TKP-P5-041',
    topicSlug: 'anti-radikalisme',
    subtopic: 'Menangkal Ujaran Kebencian di Grup Media Sosial Profesi',
    difficulty: 'EASY',
    stem: 'Di sebuah forum daring komunitas profesi lintas daerah, seorang anggota mengunggah gambar karikatur yang menghina keyakinan agama tertentu disertai ajakan memboikot pelaku usaha dari kelompok tersebut. Langkah tepat Anda sebagai anggota grup adalah...',
    options: {
      A: { text: 'Tidak ikut menyebarkan atau menyukai unggahan tersebut, menyuarakan penolakan santun agar forum tetap menghormati keberagaman serta etika bermedia, serta melaporkan konten kebencian tersebut ke admin grup dan fitur laporan platform.', score: 5, why: 'Bertindak aktif menghentikan penyebaran ujaran kebencian melalui koreksi etika dan mekanisme pelaporan platform/admin.' },
      B: { text: 'Menyimpan gambar tersebut lalu mengirimkannya ke grup lain sebagai contoh lelucon yang keterlaluan.', score: 1, why: 'Memperluas jangkauan konten penghinaan SARA.' },
      C: { text: 'Meninggalkan komentar makian balik yang sama kasarnya kepada pengunggah.', score: 2, why: 'Menambah kebencian baru tanpa menggunakan mekanisme pelaporan sehat.' },
      D: { text: 'Menggulir layar melewatinya seolah tidak melihat apa pun karena tidak menyangkut pekerjaan Anda.', score: 3, why: 'Apatis membiarkan ruang publik profesional diracuni ujaran kebencian.' },
      E: { text: 'Menegur pengunggah secara santun melalui pesan pribadi tanpa melaporkan unggahan ke admin grup.', score: 4, why: 'Baik dalam etika menegur, namun jika konten tetap terpajang di grup tanpa laporan admin/platform, provokasi terus terbaca anggota lain.' }
    },
    concept: 'Ruang digital sehat membutuhkan kewargaan digital aktif: menolak menyebar ujaran kebencian, menjaga etika dialog, dan memanfaatkan fitur report/moderasi admin.',
    steps: [
      'Hentikan rantai distribusi konten kebencian.',
      'Ingatkan koridor etika saling menghormati di forum.',
      'Laporkan ke moderator grup dan sistem pelaporan platform (UU ITE).'
    ],
    quickTrick: 'Tolak sebar + tegaskan etika keberagaman + lapor admin & platform.',
    commonMistakes: 'Membalas cacian dengan cacian atau membiarkan konten SARA terpampang bebas.',
    tip: 'Melaporkan ujaran kebencian ke moderator/platform memutus peredarannya secara sah.',
    refs: [{ title: 'UU ITE Pasal 28 Ayat (2) & Etika Netizen', source: 'Kemenkominfo', note: 'Moderasi Ujaran Kebencian' }]
  },
  {
    id: 'TKP-P5-042',
    topicSlug: 'anti-radikalisme',
    subtopic: 'Menilai Konten Kebencian Terselubung dalam Produk Layanan/Publikasi',
    difficulty: 'HARD',
    stem: 'Saat melakukan penyuntingan akhir naskah buletin resmi instansi sebelum naik cetak, Anda menemukan satu paragraf opini kiriman kontributor yang secara halus menyisipkan prasangka negatif terhadap kelompok etnis tertentu di daerah Anda. Apa yang harus Anda lakukan?',
    options: {
      A: { text: 'Menunda pencetakan sejenak, menandai kalimat bermasalah tersebut secara objektif berdasarkan pedoman etik penulisan publik, lalu berkoordinasi dengan redaktur dan penulis untuk merevisi atau menghapus bagian diskriminatif sebelum diterbitkan.', score: 5, why: 'Menjaga publikasi resmi negara bersih dari muatan diskriminasi dengan prosedur editorial yang akuntabel.' },
      B: { text: 'Tetap mencetak apa adanya karena kolom opini sepenuhnya merupakan tanggung jawab pribadi penulis.', score: 1, why: 'Buletin resmi instansi membawa marwah negara sehingga tidak boleh menampung prasangka etnis.' },
      C: { text: 'Menghapus sendiri separuh artikel tanpa memberi tahu redaktur atau penulis agar cepat selesai.', score: 3, why: 'Mencegah terbitnya konten bermasalah, tetapi menyalahi etika koordinasi redaksi.' },
      D: { text: 'Membatalkan penerbitan seluruh buletin edisi bulan ini padahal artikel lainnya sudah bagus.', score: 2, why: 'Tidak proporsional dan merugikan kerja tim atas satu paragraf yang bisa direvisi.' },
      E: { text: 'Mengubah beberapa kata yang terlalu keras menjadi sedikit lebih halus tanpa menghilangkan gagasan prasangkanya.', score: 4, why: 'Prasangka diskriminatif tetap tersisa dalam publikasi pemerintah.' }
    },
    concept: 'Fungsi kurasi/editorial media resmi pemerintah wajib menyaring segala bentuk stereotip atau diskriminasi sebelum dipublikasikan ke masyarakat.',
    steps: [
      'Tahan proses cetak sebelum naskah bersih dari prasangka SARA.',
      'Koordinasikan revisi objektif bersama redaktur/penulis.',
      'Terbitkan hanya materi yang menjunjung persatuan dan kebhinnekaan.'
    ],
    quickTrick: 'Tahan cetak + tandai berbasis etik + koordinasikan revisi/penghapusan bagian diskriminatif.',
    commonMistakes: 'Bersembunyi di balik dalih "tanggung jawab penulis opini" pada media resmi kantor.',
    tip: 'Publikasi resmi instansi harus bebas 100% dari prasangka etnis dan agama.',
    refs: [{ title: 'Pedoman Komunikasi Publik Berwawasan Kebangsaan', source: 'Kemenkominfo', note: 'Kurasi Publikasi Instansi' }]
  },
  {
    id: 'TKP-P5-043',
    topicSlug: 'anti-radikalisme',
    subtopic: 'Komitmen Kebangsaan di Tengah Tawaran Kerja/Komunitas Berideologi Bertentangan',
    difficulty: 'MEDIUM',
    stem: 'Seorang kenalan menawarkan proyek sampingan berbayar sangat tinggi untuk mengelola situs web dan konten media sosial bagi organisasi non-pemerintah yang ternyata secara terselubung mempromosikan gerakan separatis pemisahan diri dari NKRI. Sikap tegas Anda adalah...',
    options: {
      A: { text: 'Menolak tegas tawaran tersebut tanpa kompromi karena bertentangan dengan sumpah kesetiaan ASN terhadap keutuhan NKRI, serta melaporkan aktivitas organisasi mencurigakan tersebut ke pihak berwenang sesuai ketentuan.', score: 5, why: 'Loyalitas mutlak terhadap kedaulatan NKRI di atas imbalan finansial apa pun.' },
      B: { text: 'Menerima pekerjaan teknis pemrograman situsnya saja asalkan bukan Anda yang menulis artikel politiknya.', score: 1, why: 'Membangun infrastruktur digital gerakan separatis tetap membantu menyebarkan makar/separatisme.' },
      C: { text: 'Menolak secara diam-diam dengan alasan sedang sibuk mengurus keluarga tanpa peduli dampak situs tersebut.', score: 4, why: 'Sudah menolak keterlibatan pribadi, namun melaporkan ancaman terhadap keutuhan NKRI lebih bertanggung jawab sebagai abdi negara.' },
      D: { text: 'Meminta bayaran dinaikkan dua kali lipat untuk menguji keseriusan mereka sebelum menolak.', score: 2, why: 'Mempermainkan isu kedaulatan negara dan memberi sinyal mau bernegosiasi.' },
      E: { text: 'Menyarankan teman Anda yang bukan ASN untuk mengambil tawaran proyek berbayar tinggi tersebut.', score: 3, why: 'Mendorong orang lain terlibat dalam promosi separatisme.' }
    },
    concept: 'Keutuhan Negara Kesatuan Republik Indonesia (NKRI) adalah harga mati bagi ASN; tidak ada alasan teknis maupun imbalan materi yang membenarkan keterlibatan dalam agenda separatisme.',
    steps: [
      'Tolak tanpa ragu seluruh bentuk kerja sama pendukung separatisme.',
      'Jangan alihkan kepada pihak lain.',
      'Laporkan indikasi penggalangan separatisme ke otoritas berwenang.'
    ],
    quickTrick: 'Tolak tanpa kompromi atas nama kesetiaan NKRI + laporkan indikasi ke pihak berwenang.',
    commonMistakes: 'Menganggap "cuma bantu coding/desain teknis" tidak ikut bersalah.',
    tip: 'Dalam wawasan kebangsaan, mendukung alat propaganda separatisme sama seriusnya dengan mendukung ideologinya.',
    refs: [{ title: 'Nilai Loyal ASN & Keutuhan NKRI', source: 'UU ASN & Tap MPR', note: 'Penolakan Separatisme' }]
  },
  {
    id: 'TKP-P5-044',
    topicSlug: 'anti-radikalisme',
    subtopic: 'Menjaga Persatuan Warga saat Ada Sengketa Pendirian Fasilitas Bersama',
    difficulty: 'MEDIUM',
    stem: 'Di wilayah tugas Anda timbul perselisihan antara dua kelompok warga mengenai rencana pembangunan taman baca masyarakat dan tempat kegiatan lintas warga karena masing-masing kelompok menuntut pengelolaan eksklusif bagi golongannya saja. Sikap Anda dalam memediasi adalah...',
    options: {
      A: { text: 'Memfasilitasi dialog musyawarah yang mempertemukan tokoh kedua kelompok secara setara, menekankan prinsip fasilitas umum milik bersama bagi seluruh warga tanpa sekat golongan, dan merumuskan tata kelola inklusif bersama.', score: 5, why: 'Mengedepankan musyawarah mufakat dan pengelolaan inklusif yang menyatukan seluruh warga.' },
      B: { text: 'Memutuskan menyerahkan pengelolaan kepada kelompok yang jumlah penduduknya paling banyak supaya cepat selesai.', score: 2, why: 'Mayoritarianisme pada fasilitas publik justru menumbuhkan rasa tersingkir bagi kelompok lain.' },
      C: { text: 'Mengusulkan pembatalan pembangunan taman baca agar tidak ada yang bertengkar.', score: 1, why: 'Mengorbankan kepentingan pendidikan dan ruang bersama warga karena takut memediasi.' },
      D: { text: 'Mengimbau salah satu kelompok mengalah saja demi menjaga kedamaian tahun ini.', score: 3, why: 'Tidak menyelesaikan kesetaraan hak kelola jangka panjang.' },
      E: { text: 'Menetapkan pemerintah kelurahan mengambil alih kunci taman baca tanpa melibatkan perwakilan warga mana pun dalam pengurusannya.', score: 4, why: 'Mencegah dominasi salah satu golongan, namun membentuk pengurus gabungan lintas unsur warga jauh lebih memberdayakan kohesi sosial.' }
    },
    concept: 'Fasilitas publik merupakan ruang perjumpaan sosial yang harus dikelola secara inklusif dan demokratis melalui musyawarah mufakat.',
    steps: [
      'Hadirkan seluruh perwakilan unsur warga secara setara.',
      'Tegaskan fungsi publik sebagai ruang bersama bebas eksklusivitas.',
      'Bentuk kepengurusan bersama lintas unsur warga.'
    ],
    quickTrick: 'Musyawarah setara + tegaskan milik bersama inklusif + bentuk tata kelola gabungan.',
    commonMistakes: 'Menyerahkan hanya ke mayoritas atau membatalkan fasilitas publik.',
    tip: 'Dialog inklusif mengubah sumber konflik menjadi jembatan kolaborasi warga.',
    refs: [{ title: 'Resolusi Konflik Sosial Kemasyarakatan', source: 'Kemendagri', note: 'Tata Kelola Ruang Publik Inklusif' }]
  },
  {
    id: 'TKP-P5-045',
    topicSlug: 'anti-radikalisme',
    subtopic: 'Sikap Kritis Terhadap Ajakan Boikot Institusi Negara & Penolakan Hukum',
    difficulty: 'MEDIUM',
    stem: 'Anda menemui unggahan di komunitas daring daerah yang mengajak warga tidak membayar pajak serta menolak mengakui kewenangan pengadilan negeri dengan alasan hukum positif buatan manusia tidak perlu ditaati. Sebagai ASN yang melek literasi kebangsaan, langkah bijak Anda adalah...',
    options: {
      A: { text: 'Menyampaikan penjelasan edukatif yang santun bahwa ketaatan pada pajak dan hukum konstitusional adalah kesepakatan bersama bangsa demi membiayai fasilitas publik dan keadilan warga, serta melaporkan ajakan pembangkangan terstruktur bila mengarah pada pelanggaran hukum.', score: 5, why: 'Mengcounter narasi anti-negara dengan argumen rasional manfaat publik yang sejuk sekaligus waspada terhadap provokasi terorganisir.' },
      B: { text: 'Menutup mata dan tidak berkomentar karena menganggap urusan pajak adalah tanggung jawab Direktorat Jenderal Pajak saja.', score: 4, why: 'Aman dari ikut menyebarkan, namun kurang peduli terhadap serangan ideologis terhadap legalitas negara.' },
      C: { text: 'Membalas kolom komentar dengan ejekan bahwa siapa pun yang menolak hukum harus diusir dari Indonesia.', score: 3, why: 'Emosional dan tidak mengedukasi warga awam yang membaca unggahan tersebut.' },
      D: { text: 'Menyetujui sebagian pendapatnya karena memang masih ada kasus korupsi anggaran di berita.', score: 1, why: 'Membenarkan penolakan eksistensi hukum negara alih-alih mendorong perbaikan dalam koridor hukum.' },
      E: { text: 'Membagikan ulang unggahan tersebut ke forum rekan kantor tanpa komentar klarifikasi.', score: 2, why: 'Menyebarkan mentah narasi pembangkangan hukum tanpa konteks klarifikasi.' }
    },
    concept: 'Kritik terhadap oknum atau korupsi harus disalurkan untuk memperbaiki negara hukum, bukan menolak legalitas konstitusi, pajak, dan pengadilan negara.',
    steps: [
      'Bedakan kritik perbaikan tata kelola vs penolakan hukum negara.',
      'Berikan edukasi santun soal fungsi pajak dan peradilan bagi rakyat.',
      'Laporkan ajakan pembangkangan sistematis melalui kanal resmi.'
    ],
    quickTrick: 'Edukasi sejuk manfaat konstitusi/pajak bagi publik + laporkan bila provokasi melanggar hukum.',
    commonMistakes: 'Ikut membenarkan pembangkangan hukum dengan alasan kritik terhadap oknum.',
    tip: 'Narasi moderat selalu menekankan fungsi keadilan bersama dalam bingkai NKRI.',
    refs: [{ title: 'Kesadaran Bela Negara & Ketaatan Hukum', source: 'Kemenhan & BPIP', note: 'Counter-Narasi Anti-Konstitusi' }]
  }
];
