import React, { useState, Component } from 'react';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import KamarPage from './pages/KamarPage';
import PenghuniPage from './pages/PenghuniPage';
import PembayaranPage from './pages/PembayaranPage';
import MaintenancePage from './pages/MaintenancePage';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl shadow-lg border border-red-100 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Terjadi Kesalahan Tampilan</h2>
            <p className="text-xs text-slate-500 mb-4 font-mono bg-slate-100 p-2 rounded text-left overflow-auto max-h-32">
              {this.state.error?.toString()}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition"
            >
              <RefreshCw className="w-4 h-4" /> Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
