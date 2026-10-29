import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { formatRupiah, formatDate } from '../utils/format';
import {
  BedDouble,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Wrench,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export default function DashboardPage({ setActiveTab }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboardStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
        <p className="text-sm">Memuat ringkasan data KosMate...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 my-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <div>
            <h4 className="font-semibold">Gagal Menghubungi Backend Microservice</h4>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const { kamar, penghuni, pembayaran, maintenance, recent } = stats || {};
  const occupancyPercent = kamar?.total > 0 ? Math.round((kamar.terisi / kamar.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Hero Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 p-6 md:p-8 rounded-2xl text-white shadow-md">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold mb-3 border border-indigo-400/30">
            <ShieldCheck className="w-3.5 h-3.5" /> 3-Container Microservice Architecture
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Selamat Datang di KosMate
          </h1>
          <p className="text-indigo-200 mt-1 text-sm md:text-base max-w-2xl">
            Sistem manajemen kos terpadu: monitor ketersediaan kamar, penghuni aktif, arus kas pembayaran, dan tiket perbaikan fasilitas secara real-time.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadStats}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition backdrop-blur-sm"
          >
            <RefreshCw className="w-4 h-4" /> Segarkan
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Kamar */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Kapasitas Kamar</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BedDouble className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{kamar?.total || 0} Kamar</div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <span className="text-emerald-600 font-semibold">{kamar?.tersedia || 0} Tersedia</span>
              <span>•</span>
              <span className="text-indigo-600 font-semibold">{kamar?.terisi || 0} Terisi</span>
            </div>
          </div>
        </div>

        {/* Penghuni Aktif */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Penghuni Kos</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{penghuni?.aktif || 0} Orang</div>
            <p className="text-xs text-slate-500 mt-1">Status aktif menghuni</p>
          </div>
        </div>

        {/* Total Pendapatan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Pendapatan</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{formatRupiah(pembayaran?.totalPendapatan)}</div>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="text-emerald-600 font-medium">{pembayaran?.lunas || 0} Lunas</span>
              <span className="text-slate-400">•</span>
              <span className="text-amber-600 font-medium">{pembayaran?.belumLunas || 0} Belum Lunas</span>
            </div>
          </div>
        </div>

        {/* Status Perbaikan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tiket Perbaikan</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{maintenance?.total || 0} Laporan</div>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="text-amber-600 font-medium">{maintenance?.menunggu || 0} Menunggu</span>
              <span className="text-slate-400">•</span>
              <span className="text-blue-600 font-medium">{maintenance?.diproses || 0} Diproses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Occupancy Bar & Quick Links */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="font-semibold text-slate-900">Tingkat Keterisian Kos (Occupancy Rate)</h3>
            <p className="text-xs text-slate-500">{kamar?.terisi} dari {kamar?.total} kamar saat ini telah terisi</p>
          </div>
          <span className="text-xl font-bold text-indigo-600">{occupancyPercent}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${occupancyPercent}%` }}
          />
        </div>
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" /> Transaksi Pembayaran Terakhir
              </h3>
              <button
                onClick={() => setActiveTab('pembayaran')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recent?.pembayaran?.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">Belum ada riwayat pembayaran.</p>
              ) : (
                recent?.pembayaran?.map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{p.penghuni_nama} (Kamar {p.nomor_kamar})</p>
                      <p className="text-xs text-slate-500">Periode: {p.periode}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{formatRupiah(p.jumlah)}</p>
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                        p.status === 'Lunas' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Maintenance Requests */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-indigo-600" /> Laporan Perbaikan Terkini
              </h3>
              <button
                onClick={() => setActiveTab('maintenance')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recent?.maintenance?.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">Tidak ada laporan perbaikan terbuka.</p>
              ) : (
                recent?.maintenance?.map((m) => (
                  <div key={m.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{m.judul}</p>
                      <p className="text-xs text-slate-500">
                        {m.penghuni_nama} (Kamar {m.nomor_kamar}) • {formatDate(m.tanggal_lapor)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                        m.status === 'Selesai'
                          ? 'bg-emerald-50 text-emerald-700'
                          : m.status === 'Diproses'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {m.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

