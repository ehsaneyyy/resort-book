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
  const palette = ['bg-brand-600', 'bg-emerald-600', 'bg-blue-600', 'bg-purple-600', 'bg-rose-600', 'bg-amber-600', 'bg-teal-600'];
  rooms.forEach((r, i) => { roomColors[r.id] = palette[i % palette.length]; });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={prev} className="p-1.5 hover:bg-white/5 rounded transition-colors"><ChevronLeft className="w-4 h-4 text-slate-400" /></button>
        <h2 className="text-sm font-medium text-white">{MONTH_NAMES[month]} {year}</h2>
        <button onClick={next} className="p-1.5 hover:bg-white/5 rounded transition-colors"><ChevronRight className="w-4 h-4 text-slate-400" /></button>
      </div>

      <div className="flex flex-wrap gap-2 text-[10px]">
        {rooms.map(r => (
          <div key={r.id} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-sm ${roomColors[r.id]}`} />
            <span className="text-slate-500">{r.name}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-white/5">
        {DAYS.map(d => (
          <div key={d} className="bg-dark-800 text-center py-1.5 text-[10px] font-medium text-slate-500">{d}</div>
        ))}
        {calendarDays.map((cell, i) => {
          if (!cell.day) return <div key={`e${i}`} className="bg-dark-800/50 min-h-[60px] lg:min-h-[100px]" />;
          const isSelected = selected === cell.dateStr;
          return (
            <div
              key={cell.day}
              onClick={() => setSelected(isSelected ? null : cell.dateStr)}
              className={`bg-dark-800 min-h-[60px] lg:min-h-[100px] p-1 cursor-pointer transition-colors border ${isSelected ? 'border-brand-500/50 bg-dark-700/50' : 'border-transparent hover:bg-white/[0.02]'} ${cell.isToday ? 'bg-white/[0.02]' : ''}`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className={`text-[11px] font-medium ${cell.isToday ? 'text-brand-400' : 'text-slate-500'}`}>{cell.day}</span>
                {cell.events.length > 0 && <span className="w-1 h-1 bg-brand-500 rounded-full" />}
              </div>
              <div className="space-y-px">
                {cell.events.slice(0, 3).map((ev, j) => (
                  <div key={j} className={`px-1 py-px rounded-sm text-[8px] lg:text-[9px] font-medium truncate ${roomColors[ev.roomId] || 'bg-slate-600'} text-white`}>
                    {ev.isCheckin ? '→ ' : ev.isCheckout ? '← ' : ''}{ev.guest?.name?.split(' ')[0] || ev.guestId}
                  </div>
                ))}
                {cell.events.length > 3 && <p className="text-[8px] text-slate-600 text-center">+{cell.events.length - 3}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="bg-dark-800 border border-white/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">{formatDate(selected)}</h3>
            <span className="text-[11px] text-slate-500">{selectedEvents.length} booking{selectedEvents.length !== 1 ? 's' : ''}</span>
          </div>
          {selectedEvents.length === 0 ? (
            <p className="text-[12px] text-slate-600">No bookings</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((ev, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 bg-dark-700/50 rounded border border-white/5">
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-white text-[10px] font-medium ${roomColors[ev.roomId] || 'bg-slate-600'}`}>
                    <BedDouble className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[12px] text-white font-medium">{ev.room?.name || ev.roomId}</p>
                      {ev.isCheckin && <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-medium rounded">IN</span>}
                      {ev.isCheckout && <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 text-[9px] font-medium rounded">OUT</span>}
                    </div>
                    <p className="text-[11px] text-slate-500">{ev.guest?.name || ev.guestId} · {ev.checkIn} → {ev.checkOut}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[9px] font-medium rounded ${ev.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{ev.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
