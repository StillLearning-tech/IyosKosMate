# 🎥 SCRIPT VIDEO PRESENTASI & LIVE DEMO (3 ORANG)
**Format**: *Take Video Online (Zoom / Google Meet / OBS Screen Recording)*  
**Topik**: *Modernisasi KosMate Menjadi 3-Container Microservices & Otomatisasi CI/CD Pipeline ke Docker Hub*  
**Durasi Total**: ~12 - 15 Menit  
**Kelengkapan**: Dilengkapi panduan *Screen Share*, *Camera Cue*, dan *Live Demonstration* langkah demi langkah.

---

## 📋 Panduan Teknis Rekaman (Checklist Sebelum Record)

1. **Persiapan Aplikasi**:
   - Docker Desktop sudah menyala (status hijau *Engine running*).
   - VS Code sudah terbuka pada proyek KosMate di direktori `IyosKosMate`.
   - Browser sudah membuka tab:
     - Tab 1: Slide Presentasi (PowerPoint / Canva / Google Slides).
     - Tab 2: `http://localhost:8080` (Web Dashboard KosMate).
     - Tab 3: `http://localhost:5000/api/dashboard/stats` (JSON Backend).
     - Tab 4: `http://localhost:5000/health` (Healthcheck API).
     - Tab 5: Repositori GitHub tab **Actions** (`github.com/StillLearning-tech/IyosKosMate/actions`).
     - Tab 6: Profil Docker Hub `hub.docker.com/u/meckagan`.
2. **Audio & Kamera**:
   - Semua pembicara mengaktifkan kamera (*on-cam*) di sudut layar.
   - Screen Share bergantian atau dikendalikan oleh 1 orang operator (disarankan Pembicara 1 atau 2).

---

## 👥 Alur Pembagian Peran & Demo

| Pembicara | Peran | Bagian Presentasi & Live Demo |
| :--- | :--- | :--- |
| **Pembicara 1** | *System Architect & Data Engineer* | Pembukaan, Masalah Monolith Lama, Solusi 3-Container, Bedah Database, & **LIVE DEMO 1: Eksekusi Container di Terminal** |
| **Pembicara 2** | *Fullstack & Network Engineer* | Bedah Backend Node.js, Frontend React + Nginx Reverse Proxy, & **LIVE DEMO 2: Eksplorasi Fitur Web & Endpoint API** |
| **Pembicara 3** | *DevOps & Cloud Engineer* | Penjelasan CI/CD, Automated Testing, & **LIVE DEMO 3: Bukti Pipeline GitHub Actions & Image Docker Hub** |

---

## 🎬 SEGMEN 1: PEMBICARA 1 (SLIDE + DEMO DOCKER RUN)
*(Durasi: Menit 00:00 - 05:00)*

`[VISUAL: Tampilan Kamera 3 Pembicara + Screen Share Slide Judul]`

**Pembicara 1:**  
*"Halo semuanya! Selamat datang di video presentasi proyek kelompok kami.*  
*Perkenalkan, saya [Nama Pembicara 1], dan di sini saya bersama rekan saya, [Nama Pembicara 2] (lambai tangan), dan [Nama Pembicara 3] (lambai tangan).*  

*Pada video kali ini, kami akan mendemonstrasikan secara langsung proyek modernisasi perangkat lunak yang telah kami kerjakan, yaitu:*  
**'Transformasi Aplikasi KosMate Menjadi 3-Container Microservices dengan Pengujian Otomatis dan CI/CD Pipeline ke Docker Hub'**.*  

*Tanpa berlama-lama, mari kita masuk ke latar belakang permasalahannya."*

`[VISUAL: Slide Masalah Monolith PHP Lama]`

**Pembicara 1:**  
*"Awalnya, aplikasi KosMate ini adalah aplikasi monolitik berbasis PHP 8.2 procedural.*  
*Setelah tim kami mengevaluasinya, aplikasi monolitik lama memiliki tiga kekurangan fatal:*  
*1. **Kode Bercampur (Spaghetti & Tight Coupling)**: Kode query SQL, validasi logika, dan antarmuka HTML ditulis dalam satu file PHP yang sama.*  
*2. **Sulit Di-scale**: Jika pengguna hanya ramai membuka dashboard, kita tidak bisa hanya menambah server frontend. Kita terpaksa menggandakan seluruh file PHP dan database monolitik.*  
*3. **Rilis Rawan Human Error**: Tidak ada testing otomatis dan tidak ada pipeline CI/CD."*

`[VISUAL: Slide Arsitektur 3-Container Microservices]`

**Pembicara 1:**  
*"Solusinya, kami mendesain ulang KosMate menjadi arsitektur **3-Container Microservices** yang terisolasi:*  
- *Container 1: **Database** (PostgreSQL 16 Alpine)*  
- *Container 2: **Backend REST API** (Node.js 20 Express)*  
- *Container 3: **Frontend Web UI** (React 18 + Nginx Alpine)*  

*Untuk Container Database, kami tidak lagi menggunakan MySQL mentah, melainkan **PostgreSQL 16 Alpine**. Kami membuat Dockerfile khusus di folder `database/` yang otomatis menyalin skrip `init.sql`. Sehingga saat container pertama kali hidup, tabel kamar, penghuni, pembayaran, dan maintenance langsung terbentuk lengkap dengan data awal.*  
*Container ini juga dilengkapi **Healthcheck `pg_isready`** dan **Docker Volume Persistent** agar data aman tidak hilang saat container restart."*

`[VISUAL: Beralih Screen Share ke Terminal VS Code]`

**Pembicara 1 (LIVE DEMO 1):**  
*"Sekarang, mari kita buktikan secara langsung di terminal!*  
*(Sambil mengetik di terminal)*  
*Di sini kita jalankan skrip deploy yang sudah kami siapkan:*  
`./deploy-local.ps1`  
*(atau: `docker compose up -d`)*  

*(Tunjuk layar terminal saat container menyala)*  
*Bisa kita lihat bersama di layar:*  
- `kosmate-db` *berjalan di port 5432 dan statusnya `healthy`.*  
- `kosmate-backend` *berjalan di port 5000.*  
- *Dan `kosmate-frontend` berjalan di port 8080.*  
*Ketiga container ini berjalan secara independen di dalam Docker Bridge Network `kosmate-net`.*  

*Selanjutnya, rekan saya [Nama Pembicara 2] akan mendemonstrasikan bagaimana container Backend dan Frontend saling berkomunikasi secara real-time. Silakan [Nama Pembicara 2]!"*

---

## 🎬 SEGMEN 2: PEMBICARA 2 (SLIDE + DEMO FITUR WEB & API)
*(Durasi: Menit 05:00 - 09:30)*

`[VISUAL: Slide Backend Node.js & Frontend Nginx]`

**Pembicara 2:**  
*"Terima kasih [Nama Pembicara 1]!*  
*Halo semuanya, saya [Nama Pembicara 2]. Sekarang saya akan menjelaskan dua container berikutnya: Backend dan Frontend.*  

*Container kedua adalah **Backend REST API** berbasis **Node.js 20 Express (ES Modules)**. Backend ini bersifat stateless dengan arsitektur berlapis. Keunggulannya:*  
*1. Memiliki probe **Liveness (`/health`)** dan **Readiness (`/ready`)**.*  
*2. Memiliki **Connection Pooling** dengan fitur auto-reconnect saat database sedang startup.*  
*3. Menerapkan **Graceful Shutdown (`SIGTERM`)** untuk memastikan pelepasan koneksi database bersih saat container dimatikan.*  

*Container ketiga adalah **Frontend Web SPA** yang dibangun menggunakan **React 18, Vite, dan Tailwind CSS**.*  
*Kunci kecanggihan container frontend ini adalah:*  
- *Pertama, **Multi-Stage Build**: Kode React dikompilasi, lalu disajikan melalui web server ultra-ringan **Nginx Alpine (~25MB)**.*  
- *Kedua, **Nginx Reverse Proxy Internal**: Nginx dikonfigurasi agar setiap request ke `/api` otomatis diteruskan ke container `http://backend:5000` di dalam Docker Network.*  
- *Hasilnya, browser pengguna **cukup membuka satu port saja (port 8080)** dan **kendala CORS hilang 100%**!"*

`[VISUAL: Beralih Screen Share ke Browser Tab http://localhost:8080]`

**Pembicara 2 (LIVE DEMO 2):**  
*"Mari kita lihat langsung hasilnya di browser!*  

*(Buka tab `http://localhost:8080`)*  
*Inilah tampilan **Frontend Dashboard KosMate** modern.*  
*Bisa dilihat metrik real-time: Total Kamar 6, Terisi 3, Penghuni Aktif 3 orang, Pendapatan Sewa Rp 6.000.000, dan Occupancy rate 50%.*  

*(Klik menu Kamar)*  
*Di menu **Kamar**, kita bisa filter kamar: Tersedia, Terisi, atau Perbaikan. Semua aksi Tambah, Edit, dan Hapus berjalan secara reaktif via API.*  

*(Klik menu Penghuni & Pembayaran)*  
*Di menu **Penghuni**, ada kontak WhatsApp langsung dan integrasi data kamar.*  
*Di menu **Pembayaran**, ada tombol cepat 'Tandai Lunas' yang otomatis memperbarui status tagihan dan mencatat tanggal bayar.*  

*(Buka tab baru: `http://localhost:5000/api/dashboard/stats` dan `http://localhost:5000/health`)*  
*Jika kita intip langsung ke port backend 5000 di `/api/dashboard/stats`, data yang disajikan berbentuk format **JSON murni**, membuktikan bahwa backend kita sepenuhnya terpisah (decoupled) dari antarmuka frontend.*  
*Dan di endpoint `/health`, liveness probe menunjukkan status proses Node dan uptime server.*  

*Lalu, bagaimana proses pengujian otomatis dan cara kita men-deploy container ini ke cloud Docker Hub? Rekan saya [Nama Pembicara 3] akan mendemonstrasikannya secara langsung. Silakan [Nama Pembicara 3]!"*

---

## 🎬 SEGMEN 3: PEMBICARA 3 (CI/CD GITHUB ACTIONS & DOCKER HUB)
*(Durasi: Menit 09:30 - 14:00)*

`[VISUAL: Slide Alur CI/CD Pipeline GitHub Actions]`

**Pembicara 3:**  
*"Terima kasih [Nama Pembicara 2]!*  
*Halo teman-teman dan Bapak/Ibu Dosen, saya [Nama Pembicara 3].*  
*Sekarang kita masuk ke bagian yang sangat fundamental dalam praktik DevOps modern, yaitu **Automated Testing & CI/CD Pipeline**.*  

*Untuk memastikan bahwa tidak ada kode rusak yang lolos ke server, kami membangun pipeline otomatis menggunakan **GitHub Actions** yang tersimpan di file `.github/workflows/ci.yml`.*  
*Pipeline ini terdiri dari dua tahapan utama:*  
- ***Stage 1: Automated Testing***  
- ***Stage 2: Deploy to Docker Hub***"*

`[VISUAL: Beralih Screen Share ke Repositori GitHub tab 'Actions']`

**Pembicara 3 (LIVE DEMO 3 - Bagian 1: GitHub Actions):**  
*"Bisa kita lihat langsung di layar browser pada repositori GitHub kami:*  
`github.com/StillLearning-tech/IyosKosMate/actions`  

*(Tunjuk workflow run terakhir yang bertanda centang hijau)*  
*Setiap kali tim kami melakukan `git push` ke branch `main`, GitHub Actions akan menjalankan serangkaian pengujian:*  
*1. **Docker Compose Validation**: Memvalidasi integritas konfigurasi YAML.*  
*2. **Backend Unit Testing**: Menguji logika matematika, penanganan mata uang Rupiah, dan kesiapan endpoint menggunakan framework bawaan `node:test`.*  
*3. **Frontend Compilation**: Menguji bundel JSX dan CSS melalui `vite build` untuk memastikan tidak ada import icon yang hilang atau syntax error.*  

*Jika ketiga pengujian di Stage 1 ini lolos (bertanda hijau), barulah sistem secara otomatis melanjutkan ke **Stage 2: Deploy to Docker Hub**."*

`[VISUAL: Tunjukkan Step Deploy to Docker Hub pada GitHub Actions]`

**Pembicara 3 (LIVE DEMO 3 - Bagian 2: Docker Hub Registry):**  
*"Pada Stage 2:*  
*GitHub Actions melakukan autentikasi aman menggunakan **GitHub Secrets** (`DOCKERHUB_USERNAME` dan `DOCKERHUB_TOKEN`).*  
*Kemudian, sistem mem-build dan mem-push **tiga image container resmi** secara otomatis ke Docker Hub:*  
- `meckagan/backend`  
- `meckagan/frontend`  
- `meckagan/database`  

*(Buka tab Docker Hub: `hub.docker.com/u/meckagan`)*  
*Mari kita buka dashboard Docker Hub kami di akun `meckagan`.*  
*Bisa dilihat di layar:*  
- *Repositori `meckagan/backend` sudah ter-update dengan tag `:latest` dan tag Commit SHA.*  
- *Repositori `meckagan/frontend` sudah ter-update.*  
- *Dan repositori `meckagan/database` juga sudah tersedia publik.*  

*Artinya, siapapun yang ingin menjalankan KosMate di server VPS atau Kubernetes tinggal menjalankan `docker compose pull` dan aplikasi langsung terpasang dari image resmi kami di Docker Hub tanpa perlu build manual lagi!"*

`[VISUAL: Slide Kesimpulan & Kembali ke Kamera 3 Pembicara]`

**Pembicara 3 (KESIMPULAN & PENUTUP):**  
*"Sebagai kesimpulan dari proyek ini:*  
*1. Kami sukses mentransformasi aplikasi KosMate menjadi **3-Container Microservices** yang modular, terisolasi, dan berkinerja tinggi.*  
*2. Penggunaan **Nginx Reverse Proxy** berhasil menyatukan akses frontend dan backend secara elegan di port 8080 tanpa kendala CORS.*  
*3. Dan pipeline **CI/CD GitHub Actions** berhasil mengotomatiskan pengujian kualitas dan mempublikasikan ketiga container ke Docker Hub secara konsisten dan aman.*  

*Sekian video presentasi dan demonstrasi dari kelompok kami.*  
*Terima kasih atas perhatiannya, sampai jumpa!"*

`[SEMUA PEMBICARA: Melambaikan tangan ke kamera dan video berakhir]`
