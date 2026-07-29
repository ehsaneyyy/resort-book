import { useState, useEffect, useRef } from 'react';
import { useStore } from '../hooks/useStore';
import { useToast } from './Toast';
import { formatCurrency, today } from '../data/utils';
import { whatsappLink, confirmationMsg } from '../data/templates';
import { MessageCircle, Send, Plus } from 'lucide-react';

function calcNights(a, b) {
  return Math.ceil((new Date(b) - new Date(a)) / 864e5);
}

export default function WhatsAppQuickAdd({ onClose }) {
  const { rooms, guests, bookings, updateBookings, updateGuests, resort, getRoom } = useStore();
  const toast = useToast();
  const [step, setStep] = useState('form');
  const [form, setForm] = useState({ name: '', phone: '+91', roomId: rooms[0]?.id || '', checkIn: today(), nights: 2, adults: 2 });
  const [booking, setBooking] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const calcCheckOut = () => {
    const d = new Date(form.checkIn);
    d.setDate(d.getDate() + Number(form.nights));
    return d.toISOString().split('T')[0];
  };

  const room = getRoom(form.roomId);
  const checkOut = calcCheckOut();
  const nights = Number(form.nights);
  const total = room ? room.price * nights : 0;

  const submit = (e) => {
    e.preventDefault();
    const roomObj = rooms.find(r => r.id === form.roomId);
    if (!roomObj || !form.name.trim() || !form.phone.trim()) return;
    if (form.checkIn < today()) { toast('Check-in cannot be in the past', 'warning'); return; }

    let guestId = form.guestId;
    if (!guestId) {
      const existing = guests.find(g => g.phone.replace(/\D/g, '').slice(-10) === form.phone.replace(/\D/g, '').slice(-10));
      if (existing) {
        guestId = existing.id;
      } else {
        const maxNum = guests.reduce((max, g) => Math.max(max, parseInt(g.id.replace(/\D/g, ''), 10) || 0), 0);
        guestId = 'G' + String(maxNum + 1).padStart(3, '0');
        updateGuests(prev => [...prev, { id: guestId, name: form.name.trim(), email: '', phone: form.phone.trim(), city: '', totalBookings: 0, totalSpent: 0, lastStay: null, vip: false, notes: '' }]);
      }
    }

    const maxBNum = bookings.reduce((max, b) => Math.max(max, parseInt(b.id.replace(/\D/g, ''), 10) || 0), 0);
    const newBooking = {
      id: 'RB' + String(maxBNum + 1).padStart(3, '0'),
      guestId, roomId: form.roomId, checkIn: form.checkIn, checkOut,
      nights, adults: Number(form.adults), children: 0,
      total, status: 'Pending', paymentStatus: 'Pending', paymentMethod: 'Pay at Hotel',
      source: 'WhatsApp', specialRequests: '',
      createdAt: today(),
    };

    updateBookings(prev => [...prev, newBooking]);
    setBooking(newBooking);
    toast('Booking created', 'success');
    setStep('done');
  };

  const openWhatsApp = () => {
    const guest = booking ? { name: form.name, phone: form.phone } : null;
    const roomObj = booking ? getRoom(booking.roomId) : null;
    const msg = confirmationMsg(booking, guest, roomObj, resort);
    const link = whatsappLink(form.phone, msg);
    if (link !== '#') window.open(link, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-dark-800/95 rounded-lg border border-white/[0.02]">
        <div className="px-5 py-3.5 border-b border-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <h3 className="text-sm font-medium text-white">Quick Add</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-600 hover:text-amber-400 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {step === 'form' && (
          <form onSubmit={submit} className="p-5 space-y-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1">Guest Name</label>
              <input ref={inputRef} required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10" placeholder="Vikash M" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1">Phone</label>
              <input required type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1">Room</label>
                <select value={form.roomId} onChange={e => setForm({ ...form, roomId: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10">
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1">Check-in</label>
                <input required type="date" min={today()} value={form.checkIn} onChange={e => setForm({ ...form, checkIn: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1">Nights</label>
                <select value={form.nights} onChange={e => setForm({ ...form, nights: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10">
                  {[1,2,3,4,5,6,7,10,14].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1">Adults</label>
                <select value={form.adults} onChange={e => setForm({ ...form, adults: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10">
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-dark-700/30 rounded p-3 space-y-1">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-slate-500">{room?.name || 'Select room'} · {nights}N</span>
                <span className="text-white font-medium">{formatCurrency(total)}</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-slate-500">{form.checkIn} → {checkOut}</span>
                <span className="text-[10px] text-slate-600">Source: WhatsApp</span>
              </div>
            </div>

            <button type="submit" className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[12px] font-medium rounded transition-colors flex items-center justify-center gap-2">
              <Plus className="w-3.5 h-3.5" /> Create Booking
            </button>
          </form>
        )}

        {step === 'done' && (
          <div className="p-5 space-y-4">
            <div className="bg-emerald-500/8 rounded-lg p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                <MessageCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-sm text-white font-medium mb-1">Booking Created</p>
              <p className="text-[12px] text-slate-500">{booking?.id} · {form.name} · {formatCurrency(total)}</p>
            </div>

            <button onClick={openWhatsApp} className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[12px] font-medium rounded transition-colors flex items-center justify-center gap-2">
              <Send className="w-3.5 h-3.5" /> Send Confirmation via WhatsApp
            </button>

            <button onClick={onClose} className="w-full py-2 bg-dark-700 text-slate-400 text-[12px] rounded transition-colors">Done</button>
          </div>
        )}
      </div>
    </div>
  );
}
