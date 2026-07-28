import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, BedDouble, CalendarDays, Users, BarChart3, DollarSign, Settings, CalendarCheck, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../hooks/useStore';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/rooms', icon: BedDouble, label: 'Rooms' },
  { to: '/bookings', icon: CalendarCheck, label: 'Bookings' },
  { to: '/guests', icon: Users, label: 'Guests' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/pricing', icon: DollarSign, label: 'Pricing' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { bookings, resort } = useStore();
  const pending = bookings.filter(b => b.status === 'Pending').length;
  const initials = resort.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
      <button onClick={() => setOpen(true)} className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-dark-800 border border-white/10 rounded-xl text-white">
        <Menu className="w-5 h-5" />
      </button>

      {open && <div className="fixed inset-0 bg-dark-900/80 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={`fixed top-0 left-0 bottom-0 w-64 bg-dark-800 border-r border-white/5 z-50 transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center gap-3 px-5 h-16 border-b border-white/5">
          <div className="w-9 h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">{initials}</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white truncate">{resort.name}</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Admin Panel</p>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden ml-auto p-1 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="px-3 py-4 space-y-1 overflow-y-auto" style={{ height: 'calc(100vh - 4rem)' }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${isActive ? 'bg-brand-500/10 text-brand-400 font-medium border border-brand-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.label === 'Bookings' && pending > 0 && (
                  <span className="ml-auto px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold rounded-full">{pending}</span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
