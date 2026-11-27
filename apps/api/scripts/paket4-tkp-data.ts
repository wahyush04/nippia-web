import { TkpInput } from './paket-builder';

export const PAKET4_TKP_DATA: TkpInput[] = [
  // ================= PELAYANAN PUBLIK (8) =================
  {
    id: 'TKP-P4-001',
    topicSlug: 'pelayanan-publik',
    subtopic: 'Pelayanan Ramah Disabilitas',
    difficulty: 'MEDIUM',
    stem: 'Anda bertugas di loket pendaftaran layanan terpadu. Seorang pemohon tunarungu datang sendiri dan kesulitan menjelaskan keperluannya meskipun Anda sudah berbicara perlahan. Antrean di belakangnya cukup panjang dan beberapa warga mulai mengeluh. Tindakan paling tepat yang Anda lakukan adalah...',
    options: {
      A: { text: 'Menyediakan kertas dan pena atau mengetik di layar untuk berkomunikasi tertulis dengan sabar sambil mengarahkan antrean lain agar tetap tertib.', score: 5, why: 'Solutif, inklusif, menjaga martabat pemohon disabilitas, sekaligus menenangkan antrean.' },
      B: { text: 'Meminta pemohon tersebut menepi dahulu dan melayani warga lain sambil memanggilnya jika ia sudah menemukan pendamping.', score: 2, why: 'Menunda hak layanan kelompok rentan hanya karena keterbatasan akses komunikasi.' },
      C: { text: 'Berusaha memakai gestur tangan seadanya lalu meminta petugas keamanan membantu menerjemahkan maksudnya.', score: 4, why: 'Cukup proaktif membantu, meski komunikasi tertulis langsung di loket lebih akurat dan mandiri.' },
      D: { text: 'Menolak memproses permohonan sampai ia datang kembali bersama anggota keluarga yang bisa berbicara.', score: 1, why: 'Diskriminatif dan melanggar standar layanan publik ramah disabilitas.' },
      E: { text: 'Mengeraskan suara dan menunjuk papan alur layanan agar pemohon melihat sendiri langkah pendaftarannya.', score: 3, why: 'Kurang efektif bagi tunarungu dan berisiko mempermalukan pemohon di depan antrean.' }
    },
    concept: 'Pelayanan publik inklusif menuntut penyesuaian media komunikasi secara cepat tanpa menelantarkan pengguna layanan atau memicu kericuhan antrean.',
    steps: [
      'Ganti metode lisan menjadi komunikasi tertulis/visual yang jelas dan santun.',
      'Selesaikan kebutuhan pemohon tanpa menunda haknya.',
      'Berikan pengertian singkat kepada pengantre di belakang agar tertib menunggu.'
    ],
    quickTrick: 'Pilih aksi langsung yang inklusif, cepat, sopan, dan menjaga kelancaran antrean.',
    commonMistakes: 'Menggeser pemohon disabilitas ke luar antrean tanpa melayani kebutuhannya.',
    tip: 'Dalam TKP Pelayanan Publik, kelompok rentan (lansia, ibu hamil, disabilitas) selalu berhak atas akomodasi yang layak.',
    refs: [{ title: 'UU No. 25 Tahun 2009 tentang Pelayanan Publik', source: 'KemenPAN-RB', note: 'Pelayanan Khusus & Inklusif' }]
  },
  {
    id: 'TKP-P4-002',
    topicSlug: 'pelayanan-publik',
    subtopic: 'Pemadaman Listrik & Gangguan Sistem Loket',
    difficulty: 'MEDIUM',
    stem: 'Saat jam layanan sedang padat, server aplikasi antrean dan pencetakan dokumen di kantor Anda mendadak mengalami gangguan jaringan pusat selama minimal satu jam. Warga sudah menunggu cukup lama. Langkah terbaik Anda sebagai petugas layanan adalah...',
    options: {
      A: { text: 'Menginformasikan kendala secara terbuka di ruang tunggu, menawarkan pencatatan berkas manual/verifikasi awal terlebih dahulu, serta memberi kepastian estimasi waktu penyelesaian atau opsi pengambilan/notifikasi digital.', score: 5, why: 'Transparan, tetap produktif memproses verifikasi awal, dan memberi kepastian agar warga tidak menunggu tanpa kejelasan.' },
      B: { text: 'Menutup tirai loket sementara dan memasang kertas bertuliskan "Sistem Gangguan" lalu menunggu perbaikan dari tim IT pusat.', score: 2, why: 'Pasif, minim komunikasi empatik, dan membiarkan warga bingung tanpa solusi.' },
      C: { text: 'Meminta warga langsung pulang dan datang kembali besok pagi tanpa mencatat kelengkapan berkas mereka.', score: 1, why: 'Merugikan warga yang sudah meluangkan waktu dan biaya transportasi.' },
      D: { text: 'Menjelaskan dengan sopan bahwa sistem sedang gangguan sambil meminta warga bersabar menunggu di kursi tunggu hingga menyala kembali.', score: 4, why: 'Komunikasi baik, tetapi belum memaksimalkan verifikasi awal atau opsi layanan alternatif.' },
      E: { text: 'Tetap duduk di loket dan menjawab hanya apabila ada warga yang bertanya ke depan.', score: 3, why: 'Kurang inisiatif memberikan pengumuman kolektif.' }
    },
    concept: 'Kesinambungan layanan publik di tengah kendala teknis menuntut keterbukaan informasi dan mitigasi manual agar waktu warga tidak terbuang sia-sia.',
    steps: [
      'Umumkan gangguan dan perkiraan durasinya secara jujur.',
      'Tetap terima pemeriksaan kelengkapan berkas agar saat sistem pulih langsung diproses.',
      'Berikan opsi pengambilan atau notifikasi agar warga tidak tersandera.'
    ],
    quickTrick: 'Pilih langkah proaktif yang tetap melayani secara paralel saat sistem gangguan.',
    commonMistakes: 'Memilih sikap pasif hanya menunggu tim IT atau langsung menyuruh pulang.',
    tip: 'Transparansi + langkah mitigasi konkret selalu bernilai 5.',
    refs: [{ title: 'Standar Pelayanan Minimum', source: 'KemenPAN-RB', note: 'Penanganan Gangguan Layanan' }]
  },
  {
    id: 'TKP-P4-003',
    topicSlug: 'pelayanan-publik',
    subtopic: 'Keluhan Biaya Tidak Resmi',
    difficulty: 'HARD',
    stem: 'Seorang pemohon mengeluhkan adanya oknum di area parkir luar kantor yang meminta uang "pelicin" agar berkas perizinannya cepat diproses di meja Anda. Anda memastikan bahwa layanan ini sepenuhnya gratis dan tanpa jalur khusus. Sikap paling tepat adalah...',
    options: {
      A: { text: 'Menjelaskan dengan tegas dan sopan bahwa seluruh layanan bebas pungutan, memproses berkasnya sesuai urutan resmi secara transparan, serta melaporkan indikasi pungli di luar area tersebut ke atasan/unit pengawasan.', score: 5, why: 'Meluruskan informasi ke warga, menjaga objektivitas layanan, dan menindaklanjuti laporan ke jalur pengawasan resmi.' },
      B: { text: 'Menenangkan pemohon dan memintanya tidak menghiraukan oknum di luar karena di loket tidak ada pungutan.', score: 4, why: 'Menjelaskan ke pemohon, namun melewatkan pelaporan internal agar oknum tidak menipu warga lain.' },
      C: { text: 'Menyarankan pemohon melaporkan sendiri ke kantor polisi karena area parkir luar bukan kewenangan meja layanan.', score: 3, why: 'Melempar tanggung jawab pengaduan yang mencatut nama instansi.' },
      D: { text: 'Mendahulukan berkas pemohon tersebut sebagai bentuk permintaan maaf atas ulah oknum di luar.', score: 2, why: 'Melanggar keadilan antrean warga lain.' },
      E: { text: 'Memarahi pemohon karena seharusnya ia sudah membaca papan larangan calo sebelum datang.', score: 1, why: 'Menyalahkan korban dan bersikap tidak melayani.' }
    },
    concept: 'Pelayanan publik bebas pungli menuntut klarifikasi, proses adil sesuai prosedur, dan eskalasi pengaduan guna memutus praktik percaloan.',
    steps: [
      'Tegaskan tarif resmi/gratis kepada pemohon.',
      'Tetap proses berkas sesuai antrean yang berlaku.',
      'Laporkan indikasi oknum pencatut layanan ke unit pengawasan.'
    ],
    quickTrick: 'Klarifikasi prosedur resmi + proses adil + lapor atasan/SPI.',
    commonMistakes: 'Mendahulukan berkas si pelapor secara tidak adil atau diam tidak melapor.',
    tip: 'Jangan membalas kesalahan eksternal dengan pelanggaran prosedur antrean internal.',
    refs: [{ title: 'Zona Integritas WBK/WBBM', source: 'PermenPAN-RB', note: 'Pencegahan Pungli Layanan' }]
  },
  {
    id: 'TKP-P4-004',
    topicSlug: 'pelayanan-publik',
    subtopic: 'Kekeliruan Dokumen Terbit',
    difficulty: 'EASY',
    stem: 'Pemohon kembali ke loket karena mendapati salah eja satu huruf pada nama di surat keterangan yang baru saja Anda terbitkan. Antrean di loket saat itu sedang ramai. Tindakan terbaik Anda adalah...',
    options: {
      A: { text: 'Memintanya mengambil nomor antrean baru dari awal karena ia tidak memeriksa draf saat tanda tangan.', score: 2, why: 'Membebankan kesalahan koreksi internal kepada warga.' },
      B: { text: 'Meminta maaf dengan tulus atas kekhilafan pengetikan, segera mengecek kecocokan dengan KTP asli, dan langsung mencetak ulang perbaikannya tanpa meminta ia mengantre ulang dari awal.', score: 5, why: 'Bertanggung jawab penuh atas kesalahan petugas dan memperbaiki layanan secara cepat dan santun.' },
      C: { text: 'Mencoret huruf yang salah dengan pulpen lalu membubuhkan paraf seadanya agar cepat selesai.', score: 1, why: 'Merusak keabsahan dokumen resmi.' },
      D: { text: 'Meminta pemohon menunggu di kursi samping hingga seluruh antrean loket habis baru diperbaiki.', score: 3, why: 'Menunda perbaikan kekeliruan petugas sendiri terlalu lama.' },
      E: { text: 'Memverifikasi kesalahan ketik lalu mengarahkannya ke loket pengaduan terlebih dahulu untuk dicatat.', score: 4, why: 'Sesuai alur administrasi, namun memperbaiki langsung untuk salah ketik kecil lebih meringankan pemohon.' }
    },
    concept: 'Kesalahan yang berasal dari internal penyelenggara layanan wajib segera dikoreksi tanpa membebani pemohon dengan antrean ulang.',
    steps: [
      'Akui kekeliruan dengan sopan tanpa menyalahkan pemohon.',
      'Verifikasi data asli dan lakukan cetak ulang segera.',
      'Jaga dokumen resmi tetap sah dan rapi.'
    ],
    quickTrick: 'Kesalahan petugas -> minta maaf, koreksi segera, jangan suruh antre ulang.',
    commonMistakes: 'Menghukum warga mengantre dari nol untuk kesalahan pengetikan loket.',
    tip: 'Keabsahan dokumen negara tidak boleh diganti coretan manual.',
    refs: [{ title: 'Maklumat Pelayanan Publik', source: 'UU Pelayanan Publik', note: 'Kompensasi & Koreksi Cepat' }]
  },
  {
    id: 'TKP-P4-005',
    topicSlug: 'pelayanan-publik',
    subtopic: 'Komplain Warga dengan Emosi Tinggi',
    difficulty: 'MEDIUM',
    stem: 'Seorang warga berbicara dengan nada tinggi di loket karena mengira berkasnya sengaja diperlambat, padahal persyaratan tanda tangan RT/RW-nya memang belum lengkap. Respons yang paling profesional dan berorientasi pelayanan adalah...',
    options: {
      A: { text: 'Menyamakan intonasi suara agar ia tahu bahwa kelengkapan berkas adalah tanggung jawabnya sendiri.', score: 1, why: 'Konfrontatif dan memperburuk suasana ruang pelayanan.' },
      B: { text: 'Mengabaikannya sejenak dan memanggil nomor antrean berikutnya supaya ia tenang sendiri.', score: 2, why: 'Mengabaikan pemohon justru memicu eskalasi kemarahan.' },
      C: { text: 'Mendengarkan keluhannya dengan tenang tanpa memotong, meminta maaf atas ketidaknyamanannya, lalu menunjukkan bagian syarat yang belum terpenuhi sambil menjelaskan cara termudah melengkapinya.', score: 5, why: 'Mengelola emosi warga lewat empati aktif lalu memberi panduan solusi konkret.' },
      D: { text: 'Menyerahkan daftar syarat tertulis sambil memintanya membaca sendiri dengan saksama.', score: 3, why: 'Terkesan dingin dan kurang membantu secara komunikatif.' },
      E: { text: 'Menjelaskan bahwa berkas belum lengkap dan memintanya kembali setelah tanda tangan diperoleh.', score: 4, why: 'Benar secara prosedur, namun kurang langkah empati dan panduan cara termudah.' }
    },
    concept: 'De-eskalasi komplain publik dilakukan dengan mendengar aktif, menjaga ketenangan nada bicara, dan memandu solusi kelengkapan.',
    steps: [
      'Dengarkan tanpa defensif atau membalas nada tinggi.',
      'Validasi kekesalannya secara wajar.',
      'Jelaskan kekurangan berkas beserta panduan cepat menyelesaikannya.'
    ],
    quickTrick: 'Dengar tenang + empati + tunjukkan solusi konkret.',
    commonMistakes: 'Terpancing berdebat atau bersikap dingin.',
    tip: 'Dalam layanan publik, kejelasan instruksi lanjutan mengurangi keluhan berulang.',
    refs: [{ title: 'Komunikasi Pelayanan Prima', source: 'LAN RI', note: 'Handling Complaints' }]
  },
  {
    id: 'TKP-P4-006',
    topicSlug: 'pelayanan-publik',
    subtopic: 'Efisiensi Alur & Umpan Balik Masyarakat',
    difficulty: 'EASY',
    stem: 'Selama sebulan bertugas, Anda melihat banyak warga lanjut usia kebingungan membaca papan informasi alur pendaftaran yang berukuran kecil dan berisi banyak istilah teknis. Langkah inisiatif yang sebaiknya Anda usulkan adalah...',
    options: {
      A: { text: 'Mengusulkan pembuatan petunjuk alur berbahasa sederhana dengan huruf besar/infografis di titik masuk serta menyiagakan petugas pemandu bagi kelompok rentan.', score: 5, why: 'Menyentuh akar masalah dengan desain informasi ramah pengguna dan dukungan pemandu.' },
      B: { text: 'Tetap menjawab setiap lansia yang bertanya satu per satu karena memang sudah tugas petugas informasi.', score: 4, why: 'Baik secara sikap individu, namun belum menyelesaikan akar kemacetan informasi secara sistemik.' },
      C: { text: 'Menulis pengingat besar di depan loket agar pemohon muda membantu mendampingi orang tuanya.', score: 3, why: 'Membebankan perbaikan sistem komunikasi instansi ke warga.' },
      D: { text: 'Membiarkan papan informasi tersebut karena formatnya sudah disahkan sejak dua tahun lalu.', score: 1, why: 'Kaku terhadap kebutuhan nyata penerima layanan.' },
      E: { text: 'Meminta petugas keamanan mengarahkan semua lansia langsung ke loket Anda agar cepat ditanya.', score: 2, why: 'Menumpuk antrean di satu titik tanpa memperbaiki kejelasan informasi.' }
    },
    concept: 'Perbaikan berkelanjutan dalam pelayanan publik berarti mengubah sistem informasi agar ramah bagi seluruh lapisan masyarakat.',
    steps: [
      'Identifikasi hambatan pemahaman pengguna layanan (ukuran huruf dan istilah teknis).',
      'Rancang solusi visual sederhana yang mudah dibaca.',
      'Usulkan ke atasan untuk diterapkan bersama petugas pemandu.'
    ],
    quickTrick: 'Cari perbaikan sistemik yang memudahkan pengguna layanan secara luas.',
    commonMistakes: 'Puas sekadar menjawab berulang-ulang tanpa membenahi sumber kebingungan.',
    tip: 'Bahasa layanan yang bebas jargon teknis selalu dinilai positif.',
    refs: [{ title: 'Survei Kepuasan Masyarakat', source: 'KemenPAN-RB', note: 'Kejelasan Informasi Layanan' }]
  },
  {
    id: 'TKP-P4-007',
    topicSlug: 'pelayanan-publik',
    subtopic: 'Layanan Jam Istirahat Bergilir',
    difficulty: 'MEDIUM',
    stem: 'Waktu menunjukkan pukul 12.00 siang saat jam istirahat kantor, sementara masih ada tiga pemohon yang sudah mengantre sejak pagi dari luar kecamatan dan berkasnya tinggal tahap input singkat. Rekan satu loket Anda sedang istirahat terlebih dahulu. Sikap Anda adalah...',
    options: {
      A: { text: 'Langsung menutup loket tepat pukul 12.00 karena jam istirahat adalah hak pegawai sesuai aturan.', score: 2, why: 'Kaku dan mengabaikan pemohon jarak jauh yang tinggal selangkah selesai.' },
      B: { text: 'Menawarkan diri melayani tiga pemohon tersisa dengan sepenuh hati, lalu mengambil waktu istirahat secara bergantian setelah rekan kembali ke loket.', score: 5, why: 'Berorientasi tinggi pada kepuasan masyarakat sambil tetap menjaga mekanisme istirahat bergilir.' },
      C: { text: 'Melayani ketiganya dengan syarat mereka berjanji tidak memberi penilaian buruk jika prosesnya cepat.', score: 1, why: 'Tidak etis menuntut imbalan penilaian untuk pelayanan.' },
      D: { text: 'Memanggil satpam untuk menjelaskan kepada ketiga warga bahwa loket baru buka lagi pukul 13.00.', score: 3, why: 'Memaksa warga jauh menunggu satu jam lagi untuk proses singkat.' },
      E: { text: 'Menyelesaikan satu pemohon saja yang paling tua lalu menutup loket agar sempat makan siang tepat waktu.', score: 4, why: 'Memiliki empati sebagian, tetapi kurang konsisten menuntaskan antrean tersisa.' }
    },
    concept: 'Pelayanan prima di loket tetap dapat menjaga hak istirahat pegawai melalui pengaturan shift bergilir tanpa mengorbankan pemohon yang sudah menunggu.',
    steps: [
      'Prioritaskan penyelesaian tiga antrean yang sudah lama menunggu.',
      'Koordinasikan jam istirahat bergantian dengan rekan kerja.',
      'Jaga ketelitian input meski mendekati jam istirahat.'
    ],
    quickTrick: 'Tuntaskan antrean yang sudah di depan mata dengan sistem giliran istirahat.',
    commonMistakes: 'Bersikap kaku menutup loket tepat menit jam istirahat padahal antrean tinggal sedikit.',
    tip: 'Layanan publik yang baik mengutamakan efektivitas layanan bergilir agar loket tetap responsif.',
    refs: [{ title: 'Etika Pelayan Publik ASN', source: 'BerAKHLAK BKN', note: 'Berorientasi Pelayanan' }]
  },
  {
    id: 'TKP-P4-008',
    topicSlug: 'pelayanan-publik',
    subtopic: 'Transparansi Estimasi Waktu Layanan',
    difficulty: 'EASY',
    stem: 'Seorang pemohon menanyakan kapan surat rekomendasinya selesai karena akan dipakai mendaftar beasiswa yang batas waktunya tiga hari lagi, sedangkan standar operasional resmi menyatakan waktu penyelesaian adalah dua hari kerja. Tindakan Anda yang paling tepat adalah...',
    options: {
      A: { text: 'Menjelaskan standar waktu dua hari kerja dengan jujur, membantu memastikan seluruh syarat sudah valid hari ini agar proses langsung berjalan tanpa revisi, serta memberikan nomor pelacakan resmi.', score: 5, why: 'Memberi kepastian waktu yang realistis sekaligus mengoptimalkan kelengkapan agar tidak tertunda.' },
      B: { text: 'Menjanjikan pasti selesai besok pagi agar pemohon senang meskipun belum memeriksa beban antrean verifikator.', score: 2, why: 'Memberi janji berisiko tinggi menimbulkan kekecewaan jika meleset.' },
      C: { text: 'Menyarankannya mencari surat pengganti lain karena dua hari kerja terlalu mepet dengan tenggat beasiswa.', score: 1, why: 'Mematahkan semangat pemohon padahal secara matematis 2 hari kerja masih sebelum 3 hari.' },
      D: { text: 'Menerima berkas seperti biasa dan mengatakan tunggu saja kabar melalui pesan singkat.', score: 3, why: 'Kurang memberikan kepastian estimasi dan kanal pelacakan.' },
      E: { text: 'Menjelaskan standar dua hari kerja dan meminta ia memantau papan pengumuman pada hari kedua sore.', score: 4, why: 'Informatif, namun belum memvalidasi kelengkapan sejak awal agar aman dari penundaan revisi.' }
    },
    concept: 'Kepastian layanan tidak berarti mengumbar janji manis, melainkan jujur atas SOP sambil meminimalkan risiko penundaan melalui verifikasi awal yang cermat.',
    steps: [
      'Sampaikan durasi SOP secara jujur (2 hari kerja).',
      'Cek ketuntasan berkas di tempat agar tidak kembali untuk revisi.',
      'Berikan kanal pelacakan progres yang jelas.'
    ],
    quickTrick: 'Jujur terhadap SOP + maksimalkan ketepatan di hari pertama.',
    commonMistakes: 'Mengobral janji di luar SOP atau menolak berkas sebelum waktunya habis.',
    tip: 'Ketepatan janji waktu adalah kunci kepercayaan publik terhadap birokrasi.',
    refs: [{ title: 'Standar Pelayanan Publik', source: 'UU 25/2009', note: 'Kepastian Jangka Waktu' }]
  },

  // ================= JEJARING KERJA (8) =================
  {
    id: 'TKP-P4-009',
    topicSlug: 'jejaring-kerja',
    subtopic: 'Koordinasi Lintas Seksi',
    difficulty: 'MEDIUM',
    stem: 'Dalam menyusun laporan terpadu triwulanan, tim Anda membutuhkan data serapan anggaran dari Seksi Keuangan dan data capaian fisik dari Seksi Operasional. Dua hari menjelang tenggat, data dari kedua seksi tersebut belum kunjung dikirim meski email permintaan sudah dilayangkan pekan lalu. Tindakan Anda adalah...',
    options: {
      A: { text: 'Menghubungi langsung penanggung jawab di kedua seksi secara persuasif, menanyakan kendala penyusunan datanya, serta menawarkan bantuan sinkronisasi format agar data dapat segera digabungkan tepat waktu.', score: 5, why: 'Proaktif membangun komunikasi dua arah, mencari tahu hambatan nyata, dan memberi bantuan teknis.' },
      B: { text: 'Mengirim email pengingat kedua bernada tegas dengan tembusan langsung kepada pimpinan instansi.', score: 2, why: 'Langsung mengeskalasi sebelum berkomunikasi langsung dapat merusak hubungan kerja lintas seksi.' },
      C: { text: 'Menunggu hingga satu hari sebelum tenggat karena meyakini mereka juga sedang sibuk.', score: 1, why: 'Berisiko tinggi menggagalkan pelaporan tepat waktu.' },
      D: { text: 'Mengirimkan pesan singkat menanyakan progres sambil menjelaskan kembali pentingnya tenggat laporan triwulanan.', score: 4, why: 'Koordinatif, tetapi belum menawarkan bantuan konkret untuk mempercepat pengumpulan.' },
      E: { text: 'Menyerahkan laporan dengan kolom kosong bertuliskan "Data Belum Diterima dari Seksi Terkait".', score: 3, why: 'Melempar tanggung jawab tanpa upaya kolaborasi penyelesaian.' }
    },
    concept: 'Jejaring kerja lintas unit membutuhkan komunikasi personal yang empatik dan kolaboratif saat menghadapi tenggat bersama, bukan sekadar instruksi satu arah lewat email.',
    steps: [
      'Jalin kontak langsung (telepon/tatap muka) dengan PIC terkait.',
      'Identifikasi hambatan teknis atau beban yang mereka hadapi.',
      'Tawarkan kemudahan format atau bantuan sinkronisasi bersama.'
    ],
    quickTrick: 'Komunikasi langsung + tanyakan kendala + tawarkan bantuan kolaborasi.',
    commonMistakes: 'Langsung melapor/CC atasan sebelum mencoba koordinasi baik-baik.',
    tip: 'Prinsip Kolaboratif BerAKHLAK mengedepankan sinergi penyelesaian hambatan bersama.',
    refs: [{ title: 'Panduan Perilaku Kolaboratif ASN', source: 'SE MenPAN-RB BerAKHLAK', note: 'Sinergi Lintas Unit' }]
  },
  {
    id: 'TKP-P4-010',
    topicSlug: 'jejaring-kerja',
    subtopic: 'Menjaga Relasi dengan Mitra Eksternal',
    difficulty: 'MEDIUM',
    stem: 'Unit Anda bekerja sama dengan lembaga pelatihan daerah untuk menyelenggarakan bimtek bagi UMKM. Menjelang hari pelaksanaan, mitra mengeluhkan adanya miskomunikasi mengenai pembagian pembiayaan konsumsi peserta yang belum tercantum rinci di notula awal. Sikap Anda yang paling konstruktif adalah...',
    options: {
      A: { text: 'Mengajak perwakilan mitra duduk bersama meninjau ulang dokumen kesepakatan awal secara terbuka, mengklarifikasi ruang lingkup masing-masing dengan kepala dingin, dan menyepakati solusi pembiayaan yang adil sesuai aturan anggaran.', score: 5, why: 'Menjaga kemitraan jangka panjang lewat musyawarah objektif yang tetap patuh pada aturan anggaran.' },
      B: { text: 'Menegaskan bahwa seluruh konsumsi adalah tanggung jawab mitra karena unit Anda sudah menyediakan narasumber dan aula.', score: 2, why: 'Kaku dan berpotensi memutus kepercayaan mitra.' },
      C: { text: 'Membayar semua biaya konsumsi dari kas kegiatan unit Anda tanpa dibahas lagi supaya masalah cepat selesai.', score: 3, why: 'Berisiko menyalahi pos anggaran bila tidak diatur resmi dan membiarkan kesepakatan tetap kabur.' },
      D: { text: 'Meminta atasan menghubungi pimpinan lembaga mitra untuk menyelesaikan perdebatan tanpa melibatkan tim teknis.', score: 4, why: 'Mengandalkan eskalasi atasan padahal tim teknis bisa mengklarifikasi lebih dulu.' },
      E: { text: 'Membatalkan kerja sama dengan lembaga pelatihan tersebut karena dianggap kurang teliti membaca undangan.', score: 1, why: 'Reaktif dan merusak manfaat program bagi UMKM.' }
    },
    concept: 'Konflik dengan mitra eksternal diselesaikan lewat klarifikasi terbuka berbasis dokumen kesepakatan untuk mencari jalan tengah yang sah secara regulasi.',
    steps: [
      'Buka kembali notula atau perjanjian awal sebagai rujukan objektif.',
      'Ajak diskusi tenang tanpa saling menyalahkan.',
      'Tuangkan kesepakatan tambahan secara tertulis dan patuh regulasi.'
    ],
    quickTrick: 'Musyawarah berbasis dokumen kesepakatan + solusi menang-menang yang legal.',
    commonMistakes: 'Memutus sepihak atau membebankan anggaran tanpa kejelasan akuntabilitas.',
    tip: 'Relasi kemitraan yang sehat selalu berdiri di atas kejelasan kesepakatan tertulis.',
    refs: [{ title: 'Kemitraan Pemerintah dan Lembaga', source: 'LAN RI', note: 'Manajemen Jejaring Kerja' }]
  },
  {
    id: 'TKP-P4-011',
    topicSlug: 'jejaring-kerja',
    subtopic: 'Mengintegrasikan Anggota Baru dalam Tim',
    difficulty: 'EASY',
    stem: 'Seorang CPNS baru ditempatkan ke tim kerja Anda pada saat beban proyek sedang memuncak. Ia tampak canggung dan belum memahami alur aplikasi internal sehingga beberapa kali bertanya hal dasar. Sikap Anda sebagai rekan senior di tim adalah...',
    options: {
      A: { text: 'Menyambutnya ramah, meluangkan waktu singkat untuk mengenalkan alur kerja utama dan kontak anggota tim, serta memberikan panduan tertulis ringkas agar ia cepat mandiri dan menyatu.', score: 5, why: 'Membangun iklim tim inklusif sekaligus memberi bekal kemandirian jangka panjang.' },
      B: { text: 'Menjawab pertanyaannya singkat setiap kali ia datang agar Anda tetap bisa fokus pada target pribadi.', score: 3, why: 'Kurang membantu percepatan adaptasi dan membuat rekan baru sungkan bertanya.' },
      C: { text: 'Menyarankannya membaca seluruh buku pedoman aplikasi dari halaman awal sebelum bertanya lagi.', score: 2, why: 'Membuat anggota baru terisolasi saat tim sedang butuh sinergi cepat.' },
      D: { text: 'Mengambil alih semua tugasnya terlebih dahulu sampai puncak proyek selesai baru mengajarinya.', score: 1, why: 'Menghambat pembelajaran dan menambah beban tim secara tidak sehat.' },
      E: { text: 'Menunjuk salah satu rekan magang untuk menemaninya sementara Anda tetap mengawasi dari jauh.', score: 4, why: 'Cukup membantu, namun keterlibatan langsung rekan setim inti membangun kedekatan kerja lebih baik.' }
    },
    concept: 'Kekuatan jejaring internal dimulai dari penerimaan aktif terhadap anggota baru melalui pendampingan terstruktur.',
    steps: [
      'Bangun rasa aman psikologis dengan sambutan ramah.',
      'Berikan peta alur kerja inti dan tautkan dengan anggota tim lain.',
      'Lengkapi dengan panduan ringkas agar cepat mandiri.'
    ],
    quickTrick: 'Sambut ramah + bimbing inti kerja + kenalkan pada tim.',
    commonMistakes: 'Menghindari pendampingan dengan dalih sibuk atau mengambil alih tugasnya.',
    tip: 'Investasi pembimbingan singkat di awal selalu mempercepat kinerja kolektif.',
    refs: [{ title: 'Kolaborasi & Pembinaan Tim', source: 'Modul ASN BerAKHLAK', note: 'Onboarding Rekan Baru' }]
  },
  {
    id: 'TKP-P4-012',
    topicSlug: 'jejaring-kerja',
    subtopic: 'Perbedaan Pendapat dalam Forum Rapat',
    difficulty: 'MEDIUM',
    stem: 'Dalam rapat tim perumusan program kerja, usulan metode sosialisasi yang Anda susun dikritik keras oleh rekan dari divisi lain karena dinilai terlalu boros biaya dan kurang menjangkau warga desa. Sikap yang paling bijak dalam forum tersebut adalah...',
    options: {
      A: { text: 'Menghargai masukannya dengan kepala dingin, menanyakan data pendukung pandangannya, lalu mengajak seluruh peserta rapat memadukan keunggulan ide Anda dan idenya demi efektivitas program.', score: 5, why: 'Mengubah kritik menjadi bahan perbaikan kolektif dan menjaga sinergi forum.' },
      B: { text: 'Mempertahankan usulan awal mati-matian karena Anda sudah menyusunnya selama satu minggu penuh.', score: 1, why: 'Ego sektoral dan defensif terhadap masukan konstruktif.' },
      C: { text: 'Langsung menarik seluruh usulan Anda dari rapat agar tidak memperpanjang perdebatan.', score: 2, why: 'Pasif-agresif dan membuang potensi gagasan baik di dalamnya.' },
      D: { text: 'Menyerahkan keputusan sepenuhnya kepada pimpinan rapat untuk memilih salah satu usulan.', score: 4, why: 'Menjaga ketertiban rapat, tetapi belum berupaya mencari sintesis gagasan terbaik bersama.' },
      E: { text: 'Menerima kritiknya sambil membela bahwa biaya besar memang wajar jika ingin hasil maksimal.', score: 3, why: 'Masih menunjukkan pembelaan defensif tanpa menjembatani jangkauan warga desa.' }
    },
    concept: 'Kolaborasi produktif melihat kritik sebagai informasi tambahan untuk menyempurnakan solusi bersama, bukan serangan personal.',
    steps: [
      'Terima kritik tanpa emosi.',
      'Gali pertimbangan objektif di balik kritik tersebut.',
      'Sintesis kedua gagasan untuk hasil program yang paling berdampak.'
    ],
    quickTrick: 'Apresiasi masukan + gali data + padukan ide terbaik bersama.',
    commonMistakes: 'Menarik diri atau bersikeras mempertahankan ego ide.',
    tip: 'Dalam TKP Jejaring Kerja, "memadukan keunggulan" lebih unggul daripada sekadar "menyerahkan voting/pimpinan".',
    refs: [{ title: 'Komunikasi Asertif dan Kolaboratif', source: 'LAN RI', note: 'Sintesis Gagasan Tim' }]
  },
  {
    id: 'TKP-P4-013',
    topicSlug: 'jejaring-kerja',
    subtopic: 'Berbagi Pengetahuan Antarpegawai',
    difficulty: 'EASY',
    stem: 'Anda baru saja mengikuti pelatihan nasional mengenai teknik pengolahan data visual dan mendapat banyak template analisis yang sangat mempercepat pekerjaan. Sementara itu, rekan-rekan di bidang lain di kantor Anda juga sering kesulitan mengolah data sejenis. Apa yang sebaiknya Anda lakukan?',
    options: {
      A: { text: 'Mengusulkan sesi berbagi pengetahuan (knowledge sharing) internal yang ringkas bagi rekan lintas bidang serta mengunggah template dan panduannya ke folder bersama kantor.', score: 5, why: 'Menyebarkan manfaat kompetensi ke seluruh jejaring organisasi secara terstruktur.' },
      B: { text: 'Menggunakan template tersebut untuk pekerjaan tim sendiri dulu; jika ada yang meminta barulah dibagikan.', score: 3, why: 'Kurang inisiatif berbagi manfaat secara luas.' },
      C: { text: 'Menyimpan template hanya di komputer pribadi sebagai keunggulan kompetitif diri sendiri saat penilaian kinerja.', score: 1, why: 'Individualistis dan menghambat kemajuan tim.' },
      D: { text: 'Mengirimkan file presentasi mentah pelatihan ke grup percakapan kantor tanpa penjelasan cara pakainya.', score: 4, why: 'Sudah ada niat berbagi, namun tanpa sesi pendampingan ringkas efektivitas adopsinya lebih rendah.' },
      E: { text: 'Menunggu instruksi resmi dari bagian kepegawaian jika memang wajib melakukan diseminasi.', score: 2, why: 'Pasif menunggu perintah meski tahu rekan kerja membutuhkan.' }
    },
    concept: 'Berbagi pengetahuan (knowledge sharing) adalah wujud nyata perilaku Kolaboratif dan Kompeten untuk menaikkan kapasitas bersama.',
    steps: [
      'Kemaskan materi dan template dalam bentuk praktis siap pakai.',
      'Inisiasi sesi berbagi singkat lintas unit.',
      'Sediakan repositori bersama agar dapat diakses kapan saja.'
    ],
    quickTrick: 'Bagikan ilmu secara aktif melalui forum ringkas + akses bahan bersama.',
    commonMistakes: 'Menahan ilmu sebagai nilai tawar pribadi.',
    tip: 'Organisasi pembelajar tumbuh saat setiap individu berinisiatif mendiseminasikan hasil diklat.',
    refs: [{ title: 'ASN Pembelajar & BerAKHLAK', source: 'LAN RI', note: 'Diseminasi Pengetahuan' }]
  },
  {
    id: 'TKP-P4-014',
    topicSlug: 'jejaring-kerja',
    subtopic: 'Membangun Jejaring Komunitas Daerah',
    difficulty: 'MEDIUM',
    stem: 'Dinas tempat Anda bekerja meluncurkan program desa sadar kebersihan, tetapi partisipasi pemuda desa masih rendah karena mereka merasa program datang secara sepihak dari pemerintah. Strategi jejaring kerja terbaik untuk menggerakkan keterlibatan mereka adalah...',
    options: {
      A: { text: 'Mengajak pengurus karang taruna dan pegiat lingkungan setempat berdialog sejak tahap perencanaan kegiatan agar mereka ikut memiliki peran dan menentukan format aksi yang sesuai kebutuhan desa.', score: 5, why: 'Pendekatan partisipatif dari hulu menumbuhkan rasa memiliki dan keberlanjutan jejaring komunitas.' },
      B: { text: 'Mengirimkan surat edaran wajib hadir dari kepala dinas kepada seluruh kepala desa agar mewajibkan warganya ikut.', score: 2, why: 'Pendekatan instruktif sering menghasilkan kepatuhan semu dan penolakan pasif.' },
      C: { text: 'Memberikan kaus dan konsumsi gratis di hari peluncuran agar banyak pemuda yang datang meramaikan acara.', score: 3, why: 'Menghasilkan partisipasi sesaat, tidak membangun keterlibatan berkelanjutan.' },
      D: { text: 'Menggelar sosialisasi satu arah di balai desa tentang pentingnya kebersihan menurut peraturan daerah.', score: 4, why: 'Informatif, namun masih berpola satu arah dan kurang melibatkan komunitas sebagai subjek.' },
      E: { text: 'Menjalankan program hanya bersama petugas kebersihan dinas supaya tidak repot mengoordinasikan warga.', score: 1, why: 'Menghilangkan esensi pemberdayaan masyarakat dan jejaring sosial.' }
    },
    concept: 'Kemitraan pemerintah-masyarakat berhasil bila komunitas diajak berdialog sebagai mitra sejajar sejak perencanaan.',
    steps: [
      'Petakan tokoh pemuda dan pegiat lokal yang kredibel.',
      'Libatkan mereka dalam merancang aksi yang relevan.',
      'Berikan peran nyata agar tumbuh rasa memiliki program.'
    ],
    quickTrick: 'Libatkan komunitas lokal melalui dialog partisipatif sejak tahap awal.',
    commonMistakes: 'Menggunakan paksaan administratif atau sekadar sosialisasi satu arah.',
    tip: 'Kolaborasi eksternal menekankan kesetaraan peran, bukan sekadar instruksi.',
    refs: [{ title: 'Tata Kelola Kolaboratif (Collaborative Governance)', source: 'Modul Jejaring Kerja', note: 'Partisipasi Komunitas' }]
  },
  {
    id: 'TKP-P4-015',
    topicSlug: 'jejaring-kerja',
    subtopic: 'Rekan Satu Tim Kewalahan Beban Kerja',
    difficulty: 'EASY',
    stem: 'Tugas pribadi Anda pekan ini sudah selesai lebih awal dan telah diperiksa atasan. Anda melihat seorang rekan satu ruangan tampak sangat kelelahan mengejar tenggat rekonsiliasi data yang juga berdampak pada target kinerja unit Anda. Sikap yang paling tepat adalah...',
    options: {
      A: { text: 'Mendekatinya secara santun, menanyakan bagian pekerjaan mana yang bisa dibantu atau diperiksa ulang bersama agar target unit tercapai tepat waktu.', score: 5, why: 'Solidaritas tim yang aktif dan tetap menjaga komunikasi yang menghargai peran rekan.' },
      B: { text: 'Mengingatkannya agar manajemen waktunya diperbaiki supaya tidak menumpuk di akhir pekan.', score: 2, why: 'Terkesan menggurui saat rekan sedang tertekan.' },
      C: { text: 'Menikmati waktu luang di meja karena pekerjaan Anda sendiri sudah beres sesuai porsi SKP.', score: 1, why: 'Individualistis dan mengabaikan target bersama unit.' },
      D: { text: 'Melaporkan ke atasan bahwa rekan tersebut kemungkinan terlambat menyelesaikan rekonsiliasi data.', score: 3, why: 'Hanya melapor tanpa mengulurkan tangan membantu padahal memiliki waktu luang.' },
      E: { text: 'Mengirimkan makanan ringan atau kopi ke mejanya agar ia lebih bersemangat bekerja.', score: 4, why: 'Menunjukkan kepedulian emosional yang baik, namun bantuan konkret pada pekerjaan lebih berdampak bagi target unit.' }
    },
    concept: 'Dalam kerja tim, keberhasilan unit berada di atas selesainya porsi individu; kepedulian diwujudkan lewat dukungan kerja nyata.',
    steps: [
      'Tawarkan bantuan dengan cara yang tidak merendahkan kemampuan rekan.',
      'Ambil porsi pendukung yang mempercepat penyelesaian tanpa mengganggu alurnya.',
      'Jaga ketepatan tenggat unit bersama.'
    ],
    quickTrick: 'Tugas sendiri beres -> tawarkan bantuan konkret untuk meringankan rekan demi target tim.',
    commonMistakes: 'Bersikap cuek atas dasar "bukan jobdesk saya".',
    tip: 'Empati kerja terbaik selalu memadukan sikap santun dan aksi nyata.',
    refs: [{ title: 'Kerja Sama Tim BerAKHLAK', source: 'BKN', note: 'Sinergi Pencapaian Target Unit' }]
  },
  {
    id: 'TKP-P4-016',
    topicSlug: 'jejaring-kerja',
    subtopic: 'Penghubung Komunikasi Dua Unit Berselisih',
    difficulty: 'HARD',
    stem: 'Anda ditugaskan menjadi penghubung (liaison) antara tim pengembang aplikasi internal dan tim admin keuangan. Kedua pihak saling menyalahkan melalui grup percakapan karena fitur pencatatan transaksi kerap gagal sinkron dengan format pelaporan. Tindakan paling efektif Anda adalah...',
    options: {
      A: { text: 'Memindahkan perdebatan dari grup chat ke pertemuan teknis bersama yang fokus memetakan contoh kasus gagal sinkron, menyepakati format data bersama, dan menuliskan daftar tindak lanjut dengan tenggat jelas.', score: 5, why: 'Mengubah konflik teks menjadi problem solving terstruktur yang menyentuh akar teknis dan kesepakatan jadwal.' },
      B: { text: 'Menyuruh kedua pihak diam di grup percakapan agar tidak dilihat oleh pejabat struktural.', score: 2, why: 'Hanya meredam di permukaan tanpa menyelesaikan masalah sinkronisasi.' },
      C: { text: 'Membela tim admin keuangan karena format pelaporan negara sifatnya wajib diikuti pengembang.', score: 3, why: 'Berpihak sebelum membedah kendala teknis kedua sisi dapat memicu resistensi pengembang.' },
      D: { text: 'Mencatat semua pesan perdebatan di grup lalu melaporkannya kepada kepala kantor untuk menentukan siapa yang salah.', score: 1, why: 'Mencari siapa yang salah memperdalam perpecahan antarunit.' },
      E: { text: 'Meminta kedua kepala tim berbicara empat mata sambil menunda diskusi teknis anggota.', score: 4, why: 'Mengurangi tensi grup, tetapi peran penghubung teknis seharusnya langsung memfasilitasi pemetaan masalah konkret.' }
    },
    concept: 'Peran penghubung (liaison) adalah menjembatani kesalahpahaman antardisiplin kerja menuju pemetaan solusi objektif, bukan mencari pihak yang salah.',
    steps: [
      'Hentikan saling menyalahkan di ruang percakapan terbuka.',
      'Pertemukan kedua tim dengan fokus pada data dan sampel eror nyata.',
      'Susun kesepakatan spesifikasi dan tenggat perbaikan bersama.'
    ],
    quickTrick: 'Alihkan konflik saling menyalahkan menjadi pertemuan teknis berbasis data & tindak lanjut.',
    commonMistakes: 'Berpihak atau melaporkan kesalahan sebelum memfasilitasi penyelesaian.',
    tip: 'Fokus pada "apa yang harus diperbaiki", bukan "siapa yang salah".',
    refs: [{ title: 'Resolusi Konflik Lintas Tim', source: 'Modul Jejaring Kerja', note: 'Fasilitasi Teknis' }]
  },

  // ================= SOSIAL BUDAYA (8) =================
  {
    id: 'TKP-P4-017',
    topicSlug: 'sosial-budaya',
    subtopic: 'Adaptasi Penugasan di Daerah Adat Baru',
    difficulty: 'MEDIUM',
    stem: 'Anda ditempatkan di daerah baru yang masyarakatnya sangat menjunjung tinggi tata krama adat dan penggunaan bahasa daerah setempat dalam percakapan sehari-hari, yang belum Anda kuasai. Sikap paling tepat untuk membangun penerimaan sosial adalah...',
    options: {
      A: { text: 'Mempelajari kosakata dasar dan tata krama adat setempat secara bertahap sambil tetap menyapa hangat dalam bahasa Indonesia yang santun ketika bertugas.', score: 5, why: 'Menghormati budaya lokal secara aktif sekaligus menjaga kejelasan komunikasi layanan resmi.' },
      B: { text: 'Mewajibkan warga berbicara bahasa Indonesia baku kapan pun berinteraksi dengan Anda sebagai bentuk wibawa ASN.', score: 2, why: 'Kaku dan terkesan memandang rendah bahasa ibu masyarakat setempat.' },
      C: { text: 'Menghindari interaksi di luar jam kerja dengan warga sekitar agar tidak melakukan kesalahan tata krama.', score: 1, why: 'Menutup diri justru memperlebar jarak sosial dengan masyarakat.' },
      D: { text: 'Selalu meminta rekan asli daerah mendampingi ke mana pun Anda pergi agar beliau yang berbicara.', score: 3, why: 'Terlalu bergantung tanpa kemauan belajar beradaptasi.' },
      E: { text: 'Mempelajari kebiasaan adat lewat bacaan di internet tanpa perlu mempraktikkannya jika tidak terpaksa.', score: 4, why: 'Ada keinginan memahami, tetapi kurang keterlibatan nyata bersama warga.' }
    },
    concept: 'Perekat bangsa dan kepekaan sosial budaya menuntut ASN mau belajar kearifan lokal secara rendah hati tanpa meninggalkan standar bahasa layanan resmi.',
    steps: [
      'Tunjukkan minat tulus mempelajari sapaan dan norma sopan santun setempat.',
      'Hormati adat istiadat dalam pergaulan sehari-hari.',
      'Gunakan bahasa yang jelas dan ramah agar pelayanan tetap akurat.'
    ],
    quickTrick: 'Aktif belajar budaya/bahasa lokal + tetap komunikatif dan menghargai masyarakat.',
    commonMistakes: 'Mengisolasi diri karena takut salah atau bersikap arogan terhadap bahasa daerah.',
    tip: 'Semboyan "di mana bumi dipijak, di situ langit dijunjung" sangat kuat dalam soal Sosial Budaya.',
    refs: [{ title: 'ASN sebagai Perekat Bangsa', source: 'UU ASN & BKN', note: 'Adaptasi Budaya Lokal' }]
  },
  {
    id: 'TKP-P4-018',
    topicSlug: 'sosial-budaya',
    subtopic: 'Toleransi Jam Ibadah di Tim Multikultural',
    difficulty: 'EASY',
    stem: 'Saat menyusun jadwal rapat evaluasi bulanan yang panjang bersama tim lintas agama, Anda menyadari rencana jam rapat beririsan dengan waktu ibadah penting salah satu anggota tim. Tindakan terbaik Anda adalah...',
    options: {
      A: { text: 'Menyesuaikan jadwal rapat atau menyisipkan jeda istirahat ibadah yang memadai secara terbuka agar seluruh anggota tim dapat beribadah dengan tenang dan tetap mengikuti rapat secara penuh.', score: 5, why: 'Menghormati kebebasan beribadah sekaligus menjaga partisipasi adil seluruh anggota tim.' },
      B: { text: 'Tetap memulai rapat sesuai rencana sambil mengizinkan yang bersangkutan menyusul membaca notula saja.', score: 3, why: 'Mengurangi hak partisipasi anggota tersebut dalam diskusi langsung.' },
      C: { text: 'Memintanya beribadah lebih cepat atau digabung waktunya karena rapat ini bersifat penting bagi kantor.', score: 1, why: 'Melanggar prinsip toleransi beragama.' },
      D: { text: 'Menunda rapat ke pekan depan seluruhnya tanpa berkonsultasi dengan anggota tim lain.', score: 2, why: 'Mengorbankan agenda tim padahal pengaturan jam atau jeda di hari sama memungkinkan.' },
      E: { text: 'Mengizinkannya tidak menghadiri rapat pada sesi tersebut asal sudah mengirim laporan tertulis sebelumnya.', score: 4, why: 'Cukup menghormati ibadah, namun pengaturan jeda memungkinkan keterlibatan penuh semua anggota.' }
    },
    concept: 'Perilaku Harmonis dalam keberagaman agama diwujudkan melalui akomodasi jadwal yang adil tanpa meminggirkan partisipasi siapa pun.',
    steps: [
      'Periksa jadwal ibadah seluruh anggota tim sebelum mengunci jam rapat.',
      'Geser jam atau beri jeda waktu yang layak.',
      'Pastikan seluruh anggota dapat berkontribusi utuh.'
    ],
    quickTrick: 'Atur jadwal/jeda secara inklusif agar semua bisa beribadah dan ikut rapat utuh.',
    commonMistakes: 'Mengorbankan waktu ibadah atau menyisihkan anggota dari forum rapat.',
    tip: 'Harmonis berarti saling peduli dan menghargai perbedaan keyakinan di tempat kerja.',
    refs: [{ title: 'Nilai Harmonis ASN BerAKHLAK', source: 'KemenPAN-RB', note: 'Toleransi di Lingkungan Kerja' }]
  },
  {
    id: 'TKP-P4-019',
    topicSlug: 'sosial-budaya',
    subtopic: 'Konflik Persepsi Lintas Generasi',
    difficulty: 'MEDIUM',
    stem: 'Di kantor Anda terjadi ketegangan kecil antara pegawai generasi muda yang menyukai komunikasi cepat lewat pesan instan dan pegawai senior yang lebih mengutamakan pembicaraan tatap muka atau surat resmi sehingga muncul anggapan "kurang sopan". Sikap Anda untuk menjembatani perbedaan ini adalah...',
    options: {
      A: { text: 'Mengajak tim menyepakati etika komunikasi lintas generasi: pesan instan dipakai dengan sapaan santun untuk koordinasi cepat, sementara hal strategis tetap dikonsultasikan langsung atau lewat nota resmi.', score: 5, why: 'Menghormati nilai kesantunan senior sekaligus mempertahankan efisiensi kerja modern.' },
      B: { text: 'Memihak pegawai muda karena zaman sekarang seluruh instansi dituntut serba digital dan cepat.', score: 2, why: 'Mengabaikan nilai hormat sosial dan memicu jurang antargenerasi.' },
      C: { text: 'Meminta pegawai muda berhenti memakai pesan instan sepenuhnya saat berkomunikasi dengan senior.', score: 3, why: 'Mengorbankan kecepatan koordinasi sehari-hari.' },
      D: { text: 'Mengimbau senior agar tidak terlalu sensitif dengan gaya bahasa anak muda.', score: 1, why: 'Menyalahkan pihak senior dan tidak membangun kesepahaman.' },
      E: { text: 'Menghindari berkomunikasi dengan pegawai senior melalui chat dan hanya mengirim email.', score: 4, why: 'Menyesuaikan diri secara individu, tetapi belum mendamaikan pola kerja seluruh tim.' }
    },
    concept: 'Keberagaman di tempat kerja juga mencakup keragaman generasi; solusinya adalah memadukan kesantunan relasional dan kecepatan komunikasi.',
    steps: [
      'Pahami perspektif dan kebutuhan masing-masing generasi.',
      'Rumuskan kesepakatan etiket komunikasi bersama.',
      'Dorong empati dan saling menghargai dalam tim.'
    ],
    quickTrick: 'Jembatani nilai sopan santun dengan efektivitas komunikasi melalui kesepakatan tim.',
    commonMistakes: 'Memihak satu generasi dan menyalahkan generasi lainnya.',
    tip: 'Kepekaan budaya mencakup etika antargenerasi di ruang kerja.',
    refs: [{ title: 'Keragaman Generasi di Birokrasi', source: 'LAN RI', note: 'Etika Komunikasi Kerja' }]
  },
  {
    id: 'TKP-P4-020',
    topicSlug: 'sosial-budaya',
    subtopic: 'Mencegah Candaan Bernuansa SARA',
    difficulty: 'MEDIUM',
    stem: 'Saat jam istirahat di ruang bersama kantor, beberapa rekan melontarkan candaan yang menyinggung logat dan stereotip suku salah satu pegawai lain. Rekan yang menjadi bahan candaan hanya tersenyum kaku dan tampak tidak nyaman. Sikap Anda adalah...',
    options: {
      A: { text: 'Mengingatkan secara santun namun tegas bahwa candaan soal suku atau logat bisa melukai perasaan rekan kerja, lalu mengalihkan obrolan ke topik netral yang hangat bagi semua.', score: 5, why: 'Menghentikan perilaku diskriminatif secara elegan tanpa membuat suasana meledak, sambil melindungi martabat rekan.' },
      B: { text: 'Ikut tertawa ringan agar tidak merusak suasana santai jam istirahat.', score: 1, why: 'Menormalisasi perundungan berbasis identitas suku.' },
      C: { text: 'Diam saja karena yang bersangkutan sendiri terlihat tersenyum dan tidak protes.', score: 2, why: 'Mengabaikan ketidaknyamanan terselubung dan membiarkan stereotip berulang.' },
      D: { text: 'Menemui korban secara diam-diam setelah istirahat untuk menghiburnya agar tidak mengambil hati.', score: 4, why: 'Berempati kepada korban, namun gagal mengedukasi pelaku di tempat kejadian.' },
      E: { text: 'Membentak rekan yang bercanda di depan banyak orang agar mereka jera dan tidak mengulangi.', score: 3, why: 'Niat membela benar, tetapi cara membentak memicu konflik terbuka yang tidak perlu.' }
    },
    concept: 'Lingkungan kerja bebas diskriminasi membutuhkan keberanian mengoreksi stereotip SARA dengan cara yang santun, tegas, dan menjaga kehormatan bersama.',
    steps: [
      'Peka terhadap ekspresi ketidaknyamanan korban.',
      'Tegur secara tenang namun jelas di tempat agar batas etika dipahami.',
      'Pulihkan suasana dengan topik percakapan yang inklusif.'
    ],
    quickTrick: 'Tegur santun tapi tegas di lokasi + alihkan ke suasana inklusif.',
    commonMistakes: 'Diam membiarkan atas alasan "cuma bercanda" atau justru mengamuk tidak terkendali.',
    tip: 'Toleransi aktif berarti berani menjaga ruang kerja tetap aman bagi semua latar belakang.',
    refs: [{ title: 'Pencegahan Diskriminasi di Tempat Kerja', source: 'KemenPAN-RB', note: 'Harmonis & Etika ASN' }]
  },
  {
    id: 'TKP-P4-021',
    topicSlug: 'sosial-budaya',
    subtopic: 'Gotong Royong Lingkungan Tempat Tinggal',
    difficulty: 'EASY',
    stem: 'Pengurus RT tempat Anda tinggal mengadakan kerja bakti membersihkan saluran air menjelang musim hujan pada hari Minggu pagi. Minggu itu Anda berencana beristirahat penuh setelah lembur di kantor pada hari Jumat. Sikap terbaik Anda adalah...',
    options: {
      A: { text: 'Tetap meluangkan waktu ikut kerja bakti bersama warga dengan tenaga semampunya sebagai wujud tanggung jawab sosial dan kebersamaan di lingkungan.', score: 5, why: 'Menjaga keterlibatan sosial langsung dalam gotong royong meski punya alasan lelah.' },
      B: { text: 'Mengirimkan makanan atau minuman untuk warga lalu beristirahat di dalam rumah sepanjang hari.', score: 4, why: 'Menunjukkan kepedulian dan dukungan materi, tetapi partisipasi kehadiran langsung lebih kuat nilainya.' },
      C: { text: 'Menutup pagar rumah lebih rapat dan mematikan ponsel agar tidak diminta keluar oleh ketua RT.', score: 1, why: 'Apatis dan menjauh dari kehidupan bermasyarakat.' },
      D: { text: 'Menyewa petugas lepas untuk menggantikan peran Anda sambil meminta izin tidak hadir.', score: 3, why: 'Menyumbang tenaga pengganti namun kehilangan esensi silaturahmi warga.' },
      E: { text: 'Meminta izin tidak ikut karena sedang memulihkan kondisi untuk bekerja hari Senin.', score: 2, why: 'Mengutamakan kenyamanan pribadi di atas kepentingan lingkungan bersama.' }
    },
    concept: 'Keteladanan sosial ASN tercermin dalam partisipasi aktif kegiatan gotong royong dan kebersamaan di masyarakat.',
    steps: [
      'Atur waktu istirahat secara seimbang (misalnya ikut 1–2 jam pagi lalu istirahat).',
      'Berbaur bersama warga membersihkan fasilitas umum.',
      'Jaga silaturahmi dan citra ASN yang membumi.'
    ],
    quickTrick: 'Utamakan hadir dan terlibat langsung dalam kerja bakti/kegiatan sosial warga.',
    commonMistakes: 'Menggantikan kehadiran sosial sepenuhnya dengan uang atau menutup diri.',
    tip: 'Keterlibatan langsung di lingkungan adalah indikator kuat kepekaan sosial budaya.',
    refs: [{ title: 'Peran Sosial ASN di Masyarakat', source: 'Modul Sosial Budaya', note: 'Gotong Royong' }]
  },
  {
    id: 'TKP-P4-022',
    topicSlug: 'sosial-budaya',
    subtopic: 'Empati terhadap Warga Terdampak Bencana',
    difficulty: 'EASY',
    stem: 'Wilayah kecamatan sebelah mengalami banjir bandang sehingga banyak warga mengungsi dan kantor Anda menggalang bantuan kemanusiaan sukarela. Padahal bulan ini pengeluaran keluarga Anda cukup ketat. Sikap yang paling bijak adalah...',
    options: {
      A: { text: 'Tetap berpartisipasi menyumbang sesuai kemampuan tanpa memaksakan diri serta menawarkan tenaga membantu pengemasan atau pendistribusian bantuan.', score: 5, why: 'Menyeimbangkan empati nyata (donasi semampunya + tenaga) dengan kewajaran ekonomi pribadi.' },
      B: { text: 'Tidak menyumbang sama sekali karena merasa kondisi keuangan sendiri juga sedang tidak lapang.', score: 1, why: 'Ketiadaan empati dan kontribusi padahal bantuan bisa berupa tenaga atau barang layak pakai.' },
      C: { text: 'Berutang kepada rekan kerja agar dapat memberi sumbangan uang dalam jumlah besar seperti pejabat lain.', score: 2, why: 'Mengganggu kesehatan finansial pribadi demi gengsi.' },
      D: { text: 'Membantu menyebarkan informasi rekening penggalangan dana kantor ke media sosial pribadi saja.', score: 3, why: 'Membantu publikasi tetapi minim aksi kontribusi pribadi.' },
      E: { text: 'Menyisihkan sedikit donasi uang yang terjangkau saja tanpa ikut membantu teknis pengemasan.', score: 4, why: 'Sudah menunjukkan kepedulian, meski kombinasi donasi dan bantuan tenaga jauh lebih bermakna.' }
    },
    concept: 'Solidaritas kemanusiaan tidak diukur dari besarnya nominal uang semata, melainkan kesungguhan berkontribusi sesuai kapasitas (harta, barang, atau tenaga).',
    steps: [
      'Kontribusi finansial/logistik sesuai kesanggupan wajar.',
      'Tambah nilai kepedulian dengan turun membantu penyaluran/pengemasan.',
      'Hindari sikap pasif atau gengsi tidak sehat.'
    ],
    quickTrick: 'Kontribusi materi semampunya + sumbang tenaga secara tulus.',
    commonMistakes: 'Beranggapan kalau tidak punya uang banyak berarti tidak bisa membantu sama sekali.',
    tip: 'Empati yang diiringi aksi sukarela selalu mendapat skor tertinggi.',
    refs: [{ title: 'Kepedulian Sosial ASN', source: 'Pedoman Nilai Harmonis', note: 'Aksi Kemanusiaan' }]
  },
  {
    id: 'TKP-P4-023',
    topicSlug: 'sosial-budaya',
    subtopic: 'Netralitas ASN dalam Tahun Politik di Komunitas',
    difficulty: 'HARD',
    stem: 'Dalam grup percakapan warga kompleks yang diikuti banyak tokoh masyarakat, beberapa anggota membagikan poster kampanye dan meminta Anda sebagai pegawai pemerintah ikut memberi komentar dukungan terhadap salah satu pasangan calon kepala daerah. Respons yang paling tepat adalah...',
    options: {
      A: { text: 'Menolak memberi dukungan secara santun dengan mengingatkan bahwa sebagai ASN Anda terikat aturan netralitas untuk melayani seluruh warga secara adil, lalu menjaga suasana grup tetap rukun.', score: 5, why: 'Teguh menjaga netralitas ASN sambil mengedukasi warga dengan bahasa sejuk tanpa memicu permusuhan.' },
      B: { text: 'Memberikan tanda jempol (like) saja tanpa komentar tertulis supaya tidak dianggap sombong oleh tetangga.', score: 1, why: 'Melanggar netralitas ASN dalam bentuk simbol dukungan di ruang publik/grup.' },
      C: { text: 'Langsung keluar dari grup kompleks agar aman dari pembicaraan politik.', score: 3, why: 'Menjaga netralitas, namun memutus hubungan komunikasi sosial warga.' },
      D: { text: 'Menegur warga secara keras di grup agar berhenti membahas politik karena melanggar etika grup.', score: 2, why: 'Warga sipil berhak berdiskusi politik; nada keras merusak harmoni lingkungan.' },
      E: { text: 'Memilih diam tidak membalas komentar politik tersebut dan baru merespons saat topik berganti ke urusan warga.', score: 4, why: 'Aman dari pelanggaran netralitas, tetapi menjawab santun sekaligus menjelaskan posisi ASN lebih edukatif dan menjaga hubungan.' }
    },
    concept: 'Netralitas ASN wajib dijaga di ruang luring maupun daring dengan cara penyampaian yang tetap santun menjaga keutuhan warga.',
    steps: [
      'Jangan memberi dukungan verbal maupun simbol (like/stiker).',
      'Jelaskan batasan netralitas ASN secara halus dan profesional.',
      'Pertahankan relasi sosial yang harmonis dengan tetangga.'
    ],
    quickTrick: 'Tolak dukungan dengan sopan berbasis netralitas ASN tanpa memutus silaturahmi.',
    commonMistakes: 'Mengira emoji "jempol/suka" di grup chat aman bagi netralitas ASN.',
    tip: 'Dalam UU ASN, simbol dukungan digital termasuk pelanggaran netralitas.',
    refs: [{ title: 'Netralitas ASN', source: 'SKB Bawaslu, KemenPAN-RB & BKN', note: 'Media Sosial & Grup Pesan' }]
  },
  {
    id: 'TKP-P4-024',
    topicSlug: 'sosial-budaya',
    subtopic: 'Sensitivitas Gender & Kesetaraan di Ruang Kerja',
    difficulty: 'MEDIUM',
    stem: 'Dalam pembagian peran kegiatan lapangan peninjauan infrastruktur desa terpencil, seorang rekan menyarankan agar pegawai perempuan hanya ditugaskan menjaga posko administrasi karena dianggap tidak kuat medan berat, padahal beberapa pegawai perempuan memiliki kompetensi teknik sipil yang dibutuhkan. Sikap Anda adalah...',
    options: {
      A: { text: 'Mengusulkan pembagian peran dilakukan berdasarkan kompetensi teknis dan kesiapan tiap personel secara objektif tanpa membedakan gender, disertai penyiapan standar keselamatan yang memadai bagi semua.', score: 5, why: 'Menjunjung kesetaraan berbasis kompetensi sekaligus memperhatikan aspek keselamatan seluruh tim.' },
      B: { text: 'Menyetujui saran rekan tersebut karena bermaksud melindungi pegawai perempuan dari medan berat.', score: 2, why: 'Paternalisme berbasis stereotip gender merugikan kontribusi profesional.' },
      C: { text: 'Menolak usulan rekan tersebut dengan nada sinis di depan tim karena dianggap kuno.', score: 3, why: 'Berpihak pada kesetaraan, namun cara penyampaian yang sinis merusak suasana kerja.' },
      D: { text: 'Mengikuti saja keputusan koordinator lapangan meskipun pembagiannya tampak bias.', score: 1, why: 'Pasif terhadap pembatasan peluang kerja berbasis stereotip.' },
      E: { text: 'Menanyakan langsung kesediaan tiap pegawai perempuan sebelum memutuskan penempatan lapangan.', score: 4, why: 'Menghargai suara mereka, meski standar utama penugasan profesional tetap harus berbasis kompetensi dan keselamatan tim.' }
    },
    concept: 'Kesetaraan di lingkungan kerja berarti menempatkan peran berdasarkan kompetensi dan dukungan keselamatan, bukan asumsi gender.',
    steps: [
      'Arahkan kriteria penugasan pada keahlian teknis.',
      'Pastikan kondisi logistik dan keselamatan mendukung seluruh personel.',
      'Sampaikan argumen secara objektif dan tenang.'
    ],
    quickTrick: 'Dasarkan penugasan pada kompetensi objektif & keselamatan semua, bebas stereotip.',
    commonMistakes: 'Menyetujui pembatasan peran dengan dalih "melindungi" tanpa melihat kompetensi.',
    tip: 'Pengarusutamaan gender di birokrasi menempatkan kompetensi setara di atas prasangka fisik.',
    refs: [{ title: 'Pengarusutamaan Gender di Instansi Pemerintah', source: 'Inpres No. 9 Tahun 2000', note: 'Kesetaraan Berbasis Kompetensi' }]
  },

  // ================= ADAPTASI TIK (7) =================
  {
    id: 'TKP-P4-025',
    topicSlug: 'adaptasi-tik',
    subtopic: 'Keamanan Akun & Perlindungan Data Kerja',
    difficulty: 'MEDIUM',
    stem: 'Anda menerima pesan berantai di aplikasi chat yang mengaku dari tim IT pusat dan meminta Anda mengklik tautan pembaruan akun kepegawaian serta memasukkan kata sandi dan kode OTP agar gaji bulan depan tidak tertahan. Langkah paling aman dan adaptif yang Anda ambil adalah...',
    options: {
      A: { text: 'Tidak mengklik tautan tersebut, tidak pernah membagikan kata sandi atau OTP, segera mengonfirmasi kebenarannya ke kanal resmi tim IT kantor, lalu mengingatkan rekan kerja lain agar mewaspadai modus phishing tersebut.', score: 5, why: 'Menerapkan literasi keamanan siber penuh: cegah diri sendiri, verifikasi resmi, dan lindungi komunitas kantor.' },
      B: { text: 'Mengabaikan dan menghapus pesan tersebut dari ponsel pribadi tanpa memberi tahu siapa pun.', score: 4, why: 'Melindungi akun pribadi dengan benar, namun belum membantu mencegah rekan lain menjadi korban.' },
      C: { text: 'Membuka tautannya dulu sekadar melihat apakah tampilannya mirip portal resmi, baru menutupnya jika mencurigakan.', score: 2, why: 'Mengklik tautan phishing berisiko mengunduh malware atau mencuri sesi peramban.' },
      D: { text: 'Meneruskan pesan tersebut ke grup kantor sambil bertanya apakah ada yang sudah mencobanya.', score: 3, why: 'Meneruskan tautan berbahaya ke grup tanpa peringatan berisiko memicu rekan lain mengkliknya.' },
      E: { text: 'Segera mengisi kata sandi dan kode OTP agar hak gaji tetap aman.', score: 1, why: 'Jatuh tepat ke dalam perangkap pencurian kredensial.' }
    },
    concept: 'Adaptasi TIK modern tidak hanya soal cakap memakai aplikasi, tetapi juga kesadaran keamanan siber (cyber hygiene) terhadap phishing dan perlindungan OTP.',
    steps: [
      'Jangan pernah klik tautan tak terverifikasi atau beri OTP.',
      'Konfirmasi ke saluran resmi IT instansi.',
      'Sebarkan peringatan keamanan ke rekan kerja tanpa meneruskan tautan aktifnya.'
    ],
    quickTrick: 'Tolak klik/OTP + verifikasi resmi + peringatkan rekan kantor.',
    commonMistakes: 'Penasaran membuka tautan atau meneruskan pesan mentah ke grup kantor.',
    tip: 'Admin IT resmi tidak pernah meminta kata sandi maupun kode OTP pengguna.',
    refs: [{ title: 'Literasi Keamanan Siber ASN', source: 'BSSN', note: 'Antisipasi Phishing & OTP' }]
  },
  {
    id: 'TKP-P4-026',
    topicSlug: 'adaptasi-tik',
    subtopic: 'Migrasi Sistem Absensi & Kinerja Digital',
    difficulty: 'EASY',
    stem: 'Instansi Anda mewajibkan peralihan pelaporan kinerja harian dari buku log manual ke aplikasi web berbasis ponsel mulai Senin depan. Beberapa pegawai di unit Anda mengeluh karena merasa terbiasa dengan cara manual dan takut salah menginput. Sikap terbaik Anda adalah...',
    options: {
      A: { text: 'Segera mempelajari fitur aplikasi baru lewat panduan resmi, mempraktikkan pengisian sejak awal, dan membimbing rekan yang kesulitan agar seluruh unit siap bermigrasi.', score: 5, why: 'Adaptif lebih awal sekaligus menjadi motor penggerak transformasi digital di unit kerja.' },
      B: { text: 'Menyusun log manual seperti biasa sambil menunggu bulan depan untuk melihat apakah aturan aplikasi benar-benar ditegakkan.', score: 1, why: 'Menolak berubah dan menunda kepatuhan sistem.' },
      C: { text: 'Mengunduh aplikasi dan langsung mencoba sendiri tanpa membaca panduan maupun membantu rekan lain.', score: 4, why: 'Adaptif secara individu, tetapi belum menularkan kesiapan ke tim.' },
      D: { text: 'Mengusulkan ke pimpinan agar pegawai senior dibebaskan dari kewajiban pelaporan aplikasi.', score: 2, why: 'Memecah konsistensi data kinerja instansi.' },
      E: { text: 'Mencatat tetap di buku manual lalu memotret halamannya untuk dikirim lewat chat kepada admin.', score: 3, why: 'Tidak memakai sistem terstruktur yang baru sehingga data tidak masuk basis data.' }
    },
    concept: 'Transformasi digital SPBE membutuhkan ASN yang cepat belajar teknologi baru dan bersedia mendampingi rekan lain beradaptasi.',
    steps: [
      'Pelajari buku panduan atau video tutorial resmi sebelum tanggal berlaku.',
      'Uji coba pengisian sejak dini.',
      'Dampingi rekan kerja yang mengalami kendala teknis.'
    ],
    quickTrick: 'Pelajari segera + terapkan konsisten + bantu rekan beradaptasi.',
    commonMistakes: 'Menunggu paksaan sanksi atau meminta pengecualian permanen.',
    tip: 'Sikap Adaptif tertinggi selalu menggabungkan kemandirian belajar dan dampak positif bagi tim.',
    refs: [{ title: 'Transformasi Digital SPBE', source: 'Perpres No. 95 Tahun 2018', note: 'Adopsi Sistem Baru' }]
  },
  {
    id: 'TKP-P4-027',
    topicSlug: 'adaptasi-tik',
    subtopic: 'Otomatisasi Rekap Data Harian',
    difficulty: 'MEDIUM',
    stem: 'Setiap akhir pekan, unit Anda menghabiskan waktu hampir empat jam untuk menyalin dan menjumlahkan data layanan harian dari sepuluh file terpisah secara manual sehingga kerap terjadi salah ketik. Anda mengetahui penggunaan rumus kolaborasi spreadsheet atau formulir terpadu dapat memangkas waktu menjadi 15 menit. Tindakan Anda adalah...',
    options: {
      A: { text: 'Membuat purwarupa templat spreadsheet terpadu lengkap dengan rumus validasi otomatis, mengujinya pada data pekan ini, lalu mengusulkan penggunaannya ke atasan dan tim.', score: 5, why: 'Inovatif berbasis bukti kerja nyata (purwarupa teruji) untuk meningkatkan akurasi dan efisiensi tim.' },
      B: { text: 'Memakai rumus otomatis secara diam-diam hanya saat giliran Anda bertugas agar pekerjaan cepat selesai.', score: 3, why: 'Bermanfaat bagi diri sendiri, tidak mengubah kebiasaan rentan eror seluruh tim.' },
      C: { text: 'Mengkritik cara kerja lama di rapat tanpa membawa rancangan perbaikan karena menyusun sistem bukan tugas utama Anda.', score: 2, why: 'Mengeluh tanpa menawarkan solusi praktis.' },
      D: { text: 'Mengirimkan tautan video tutorial rumus Excel di grup agar anggota tim belajar masing-masing.', score: 4, why: 'Mendorong peningkatan keterampilan, namun membuat purwarupa siap pakai jauh lebih aplikatif.' },
      E: { text: 'Tetap menyalin satu per satu mengikuti tradisi unit karena khawatir mengubah format akan ditegur auditor.', score: 1, why: 'Takut berinovasi meski proses manual terbukti lambat dan rawan eror.' }
    },
    concept: 'Adaptasi TIK berfokus pada pemanfaatan alat digital sederhana namun berdampak besar bagi akurasi dan kecepatan kerja organisasi.',
    steps: [
      'Identifikasi pekerjaan berulang yang menyita waktu dan rawan salah ketik.',
      'Bangun solusi digital teruji (misal templat otomatis).',
      'Presentasikan manfaatnya ke pimpinan/tim untuk diadopsi bersama.'
    ],
    quickTrick: 'Buat solusi digital teruji -> usulkan penerapan bersama demi efisiensi tim.',
    commonMistakes: 'Berhenti pada saran lisan atau menyimpan efisiensi untuk diri sendiri.',
    tip: 'Purwarupa teruji adalah bukti nyata nilai Adaptif dan Kompeten.',
    refs: [{ title: 'Inovasi Proses Kerja Digital', source: 'KemenPAN-RB', note: 'Otomatisasi Sederhana' }]
  },
  {
    id: 'TKP-P4-028',
    topicSlug: 'adaptasi-tik',
    subtopic: 'Etika & Keamanan Dokumen di Cloud Bersama',
    difficulty: 'MEDIUM',
    stem: 'Untuk mempercepat penyusunan proposal lintas divisi, Anda diminta membagikan dokumen kerja berisi data anggaran terperinci melalui layanan penyimpanan awan (cloud). Agar kolaborasi lancar namun data tetap aman, pengaturan yang paling tepat adalah...',
    options: {
      A: { text: 'Mengatur izin akses khusus berdasarkan alamat email akun resmi anggota tim yang berkepentingan (restricted access), membedakan peran editor dan peninjau, serta menghindari tautan publik terbuka.', score: 5, why: 'Menerapkan prinsip least privilege (hak akses minimum sesuai peran) untuk kolaborasi awan yang aman.' },
      B: { text: 'Mengaktifkan opsi "Siapa saja yang memiliki tautan dapat mengedit" lalu mengirim tautannya ke grup chat agar tidak repot menyetujui akses satu per satu.', score: 1, why: 'Sangat berisiko terhadap kebocoran data atau perubahan ilegal oleh pihak luar.' },
      C: { text: 'Mengaktifkan opsi "Siapa saja yang memiliki tautan dapat melihat", lalu meminta revisi dikirim lewat pesan chat satu per satu.', score: 3, why: 'Masih berisiko tautan publik bocor dan menghambat kolaborasi waktu nyata.' },
      D: { text: 'Menolak memakai penyimpanan awan dan memilih mengirimkan file lampiran berulang kali lewat email meski versi sering tertukar.', score: 2, why: 'Menghindari teknologi kolaborasi dan memicu duplikasi versi file.' },
      E: { text: 'Membagikan akses edit kepada seluruh pegawai satu kantor lewat email domain instansi agar lebih terbuka.', score: 4, why: 'Lebih aman dibanding tautan publik, namun masih terlalu longgar bagi pihak di luar tim penyusun.' }
    },
    concept: 'Penggunaan alat kolaborasi cloud wajib diimbangi tata kelola hak akses (restricted by email & role) sesuai kebutuhan kerja.',
    steps: [
      'Tolak tautan publik bebas ("anyone with the link").',
      'Berikan akses spesifik kepada email tim terkait.',
      'Pisahkan hak edit dan hak baca (viewer/commenter).'
    ],
    quickTrick: 'Pilih akses terbatas berdasarkan email tim & peran (editor/viewer), hindari tautan publik.',
    commonMistakes: 'Memilih "anyone with the link can edit" demi kepraktisan.',
    tip: 'Keamanan informasi dan kelancaran kolaborasi harus berjalan beriringan.',
    refs: [{ title: 'Tata Kelola Data dan Cloud Pemerintah', source: 'BSSN', note: 'Kontrol Hak Akses' }]
  },
  {
    id: 'TKP-P4-029',
    topicSlug: 'adaptasi-tik',
    subtopic: 'Pelaksanaan Rapat Daring yang Efektif',
    difficulty: 'EASY',
    stem: 'Anda ditunjuk memimpin rapat koordinasi daring antarwilayah selama satu jam. Pada rapat-rapat sebelumnya, diskusi daring sering molor karena gangguan audio peserta dan agenda yang melebar. Langkah persiapan dan pelaksanaan paling efektif adalah...',
    options: {
      A: { text: 'Membagikan tautan, bahan paparan, dan susunan agenda berbatas waktu sehari sebelumnya; membuka ruang rapat 10 menit lebih awal untuk uji audio; lalu memandu ketertiban mikrofon dan merangkum kesepakatan tindak lanjut di akhir sesi.', score: 5, why: 'Mengelola prasyarat teknis, disiplin waktu, dan keluaran keputusan rapat daring secara menyeluruh.' },
      B: { text: 'Langsung mengirim tautan rapat 10 menit sebelum jam mulai agar tidak tenggelam di grup percakapan.', score: 2, why: 'Membuat peserta tidak sempat menyiapkan bahan dan menguji koneksi.' },
      C: { text: 'Mematikan suara seluruh peserta secara permanen sepanjang rapat dan hanya membolehkan tanya jawab lewat kolom teks.', score: 3, why: 'Membatasi kualitas interaksi koordinasi.' },
      D: { text: 'Membuka rapat tepat waktu dan langsung memaparkan seluruh materi selama 55 menit tanpa jeda diskusi.', score: 1, why: 'Satu arah dan bukan rapat koordinasi.' },
      E: { text: 'Mengingatkan di awal rapat agar semua peserta mematikan mikrofon saat tidak berbicara dan mencatat masing-masing poin penting.', score: 4, why: 'Sudah memperhatikan etika audio, tetapi tanpa distribusi bahan sebelumnya dan notula terpusat.' }
    },
    concept: 'Efektivitas rapat daring bertumpu pada distribusi bahan sebelum sesi, kesiapan teknis awal, moderasi tertib, dan notula tindak lanjut.',
    steps: [
      'Kirim agenda dan bahan H-1 agar sesi rapat fokus diskusi.',
      'Uji teknis audio/layar 10 menit sebelum mulai.',
      'Tutup dengan ringkasan keputusan dan PIC.'
    ],
    quickTrick: 'Siapkan agenda & bahan sebelum rapat + kelola teknis + rangkum tindak lanjut.',
    commonMistakes: 'Mendadak mengirim tautan rapat atau membiarkan rapat tanpa notula keputusan.',
    tip: 'Teknologi rapat daring hanya efektif bila ditopang manajemen agenda yang disiplin.',
    refs: [{ title: 'Panduan Kerja Fleksibel & Rapat Daring', source: 'KemenPAN-RB', note: 'Etika & Manajemen Rapat Daring' }]
  },
  {
    id: 'TKP-P4-030',
    topicSlug: 'adaptasi-tik',
    subtopic: 'Pencadangan Data (Backup) Kerja Penting',
    difficulty: 'EASY',
    stem: 'Sebulan lalu komputer di meja kerja sebelah mengalami kerusakan cakram keras mendadak sehingga data laporan satu tahun nyaris hilang seluruhnya. Sebagai pegawai yang memegang banyak arsip digital aktif, langkah preventif terbaik Anda adalah...',
    options: {
      A: { text: 'Menerapkan pencadangan rutin berjenjang (di penyimpanan awan resmi kantor dan media cadangan terenkripsi) dengan penamaan versi yang teratur, serta mengajak tim menjadikannya kebiasaan rutin.', score: 5, why: 'Menerapkan prinsip redundansi cadangan (3-2-1/berjenjang), keamanan enkripsi, dan budaya kerja tim.' },
      B: { text: 'Menyalin semua file kerja penting ke dalam satu flashdisk pribadi dan menyimpannya di dalam tas.', score: 3, why: 'Rawan hilang/tercecer dan berisiko terhadap kerahasiaan data instansi di perangkat pribadi.' },
      C: { text: 'Mencetak seluruh dokumen digital tersebut lalu memasukkannya ke lemari arsip map.', score: 2, why: 'Boros kertas dan menyulitkan pengolahan data digital lanjutan.' },
      D: { text: 'Rajin membersihkan file sementara agar kinerja komputer tetap ringan sehingga harddisk tidak rusak.', score: 1, why: 'Pembersihan file tidak mencegah kerusakan perangkat keras mendadak.' },
      E: { text: 'Mengunggah cadangan folder kerja ke penyimpanan awan resmi kantor setiap akhir minggu.', score: 4, why: 'Langkah bagus dan aman secara individu, hanya belum menjadi budaya pencegahan tim dan belum terstruktur penamaannya.' }
    },
    concept: 'Pencegahan kehilangan data digital dilakukan melalui backup berkala di media resmi yang terpisah serta penataan versi file.',
    steps: [
      'Simpan salinan cadangan di kanal awan resmi/server aman instansi.',
      'Tetapkan jadwal rutin mingguan/harian.',
      'Gunakan format penamaan tanggal/versi yang rapi dan ajak tim menerapkan.'
    ],
    quickTrick: 'Backup rutin berjenjang di fasilitas aman resmi + tertib penamaan + ajak tim.',
    commonMistakes: 'Menyimpan data negara di flashdisk pribadi yang mudah hilang.',
    tip: 'Belajar dari insiden unit sebelah sebelum menimpa diri sendiri adalah ciri ASN adaptif.',
    refs: [{ title: 'Manajemen Risiko Data Digital', source: 'Pedoman TIK Instansi', note: 'Backup Berkala' }]
  },
  {
    id: 'TKP-P4-031',
    topicSlug: 'adaptasi-tik',
    subtopic: 'Evaluasi Akurasi Alat Bantu Digital Baru',
    difficulty: 'HARD',
    stem: 'Anda menggunakan aplikasi pemindai teks otomatis (OCR) untuk mempercepat input ratusan dokumen arsip lama ke basis data. Saat mengecek sampel hasilnya, Anda menemukan alat tersebut terkadang salah membaca angka "3" menjadi "8". Tindakan paling tepat adalah...',
    options: {
      A: { text: 'Tetap memanfaatkan OCR untuk mempercepat pembacaan teks panjang, namun menyisipkan tahapan verifikasi manual khusus pada kolom angka kritis dan melaporkan temuan kendala tersebut sebagai catatan SOP tim.', score: 5, why: 'Memanfaatkan keunggulan teknologi secara cerdas sambil memitigasi titik lemahnya melalui verifikasi terarah.' },
      B: { text: 'Menghentikan penggunaan aplikasi OCR seluruhnya dan kembali mengetik ulang semua ratusan dokumen secara manual dari awal.', score: 2, why: 'Menghilangkan efisiensi teknologi hanya karena kelemahan yang sebenarnya bisa dikontrol.' },
      C: { text: 'Terus menjalankan OCR sampai selesai tanpa pengecekan angka karena aplikasi tersebut resmi direkomendasikan bagian TI.', score: 1, why: 'Lalai terhadap akurasi data vital instansi.' },
      D: { text: 'Hanya menggunakan OCR untuk dokumen yang tidak mengandung angka sama sekali.', score: 3, why: 'Mengurangi manfaat teknologi pada dokumen campuran teks-angka.' },
      E: { text: 'Memperbaiki angka yang salah saat Anda kebetulan membacanya sambil tetap melanjutkan pemindaian.', score: 4, why: 'Memperbaiki sambil lalu, namun tanpa prosedur pengecekan sistematis dan catatan SOP bagi rekan lain.' }
    },
    concept: 'Adaptasi TIK yang matang menggabungkan kecepatan otomatisasi dengan pengawasan kualitas (human-in-the-loop) pada titik rawan kesalahan.',
    steps: [
      'Pertahankan pemakaian teknologi agar proses tetap cepat.',
      'Terapkan kontrol kualitas khusus di bagian kritis (angka/identitas).',
      'Dokumentasikan catatan keterbatasan alat agar seluruh tim waspada.'
    ],
    quickTrick: 'Manfaatkan keunggulan teknologi + pasang cek verifikasi pada titik rawan + catat di SOP.',
    commonMistakes: 'Antiteknologi (kembali manual total) atau percaya buta 100% pada alat.',
    tip: 'Teknologi adalah alat bantu; akurasi akhir tetap tanggung jawab profesional ASN.',
    refs: [{ title: 'Kontrol Kualitas Digitalisasi Arsip', source: 'ANRI & SPBE', note: 'Verifikasi OCR' }]
  },

  // ================= PROFESIONALISME (7) =================
  {
    id: 'TKP-P4-032',
    topicSlug: 'profesionalisme',
    subtopic: 'Menjaga Kerahasiaan Informasi Negara',
    difficulty: 'MEDIUM',
    stem: 'Anda terlibat dalam tim perumus soal seleksi atau penetapan pemenang lelang pengadaan barang di instansi. Pada malam pengumuman sebelumnya, seorang kenalan lama menghubungi Anda untuk sekadar menanyakan apakah perusahaannya lolos agar ia bisa bersiap-siap. Sikap Anda yang berintegritas adalah...',
    options: {
      A: { text: 'Menolak dengan santun namun tegas bahwa seluruh hasil bersifat rahasia hingga pengumuman resmi diterbitkan melalui kanal pemerintah, serta melaporkan upaya kontak tersebut bila berpotensi melanggar kode etik.', score: 5, why: 'Menjaga penuh kerahasiaan jabatan dan objektivitas proses tanpa memberi petunjuk terselubung apa pun.' },
      B: { text: 'Memberi petunjuk halus seperti "tenang saja, doa terbaik untuk besok" tanpa menyebut kata lolos.', score: 2, why: 'Memberi sinyal hasil sebelum waktunya tetap melanggar kerahasiaan informasi.' },
      C: { text: 'Mengatakan "tunggu pengumuman besok ya" namun langsung memblokir nomornya dengan marah.', score: 3, why: 'Tidak perlu emosional atau merusak sikap santun saat menolak.' },
      D: { text: 'Menyampaikan kepastian hasilnya secara lisan saja dengan syarat ia berjanji tidak memberi tahu siapa pun.', score: 1, why: 'Pelanggaran berat integritas dan kerahasiaan jabatan.' },
      E: { text: 'Menjawab bahwa Anda belum mengecek daftar akhirnya agar terhindar dari desakan.', score: 4, why: 'Berhasil menjaga informasi tetap aman, namun pernyataan jujur mengenai larangan kerahasiaan jabatan lebih tegas dan mendidik.' }
    },
    concept: 'Kerahasiaan dokumen dan hasil seleksi/pengadaan sebelum jadwal rilis resmi adalah mandat integritas yang mutlak tanpa "kode halus".',
    steps: [
      'Tolak permintaan informasi prapengumuman secara tegas dan sopan.',
      'Arahkan ke portal pengumuman resmi.',
      'Catat/laporkan ke tim pengawas bila terdapat tekanan berkelanjutan.'
    ],
    quickTrick: 'Tolak tegas & sopan atas dasar rahasia jabatan; arahkan ke pengumuman resmi.',
    commonMistakes: 'Menggunakan jawaban berbohong atau memberi "kode" agar terkesan ramah.',
    tip: 'Dalam integritas, sikap jujur terhadap batas aturan lebih bernilai daripada dalih menghindar.',
    refs: [{ title: 'Kode Etik dan Kode Perilaku ASN', source: 'UU No. 20 Tahun 2023', note: 'Menjaga Rahasia Jabatan' }]
  },
  {
    id: 'TKP-P4-033',
    topicSlug: 'profesionalisme',
    subtopic: 'Menghadapi Kesalahan Kerja Sendiri',
    difficulty: 'MEDIUM',
    stem: 'Setelah rapat koordinasi selesai dan seluruh bahan dicetak serta dibagikan, Anda baru menyadari terdapat kesalahan rumus pada salah satu tabel laporan yang Anda susun sehingga angka proyeksi meleset 10%. Belum ada peserta lain yang menyadarinya. Tindakan paling profesional Anda adalah...',
    options: {
      A: { text: 'Segera mengakui kekeliruan tersebut kepada atasan dan peserta rapat, menyajikan angka hasil koreksi yang benar dengan cepat, serta memperbaiki rumus templat agar tidak terulang.', score: 5, why: 'Akuntabel, jujur, proaktif meralat sebelum keputusan salah diambil, dan melakukan pencegahan berulang.' },
      B: { text: 'Diam saja karena selisih 10% baru berupa proyeksi dan belum tentu dibahas lagi.', score: 1, why: 'Tidak jujur dan membiarkan pimpinan mengambil kebijakan di atas data keliru.' },
      C: { text: 'Diam-diam mengganti file PDF di tautan unduhan daring tanpa memberi tahu peserta yang sudah membawa versi cetak.', score: 2, why: 'Menyebabkan inkonsistensi antara versi cetak dan digital.' },
      D: { text: 'Menyampaikan koreksi secara lisan kepada rekan semeja sambil berharap ia menyampaikannya ke pimpinan.', score: 3, why: 'Melempar tanggung jawab pengakuan ke orang lain.' },
      E: { text: 'Melaporkan kesalahan kepada atasan terlebih dahulu namun menunda perbaikannya hingga diminta rapat ulang.', score: 4, why: 'Jujur melapor, tetapi seharusnya sudah membawa versi koreksi siap edar saat melapor.' }
    },
    concept: 'Akuntabilitas profesional diuji saat kesalahan masih tersembunyi: berani mengakui, membawa solusi perbaikan segera, dan mencegah pengulangan.',
    steps: [
      'Laporkan segera sebelum data keliru menjadi dasar keputusan.',
      'Siapkan versi ralat yang sudah diverifikasi.',
      'Benahi sistem kerja agar kesalahan tidak terulang.'
    ],
    quickTrick: 'Akui jujur segera + bawa hasil koreksi + perbaiki sistem pencegahannya.',
    commonMistakes: 'Menutupi kesalahan karena belum ketahuan atau mengganti file diam-diam.',
    tip: 'Datang melapor kesalahan sambil membawa solusi perbaikan selalu mencerminkan kematangan profesional.',
    refs: [{ title: 'Nilai Akuntabel BerAKHLAK', source: 'KemenPAN-RB', note: 'Berani Mengakui & Memperbaiki Kesalahan' }]
  },
  {
    id: 'TKP-P4-034',
    topicSlug: 'profesionalisme',
    subtopic: 'Menolak Gratifikasi dari Pihak Terkait Layanan',
    difficulty: 'EASY',
    stem: 'Setelah Anda menyelesaikan audit kepatuhan sebuah instansi mitra secara objektif, pimpinan instansi mitra tersebut menitipkan bingkisan parsel bernilai jutaan rupiah ke pos jaga untuk diantarkan ke rumah Anda sebagai "ucapan terima kasih". Tindakan terbaik Anda adalah...',
    options: {
      A: { text: 'Menolak secara sopan dan tegas dengan mengembalikannya beserta penjelasan aturan antikorupsi/gratifikasi, atau jika tidak memungkinkan dikembalikan langsung, melaporkannya ke Unit Pengendalian Gratifikasi (UPG) / KPK sesuai batas waktu.', score: 5, why: 'Tepat sesuai regulasi pengendalian gratifikasi di Indonesia: tolak sejak awal atau laporkan resmi ke UPG/KPK.' },
      B: { text: 'Menerima bingkisan tersebut lalu membagikannya seluruhnya kepada petugas kebersihan kantor supaya tidak dinikmati pribadi.', score: 2, why: 'Menerima dan menyalurkan sendiri tetap merupakan penerimaan gratifikasi yang berhubungan dengan jabatan tanpa pelaporan resmi.' },
      C: { text: 'Mengambil kartu ucapannya saja dan membiarkan parsel tetap di pos jaga sampai busuk.', score: 1, why: 'Menimbulkan ketidakjelasan barang dan tidak mengikuti prosedur pengembalian/pelaporan.' },
      D: { text: 'Menyimpannya di gudang kantor selama satu tahun untuk berjaga-jaga jika pengirim menanyakan.', score: 3, why: 'Tidak menyelesaikan status hukum gratifikasi.' },
      E: { text: 'Menghubungi pimpinan mitra tersebut untuk menanyakan apakah isi bingkisan ditujukan untuk seluruh tim audit atau pribadi.', score: 4, why: 'Tetap keliru jika bermaksud menerima untuk tim; gratifikasi tim pun dilarang keras.' }
    },
    concept: 'ASN wajib menolak gratifikasi yang berhubungan dengan jabatan dan berlawanan dengan kewajiban; apabila terlanjur dititipkan, wajib lapor UPG/KPK paling lambat 30 hari kerja.',
    steps: [
      'Tolak sejak awal secara halus dan berprinsip.',
      'Bila dititipkan tanpa sepengetahuan langsung, laporkan ke UPG/KPK.',
      'Jaga independensi hasil audit tetap objektif.'
    ],
    quickTrick: 'Tolak tegas dan santun; jika terlanjur dititipkan, lapor resmi ke UPG/KPK.',
    commonMistakes: 'Mengira membagikan parsel ke orang lain atau petugas kebersihan menggugurkan pelanggaran gratifikasi.',
    tip: 'Penerimaan yang berakar dari hubungan jabatan wajib ditolak/dilaporkan meski tidak diminta.',
    refs: [{ title: 'UU Pemberantasan Tipikor Pasal 12B & Pedoman UPG', source: 'KPK RI', note: 'Pengendalian Gratifikasi' }]
  },
  {
    id: 'TKP-P4-035',
    topicSlug: 'profesionalisme',
    subtopic: 'Manajemen Prioritas di Tengah Tenggat Ganda',
    difficulty: 'MEDIUM',
    stem: 'Pada pagi hari Anda mendapat dua penugasan mendadak: pertama, memfinalisasi bahan paparan rapat pimpinan siang pukul 13.00; kedua, menyusun draf telaahan regulasi untuk minggu depan. Di saat yang sama, meja Anda cukup berantakan oleh berkas minggu lalu. Urutan tindakan profesional Anda adalah...',
    options: {
      A: { text: 'Memprioritaskan penyelesaian bahan paparan rapat pimpinan pukul 13.00 sesuai matriks urgensi dan kepentingan sambil merapikan ruang kerja seperlunya, lalu mengerjakan telaahan regulasi sesuai jadwal berikutnya.', score: 5, why: 'Menerapkan manajemen prioritas mendesak-penting dengan tetap menjaga kualitas hasil kerja.' },
      B: { text: 'Menghabiskan satu jam pertama merapikan seluruh berkas minggu lalu supaya pikiran jernih sebelum mengetik.', score: 2, why: 'Menunda pekerjaan berbatas waktu ketat hanya untuk aktivitas yang tidak mendesak.' },
      C: { text: 'Mengerjakan draf telaahan regulasi terlebih dahulu karena bobotnya paling besar, lalu meminta waktu rapat pimpinan dimundurkan.', score: 1, why: 'Mengabaikan tenggat mendesak pukul 13.00 yang sudah ditetapkan.' },
      D: { text: 'Mengerjakan keduanya secara bergantian tiap 15 menit supaya progres keduanya terlihat berjalan.', score: 3, why: 'Task-switching berlebihan menurunkan fokus dan berisiko membuat bahan pukul 13.00 belum tuntas.' },
      E: { text: 'Menyelesaikan bahan paparan rapat pimpinan tepat pukul 12.55 lalu menunda istirahat untuk langsung menyicil telaahan.', score: 4, why: 'Urutan prioritas tepat, namun sebaiknya menyisihkan waktu pemeriksaan ulang sebelum pukul 13.00.' }
    },
    concept: 'Profesionalisme kerja membedakan tugas mendesak-penting (Kuadran I) dari tugas berjangka panjang (Kuadran II) dan urusan administratif rutin.',
    steps: [
      'Tuntaskan bahan rapat pukul 13.00 beserta waktu cek ulang (buffer).',
      'Lanjutkan draf telaahan regulasi dengan jadwal terencana.',
      'Rapikan berkas lama setelah tugas kritis aman.'
    ],
    quickTrick: 'Dahulukan tugas paling mendesak & berdampak tinggi (rapat pimpinan 13.00) dengan kualitas utuh.',
    commonMistakes: 'Mengutamakan kesibukan rapi-rapi meja di jam tenggat kritis.',
    tip: 'Gunakan matriks Eisenhower: Penting-Mendesak dikerjakan nomor satu.',
    refs: [{ title: 'Manajemen Waktu & Prioritas ASN', source: 'LAN RI', note: 'Matriks Urgensi' }]
  },
  {
    id: 'TKP-P4-036',
    topicSlug: 'profesionalisme',
    subtopic: 'Menjaga Kinerja di Luar Pengawasan Langsung',
    difficulty: 'EASY',
    stem: 'Selama tiga hari ke depan, atasan langsung Anda sedang bertugas dinas luar kota dan suasana ruangan terasa lebih santai karena beberapa rekan memanfaatkan waktu untuk mengobrol panjang serta berbelanja daring. Sikap Anda adalah...',
    options: {
      A: { text: 'Tetap berdisiplin menyelesaikan target pekerjaan harian secara mandiri sesuai standar mutu, serta proaktif mengirim pembaruan progres singkat kepada atasan jika diperlukan.', score: 5, why: 'Menunjukkan integritas diri dan etos kerja konsisten meski tanpa pengawasan fisik.' },
      B: { text: 'Ikut santai sejenak sepanjang pagi lalu mengebut seluruh tugas di hari ketiga sebelum atasan pulang.', score: 2, why: 'Etos kerja bergantung pada pengawasan atasan dan menurunkan ketelitian hasil.' },
      C: { text: 'Mengambil foto rekan-rekan yang sedang mengobrol untuk langsung dikirimkan kepada atasan sebagai bukti kedisiplinan Anda.', score: 3, why: 'Mencari muka tanpa fokus pada pembinaan keteladanan tim.' },
      D: { text: 'Hanya mengerjakan tugas yang sekiranya akan ditanya atasan saat kembali nanti.', score: 1, why: 'Integritas rendah dan melalaikan tanggung jawab jabatan.' },
      E: { text: 'Tetap mengerjakan pekerjaan pribadi seperti biasa sampai selesai lalu membaca berita di sela jam kerja.', score: 4, why: 'Sudah bertanggung jawab pada tugas pribadi, namun konsistensi pelaporan progres dan keteladanan kerja lebih optimal.' }
    },
    concept: 'Integritas sejati terlihat saat tidak ada atasan yang mengawasi: bekerja tuntas, rapi, dan akuntabel.',
    steps: [
      'Patuhi jam dan ritme kerja produktif secara mandiri.',
      'Selesaikan target dan bantu jaga ketertiban target tim.',
      'Berikan laporan progres wajar secara profesional.'
    ],
    quickTrick: 'Konsisten bekerja berprestasi meski tanpa diawasi atasan.',
    commonMistakes: 'Menurunkan standar kerja saat pimpinan pergi atau bersikap ingin menjatuhkan rekan.',
    tip: 'Akuntabilitas diri tidak ditentukan oleh kehadiran fisik atasan.',
    refs: [{ title: 'Integritas & Disiplin PNS', source: 'PP No. 94 Tahun 2021', note: 'Disiplin Jam Kerja' }]
  },
  {
    id: 'TKP-P4-037',
    topicSlug: 'profesionalisme',
    subtopic: 'Pemanfaatan Fasilitas Kantor Secara Akuntabel',
    difficulty: 'EASY',
    stem: 'Anda harus mencetak 80 halaman tugas kuliah pribadi karena printer di rumah sedang rusak, sementara di meja kerja Anda terdapat printer dinas beserta stok kertas kantor yang cukup banyak. Tindakan paling profesional adalah...',
    options: {
      A: { text: 'Tidak memakai printer maupun kertas dinas untuk kepentingan kuliah pribadi, dan memilih mencetak di tempat percetakan umum di luar jam kerja.', score: 5, why: 'Memisahkan secara tegas barang milik negara dari urusan pribadi.' },
      B: { text: 'Mencetak menggunakan printer kantor namun mengganti dengan kertas A4 yang Anda beli sendiri.', score: 3, why: 'Tinta, listrik, dan keausan mesin printer tetap menggunakan aset negara.' },
      C: { text: 'Mencetak saat jam istirahat agar tidak mengganggu pekerjaan kantor dan tidak dilihat banyak orang.', score: 1, why: 'Penyalahgunaan fasilitas dinas untuk kepentingan pribadi.' },
      D: { text: 'Meminta izin ke petugas perlengkapan kantor untuk meminjam printer sebentar dengan alasan tugas tersebut membantu wawasan kerja.', score: 2, why: 'Mencampuradukkan urusan akademik pribadi dengan operasional negara.' },
      E: { text: 'Hanya mencetak 10 halaman ringkasannya saja di kantor agar tidak terlalu boros tinta dinas.', score: 4, why: 'Tetap menggunakan aset dinas untuk keperluan non-dinas meski sedikit.' }
    },
    concept: 'Barang Milik Negara (BMN) dan perlengkapan kantor hanya boleh digunakan untuk tugas kedinasan secara bertanggung jawab.',
    steps: [
      'Pisahkan tegas kebutuhan pribadi dan fasilitas negara.',
      'Gunakan jasa komersial pribadi di luar jam dinas.',
      'Jaga akuntabilitas pemakaian ATK instansi.'
    ],
    quickTrick: 'Tolak penggunaan fasilitas kantor (kecil maupun besar) untuk urusan pribadi.',
    commonMistakes: 'Menganggap pemakaian ATK atau printer untuk urusan pribadi sebagai hal sepele jika hanya sedikit.',
    tip: 'Dalam Akuntabel BerAKHLAK, penyalahgunaan kecil tetap bernilai rendah.',
    refs: [{ title: 'Pengelolaan Barang Milik Negara', source: 'Kemenkeu & KemenPAN-RB', note: 'Integritas Penggunaan Aset' }]
  },
  {
    id: 'TKP-P4-038',
    topicSlug: 'profesionalisme',
    subtopic: 'Menghadapi Tugas Baru di Luar Zona Nyaman',
    difficulty: 'HARD',
    stem: 'Karena adanya rotasi mendadak, Anda ditempatkan di subbagian pengadaan barang/jasa yang regulasinya sangat detail dan jauh berbeda dari latar belakang pendidikan Anda sebelumnya. Dalam waktu dua minggu Anda harus mulai menyusun dokumen pengadaan. Sikap profesional Anda adalah...',
    options: {
      A: { text: 'Menerima penugasan dengan lapang dada, segera mempelajari peraturan pengadaan terkini secara intensif, berdiskusi dengan pejabat pengadaan berpengalaman, dan menyusun daftar periksa agar tidak ada kesalahan prosedur.', score: 5, why: 'Menunjukkan loyalitas organisasi, kemauan belajar cepat (Kompeten), dan kehati-hatian prosedural.' },
      B: { text: 'Mengajukan surat keberatan dan meminta dikembalikan ke bagian lama karena takut membuat kesalahan hukum.', score: 2, why: 'Menghindari tantangan pengembangan kompetensi dan menolak rotasi.' },
      C: { text: 'Mengerjakan sebisanya dengan menyalin dokumen tahun lalu mentah-mentah tanpa memeriksa pembaruan regulasi.', score: 1, why: 'Sangat berisiko melanggar aturan pengadaan terbaru.' },
      D: { text: 'Meminta rekan lama di subbagian tersebut untuk terus menggantikan Anda menyusun seluruh dokumen selama bulan pertama.', score: 3, why: 'Bergantung penuh tanpa inisiatif belajar mandiri.' },
      E: { text: 'Mengikuti diklat daring dasar pengadaan terlebih dahulu dan menunda penyusunan dokumen sampai sertifikat terbit.', score: 4, why: 'Ada kemauan belajar resmi, tetapi menunda target operasional dua minggu tanpa langkah paralel berdiskusi dengan senior.' }
    },
    concept: 'Profesionalisme dan kompetensi ASN menuntut kesiapan belajar cepat saat dirotasi serta pengamanan kepatuhan prosedur melalui bimbingan ahli dan daftar periksa.',
    steps: [
      'Sambut rotasi sebagai pengembangan karier.',
      'Pelajari regulasi terbaru dan contoh sah secara paralel.',
      'Minta peninjauan (review) senior serta gunakan checklist kepatuhan.'
    ],
    quickTrick: 'Terima rotasi + belajar cepat regulasi + konsultasi senior + pakai checklist kontrol.',
    commonMistakes: 'Menjiplak mentah berkas lama atau menolak penugasan baru.',
    tip: 'Berani belajar hal baru disertai kontrol kehati-hatian adalah karakter ASN unggul.',
    refs: [{ title: 'Kompetensi dan Pengembangan Karier ASN', source: 'LAN RI', note: 'Adaptasi Rotasi Jabatan' }]
  },

  // ================= ANTI RADIKALISME (7) =================
  {
    id: 'TKP-P4-039',
    topicSlug: 'anti-radikalisme',
    subtopic: 'Penolakan Paham Pengganti Ideologi Negara',
    difficulty: 'MEDIUM',
    stem: 'Dalam sebuah diskusi informal di luar jam kantor, seorang rekan kerja mulai sering menyebarkan narasi bahwa sistem ketatanegaraan berdasarkan Pancasila dan UUD 1945 sudah tidak relevan dan harus diganti dengan sistem ideologi kelompok tertentu. Sikap Anda yang paling tepat adalah...',
    options: {
      A: { text: 'Menegaskan pendirian Anda berlandaskan Pancasila dan UUD 1945 dengan argumen dialogis yang tenang serta tidak terpengaruh, dan bila penyebaran terus mengarah pada indikasi intoleransi/radikalisme di lingkungan kerja, melaporkannya melalui saluran pembinaan resmi instansi.', score: 5, why: 'Teguh pada ideologi negara, merespons secara bijak tanpa emosi destruktif, dan menindaklanjuti secara prosedural bila berlanjut.' },
      B: { text: 'Mengiyakan saja pandangannya untuk menjaga pertemanan meski dalam hati tidak setuju.', score: 2, why: 'Membiarkan narasi anti-Pancasila tumbuh seolah mendapat pembenaran.' },
      C: { text: 'Langsung memaki rekan tersebut di ruang makan sebagai pengkhianat bangsa di depan pegawai lain.', score: 3, why: 'Reaktif emosional dapat memicu keributan dan tidak memakai jalur pembinaan formal.' },
      D: { text: 'Ikut membagikan tautan kajian kelompok tersebut karena penasaran dan ingin melihat respons rekan lain.', score: 1, why: 'Turut menyebarluaskan paham yang bertentangan dengan dasar negara.' },
      E: { text: 'Menjauhinya secara diam-diam dan meminta pindah ruangan tanpa pernah membahas atau melaporkan masalahnya.', score: 4, why: 'Menjaga diri dari paparan, namun tidak melakukan counter-narasi kebangsaan ataupun pelaporan pembinaan.' }
    },
    concept: 'ASN wajib memegang teguh Pancasila dan UUD 1945 (Nilai Loyal), menolak paham pengganti ideologi negara secara elegan, serta melaporkan indikasi penyebaran radikalisme melalui saluran resmi.',
    steps: [
      'Nyatakan komitmen pada Pancasila dan UUD 1945 secara tenang.',
      'Jangan ikut menyebarkan materi yang mempertentangkan dasar negara.',
      'Gunakan jalur pembinaan/pengawasan internal bila upaya penyebaran bersifat sistematis.'
    ],
    quickTrick: 'Tolak tegas dengan dialog konstitusional + jangan sebarkan + eskalasi ke unit pembinaan bila berlanjut.',
    commonMistakes: 'Mengangguk setuju demi menjaga sungkan atau langsung main hakim sendiri secara verbal.',
    tip: 'Loyalitas pada NKRI dan Pancasila selalu menuntut sikap aktif menjaga keutuhan konsensus bangsa.',
    refs: [{ title: 'SKB Penanganan Radikalisme ASN', source: '11 Kementerian/Lembaga & BKN', note: 'Pencegahan Paham Anti-Pancasila' }]
  },
  {
    id: 'TKP-P4-040',
    topicSlug: 'anti-radikalisme',
    subtopic: 'Menyaring Ajakan Penggalangan Dana Tak Jelas',
    difficulty: 'MEDIUM',
    stem: 'Anda diajak bergabung ke grup pesan amal yang menggalang sumbangan kemanusiaan, tetapi setelah diamati pengelolanya tidak memiliki izin resmi, menolak transparansi penyaluran, dan mulai menyisipkan seruan kebencian terhadap kelompok lain serta pemerintah yang sah. Langkah terbaik Anda adalah...',
    options: {
      A: { text: 'Segera menolak penyaluran dan keluar dari grup tersebut, mengalihkan niat donasi ke lembaga kemanusiaan resmi terpercaya, serta melaporkan kanal bermuatan kebencian dan indikasi pendanaan mencurigakan ke otoritas berwenang.', score: 5, why: 'Memutus risiko pendanaan kelompok radikal/intoleran sambil tetap menyalurkan kepedulian melalui jalur resmi dan melapor ke pihak berwenang.' },
      B: { text: 'Tetap ikut berdonasi kecil saja dengan niat amal pribadi, sambil mengabaikan pesan kebencian di grup.', score: 1, why: 'Berisiko ikut mendanai aktivitas ilegal atau jaringan radikal.' },
      C: { text: 'Keluar diam-diam dari grup tersebut tanpa melaporkannya agar tidak berurusan dengan pemeriksaan panjang.', score: 4, why: 'Mengamankan diri sendiri, namun membiarkan masyarakat lain berpotensi tertipu atau terpapar.' },
      D: { text: 'Berdebat panjang lebar di dalam grup tersebut setiap hari untuk menyadarkan adminnya.', score: 3, why: 'Berisiko tidak efektif dan memancing konflik tanpa pelaporan sistemik.' },
      E: { text: 'Menyimpan tangkapan layar grup sebagai koleksi pribadi kalau sewaktu-waktu ditanya.', score: 2, why: 'Pasif dan masih berada dalam lingkungan jaringan bermasalah.' }
    },
    concept: 'Pencegahan pendanaan terorisme/radikalisme menuntut kewaspadaan terhadap lembaga amal tak berizin dan pelaporan konten kebencian kepada otoritas terkait.',
    steps: [
      'Verifikasi legalitas dan transparansi lembaga sebelum berdonasi.',
      'Putus keterlibatan segera jika ditemukan muatan kebencian atau anti-NKRI.',
      'Laporkan ke kanal pengaduan resmi (Kominfo/BNPT/PPATK atau pimpinan).'
    ],
    quickTrick: 'Tolak & keluar + donasi lewat lembaga resmi + laporkan kanal mencurigakan.',
    commonMistakes: 'Tetap menyumbang karena "yang penting niatnya baik" tanpa mengecek tujuan dana.',
    tip: 'Niat beramal harus disalurkan lewat lembaga resmi berizin dan akuntabel.',
    refs: [{ title: 'Pencegahan Pendanaan Terorisme & Radikalisme', source: 'BNPT & PPATK', note: 'Kewaspadaan Donasi Daring' }]
  },
  {
    id: 'TKP-P4-041',
    topicSlug: 'anti-radikalisme',
    subtopic: 'Verifikasi Berita Provokatif & Hoaks SARA',
    difficulty: 'EASY',
    stem: 'Sebuah video pendek beredar cepat di grup alumni sekolah dengan narasi provokatif bahwa rumah ibadah tertentu dirusak oleh aparat negara, memicu beberapa anggota grup mengajak turun melakukan aksi balasan. Apa tindakan paling tepat Anda?',
    options: {
      A: { text: 'Mengajak anggota grup menahan diri tidak terprovokasi, memeriksa fakta video lewat sumber resmi/cek fakta terpercaya (ternyata video lama dari negara lain), lalu membagikan klarifikasi resmi untuk meredam gejolak.', score: 5, why: 'Menerapkan tabayyun/verifikasi faktual cepat dan aktif menenangkan situasi mencegah perpecahan.' },
      B: { text: 'Meneruskan video tersebut ke grup kantor untuk menanyakan kepada rekan lain apakah berita itu benar.', score: 2, why: 'Ikut menyebarkan hoaks provokatif ke lingkaran baru.' },
      C: { text: 'Mematikan notifikasi grup alumni selama beberapa hari sampai suasana mereda sendiri.', score: 3, why: 'Tidak membantu mencegah anggota lain melakukan tindakan anarkis akibat hoaks.' },
      D: { text: 'Mendukung rencana aksi di grup apabila memang benar aparat bersalah tanpa mengecek sumber video.', score: 1, why: 'Terpancing provokasi tanpa verifikasi fakta.' },
      E: { text: 'Mengecek kebenaran berita untuk diri sendiri lalu hanya diam jika ternyata memang hoaks.', score: 4, why: 'Sudah memastikan tidak ikut tertipu, tetapi membiarkan ajakan aksi di grup tetap memanas tanpa klarifikasi.' }
    },
    concept: 'Disinformasi bernuansa SARA adalah pemicu utama radikalisme sosial; saring sebelum sharing dan luruskan dengan bukti terverifikasi.',
    steps: [
      'Tahan emosi dan minta grup tidak menyimpulkan sepihak.',
      'Cek fakta via kanal resmi (Polri, Kominfo, TurnBackHoax).',
      'Bagikan klarifikasi resmi guna menghentikan eskalasi.'
    ],
    quickTrick: 'Redam provokasi + verifikasi sumber resmi + bagikan klarifikasi fakta.',
    commonMistakes: 'Ikut meneruskan video dengan embel-embel "mohon info validitasnya" padahal judulnya sudah memicu amarah.',
    tip: 'Klarifikasi aktif memutus rantai hoaks sebelum memicu kekerasan horizontal.',
    refs: [{ title: 'Literasi Digital Anti-Hoaks', source: 'Kemenkominfo & BNPT', note: 'De-eskalasi Provokasi SARA' }]
  },
  {
    id: 'TKP-P4-042',
    topicSlug: 'anti-radikalisme',
    subtopic: 'Menghormati Simbol Negara & Upacara Kebangsaan',
    difficulty: 'EASY',
    stem: 'Seorang pegawai baru menolak mengikuti apel peringatan Hari Kesaktian Pancasila dan berdiri hormat saat lagu Indonesia Raya dikumandangkan dengan alasan keyakinan pribadinya melarang penghormatan kepada selain Tuhannya. Sebagai bagian dari tim kepegawaian/rekan senior, sikap Anda adalah...',
    options: {
      A: { text: 'Mengajak berdialog secara persuasif dan edukatif bahwa hormat bendera serta menyanyikan lagu kebangsaan adalah wujud penghargaan kenegaraan dan persatuan warga negara (bukan pemujaan), sekaligus berkoordinasi dengan unit pembinaan bila penolakan berlanjut.', score: 5, why: 'Meluruskan kesalahpahaman konsep secara tenang-edukatif sekaligus menjaga tegaknya disiplin kebangsaan ASN.' },
      B: { text: 'Membiarkannya tetap duduk di ruangan kerja karena keyakinan pribadi tidak boleh diganggu sama sekali.', score: 2, why: 'Mengabaikan kewajiban dasar ASN dalam kesetiaan terhadap simbol resmi negara.' },
      C: { text: 'Mendukung alasannya karena upacara dianggap sekadar rutinitas seremonial tanpa makna.', score: 1, why: 'Menegasikan nilai nasionalisme dan kewajiban sumpah jabatan ASN.' },
      D: { text: 'Mengusirnya dari barisan upacara di depan seluruh pegawai agar ia merasa malu.', score: 3, why: 'Tindakan mempermalukan di depan umum menutup dialog pembinaan dan memicu resistensi keras.' },
      E: { text: 'Langsung mengusulkan pemecatan pada hari itu juga tanpa menelusuri alasan pemahamannya terlebih dahulu.', score: 4, why: 'Menjaga tegaknya aturan kebangsaan, tetapi pendekatan pembinaan persuasif terlebih dahulu jauh lebih proporsional sesuai SKB.' }
    },
    concept: 'Penghormatan terhadap Bendera Merah Putih, Pancasila, dan lagu Indonesia Raya adalah bagian dari komitmen kebangsaan ASN yang perlu dijelaskan perbedaannya dari peribadatan.',
    steps: [
      'Ajak bicara personal untuk meluruskan pemahaman kebangsaan vs ibadah.',
      'Tekankan komitmen sumpah/janji ASN terhadap NKRI dan Pancasila.',
      'Laporkan ke pembina kepegawaian jika penolakan bersifat ideologis permanen.'
    ],
    quickTrick: 'Edukasi persuasif beda hormat negara vs ibadah + pembinaan resmi bila tetap menolak.',
    commonMistakes: 'Membiarkan pelanggaran komitmen kebangsaan atau bertindak kasar tanpa dialog pembinaan.',
    tip: 'Pembinaan ideologi ASN menggabungkan ketegasan prinsip Pancasila dan pendekatan persuasif.',
    refs: [{ title: 'UU No. 24 Tahun 2009 tentang Bendera, Bahasa, dan Lambang Negara', source: 'Setneg RI', note: 'Penghormatan Simbol Negara' }]
  },
  {
    id: 'TKP-P4-043',
    topicSlug: 'anti-radikalisme',
    subtopic: 'Sikap Terhadap Sikap Eksklusif dan Pengkafiran Rekan',
    difficulty: 'HARD',
    stem: 'Anda mendengar seorang staf di unit lain mengimbau pegawai baru agar tidak berteman akrab dan menolak menerima makanan atau kerja tim dengan rekan yang berbeda keyakinan karena dianggap "tidak sejalan". Sikap paling tepat Anda adalah...',
    options: {
      A: { text: 'Menegaskan kepada pegawai baru tentang nilai kerja sama inklusif di lingkungan ASN tanpa membeda-bedakan keyakinan, menegur staf tersebut secara profesional, serta melaporkan pola eksklusivisme intoleran kepada atasan/pembina kepegawaian.', score: 5, why: 'Melindungi pegawai baru dari doktrin eksklusif, menentang intoleransi secara elegan, dan memproses pembinaan resmi.' },
      B: { text: 'Menghormati imbauan staf tersebut sebagai pilihan pergaulan pribadi masing-masing pegawai.', score: 1, why: 'Eksklusivisme intoleran di tempat kerja merusak pelayanan publik dan bibit radikalisme.' },
      C: { text: 'Menasihati pegawai baru secara diam-diam agar pura-pura patuh saja di depan staf tersebut supaya aman.', score: 2, why: 'Membiarkan praktik eksklusif terus mendominasi kultur kantor.' },
      D: { text: 'Mengajak rekan-rekan lain memboikot seluruh kegiatan staf tersebut sebagai balasan.', score: 3, why: 'Membalas eksklusivisme dengan pengucilan baru justru memperdalam sekat.' },
      E: { text: 'Mengingatkan pegawai baru untuk tetap profesional bekerja dengan siapa saja tanpa perlu melaporkan pola doktrin tersebut.', score: 4, why: 'Melindungi pegawai baru, tetapi pimpinan perlu tahu adanya upaya kaderisasi intoleran di kantor.' }
    },
    concept: 'Sikap eksklusif yang memutus kerja sama lintas keyakinan adalah pintu masuk radikalisme di birokrasi; perlu dilawan dengan inklusivitas dan pembinaan.',
    steps: [
      'Lindungi dan yakinkan pegawai baru mengenai nilai inklusivitas ASN.',
      'Tegaskan keberatan atas ajakan diskriminatif tersebut.',
      'Eskalasikan ke pembina kepegawaian untuk penanggulangan dini.'
    ],
    quickTrick: 'Bela inklusivitas kerja tim + bantah doktrin eksklusif + lapor unit pembinaan.',
    commonMistakes: 'Membalas dengan pengucilan balik atau menganggap doktrin eksklusif sebagai hak privasi kerja.',
    tip: 'Dalam layanan negara, kerja sama lintas keyakinan tidak boleh dibatasi oleh sekat golongan.',
    refs: [{ title: 'Moderasi Beragama dan Anti-Radikalisme ASN', source: 'Kemenag & KemenPAN-RB', note: 'Pencegahan Eksklusivisme' }]
  },
  {
    id: 'TKP-P4-044',
    topicSlug: 'anti-radikalisme',
    subtopic: 'Kewaspadaan Terhadap Bahan Bacaan/Kajian Ekstrem di Fasilitas Kantor',
    difficulty: 'MEDIUM',
    stem: 'Saat memeriksa ruang ibadah atau perpustakaan internal kantor, Anda menemukan beberapa selebaran cetak tanpa identitas penerbit yang isinya mengajak membenci kelompok minoritas dan menuding pemerintah sebagai musuh agama. Tindakan paling tepat adalah...',
    options: {
      A: { text: 'Mengamankan selebaran tersebut sebagai bukti, berkoordinasi dengan pengelola fasilitas dan atasan untuk menarik peredarannya, serta menelusuri asal penyebaran guna dilakukan langkah pembinaan.', score: 5, why: 'Menghentikan penyebaran secara cepat sambil mengamankan barang bukti dan melibatkan otoritas kantor.' },
      B: { text: 'Membaca sekilas lalu meninggalkannya tetap di rak karena menganggap ruang ibadah bebas diisi bacaan siapa saja.', score: 1, why: 'Membiarkan fasilitas negara menjadi sarana propaganda ekstremisme.' },
      C: { text: 'Langsung merobek dan membuangnya ke tempat sampah tanpa memberi tahu pengurus maupun atasan.', score: 4, why: 'Menghentikan bacaan berbahaya secara instan, namun menghilangkan jejak bukti sehingga penyebarnya bisa mengulangi tanpa terdeteksi.' },
      D: { text: 'Memotretnya lalu mengunggah ke status media sosial pribadi untuk menanyakan siapa yang menaruh.', score: 2, why: 'Justru menyebarluaskan ulang konten kebencian ke publik luas.' },
      E: { text: 'Menegur petugas kebersihan ruangan karena dinilai lalai menjaga rak bacaan.', score: 3, why: 'Menyalahkan pihak yang tidak tepat tanpa mengamankan bukti.' }
    },
    concept: 'Fasilitas negara harus steril dari materi propaganda intoleransi/ekstremisme; penanganannya menuntut pengamanan bukti dan pelaporan pengelola.',
    steps: [
      'Tarik dari jangkauan publik tanpa merusak bukti.',
      'Koordinasi dengan pengurus fasilitas dan pimpinan.',
      'Cegah penyebaran ulang melalui pengawasan ruang.'
    ],
    quickTrick: 'Amankan sebagai barang bukti + koordinasi pengurus/atasan untuk penarikan & penelusuran.',
    commonMistakes: 'Langsung membuang bukti tanpa lapor atau mengunggah foto konten kebencian ke medsos.',
    tip: 'Menyimpan bukti dan melapor pengelola mencegah pelaku mengulang di ruangan lain.',
    refs: [{ title: 'Pengamanan Lingkungan Instansi dari Ekstremisme', source: 'BNPT', note: 'Sterilisasi Materi Propaganda' }]
  },
  {
    id: 'TKP-P4-045',
    topicSlug: 'anti-radikalisme',
    subtopic: 'Menangkal Narasi Kekerasan Sebagai Solusi Perubahan',
    difficulty: 'MEDIUM',
    stem: 'Dalam forum diskusi warga mengenai ketimpangan ekonomi, seorang peserta menyuarakan pendapat bahwa jalur demokrasi dan hukum tidak berguna sehingga perubahan hanya dapat dicapai dengan aksi perusakan fasilitas umum dan kekerasan. Sebagai ASN yang hadir di forum tersebut, sikap Anda adalah...',
    options: {
      A: { text: 'Menyampaikan pandangan secara sejuk namun tegas bahwa aspirasi perubahan harus ditempuh lewat saluran hukum dan musyawarah konstitusional tanpa kekerasan, sebab perusakan fasilitas umum justru merugikan rakyat sendiri.', score: 5, why: 'Meluruskan kesesatan pikir kekerasan dengan argumen konstitusional dan empati pada kepentingan warga luas.' },
      B: { text: 'Mengangguk membenarkan kemarahannya agar forum berjalan lancar dan Anda diterima warga.', score: 1, why: 'Membenarkan ajakan kekerasan dan perusakan fasilitas negara.' },
      C: { text: 'Diam saja mendengarkan tanpa berkomentar sepatah kata pun karena itu forum warga.', score: 2, why: 'Membiarkan narasi radikal kekerasan tanpa penyeimbang yang mendidik.' },
      D: { text: 'Segera meninggalkan forum dengan wajah kesal sebagai tanda protes tanpa bicara.', score: 3, why: 'Menunjukkan ketidaksetujuan tetapi kehilangan kesempatan mengedukasi warga.' },
      E: { text: 'Mengancam akan segera memanggil aparat keamanan jika ia berani melontarkan kalimat itu sekali lagi.', score: 4, why: 'Menjaga ketertiban hukum, namun pendekatan dialogis persuasif lebih meredam simpati terhadap provokator di forum warga.' }
    },
    concept: 'Deradikalisasi preventif menekankan bahwa perubahan sosial yang sah dan bermartabat di negara hukum ditempuh lewat dialog konstitusional, bukan kekerasan atau perusakan.',
    steps: [
      'Validasi keresahan ekonomi warga secara wajar tanpa membenarkan caranya.',
      'Tolak tegas metode kekerasan dan perusakan fasilitas umum.',
      'Tawarkan saluran aspirasi resmi yang damai dan konstitusional.'
    ],
    quickTrick: 'Bantah metode kekerasan secara sejuk & konstitusional; arahkan ke saluran aspirasi sah.',
    commonMistakes: 'Mendiamkan provokasi kekerasan atau langsung mengancam tanpa mengedukasi.',
    tip: 'Memisahkan "kebutuhan perubahan" (boleh dikritik) dari "metode kekerasan" (harus ditolak) sangat efektif dalam dialog kebangsaan.',
    refs: [{ title: 'Wawasan Kebangsaan & Negara Hukum', source: 'BPIP & BNPT', note: 'Penolakan Kekerasan Sosial' }]
  }
];
