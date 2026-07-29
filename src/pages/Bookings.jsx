import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { formatCurrency, formatDate, statusColor } from '../data/utils';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
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

  const printInvoice = (booking) => {
    const g = getGuest(booking.guestId);
    const r = getRoom(booking.roomId);
    const taxAmount = Math.round(booking.total * (resort.taxRate / (100 + resort.taxRate)));
    const subtotal = booking.total - taxAmount;
    const initials = resort.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Booking ${booking.id}</title><style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:system-ui,-apple-system,sans-serif;padding:40px;color:#1a1a2e;line-height:1.5}
      .header{text-align:center;margin-bottom:24px;border-bottom:2px solid #c9995a;padding-bottom:16px}
      .header .logo{display:inline-block;width:40px;height:40px;background:#c9995a;border-radius:6px;text-align:center;line-height:40px;color:#fff;font-size:14px;font-weight:600;margin-bottom:6px}
      .header h1{font-size:16px;color:#1a1a2e;font-weight:600;margin-bottom:2px}
      .header p{font-size:11px;color:#888}
      .section{margin-bottom:16px}
      .section h3{font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#999;margin-bottom:8px;border-bottom:1px solid #eee;padding-bottom:4px}
      .row{display:flex;justify-content:space-between;padding:3px 0;font-size:12px}
      .row .label{color:#888}
      .row .value{font-weight:500;color:#1a1a2e}
      .total-row{font-size:14px;text-align:right;margin-top:12px;padding-top:10px;border-top:2px solid #c9995a;color:#c9995a;font-weight:600}
      .footer{text-align:center;margin-top:24px;font-size:10px;color:#aaa;border-top:1px solid #eee;padding-top:12px}
      @media print{body{padding:20px}}
    </style></head><body>
      <div class="header">
        <div class="logo">${initials}</div>
        <h1>${resort.name}</h1>
        <p>${resort.address}</p>
        <p>${resort.phone} · ${resort.email}</p>
      </div>
      <div class="section">
        <h3>Booking</h3>
        <div class="row"><span class="label">ID</span><span class="value">${booking.id}</span></div>
        <div class="row"><span class="label">Status</span><span class="value">${booking.status}</span></div>
        <div class="row"><span class="label">Source</span><span class="value">${booking.source}</span></div>
      </div>
      <div class="section">
        <h3>Guest</h3>
        <div class="row"><span class="label">Name</span><span class="value">${g?.name || 'N/A'}</span></div>
        <div class="row"><span class="label">Phone</span><span class="value">${g?.phone || 'N/A'}</span></div>
        <div class="row"><span class="label">Email</span><span class="value">${g?.email || 'N/A'}</span></div>
      </div>
      <div class="section">
        <h3>Stay</h3>
        <div class="row"><span class="label">Room</span><span class="value">${r?.name || booking.roomId}</span></div>
        <div class="row"><span class="label">Check-in</span><span class="value">${formatDate(booking.checkIn)} at ${resort.checkInTime}</span></div>
        <div class="row"><span class="label">Check-out</span><span class="value">${formatDate(booking.checkOut)} at ${resort.checkOutTime}</span></div>
        <div class="row"><span class="label">Nights</span><span class="value">${booking.nights}</span></div>
        <div class="row"><span class="label">Guests</span><span class="value">${booking.adults}A${booking.children ? ', ' + booking.children + 'C' : ''}</span></div>
      </div>
      <div class="section">
        <h3>Billing</h3>
        <div class="row"><span class="label">Room charges</span><span class="value">${formatCurrency(subtotal)}</span></div>
        <div class="row"><span class="label">Tax (${resort.taxRate}%)</span><span class="value">${formatCurrency(taxAmount)}</span></div>
        <div class="total-row">Total: ${formatCurrency(booking.total)}</div>
        <div class="row" style="margin-top:6px"><span class="label">Payment</span><span class="value">${booking.paymentStatus} (${booking.paymentMethod})</span></div>
      </div>
      ${booking.specialRequests ? '<div class="section"><h3>Special Requests</h3><p style="font-size:12px;color:#555">' + booking.specialRequests + '</p></div>' : ''}
      <div class="footer">
        <p>${resort.name} · Generated ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>
    </body></html>`);
    w.document.close();
    w.print();
  };

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
        <div className="flex gap-1">
          {['all', 'Confirmed', 'Pending', 'Checked Out', 'Cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded text-[12px] font-medium transition-colors ${filter === s ? 'text-white' : 'text-slate-600 hover:text-slate-400'}`}>
              {s === 'all' ? `All (${stats.total})` : `${s} (${stats[s]})`}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-8 pr-3 py-1.5 bg-dark-800/50 border border-white/[0.02] rounded text-sm text-white w-48 focus:outline-none focus:border-white/10 placeholder-slate-600" />
          </div>
          <button onClick={openAdd} className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[12px] font-medium rounded transition-colors flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>
      </div>

      <div className="bg-dark-800/50 rounded-lg border border-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.02]">
                {['ID', 'Guest', 'Room', 'Dates', 'Amount', 'Status', ''].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[10px] font-semibold text-slate-600 uppercase tracking-[1.5px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-sm text-slate-600">No bookings</td></tr>
              ) : filtered.map(b => {
                const g = getGuest(b.guestId);
                const r = getRoom(b.roomId);
                return (
                  <tr key={b.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-3 px-4 text-[12px] font-mono text-slate-600">{b.id}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/15 to-amber-600/5 flex items-center justify-center text-amber-400/70 text-[10px] font-medium flex-shrink-0">{g?.name.charAt(0) || '?'}</div>
                        <span className="text-sm text-white">{g?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-500">{r?.name || b.roomId}</td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-slate-300">{formatDate(b.checkIn)}</p>
                      <p className="text-[11px] text-slate-600">{b.nights}N · {b.adults}A{b.children ? `, ${b.children}C` : ''}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-white font-medium">{formatCurrency(b.total)}</p>
                      <p className={`text-[11px] ${b.paymentStatus === 'Paid' ? 'text-emerald-500/70' : b.paymentStatus === 'Refunded' ? 'text-red-500/70' : 'text-amber-500/70'}`}>{b.paymentStatus}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${statusColor(b.status)}`}>{b.status}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <button onClick={() => setDetail(b)} className="p-1 text-slate-600 hover:text-amber-400 transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => sendWhatsApp(b, 'confirm')} className="p-1 text-slate-600 hover:text-emerald-400 transition-colors"><MessageCircle className="w-3.5 h-3.5" /></button>
                        {b.status === 'Pending' && <><button onClick={() => update(b.id, 'Confirmed')} className="p-1 text-emerald-500/60 hover:text-emerald-400 transition-colors"><CheckCircle className="w-3.5 h-3.5" /></button><button onClick={() => update(b.id, 'Cancelled')} className="p-1 text-red-500/60 hover:text-red-400 transition-colors"><XCircle className="w-3.5 h-3.5" /></button></>}
                        {b.status === 'Confirmed' && <><button onClick={() => update(b.id, 'Checked Out')} className="p-1 text-blue-500/60 hover:text-blue-400 transition-colors"><LogOut className="w-3.5 h-3.5" /></button><button onClick={() => update(b.id, 'Cancelled')} className="p-1 text-red-500/60 hover:text-red-400 transition-colors"><XCircle className="w-3.5 h-3.5" /></button></>}
                        {(b.status === 'Checked Out' || b.status === 'Cancelled') && <button onClick={() => del(b.id)} className="p-1 text-slate-600 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {detail && (
        <Modal title={`Booking ${detail.id}`} onClose={() => setDetail(null)}>
          <div className="space-y-4">
            {(() => { const g = getGuest(detail.guestId); const r = getRoom(detail.roomId); return (<>
              <div>
                <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-[1.5px] mb-2">Guest</h4>
                <div className="grid grid-cols-2 gap-2 text-[13px]">
                  <div><p className="text-slate-600">Name</p><p className="text-white">{g?.name || 'Unknown'}</p></div>
                  <div><p className="text-slate-600">Phone</p><p className="text-white">{g?.phone || 'N/A'}</p></div>
                  <div><p className="text-slate-600">Email</p><p className="text-white">{g?.email || 'N/A'}</p></div>
                  <div><p className="text-slate-600">City</p><p className="text-white">{g?.city || 'N/A'}</p></div>
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-[1.5px] mb-2">Details</h4>
                <div className="grid grid-cols-2 gap-2 text-[13px]">
                  <div><p className="text-slate-600">Room</p><p className="text-white">{r?.name || detail.roomId}</p></div>
                  <div><p className="text-slate-600">Source</p><p className="text-white">{detail.source}</p></div>
                  <div><p className="text-slate-600">Check-in</p><p className="text-white">{formatDate(detail.checkIn)}</p></div>
                  <div><p className="text-slate-600">Check-out</p><p className="text-white">{formatDate(detail.checkOut)}</p></div>
                  <div><p className="text-slate-600">Total</p><p className="text-base font-medium text-white">{formatCurrency(detail.total)}</p></div>
                  <div><p className="text-slate-600">Payment</p><p className={`font-medium ${detail.paymentStatus === 'Paid' ? 'text-emerald-400' : 'text-amber-400'}`}>{detail.paymentStatus}</p></div>
                </div>
              </div>
              {detail.specialRequests && <div className="text-[13px] text-slate-500 bg-dark-700/50 rounded p-3 border border-white/[0.02]"><p className="text-slate-600 text-[10px] font-semibold uppercase tracking-[1.5px] mb-1">Special Requests</p>{detail.specialRequests}</div>}
              <div className="flex gap-2 pt-1">
                <button onClick={() => printInvoice(detail)} className="px-3 py-2 bg-dark-700 hover:bg-dark-600 text-slate-400 text-[12px] font-medium rounded transition-colors flex items-center gap-1.5"><Printer className="w-3.5 h-3.5" /> Print</button>
                <button onClick={() => sendWhatsApp(detail, 'confirm')} className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[12px] font-medium rounded transition-colors flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</button>
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
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Room</label>
              <select required value={form.roomId || ''} onChange={e => setForm({ ...form, roomId: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10">
                <option value="">Select...</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name} — {formatCurrency(r.price)}/night</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Check-in</label><input required type="date" value={form.checkIn || ''} onChange={e => setForm({ ...form, checkIn: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10" /></div>
              <div><label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Check-out</label><input required type="date" value={form.checkOut || ''} onChange={e => setForm({ ...form, checkOut: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Adults</label><select value={form.adults || 2} onChange={e => setForm({ ...form, adults: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></div>
              <div><label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Children</label><select value={form.children || 0} onChange={e => setForm({ ...form, children: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10"><option>0</option><option>1</option><option>2</option><option>3</option></select></div>
            </div>
            <div className="border-t border-white/[0.02] pt-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-[1.5px]">Guest</label>
                <button type="button" onClick={() => setForm({ ...form, newGuest: !form.newGuest, guestId: '' })} className="text-[11px] text-amber-400/60 hover:text-amber-400">{form.newGuest ? 'Existing' : '+ New'}</button>
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
            <div><label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Source</label><select value={form.source || 'Direct'} onChange={e => setForm({ ...form, source: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10"><option>Direct</option><option>Phone</option><option>Website</option><option>Booking.com</option><option>Walk-in</option></select></div>
            <div><label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Special Requests</label><textarea rows={2} value={form.specialRequests || ''} onChange={e => setForm({ ...form, specialRequests: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 resize-none" /></div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[12px] font-medium rounded transition-colors">Create Booking</button>
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 bg-dark-700 text-slate-400 text-[12px] rounded transition-colors">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
