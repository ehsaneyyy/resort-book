import { useState, useMemo } from 'react';
import { useBookings, useSeasonalRules, useRooms, useResort } from '../api/hooks';
import { formatCurrency, today } from '../data/utils';
import { MONTHS_SHORT } from '../data/constants';
import { Skeleton } from '../components/Skeleton';

export function Reports() {
  const { data: bookings = [], isLoading: bookingsLoading } = useBookings();
  const { data: seasonal = [], isLoading: seasonalLoading } = useSeasonalRules();
  const { data: rooms = [], isLoading: roomsLoading } = useRooms();
  const { data: resort } = useResort();
  const loading = bookingsLoading || seasonalLoading || roomsLoading;
  const todayStr = today();
  const [range, setRange] = useState('month');
  const curr = resort?.currency;
  const roomsById = useMemo(() => Object.fromEntries(rooms.map(r => [r.id, r])), [rooms]);

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
      const r = roomsById[b.roomId];
      const type = r?.type || 'Unknown';
      revenueByRoomType[type] = (revenueByRoomType[type] || 0) + b.total;
    });
    const topRooms = {};
    confirmed.forEach(b => { topRooms[b.roomId] = (topRooms[b.roomId] || 0) + 1; });
    const sortedRooms = Object.entries(topRooms).sort((a, b) => b[1] - a[1]).map(([id, count]) => ({ room: roomsById[id], count }));
    const sourceStats = {};
    confirmed.forEach(b => { sourceStats[b.source] = (sourceStats[b.source] || 0) + 1; });
    return { revenue, avgRate, avgNights, totalBookings: relevant.length, confirmedBookings: confirmed.length, totalGuests: new Set(confirmed.map(b => b.guestId)).size, revenueByRoomType, sortedRooms, sourceStats };
  }, [relevant, roomsById]);

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-1"><Skeleton className="h-11 w-16 rounded" /><Skeleton className="h-11 w-24 rounded" /></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="border-l-2 border-white/[0.03] pl-3 space-y-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-7 w-24" /><Skeleton className="h-3 w-12" /></div>)}
        </div>
        <div className="bg-dark-800/50 rounded-lg border border-white/[0.02] p-5"><Skeleton className="h-4 w-32 mb-4" />{Array.from({ length: 12 }).map((_, i) => <div key={i} className="flex items-center gap-2.5 mb-1.5"><Skeleton className="h-3 w-7" /><Skeleton className="h-5 flex-1 rounded" /></div>)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-1 overflow-x-auto pb-1">
        {['week', 'month', 'quarter', 'year'].map(r => (
          <button key={r} onClick={() => setRange(r)} className={`px-3 py-2 min-h-[44px] rounded text-xs font-medium focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors capitalize whitespace-nowrap ${range === r ? 'text-white bg-amber-500/10' : 'text-slate-500 hover:text-slate-400'}`}>{r}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Revenue', value: formatCurrency(stats.revenue, curr) },
          { label: 'Bookings', value: stats.totalBookings },
          { label: 'Avg Rate', value: formatCurrency(stats.avgRate, curr) },
          { label: 'Avg Stay', value: stats.avgNights + 'N' },
        ].map((s, i) => (
          <div key={i} className="border-l-2 border-amber-500/30 pl-3">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-[1.5px]">{s.label}</p>
            <p className="text-2xl font-medium text-white mt-1 tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-dark-800/50 rounded-lg border border-white/[0.02] p-5">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-[2px] mb-4">Revenue ({new Date().getFullYear()})</h3>
        <div className="space-y-1.5">
          {yearlyRevenue.map((rev, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span className="text-xs text-slate-500 w-7 text-right">{MONTHS_SHORT[i]}</span>
              <div className="flex-1 h-5 bg-dark-700/30 rounded overflow-hidden">
                <div className="h-full bg-amber-500/50 flex items-center pl-1.5" style={{ width: `${(rev / maxRevenue) * 100}%` }}>
                  {rev > 0 && <span className="text-[9px] text-white/80 font-medium">{formatCurrency(rev, curr)}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <div className="bg-dark-800/50 rounded-lg border border-white/[0.02] p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-[2px] mb-3">Revenue by Type</h3>
          <div className="space-y-2">
            {Object.entries(stats.revenueByRoomType).sort((a, b) => b[1] - a[1]).map(([type, rev]) => (
              <div key={type} className="flex items-center justify-between p-2.5 bg-dark-700/20 rounded text-sm">
                <span className="text-slate-300">{type}</span>
                <span className="text-white font-medium">{formatCurrency(rev, curr)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-dark-800/50 rounded-lg border border-white/[0.02] p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-[2px] mb-3">Top Rooms</h3>
          <div className="space-y-2">
            {stats.sortedRooms.slice(0, 5).map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 bg-dark-700/20 rounded">
                <div className="w-7 h-7 bg-dark-700/50 rounded flex items-center justify-center text-xs font-medium text-slate-500">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{r.room?.name || 'Unknown'}</p>
                  <p className="text-xs text-slate-500">{r.room?.type}</p>
                </div>
                <p className="text-sm font-medium text-white">{r.count}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-dark-800/50 rounded-lg border border-white/[0.02] p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-[2px] mb-3">Sources</h3>
          <div className="space-y-2.5">
            {Object.entries(stats.sourceStats).sort((a, b) => b[1] - a[1]).map(([src, count]) => {
              const pct = Math.round((count / stats.confirmedBookings) * 100);
              return (
                <div key={src} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{src}</span>
                    <span className="text-slate-500">{count} ({pct}%)</span>
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
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-[2px] mb-3">Pricing Rules</h3>
          <div className="space-y-2">
            {seasonal.map(s => (
              <div key={s.id} className="p-2.5 bg-dark-700/20 rounded text-sm">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-white font-medium">{s.name}</span>
                  <span className={`text-xs font-medium ${s.isActive ? 'text-emerald-400/70' : 'text-slate-500'}`}>{s.isActive ? 'Active' : 'Off'}</span>
                </div>
                <p className="text-xs text-slate-500">{s.startDate} \u2192 {s.endDate} &middot; {s.adjustment > 0 ? '+' : ''}{s.adjustment}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
