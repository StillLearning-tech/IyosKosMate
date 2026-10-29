import { query } from '../config/db.js';

export async function getDashboardStats(req, res, next) {
  try {
    // 1. Data Kamar
    const totalKamarRes = await query('SELECT COUNT(*)::int AS total FROM kamar');
    const totalKamar = totalKamarRes.rows[0].total || 0;

    // 2. Kamar Terisi (dari penghuni aktif)
    const terisiRes = await query("SELECT COUNT(*)::int AS total FROM penghuni WHERE status = 'Aktif'");
    const totalTerisi = terisiRes.rows[0].total || 0;

    // 3. Kamar Tersedia
    const totalTersedia = Math.max(0, totalKamar - totalTerisi);

    // 4. Penghuni Aktif
    const totalPenghuni = totalTerisi;

    // 5. Pembayaran
    const lunasRes = await query("SELECT COUNT(*)::int AS total FROM pembayaran WHERE status = 'Lunas'");
    const totalLunas = lunasRes.rows[0].total || 0;

    const belumLunasRes = await query("SELECT COUNT(*)::int AS total FROM pembayaran WHERE status = 'Belum Lunas'");
    const totalBelumLunas = belumLunasRes.rows[0].total || 0;

    const pendapatanRes = await query("SELECT COALESCE(SUM(jumlah), 0) AS total FROM pembayaran WHERE status = 'Lunas'");
    const totalPendapatan = parseFloat(pendapatanRes.rows[0].total) || 0;

    // 6. Maintenance
    const maintTotalRes = await query('SELECT COUNT(*)::int AS total FROM maintenance');
    const totalMaintenance = maintTotalRes.rows[0].total || 0;

    const maintMenungguRes = await query("SELECT COUNT(*)::int AS total FROM maintenance WHERE status = 'Menunggu'");
    const totalMenunggu = maintMenungguRes.rows[0].total || 0;

    const maintDiprosesRes = await query("SELECT COUNT(*)::int AS total FROM maintenance WHERE status = 'Diproses'");
    const totalDiproses = maintDiprosesRes.rows[0].total || 0;

    const maintSelesaiRes = await query("SELECT COUNT(*)::int AS total FROM maintenance WHERE status = 'Selesai'");
    const totalSelesai = maintSelesaiRes.rows[0].total || 0;

    // Recent items
    const recentPenghuni = await query(`
      SELECT p.*, k.nomor_kamar
      FROM penghuni p
      JOIN kamar k ON p.kamar_id = k.id
      ORDER BY p.id DESC
      LIMIT 5
    `);

    const recentPembayaran = await query(`
      SELECT py.*, p.nama AS penghuni_nama, k.nomor_kamar
      FROM pembayaran py
      JOIN penghuni p ON py.penghuni_id = p.id
      JOIN kamar k ON p.kamar_id = k.id
      ORDER BY py.id DESC
      LIMIT 5
    `);

    const recentMaintenance = await query(`
      SELECT m.*, p.nama AS penghuni_nama, k.nomor_kamar
      FROM maintenance m
      JOIN penghuni p ON m.penghuni_id = p.id
      JOIN kamar k ON p.kamar_id = k.id
      ORDER BY m.id DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        kamar: {
          total: totalKamar,
          terisi: totalTerisi,
          tersedia: totalTersedia,
        },
        penghuni: {
          aktif: totalPenghuni,
        },
        pembayaran: {
          lunas: totalLunas,
          belumLunas: totalBelumLunas,
          totalPendapatan: totalPendapatan,
        },
        maintenance: {
          total: totalMaintenance,
          menunggu: totalMenunggu,
          diproses: totalDiproses,
          selesai: totalSelesai,
        },
        recent: {
          penghuni: recentPenghuni.rows,
          pembayaran: recentPembayaran.rows,
          maintenance: recentMaintenance.rows,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

