import { useState, useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import { formatCurrency, today } from '../data/utils';

export default function Reports() {
  const { bookings, seasonal, getRoom } = useStore();
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
    confirmed.forEach(b => { topRooms[b.roomId] = (topRooms[b.roomId] || 0) + 1; });
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
      <div className="flex gap-1 overflow-x-auto pb-1">
        {['week', 'month', 'quarter', 'year'].map(r => (
          <button key={r} onClick={() => setRange(r)} className={`px-3 py-1.5 rounded text-[12px] font-medium transition-colors capitalize whitespace-nowrap ${range === r ? 'text-white' : 'text-slate-600 hover:text-slate-400'}`}>{r}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Revenue', value: formatCurrency(stats.revenue) },
          { label: 'Bookings', value: stats.totalBookings },
          { label: 'Avg Rate', value: formatCurrency(stats.avgRate) },
          { label: 'Avg Stay', value: stats.avgNights + 'N' },
        ].map((s, i) => (
          <div key={i} className="border-l-2 border-amber-500/30 pl-3">
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-[1.5px]">{s.label}</p>
            <p className="text-2xl font-medium text-white mt-1 tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-dark-800/50 rounded-lg border border-white/[0.02] p-5">
        <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-[2px] mb-4">Revenue ({new Date().getFullYear()})</h3>
        <div className="space-y-1.5">
          {yearlyRevenue.map((rev, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span className="text-[10px] text-slate-600 w-7 text-right">{monthLabels[i]}</span>
              <div className="flex-1 h-5 bg-dark-700/30 rounded overflow-hidden">
                <div className="h-full bg-amber-500/50 flex items-center pl-1.5" style={{ width: `${(rev / maxRevenue) * 100}%` }}>
                  {rev > 0 && <span className="text-[9px] text-white/80 font-medium">{formatCurrency(rev)}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <div className="bg-dark-800/50 rounded-lg border border-white/[0.02] p-5">
          <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-[2px] mb-3">Revenue by Type</h3>
          <div className="space-y-2">
            {Object.entries(stats.revenueByRoomType).sort((a, b) => b[1] - a[1]).map(([type, rev]) => (
              <div key={type} className="flex items-center justify-between p-2.5 bg-dark-700/20 rounded text-[13px]">
                <span className="text-slate-300">{type}</span>
                <span className="text-white font-medium">{formatCurrency(rev)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-dark-800/50 rounded-lg border border-white/[0.02] p-5">
          <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-[2px] mb-3">Top Rooms</h3>
          <div className="space-y-2">
            {stats.sortedRooms.slice(0, 5).map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 bg-dark-700/20 rounded">
                <div className="w-7 h-7 bg-dark-700/50 rounded flex items-center justify-center text-[10px] font-medium text-slate-600">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-white">{r.room?.name || 'Unknown'}</p>
                  <p className="text-[10px] text-slate-600">{r.room?.type}</p>
                </div>
                <p className="text-[13px] font-medium text-white">{r.count}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-dark-800/50 rounded-lg border border-white/[0.02] p-5">
          <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-[2px] mb-3">Sources</h3>
          <div className="space-y-2.5">
            {Object.entries(stats.sourceStats).sort((a, b) => b[1] - a[1]).map(([src, count]) => {
              const pct = Math.round((count / stats.confirmedBookings) * 100);
              return (
                <div key={src} className="space-y-1">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-slate-300">{src}</span>
                    <span className="text-slate-600">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-dark-700/30 rounded overflow-hidden">
                    <div className="h-full bg-amber-500/50 rounded" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-dark-800/50 rounded-lg border border-white/[0.02] p-5">
          <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-[2px] mb-3">Pricing Rules</h3>
          <div className="space-y-2">
            {seasonal.map(s => (
              <div key={s.id} className="p-2.5 bg-dark-700/20 rounded text-[13px]">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-white font-medium">{s.name}</span>
                  <span className={`text-[10px] font-medium ${s.isActive ? 'text-emerald-400/70' : 'text-slate-600'}`}>{s.isActive ? 'Active' : 'Off'}</span>
                </div>
                <p className="text-[11px] text-slate-600">{s.startDate} → {s.endDate} · {s.adjustment > 0 ? '+' : ''}{s.adjustment}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
