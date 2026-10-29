import React from 'react';
import { Home, BedDouble, Users, CreditCard, Wrench, Activity } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'kamar', label: 'Kamar', icon: BedDouble },
    { id: 'penghuni', label: 'Penghuni', icon: Users },
    { id: 'pembayaran', label: 'Pembayaran', icon: CreditCard },
    { id: 'maintenance', label: 'Perbaikan', icon: Wrench },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <BedDouble className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Kos<span className="text-indigo-600">Mate</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Microservice v2.0
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}

