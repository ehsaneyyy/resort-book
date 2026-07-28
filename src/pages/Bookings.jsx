import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { formatCurrency, formatDate, statusColor } from '../data/utils';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { Search, Eye, CheckCircle, XCircle, LogOut, Trash2, Printer, Plus } from 'lucide-react';

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

  const printInvoice = (booking) => {
    const g = getGuest(booking.guestId);
    const r = getRoom(booking.roomId);
    const taxAmount = Math.round(booking.total * (resort.taxRate / (100 + resort.taxRate)));
    const subtotal = booking.total - taxAmount;
    const initials = resort.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Booking ${booking.id}</title><style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:system-ui,-apple-system,sans-serif;padding:40px;color:#1a1a2e;line-height:1.6}
      .header{text-align:center;margin-bottom:30px;border-bottom:2px solid #c9995a;padding-bottom:20px}
      .header .logo{display:inline-block;width:48px;height:48px;background:linear-gradient(135deg,#c9995a,#b8863e);border-radius:10px;text-align:center;line-height:48px;color:#fff;font-size:18px;font-weight:bold;margin-bottom:8px}
      .header h1{font-size:20px;color:#c9995a;margin-bottom:2px}
      .header h2{font-size:14px;color:#333;font-weight:500;margin-bottom:4px}
      .header p{font-size:11px;color:#888}
      .section{margin-bottom:20px}
      .section h3{font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#999;margin-bottom:10px;border-bottom:1px solid #eee;padding-bottom:6px}
      .row{display:flex;justify-content:space-between;padding:4px 0;font-size:13px}
      .row .label{color:#888}
      .row .value{font-weight:600;color:#1a1a2e}
      .total-row{font-size:16px;text-align:right;margin-top:16px;padding-top:12px;border-top:2px solid #c9995a}
      .total-row .label{color:#c9995a;font-weight:700}
      .total-row .value{color:#c9995a;font-weight:700}
      .status-badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;border:1px solid}
      .status-confirmed{background:#d1fae5;color:#065f46;border-color:#a7f3d0}
      .status-pending{background:#fef3c7;color:#92400e;border-color:#fde68a}
      .status-checkedout{background:#dbeafe;color:#1e40af;border-color:#bfdbfe}
      .footer{text-align:center;margin-top:30px;font-size:10px;color:#aaa;border-top:1px solid #eee;padding-top:16px}
      @media print{body{padding:20px}}
    </style></head><body>
      <div class="header">
        <div class="logo">${initials}</div>
        <h1>${resort.name}</h1>
        <h2>Booking Confirmation</h2>
        <p>${resort.address}</p>
        <p>${resort.phone} &middot; ${resort.email}</p>
      </div>
      <div class="section">
        <h3>Booking Details</h3>
        <div class="row"><span class="label">Booking ID</span><span class="value" style="color:#c9995a">${booking.id}</span></div>
        <div class="row"><span class="label">Status</span><span class="value"><span class="status-badge status-${booking.status.toLowerCase().replace(' ', '')}">${booking.status}</span></span></div>
        <div class="row"><span class="label">Source</span><span class="value">${booking.source}</span></div>
        <div class="row"><span class="label">Created</span><span class="value">${formatDate(booking.createdAt)}</span></div>
      </div>
      <div class="section">
        <h3>Guest Information</h3>
        <div class="row"><span class="label">Name</span><span class="value">${g?.name || 'N/A'}</span></div>
        <div class="row"><span class="label">Phone</span><span class="value">${g?.phone || 'N/A'}</span></div>
        <div class="row"><span class="label">Email</span><span class="value">${g?.email || 'N/A'}</span></div>
        <div class="row"><span class="label">City</span><span class="value">${g?.city || 'N/A'}</span></div>
      </div>
      <div class="section">
        <h3>Stay Details</h3>
        <div class="row"><span class="label">Room</span><span class="value">${r?.name || booking.roomId}</span></div>
        <div class="row"><span class="label">Check-in</span><span class="value">${formatDate(booking.checkIn)} at ${resort.checkInTime}</span></div>
        <div class="row"><span class="label">Check-out</span><span class="value">${formatDate(booking.checkOut)} at ${resort.checkOutTime}</span></div>
        <div class="row"><span class="label">Duration</span><span class="value">${booking.nights} night${booking.nights > 1 ? 's' : ''}</span></div>
        <div class="row"><span class="label">Guests</span><span class="value">${booking.adults} Adult${booking.adults > 1 ? 's' : ''}${booking.children ? ', ' + booking.children + ' Child' + (booking.children > 1 ? 'ren' : '') : ''}</span></div>
      </div>
      <div class="section">
        <h3>Billing</h3>
        <div class="row"><span class="label">Room Charges</span><span class="value">${formatCurrency(subtotal)}</span></div>
        <div class="row"><span class="label">Tax (${resort.taxRate}%)</span><span class="value">${formatCurrency(taxAmount)}</span></div>
        <div class="total-row"><span class="label">Total</span> <span class="value">${formatCurrency(booking.total)}</span></div>
        <div class="row" style="margin-top:8px"><span class="label">Payment</span><span class="value">${booking.paymentStatus} (${booking.paymentMethod})</span></div>
      </div>
      ${booking.specialRequests ? '<div class="section"><h3>Special Requests</h3><p style="font-size:13px;color:#555">' + booking.specialRequests + '</p></div>' : ''}
      <div class="footer">
        <p>Thank you for choosing ${resort.name}!</p>
        <p style="margin-top:4px">Generated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 flex-1">
          {[{ l: 'Total', k: 'all', c: 'text-white' }, { l: 'Confirmed', k: 'Confirmed', c: 'text-emerald-400' }, { l: 'Pending', k: 'Pending', c: 'text-yellow-400' }, { l: 'Checked Out', k: 'Checked Out', c: 'text-blue-400' }, { l: 'Cancelled', k: 'Cancelled', c: 'text-red-400' }].map(s => (
            <button key={s.k} onClick={() => setFilter(s.k)} className={`p-3 rounded-xl text-center transition border ${filter === s.k ? 'bg-white/10 border-white/10' : 'border-transparent hover:bg-white/5'}`}>
              <p className={`text-2xl font-bold ${s.c}`}>{s.k === 'all' ? stats.total : stats[s.k]}</p>
              <p className="text-xs text-slate-500">{s.l}</p>
            </button>
          ))}
        </div>
        <button onClick={openAdd} className="px-5 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-brand-500/25 flex items-center gap-2 flex-shrink-0">
          <Plus className="w-4 h-4" /> New Booking
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or ID..." className="w-full pl-10 pr-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-slate-500" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="all">All Status</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Pending">Pending</option>
          <option value="Checked Out">Checked Out</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-dark-800/50 rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Booking', 'Guest', 'Room', 'Dates', 'Amount', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 lg:px-5 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-slate-500">No bookings found</td></tr>
              ) : filtered.map(b => {
                const g = getGuest(b.guestId);
                const r = getRoom(b.roomId);
                return (
                  <tr key={b.id} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                    <td className="py-3 px-4 lg:px-5 text-sm font-mono text-brand-400">{b.id}</td>
                    <td className="py-3 px-4 lg:px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-500/20 rounded-lg flex items-center justify-center text-brand-400 text-xs font-bold">{g?.name.charAt(0) || '?'}</div>
                        <div><p className="text-sm text-white font-medium">{g?.name || 'Unknown'}</p><p className="text-[10px] text-slate-500">{g?.phone || ''}</p></div>
                      </div>
                    </td>
                    <td className="py-3 px-4 lg:px-5 text-sm text-slate-300">{r?.name || b.roomId}</td>
                    <td className="py-3 px-4 lg:px-5"><p className="text-sm text-slate-300">{formatDate(b.checkIn)}</p><p className="text-[10px] text-slate-500">{b.nights}N &middot; {b.adults}A{b.children ? `, ${b.children}C` : ''}</p></td>
                    <td className="py-3 px-4 lg:px-5"><p className="text-sm font-medium text-amber-400">{formatCurrency(b.total)}</p><p className={`text-[10px] ${b.paymentStatus === 'Paid' ? 'text-emerald-400' : b.paymentStatus === 'Refunded' ? 'text-red-400' : 'text-yellow-400'}`}>{b.paymentStatus}</p></td>
                    <td className="py-3 px-4 lg:px-5"><span className={`px-2 py-1 text-[10px] rounded-full font-medium border ${statusColor(b.status)}`}>{b.status}</span></td>
                    <td className="py-3 px-4 lg:px-5">
                      <div className="flex gap-1.5">
                        <button onClick={() => setDetail(b)} className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition"><Eye className="w-3.5 h-3.5" /></button>
                        {b.status === 'Pending' && <><button onClick={() => update(b.id, 'Confirmed')} className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition"><CheckCircle className="w-3.5 h-3.5" /></button><button onClick={() => update(b.id, 'Cancelled')} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition"><XCircle className="w-3.5 h-3.5" /></button></>}
                        {b.status === 'Confirmed' && <><button onClick={() => update(b.id, 'Checked Out')} className="p-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition"><LogOut className="w-3.5 h-3.5" /></button><button onClick={() => update(b.id, 'Cancelled')} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition"><XCircle className="w-3.5 h-3.5" /></button></>}
                        {b.status === 'Checked Out' && <button onClick={() => del(b.id)} className="p-1.5 bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 rounded-lg transition"><Trash2 className="w-3.5 h-3.5" /></button>}
                        {b.status === 'Cancelled' && <button onClick={() => del(b.id)} className="p-1.5 bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 rounded-lg transition"><Trash2 className="w-3.5 h-3.5" /></button>}
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
              <div className="bg-dark-700/50 rounded-xl p-4 border border-white/5">
                <h4 className="text-sm font-medium text-slate-400 mb-3">Guest</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-slate-500">Name</p><p className="text-white">{g?.name || 'Unknown'}</p></div>
                  <div><p className="text-slate-500">Phone</p><p className="text-white">{g?.phone || 'N/A'}</p></div>
                  <div><p className="text-slate-500">Email</p><p className="text-white">{g?.email || 'N/A'}</p></div>
                  <div><p className="text-slate-500">City</p><p className="text-white">{g?.city || 'N/A'}</p></div>
                </div>
              </div>
              <div className="bg-dark-700/50 rounded-xl p-4 border border-white/5">
                <h4 className="text-sm font-medium text-slate-400 mb-3">Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-slate-500">Room</p><p className="text-white">{r?.name || detail.roomId}</p></div>
                  <div><p className="text-slate-500">Source</p><p className="text-white">{detail.source}</p></div>
                  <div><p className="text-slate-500">Check-in</p><p className="text-white">{formatDate(detail.checkIn)}</p></div>
                  <div><p className="text-slate-500">Check-out</p><p className="text-white">{formatDate(detail.checkOut)}</p></div>
                  <div><p className="text-slate-500">Total</p><p className="text-xl font-bold text-amber-400">{formatCurrency(detail.total)}</p></div>
                  <div><p className="text-slate-500">Payment</p><p className={`font-medium ${detail.paymentStatus === 'Paid' ? 'text-emerald-400' : 'text-yellow-400'}`}>{detail.paymentStatus}</p></div>
                </div>
              </div>
              {detail.specialRequests && <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4"><h4 className="text-sm font-medium text-blue-400 mb-1">Special Requests</h4><p className="text-sm text-slate-300">{detail.specialRequests}</p></div>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => printInvoice(detail)} className="px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-medium rounded-xl transition text-sm flex items-center gap-2"><Printer className="w-4 h-4" /> Print</button>
                {detail.status === 'Pending' && <button onClick={() => { update(detail.id, 'Confirmed'); setDetail(null); }} className="flex-1 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-semibold rounded-xl transition">Confirm</button>}
                {detail.status === 'Confirmed' && <button onClick={() => { update(detail.id, 'Checked Out'); setDetail(null); }} className="flex-1 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-semibold rounded-xl transition">Check Out</button>}
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
              <label className="block text-sm text-slate-300 mb-1">Room *</label>
              <select required value={form.roomId || ''} onChange={e => setForm({ ...form, roomId: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">Select room...</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name} — {formatCurrency(r.price)}/night</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-slate-300 mb-1">Check-in *</label><input required type="date" value={form.checkIn || ''} onChange={e => setForm({ ...form, checkIn: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
              <div><label className="block text-sm text-slate-300 mb-1">Check-out *</label><input required type="date" value={form.checkOut || ''} onChange={e => setForm({ ...form, checkOut: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-slate-300 mb-1">Adults</label><select value={form.adults || 2} onChange={e => setForm({ ...form, adults: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></div>
              <div><label className="block text-sm text-slate-300 mb-1">Children</label><select value={form.children || 0} onChange={e => setForm({ ...form, children: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"><option>0</option><option>1</option><option>2</option><option>3</option></select></div>
            </div>
            <div className="border-t border-white/5 pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm text-slate-300">Guest *</label>
                <button type="button" onClick={() => setForm({ ...form, newGuest: !form.newGuest, guestId: '' })} className="text-xs text-brand-400 hover:text-brand-300">{form.newGuest ? 'Select existing' : '+ New guest'}</button>
              </div>
              {form.newGuest ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input required placeholder="Name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    <input required placeholder="Phone" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} className="px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="email" placeholder="Email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} className="px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    <input placeholder="City" value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} className="px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                </div>
              ) : (
                <select required value={form.guestId || ''} onChange={e => setForm({ ...form, guestId: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="">Select guest...</option>
                  {guests.map(g => <option key={g.id} value={g.id}>{g.name} — {g.phone}</option>)}
                </select>
              )}
            </div>
            <div><label className="block text-sm text-slate-300 mb-1">Source</label><select value={form.source || 'Direct'} onChange={e => setForm({ ...form, source: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"><option>Direct</option><option>Phone</option><option>Website</option><option>Booking.com</option><option>Walk-in</option></select></div>
            <div><label className="block text-sm text-slate-300 mb-1">Special Requests</label><textarea rows={2} value={form.specialRequests || ''} onChange={e => setForm({ ...form, specialRequests: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" placeholder="Late check-in, extra towels..." /></div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold rounded-xl transition">Create Booking</button>
              <button type="button" onClick={() => setModal(null)} className="px-6 py-3 bg-white/5 text-slate-300 rounded-xl transition">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
