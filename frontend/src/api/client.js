const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Health
  checkHealth: () => fetch('/health').then((r) => r.json()),

  // Dashboard
  getDashboardStats: () => request('/dashboard/stats'),

  // Kamar
  getKamar: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/kamar${q ? `?${q}` : ''}`);
  },
  createKamar: (data) => request('/kamar', { method: 'POST', body: JSON.stringify(data) }),
  updateKamar: (id, data) => request(`/kamar/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteKamar: (id) => request(`/kamar/${id}`, { method: 'DELETE' }),

  // Penghuni
  getPenghuni: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/penghuni${q ? `?${q}` : ''}`);
  },
  createPenghuni: (data) => request('/penghuni', { method: 'POST', body: JSON.stringify(data) }),
  updatePenghuni: (id, data) => request(`/penghuni/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePenghuni: (id) => request(`/penghuni/${id}`, { method: 'DELETE' }),

  // Pembayaran
  getPembayaran: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/pembayaran${q ? `?${q}` : ''}`);
  },
  createPembayaran: (data) => request('/pembayaran', { method: 'POST', body: JSON.stringify(data) }),
  updatePembayaran: (id, data) => request(`/pembayaran/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePembayaran: (id) => request(`/pembayaran/${id}`, { method: 'DELETE' }),

  // Maintenance
  getMaintenance: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/maintenance${q ? `?${q}` : ''}`);
  },
  createMaintenance: (data) => request('/maintenance', { method: 'POST', body: JSON.stringify(data) }),
  updateMaintenance: (id, data) => request(`/maintenance/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMaintenance: (id) => request(`/maintenance/${id}`, { method: 'DELETE' }),
};

