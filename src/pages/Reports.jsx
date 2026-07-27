import { useState, useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import { formatCurrency, today } from '../data/utils';

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }

export default function Reports() {
  const { bookings, rooms, seasonal, getGuest, getRoom } = useStore();
  const todayStr = today();
  const [range, setRange] = useState('month');

  const dateRange = useMemo(() => {
    const now = new Date(todayStr);
    let start, end;
    if (range === 'week') {
      start = new Date(now); start.setDate(start.getDate() - 6);
      end = new Date(now);
    } else if (range === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now);
    } else if (range === 'quarter') {
      const q = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), q * 3, 1);
      end = new Date(now);
    } else {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now);
    }
    const format = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { start: format(start), end: format(end) };
  }, [todayStr, range]);

  const relevant = useMemo(() => bookings.filter(b => {
    if (b.status === 'Cancelled') return false;
    return b.checkIn <= dateRange.end && b.checkOut > dateRange.start;
  }), [bookings, dateRange]);

  const stats = useMemo(() => {
    const confirmed = relevant.filter(b => b.status !== 'Cancelled');
    const revenue = confirmed.reduce((s, b) => s + b.total, 0);
    const totalNights = confirmed.reduce((s, b) => s + b.nights, 0);
    const avgRate = confirmed.length ? Math.round(revenue / confirmed.length) : 0;
    const avgNights = confirmed.length ? (totalNights / confirmed.length).toFixed(1) : 0;
    const revenueByRoomType = {};
    confirmed.forEach(b => {
      const r = getRoom(b.roomId);
      const type = r?.type || 'Unknown';
      revenueByRoomType[type] = (revenueByRoomType[type] || 0) + b.total;
    });
    const topRooms = {};
    confirmed.forEach(b => {
      topRooms[b.roomId] = (topRooms[b.roomId] || 0) + 1;
    });
    const sortedRooms = Object.entries(topRooms).sort((a, b) => b[1] - a[1]).map(([id, count]) => ({ room: getRoom(id), count }));
    const sourceStats = {};
    confirmed.forEach(b => { sourceStats[b.source] = (sourceStats[b.source] || 0) + 1; });
    return { revenue, avgRate, avgNights, totalBookings: relevant.length, confirmedBookings: confirmed.length, totalGuests: new Set(confirmed.map(b => b.guestId)).size, revenueByRoomType, sortedRooms, sourceStats };
  }, [relevant, getRoom]);

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const yearlyRevenue = useMemo(() => {
    const now = new Date(todayStr);
    const data = [];
    for (let i = 0; i < 12; i++) {
      const monthBookings = bookings.filter(b => {
        if (b.status === 'Cancelled') return false;
        const d = new Date(b.checkIn);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === i;
      });
      data.push(monthBookings.reduce((s, b) => s + b.total, 0));
    }
    return data;
  }, [bookings, todayStr]);

  const maxRevenue = Math.max(...yearlyRevenue, 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {['week', 'month', 'quarter', 'year'].map(r => (
          <button key={r} onClick={() => setRange(r)} className={`px-4 py-2 rounded-xl text-sm font-medium transition border capitalize ${range === r ? 'bg-white/10 text-white border-white/10' : 'text-slate-400 hover:text-white border-transparent'}`}>{r}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(stats.revenue), color: 'text-emerald-400' },
          { label: 'Total Bookings', value: stats.totalBookings, color: 'text-white' },
          { label: 'Avg Rate', value: formatCurrency(stats.avgRate), color: 'text-amber-400' },
          { label: 'Avg Stay', value: stats.avgNights + 'N', color: 'text-blue-400' },
        ].map((s, i) => (
          <div key={i} className="bg-dark-800/50 rounded-2xl border border-white/5 p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-dark-800/50 rounded-2xl border border-white/5 p-6">
        <h3 className="text-sm font-medium text-slate-400 mb-4">Monthly Revenue Trend ({new Date().getFullYear()})</h3>
        <div className="space-y-2">
          {yearlyRevenue.map((rev, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-slate-500 w-8 text-right">{monthLabels[i]}</span>
              <div className="flex-1 h-6 bg-dark-700/50 rounded-lg overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-lg flex items-center pl-2" style={{ width: `${(rev / maxRevenue) * 100}%` }}>
                  {rev > 0 && <span className="text-[10px] text-white font-medium">{formatCurrency(rev)}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-800/50 rounded-2xl border border-white/5 p-6">
          <h3 className="text-sm font-medium text-slate-400 mb-4">Revenue by Room Type</h3>
          <div className="space-y-3">
            {Object.entries(stats.revenueByRoomType).sort((a, b) => b[1] - a[1]).map(([type, rev]) => (
              <div key={type} className="flex items-center justify-between p-3 bg-dark-700/50 rounded-xl">
                <span className="text-sm text-white">{type}</span>
                <span className="text-sm font-medium text-amber-400">{formatCurrency(rev)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-dark-800/50 rounded-2xl border border-white/5 p-6">
          <h3 className="text-sm font-medium text-slate-400 mb-4">Top Rooms</h3>
          <div className="space-y-3">
            {stats.sortedRooms.slice(0, 5).map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-dark-700/50 rounded-xl">
                <div className="w-10 h-10 bg-brand-500/20 rounded-xl flex items-center justify-center text-brand-400 text-sm font-bold">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">{r.room?.name || 'Unknown'}</p>
                  <p className="text-[10px] text-slate-500">{r.room?.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{r.count}</p>
                  <p className="text-[10px] text-slate-500">bookings</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-dark-800/50 rounded-2xl border border-white/5 p-6">
          <h3 className="text-sm font-medium text-slate-400 mb-4">Booking Sources</h3>
          <div className="space-y-3">
            {Object.entries(stats.sourceStats).sort((a, b) => b[1] - a[1]).map(([src, count]) => {
              const pct = Math.round((count / stats.confirmedBookings) * 100);
              return (
                <div key={src} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">{src}</span>
                    <span className="text-xs text-slate-500">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-dark-700/50 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-dark-800/50 rounded-2xl border border-white/5 p-6">
          <h3 className="text-sm font-medium text-slate-400 mb-4">Seasonal Rules</h3>
          <div className="space-y-3">
            {seasonal.map(s => (
              <div key={s.id} className="p-3 bg-dark-700/50 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white font-medium">{s.name}</span>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium border ${s.isActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-red-500/20 text-red-400 border-red-500/20'}`}>{s.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <p className="text-[10px] text-slate-500">{s.startDate} → {s.endDate} &middot; {s.adjustment > 0 ? '+' : ''}{s.adjustment}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
