import { useState, useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import { formatDate, today } from '../data/utils';
import { ChevronLeft, ChevronRight, BedDouble } from 'lucide-react';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfMonth(y, m) { return new Date(y, m, 1).getDay(); }
function isInRange(dateStr, start, end) { return dateStr >= start && dateStr < end; }

export default function Calendar() {
  const { rooms, bookings, getGuest } = useStore();
  const [viewDate, setViewDate] = useState(new Date());
  const [selected, setSelected] = useState(null);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const todayStr = today();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prev = () => setViewDate(new Date(year, month - 1, 1));
  const next = () => setViewDate(new Date(year, month + 1, 1));

  const calendarDays = useMemo(() => {
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push({ day: null, events: [] });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const events = [];
      bookings.forEach(b => {
        if (b.status === 'Cancelled') return;
        if (isInRange(dateStr, b.checkIn, b.checkOut)) {
          const isCheckin = dateStr === b.checkIn;
          const isCheckout = dateStr === b.checkOut;
          events.push({ ...b, isCheckin, isCheckout, guest: getGuest(b.guestId) });
        }
      });
      cells.push({ day: d, dateStr, events, isToday: dateStr === todayStr });
    }
    return cells;
  }, [year, month, daysInMonth, firstDay, bookings, todayStr]);

  const selectedEvents = useMemo(() => {
    if (!selected) return [];
    return bookings.filter(b => b.status !== 'Cancelled' && isInRange(selected, b.checkIn, b.checkOut)).map(b => ({
      ...b,
      isCheckin: selected === b.checkIn,
      isCheckout: selected === b.checkOut,
      guest: getGuest(b.guestId),
      room: rooms.find(r => r.id === b.roomId),
    }));
  }, [selected, bookings, rooms]);

  const roomColors = {};
  const palette = ['bg-brand-500', 'bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-rose-500', 'bg-amber-500', 'bg-teal-500'];
  rooms.forEach((r, i) => { roomColors[r.id] = palette[i % palette.length]; });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={prev} className="p-2 hover:bg-white/5 rounded-xl transition"><ChevronLeft className="w-5 h-5 text-slate-400" /></button>
        <h2 className="text-xl font-bold text-white">{MONTH_NAMES[month]} {year}</h2>
        <button onClick={next} className="p-2 hover:bg-white/5 rounded-xl transition"><ChevronRight className="w-5 h-5 text-slate-400" /></button>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {rooms.map(r => (
          <div key={r.id} className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${roomColors[r.id]}`} />
            <span className="text-slate-400">{r.name}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-white/5 rounded-2xl overflow-hidden">
        {DAYS.map(d => (
          <div key={d} className="bg-dark-800/80 text-center py-2 text-xs font-medium text-slate-500">{d}</div>
        ))}
        {calendarDays.map((cell, i) => {
          if (!cell.day) return <div key={`e${i}`} className="bg-dark-800/20 min-h-[80px] lg:min-h-[120px]" />;
          const isSelected = selected === cell.dateStr;
          return (
            <div
              key={cell.day}
              onClick={() => setSelected(isSelected ? null : cell.dateStr)}
              className={`bg-dark-800/50 min-h-[80px] lg:min-h-[120px] p-1.5 cursor-pointer transition border border-transparent ${isSelected ? 'ring-2 ring-brand-500 bg-dark-700/50' : 'hover:bg-dark-700/30'} ${cell.isToday ? 'bg-white/[0.02]' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs lg:text-sm font-medium ${cell.isToday ? 'text-brand-400' : 'text-slate-400'}`}>{cell.day}</span>
                {cell.events.length > 0 && <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />}
              </div>
              <div className="space-y-0.5">
                {cell.events.slice(0, 3).map((ev, j) => (
                  <div key={j} className={`px-1 py-0.5 rounded text-[9px] lg:text-[10px] font-medium truncate ${roomColors[ev.roomId] || 'bg-slate-500'} text-white`}>
                    {ev.isCheckin ? '→ ' : ev.isCheckout ? '← ' : ''}{ev.guest?.name?.split(' ')[0] || ev.guestId}
                  </div>
                ))}
                {cell.events.length > 3 && <p className="text-[9px] text-slate-500 text-center">+{cell.events.length - 3} more</p>}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="bg-dark-800/50 rounded-2xl border border-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">{formatDate(selected)}</h3>
            <span className="text-sm text-slate-500">{selectedEvents.length} booking{selectedEvents.length !== 1 ? 's' : ''}</span>
          </div>
          {selectedEvents.length === 0 ? (
            <p className="text-slate-500 text-sm">No bookings for this date</p>
          ) : (
            <div className="space-y-3">
              {selectedEvents.map((ev, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-dark-700/50 rounded-xl border border-white/5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold ${roomColors[ev.roomId] || 'bg-slate-500'}`}>
                    <BedDouble className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-medium">{ev.room?.name || ev.roomId}</p>
                      {ev.isCheckin && <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded-full font-medium border border-emerald-500/20">Check-in</span>}
                      {ev.isCheckout && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] rounded-full font-medium border border-blue-500/20">Check-out</span>}
                    </div>
                    <p className="text-slate-500 text-xs">{ev.guest?.name || ev.guestId} &middot; {ev.checkIn} → {ev.checkOut}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] rounded-full font-medium border ${ev.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'}`}>{ev.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
