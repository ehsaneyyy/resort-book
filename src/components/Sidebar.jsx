import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, BedDouble, CalendarDays, Users, BarChart3, DollarSign, Settings, CalendarCheck, Menu, X, MessageCircle, Plus } from 'lucide-react';
import { useState } from 'react';
import { useBookings } from '../api/hooks';
import { WhatsAppQuickAdd } from './WhatsAppQuickAdd';

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

export function Sidebar({ sidebarOpen, onToggle }) {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const location = useLocation();
  const { data: bookings = [] } = useBookings();
  const pending = bookings.filter(b => b.status === 'Pending').length;

  return (
    <>
      <button onClick={onToggle} className="lg:hidden fixed top-3 left-3 z-50 flex items-center justify-center min-w-[44px] min-h-[44px] bg-dark-800/80 border border-white/[0.03] rounded-lg text-slate-500 hover:text-white focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors active:scale-95">
        {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={onToggle} />}

      <aside className={`fixed top-0 left-0 bottom-0 w-56 bg-dark-800 border-r border-white/[0.02] z-50 transition-all duration-200 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="px-5 h-14 flex items-center gap-3 border-b border-white/[0.02]">
          <img src="/favicon.svg" alt="resort-demo" className="w-8 h-8 flex-shrink-0 rounded-lg" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">resort-demo</p>
            <p className="text-[9px] text-slate-500 tracking-wide uppercase">Admin Panel</p>
          </div>
          <button onClick={onToggle} className="lg:hidden ml-auto flex items-center justify-center w-8 h-8 text-slate-500 hover:text-white rounded-lg focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="px-3 py-4 space-y-0.5 overflow-y-auto" style={{ height: 'calc(100vh - 3.5rem)' }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
            return (
              <NavLink
                key={item.to}
                to={item.to}
                viewTransition
                onClick={onToggle}
                className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] text-sm focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors rounded-lg ${isActive ? 'text-white bg-white/[0.04]' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'}`}
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
          <button onClick={() => { onToggle(); setTimeout(() => setShowQuickAdd(true), 200); }} className="flex items-center gap-3 px-3 py-2.5 min-h-[44px] w-full text-sm text-slate-500 hover:text-emerald-400 focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors rounded-lg hover:bg-white/[0.02]">
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
