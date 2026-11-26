# Nippia — SKD Master

Platform persiapan mandiri **CPNS Seleksi Kompetensi Dasar (SKD)** berbasis AI dan analitik belajar (TWK, TIU, TKP).

> **Catatan Independensi:** Nippia adalah platform persiapan mandiri dan **tidak berafiliasi** dengan BKN atau KemenPAN-RB. Seluruh soal bawaan merupakan soal latihan orisinal untuk pembelajaran, dan konfigurasi ambang batas maupun format ujian dapat disesuaikan oleh Administrator sesuai pengumuman resmi tahun seleksi berjalan.

---

## Arsitektur & Teknologi

- **Monorepo**: npm workspaces (`packages/shared`, `apps/api`, `apps/web`)
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, React Router v7, Zustand, TanStack Query, Recharts, React Hook Form + Zod
- **Backend**: Node.js, Express v5, TypeScript, Prisma ORM, PostgreSQL 16, JWT (Access + Refresh Token rotation), Helmet, Rate Limiting, Zod validation
- **Bank Soal Bawaan**: 110 soal orisinal (`apps/api/data/questions/{twk,tiu,tkp}.json`) — TWK (30), TIU (35 termasuk diagram Figural SVG), TKP (45 dengan pembobotan 1–5 individual).

---

## Prasyarat

- Node.js >= 20
- Docker & Docker Compose (untuk PostgreSQL 16 atau full-stack container)

---

## Menjalankan Secara Lokal

1. **Salin konfigurasi environment:**
   ```bash
   cp .env.example .env
   cp .env.example apps/api/.env
   ```
2. **Jalankan database PostgreSQL via Docker:**
   ```bash
   docker compose up -d postgres
   ```
3. **Install dependensi, build shared package, sinkronkan skema DB, dan seed data:**
   ```bash
   npm install
   npm run build --workspace=@nippia/shared
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```
4. **Jalankan API dan Web secara paralel:**
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000/api/health

---

## Akun Demo (Hasil Seed)

| Peran | Email | Kata Sandi |
| :--- | :--- | :--- |
| Peserta | `peserta@nippia.id` | `BelajarSkd2026!` |
| Administrator | `admin@nippia.id` | `AdminSkd2026!` |

---

## Konfigurasi AI Provider (Opsional)

Pada `.env`, atur `AI_PROVIDER`:
- `local-grounded` (default): Menggunakan mesin tutor terpandu berbasis bank soal & materi terverifikasi platform tanpa memerlukan API key eksternal.
- `gemini`: Isi `GEMINI_API_KEY` dan `AI_MODEL=gemini-2.5-flash`.
- `openai`: Isi `OPENAI_API_KEY` dan `AI_MODEL=gpt-4o-mini`.

Kunci API hanya dibaca di server (`apps/api`) dan tidak pernah dikirim ke browser.

---

## Pengujian & Build Produksi

```bash
npm run lint
npm run test
npm run build
```

Untuk menjalankan seluruh stack lewat Docker:
```bash
docker compose up --build -d
```
