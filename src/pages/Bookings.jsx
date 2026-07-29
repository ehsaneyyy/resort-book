import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { formatCurrency, formatDate, statusColor, today } from '../data/utils';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import PrintInvoice from '../components/PrintInvoice';
import { Search, Eye, CheckCircle, XCircle, LogOut, Trash2, Printer, Plus, MessageCircle } from 'lucide-react';
import { whatsappLink, confirmationMsg, preArrivalMsg, postStayMsg } from '../data/templates';

export default function Bookings() {
  const { bookings, updateBookings, getGuest, getRoom, resort, rooms, guests, updateGuests } = useStore();
  const toast = useToast();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  let filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(b => { const g = getGuest(b.guestId); return (g && g.name.toLowerCase().includes(q)) || b.id.toLowerCase().includes(q); });
  }

  const update = (id, status) => {
    updateBookings(prev => prev.map(b => b.id === id ? { ...b, status, ...(status === 'Checked Out' ? { paymentStatus: 'Paid' } : {}) } : b));
    toast(`Booking ${status.toLowerCase()}`, status === 'Cancelled' ? 'warning' : 'success');
  };

  const del = (id) => setConfirmId(id);

  const sendWhatsApp = (booking, type) => {
    const g = getGuest(booking.guestId);
    const r = getRoom(booking.roomId);
    let msg;
    if (type === 'confirm') msg = confirmationMsg(booking, g, r, resort);
    else if (type === 'arrival') msg = preArrivalMsg(booking, g, r, resort);
    else msg = postStayMsg(g, resort);
    const link = whatsappLink(g?.phone || '', msg);
    if (link !== '#') window.open(link, '_blank');
  };

  const [printBooking, setPrintBooking] = useState(null);
  const printGuest = printBooking ? getGuest(printBooking.guestId) : null;
  const printRoom = printBooking ? getRoom(printBooking.roomId) : null;

  const printInvoice = (booking) => setPrintBooking(booking);

  const stats = { total: bookings.length, Confirmed: bookings.filter(b => b.status === 'Confirmed').length, Pending: bookings.filter(b => b.status === 'Pending').length, Cancelled: bookings.filter(b => b.status === 'Cancelled').length, 'Checked Out': bookings.filter(b => b.status === 'Checked Out').length };

  const openAdd = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setForm({ roomId: '', guestId: '', checkIn: todayStr, checkOut: '', adults: 2, children: 0, specialRequests: '', source: 'Direct', newGuest: false, name: '', phone: '', email: '', city: '' });
    setModal('add');
  };

  const saveBooking = (e) => {
    e.preventDefault();
    const room = rooms.find(r => r.id === form.roomId);
    if (!room || !form.checkIn || !form.checkOut) return;

    if (form.checkIn < today()) { toast('Check-in cannot be in the past', 'warning'); return; }
    if (form.checkOut <= form.checkIn) { toast('Check-out must be after check-in', 'warning'); return; }

    let guestId = form.guestId;
    if (form.newGuest) {
      const maxNum = guests.reduce((max, g) => { const n = parseInt(g.id.replace(/\D/g, ''), 10); return n > max ? n : max; }, 0);
      guestId = 'G' + String(maxNum + 1).padStart(3, '0');
      updateGuests(prev => [...prev, { id: guestId, name: form.name, phone: form.phone, email: form.email, city: form.city, totalBookings: 0, totalSpent: 0, lastStay: null, vip: false, notes: '' }]);
    }

    const nights = Math.ceil((new Date(form.checkOut) - new Date(form.checkIn)) / 864e5);
    const total = room.price * nights;
    const maxBNum = bookings.reduce((max, b) => { const n = parseInt(b.id.replace(/\D/g, ''), 10); return n > max ? n : max; }, 0);

    updateBookings(prev => [...prev, {
      id: 'RB' + String(maxBNum + 1).padStart(3, '0'),
      guestId, roomId: form.roomId, checkIn: form.checkIn, checkOut: form.checkOut,
      nights, adults: Number(form.adults), children: Number(form.children),
      total, status: 'Pending', paymentStatus: 'Pending', paymentMethod: 'Pay at Hotel',
      source: form.source, specialRequests: form.specialRequests,
      createdAt: new Date().toISOString().split('T')[0]
    }]);
    toast('Booking created', 'success');
    setModal(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {['all', 'Confirmed', 'Pending', 'Checked Out', 'Cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-2 rounded text-[12px] font-medium transition-colors whitespace-nowrap ${filter === s ? 'text-white' : 'text-slate-600 hover:text-slate-400'}`}>
              {s === 'all' ? `All (${stats.total})` : `${s} (${stats[s]})`}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full sm:w-48 pl-8 pr-3 py-2 bg-dark-800/50 border border-white/[0.02] rounded text-sm text-white focus:outline-none focus:border-white/10 placeholder-slate-600" />
          </div>
          <button onClick={openAdd} className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[12px] font-medium rounded transition-colors flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> New
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-dark-800/50 rounded-lg border border-white/[0.02] py-12 text-center text-sm text-slate-600">No bookings</div>
      ) : (
        <>
          <div className="hidden lg:block bg-dark-800/50 rounded-lg border border-white/[0.02] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.02]">
                    {['ID', 'Guest', 'Room', 'Dates', 'Amount', 'Status', ''].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-[12px] font-semibold text-slate-600 uppercase tracking-[1.5px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {filtered.map(b => {
                    const g = getGuest(b.guestId);
                    const r = getRoom(b.roomId);
                    return (
                      <tr key={b.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="py-3 px-4 text-[12px] font-mono text-slate-600">{b.id}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/15 to-amber-600/5 flex items-center justify-center text-amber-400/70 text-[12px] font-medium flex-shrink-0">{g?.name.charAt(0) || '?'}</div>
                            <span className="text-sm text-white">{g?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-500">{r?.name || b.roomId}</td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-slate-300">{formatDate(b.checkIn)}</p>
                          <p className="text-[12px] text-slate-600">{b.nights}N · {b.adults}A{b.children ? `, ${b.children}C` : ''}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-white font-medium">{formatCurrency(b.total)}</p>
                          <p className={`text-[12px] ${b.paymentStatus === 'Paid' ? 'text-emerald-500/70' : b.paymentStatus === 'Refunded' ? 'text-red-500/70' : 'text-amber-500/70'}`}>{b.paymentStatus}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 text-[12px] font-medium rounded ${statusColor(b.status)}`}>{b.status}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <button onClick={() => setDetail(b)} className="p-2 text-slate-600 hover:text-amber-400 transition-colors"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => sendWhatsApp(b, 'confirm')} className="p-2 text-slate-600 hover:text-emerald-400 transition-colors"><MessageCircle className="w-4 h-4" /></button>
                            {b.status === 'Pending' && <><button onClick={() => update(b.id, 'Confirmed')} className="p-1.5 text-emerald-500/60 hover:text-emerald-400 transition-colors"><CheckCircle className="w-4 h-4" /></button><button onClick={() => update(b.id, 'Cancelled')} className="p-1.5 text-red-500/60 hover:text-red-400 transition-colors"><XCircle className="w-4 h-4" /></button></>}
                            {b.status === 'Confirmed' && <><button onClick={() => update(b.id, 'Checked Out')} className="p-1.5 text-blue-500/60 hover:text-blue-400 transition-colors"><LogOut className="w-4 h-4" /></button><button onClick={() => update(b.id, 'Cancelled')} className="p-1.5 text-red-500/60 hover:text-red-400 transition-colors"><XCircle className="w-4 h-4" /></button></>}
                            {(b.status === 'Checked Out' || b.status === 'Cancelled') && <button onClick={() => del(b.id)} className="p-2 text-slate-600 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:hidden space-y-3">
            {filtered.map(b => {
              const g = getGuest(b.guestId);
              const r = getRoom(b.roomId);
              return (
                <div key={b.id} className="bg-dark-800/50 rounded-lg border border-white/[0.02] p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/15 to-amber-600/5 flex items-center justify-center text-amber-400/70 text-xs font-medium flex-shrink-0">{g?.name.charAt(0) || '?'}</div>
                      <div>
                        <p className="text-sm font-medium text-white">{g?.name || 'Unknown'}</p>
                        <p className="text-[12px] font-mono text-slate-600">{b.id}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-[12px] font-medium rounded ${statusColor(b.status)}`}>{b.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[13px] mb-3">
                    <div><span className="text-slate-600">Room</span><p className="text-white">{r?.name || b.roomId}</p></div>
                    <div><span className="text-slate-600">Amount</span><p className="text-white font-medium">{formatCurrency(b.total)}</p></div>
                    <div><span className="text-slate-600">Dates</span><p className="text-white">{formatDate(b.checkIn)} → {formatDate(b.checkOut)}</p></div>
                    <div><span className="text-slate-600">Nights</span><p className="text-white">{b.nights}N · {b.adults}A{b.children ? `, ${b.children}C` : ''}</p></div>
                    <div><span className="text-slate-600">Payment</span><p className={`${b.paymentStatus === 'Paid' ? 'text-emerald-400' : b.paymentStatus === 'Refunded' ? 'text-red-400' : 'text-amber-400'}`}>{b.paymentStatus}</p></div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-white/[0.02]">
                    <button onClick={() => setDetail(b)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[12px] text-slate-600 hover:text-amber-400 bg-white/[0.02] hover:bg-white/[0.04] rounded transition-colors"><Eye className="w-4 h-4" /> View</button>
                    <button onClick={() => sendWhatsApp(b, 'confirm')} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[12px] text-slate-600 hover:text-emerald-400 bg-white/[0.02] hover:bg-white/[0.04] rounded transition-colors"><MessageCircle className="w-4 h-4" /> WhatsApp</button>
                    {b.status === 'Pending' && <button onClick={() => update(b.id, 'Confirmed')} className="flex-1 py-2.5 text-[12px] text-emerald-500/70 hover:text-emerald-400 bg-white/[0.02] hover:bg-white/[0.04] rounded transition-colors flex items-center justify-center gap-1"><CheckCircle className="w-4 h-4" /> Confirm</button>}
                    {b.status === 'Pending' && <button onClick={() => update(b.id, 'Cancelled')} className="py-2.5 px-3 text-[12px] text-red-500/60 hover:text-red-400 bg-white/[0.02] hover:bg-white/[0.04] rounded transition-colors"><XCircle className="w-4 h-4" /></button>}
                    {b.status === 'Confirmed' && <button onClick={() => update(b.id, 'Checked Out')} className="flex-1 py-2.5 text-[12px] text-blue-500/70 hover:text-blue-400 bg-white/[0.02] hover:bg-white/[0.04] rounded transition-colors flex items-center justify-center gap-1"><LogOut className="w-4 h-4" /> Check Out</button>}
                    {b.status === 'Confirmed' && <button onClick={() => update(b.id, 'Cancelled')} className="py-2.5 px-3 text-[12px] text-red-500/60 hover:text-red-400 bg-white/[0.02] hover:bg-white/[0.04] rounded transition-colors"><XCircle className="w-4 h-4" /></button>}
                    {(b.status === 'Checked Out' || b.status === 'Cancelled') && <button onClick={() => del(b.id)} className="flex-1 py-2.5 text-[12px] text-slate-600 hover:text-red-400 bg-white/[0.02] hover:bg-white/[0.04] rounded transition-colors flex items-center justify-center gap-1"><Trash2 className="w-4 h-4" /> Delete</button>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {detail && (
        <Modal title={`Booking ${detail.id}`} onClose={() => setDetail(null)}>
          <div className="space-y-4">
            {(() => { const g = getGuest(detail.guestId); const r = getRoom(detail.roomId); return (<>
              <div>
                <h4 className="text-[12px] font-semibold text-slate-500 uppercase tracking-[1.5px] mb-2">Guest</h4>
                <div className="grid grid-cols-2 gap-2 text-[13px]">
                  <div><p className="text-slate-600">Name</p><p className="text-white">{g?.name || 'Unknown'}</p></div>
                  <div><p className="text-slate-600">Phone</p><p className="text-white">{g?.phone || 'N/A'}</p></div>
                  <div><p className="text-slate-600">Email</p><p className="text-white">{g?.email || 'N/A'}</p></div>
                  <div><p className="text-slate-600">City</p><p className="text-white">{g?.city || 'N/A'}</p></div>
                </div>
              </div>
              <div>
                <h4 className="text-[12px] font-semibold text-slate-500 uppercase tracking-[1.5px] mb-2">Details</h4>
                <div className="grid grid-cols-2 gap-2 text-[13px]">
                  <div><p className="text-slate-600">Room</p><p className="text-white">{r?.name || detail.roomId}</p></div>
                  <div><p className="text-slate-600">Source</p><p className="text-white">{detail.source}</p></div>
                  <div><p className="text-slate-600">Check-in</p><p className="text-white">{formatDate(detail.checkIn)}</p></div>
                  <div><p className="text-slate-600">Check-out</p><p className="text-white">{formatDate(detail.checkOut)}</p></div>
                  <div><p className="text-slate-600">Total</p><p className="text-base font-medium text-white">{formatCurrency(detail.total)}</p></div>
                  <div><p className="text-slate-600">Payment</p><p className={`font-medium ${detail.paymentStatus === 'Paid' ? 'text-emerald-400' : 'text-amber-400'}`}>{detail.paymentStatus}</p></div>
                </div>
              </div>
              {detail.specialRequests && <div className="text-[13px] text-slate-500 bg-dark-700/50 rounded p-3 border border-white/[0.02]"><p className="text-slate-600 text-[12px] font-semibold uppercase tracking-[1.5px] mb-1">Special Requests</p>{detail.specialRequests}</div>}
              <div className="flex gap-2 pt-1">
                <button onClick={() => printInvoice(detail)} className="px-3 py-2 bg-dark-700 hover:bg-dark-600 text-slate-400 text-[12px] font-medium rounded transition-colors flex items-center gap-1.5"><Printer className="w-4 h-4" /> Print</button>
                <button onClick={() => sendWhatsApp(detail, 'confirm')} className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[12px] font-medium rounded transition-colors flex items-center gap-1.5"><MessageCircle className="w-4 h-4" /> WhatsApp</button>
                {detail.status === 'Pending' && <button onClick={() => { update(detail.id, 'Confirmed'); setDetail(null); }} className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[12px] font-medium rounded transition-colors">Confirm</button>}
                {detail.status === 'Confirmed' && <button onClick={() => { update(detail.id, 'Checked Out'); setDetail(null); }} className="flex-1 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[12px] font-medium rounded transition-colors">Check Out</button>}
              </div>
            </>); })()}
          </div>
        </Modal>
      )}

      {confirmId && (
        <ConfirmDialog
          title="Delete Booking"
          message="This will permanently delete this booking record."
          onConfirm={() => { updateBookings(prev => prev.filter(b => b.id !== confirmId)); toast('Deleted', 'info'); setConfirmId(null); }}
          onCancel={() => setConfirmId(null)}
        />
      )}

      {modal && (
        <Modal title="New Booking" onClose={() => setModal(null)}>
          <form onSubmit={saveBooking} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Room</label>
              <select required value={form.roomId || ''} onChange={e => setForm({ ...form, roomId: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10">
                <option value="">Select...</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name} — {formatCurrency(r.price)}/night</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-[12px] font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Check-in</label><input required type="date" min={today()} value={form.checkIn || ''} onChange={e => setForm({ ...form, checkIn: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10" /></div>
              <div><label className="block text-[12px] font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Check-out</label><input required type="date" min={form.checkIn ? form.checkIn : ''} value={form.checkOut || ''} onChange={e => setForm({ ...form, checkOut: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-[12px] font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Adults</label><select value={form.adults || 2} onChange={e => setForm({ ...form, adults: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></div>
              <div><label className="block text-[12px] font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Children</label><select value={form.children || 0} onChange={e => setForm({ ...form, children: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10"><option>0</option><option>1</option><option>2</option><option>3</option></select></div>
            </div>
            <div className="border-t border-white/[0.02] pt-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-[1.5px]">Guest</label>
                <button type="button" onClick={() => setForm({ ...form, newGuest: !form.newGuest, guestId: '' })} className="text-[12px] text-amber-400/60 hover:text-amber-400">{form.newGuest ? 'Existing' : '+ New'}</button>
              </div>
              {form.newGuest ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input required placeholder="Name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="px-3 py-2 bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10" />
                    <input required placeholder="Phone" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} className="px-3 py-2 bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="email" placeholder="Email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} className="px-3 py-2 bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10" />
                    <input placeholder="City" value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} className="px-3 py-2 bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10" />
                  </div>
                </div>
              ) : (
                <select required value={form.guestId || ''} onChange={e => setForm({ ...form, guestId: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10">
                  <option value="">Select...</option>
                  {guests.map(g => <option key={g.id} value={g.id}>{g.name} — {g.phone}</option>)}
                </select>
              )}
            </div>
            <div><label className="block text-[12px] font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Source</label><select value={form.source || 'Direct'} onChange={e => setForm({ ...form, source: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10"><option>Direct</option><option>Phone</option><option>Website</option><option>Booking.com</option><option>Walk-in</option></select></div>
            <div><label className="block text-[12px] font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Special Requests</label><textarea rows={2} value={form.specialRequests || ''} onChange={e => setForm({ ...form, specialRequests: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 resize-none" /></div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[12px] font-medium rounded transition-colors">Create Booking</button>
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 bg-dark-700 text-slate-400 text-[12px] rounded transition-colors">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {printBooking && <PrintInvoice booking={printBooking} guest={printGuest} room={printRoom} resort={resort} onClose={() => setPrintBooking(null)} />}
    </div>
  );
}
