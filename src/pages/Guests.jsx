import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { formatCurrency, formatDate } from '../data/utils';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import GuestTimeline from '../components/GuestTimeline';
import { Search, Eye, Star, UserPlus, MessageCircle } from 'lucide-react';
import { whatsappLink } from '../data/templates';

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-slate-500">{guests.length} guests</p>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full sm:w-48 pl-8 pr-3 py-2 min-h-[44px] bg-dark-800/50 border border-white/[0.02] rounded text-sm text-white focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50 placeholder-slate-500" />
          </div>
          <button onClick={openAdd} className="px-3 py-2 min-h-[44px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-medium rounded transition-colors flex items-center gap-1.5">
            <UserPlus className="w-4 h-4" /> Add Guest
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map(g => (
          <div key={g.id} className="bg-dark-800/50 rounded-lg border border-white/[0.02] hover:border-white/[0.05] transition-colors p-4 cursor-pointer" onClick={() => setDetail(g)}>
              <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/15 to-amber-600/5 flex items-center justify-center text-amber-400/70 text-sm font-medium flex-shrink-0">{g.name.charAt(0)}</div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-medium text-white">{g.name}</h3>
                    {g.vip && <Star className="w-3 h-3 text-amber-400/70" fill="currentColor" />}
                  </div>
                  <p className="text-xs text-slate-500">{g.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={(e) => { e.stopPropagation(); const link = whatsappLink(g.phone, `Hi ${g.name}!`); if (link !== '#') window.open(link, '_blank'); }} className="p-2 text-slate-500 hover:text-emerald-400 transition-colors"><MessageCircle className="w-4 h-4" /></button>
                <Eye className="w-4 h-4 text-slate-500" />
              </div>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 bg-dark-700/30 rounded px-2.5 py-2">
                <p className="text-sm text-white font-medium">{g.totalBookings}</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-[1px]">Bookings</p>
              </div>
              <div className="flex-1 bg-dark-700/30 rounded px-2.5 py-2">
                <p className="text-sm text-white font-medium">{formatCurrency(g.totalSpent)}</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-[1px]">Spent</p>
              </div>
              <div className="flex-1 bg-dark-700/30 rounded px-2.5 py-2">
                <p className="text-sm text-slate-300 font-medium">{g.lastStay ? formatDate(g.lastStay).split(',')[0] : '—'}</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-[1px]">Last</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{g.city}</span>
              <span>{g.phone}</span>
            </div>
          </div>
        ))}
      </div>

      {detail && (
        <Modal title={detail.name} onClose={() => setDetail(null)}>
          <div className="space-y-5">
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-2.5">Contact</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><p className="text-slate-500">Phone</p><p className="text-white">{detail.phone}</p></div>
                <div><p className="text-slate-500">Email</p><p className="text-white">{detail.email}</p></div>
                <div><p className="text-slate-500">City</p><p className="text-white">{detail.city}</p></div>
                <div><p className="text-slate-500">ID</p><p className="text-white">{detail.idType}: {detail.idNumber}</p></div>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-2.5">Stay History</h4>
              <GuestTimeline guestId={detail.id} />
            </div>
            {detail.notes && <div className="text-sm text-slate-500 bg-dark-700/50 rounded p-3 border border-white/[0.02]">{detail.notes}</div>}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-dark-700/30 rounded p-3 text-center"><p className="text-base font-medium text-white">{detail.totalBookings}</p><p className="text-[9px] text-slate-500 uppercase tracking-[1px]">Stays</p></div>
              <div className="bg-dark-700/30 rounded p-3 text-center"><p className="text-base font-medium text-white">{formatCurrency(detail.totalSpent)}</p><p className="text-[9px] text-slate-500 uppercase tracking-[1px]">Spent</p></div>
              <div className="bg-dark-700/30 rounded p-3 text-center"><p className="text-sm font-medium text-white">{detail.vip ? 'VIP' : 'Regular'}</p><p className="text-[9px] text-slate-500 uppercase tracking-[1px]">Status</p></div>
            </div>
          </div>
        </Modal>
      )}

      {modal && (
        <Modal title="Add Guest" onClose={() => setModal(null)}>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Name</label><input required value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50" /></div>
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Phone</label><input required value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Email</label><input type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50" /></div>
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">City</label><input value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">ID Type</label><select value={form.idType || ''} onChange={e => setForm({ ...form, idType: e.target.value })} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50"><option>Aadhaar</option><option>PAN</option><option>Passport</option><option>Driving License</option></select></div>
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">ID Number</label><input value={form.idNumber || ''} onChange={e => setForm({ ...form, idNumber: e.target.value })} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50" /></div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="vip" checked={form.vip || false} onChange={e => setForm({ ...form, vip: e.target.checked })} className="w-4 h-4 accent-amber-500" />
              <label htmlFor="vip" className="text-sm text-slate-400">VIP</label>
            </div>
            <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Notes</label><textarea rows={2} value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50 resize-none" /></div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 py-2 min-h-[44px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-medium rounded transition-colors">Add Guest</button>
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 min-h-[44px] bg-dark-700 text-slate-400 text-xs rounded transition-colors">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
