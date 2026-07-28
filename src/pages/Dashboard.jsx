import { useStore } from '../hooks/useStore';
import { formatCurrency, formatDate, today } from '../data/utils';
import { useToast } from '../components/Toast';
import { AlertCircle, Star, ArrowUpRight, ArrowDownRight, CheckCircle, Calendar } from 'lucide-react';

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
  const recentBookings = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const vipGuests = guests.filter(g => g.vip);
  const upcomingArrivals = confirmed.filter(b => b.checkIn > todayStr).sort((a, b) => a.checkIn.localeCompare(b.checkIn)).slice(0, 3);

  const confirmBooking = (id) => {
    updateBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Confirmed' } : b));
    toast('Booking confirmed', 'success');
  };

  const stats = [
    { label: 'Total Bookings', value: bookings.length, sub: `${confirmed.length} confirmed`, color: 'text-white', border: 'border-white/5' },
    { label: "Today's Revenue", value: formatCurrency(todayRevenue), sub: `${todayCheckins.length} check-ins`, color: 'text-emerald-400', border: 'border-emerald-500/10' },
    { label: 'Occupancy', value: `${occupancy}%`, sub: `${occupied}/${rooms.length} rooms`, color: 'text-blue-400', border: 'border-blue-500/10' },
    { label: 'Pending', value: pending.length, sub: `${todayCheckins.length} check-ins today`, color: 'text-yellow-400', border: 'border-yellow-500/10' },
    { label: 'Guests', value: guests.length, sub: `${vipGuests.length} VIP`, color: 'text-brand-400', border: 'border-brand-500/10' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s, i) => (
          <div key={i} className={`bg-dark-800/50 rounded-2xl border ${s.border} p-5 hover:bg-dark-800/80 transition`}>
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">{s.label}</p>
            <p className={`text-2xl lg:text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-dark-800/50 rounded-2xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Recent Bookings</h3>
            </div>
            <div className="space-y-3">
              {recentBookings.map(b => {
                const guest = getGuest(b.guestId);
                const room = getRoom(b.roomId);
                return (
                  <div key={b.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.02] transition">
                    <div className="w-10 h-10 bg-brand-500/20 rounded-xl flex items-center justify-center text-brand-400 text-sm font-bold flex-shrink-0">
                      {guest?.name.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{guest?.name || 'Unknown'}</p>
                      <p className="text-slate-500 text-xs">{room?.name || b.roomId} &middot; {formatDate(b.checkIn)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-amber-400 text-sm font-medium">{formatCurrency(b.total)}</p>
                      <span className={`inline-block px-2 py-0.5 text-[10px] rounded-full font-medium border ${b.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : b.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : b.status === 'Cancelled' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>{b.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {upcomingArrivals.length > 0 && (
            <div className="bg-dark-800/50 rounded-2xl border border-white/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Upcoming Arrivals</h3>
              </div>
              <div className="space-y-3">
                {upcomingArrivals.map(b => {
                  const guest = getGuest(b.guestId);
                  const room = getRoom(b.roomId);
                  const daysUntil = Math.ceil((new Date(b.checkIn) - new Date(todayStr)) / 864e5);
                  return (
                    <div key={b.id} className="flex items-center gap-4 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 text-sm font-bold flex-shrink-0">
                        {guest?.name.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{guest?.name || 'Unknown'}</p>
                        <p className="text-slate-500 text-xs">{room?.name || b.roomId} &middot; {b.nights}N</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-blue-400 text-sm font-medium">{daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}</p>
                        <p className="text-amber-400 text-xs">{formatCurrency(b.total)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-dark-800/50 rounded-2xl border border-white/5 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Today's Activity</h3>
            <div className="space-y-3">
              {todayCheckins.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                    <p className="text-sm font-medium text-emerald-400">{todayCheckins.length} Check-in{todayCheckins.length > 1 ? 's' : ''}</p>
                  </div>
                  {todayCheckins.map(b => {
                    const guest = getGuest(b.guestId);
                    const room = getRoom(b.roomId);
                    return (
                      <div key={b.id} className="flex items-center gap-3 p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10 ml-4">
                        <div className="w-7 h-7 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 text-[10px] font-bold flex-shrink-0">
                          {guest?.name.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium truncate">{guest?.name || 'Unknown'}</p>
                          <p className="text-slate-500 text-[10px]">{room?.name || b.roomId}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                  <ArrowDownRight className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-white text-sm font-medium">0 Check-ins</p>
                    <p className="text-slate-500 text-xs">No arrivals today</p>
                  </div>
                </div>
              )}

              {todayCheckouts.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowUpRight className="w-4 h-4 text-blue-400" />
                    <p className="text-sm font-medium text-blue-400">{todayCheckouts.length} Check-out{todayCheckouts.length > 1 ? 's' : ''}</p>
                  </div>
                  {todayCheckouts.map(b => {
                    const guest = getGuest(b.guestId);
                    const room = getRoom(b.roomId);
                    return (
                      <div key={b.id} className="flex items-center gap-3 p-2 bg-blue-500/5 rounded-lg border border-blue-500/10 ml-4">
                        <div className="w-7 h-7 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 text-[10px] font-bold flex-shrink-0">
                          {guest?.name.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium truncate">{guest?.name || 'Unknown'}</p>
                          <p className="text-slate-500 text-[10px]">{room?.name || b.roomId}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                  <ArrowUpRight className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white text-sm font-medium">0 Check-outs</p>
                    <p className="text-slate-500 text-xs">No departures today</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {pending.length > 0 && (
            <div className="bg-dark-800/50 rounded-2xl border border-white/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">Pending Confirmations</h3>
              </div>
              <div className="space-y-2">
                {pending.map(b => {
                  const guest = getGuest(b.guestId);
                  const room = getRoom(b.roomId);
                  return (
                    <div key={b.id} className="flex items-center gap-3 p-3 bg-yellow-500/5 rounded-xl border border-yellow-500/10">
                      <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center text-yellow-400 text-xs font-bold flex-shrink-0">
                        {guest?.name.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{guest?.name || 'Unknown'}</p>
                        <p className="text-slate-500 text-xs">{room?.name || b.roomId} &middot; {formatDate(b.checkIn)}</p>
                      </div>
                      <button onClick={() => confirmBooking(b.id)} className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-medium rounded-lg transition flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Confirm
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-dark-800/50 rounded-2xl border border-white/5 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Room Status</h3>
            <div className="space-y-2">
              {rooms.map(r => {
                const isOccupied = confirmed.some(b => b.roomId === r.id && todayStr >= b.checkIn && todayStr < b.checkOut);
                return (
                  <div key={r.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isOccupied ? 'bg-red-400' : 'bg-emerald-400'}`} />
                      <span className="text-sm text-slate-300">{r.name}</span>
                    </div>
                    <span className={`text-xs ${isOccupied ? 'text-red-400' : 'text-emerald-400'}`}>{isOccupied ? 'Occupied' : 'Available'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-dark-800/50 rounded-2xl border border-white/5 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">VIP Guests</h3>
            <div className="space-y-3">
              {vipGuests.map(g => (
                <div key={g.id} className="flex items-center gap-3 p-2">
                  <div className="w-9 h-9 bg-brand-500/20 rounded-lg flex items-center justify-center text-brand-400 text-sm font-bold">{g.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{g.name}</p>
                    <p className="text-slate-500 text-xs">{g.totalBookings} bookings</p>
                  </div>
                  <Star className="w-4 h-4 text-amber-400" fill="currentColor" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
