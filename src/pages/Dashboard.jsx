import { useStore } from '../hooks/useStore';
import { formatCurrency, formatDate, today } from '../data/utils';
import { TrendingUp, Users, BedDouble, Clock, AlertCircle, Star, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function Dashboard() {
  const { bookings, rooms, guests, getGuest, getRoom } = useStore();
  const todayStr = today();
  const confirmed = bookings.filter(b => b.status === 'Confirmed');
  const pending = bookings.filter(b => b.status === 'Pending');
  const checkedOut = bookings.filter(b => b.status === 'Checked Out');
  const totalRevenue = confirmed.reduce((s, b) => s + b.total, 0) + checkedOut.reduce((s, b) => s + b.total, 0);
  const occupied = confirmed.filter(b => todayStr >= b.checkIn && todayStr < b.checkOut).length;
  const occupancy = Math.round((occupied / rooms.length) * 100);
  const todayCheckins = bookings.filter(b => b.checkIn === todayStr && b.status === 'Confirmed');
  const todayCheckouts = bookings.filter(b => b.checkOut === todayStr && b.status === 'Confirmed');
  const recentBookings = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const vipGuests = guests.filter(g => g.vip);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Bookings', value: bookings.length, sub: `${confirmed.length} confirmed`, color: 'text-white', border: 'border-white/5' },
          { label: 'Revenue', value: formatCurrency(totalRevenue), sub: `From ${confirmed.length + checkedOut.length} bookings`, color: 'text-emerald-400', border: 'border-emerald-500/10' },
          { label: 'Occupancy', value: `${occupancy}%`, sub: `${occupied}/${rooms.length} rooms`, color: 'text-blue-400', border: 'border-blue-500/10' },
          { label: 'Pending', value: pending.length, sub: `${todayCheckins.length} check-ins today`, color: 'text-yellow-400', border: 'border-yellow-500/10' },
          { label: 'Guests', value: guests.length, sub: `${vipGuests.length} VIP`, color: 'text-brand-400', border: 'border-brand-500/10' },
        ].map((s, i) => (
          <div key={i} className={`bg-dark-800/50 rounded-2xl border ${s.border} p-5 hover:bg-dark-800/80 transition`}>
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">{s.label}</p>
            <p className={`text-2xl lg:text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-dark-800/50 rounded-2xl border border-white/5 p-6">
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

        <div className="space-y-6">
          <div className="bg-dark-800/50 rounded-2xl border border-white/5 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Today's Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <ArrowDownRight className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{todayCheckins.length} Check-ins</p>
                  <p className="text-slate-500 text-xs">Expected today</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{todayCheckouts.length} Check-outs</p>
                  <p className="text-slate-500 text-xs">Expected today</p>
                </div>
              </div>
            </div>
          </div>

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
