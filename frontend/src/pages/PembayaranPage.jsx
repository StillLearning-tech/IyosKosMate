import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { formatRupiah, formatDate } from '../utils/format';
import { Plus, Search, Edit2, Trash2, CheckCircle, Clock, AlertCircle, X, CreditCard } from 'lucide-react';

export default function PembayaranPage() {
  const [payments, setPayments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [formData, setFormData] = useState({
    penghuni_id: '',
    periode: new Date().toISOString().slice(0, 7), // YYYY-MM
    jumlah: '',
    tanggal_bayar: '',
    status: 'Belum Lunas',
  });
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus !== 'Semua') params.status = filterStatus;
      if (search) params.search = search;
      const res = await api.getPembayaran(params);
      if (res.success) {
        setPayments(res.data);
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
      fetchPayments();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [search, filterStatus]);

  const handleOpenAdd = () => {
    setEditingPayment(null);
    setFormData({
      penghuni_id: tenants.length > 0 ? tenants[0].id : '',
      periode: new Date().toISOString().slice(0, 7),
      jumlah: tenants.length > 0 ? tenants[0].harga_kamar : '',
      tanggal_bayar: '',
      status: 'Belum Lunas',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (payment) => {
    setEditingPayment(payment);
    setFormData({
      penghuni_id: payment.penghuni_id,
      periode: payment.periode,
      jumlah: payment.jumlah,
      tanggal_bayar: payment.tanggal_bayar ? payment.tanggal_bayar.slice(0, 10) : '',
      status: payment.status,
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleQuickMarkPaid = async (payment) => {
    try {
      await api.updatePembayaran(payment.id, {
        status: 'Lunas',
        tanggal_bayar: new Date().toISOString().slice(0, 10),
      });
      fetchPayments();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      if (editingPayment) {
        await api.updatePembayaran(editingPayment.id, formData);
      } else {
        await api.createPembayaran(formData);
      }
      setIsModalOpen(false);
      fetchPayments();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus pencatatan tagihan pembayaran ini?')) {
      try {
        await api.deletePembayaran(id);
        fetchPayments();
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Data Pembayaran</h1>
          <p className="text-sm text-slate-500">Pantau tagihan bulanan kos, histori penerimaan uang sewa, dan status pelunasan.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" /> Catat Tagihan / Pembayaran
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama penghuni, kamar, atau periode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex gap-1.5 w-full md:w-auto">
          {['Semua', 'Lunas', 'Belum Lunas'].map((status) => (
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

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Penghuni & Kamar</th>
                <th className="px-6 py-3.5">Periode</th>
                <th className="px-6 py-3.5">Nominal Tagihan</th>
                <th className="px-6 py-3.5">Tanggal Bayar</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    Memuat data pembayaran...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    Tidak ada transaksi pembayaran yang ditemukan.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{p.penghuni_nama}</div>
                      <div className="text-xs text-indigo-600 font-medium">Kamar {p.nomor_kamar}</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-slate-700">
                      {p.periode}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {formatRupiah(p.jumlah)}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {p.tanggal_bayar ? formatDate(p.tanggal_bayar) : <span className="text-slate-300 italic">Belum dibayar</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        p.status === 'Lunas'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {p.status === 'Lunas' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p.status === 'Belum Lunas' && (
                          <button
                            onClick={() => handleQuickMarkPaid(p)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition"
                            title="Tandai Sudah Lunas"
                          >
                            Tandai Lunas
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit Pembayaran"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus Pembayaran"
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
                {editingPayment ? 'Edit Data Pembayaran' : 'Catat Tagihan / Pembayaran'}
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
                  Pilih Penghuni Kos
                </label>
                <select
                  required
                  value={formData.penghuni_id}
                  onChange={(e) => {
                    const selId = e.target.value;
                    const selected = tenants.find((t) => String(t.id) === String(selId));
                    setFormData({
                      ...formData,
                      penghuni_id: selId,
                      jumlah: selected?.harga_kamar || formData.jumlah,
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  <option value="">-- Pilih Penghuni --</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nama} (Kamar {t.nomor_kamar} - {formatRupiah(t.harga_kamar)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Periode Tagihan (Tahun-Bulan)
                </label>
                <input
                  type="month"
                  required
                  value={formData.periode}
                  onChange={(e) => setFormData({ ...formData, periode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nominal Pembayaran (Rp)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="50000"
                  placeholder="1500000"
                  value={formData.jumlah}
                  onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Status Pembayaran
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  <option value="Belum Lunas">Belum Lunas</option>
                  <option value="Lunas">Lunas</option>
                </select>
              </div>

              {formData.status === 'Lunas' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Tanggal Pembayaran
                  </label>
                  <input
                    type="date"
                    value={formData.tanggal_bayar || new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setFormData({ ...formData, tanggal_bayar: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  />
                </div>
              )}

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
                  {submitting ? 'Menyimpan...' : 'Simpan Pembayaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

