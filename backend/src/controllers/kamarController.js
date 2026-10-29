import { query } from '../config/db.js';

export async function getAllKamar(req, res, next) {
  try {
    const { status, search } = req.query;
    let sql = 'SELECT * FROM kamar WHERE 1=1';
    const params = [];

    if (status && status !== 'Semua') {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (nomor_kamar ILIKE $${params.length} OR tipe ILIKE $${params.length})`;
    }

    sql += ' ORDER BY id DESC';

    const result = await query(sql, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
}

export async function getKamarById(req, res, next) {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM kamar WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Kamar tidak ditemukan' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function createKamar(req, res, next) {
  try {
    const { nomor_kamar, tipe, harga, status = 'Tersedia' } = req.body;
    if (!nomor_kamar || !tipe || !harga) {
      return res.status(400).json({ success: false, message: 'Nomor kamar, tipe, dan harga wajib diisi' });
    }

    const checkExisting = await query('SELECT id FROM kamar WHERE nomor_kamar = $1', [nomor_kamar]);
    if (checkExisting.rows.length > 0) {
      return res.status(409).json({ success: false, message: `Nomor kamar ${nomor_kamar} sudah ada` });
    }

    const result = await query(
      `INSERT INTO kamar (nomor_kamar, tipe, harga, status)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nomor_kamar, tipe, harga, status]
    );

    res.status(201).json({ success: true, message: 'Kamar berhasil ditambahkan', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function updateKamar(req, res, next) {
  try {
    const { id } = req.params;
    const { nomor_kamar, tipe, harga, status } = req.body;

    const existing = await query('SELECT * FROM kamar WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Kamar tidak ditemukan' });
    }

    const result = await query(
      `UPDATE kamar
       SET nomor_kamar = COALESCE($1, nomor_kamar),
           tipe = COALESCE($2, tipe),
           harga = COALESCE($3, harga),
           status = COALESCE($4, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING *`,
      [nomor_kamar, tipe, harga, status, id]
    );

    res.json({ success: true, message: 'Kamar berhasil diperbarui', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function deleteKamar(req, res, next) {
  try {
    const { id } = req.params;

    // Cek apakah masih ada penghuni terdaftar di kamar ini
    const checkPenghuni = await query('SELECT id FROM penghuni WHERE kamar_id = $1', [id]);
    if (checkPenghuni.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat menghapus kamar yang memiliki riwayat/data penghuni. Hapus atau pindahkan penghuni terlebih dahulu.'
      });
    }

    const result = await query('DELETE FROM kamar WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Kamar tidak ditemukan' });
    }

    res.json({ success: true, message: 'Kamar berhasil dihapus', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

