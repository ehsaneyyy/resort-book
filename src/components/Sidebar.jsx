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
  const { bookings } = useStore();
  const pending = bookings.filter(b => b.status === 'Pending').length;

  return (
    <>
      <button onClick={() => setOpen(true)} className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-dark-800 border border-white/10 rounded-lg text-slate-400">
        <Menu className="w-4 h-4" />
      </button>

      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={`fixed top-0 left-0 bottom-0 w-56 bg-dark-800 border-r border-white/5 z-50 transition-transform duration-150 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-white/5">
          <div className="w-7 h-7 bg-brand-600 rounded flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">RA</span>
          </div>
          <span className="text-sm font-medium text-white truncate">resort-demo/admin</span>
          <button onClick={() => setOpen(false)} className="lg:hidden ml-auto p-1 text-slate-500 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <nav className="px-2 py-3 space-y-0.5 overflow-y-auto" style={{ height: 'calc(100vh - 3.5rem)' }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${isActive ? 'bg-white/5 text-white font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'}`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
                {item.label === 'Bookings' && pending > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-medium rounded">{pending}</span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
