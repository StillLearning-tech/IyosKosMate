import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'kosmate_db',
  user: process.env.DB_USER || 'kosmate',
  password: process.env.DB_PASSWORD || 'kosmate_secret',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[DB POOL ERROR] Unexpected client error:', err.message);
});

// Helper for single query
export const query = (text, params) => pool.query(text, params);

// Microservice DB Connection Initializer with Retry Logic
export async function waitForDatabase(retries = 15, delayMs = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await pool.query('SELECT NOW()');
      console.log(`[Database] Connected successfully to PostgreSQL at ${process.env.DB_HOST || 'localhost'}. Server time: ${res.rows[0].now}`);
      await initTablesIfNotExist();
      return true;
    } catch (err) {
      console.warn(`[Database] Connection attempt ${attempt}/${retries} failed: ${err.message}. Retrying in ${delayMs / 1000}s...`);
      if (attempt === retries) {
        throw new Error(`Failed to connect to database after ${retries} attempts.`);
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

// Fallback auto-migration if init.sql was not mounted
async function initTablesIfNotExist() {
  const initSql = `
    CREATE TABLE IF NOT EXISTS kamar (
      id SERIAL PRIMARY KEY,
      nomor_kamar VARCHAR(20) UNIQUE NOT NULL,
      tipe VARCHAR(50) NOT NULL,
      harga NUMERIC(12, 2) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'Tersedia',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS penghuni (
      id SERIAL PRIMARY KEY,
      nama VARCHAR(100) NOT NULL,
      nik VARCHAR(30) NOT NULL,
      no_hp VARCHAR(20) NOT NULL,
      kamar_id INT NOT NULL REFERENCES kamar(id) ON UPDATE CASCADE ON DELETE RESTRICT,
      tanggal_masuk DATE NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'Aktif',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pembayaran (
      id SERIAL PRIMARY KEY,
      penghuni_id INT NOT NULL REFERENCES penghuni(id) ON UPDATE CASCADE ON DELETE RESTRICT,
      periode VARCHAR(7) NOT NULL,
      jumlah NUMERIC(12, 2) NOT NULL,
      tanggal_bayar DATE,
      status VARCHAR(20) NOT NULL DEFAULT 'Belum Lunas',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS maintenance (
      id SERIAL PRIMARY KEY,
      penghuni_id INT NOT NULL REFERENCES penghuni(id) ON UPDATE CASCADE ON DELETE RESTRICT,
      judul VARCHAR(100) NOT NULL,
      deskripsi TEXT NOT NULL,
      tanggal_lapor DATE NOT NULL,
      prioritas VARCHAR(20) NOT NULL DEFAULT 'Sedang',
      status VARCHAR(20) NOT NULL DEFAULT 'Menunggu',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(initSql);
}

