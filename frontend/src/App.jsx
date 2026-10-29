import React, { useState } from 'react';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import KamarPage from './pages/KamarPage';
import PenghuniPage from './pages/PenghuniPage';
import PembayaranPage from './pages/PembayaranPage';
import MaintenancePage from './pages/MaintenancePage';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
        {activeTab === 'kamar' && <KamarPage />}
        {activeTab === 'penghuni' && <PenghuniPage />}
        {activeTab === 'pembayaran' && <PembayaranPage />}
        {activeTab === 'maintenance' && <MaintenancePage />}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 KosMate Microservice Platform. Decoupled 3-Container Architecture.</p>
        </div>
      </footer>
    </div>
  );
}

