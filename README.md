# 🏠 KosMate - Modern Boarding House Management (Microservice Architecture)

**KosMate** adalah sistem manajemen kos-kosan modern yang dirancang ulang dengan arsitektur **3-Container Microservice** yang terisolasi, *cloud-native*, efisien, dan siap di-*deploy* ke lingkungan container (Docker Compose, Kubernetes, atau AWS ECS).

---

## 🏗️ Arsitektur 3 Container (Decoupled Microservice)

Aplikasi ini dipisahkan menjadi 3 layanan independen sesuai kaidah *microservices*:

```
+-----------------------------------------------------------------------------------+
|                                  DOCKER NETWORK                                   |
|                                                                                   |
|  [Browser / Client]                                                               |
|          │                                                                        |
|          ▼ :8080                                                                  |
|  +───────────────────────────────────+                                            |
|  |     CONTAINER 1: FRONTEND         |                                            |
|  |  • React 18 + Vite + Tailwind CSS |                                            |
|  |  • Nginx Alpine (Reverse Proxy)   |                                            |
|  +───────────────────────────────────+                                            |
|          │                                                                        |
|          │ Proxy: /api/*  &  /health                                              |
|          ▼ :5000                                                                  |
|  +───────────────────────────────────+                                            |
|  |     CONTAINER 2: BACKEND API      |                                            |
|  |  • Node.js 20 Express (REST API)  |                                            |
|  |  • Liveness & Readiness Probes    |                                            |
|  |  • Graceful Shutdown Handlers     |                                            |
|  +───────────────────────────────────+                                            |
|          │                                                                        |
|          │ TCP: 5432 (Pool Connections)                                           |
|          ▼                                                                        |
|  +───────────────────────────────────+                                            |
|  |     CONTAINER 3: DATABASE         |                                            |
|  |  • PostgreSQL 16 Alpine           |                                            |
|  |  • Auto-schema & Seed Ingestion   |                                            |
|  |  • Persistent Docker Volume       |                                            |
|  +───────────────────────────────────+                                            |
+-----------------------------------------------------------------------------------+
```

---

## ⚡ Perbandingan Teknologi: Monolith PHP vs Microservice Baru

| Aspek | Legacy (PHP Monolith) | Modern Microservice KosMate v2 |
| :--- | :--- | :--- |
| **Arsitektur** | Server-Side Monolith (HTML + PHP tercampur) | Decoupled SPA + REST API + Relational DB |
| **Frontend** | Script PHP + CSS statis sederhana | React 18, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Prosedural PHP dengan mysqli script | Node.js Express ES Modules, Controller-Route pattern |
| **Database** | MySQL mentah tanpa healthcheck | PostgreSQL 16 Alpine + pg_isready healthcheck |
| **Containerization** | 1 web container besar + 1 DB | 3 container khusus (Frontend, Backend, Database) |
| **Reverse Proxy** | Tidak ada | Nginx Alpine internal proxy (`/api` & SPA routing) |
| **Cloud Probes** | Tidak tersedia | Liveness (`/health`) & Readiness (`/ready`) |
| **Lifecycle** | Hard stop | Graceful shutdown (`SIGTERM` / `SIGINT`) |

---

## 🚀 Cara Menjalankan Aplikasi

### Opsi 1: Menjalankan dengan Docker Compose (Direkomendasikan)

Pastikan Docker Desktop sudah terpasang dan berjalan di sistem Anda:

```bash
# 1. Masuk ke direktori KosMate
cd KosMate

# 2. Jalankan PowerShell deployment script (atau gunakan docker compose)
./deploy-local.ps1

# Atau gunakan perintah docker langsung:
docker compose up -d --build
```

Setelah container berjalan:
- **Frontend Dashboard**: [http://localhost:8080](http://localhost:8080)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Check Probe**: [http://localhost:5000/health](http://localhost:5000/health)
- **Readiness Probe**: [http://localhost:5000/ready](http://localhost:5000/ready)

### Memeriksa Status Container:
```bash
docker compose ps
```

### Menghentikan Container:
```bash
docker compose down
```

---

## 📁 Struktur Direktori Proyek

```
KosMate/
├── backend/                   # Container 2: Node.js Express REST API
│   ├── src/
│   │   ├── config/            # Database pool & auto-migrations
│   │   ├── controllers/       # Business logic (Kamar, Penghuni, Pembayaran, dll)
│   │   ├── middlewares/       # Error handler & CORS
│   │   ├── routes/            # REST API endpoints
│   │   └── server.js          # App bootstrap & graceful shutdown
│   ├── Dockerfile             # Multi-stage production container
│   └── package.json
├── frontend/                  # Container 3: Single Page Application (SPA)
│   ├── src/
│   │   ├── api/               # API client
│   │   ├── components/        # Navbar & reusable UI
│   │   ├── pages/             # Dashboard, Kamar, Penghuni, Pembayaran, Maintenance
│   │   └── utils/             # Formatters (Rupiah, Tanggal)
│   ├── nginx.conf             # Nginx reverse proxy & SPA fallback
│   ├── Dockerfile             # Multi-stage build + Nginx Alpine
│   └── package.json
├── database/                  # Container 1: PostgreSQL Init Assets
│   └── init.sql               # Skema tabel, indeks, dan data awal (seed)
├── legacy-php/                # Arsip kode PHP lama untuk referensi
├── docker-compose.yml         # Orkestrasi 3 container
├── deploy-local.ps1           # Skrip deployment otomatis PowerShell
└── .env.example               # Contoh environment variable
```

---

## 📡 Daftar Endpoint REST API

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/health` | Liveness check (status proses Node.js) |
| `GET` | `/ready` | Readiness check (konektivitas ke database PostgreSQL) |
| `GET` | `/api/dashboard/stats` | Agregasi statistik kamar, penghuni, omzet, dan tiket |
| `GET` | `/api/kamar` | Daftar seluruh kamar (mendukung query filter `status` & `search`) |
| `POST` | `/api/kamar` | Tambah data kamar baru |
| `PUT` | `/api/kamar/:id` | Update data kamar |
| `DELETE` | `/api/kamar/:id` | Hapus kamar (dengan proteksi integritas relasi) |
| `GET` | `/api/penghuni` | Daftar penghuni dengan relasi data kamar |
| `POST` | `/api/penghuni` | Pendaftaran penghuni baru (otomatis set kamar 'Terisi') |
| `PUT` | `/api/penghuni/:id` | Perbarui data penghuni |
| `DELETE` | `/api/penghuni/:id` | Hapus data penghuni |
| `GET` | `/api/pembayaran` | Riwayat dan tagihan sewa kos |
| `POST` | `/api/pembayaran` | Catat tagihan / pembayaran sewa |
| `PUT` | `/api/pembayaran/:id` | Perbarui status pembayaran (Lunas / Belum Lunas) |
| `DELETE` | `/api/pembayaran/:id` | Hapus data pembayaran |
| `GET` | `/api/maintenance` | Daftar keluhan perbaikan fasilitas kos |
| `POST` | `/api/maintenance` | Buat tiket perbaikan baru |
| `PUT` | `/api/maintenance/:id` | Ubah status tiket (Menunggu -> Diproses -> Selesai) |
| `DELETE` | `/api/maintenance/:id` | Hapus tiket perbaikan |

---

## ⚙️ Variabel Lingkungan (.env)

| Variabel | Default | Keterangan |
| :--- | :--- | :--- |
| `FRONTEND_PORT` | `8080` | Port host untuk web dashboard |
| `BACKEND_PORT` | `5000` | Port host untuk REST API |
| `DB_PORT` | `5432` | Port host untuk PostgreSQL |
| `DB_NAME` | `kosmate_db` | Nama database |
| `DB_USER` | `kosmate` | Username database |
| `DB_PASSWORD` | `kosmate_secret` | Password database |

