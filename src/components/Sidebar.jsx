import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, BedDouble, CalendarDays, Users, BarChart3, DollarSign, Settings, CalendarCheck, Menu, X, MessageCircle, Plus } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import WhatsAppQuickAdd from './WhatsAppQuickAdd';

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
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const location = useLocation();
  const { bookings } = useStore();
  const pending = bookings.filter(b => b.status === 'Pending').length;

  return (
    <>
      <button onClick={() => setOpen(true)} className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-dark-800/80 border border-white/[0.03] rounded-lg text-slate-500">
        <Menu className="w-4 h-4" />
      </button>

      {open && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setOpen(false)} />}

      <aside className={`fixed top-0 left-0 bottom-0 w-56 bg-dark-800 border-r border-white/[0.02] z-50 transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="px-5 h-14 flex items-center gap-3 border-b border-white/[0.02]">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-500/80 to-amber-600/80 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white text-[11px] font-semibold">RA</span>
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-white truncate">resort-demo</p>
            <p className="text-[9px] text-slate-600 tracking-wide uppercase">Admin Panel</p>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden ml-auto p-1 text-slate-600 hover:text-slate-400 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <nav className="px-3 py-4 space-y-0.5 overflow-y-auto" style={{ height: 'calc(100vh - 3.5rem)' }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 text-[13px] transition-colors ${isActive ? 'text-white border-l-2 border-amber-500/60 bg-white/[0.02]' : 'text-slate-600 hover:text-slate-300 border-l-2 border-transparent'}`}
              >
                <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-amber-400/80' : ''}`} />
                <span>{item.label}</span>
                {item.label === 'Bookings' && pending > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 bg-amber-500/15 text-amber-400 text-[9px] font-medium rounded-sm">{pending}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/[0.02]">
          <button onClick={() => { setOpen(false); setShowQuickAdd(true); }} className="flex items-center gap-3 px-3 py-2 w-full text-[13px] text-slate-600 hover:text-emerald-400 transition-colors border-l-2 border-transparent hover:border-emerald-500/60">
            <MessageCircle className="w-4 h-4" />
            <span>Quick Add</span>
            <Plus className="w-3 h-3 ml-auto" />
          </button>
        </div>
      </aside>

      {showQuickAdd && <WhatsAppQuickAdd onClose={() => setShowQuickAdd(false)} />}
    </>
  );
}
