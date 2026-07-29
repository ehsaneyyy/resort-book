import { useStore } from '../hooks/useStore';
import { formatCurrency, formatDate, today } from '../data/utils';
import { useToast } from '../components/Toast';
import { CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const { bookings, rooms, guests, getGuest, getRoom, updateBookings } = useStore();
  const toast = useToast();
  const todayStr = today();
  const confirmed = bookings.filter(b => b.status === 'Confirmed');
  const pending = bookings.filter(b => b.status === 'Pending');
  const occupied = confirmed.filter(b => todayStr >= b.checkIn && todayStr < b.checkOut).length;
  const occupancy = Math.round((occupied / rooms.length) * 100);
  const todayCheckins = bookings.filter(b => b.checkIn === todayStr && (b.status === 'Confirmed' || b.status === 'Pending'));
  const todayCheckouts = bookings.filter(b => b.checkOut === todayStr && b.status === 'Confirmed');
  const todayRevenue = todayCheckins.reduce((s, b) => s + b.total, 0);
  const recentBookings = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  const upcomingArrivals = confirmed.filter(b => b.checkIn > todayStr).sort((a, b) => a.checkIn.localeCompare(b.checkIn)).slice(0, 4);

  const confirmBooking = (id) => {
    updateBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Confirmed' } : b));
    toast('Booking confirmed', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Bookings', value: bookings.length, sub: `${confirmed.length} confirmed` },
          { label: "Today's Revenue", value: formatCurrency(todayRevenue), sub: `${todayCheckins.length} check-ins` },
          { label: 'Occupancy', value: `${occupancy}%`, sub: `${occupied}/${rooms.length} rooms` },
          { label: 'Pending', value: pending.length, sub: pending.length > 0 ? 'Needs attention' : 'All clear' },
          { label: 'Guests', value: guests.length, sub: `${guests.filter(g => g.vip).length} VIP` },
        ].map((s, i) => (
          <div key={i} className="bg-dark-800 border border-white/5 p-4">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-xl font-semibold text-white">{s.value}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-dark-800 border border-white/5">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <h3 className="text-sm font-medium text-white">Recent Bookings</h3>
              <a href="/bookings" className="text-[11px] text-slate-500 hover:text-white flex items-center gap-1 transition-colors">View all <ArrowRight className="w-3 h-3" /></a>
            </div>
            <div className="divide-y divide-white/5">
              {recentBookings.map(b => {
                const guest = getGuest(b.guestId);
                const room = getRoom(b.roomId);
                return (
                  <div key={b.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                    <div className="w-8 h-8 bg-dark-700 rounded flex items-center justify-center text-slate-400 text-xs font-medium flex-shrink-0">
                      {guest?.name.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{guest?.name || 'Unknown'}</p>
                      <p className="text-[11px] text-slate-500">{room?.name || b.roomId} · {formatDate(b.checkIn)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm text-white font-medium">{formatCurrency(b.total)}</p>
                      <p className={`text-[10px] ${b.status === 'Confirmed' ? 'text-emerald-500' : b.status === 'Pending' ? 'text-amber-500' : b.status === 'Cancelled' ? 'text-red-500' : 'text-slate-500'}`}>{b.status}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {upcomingArrivals.length > 0 && (
            <div className="bg-dark-800 border border-white/5">
              <div className="px-4 py-3 border-b border-white/5">
                <h3 className="text-sm font-medium text-white">Upcoming Arrivals</h3>
              </div>
              <div className="divide-y divide-white/5">
                {upcomingArrivals.map(b => {
                  const guest = getGuest(b.guestId);
                  const room = getRoom(b.roomId);
                  const daysUntil = Math.ceil((new Date(b.checkIn) - new Date(todayStr)) / 864e5);
                  return (
                    <div key={b.id} className="flex items-center gap-3 px-4 py-2.5">
                      <div className="w-8 h-8 bg-dark-700 rounded flex items-center justify-center text-slate-400 text-xs font-medium flex-shrink-0">
                        {guest?.name.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{guest?.name || 'Unknown'}</p>
                        <p className="text-[11px] text-slate-500">{room?.name || b.roomId} · {b.nights}N</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[11px] text-slate-400">{daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d`}</p>
                        <p className="text-[11px] text-slate-500">{formatCurrency(b.total)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="bg-dark-800 border border-white/5">
            <div className="px-4 py-3 border-b border-white/5">
              <h3 className="text-sm font-medium text-white">Today</h3>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-2">Check-ins ({todayCheckins.length})</p>
                {todayCheckins.length === 0 ? (
                  <p className="text-xs text-slate-600">None today</p>
                ) : (
                  <div className="space-y-1.5">
                    {todayCheckins.map(b => {
                      const guest = getGuest(b.guestId);
                      const room = getRoom(b.roomId);
                      return (
                        <div key={b.id} className="flex items-center gap-2 text-xs">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />
                          <span className="text-slate-300 truncate">{guest?.name}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-500 truncate">{room?.name}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-2">Check-outs ({todayCheckouts.length})</p>
                {todayCheckouts.length === 0 ? (
                  <p className="text-xs text-slate-600">None today</p>
                ) : (
                  <div className="space-y-1.5">
                    {todayCheckouts.map(b => {
                      const guest = getGuest(b.guestId);
                      const room = getRoom(b.roomId);
                      return (
                        <div key={b.id} className="flex items-center gap-2 text-xs">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                          <span className="text-slate-300 truncate">{guest?.name}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-500 truncate">{room?.name}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {pending.length > 0 && (
            <div className="bg-dark-800 border border-white/5">
              <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                <h3 className="text-sm font-medium text-white">Pending</h3>
              </div>
              <div className="divide-y divide-white/5">
                {pending.map(b => {
                  const guest = getGuest(b.guestId);
                  const room = getRoom(b.roomId);
                  return (
                    <div key={b.id} className="flex items-center gap-3 px-4 py-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{guest?.name || 'Unknown'}</p>
                        <p className="text-[11px] text-slate-500">{room?.name || b.roomId} · {formatDate(b.checkIn)}</p>
                      </div>
                      <button onClick={() => confirmBooking(b.id)} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[11px] font-medium rounded hover:bg-emerald-500/20 transition-colors flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Confirm
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-dark-800 border border-white/5">
            <div className="px-4 py-3 border-b border-white/5">
              <h3 className="text-sm font-medium text-white">Rooms</h3>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-3 gap-1.5">
                {rooms.map(r => {
                  const isOccupied = confirmed.some(b => b.roomId === r.id && todayStr >= b.checkIn && todayStr < b.checkOut);
                  return (
                    <div key={r.id} className={`px-2 py-1.5 rounded text-center text-[10px] font-medium ${isOccupied ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {r.name.split(' ')[0]}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
