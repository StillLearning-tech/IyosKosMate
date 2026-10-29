import { query } from '../config/db.js';

export async function getAllPembayaran(req, res, next) {
  try {
    const { status, periode, search } = req.query;
    let sql = `
      SELECT py.*, p.nama AS penghuni_nama, p.no_hp AS penghuni_hp, k.nomor_kamar
      FROM pembayaran py
      JOIN penghuni p ON py.penghuni_id = p.id
      JOIN kamar k ON p.kamar_id = k.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'Semua') {
      params.push(status);
      sql += ` AND py.status = $${params.length}`;
    }

    if (periode) {
      params.push(periode);
      sql += ` AND py.periode = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (p.nama ILIKE $${params.length} OR k.nomor_kamar ILIKE $${params.length} OR py.periode ILIKE $${params.length})`;
    }

    sql += ' ORDER BY py.id DESC';

    const result = await query(sql, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
}

export async function getPembayaranById(req, res, next) {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT py.*, p.nama AS penghuni_nama, p.no_hp AS penghuni_hp, k.nomor_kamar
       FROM pembayaran py
       JOIN penghuni p ON py.penghuni_id = p.id
       JOIN kamar k ON p.kamar_id = k.id
       WHERE py.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data pembayaran tidak ditemukan' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function createPembayaran(req, res, next) {
  try {
    const { penghuni_id, periode, jumlah, tanggal_bayar, status = 'Belum Lunas' } = req.body;
    if (!penghuni_id || !periode || !jumlah) {
      return res.status(400).json({ success: false, message: 'Penghuni, Periode, dan Jumlah pembayaran wajib diisi' });
    }

    const payDate = status === 'Lunas' && !tanggal_bayar ? new Date().toISOString().slice(0, 10) : (tanggal_bayar || null);

    const result = await query(
      `INSERT INTO pembayaran (penghuni_id, periode, jumlah, tanggal_bayar, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [penghuni_id, periode, jumlah, payDate, status]
    );

    res.status(201).json({ success: true, message: 'Data pembayaran berhasil ditambahkan', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function updatePembayaran(req, res, next) {
  try {
    const { id } = req.params;
    const { penghuni_id, periode, jumlah, tanggal_bayar, status } = req.body;

    const existing = await query('SELECT * FROM pembayaran WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data pembayaran tidak ditemukan' });
    }

    let finalTanggalBayar = tanggal_bayar !== undefined ? (tanggal_bayar || null) : existing.rows[0].tanggal_bayar;
    if (status === 'Lunas' && !finalTanggalBayar) {
      finalTanggalBayar = new Date().toISOString().slice(0, 10);
    } else if (status === 'Belum Lunas') {
      finalTanggalBayar = null;
    }

    const result = await query(
      `UPDATE pembayaran
       SET penghuni_id = COALESCE($1, penghuni_id),
           periode = COALESCE($2, periode),
           jumlah = COALESCE($3, jumlah),
           tanggal_bayar = $4,
           status = COALESCE($5, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING *`,
      [penghuni_id, periode, jumlah, finalTanggalBayar, status, id]
    );

    res.json({ success: true, message: 'Data pembayaran berhasil diperbarui', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function deletePembayaran(req, res, next) {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM pembayaran WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data pembayaran tidak ditemukan' });
    }
    res.json({ success: true, message: 'Data pembayaran berhasil dihapus', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

