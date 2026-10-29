import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { formatDate } from '../utils/format';
import { Plus, Search, Edit2, Trash2, Wrench, AlertCircle, X, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export default function MaintenancePage() {
  const [tickets, setTickets] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterPriority, setFilterPriority] = useState('Semua');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [formData, setFormData] = useState({
    penghuni_id: '',
    judul: '',
    deskripsi: '',
    tanggal_lapor: new Date().toISOString().slice(0, 10),
    prioritas: 'Sedang',
    status: 'Menunggu',
  });
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus !== 'Semua') params.status = filterStatus;
      if (filterPriority !== 'Semua') params.prioritas = filterPriority;
      if (search) params.search = search;
      const res = await api.getMaintenance(params);
      if (res.success) {
        setTickets(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const res = await api.getPenghuni({ status: 'Aktif' });
      if (res.success) {
        setTenants(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchTickets();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [search, filterStatus, filterPriority]);

  const handleOpenAdd = () => {
    setEditingTicket(null);
    setFormData({
      penghuni_id: tenants.length > 0 ? tenants[0].id : '',
      judul: '',
      deskripsi: '',
      tanggal_lapor: new Date().toISOString().slice(0, 10),
      prioritas: 'Sedang',
      status: 'Menunggu',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ticket) => {
    setEditingTicket(ticket);
    setFormData({
      penghuni_id: ticket.penghuni_id,
      judul: ticket.judul,
      deskripsi: ticket.deskripsi,
      tanggal_lapor: ticket.tanggal_lapor ? ticket.tanggal_lapor.slice(0, 10) : '',
      prioritas: ticket.prioritas,
      status: ticket.status,
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleQuickStatusChange = async (ticketId, newStatus) => {
    try {
      await api.updateMaintenance(ticketId, { status: newStatus });
      fetchTickets();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      if (editingTicket) {
        await api.updateMaintenance(editingTicket.id, formData);
      } else {
        await api.createMaintenance(formData);
      }
      setIsModalOpen(false);
      fetchTickets();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, judul) => {
    if (window.confirm(`Hapus laporan perbaikan "${judul}"?`)) {
      try {
        await api.deleteMaintenance(id);
        fetchTickets();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Laporan Perbaikan</h1>
          <p className="text-sm text-slate-500">Kelola keluhan kerusakan fasilitas kos, penugasan teknisi, dan pembaruan status pengerjaan.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" /> Buat Tiket Perbaikan
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari keluhan, penghuni, atau kamar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['Semua', 'Menunggu', 'Diproses', 'Selesai'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filterStatus === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Maintenance Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Judul & Masalah</th>
                <th className="px-6 py-3.5">Pelapor & Kamar</th>
                <th className="px-6 py-3.5">Tgl Lapor</th>
                <th className="px-6 py-3.5">Prioritas</th>
                <th className="px-6 py-3.5">Status Pengerjaan</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    Memuat data perbaikan...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    Tidak ada laporan perbaikan yang ditemukan.
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-bold text-slate-900">{t.judul}</div>
                      <div className="text-xs text-slate-500 line-clamp-2 mt-0.5">{t.deskripsi}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{t.penghuni_nama}</div>
                      <div className="text-xs text-indigo-600 font-medium">Kamar {t.nomor_kamar}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {formatDate(t.tanggal_lapor)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        t.prioritas === 'Tinggi'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : t.prioritas === 'Sedang'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {t.prioritas === 'Tinggi' && <AlertTriangle className="w-3 h-3" />}
                        {t.prioritas}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={t.status}
                        onChange={(e) => handleQuickStatusChange(t.id, e.target.value)}
                        className={`text-xs font-semibold rounded-lg px-2.5 py-1 border transition focus:outline-none ${
                          t.status === 'Selesai'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : t.status === 'Diproses'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="Menunggu">Menunggu</option>
                        <option value="Diproses">Diproses</option>
                        <option value="Selesai">Selesai</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit Laporan"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id, t.judul)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus Laporan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900">
                {editingTicket ? 'Edit Laporan Perbaikan' : 'Buat Tiket Perbaikan'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Pilih Penghuni Pelapor
                </label>
                <select
                  required
                  value={formData.penghuni_id}
                  onChange={(e) => setFormData({ ...formData, penghuni_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  <option value="">-- Pilih Penghuni --</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nama} (Kamar {t.nomor_kamar})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Judul Keluhan / Masalah
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Lampu Kamar Mandi Mati"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Deskripsi Lengkap Kerusakan
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Jelaskan detail masalah atau letak kerusakan fasilitas..."
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Prioritas
                  </label>
                  <select
                    value={formData.prioritas}
                    onChange={(e) => setFormData({ ...formData, prioritas: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    <option value="Rendah">Rendah</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Tinggi">Tinggi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    <option value="Menunggu">Menunggu</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Laporan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

