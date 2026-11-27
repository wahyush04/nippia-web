# Panduan Deployment Produksi — Nippia SKD Master

Dokumen ini menjelaskan standar deployment produksi untuk platform **Nippia — SKD Master** (Frontend React/Vite + Nginx, Backend Express/TypeScript + Socket.IO, PostgreSQL 16, dan Redis 7).

---

## 1. Prasyarat Infrastruktur

- **Server / VPS**: Linux (Ubuntu 24.04 LTS direkomendasikan), minimal 2 vCPU, 4 GB RAM, 40 GB SSD.
- **Runtime**: Docker Engine `>= 26` dan Docker Compose Plugin `>= v2.27` (atau Node.js `>= 20 LTS` untuk deployment non-kontainer).
- **Database**: PostgreSQL 16 (managed database atau kontainer internal dalam jaringan terisolasi).
- **Cache / PubSub**: Redis 7 (wajib jika menjalankan >1 replika API atau event Live Akbar berskala besar).
- **Reverse Proxy & TLS**: Nginx atau Caddy di host depan untuk terminasi HTTPS (Let's Encrypt) menuju `127.0.0.1:8080`.
- **Firewall (UFW)**: Hanya buka port `22` (SSH), `80` (HTTP redirect), dan `443` (HTTPS). **Jangan pernah membuka port `5432`, `5433`, atau `6379` ke internet publik.**

---

## 2. Daftar Variabel Environment Wajib

Buat file `.env` di root proyek pada server produksi (salin dari [`.env.example`](./.env.example)).

| Variabel | Lokasi Pakai | Wajib di Produksi | Keterangan |
|---|---|---|---|
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Postgres & Compose | Ya | Kredensial database internal |
| `DATABASE_URL` | API (`env.ts`) | Ya | String koneksi PostgreSQL (`postgresql://...`) |
| `REDIS_PASSWORD`, `REDIS_URL` | Redis & API | Direkomendasikan | Adapter Pub/Sub Socket.IO & cache Live Akbar |
| `NODE_ENV` | API | Ya | Harus `production` |
| `PORT` | API | Ya | Default `4000` |
| `TRUST_PROXY` | API | Ya | Set `true` di belakang Nginx/Cloudflare |
| `CORS_ORIGIN` | API | Ya | Origin HTTPS tepercaya (misal `https://nippia.id`). Dilarang `*` atau `localhost` |
| `APP_URL` | API & Midtrans | Ya | URL publik aplikasi (misal `https://nippia.id`) |
| `JWT_ACCESS_SECRET` | API | Ya | Rahasia unik minimal 32 karakter acak |
| `JWT_REFRESH_SECRET` | API | Ya | Rahasia unik minimal 32 karakter acak (harus berbeda dari Access Secret) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | API & Web build | Opsional | Kredensial OAuth 2.0 Web Application GCP |
| `MIDTRANS_IS_PRODUCTION` | API | Ya (jika Midtrans aktif) | `true` untuk Live, `false` untuk Sandbox |
| `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY` | API | Opsional | Kredensial Midtrans Snap & verifikasi webhook SHA-512 |
| `VITE_API_URL`, `VITE_APP_URL`, `VITE_APP_ENV`, `VITE_GOOGLE_CLIENT_ID`, `VITE_ENABLE_DEMO_LOGIN` | Web (`Dockerfile` build-args) | Ya | Hanya konfigurasi publik (`VITE_ENABLE_DEMO_LOGIN` harus `false`) |

**Cara membuat JWT secret acak yang aman:**
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## 3. Provisioning Database & Jaringan

Pada produksi menggunakan `docker-compose.prod.yml`:
- PostgreSQL dan Redis hanya terhubung ke bridge network internal `nippia_internal` dan **tidak mengekspos port ke publik**.
- Data PostgreSQL dipersistensikan pada named volume `postgres_prod_data` dan Redis pada `redis_prod_data`.

---

## 4. Prosedur Backup Database

Selalu lakukan backup sebelum melakukan migrasi atau rilis baru:

```bash
# Backup database produksi ke file terkompresi dengan timestamp
mkdir -p backups
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom \
  > "backups/nippia_skd_$(date +%Y%m%d_%H%M%S).dump"
```

---

## 5. Eksekusi Migrasi Database Produksi

- Gunakan **hanya** `prisma migrate deploy` di produksi.
- **DILARANG** menjalankan `prisma migrate dev`, `prisma db push --force-reset`, atau reset database di produksi.
- Kontainer `api` otomatis menjalankan `npx prisma migrate deploy` saat startup sebelum server Express mendengarkan trafik.
- Untuk seeding data referensi awal saja (tanpa membuat akun demo atau data latihan fiktif) pada database kosong pertama kali:

```bash
docker compose -f docker-compose.prod.yml exec api \
  sh -c "ALLOW_PRODUCTION_SEED=true SEED_REFERENCE_ONLY=true npx tsx apps/api/prisma/seed.ts"
```
> Setelah selesai, buat akun Administrator utama melalui SQL/panel admin dan segera set kata sandi yang kuat.

---

## 6 & 7. Build & Deployment Frontend + Backend

```bash
# Build & jalankan stack produksi
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

Stack internal akan aktif dengan:
- `web` (Nginx Alpine serving bundle statis + proxy `/api/` & `/socket.io/`) pada `127.0.0.1:8080`
- `api` (Node 22 Alpine non-root user `node`) pada port internal `4000`

---

## 8 & 9. Konfigurasi Reverse Proxy & HTTPS (Host Nginx)

Pasang Nginx di host server (atau Cloudflare Tunnel / Caddy) sebagai terminasi SSL di depan `127.0.0.1:8080`:

```nginx
server {
    listen 80;
    server_name nippia.id www.nippia.id;
    return 301 https://nippia.id$request_uri;
}

server {
    listen 443 ssl http2;
    server_name nippia.id;

    ssl_certificate     /etc/letsencrypt/live/nippia.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nippia.id/privkey.pem;

    client_max_body_size 10m;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
}
```

Jalankan Certbot untuk sertifikat HTTPS gratis:
```bash
sudo certbot --nginx -d nippia.id
```

---

## 10. Konfigurasi Domain, DNS & Integrasi Pihak Ketiga

1. **DNS Record**: Arahkan `A` record domain (`nippia.id`) ke IP publik VPS.
2. **Google Cloud Console (OAuth 2.0)**:
   - Authorized JavaScript origins: `https://nippia.id`
   - Authorized redirect URIs: `https://nippia.id/api/v1/auth/google/callback`
3. **Midtrans Dashboard (Production)**:
   - Payment Notification URL (Webhook): `https://nippia.id/api/v1/subscriptions/midtrans/webhook`
   - Finish Redirect URL: `https://nippia.id/subscription`

---

## 11. Verifikasi Health Check

```bash
# Liveness & DB check melalui Nginx
curl -fsS https://nippia.id/api/health

# Readiness check langsung ke container API (DB + Redis)
docker compose -f docker-compose.prod.yml exec api \
  node -e "fetch('http://127.0.0.1:4000/api/ready').then(r=>r.json()).then(console.log)"
```

---

## 12. Inspeksi Log

API menulis log terstruktur JSON ke `stdout`/`stderr` tanpa membocorkan token, kata sandi, cookie, atau signature key:

```bash
docker compose -f docker-compose.prod.yml logs -f --tail=200 api
docker compose -f docker-compose.prod.yml logs -f --tail=200 web
```

---

## 13. Prosedur Rollback

Jika rilis baru mengalami kendala:
1. Hentikan versi bermasalah dan checkout tag/commit stabil sebelumnya:
   ```bash
   git checkout <commit-atau-tag-stabil>
   docker compose -f docker-compose.prod.yml --env-file .env up -d --build
   ```
2. Jika migrasi skema perlu dipulihkan, restore dump PostgreSQL sebelum migrasi:
   ```bash
   docker compose -f docker-compose.prod.yml exec -T postgres \
     pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists \
     < backups/nippia_skd_<timestamp>.dump
   ```

---

## 14. Troubleshooting Umum

- **API langsung exit pada startup (`[CONFIG ERROR]`)**: Pastikan `NODE_ENV=production` memiliki `JWT_ACCESS_SECRET` & `JWT_REFRESH_SECRET` minimal 32 karakter unik, `DATABASE_URL` terisi, serta `CORS_ORIGIN` & `APP_URL` bukan `localhost`.
- **Error `403 SIMULATED_PAYMENT_DISABLED` saat checkout**: Fitur simulasi pembayaran lokal memang dikunci mati pada `NODE_ENV=production`; gunakan `MIDTRANS_SNAP` atau `TRANSFER_MANUAL`.
- **Socket.IO Live Akbar terputus di balik Nginx**: Pastikan host reverse proxy meneruskan header `Upgrade` dan `Connection "upgrade"` serta `proxy_read_timeout 86400`.
- **Google Sign-In gagal setelah pindah domain**: Perbarui `GOOGLE_CLIENT_ID`, Authorized JavaScript origins, dan redirect URI `/api/v1/auth/google/callback` di Google Cloud Console.
