# 🎙️ SCRIPT PRESENTASI KOSMATE (3 PEMBICARA)
**Topik**: *Modernisasi KosMate Menjadi 3-Container Microservices & Implementasi CI/CD Pipeline Docker Hub*  
**Durasi Total**: ~12 - 15 Menit (Tiap pembicara ~4 - 5 menit)  
**Fokus Utama**: Arsitektur Container, Isolasi Jaringan, Automated Testing, dan Pipeline CI/CD Docker Hub.

---

## 👥 Pembagian Peran & Topik Presentasi

| Pembicara | Peran | Topik Bahasan Utama |
| :--- | :--- | :--- |
| **Pembicara 1** | *System Architect & Data Engineer* | Pembukaan, Latar Belakang Masalah Monolith, Solusi 3-Container, & Bedah Container Database |
| **Pembicara 2** | *Fullstack & Network Engineer* | Bedah Container Backend API, Container Frontend SPA, Reverse Proxy Nginx, & Docker Compose Orchestration |
| **Pembicara 3** | *DevOps & Cloud Engineer* | Kebutuhan CI/CD, Bedah Workflow GitHub Actions, Automated Testing, Deployment Multi-Container Docker Hub, Demo & Penutup |

---

## 🎬 SCRIPT PEMBICARA 1: PENDAHULUAN & DATABASE CONTAINER
*(Estimasi waktu: 00:00 - 04:30)*

> **[Slide 1: Judul Proyek & Tim]**

**Pembicara 1:**  
*"Selamat pagi/siang kepada Bapak/Ibu Dosen penguji dan rekan-rekan sekalian.*  
*Perkenalkan, kami dari tim pengembang KosMate. Hari ini kami akan mempresentasikan proyek transformasi arsitektur perangkat lunak kami yang berjudul:*  
**'Modernisasi Aplikasi KosMate Menjadi 3-Container Microservices dengan Automated Testing dan CI/CD Pipeline ke Docker Hub'**.*  
*Presentasi ini akan dibawakan oleh saya sendiri [Nama Pembicara 1], bersama rekan saya [Nama Pembicara 2], dan [Nama Pembicara 3]."*

> **[Slide 2: Latar Belakang & Masalah Monolith Lama]**

**Pembicara 1:**  
*"Rekan-rekan sekalian, KosMate awalnya dibangun menggunakan arsitektur monolitik PHP tradisional. Ketika tim kami mengevaluasi sistem tersebut, kami menemukan tiga kelemahan fatal:*  
1. *Pertama, **Tight Coupling**. Logika bisnis, query database mysqli, dan tampilan HTML tercampur di file yang sama. Jika ada salah satu modul error, seluruh sistem berisiko lumpuh.*  
2. *Kedua, **Inflexible Scaling**. Ketika hanya API atau antarmuka yang butuh kapasitas server tambahan, kita terpaksa menggandakan keseluruhan aplikasi termasuk modul-modul lain yang tidak perlu.*  
3. *Dan ketiga, **Ketiadaan Otomatisasi CI/CD**. Pengujian dan deployment dilakukan secara manual yang rentan terhadap human error."*

> **[Slide 3: Solusi 3-Container Microservices]**

**Pembicara 1:**  
*"Untuk menyelesaikan masalah ini, kami merombak total arsitektur KosMate menjadi **3 Container Mandiri** yang berjalan di atas Docker:*  
- *Container pertama adalah **Database Layer**,*  
- *Container kedua adalah **Backend REST API**,*  
- *Dan container ketiga adalah **Frontend Web SPA**.*  
*Ketiga container ini diisolasi dalam satu virtual bridge network yang sama, yaitu `kosmate-net`."*

> **[Slide 4: Bedah Container 1 - Database Layer]**

**Pembicara 1:**  
*"Sekarang, mari kita bedah container pertama, yaitu **Database**.*  
*Di arsitektur baru, kami memigrasikan database ke **PostgreSQL 16 Alpine**. Mengapa? Karena PostgreSQL memiliki reliabilitas transaksi ACID yang sangat tinggi dan image Alpine-nya sangat ringan.*  

*Keunggulan utama yang kami terapkan di container database ini adalah:*  
- *Pertama, **Pre-seeded Schema**. Kami membuat custom `Dockerfile` khusus di folder `database/` yang otomatis menyalin skrip `init.sql`. Artinya, setiap kali container database dinyalakan, tabel kamar, penghuni, pembayaran, dan maintenance langsung tercipta lengkap dengan seed data awal tanpa perlu setup manual.*  
- *Kedua, **Healthcheck DeterministiK**. Kami menyematkan probe `pg_isready` dengan interval 5 detik. Container backend tidak akan diizinkan menyala sebelum database benar-benar siap menerima koneksi.*  
- *Dan ketiga, **Volume Persistence**. Data disimpan di Docker Volume `kosmate_pgdata`, sehingga ketika container di-restart atau di-update, data transaksi kos tidak akan pernah hilang.*  

*Selanjutnya, arsitektur Backend API dan Frontend Web akan dipaparkan secara mendalam oleh rekan saya, [Nama Pembicara 2]. Silakan [Nama Pembicara 2]."*

---

## 🎬 SCRIPT PEMBICARA 2: BACKEND, FRONTEND, & ORKESTRASI DOCKER
*(Estimasi waktu: 04:30 - 09:00)*

> **[Slide 5: Bedah Container 2 - Backend REST API]**

**Pembicara 2:**  
*"Terima kasih rekan [Nama Pembicara 1].*  
*Saya akan melanjutkan pembahasan pada container kedua, yaitu **Backend REST API**.*  

*Backend kami tulis ulang menggunakan **Node.js 20 Express dengan standar modern ES Modules**. Kami menerapkan pola arsitektur berlapis (Layered MVC), memisahkan antara Routes, Controllers, Database Pool, dan Centralized Error Handling.*  

*Tiga fitur kunci container backend yang ramah cloud dan microservices adalah:*  
1. *Pertama, **Liveness & Readiness Probes**. Kami menyediakan endpoint `/health` untuk mengecek status proses Node, dan `/ready` untuk memastikan konektivitas ke database PostgreSQL. Ini adalah standar industri yang biasa digunakan oleh orkestrator seperti Kubernetes.*  
2. *Kedua, **Connection Pool & Auto-Reconnect**. Backend dilengkapi mekanisme exponential backoff saat database sedang startup, sehingga tidak akan langsung crash.*  
3. *Ketiga, **Graceful Shutdown**. Backend menangani sinyal `SIGTERM` dan `SIGINT` dari Docker. Saat container dihentikan atau di-scale down, koneksi database ditutup secara rapi tanpa ada request yang terputus di tengah jalan."*

> **[Slide 6: Bedah Container 3 - Frontend SPA & Nginx Reverse Proxy]**

**Pembicara 2:**  
*"Beralih ke container ketiga, yaitu **Frontend Web**.*  
*Untuk antarmuka, kami menggunakan **React 18, Vite, dan Tailwind CSS** yang menyajikan antarmuka Single Page Application yang interaktif: mulai dari dashboard KPI metrik, kelola kamar, pendaftaran penghuni, pembukuan uang sewa, hingga tiket komplain perbaikan.*  

*Yang sangat istimewa dari container frontend ini adalah arsitektur produksinya:*  
- *Kami menggunakan **Multi-Stage Dockerfile**. Tahap pertama mengkompilasi kode React dengan Node, dan tahap kedua memindahkan file statis hasil build ke web server **Nginx Alpine**. Hasilnya? Ukuran container frontend sangat ramping, hanya sekitar **25 Megabyte**!*  
- *Lebih dari itu, Nginx di container frontend ini kami fungsikan ganda sebagai **Internal Reverse Proxy**. Setiap request ke `/api` secara otomatis diteruskan langsung ke container `http://backend:5000` di dalam Docker Network.*  
- *Artinya apa? Browser pengguna **hanya perlu mengakses satu port saja, yaitu port 8080**, dan masalah **CORS (Cross-Origin Resource Sharing) hilang 100%** karena browser menganggap frontend dan backend berada di origin yang sama."*

> **[Slide 7: Orkestrasi Docker Compose]**

**Pembicara 2:**  
*"Untuk mengorkestrasi ketiga container ini secara harmonis, kami merumuskannya dalam file `docker-compose.yml`.*  
*Kami menerapkan aturan dependensi kesehatan: Backend menunggu `db` sampai `service_healthy`, dan Frontend menunggu backend sampai `service_started`.*  
*Cukup dengan satu perintah: `docker compose up -d`, seluruh ekosistem kos-kosan ini langsung aktif dalam hitungan detik.*  

*Lalu bagaimana proses pengujian dan otomatisasi rilis ke cloud-nya? Bagian ini akan dijelaskan oleh rekan saya, [Nama Pembicara 3]. Silakan."*

---

## 🎬 SCRIPT PEMBICARA 3: CI/CD PIPELINE, DOCKER HUB, & PENUTUP
*(Estimasi waktu: 09:00 - 13:30)*

> **[Slide 8: Urgensi CI/CD Pipeline]**

**Pembicara 3:**  
*"Terima kasih rekan [Nama Pembicara 2].*  
*Bapak/Ibu Dosen dan rekan-rekan sekalian, memiliki container yang hebat belum lengkap tanpa otomatisasi pengiriman kode yang andal. Di sinilah **Continuous Integration dan Continuous Deployment (CI/CD)** memainkan peran krusial.*  

*Kami merancang pipeline otomatis berbasis **GitHub Actions** yang tersimpan di file `.github/workflows/ci.yml`. Setiap kali tim kami melakukan `git push` atau `pull request` ke branch `main`, pipeline ini akan otomatis terpicu dan mengeksekusi dua tahapan utama."*

> **[Slide 9: Stage 1 - Automated Testing & Quality Gate]**

**Pembicara 3:**  
*"Tahap pertama adalah **Quality Gate & Automated Testing**.*  
*Sebelum kode diizinkan masuk ke server atau container registry, sistem akan:*  
1. *Memvalidasi konfigurasi orkestrasi dengan menjalankan `docker compose config`.*  
2. *Menjalankan **Automated Unit Testing** pada backend menggunakan framework bawaan Node.js (`node:test`). Pengujian mencakup uji fungsi format mata uang Rupiah, kalkulasi matematika, dan pengecekan sintaks.*  
3. *Menjalankan kompilasi ketat pada frontend dengan `vite build` untuk memastikan tidak ada import icon yang hilang atau sintaks JSX yang rusak.*  
*Jika salah satu pengujian gagal, pipeline langsung berhenti (fail-fast), mencegah bug lolos ke tahap produksi."*

> **[Slide 10: Stage 2 - Automated Multi-Container Push ke Docker Hub]**

**Pembicara 3:**  
*"Jika dan hanya jika Stage 1 lolos 100%, sistem melanjutkan ke **Stage 2: Deployment ke Docker Hub**.*  
- *GitHub Actions melakukan autentikasi aman ke Docker Hub menggunakan **GitHub Secrets**: `DOCKERHUB_USERNAME` dan `DOCKERHUB_TOKEN`.*  
- *Selanjutnya, GitHub Actions melakukan build multi-container secara paralel dan mem-push **tiga image container resmi** ke akun Docker Hub `meckagan`:*  
  1. `docker push meckagan/backend` *(REST API)*  
  2. `docker push meckagan/frontend` *(Web Nginx SPA)*  
  3. `docker push meckagan/database` *(PostgreSQL pre-seeded)*  

*Setiap image kami sematkan **Multi-Tag Strategy**: tag `:latest` untuk deployment terkini, tag `:<commit-sha>` untuk audit keamanan dan rollback versi, serta tag `:<branch-name>`.*  

*Dengan pipeline ini, tim pengembang cukup fokus menulis kode, dan proses pengujian hingga rilis container registry berjalan secara 100% otomatis tanpa intervensi manual!"*

> **[Slide 11: Demo Singkat & Kesimpulan]**

**Pembicara 3:**  
*"Sebagai kesimpulan dari proyek ini:*  
1. *Kami telah berhasil mengubah monolitik legacy KosMate menjadi arsitektur modern **3-Container Microservices** yang terisolasi, efisien, dan cloud-ready.*  
2. *Penerapan **Nginx Reverse Proxy** berhasil menyatukan akses frontend dan backend secara elegan di port 8080 tanpa CORS.*  
3. *Dan implementasi **CI/CD Pipeline GitHub Actions** berhasil mengotomatiskan pengujian kualitas kode dan mempublikasikan ketiga container ke Docker Hub secara konsisten dan aman.*  

*Sekian presentasi dari kelompok kami. Kami membuka sesi tanya jawab dan dengan senang hati menerima masukan dari Bapak/Ibu Dosen serta rekan-rekan sekalian. Terima kasih!"*
