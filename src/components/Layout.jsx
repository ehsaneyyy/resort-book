import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useLogout } from '../api/hooks';
import { LogOut } from 'lucide-react';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const logout = useLogout();
  const pageName = location.pathname === '/' ? 'Dashboard' : location.pathname.slice(1).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => { window.location.href = '/login'; },
    });
  };

  return (
    <div className="min-h-screen">
      <Sidebar sidebarOpen={sidebarOpen} onToggle={() => setSidebarOpen(prev => !prev)} />
      <div className="lg:ml-56">
        <header className="sticky top-0 z-30 bg-dark-900/70 backdrop-blur-md border-b border-white/[0.02]">
          <div className="flex items-center justify-between h-13 pl-16 pr-4 sm:pr-6 lg:pl-6">
            <h1 className="text-base font-medium text-white tracking-tight">{pageName}</h1>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-500">{today}</span>
              <button onClick={handleLogout} disabled={logout.isPending} title="Sign out" className="flex items-center gap-1.5 min-h-[32px] px-2.5 rounded text-xs text-slate-400 hover:text-red-400 hover:bg-white/[0.03] transition-colors disabled:opacity-50">
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
