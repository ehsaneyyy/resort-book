import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useStore } from '../hooks/useStore';
import { useState, useEffect } from 'react';

export default function Layout() {
  const location = useLocation();
  const { resort } = useStore();
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const initials = resort.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => { setTime(new Date().toLocaleTimeString()); }, [location.pathname]);

  const pageName = location.pathname === '/' ? 'Dashboard' : location.pathname.slice(1).charAt(0).toUpperCase() + location.pathname.slice(2);

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 bg-dark-900/80 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center gap-4 pl-10 lg:pl-0">
              <h2 className="text-lg font-semibold text-white">{pageName}</h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Online
              </span>
              <span className="text-xs text-slate-600">{time}</span>
              <div className="w-9 h-9 bg-brand-500/20 rounded-xl flex items-center justify-center text-brand-400 text-sm font-bold">{initials}</div>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
