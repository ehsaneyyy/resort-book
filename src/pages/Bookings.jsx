import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { formatCurrency, formatDate, statusColor } from '../data/utils';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { Search, Eye, CheckCircle, XCircle, LogOut, Trash2, Printer } from 'lucide-react';

export default function Bookings() {
  const { bookings, updateBookings, getGuest, getRoom } = useStore();
  const toast = useToast();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

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
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Booking ${booking.id}</title><style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:system-ui,-apple-system,sans-serif;padding:40px;color:#1a1a2e;line-height:1.6}
      .header{text-align:center;margin-bottom:30px;border-bottom:2px solid #c9995a;padding-bottom:20px}
      .header h1{font-size:22px;color:#c9995a;margin-bottom:4px}
      .header p{font-size:12px;color:#666}
      .section{margin-bottom:20px}
      .section h3{font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:8px;border-bottom:1px solid #eee;padding-bottom:4px}
      .row{display:flex;justify-content:space-between;padding:4px 0;font-size:14px}
      .row .label{color:#666}
      .row .value{font-weight:600}
      .total{font-size:20px;text-align:right;margin-top:20px;padding-top:16px;border-top:2px solid #c9995a;color:#c9995a}
      .footer{text-align:center;margin-top:30px;font-size:11px;color:#999}
      @media print{body{padding:20px}}
    </style></head><body>
      <div class="header"><h1>Booking Receipt</h1><p>Booking ID: ${booking.id}</p></div>
      <div class="section"><h3>Guest Information</h3>
        <div class="row"><span class="label">Name</span><span class="value">${g?.name || 'N/A'}</span></div>
        <div class="row"><span class="label">Phone</span><span class="value">${g?.phone || 'N/A'}</span></div>
        <div class="row"><span class="label">Email</span><span class="value">${g?.email || 'N/A'}</span></div>
        <div class="row"><span class="label">City</span><span class="value">${g?.city || 'N/A'}</span></div>
      </div>
      <div class="section"><h3>Booking Details</h3>
        <div class="row"><span class="label">Room</span><span class="value">${r?.name || booking.roomId}</span></div>
        <div class="row"><span class="label">Check-in</span><span class="value">${formatDate(booking.checkIn)}</span></div>
        <div class="row"><span class="label">Check-out</span><span class="value">${formatDate(booking.checkOut)}</span></div>
        <div class="row"><span class="label">Nights</span><span class="value">${booking.nights}</span></div>
        <div class="row"><span class="label">Guests</span><span class="value">${booking.adults} Adults${booking.children ? ', ' + booking.children + ' Children' : ''}</span></div>
        <div class="row"><span class="label">Source</span><span class="value">${booking.source}</span></div>
        <div class="row"><span class="label">Status</span><span class="value">${booking.status}</span></div>
        <div class="row"><span class="label">Payment</span><span class="value">${booking.paymentStatus}</span></div>
      </div>
      <div class="total">Total: ${formatCurrency(booking.total)}</div>
      ${booking.specialRequests ? '<div class="section"><h3>Special Requests</h3><p style="font-size:14px">' + booking.specialRequests + '</p></div>' : ''}
      <div class="footer"><p>Thank you for your booking.</p><p>Generated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
    </body></html>`);
    w.document.close();
    w.print();
  };

  const stats = { total: bookings.length, Confirmed: bookings.filter(b => b.status === 'Confirmed').length, Pending: bookings.filter(b => b.status === 'Pending').length, Cancelled: bookings.filter(b => b.status === 'Cancelled').length, 'Checked Out': bookings.filter(b => b.status === 'Checked Out').length };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[{ l: 'Total', k: 'all', c: 'text-white' }, { l: 'Confirmed', k: 'Confirmed', c: 'text-emerald-400' }, { l: 'Pending', k: 'Pending', c: 'text-yellow-400' }, { l: 'Checked Out', k: 'Checked Out', c: 'text-blue-400' }, { l: 'Cancelled', k: 'Cancelled', c: 'text-red-400' }].map(s => (
          <button key={s.k} onClick={() => setFilter(s.k)} className={`p-3 rounded-xl text-center transition border ${filter === s.k ? 'bg-white/10 border-white/10' : 'border-transparent hover:bg-white/5'}`}>
            <p className={`text-2xl font-bold ${s.c}`}>{s.k === 'all' ? stats.total : stats[s.k]}</p>
            <p className="text-xs text-slate-500">{s.l}</p>
          </button>
        ))}
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
    </div>
  );
}
