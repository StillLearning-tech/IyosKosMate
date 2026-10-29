import { query } from '../config/db.js';

export async function getAllMaintenance(req, res, next) {
  try {
    const { status, prioritas, search } = req.query;
    let sql = `
      SELECT m.*, p.nama AS penghuni_nama, p.no_hp AS penghuni_hp, k.nomor_kamar
      FROM maintenance m
      JOIN penghuni p ON m.penghuni_id = p.id
      JOIN kamar k ON p.kamar_id = k.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'Semua') {
      params.push(status);
      sql += ` AND m.status = $${params.length}`;
    }

    if (prioritas && prioritas !== 'Semua') {
      params.push(prioritas);
      sql += ` AND m.prioritas = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (m.judul ILIKE $${params.length} OR m.deskripsi ILIKE $${params.length} OR p.nama ILIKE $${params.length} OR k.nomor_kamar ILIKE $${params.length})`;
    }

    sql += ' ORDER BY m.id DESC';

    const result = await query(sql, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
}

export async function getMaintenanceById(req, res, next) {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT m.*, p.nama AS penghuni_nama, p.no_hp AS penghuni_hp, k.nomor_kamar
       FROM maintenance m
       JOIN penghuni p ON m.penghuni_id = p.id
       JOIN kamar k ON p.kamar_id = k.id
       WHERE m.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Laporan perbaikan tidak ditemukan' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function createMaintenance(req, res, next) {
  try {
    const {
      penghuni_id,
      judul,
      deskripsi,
      tanggal_lapor = new Date().toISOString().slice(0, 10),
      prioritas = 'Sedang',
      status = 'Menunggu',
    } = req.body;

    if (!penghuni_id || !judul || !deskripsi) {
      return res.status(400).json({ success: false, message: 'Penghuni, Judul, dan Deskripsi perbaikan wajib diisi' });
    }

    const result = await query(
      `INSERT INTO maintenance (penghuni_id, judul, deskripsi, tanggal_lapor, prioritas, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [penghuni_id, judul, deskripsi, tanggal_lapor, prioritas, status]
    );

    res.status(201).json({ success: true, message: 'Laporan perbaikan berhasil dibuat', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function updateMaintenance(req, res, next) {
  try {
    const { id } = req.params;
    const { penghuni_id, judul, deskripsi, tanggal_lapor, prioritas, status } = req.body;

    const existing = await query('SELECT * FROM maintenance WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Laporan perbaikan tidak ditemukan' });
    }

    const result = await query(
      `UPDATE maintenance
       SET penghuni_id = COALESCE($1, penghuni_id),
           judul = COALESCE($2, judul),
           deskripsi = COALESCE($3, deskripsi),
           tanggal_lapor = COALESCE($4, tanggal_lapor),
           prioritas = COALESCE($5, prioritas),
           status = COALESCE($6, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [penghuni_id, judul, deskripsi, tanggal_lapor, prioritas, status, id]
    );

    res.json({ success: true, message: 'Laporan perbaikan berhasil diperbarui', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function deleteMaintenance(req, res, next) {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM maintenance WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Laporan perbaikan tidak ditemukan' });
    }
    res.json({ success: true, message: 'Laporan perbaikan berhasil dihapus', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

