import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useState, useEffect } from 'react';

export default function Layout() {
  const location = useLocation();
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => { setTime(new Date().toLocaleTimeString()); }, [location.pathname]);

  const pageName = location.pathname === '/' ? 'Dashboard' : location.pathname.slice(1).charAt(0).toUpperCase() + location.pathname.slice(2);

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="lg:ml-56">
        <header className="sticky top-0 z-30 bg-dark-900/90 backdrop-blur border-b border-white/5">
          <div className="flex items-center justify-between h-12 px-4 sm:px-6">
            <div className="flex items-center gap-3 pl-10 lg:pl-0">
              <h2 className="text-sm font-medium text-white">{pageName}</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                Online
              </span>
              <span className="text-[11px] text-slate-600">{time}</span>
              <div className="w-7 h-7 bg-brand-600 rounded flex items-center justify-center text-white text-[10px] font-semibold">RA</div>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
