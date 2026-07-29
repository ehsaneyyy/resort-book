import { useStore } from '../hooks/useStore';
import { formatCurrency, formatDate, today } from '../data/utils';
import { useToast } from '../components/Toast';
import { CheckCircle, ArrowRight } from 'lucide-react';

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
    <div className="space-y-7">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
        {[
          { label: 'Total Bookings', value: bookings.length, sub: `${confirmed.length} confirmed` },
          { label: "Today's Revenue", value: formatCurrency(todayRevenue), sub: `${todayCheckins.length} check-ins` },
          { label: 'Occupancy', value: `${occupancy}%`, sub: `${occupied}/${rooms.length} rooms` },
          { label: 'Pending', value: pending.length, sub: pending.length > 0 ? 'Needs attention' : 'All clear' },
          { label: 'Guests', value: guests.length, sub: `${guests.filter(g => g.vip).length} VIP` },
        ].map((s, i) => (
          <div key={i} className="border-l-2 border-amber-500/30 pl-3">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-[1.5px]">{s.label}</p>
            <p className="text-xl sm:text-2xl font-medium text-white mt-1 tracking-tight">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-dark-800/50 rounded-lg border border-white/[0.02]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.02]">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-[2px]">Recent Bookings</h2>
              <a href="/bookings" className="text-xs text-slate-500 hover:text-slate-400 flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors">All <ArrowRight className="w-3 h-3" /></a>
            </div>
            <div className="divide-y divide-white/[0.02]">
              {recentBookings.map(b => {
                const guest = getGuest(b.guestId);
                const room = getRoom(b.roomId);
                return (
                  <div key={b.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.01] focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center text-amber-400/80 text-xs font-medium flex-shrink-0">
                      {guest?.name.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{guest?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-500">{room?.name || b.roomId} · {formatDate(b.checkIn)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm text-white font-medium">{formatCurrency(b.total)}</p>
                      <p className={`text-xs ${b.status === 'Confirmed' ? 'text-emerald-500/70' : b.status === 'Pending' ? 'text-amber-500/70' : b.status === 'Cancelled' ? 'text-red-500/70' : 'text-slate-500/70'}`}>{b.status}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {upcomingArrivals.length > 0 && (
            <div className="bg-dark-800/50 rounded-lg border border-white/[0.02]">
              <div className="px-5 py-3.5 border-b border-white/[0.02]">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-[2px]">Upcoming Arrivals</h2>
              </div>
              <div className="divide-y divide-white/[0.02]">
                {upcomingArrivals.map(b => {
                  const guest = getGuest(b.guestId);
                  const room = getRoom(b.roomId);
                  const daysUntil = Math.ceil((new Date(b.checkIn) - new Date(todayStr)) / 864e5);
                  return (
                    <div key={b.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center text-amber-400/80 text-xs font-medium flex-shrink-0">
                        {guest?.name.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{guest?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{room?.name || b.roomId} · {b.nights}N</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-slate-500">{daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}</p>
                        <p className="text-xs text-slate-500">{formatCurrency(b.total)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-dark-800/50 rounded-lg border border-white/[0.02]">
            <div className="px-5 py-3.5 border-b border-white/[0.02]">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-[2px]">Today</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-[1.5px] mb-2.5">Check-ins ({todayCheckins.length})</p>
                {todayCheckins.length === 0 ? (
                  <p className="text-xs text-slate-500">—</p>
                ) : (
                  <div className="space-y-2">
                    {todayCheckins.map(b => {
                      const guest = getGuest(b.guestId);
                      const room = getRoom(b.roomId);
                      return (
                        <div key={b.id} className="flex items-center gap-2.5 text-xs">
                          <span className="w-1.5 h-1.5 bg-emerald-500/60 rounded-full flex-shrink-0" />
                          <span className="text-slate-300">{guest?.name}</span>
                          <span className="text-slate-500">·</span>
                          <span className="text-slate-500">{room?.name}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-[1.5px] mb-2.5">Check-outs ({todayCheckouts.length})</p>
                {todayCheckouts.length === 0 ? (
                  <p className="text-xs text-slate-500">—</p>
                ) : (
                  <div className="space-y-2">
                    {todayCheckouts.map(b => {
                      const guest = getGuest(b.guestId);
                      const room = getRoom(b.roomId);
                      return (
                        <div key={b.id} className="flex items-center gap-2.5 text-xs">
                          <span className="w-1.5 h-1.5 bg-blue-500/60 rounded-full flex-shrink-0" />
                          <span className="text-slate-300">{guest?.name}</span>
                          <span className="text-slate-500">·</span>
                          <span className="text-slate-500">{room?.name}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {pending.length > 0 && (
            <div className="bg-dark-800/50 rounded-lg border border-white/[0.02]">
              <div className="px-5 py-3.5 border-b border-white/[0.02]">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-[2px]">Pending Confirmation</h2>
              </div>
              <div className="divide-y divide-white/[0.02]">
                {pending.map(b => {
                  const guest = getGuest(b.guestId);
                  const room = getRoom(b.roomId);
                  return (
                    <div key={b.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{guest?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{room?.name || b.roomId} · {formatDate(b.checkIn)}</p>
                      </div>
                      <button onClick={() => confirmBooking(b.id)} className="px-3 py-2 min-h-[44px] bg-amber-500/10 text-amber-400 text-xs font-medium rounded hover:bg-amber-500/20 focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3" /> Confirm
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-dark-800/50 rounded-lg border border-white/[0.02]">
            <div className="px-5 py-3.5 border-b border-white/[0.02]">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-[2px]">Room Status</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-1.5">
                {rooms.map(r => {
                  const isOcc = confirmed.some(b => b.roomId === r.id && todayStr >= b.checkIn && todayStr < b.checkOut);
                  return (
                    <div key={r.id} className={`px-3 py-2 rounded text-center text-xs font-medium ${isOcc ? 'bg-red-500/8 text-red-400/70' : 'bg-emerald-500/8 text-emerald-400/70'}`}>
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
