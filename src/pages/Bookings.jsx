import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { formatCurrency, formatDate, statusColor } from '../data/utils';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import { Search, Eye, CheckCircle, XCircle, LogOut, Trash2 } from 'lucide-react';

export default function Bookings() {
  const { bookings, updateBookings, getGuest, getRoom } = useStore();
  const toast = useToast();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);

  let filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(b => { const g = getGuest(b.guestId); return (g && g.name.toLowerCase().includes(q)) || b.id.toLowerCase().includes(q); });
  }

  const update = (id, status) => {
    updateBookings(prev => prev.map(b => b.id === id ? { ...b, status, ...(status === 'Checked Out' ? { paymentStatus: 'Paid' } : {}) } : b));
    toast(`Booking ${status.toLowerCase()}`, status === 'Cancelled' ? 'warning' : 'success');
  };

  const del = (id) => { if (confirm('Delete?')) { updateBookings(prev => prev.filter(b => b.id !== id)); toast('Deleted', 'info'); } };

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
                {detail.status === 'Pending' && <button onClick={() => { update(detail.id, 'Confirmed'); setDetail(null); }} className="flex-1 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-semibold rounded-xl transition">Confirm</button>}
                {detail.status === 'Confirmed' && <button onClick={() => { update(detail.id, 'Checked Out'); setDetail(null); }} className="flex-1 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-semibold rounded-xl transition">Check Out</button>}
              </div>
            </>); })()}
          </div>
        </Modal>
      )}
    </div>
  );
}
