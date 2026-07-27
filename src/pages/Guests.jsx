import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { formatDate, statusColor } from '../data/utils';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import { Search, Eye, Star, UserPlus } from 'lucide-react';

export default function Guests() {
  const { guests, bookings, getRoom } = useStore();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const filtered = search
    ? guests.filter(g => g.name.toLowerCase().includes(search.toLowerCase()) || g.email.toLowerCase().includes(search.toLowerCase()) || g.phone.includes(search))
    : guests;

  const getGuestBookings = (guestId) => bookings.filter(b => b.guestId === guestId);

  const openAdd = () => {
    setForm({ name: '', email: '', phone: '', city: '', idType: 'Aadhaar', idNumber: '', vip: false, notes: '' });
    setModal('add');
  };

  const save = (e) => {
    e.preventDefault();
    const newGuest = {
      ...form,
      id: 'GT' + String(guests.length + 1).padStart(3, '0'),
      totalBookings: 0,
      totalSpent: 0,
      lastStay: null,
      createdAt: new Date().toISOString(),
    };
    useStore.setState(prev => ({ guests: [...prev.guests, newGuest] }));
    toast('Guest added', 'success');
    setModal(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-slate-400 text-sm">{guests.length} guests registered</p>
        <button onClick={openAdd} className="px-5 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-brand-500/25 flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Add Guest
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email or phone..." className="w-full pl-10 pr-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-slate-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(g => (
          <div key={g.id} className="bg-dark-800/50 rounded-2xl border border-white/5 p-5 hover:border-brand-500/20 transition cursor-pointer" onClick={() => setDetail(g)}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-500/30 to-brand-600/10 rounded-xl flex items-center justify-center text-brand-400 font-bold">{g.name.charAt(0)}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold">{g.name}</h3>
                    {g.vip && <Star className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />}
                  </div>
                  <p className="text-slate-500 text-xs">{g.id}</p>
                </div>
              </div>
              <Eye className="w-4 h-4 text-slate-500" />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-dark-700/50 rounded-lg py-2 px-1">
                <p className="text-white font-bold">{g.totalBookings}</p>
                <p className="text-[10px] text-slate-500">Bookings</p>
              </div>
              <div className="bg-dark-700/50 rounded-lg py-2 px-1">
                <p className="text-emerald-400 font-bold">₹{Math.round(g.totalSpent / 1000)}k</p>
                <p className="text-[10px] text-slate-500">Spent</p>
              </div>
              <div className="bg-dark-700/50 rounded-lg py-2 px-1">
                <p className="text-slate-300 text-xs font-medium">{g.lastStay ? formatDate(g.lastStay).split(',')[0] : 'None'}</p>
                <p className="text-[10px] text-slate-500">Last Stay</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-slate-500">{g.city}</span>
              <span className="text-xs text-slate-500">{g.phone}</span>
            </div>
          </div>
        ))}
      </div>

      {detail && (
        <Modal title={detail.name} onClose={() => setDetail(null)}>
          <div className="space-y-4">
            <div className="bg-dark-700/50 rounded-xl p-4 border border-white/5">
              <h4 className="text-sm font-medium text-slate-400 mb-3">Contact</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-slate-500">Phone</p><p className="text-white">{detail.phone}</p></div>
                <div><p className="text-slate-500">Email</p><p className="text-white">{detail.email}</p></div>
                <div><p className="text-slate-500">City</p><p className="text-white">{detail.city}</p></div>
                <div><p className="text-slate-500">ID</p><p className="text-white">{detail.idType}: {detail.idNumber}</p></div>
              </div>
            </div>
            <div className="bg-dark-700/50 rounded-xl p-4 border border-white/5">
              <h4 className="text-sm font-medium text-slate-400 mb-3">Stay History</h4>
              {getGuestBookings(detail.id).length === 0 ? (
                <p className="text-sm text-slate-500">No bookings yet</p>
              ) : (
                <div className="space-y-2">
                  {getGuestBookings(detail.id).map(b => {
                    const r = getRoom(b.roomId);
                    return (
                      <div key={b.id} className="flex items-center justify-between p-2 bg-dark-800/50 rounded-lg">
                        <div>
                          <p className="text-sm text-white font-medium">{r?.name || b.roomId}</p>
                          <p className="text-[10px] text-slate-500">{formatDate(b.checkIn)} → {formatDate(b.checkOut)}</p>
                        </div>
                        <span className={`px-2 py-1 text-[10px] rounded-full font-medium border ${statusColor(b.status)}`}>{b.status}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {detail.notes && <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4"><p className="text-sm text-slate-300">{detail.notes}</p></div>}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-dark-700/50 rounded-xl p-3 text-center border border-white/5"><p className="text-xl font-bold text-white">{detail.totalBookings}</p><p className="text-xs text-slate-500">Total Stays</p></div>
              <div className="bg-dark-700/50 rounded-xl p-3 text-center border border-white/5"><p className="text-xl font-bold text-amber-400">₹{Math.round(detail.totalSpent / 1000)}k</p><p className="text-xs text-slate-500">Total Spent</p></div>
              <div className="bg-dark-700/50 rounded-xl p-3 text-center border border-white/5">
                <div className="flex items-center justify-center gap-1">{detail.vip && <><Star className="w-4 h-4 text-amber-400" fill="currentColor" /><span className="text-sm font-bold text-amber-400">VIP</span></>}{!detail.vip && <span className="text-sm text-slate-500">Regular</span>}</div>
                <p className="text-xs text-slate-500">Status</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {modal && (
        <Modal title="Add Guest" onClose={() => setModal(null)}>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-slate-300 mb-1">Name *</label><input required value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
              <div><label className="block text-sm text-slate-300 mb-1">Phone *</label><input required value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-slate-300 mb-1">Email</label><input type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
              <div><label className="block text-sm text-slate-300 mb-1">City</label><input value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-slate-300 mb-1">ID Type</label><select value={form.idType || ''} onChange={e => setForm({ ...form, idType: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"><option>Aadhaar</option><option>PAN</option><option>Passport</option><option>Driving License</option></select></div>
              <div><label className="block text-sm text-slate-300 mb-1">ID Number</label><input value={form.idNumber || ''} onChange={e => setForm({ ...form, idNumber: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="vip" checked={form.vip || false} onChange={e => setForm({ ...form, vip: e.target.checked })} className="w-4 h-4 accent-brand-500" />
              <label htmlFor="vip" className="text-sm text-slate-300">VIP Guest</label>
            </div>
            <div><label className="block text-sm text-slate-300 mb-1">Notes</label><textarea rows={3} value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" /></div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold rounded-xl transition">Add Guest</button>
              <button type="button" onClick={() => setModal(null)} className="px-6 py-3 bg-white/5 text-slate-300 rounded-xl transition">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
