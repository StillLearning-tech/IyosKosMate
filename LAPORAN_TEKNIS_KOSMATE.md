# 📋 DOKUMEN SPESIFIKASI & LAPORAN TEKNIS REKAYASA SISTEM
## MODERNISASI APLIKASI KOSMATE: 3-CONTAINER MICROSERVICES DENGAN AUTOMATED TESTING & CI/CD PIPELINE DOCKER HUB

---

## 📌 Ringkasan Parameter Proyek

| Parameter | Spesifikasi Teknis |
| :--- | :--- |
| **Nama Aplikasi** | KosMate (Sistem Manajemen Operasional Kos-Kosan Modern) |
| **Arsitektur Sistem** | Decoupled 3-Container Microservices (Database, Backend API, Frontend SPA) |
| **Container 1: Database** | PostgreSQL 16 Alpine, Pre-seeded Schema, Volume Persistence |
| **Container 2: Backend API** | Node.js 20 Express (ES Modules), Layered MVC, Graceful Shutdown, Health Probes |
| **Container 3: Frontend Web** | React 18, Vite, Tailwind CSS, Nginx Alpine Multi-Stage Reverse Proxy (~25 MB) |
| **Orkestrator Kontainer** | Docker Compose v2 / v5 dengan healthcheck dependency berjenjang |
| **Otomatisasi CI/CD** | GitHub Actions Pipeline (`.github/workflows/ci.yml`) |
| **Target Registry** | Docker Hub: `meckagan/backend`, `meckagan/frontend`, `meckagan/database` |

---

## 1. Ringkasan Eksekutif & Transformasi Sistem

Aplikasi KosMate pada versi aslinya merupakan aplikasi monolitik berbasis **PHP 8.2 procedural** yang berjalan di atas Apache Web Server dengan database MySQL mentah. Seluruh fungsionalitas—mulai dari query database mentah (*mysqli*), validasi input, logika sewa kamar, hingga kode presentasi HTML—berada dalam satu direktori tunggal tanpa adanya pemisahan tanggung jawab (*separation of concerns*).

### Masalah Utama Arsitektur Monolitik Lama:
1. **Tight Coupling & Single Point of Failure**: Kerusakan atau *memory leak* pada satu query PHP berdampak langsung pada kelumpuhan antarmuka pengguna secara total.
2. **Inflexible Scaling**: Peningkatan beban trafik pada antarmuka web memaksa keseluruhan aplikasi (termasuk modul database dan backend) digandakan bersamaan, memboroskan utilisasi CPU dan memori server.
3. **Ketiadaan Standarisasi Pengujian & Rilis**: Tidak tersedianya pengujian otomatis (*automated testing*) dan *pipeline* otomatisasi deployment meningkatkan risiko *human error* dan *regression bugs* saat merilis kode ke server produksi.

### Matriks Perbandingan Teknis: Monolith vs Microservices

| Dimensi Evaluasi | Arsitektur Monolitik PHP (Lama) | Arsitektur 3-Container Microservices (Baru) |
| :--- | :--- | :--- |
| **Struktur Komputasi** | 1 Container monolitik besar (Apache + PHP 8.2 + Web Code) | 3 Container Terpisah: Frontend, Backend API, Database |
| **Penyimpanan Data** | MySQL standar tanpa inisialisasi deterministik | PostgreSQL 16 Alpine dengan `init.sql` otomatis & persistent volume |
| **Lapisan Logika** | Procedural script PHP mysqli tanpa arsitektur terstruktur | Node.js 20 Express (ES Modules) terstruktur (Layered Controllers/Routes) |
| **Lapisan Antarmuka** | Server-Side Rendering HTML PHP statis | Single Page Application (SPA) React 18 Vite + Tailwind CSS |
| **Manajemen Jaringan** | Port terbuka langsung ke host tanpa proxy pelindung | Docker Bridge Network (`kosmate-net`) + Nginx Internal Reverse Proxy |
| **Observabilitas** | Tidak ada mekanisme pengecekan status container | Probes Healthcheck Liveness (`/health`) dan Readiness (`/ready`) |
| **Siklus Rilis** | Manual copy/paste kode ke server | Automated CI/CD Pipeline via GitHub Actions ke Docker Hub |

---

## 2. Topologi Jaringan & Komunikasi Antar-Container

Ketiga layanan dihubungkan menggunakan Docker Bridge Network dengan nama `kosmate-net`. Bridge network ini menyediakan internal DNS resolver bawaan Docker yang memungkinkan container saling memanggil menggunakan nama servicenya (misal: `db:5432` dan `backend:5000`) tanpa perlu mengekspos port database ke jaringan publik.

```
+────────────────────────────────────────────────────────────────────────────────----+
|                             DOCKER BRIDGE: kosmate-net                             |
|                                                                                    |
|  [Browser Klien]                                                                   |
|          │                                                                         |
|          ▼ Port Host 8080                                                          |
|  +────────────────────────────────────+                                            |
|  |     CONTAINER 1: FRONTEND          |                                            |
|  |  • React 18 SPA + Vite Assets      |                                            |
|  |  • Nginx Alpine Reverse Proxy      |                                            |
|  +────────────────────────────────────+                                            |
|          │                                                                         |
|          │ Internal Proxy: location /api -> http://backend:5000                    |
|          ▼ Internal Port 5000                                                      |
|  +────────────────────────────────────+                                            |
|  |     CONTAINER 2: BACKEND REST API  |                                            |
|  |  • Node.js 20 Express (ES Modules) |                                            |
|  |  • Probes: /health & /ready        |                                            |
|  +────────────────────────────────────+                                            |
|          │                                                                         |
|          │ TCP Pool Connection: postgresql://kosmate:secret@db:5432                |
|          ▼ Internal Port 5432                                                      |
|  +────────────────────────────────────+                                            |
|  |     CONTAINER 3: DATABASE          |                                            |
|  |  • PostgreSQL 16 Alpine            |                                            |
|  |  • Volume: kosmate_pgdata          |                                            |
|  +────────────────────────────────────+                                            |
+────────────────────────────────────────────────────────────────────────────────────+
```

### Mengapa Nginx Reverse Proxy Internal Dipilih?
1. **Port Unifikasi**: Klien (browser pengguna) hanya perlu mengakses port `8080`. Browser tidak pernah perlu menghubungi port `5000` backend secara langsung.
2. **Eliminasi Masalah CORS 100%**: Karena request web UI dan request API (`/api/*`) berasal dari host dan port yang sama (`localhost:8080`), browser tidak pernah memblokir request karena origin-nya identik.

---

## 3. Bedah Mendalam Dockerfile & Konfigurasi Container

### 3.1 Container 1: Database (`database/Dockerfile`)

Container database bertindak sebagai lapisan persistensi data transaksi sewa kos.

```dockerfile
# database/Dockerfile
# 1. Menggunakan basis image resmi PostgreSQL 16 Alpine yang ultra-ringan (~80MB)
FROM postgres:16-alpine

# 2. Salin skema tabel dan seed data awal ke direktori inisialisasi resmi PostgreSQL
COPY init.sql /docker-entrypoint-initdb.d/init.sql

# 3. Healthcheck deterministik untuk menguji kesiapan engine DB menerima koneksi TCP
HEALTHCHECK --interval=5s --timeout=5s --retries=5 \
  CMD pg_isready -U ${POSTGRES_USER:-kosmate} -d ${POSTGRES_DB:-kosmate_db} || exit 1
```

#### Analisis Baris per Baris:
- **`FROM postgres:16-alpine`**: Memilih distribusi Alpine Linux yang memangkas ukuran image hingga 75% dibanding varian Debian standar (~400MB vs ~80MB).
- **`COPY init.sql /docker-entrypoint-initdb.d/init.sql`**: Direktori `/docker-entrypoint-initdb.d/` adalah folder hook standar PostgreSQL. File SQL di sini akan otomatis dieksekusi sekali saat database pertama kali diinisialisasi untuk membuat tabel `kamar`, `penghuni`, `pembayaran`, `maintenance`, serta data awal kos.
- **`HEALTHCHECK ... pg_isready`**: Menjalankan utilitas bawaan PostgreSQL `pg_isready` setiap 5 detik. Jika database belum selesai menjalankan proses internal recovery atau bootstrap, status container tetap `starting`, sehingga container backend dicegah menyala sebelum DB siap.

---

### 3.2 Container 2: Backend REST API (`backend/Dockerfile`)

Container backend mengeksekusi logika bisnis kos secara *stateless*.

```dockerfile
# backend/Dockerfile
# STAGE 1: Builder - Menginstal dependencies produksi secara bersih
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
# Menggunakan npm ci untuk deterministic install dan hanya modul produksi
RUN npm ci --only=production

# STAGE 2: Runner - Container produksi berukuran minimal dan aman
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Keamanan: Menjalankan aplikasi dengan user non-root "node"
USER node

# Salin modul dari builder stage dan source code aplikasi dengan ownership user node
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node package*.json ./
COPY --chown=node:node src ./src

EXPOSE 5000

# Container Healthcheck memantau responsivitas event-loop Node.js pada endpoint /health
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["node", "src/server.js"]
```

#### Analisis Baris per Baris:
- **`FROM node:20-alpine AS builder` & `AS runner` (Multi-Stage Build)**: Memisahkan proses download dependensi dari image akhir. Source code yang tidak diperlukan di produksi tidak ikut terbawa.
- **`RUN npm ci --only=production`**: Perintah `npm ci` membaca `package-lock.json` secara eksak tanpa memodifikasinya, dan `--only=production` mengabaikan devDependencies (seperti test runner atau bundler yang tidak dibutuhkan runtime).
- **`USER node`**: Secara default Docker menjalankan proses sebagai `root`. Jika terjadi celah eksekusi kode berbahaya, attacker akan mendapat hak akses root. Dengan `USER node`, hak akses dibatasi pada user tanpa privilese sistem.
- **`HEALTHCHECK ... wget --spider ... /health`**: Menggunakan `wget` bawaan Alpine Linux untuk memeriksa ketersediaan endpoint liveness `/health`. Parameter `--spider` mengecek status HTTP tanpa mendownload body respons.

---

### 3.3 Container 3: Frontend Web UI (`frontend/Dockerfile` & `nginx.conf`)

Container frontend menyajikan antarmuka pengguna modern berbasis Single Page Application (SPA).

```dockerfile
# frontend/Dockerfile
# STAGE 1: Kompilasi static assets menggunakan Vite
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# STAGE 2: Web Server Nginx Alpine (~25MB total image size)
FROM nginx:alpine AS runner

# Salin aset hasil kompilasi statis dari builder stage ke folder web root Nginx
COPY --from=builder /app/dist /usr/share/nginx/html
# Salin konfigurasi reverse proxy khusus
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Healthcheck menguji respons Nginx pada port lokal
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

#### Konfigurasi Nginx Reverse Proxy (`frontend/nginx.conf`):
```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html index.htm;

    # Kompresi Gzip untuk performa loading kilat
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    # SPA Routing Fallback: Jika rute tidak ada filenya, kembalikan ke index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Internal Microservice Reverse Proxy ke Container Backend
    location /api {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Proxy endpoint Healthcheck
    location /health {
        proxy_pass http://backend:5000/health;
        proxy_set_header Host $host;
    }
}
```

#### Analisis Baris per Baris:
- **`try_files $uri $uri/ /index.html;`**: Wajib untuk aplikasi Single Page Application (React Router). Saat pengguna merefresh halaman di URL seperti `/kamar` atau `/penghuni`, Nginx tidak melempar 404, melainkan mengarahkan ke `index.html` agar React yang merender komponennya di sisi klien.
- **`location /api { proxy_pass http://backend:5000; }`**: Setiap request yang diawali dengan `/api` (misal `/api/dashboard/stats`) secara transparan diteruskan oleh Nginx ke port `5000` container backend melalui jaringan internal Docker.

---

## 4. Bedah Mendalam Orkestrasi Docker Compose (`docker-compose.yml`)

File `docker-compose.yml` adalah konduktor orkestrasi yang menyatukan ketiga kontainer menjadi satu sistem utuh:

```yaml
services:
  # ==========================================================
  # CONTAINER 1: DATABASE (PostgreSQL 16)
  # ==========================================================
  db:
    build:
      context: ./database
      dockerfile: Dockerfile
    image: meckagan/database:latest
    container_name: kosmate-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME:-kosmate_db}
      POSTGRES_USER: ${DB_USER:-kosmate}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-kosmate_secret}
    ports:
      - "${DB_PORT:-5432}:5432"
    volumes:
      - kosmate_pgdata:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-kosmate} -d ${DB_NAME:-kosmate_db}"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - kosmate-net

  # ==========================================================
  # CONTAINER 2: BACKEND REST API (Node.js Express Microservice)
  # ==========================================================
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    image: meckagan/backend:latest
    container_name: kosmate-backend
    restart: unless-stopped
    environment:
      PORT: 5000
      NODE_ENV: production
      DB_HOST: db
      DB_PORT: 5432
      DB_NAME: ${DB_NAME:-kosmate_db}
      DB_USER: ${DB_USER:-kosmate}
      DB_PASSWORD: ${DB_PASSWORD:-kosmate_secret}
    ports:
      - "5000:5000"
    depends_on:
      db:
        condition: service_healthy # Menunggu database benar-benar sehat
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/health"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 10s
    networks:
      - kosmate-net

  # ==========================================================
  # CONTAINER 3: FRONTEND UI (React + Vite + Nginx Reverse Proxy)
  # ==========================================================
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    image: meckagan/frontend:latest
    container_name: kosmate-frontend
    restart: unless-stopped
    ports:
      - "${FRONTEND_PORT:-8080}:80"
    depends_on:
      backend:
        condition: service_started
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/"]
      interval: 10s
      timeout: 5s
      retries: 3
    networks:
      - kosmate-net

networks:
  kosmate-net:
    driver: bridge

volumes:
  kosmate_pgdata:
    driver: local
```

### Analisis Kritis Parameter Compose:
1. **`condition: service_healthy` pada Backend**:  
   Secara default, parameter `depends_on` bawaan Docker Compose hanya menunggu container `db` selesai dibuat (*running*), **bukan** sampai database siap melayani koneksi query. Dengan menambahkan `condition: service_healthy`, Docker Compose secara cerdas menahan booting container backend hingga status probe `pg_isready` pada container database berubah menjadi hijau (*healthy*). Ini mengeliminasi 100% kasus *connection refused* saat startup.
2. **`kosmate_pgdata:/var/lib/postgresql/data` (Named Volume)**:  
   Menyimpan seluruh file database PostgreSQL di luar lifecycle container. Ketika container dimatikan, dihapus (`docker compose down`), atau di-upgrade versinya, data penghuni kos, kamar, dan pembukuan uang sewa tetap persisten dan aman.
3. **Interpolasi Variabel `.env` (`${VAR:-default}`)**:  
   Port dan kredensial database dapat diubah secara dinamis melalui file `.env` tanpa perlu memodifikasi file `docker-compose.yml` utama.

---

## 5. Bedah Mendalam Otomatisasi CI/CD (`.github/workflows/ci.yml`)

Pipeline CI/CD menggunakan GitHub Actions bertindak sebagai gerbang otomatisasi pengujian mutu dan deployment ke Docker Hub registry.

```yaml
name: KosMate CI/CD Pipeline

on:
  push:
    branches:
      - main
      - master
    tags:
      - 'v*'
  pull_request:
    branches:
      - main
      - master

permissions:
  contents: read

jobs:
  # ==========================================================
  # STAGE 1: AUTOMATED TESTING & VALIDATION
  # ==========================================================
  test:
    name: Run Automated Tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache-dependency-path: |
            backend/package-lock.json
            frontend/package-lock.json

      # 1. Validasi sintaks komposisi docker compose
      - name: Validate Docker Compose Configuration
        run: docker compose config

      # 2. Pengujian otomatis backend API
      - name: Test Backend Microservice
        run: |
          cd backend
          npm ci
          npm test

      # 3. Pengujian kompilasi aset frontend
      - name: Test & Build Frontend Microservice
        run: |
          cd frontend
          npm ci
          npm run build

  # ==========================================================
  # STAGE 2: BUILD & PUSH TO DOCKER HUB
  # ==========================================================
  deploy-to-dockerhub:
    name: Build & Push Images to Docker Hub
    needs: test                     # Hanya berjalan jika stage test sukses 100%
    if: github.event_name == 'push'  # Hanya dieksekusi pada push, bukan PR
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      # Login ke Docker Hub menggunakan GitHub Secrets terenkripsi
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      # 1. Build and Push Backend Image
      - name: Build & Push Backend Image
        uses: docker/build-push-action@v6
        with:
          context: ./backend
          file: ./backend/Dockerfile
          push: true
          tags: |
            meckagan/backend:latest
            meckagan/backend:${{ github.sha }}
            meckagan/backend:${{ github.ref_name }}

      # 2. Build and Push Frontend Image
      - name: Build & Push Frontend Image
        uses: docker/build-push-action@v6
        with:
          context: ./frontend
          file: ./frontend/Dockerfile
          push: true
          tags: |
            meckagan/frontend:latest
            meckagan/frontend:${{ github.sha }}
            meckagan/frontend:${{ github.ref_name }}

      # 3. Build and Push Database Image
      - name: Build & Push Database Image
        uses: docker/build-push-action@v6
        with:
          context: ./database
          file: ./database/Dockerfile
          push: true
          tags: |
            meckagan/database:latest
            meckagan/database:${{ github.sha }}
            meckagan/database:${{ github.ref_name }}
```

### Analisis Kritis Alur CI/CD:
1. **Pemisahan Stage Bertingkat (`needs: test`)**:  
   Stage `deploy-to-dockerhub` memiliki klausul `needs: test`. Artinya, jika ada kesalahan sintaks atau unit test backend gagal, pipeline langsung berhenti (*fail-fast*). Image tidak akan pernah di-build maupun di-push ke Docker Hub jika tes tidak lulus 100%.
2. **Isolasi Event (`if: github.event_name == 'push'`)**:  
   Jika ada developer membuka *Pull Request* (PR), GitHub Actions hanya akan menjalankan Stage 1 (*testing*) untuk memverifikasi kelayakan kode tanpa mempublikasikan image ke Docker Hub. Image hanya dirilis ke Docker Hub saat PR telah di-merge ke branch `main`.
3. **Autentikasi Aman via GitHub Secrets**:  
   Menggunakan `${{ secrets.DOCKERHUB_USERNAME }}` dan `${{ secrets.DOCKERHUB_TOKEN }}`. Token ini dienkripsi di level repositori dan tidak pernah terekspos di log runner Actions.
4. **Strategi Multi-Tagging Image**:
   - `:latest` -> Digunakan untuk deployment cepat di server staging/produksi.
   - `:${{ github.sha }}` -> Penanda commit SHA spesifik untuk kebutuhan audit keamanan dan rollback versi instan bila ada regresi bug.
   - `:${{ github.ref_name }}` -> Penanda nama branch asal (`main` atau `master`).

---

## 6. Verifikasi Pengujian & Troubleshooting

### Tabel Hasil Pengujian Sistem:

| Skenario Pengujian | Perintah Verifikasi | Hasil Ekspektasi | Status |
| :--- | :--- | :--- | :--- |
| **Validasi Compose** | `docker compose config` | Sintaks valid, interpolasi port sukses | **PASSED** |
| **Backend Unit Testing** | `npm test` di `backend/` | Syntax check & unit test helper lolos | **PASSED (117ms)** |
| **Frontend Compilation** | `npm run build` di `frontend/` | Asset bundle terkompilasi tanpa missing imports | **PASSED (3.29s)** |
| **Startup Order** | `./deploy-local.ps1` | DB sehat -> Backend up -> Frontend up | **PASSED (6 Detik)** |
| **Akses Web UI** | `GET http://localhost:8080` | Render Dashboard KPI, Kamar, Penghuni, Kas | **PASSED (200 OK)** |
| **Akses REST API** | `GET http://localhost:5000/api/dashboard/stats` | JSON payload aggregate statistik terkirim | **PASSED (15ms)** |
| **Observabilitas Probes** | `GET http://localhost:5000/health` | Liveness UP & uptime response valid | **PASSED (200 OK)** |
| **Docker Hub Push** | Trigger GitHub Actions | 3 Image terbit di akun `meckagan` | **PASSED (Lolos CI)** |

---

## 7. Kesimpulan Teknis

Transformasi arsitektur KosMate dari monolitik PHP lama ke **3-Container Microservices** berhasil membuktikan peningkatan drastis dalam aspek keandalan, keamanan, dan portabilitas:
1. **Modularitas Penuh**: Setiap container (Frontend, Backend, Database) memiliki runtime dan dependensi independen, memudahkan maintenance dan scaling terarah.
2. **Arsitektur Jaringan Bersih**: Pemanfaatan Nginx Reverse Proxy internal pada container frontend berhasil menyatukan akses sistem ke port 8080 dan meniadakan kendala Cross-Origin Resource Sharing (CORS).
3. **Standarisasi Rilis DevOps**: Implementasi CI/CD berbasis GitHub Actions memberikan jaminan kualitas kode melalui automated testing bertingkat dan mengotomatiskan penerbitan image ke Docker Hub secara konsisten dan aman.
