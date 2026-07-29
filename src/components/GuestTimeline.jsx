import { useStore } from '../hooks/useStore';
import { formatDate, formatCurrency, statusColor } from '../data/utils';
import { Calendar, CreditCard, LogIn, LogOut, BookOpen } from 'lucide-react';

export default function GuestTimeline({ guestId }) {
  const { bookings, getRoom } = useStore();
  const guestBookings = bookings
    .filter(b => b.guestId === guestId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  if (guestBookings.length === 0) {
    return <p className="text-slate-500 text-sm">No booking history yet.</p>;
  }

  const getEvents = (booking) => {
    const room = getRoom(booking.roomId);
    const events = [
      { icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Booked', date: booking.createdAt, detail: `${room?.name || booking.roomId} · ${booking.nights}N · ${formatCurrency(booking.total)}` },
    ];

    if (booking.status !== 'Cancelled') {
      events.push({ icon: CreditCard, color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: `Payment ${booking.paymentStatus}`, date: booking.createdAt, detail: booking.paymentMethod });
    }

    if (booking.status === 'Confirmed' || booking.status === 'Checked Out') {
      events.push({ icon: LogIn, color: 'text-brand-400', bg: 'bg-brand-500/20', label: 'Checked In', date: booking.checkIn, detail: room?.name || booking.roomId });
    }

    if (booking.status === 'Checked Out') {
      events.push({ icon: LogOut, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Checked Out', date: booking.checkOut, detail: `${booking.nights} night stay` });
    }

    if (booking.status === 'Cancelled') {
      events.push({ icon: Calendar, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Cancelled', date: booking.createdAt, detail: booking.specialRequests || 'No reason given' });
    }

    return events;
  };

  return (
    <div className="space-y-6">
      {guestBookings.map(booking => {
        const events = getEvents(booking);
        return (
          <div key={booking.id} className="relative">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-2 py-0.5 text-[12px] rounded-full font-medium border ${statusColor(booking.status)}`}>{booking.status}</span>
              <span className="text-xs text-slate-500">{booking.id}</span>
            </div>
            <div className="relative pl-6 border-l-2 border-white/10 space-y-4 ml-1.5">
              {events.map((ev, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -left-[31px] w-4 h-4 rounded-full flex items-center justify-center ${ev.bg}`}>
                    <ev.icon className={`w-2.5 h-2.5 ${ev.color}`} />
                  </div>
                  <div className="bg-dark-700/30 rounded-lg p-3 border border-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-sm font-medium ${ev.color}`}>{ev.label}</p>
                      <p className="text-[12px] text-slate-500">{formatDate(ev.date)}</p>
                    </div>
                    <p className="text-xs text-slate-400">{ev.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
