import fs from 'fs';
import path from 'path';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  Header,
  Footer,
  PageNumber,
  NumberFormat
} from 'docx';

function createHeading1(text) {
  return new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 180 },
  });
}

function createHeading2(text) {
  return new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
  });
}

function createHeading3(text) {
  return new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 80 },
  });
}

function p(text, options = {}) {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        size: options.size || 22, // 11pt
        font: 'Calibri',
        bold: options.bold || false,
        italics: options.italics || false,
        color: options.color || '333333',
      }),
    ],
    spacing: { before: options.before || 60, after: options.after || 100 },
    alignment: options.alignment || AlignmentType.LEFT,
  });
}

function bullet(text, boldPrefix = '') {
  return new Paragraph({
    bullet: { level: 0 },
    children: [
      ...(boldPrefix
        ? [new TextRun({ text: boldPrefix, bold: true, size: 22, font: 'Calibri', color: '222222' })]
        : []),
      new TextRun({ text, size: 22, font: 'Calibri', color: '333333' }),
    ],
    spacing: { before: 40, after: 60 },
  });
}

function createCodeBlock(codeLines) {
  return codeLines.map(
    (line) =>
      new Paragraph({
        children: [
          new TextRun({
            text: line,
            size: 19, // ~9.5pt
            font: 'Consolas',
            color: '1E293B',
          }),
        ],
        shading: {
          type: ShadingType.CLEAR,
          fill: 'F1F5F9',
        },
        spacing: { before: 20, after: 20 },
        indent: { left: 360 },
      })
  );
}

function createTable(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map(
          (h) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: h, bold: true, size: 20, font: 'Calibri', color: 'FFFFFF' })],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 80, after: 80 },
                }),
              ],
              shading: { fill: '3B82F6' }, // Blue header
            })
        ),
      }),
      ...rows.map(
        (row, rIdx) =>
          new TableRow({
            children: row.map(
              (cell, cIdx) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: cell, size: 19, font: 'Calibri', color: '334155' })],
                      alignment: cIdx === 0 ? AlignmentType.LEFT : AlignmentType.LEFT,
                      spacing: { before: 60, after: 60 },
                    }),
                  ],
                  shading: { fill: rIdx % 2 === 0 ? 'F8FAFC' : 'FFFFFF' },
                })
            ),
          })
      ),
    ],
  });
}

// Generate Document
async function generateDocx() {
  const doc = new Document({
    creator: 'Tim Pengembang KosMate',
    title: 'Laporan Proyek Modernisasi KosMate Microservices & CI/CD',
    description: 'Dokumentasi teknis kontainerisasi 3-container dan otomatisasi CI/CD dengan Docker Hub',
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22, color: '333333' },
          paragraph: { spacing: { line: 276, before: 60, after: 100 } }, // 1.15 line spacing
        },
      },
    },
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                text: 'KosMate Microservice Architecture & CI/CD Pipeline Report',
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'KosMate Architecture & CI/CD Report',
                    size: 16,
                    color: '94A3B8',
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Halaman ', size: 18, color: '64748B' }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '64748B' }),
                  new TextRun({ text: ' dari ', size: 18, color: '64748B' }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: '64748B' }),
                ],
              }),
            ],
          }),
        },
        children: [
          // TITLE / COVER SECTION
          new Paragraph({
            text: 'LAPORAN TUGAS BESAR REKAYASA PERANGKAT LUNAK',
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'LAPORAN IMPLEMENTASI ARSITEKTUR CLOUD & DEVOPS',
                size: 24,
                bold: true,
                color: '64748B',
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 120 },
          }),
          new Paragraph({
            text: 'MODERNISASI APLIKASI KOSMATE MENJADI 3-CONTAINER MICROSERVICES DENGAN AUTOMATED TESTING & CI/CD PIPELINE',
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'MODERNISASI APLIKASI KOSMATE MENJADI 3-CONTAINER MICROSERVICES DENGAN AUTOMATED TESTING & CI/CD PIPELINE DOCKER HUB',
                size: 32,
                bold: true,
                color: '1E3A8A',
                font: 'Calibri',
              }),
            ],
            spacing: { before: 120, after: 240 },
          }),
          p('Fokus Kajian: Decoupled Multi-Container, Network Isolation, Multi-Stage Docker Builds, GitHub Actions CI/CD Automation, dan Docker Hub Registry Integration', {
            alignment: AlignmentType.CENTER,
            italics: true,
            color: '475569',
            size: 20,
            after: 360,
          }),

          // PROFIL TIM
          createTable(
            ['Peran Anggota', 'Nama Mahasiswa', 'Fokus Tanggung Jawab'],
            [
              ['Pembicara 1 / Anggota 1', 'Pembicara 1', 'System Architect, Problem Analysis, & Database Container'],
              ['Pembicara 2 / Anggota 2', 'Pembicara 2', 'Backend REST API, Frontend SPA, & Reverse Proxy Networking'],
              ['Pembicara 3 / Anggota 3', 'Pembicara 3', 'DevOps Engineer, GitHub Actions CI/CD Pipeline, & Docker Hub Deployment'],
            ]
          ),

          new Paragraph({ text: '', spacing: { before: 300 } }),

          // BAB I
          createHeading1('BAB I. PENDAHULUAN'),
          createHeading2('1.1 Latar Belakang'),
          p('Dalam era komputasi awan (cloud computing) dan DevOps modern, arsitektur monolitik tradisional kian menghadapi kendala skalabilitas, isolasi sumber daya, dan reliabilitas proses rilis perangkat lunak. Aplikasi KosMate pada versi awalnya dibangun menggunakan tumpukan teknologi monolitik PHP 8.2 procedural yang menggabungkan logika bisnis, query database (raw mysqli), dan antarmuka pengguna berbasis server-side rendering (HTML & CSS statis) ke dalam satu wadah runtime yang sama.'),
          p('Pola monolitik tersebut menimbulkan sejumlah kelemahan kritis:'),
          bullet(' Tuntutan penskalaan infrastruktur memaksa keseluruhan aplikasi digandakan, termasuk modul-modul yang tidak memerlukan beban komputasi tinggi.', 'Tight Coupling & Inflexible Scaling:'),
          bullet(' Kerusakan atau kegagalan fatal pada satu fungsi PHP (misalnya memory leak saat query) berdampak langsung pada kegagalan seluruh sistem web.', 'Single Point of Failure:'),
          bullet(' Pengujian regresi dilakukan secara manual, serta proses build dan push ke container registry tidak terstandarisasi, meningkatkan risiko human-error di server produksi.', 'Ketiadaan Pipeline CI/CD:'),
          p('Untuk menjawab tantangan tersebut, dilakukan re-engineering komprehensif terhadap proyek KosMate dengan mengadopsi prinsip 3-Container Microservices Architecture dan otomatisasi Continuous Integration / Continuous Deployment (CI/CD) ke registry Docker Hub publik (meckagan/backend, meckagan/frontend, meckagan/database).'),

          createHeading2('1.2 Rumusan Masalah'),
          bullet('Bagaimana merancang ulang arsitektur monolitik KosMate menjadi layanan terisolasi dalam 3 container independen (Frontend, Backend, Database)?'),
          bullet('Bagaimana menjamin komunikasi yang aman dan efisien antar-container menggunakan Docker Bridge Network dan reverse proxy Nginx tanpa kendala CORS?'),
          bullet('Bagaimana mengimplementasikan healthcheck berjenjang (liveness & readiness probes) agar siklus hidup container berjalan deterministik?'),
          bullet('Bagaimana membangun pipeline CI/CD otomatis berbasis GitHub Actions yang mencakup tahap validasi komposisi, unit testing backend, build frontend, dan automated push multi-container ke Docker Hub?'),

          createHeading2('1.3 Tujuan Proyek'),
          bullet('Membongkar struktur kode monolitik menjadi 3 container terisolasi: Database PostgreSQL 16 Alpine, Backend REST API Node.js Express ES Modules, dan Frontend SPA React 18 + Nginx.'),
          bullet('Menerapkan teknik Multi-Stage Dockerfile untuk memangkas ukuran image (menghemat penyimpanan hingga 80% dibanding standard images).'),
          bullet('Membangun pipeline CI/CD di GitHub Actions yang melakukan testing otomatis pada setiap push/PR dan mempublikasikan image ke repositori Docker Hub: meckagan/backend, meckagan/frontend, dan meckagan/database.'),

          // BAB II
          createHeading1('BAB II. ARSITEKTUR SISTEM & DESAIN 3-CONTAINER'),
          createHeading2('2.1 Komparasi Arsitektur Monolith vs Microservices'),
          p('Tabel berikut menyajikan transformasi paradigma dari sistem KosMate lama ke arsitektur kontainer modern:'),
          createTable(
            ['Dimensi Evaluasi', 'Arsitektur Monolitik PHP (Lama)', 'Arsitektur 3-Container Microservices (Baru)'],
            [
              ['Pola Arsitektur', 'Monolith Server-Side Rendering (HTML + SQL bercampur)', 'Decoupled SPA + Stateless REST API + Database Terpisah'],
              ['Container 1 (Database)', 'MySQL standar tanpa inisialisasi deterministik', 'PostgreSQL 16 Alpine dengan init.sql & pre-seeded image'],
              ['Container 2 (Backend)', 'Script procedural PHP bercampur presentasi', 'Node.js 20 Express (ES Modules) terstruktur (Layered MVC)'],
              ['Container 3 (Frontend)', 'Halaman PHP statis dirender server', 'React 18 + Vite SPA disajikan via Nginx Alpine High Performance'],
              ['Networking & Reverse Proxy', 'Port langsung expose tanpa proteksi', 'Docker Bridge Network (kosmate-net) + Nginx Internal Proxy (/api)'],
              ['Healthcheck / Probes', 'Tidak tersedia (Docker tidak tahu kesehatan app)', 'Liveness (/health) & Readiness (/ready) Probes berjenjang'],
              ['Ukuran Image', 'Image besar memuat runtime PHP Apache lengkap', 'Multi-stage build minimalis (~25MB Frontend, ~120MB Backend)'],
            ]
          ),

          createHeading2('2.2 Topologi & Bedah 3 Container'),
          createHeading3('Container 1: Database (meckagan/database / postgres:16-alpine)'),
          p('Container database bertindak sebagai persistent data layer. Database dimigrasikan dari MySQL ke PostgreSQL 16 Alpine karena stabilitas, kecepatan transaksi ACID, dan keunggulan ekosistem enterprise microservice. File Dockerfile khusus dibuat di direktori database/ yang menyematkan skrip skema tabel (kamar, penghuni, pembayaran, maintenance) dan seed data otomatis saat inisialisasi.'),
          ...createCodeBlock([
            '# database/Dockerfile',
            'FROM postgres:16-alpine',
            'COPY init.sql /docker-entrypoint-initdb.d/init.sql',
            'HEALTHCHECK --interval=5s --timeout=5s --retries=5 \\',
            '  CMD pg_isready -U ${POSTGRES_USER:-kosmate} -d ${POSTGRES_DB:-kosmate_db} || exit 1',
          ]),

          createHeading3('Container 2: Backend REST API (meckagan/backend)'),
          p('Container backend mengeksekusi logika bisnis kos secara stateless. Menggunakan Node.js 20 Express dengan arsitektur berlapis: config (DB pool & auto-reconnect), controllers, routes, dan centralized error handler. Backend menyediakan probe liveness (/health) dan readiness (/ready) serta menangani graceful shutdown (SIGTERM/SIGINT) untuk memastikan pelepasan koneksi database bersih saat scaling container.'),
          ...createCodeBlock([
            '# backend/Dockerfile (Multi-Stage Build)',
            'FROM node:20-alpine AS builder',
            'WORKDIR /app',
            'COPY package*.json ./',
            'RUN npm ci --only=production',
            '',
            'FROM node:20-alpine AS runner',
            'WORKDIR /app',
            'USER node',
            'COPY --chown=node:node --from=builder /app/node_modules ./node_modules',
            'COPY --chown=node:node src ./src',
            'EXPOSE 5000',
            'HEALTHCHECK --interval=30s --timeout=5s CMD wget -q -O - http://localhost:5000/health || exit 1',
            'CMD ["node", "src/server.js"]',
          ]),

          createHeading3('Container 3: Frontend Web SPA & Reverse Proxy (meckagan/frontend)'),
          p('Container antarmuka pengguna dibangun menggunakan React 18, Vite, dan Tailwind CSS. Di-bundle menggunakan teknik multi-stage build: tahap pertama melakukan kompilasi bundel JavaScript, dan tahap kedua memindahkan aset dist ke dalam server web Nginx Alpine (~25MB). Nginx dikonfigurasikan dengan try_files $uri /index.html untuk mendukung HTML5 history routing dan bertindak sebagai Reverse Proxy yang meneruskan request /api ke container backend (http://backend:5000), mengeliminasi masalah CORS secara total.'),

          createHeading2('2.3 Orkestrasi Docker Compose & Dependency Berjenjang'),
          p('Ketiga container dikelola melalui docker-compose.yml dengan isolasi bridge network kosmate-net. Mekanisme startup order diatur secara deterministik menggunakan dependensi kesehatan container:'),
          bullet('backend menunggu container db dalam kondisi status: service_healthy (pg_isready selesai).', '1. Startup DB -> Backend:'),
          bullet('frontend baru dimulai setelah container backend berhasil aktif (service_started).', '2. Startup Backend -> Frontend:'),

          // BAB III
          createHeading1('BAB III. IMPLEMENTASI CI/CD PIPELINE DENGAN DOCKER HUB'),
          createHeading2('3.1 Konsep Otomatisasi CI/CD'),
          p('Continuous Integration (CI) dan Continuous Deployment (CD) memastikan setiap pembaruan kode pada branch main/master diverifikasi secara otomatis sebelum dipaketkan dan dipublikasikan ke container registry publik Docker Hub. Hal ini menghilangkan risiko deployment aplikasi rusak ke lingkungan produksi.'),

          createHeading2('3.2 Arsitektur Workflow GitHub Actions (.github/workflows/ci.yml)'),
          p('Pipeline GitHub Actions dipecah menjadi 2 tahapan (Job) yang saling terhubung:'),
          createTable(
            ['Tahapan (Job)', 'Trigger Event', 'Tindakan yang Dijalankan', 'Output Hasil'],
            [
              [
                'Stage 1: test (Automated Testing)',
                'Push & Pull Request ke main/master',
                '1. Validasi sintaks docker compose config\n2. Backend syntax & unit testing (node --test)\n3. Frontend compilation (vite build)',
                'Verifikasi kualitas kode (Lolos/Gagal) dalam waktu < 2 menit',
              ],
              [
                'Stage 2: deploy-to-dockerhub',
                'Push ke main/master (Hanya jika Stage 1 Sukses)',
                '1. Otentikasi Docker Hub via Secrets\n2. Build & Push meckagan/backend\n3. Build & Push meckagan/frontend\n4. Build & Push meckagan/database',
                'Image publik terbaru tersedia di Docker Hub dengan multi-tagting (:latest, :SHA, :branch)',
              ],
            ]
          ),

          createHeading2('3.3 Pengujian Otomatis (Automated Testing)'),
          bullet('Validasi Konfigurasi Compose: Memastikan port mapping, environment variable, volume, dan healthcheck sintaksis valid sebelum build.', 'Compose Validation: '),
          bullet('Pengujian Backend: Menguji helper logika matematika, format mata uang Rupiah, dan integritas modul tanpa dependensi luar melalui framework node:test.', 'Unit Testing: '),
          bullet('Pengujian Frontend: Memeriksa integritas bundel TypeScript/JSX, import icon, dan CSS compiler tanpa adanya variabel tak terdefinisi.', 'Vite Build Verification: '),

          createHeading2('3.4 Strategi Multi-Tagging Image Docker Hub'),
          p('Setiap image yang di-push ke registry meckagan diberi 3 jenis tag untuk memudahkan pelacakan versi:'),
          bullet('Tag default yang menunjuk rilis paling mutakhir untuk kemudahan deployment cepat.', ':latest -> '),
          bullet('Identitas commit SHA dari git (contoh: :52489f3) untuk audit keamanan dan kemampuan rollback instan bila terjadi regresi.', ':<commit-sha> -> '),
          bullet('Penanda branch asal (contoh: :main atau :master) untuk memisahkan stage pengujian.', ':<branch-name> -> '),

          // BAB IV
          createHeading1('BAB IV. HASIL DAN EVALUASI PENGUJIAN'),
          createHeading2('4.1 Verifikasi Eksekusi Kontainer'),
          p('Pengujian deployment diuji menggunakan skrip otomatis deploy-local.ps1 dan docker compose up -d. Hasil eksekusi menunjukkan ketiga container berhasil terangkat dalam waktu rata-rata 6 detik:'),
          createTable(
            ['Nama Container', 'Image Source', 'Port Host Binding', 'Status Healthcheck'],
            [
              ['kosmate-db', 'meckagan/database:latest', '5432 -> 5432', 'healthy (pg_isready 0 error)'],
              ['kosmate-backend', 'meckagan/backend:latest', '5000 -> 5000', 'healthy (HTTP 200 /health)'],
              ['kosmate-frontend', 'meckagan/frontend:latest', '8080 -> 80', 'healthy (HTTP 200 index.html)'],
            ]
          ),

          createHeading2('4.2 Evaluasi Akses Pengguna'),
          bullet('Akses http://localhost:8080 menampilkan dashboard SPA dengan KPI kamar terisi (50%), total penghuni aktif (3), pendapatan sewa terakumulasi (Rp 6.000.000), dan rekap tiket perbaikan fasilitas.', '1. Frontend Web:'),
          bullet('Endpoint http://localhost:5000/api/dashboard/stats merespons payload JSON secara konsisten dalam waktu respons < 15ms.', '2. Backend API:'),
          bullet('Akses http://localhost:5000/health dan /ready memberikan status kesiapan container bagi load balancer.', '3. Probes:'),

          // BAB V
          createHeading1('BAB V. KESIMPULAN & SARAN'),
          createHeading2('5.1 Kesimpulan'),
          bullet('Aplikasi KosMate berhasil di-retype secara komprehensif dari monolitik PHP lama menjadi arsitektur 3-Container Microservices berbasis teknologi cloud-native (PostgreSQL, Node.js Express, dan React Vite).'),
          bullet('Penggunaan Nginx Reverse Proxy internal pada container frontend berhasil meniadakan hambatan CORS dan menyatukan titik masuk akses aplikasi ke satu port publik (8080).'),
          bullet('Pipeline CI/CD menggunakan GitHub Actions berhasil mengotomatisasi pengujian regresi dan secara otomatis menerbitkan 3 image container ke Docker Hub (meckagan/backend, meckagan/frontend, meckagan/database) dengan pelabelan tag yang dapat dilacak.'),

          createHeading2('5.2 Saran Pengembangan'),
          bullet('Mengimplementasikan monitoring metrik performa container menggunakan Prometheus dan Grafana.'),
          bullet('Menerapkan orkestrasi skala besar menggunakan Kubernetes (K8s) dengan StatefulSet untuk Database dan Deployment dengan Horizontal Pod Autoscaler (HPA) untuk Backend dan Frontend.'),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.resolve('D:/jos/KosMate', 'Laporan_Proyek_KosMate_Microservices_CICD.docx');
  fs.writeFileSync(outPath, buffer);
  console.log(`Document successfully generated at: ${outPath}`);
}

generateDocx().catch((err) => {
  console.error('Error generating document:', err);
  process.exit(1);
});
