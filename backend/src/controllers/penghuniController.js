import { query } from '../config/db.js';

export async function getAllPenghuni(req, res, next) {
  try {
    const { status, search } = req.query;
    let sql = `
      SELECT p.*, k.nomor_kamar, k.tipe AS tipe_kamar, k.harga AS harga_kamar
      FROM penghuni p
      JOIN kamar k ON p.kamar_id = k.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'Semua') {
      params.push(status);
      sql += ` AND p.status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (p.nama ILIKE $${params.length} OR p.nik ILIKE $${params.length} OR p.no_hp ILIKE $${params.length} OR k.nomor_kamar ILIKE $${params.length})`;
    }

    sql += ' ORDER BY p.id DESC';

    const result = await query(sql, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
}

export async function getPenghuniById(req, res, next) {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT p.*, k.nomor_kamar, k.tipe AS tipe_kamar, k.harga AS harga_kamar
       FROM penghuni p
       JOIN kamar k ON p.kamar_id = k.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Penghuni tidak ditemukan' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function createPenghuni(req, res, next) {
  try {
    const { nama, nik, no_hp, kamar_id, tanggal_masuk, status = 'Aktif' } = req.body;
    if (!nama || !nik || !no_hp || !kamar_id || !tanggal_masuk) {
      return res.status(400).json({ success: false, message: 'Nama, NIK, No HP, Kamar, dan Tanggal Masuk wajib diisi' });
    }

    // Pastikan kamar ada
    const kamarCheck = await query('SELECT * FROM kamar WHERE id = $1', [kamar_id]);
    if (kamarCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Kamar yang dipilih tidak valid' });
    }

    const result = await query(
      `INSERT INTO penghuni (nama, nik, no_hp, kamar_id, tanggal_masuk, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nama, nik, no_hp, kamar_id, tanggal_masuk, status]
    );

    // Otomatis ubah status kamar menjadi 'Terisi' jika status penghuni 'Aktif'
    if (status === 'Aktif') {
      await query("UPDATE kamar SET status = 'Terisi' WHERE id = $1", [kamar_id]);
    }

    res.status(201).json({ success: true, message: 'Penghuni berhasil ditambahkan', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function updatePenghuni(req, res, next) {
  try {
    const { id } = req.params;
    const { nama, nik, no_hp, kamar_id, tanggal_masuk, status } = req.body;

    const existingRes = await query('SELECT * FROM penghuni WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Penghuni tidak ditemukan' });
    }
    const prevPenghuni = existingRes.rows[0];

    const result = await query(
      `UPDATE penghuni
       SET nama = COALESCE($1, nama),
           nik = COALESCE($2, nik),
           no_hp = COALESCE($3, no_hp),
           kamar_id = COALESCE($4, kamar_id),
           tanggal_masuk = COALESCE($5, tanggal_masuk),
           status = COALESCE($6, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [nama, nik, no_hp, kamar_id, tanggal_masuk, status, id]
    );

    // Sinkronisasi status kamar jika kamar atau status penghuni berubah
    const newKamarId = kamar_id || prevPenghuni.kamar_id;
    const newStatus = status || prevPenghuni.status;

    if (newStatus === 'Aktif') {
      await query("UPDATE kamar SET status = 'Terisi' WHERE id = $1", [newKamarId]);
    }

    res.json({ success: true, message: 'Penghuni berhasil diperbarui', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function deletePenghuni(req, res, next) {
  try {
    const { id } = req.params;

    // Cek apakah ada riwayat pembayaran atau maintenance
    const checkPay = await query('SELECT id FROM pembayaran WHERE penghuni_id = $1', [id]);
    const checkMaint = await query('SELECT id FROM maintenance WHERE penghuni_id = $1', [id]);

    if (checkPay.rows.length > 0 || checkMaint.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat menghapus penghuni yang memiliki relasi data pembayaran atau laporan perbaikan.'
      });
    }

    const result = await query('DELETE FROM penghuni WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Penghuni tidak ditemukan' });
    }

    res.json({ success: true, message: 'Penghuni berhasil dihapus', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

