import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { formatRupiah } from '../utils/format';
import { Plus, Search, Edit2, Trash2, BedDouble, AlertCircle, X, Check } from 'lucide-react';

export default function KamarPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    nomor_kamar: '',
    tipe: '',
    harga: '',
    status: 'Tersedia',
  });
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus !== 'Semua') params.status = filterStatus;
      if (search) params.search = search;
      const res = await api.getKamar(params);
      if (res.success) {
        setRooms(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchRooms();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [search, filterStatus]);

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setFormData({ nomor_kamar: '', tipe: 'Deluxe AC', harga: '', status: 'Tersedia' });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      nomor_kamar: room.nomor_kamar,
      tipe: room.tipe,
      harga: room.harga,
      status: room.status,
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      if (editingRoom) {
        await api.updateKamar(editingRoom.id, formData);
      } else {
        await api.createKamar(formData);
      }
      setIsModalOpen(false);
      fetchRooms();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, nomor) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus kamar ${nomor}?`)) {
      try {
        await api.deleteKamar(id);
        fetchRooms();
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Data Kamar</h1>
          <p className="text-sm text-slate-500">Kelola informasi kamar, tipe kamar, tarif sewa, dan status ketersediaan.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" /> Tambah Kamar
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor kamar atau tipe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['Semua', 'Tersedia', 'Terisi', 'Perbaikan'].map((status) => (
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

      {/* Rooms Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Nomor Kamar</th>
                <th className="px-6 py-3.5">Tipe Kamar</th>
                <th className="px-6 py-3.5">Tarif Sewa (Bulan)</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                    Memuat data kamar...
                  </td>
                </tr>
              ) : rooms.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                    Tidak ada kamar yang sesuai dengan kriteria.
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                      <BedDouble className="w-4 h-4 text-indigo-500" />
                      {room.nomor_kamar}
                    </td>
                    <td className="px-6 py-4">{room.tipe}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{formatRupiah(room.harga)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        room.status === 'Tersedia'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : room.status === 'Terisi'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {room.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(room)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit Kamar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(room.id, room.nomor_kamar)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus Kamar"
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
                {editingRoom ? 'Edit Data Kamar' : 'Tambah Kamar Baru'}
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
                  Nomor Kamar
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: A-101"
                  value={formData.nomor_kamar}
                  onChange={(e) => setFormData({ ...formData, nomor_kamar: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Tipe Kamar
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Deluxe AC / Standar Non-AC"
                  value={formData.tipe}
                  onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Harga Sewa / Bulan (Rp)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="50000"
                  placeholder="1500000"
                  value={formData.harga}
                  onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Status Kamar
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  <option value="Tersedia">Tersedia</option>
                  <option value="Terisi">Terisi</option>
                  <option value="Perbaikan">Perbaikan</option>
                </select>
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
                  {submitting ? 'Menyimpan...' : 'Simpan Kamar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

