import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { formatDate } from '../data/utils';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import GuestTimeline from '../components/GuestTimeline';
import { Search, Eye, Star, UserPlus } from 'lucide-react';

export default function Guests() {
  const { guests, updateGuests } = useStore();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const filtered = search
    ? guests.filter(g => g.name.toLowerCase().includes(search.toLowerCase()) || g.email.toLowerCase().includes(search.toLowerCase()) || g.phone.includes(search))
    : guests;

  const openAdd = () => {
    setForm({ name: '', email: '', phone: '', city: '', idType: 'Aadhaar', idNumber: '', vip: false, notes: '' });
    setModal('add');
  };

  const save = (e) => {
    e.preventDefault();
    const maxNum = guests.reduce((max, g) => {
      const n = parseInt(g.id.replace(/\D/g, ''), 10);
      return n > max ? n : max;
    }, 0);
    const newGuest = {
      ...form,
      id: 'G' + String(maxNum + 1).padStart(3, '0'),
      totalBookings: 0,
      totalSpent: 0,
      lastStay: null,
      createdAt: new Date().toISOString(),
    };
    updateGuests(prev => [...prev, newGuest]);
    toast('Guest added', 'success');
    setModal(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-[12px] text-slate-500">{guests.length} guests</p>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-8 pr-3 py-1.5 bg-dark-800 border border-white/10 rounded text-sm text-white w-48 focus:outline-none focus:border-white/20 placeholder-slate-600" />
          </div>
          <button onClick={openAdd} className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-[12px] font-medium rounded transition-colors flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5" /> Add Guest
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map(g => (
          <div key={g.id} className="bg-dark-800 border border-white/5 hover:border-white/10 transition-colors p-4 cursor-pointer" onClick={() => setDetail(g)}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-dark-700 rounded-lg flex items-center justify-center text-slate-400 text-xs font-medium">{g.name.charAt(0)}</div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-medium text-white">{g.name}</h3>
                    {g.vip && <Star className="w-3 h-3 text-amber-500" fill="currentColor" />}
                  </div>
                  <p className="text-[11px] text-slate-500">{g.id}</p>
                </div>
              </div>
              <Eye className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              <div className="bg-dark-700/50 rounded px-2 py-1.5 text-center">
                <p className="text-[12px] text-white font-medium">{g.totalBookings}</p>
                <p className="text-[9px] text-slate-500">Bookings</p>
              </div>
              <div className="bg-dark-700/50 rounded px-2 py-1.5 text-center">
                <p className="text-[12px] text-white font-medium">{formatCurrency(g.totalSpent)}</p>
                <p className="text-[9px] text-slate-500">Spent</p>
              </div>
              <div className="bg-dark-700/50 rounded px-2 py-1.5 text-center">
                <p className="text-[12px] text-slate-300">{g.lastStay ? formatDate(g.lastStay).split(',')[0] : '—'}</p>
                <p className="text-[9px] text-slate-500">Last Stay</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{g.city}</span>
              <span>{g.phone}</span>
            </div>
          </div>
        ))}
      </div>

      {detail && (
        <Modal title={detail.name} onClose={() => setDetail(null)}>
          <div className="space-y-4">
            <div>
              <h4 className="text-[11px] text-slate-500 uppercase tracking-wider mb-2">Contact</h4>
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                <div><p className="text-slate-500">Phone</p><p className="text-white">{detail.phone}</p></div>
                <div><p className="text-slate-500">Email</p><p className="text-white">{detail.email}</p></div>
                <div><p className="text-slate-500">City</p><p className="text-white">{detail.city}</p></div>
                <div><p className="text-slate-500">ID</p><p className="text-white">{detail.idType}: {detail.idNumber}</p></div>
              </div>
            </div>
            <div>
              <h4 className="text-[11px] text-slate-500 uppercase tracking-wider mb-2">Stay History</h4>
              <GuestTimeline guestId={detail.id} />
            </div>
            {detail.notes && <div className="text-[12px] text-slate-400 bg-dark-700/50 rounded-lg p-3 border border-white/5">{detail.notes}</div>}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-dark-700/50 rounded-lg p-2.5 text-center border border-white/5"><p className="text-lg font-semibold text-white">{detail.totalBookings}</p><p className="text-[10px] text-slate-500">Stays</p></div>
              <div className="bg-dark-700/50 rounded-lg p-2.5 text-center border border-white/5"><p className="text-lg font-semibold text-white">{formatCurrency(detail.totalSpent)}</p><p className="text-[10px] text-slate-500">Spent</p></div>
              <div className="bg-dark-700/50 rounded-lg p-2.5 text-center border border-white/5"><p className="text-sm font-medium text-white">{detail.vip ? 'VIP' : 'Regular'}</p><p className="text-[10px] text-slate-500">Status</p></div>
            </div>
          </div>
        </Modal>
      )}

      {modal && (
        <Modal title="Add Guest" onClose={() => setModal(null)}>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Name</label><input required value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-white/20" /></div>
              <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Phone</label><input required value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-white/20" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Email</label><input type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-white/20" /></div>
              <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">City</label><input value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-white/20" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">ID Type</label><select value={form.idType || ''} onChange={e => setForm({ ...form, idType: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-white/20"><option>Aadhaar</option><option>PAN</option><option>Passport</option><option>Driving License</option></select></div>
              <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">ID Number</label><input value={form.idNumber || ''} onChange={e => setForm({ ...form, idNumber: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-white/20" /></div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="vip" checked={form.vip || false} onChange={e => setForm({ ...form, vip: e.target.checked })} className="w-3.5 h-3.5 accent-brand-500" />
              <label htmlFor="vip" className="text-[12px] text-slate-300">VIP Guest</label>
            </div>
            <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Notes</label><textarea rows={2} value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-white/20 resize-none" /></div>
            <div className="flex gap-2 pt-1">
              <button type="submit" className="flex-1 py-2 bg-brand-600 hover:bg-brand-500 text-white text-[12px] font-medium rounded transition-colors">Add Guest</button>
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 bg-dark-700 text-slate-300 text-[12px] rounded transition-colors">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function formatCurrency(n) {
  return '\u20B9' + n.toLocaleString('en-IN');
}
