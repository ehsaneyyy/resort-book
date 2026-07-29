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
          events.push({ ...b, isCheckin: dateStr === b.checkIn, isCheckout: dateStr === b.checkOut, guest: getGuest(b.guestId) });
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
  const palette = ['bg-amber-500/40', 'bg-emerald-500/40', 'bg-blue-500/40', 'bg-purple-500/40', 'bg-rose-500/40', 'bg-teal-500/40', 'bg-sky-500/40'];
  rooms.forEach((r, i) => { roomColors[r.id] = palette[i % palette.length]; });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={prev} className="p-2 hover:bg-white/[0.02] rounded focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors"><ChevronLeft className="w-4 h-4 text-slate-500" /></button>
        <h2 className="text-sm font-medium text-white">{MONTH_NAMES[month]} {year}</h2>
        <button onClick={next} className="p-2 hover:bg-white/[0.02] rounded focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors"><ChevronRight className="w-4 h-4 text-slate-500" /></button>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {rooms.map(r => (
          <div key={r.id} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-sm ${roomColors[r.id]}`} />
            <span className="text-slate-500">{r.name}</span>
          </div>
        ))}
      </div>

      <div className="bg-dark-800/50 rounded-lg border border-white/[0.02] overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-white/[0.01]">
          {DAYS.map(d => (
            <div key={d} className="bg-dark-800/50 text-center py-2 text-xs font-semibold text-slate-500 uppercase tracking-[1px]">{d}</div>
          ))}
          {calendarDays.map((cell, i) => {
            if (!cell.day) return <div key={`e${i}`} className="bg-dark-800/30 min-h-[80px] lg:min-h-[110px]" />;
            const isSelected = selected === cell.dateStr;
            return (
              <div
                key={cell.day}
                onClick={() => setSelected(isSelected ? null : cell.dateStr)}
                className={`bg-dark-800/50 min-h-[80px] lg:min-h-[110px] p-1.5 cursor-pointer focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors ${isSelected ? 'bg-white/[0.02] ring-1 ring-amber-500/30' : 'hover:bg-white/[0.01]'} ${cell.isToday ? 'bg-white/[0.01]' : ''}`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-xs font-medium ${cell.isToday ? 'text-amber-400' : 'text-slate-500'}`}>{cell.day}</span>
                  {cell.events.length > 0 && <span className="w-1 h-1 bg-amber-500/60 rounded-full" />}
                </div>
                <div className="space-y-px">
                  {cell.events.slice(0, 3).map((ev, j) => (
                    <div key={j} className={`px-1 py-px rounded text-[10px] lg:text-[11px] font-medium truncate ${roomColors[ev.roomId] || 'bg-slate-600/30'} text-white/80`}>
                      {ev.isCheckin ? '→ ' : ev.isCheckout ? '← ' : ''}{ev.guest?.name?.split(' ')[0] || ev.guestId}
                    </div>
                  ))}
                  {cell.events.length > 3 && <p className="text-[11px] text-slate-500 text-center">+{cell.events.length - 3}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selected && (
        <div className="bg-dark-800/50 rounded-lg border border-white/[0.02] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">{formatDate(selected)}</h3>
            <span className="text-xs text-slate-500">{selectedEvents.length} booking{selectedEvents.length !== 1 ? 's' : ''}</span>
          </div>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-slate-500">No bookings</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((ev, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-dark-700/30 rounded border border-white/[0.02]">
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-white text-xs font-medium ${roomColors[ev.roomId] || 'bg-slate-600/30'}`}>
                    <BedDouble className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm text-white font-medium">{ev.room?.name || ev.roomId}</p>
                      {ev.isCheckin && <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400/80 text-xs font-medium rounded">IN</span>}
                      {ev.isCheckout && <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400/80 text-xs font-medium rounded">OUT</span>}
                    </div>
                    <p className="text-xs text-slate-500">{ev.guest?.name || ev.guestId} · {ev.checkIn} → {ev.checkOut}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded ${ev.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400/80' : 'bg-amber-500/10 text-amber-400/80'}`}>{ev.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
