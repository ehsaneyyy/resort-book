import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const pageName = location.pathname === '/' ? 'Dashboard' : location.pathname.slice(1).charAt(0).toUpperCase() + location.pathname.slice(2);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen">
      <Sidebar sidebarOpen={sidebarOpen} onToggle={() => setSidebarOpen(prev => !prev)} />
      <div className="lg:ml-56">
        <header className="sticky top-0 z-30 bg-dark-900/70 backdrop-blur-md border-b border-white/[0.02]">
          <div className="flex items-center justify-between h-13 px-4 sm:px-6 pl-14 lg:pl-6">
            <h1 className="text-[15px] font-medium text-white tracking-tight">{pageName}</h1>
            <span className="text-[12px] text-slate-600">{today}</span>
          </div>
        </header>
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
