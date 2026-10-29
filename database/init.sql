-- ==========================================================
-- KosMate Microservice Database Schema (PostgreSQL)
-- ==========================================================

-- 1. TABEL KAMAR
CREATE TABLE IF NOT EXISTS kamar (
    id SERIAL PRIMARY KEY,
    nomor_kamar VARCHAR(20) UNIQUE NOT NULL,
    tipe VARCHAR(50) NOT NULL,
    harga NUMERIC(12, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Tersedia',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABEL PENGHUNI
CREATE TABLE IF NOT EXISTS penghuni (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    nik VARCHAR(30) NOT NULL,
    no_hp VARCHAR(20) NOT NULL,
    kamar_id INT NOT NULL,
    tanggal_masuk DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Aktif',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_penghuni_kamar
        FOREIGN KEY (kamar_id)
        REFERENCES kamar(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- 3. TABEL PEMBAYARAN
CREATE TABLE IF NOT EXISTS pembayaran (
    id SERIAL PRIMARY KEY,
    penghuni_id INT NOT NULL,
    periode VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    jumlah NUMERIC(12, 2) NOT NULL,
    tanggal_bayar DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'Belum Lunas',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pembayaran_penghuni
        FOREIGN KEY (penghuni_id)
        REFERENCES penghuni(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- 4. TABEL MAINTENANCE
CREATE TABLE IF NOT EXISTS maintenance (
    id SERIAL PRIMARY KEY,
    penghuni_id INT NOT NULL,
    judul VARCHAR(100) NOT NULL,
    deskripsi TEXT NOT NULL,
    tanggal_lapor DATE NOT NULL,
    prioritas VARCHAR(20) NOT NULL DEFAULT 'Sedang', -- Rendah, Sedang, Tinggi
    status VARCHAR(20) NOT NULL DEFAULT 'Menunggu',  -- Menunggu, Diproses, Selesai
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_maintenance_penghuni
        FOREIGN KEY (penghuni_id)
        REFERENCES penghuni(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- Indeks untuk optimasi query
CREATE INDEX IF NOT EXISTS idx_penghuni_kamar_id ON penghuni(kamar_id);
CREATE INDEX IF NOT EXISTS idx_pembayaran_penghuni_id ON pembayaran(penghuni_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_penghuni_id ON maintenance(penghuni_id);
CREATE INDEX IF NOT EXISTS idx_kamar_status ON kamar(status);
CREATE INDEX IF NOT EXISTS idx_pembayaran_status ON pembayaran(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance(status);

-- ==========================================================
-- DATA AWAL (SEED DATA)
-- ==========================================================

-- Data Kamar
INSERT INTO kamar (nomor_kamar, tipe, harga, status) VALUES
('A-101', 'Deluxe AC', 1500000, 'Terisi'),
('A-102', 'Deluxe AC', 1500000, 'Terisi'),
('A-103', 'Standar Non-AC', 900000, 'Tersedia'),
('B-201', 'VIP Kamar Mandi Dalam', 2000000, 'Terisi'),
('B-202', 'VIP Kamar Mandi Dalam', 2000000, 'Tersedia'),
('B-203', 'Standar Non-AC', 950000, 'Perbaikan')
ON CONFLICT (nomor_kamar) DO NOTHING;

-- Data Penghuni
INSERT INTO penghuni (nama, nik, no_hp, kamar_id, tanggal_masuk, status) VALUES
('Budi Santoso', '3201123456780001', '081234567890', 1, '2026-01-10', 'Aktif'),
('Siti Rahmawati', '3201123456780002', '081398765432', 2, '2026-02-01', 'Aktif'),
('Ahmad Fauzi', '3201123456780003', '082155554321', 4, '2026-01-15', 'Aktif')
ON CONFLICT DO NOTHING;

-- Data Pembayaran
INSERT INTO pembayaran (penghuni_id, periode, jumlah, tanggal_bayar, status) VALUES
(1, '2026-10', 1500000, '2026-10-05', 'Lunas'),
(2, '2026-10', 1500000, '2026-10-06', 'Lunas'),
(3, '2026-10', 2000000, NULL, 'Belum Lunas'),
(1, '2026-09', 1500000, '2026-09-04', 'Lunas'),
(2, '2026-09', 1500000, '2026-09-05', 'Lunas')
ON CONFLICT DO NOTHING;

-- Data Maintenance
INSERT INTO maintenance (penghuni_id, judul, deskripsi, tanggal_lapor, prioritas, status) VALUES
(1, 'AC Kurang Dingin', 'AC di kamar A-101 hembusannya kurang dingin, butuh servis cuci freon.', '2026-10-25', 'Sedang', 'Menunggu'),
(3, 'Kran Kamar Mandi Bocor', 'Kran wastafel menetes terus menerus sejak kemarin malam.', '2026-10-27', 'Tinggi', 'Diproses')
ON CONFLICT DO NOTHING;

