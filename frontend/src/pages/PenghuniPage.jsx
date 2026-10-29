import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { formatDate } from '../utils/format';
import { Plus, Search, Edit2, Trash2, Users, AlertCircle, X, Phone, UserCheck, Calendar } from 'lucide-react';

export default function PenghuniPage() {
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [formData, setFormData] = useState({
    nama: '',
    nik: '',
    no_hp: '',
    kamar_id: '',
    tanggal_masuk: new Date().toISOString().slice(0, 10),
    status: 'Aktif',
  });
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus !== 'Semua') params.status = filterStatus;
      if (search) params.search = search;
      const res = await api.getPenghuni(params);
      if (res.success) {
        setTenants(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await api.getKamar();
      if (res.success) {
        setRooms(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchTenants();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [search, filterStatus]);

  const handleOpenAdd = () => {
    setEditingTenant(null);
    setFormData({
      nama: '',
      nik: '',
      no_hp: '',
      kamar_id: rooms.length > 0 ? rooms[0].id : '',
      tanggal_masuk: new Date().toISOString().slice(0, 10),
      status: 'Aktif',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tenant) => {
    setEditingTenant(tenant);
    setFormData({
      nama: tenant.nama,
      nik: tenant.nik,
      no_hp: tenant.no_hp,
      kamar_id: tenant.kamar_id,
      tanggal_masuk: tenant.tanggal_masuk ? tenant.tanggal_masuk.slice(0, 10) : '',
      status: tenant.status,
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      if (editingTenant) {
        await api.updatePenghuni(editingTenant.id, formData);
      } else {
        await api.createPenghuni(formData);
      }
      setIsModalOpen(false);
      fetchTenants();
      fetchRooms(); // refresh room occupancy status
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, nama) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus penghuni ${nama}?`)) {
      try {
        await api.deletePenghuni(id);
        fetchTenants();
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Data Penghuni</h1>
          <p className="text-sm text-slate-500">Kelola informasi penghuni aktif, kamar sewa, data identitas (NIK), dan kontak.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" /> Tambah Penghuni
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, NIK, HP, atau kamar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex gap-1.5 w-full md:w-auto">
          {['Semua', 'Aktif', 'Non-Aktif'].map((status) => (
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

      {/* Tenants Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Nama & Identitas</th>
                <th className="px-6 py-3.5">Kamar Terkait</th>
                <th className="px-6 py-3.5">Kontak</th>
                <th className="px-6 py-3.5">Tgl Masuk</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    Memuat data penghuni...
                  </td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    Tidak ada data penghuni yang ditemukan.
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{tenant.nama}</div>
                      <div className="text-xs text-slate-400 font-mono">NIK: {tenant.nik}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs">
                        Kamar {tenant.nomor_kamar}
                      </span>
                      <div className="text-xs text-slate-400 mt-0.5">{tenant.tipe_kamar}</div>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`https://wa.me/${tenant.no_hp.replace(/^0/, '62').replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        <Phone className="w-3.5 h-3.5" /> {tenant.no_hp}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {formatDate(tenant.tanggal_masuk)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        tenant.status === 'Aktif'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(tenant)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit Penghuni"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tenant.id, tenant.nama)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus Penghuni"
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
                {editingTenant ? 'Edit Data Penghuni' : 'Tambah Penghuni Baru'}
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
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nomor Induk Kependudukan (NIK)
                </label>
                <input
                  type="text"
                  required
                  placeholder="16 Digit NIK KTP"
                  value={formData.nik}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nomor WhatsApp / HP
                </label>
                <input
                  type="tel"
                  required
                  placeholder="08123456789"
                  value={formData.no_hp}
                  onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Pilih Kamar
                </label>
                <select
                  required
                  value={formData.kamar_id}
                  onChange={(e) => setFormData({ ...formData, kamar_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  <option value="">-- Pilih Kamar --</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.nomor_kamar} - {room.tipe} ({room.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Tanggal Masuk
                </label>
                <input
                  type="date"
                  required
                  value={formData.tanggal_masuk}
                  onChange={(e) => setFormData({ ...formData, tanggal_masuk: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Status Penghuni
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Non-Aktif">Non-Aktif</option>
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
                  {submitting ? 'Menyimpan...' : 'Simpan Penghuni'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

