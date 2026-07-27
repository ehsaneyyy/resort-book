import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { formatCurrency, today } from '../data/utils';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import { Plus, Edit3, Trash2, BedDouble } from 'lucide-react';

const gradients = [
  'from-brand-600/40 via-dark-700 to-dark-800',
  'from-emerald-600/20 via-dark-700 to-dark-800',
  'from-blue-600/20 via-dark-700 to-dark-800',
  'from-purple-600/20 via-dark-700 to-dark-800',
  'from-rose-600/20 via-dark-700 to-dark-800',
  'from-amber-600/20 via-dark-700 to-dark-800',
];

export default function Rooms() {
  const { rooms, updateRooms, bookings } = useStore();
  const toast = useToast();
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const types = ['all', ...new Set(rooms.map(r => r.type))];
  const filtered = filter === 'all' ? rooms : rooms.filter(r => r.type === filter);
  const occupied = bookings.filter(b => b.status === 'Confirmed' && today() >= b.checkIn && today() < b.checkOut).map(b => b.roomId);

  const openAdd = () => { setForm({ name: '', type: 'Standard', price: '', weekendPrice: '', capacity: '', beds: '', size: '', floor: '', description: '', amenities: '' }); setModal('add'); };
  const openEdit = (r) => { setForm({ ...r, amenities: r.amenities.join(', ') }); setModal('edit'); };
  const save = (e) => {
    e.preventDefault();
    const data = { ...form, price: Number(form.price), weekendPrice: Number(form.weekendPrice), capacity: Number(form.capacity), size: Number(form.size), floor: Number(form.floor), amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean) };
    if (modal === 'edit') {
      updateRooms(prev => prev.map(r => r.id === form.id ? { ...r, ...data } : r));
      toast('Room updated', 'success');
    } else {
      data.id = 'RM' + String(rooms.length + 1).padStart(3, '0');
      data.status = 'available';
      updateRooms(prev => [...prev, data]);
      toast('Room added', 'success');
    }
    setModal(null);
  };
  const del = (id) => { if (confirm('Delete this room?')) { updateRooms(prev => prev.filter(r => r.id !== id)); toast('Room deleted', 'info'); } };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-slate-400 text-sm">{rooms.length} rooms &middot; {occupied.length} occupied</p>
        <button onClick={openAdd} className="px-5 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-brand-500/25 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Room
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)} className={`px-4 py-2 rounded-xl text-sm font-medium transition border ${filter === t ? 'bg-white/10 text-white border-white/10' : 'text-slate-400 hover:text-white border-transparent'}`}>{t === 'all' ? 'All' : t}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((r, i) => {
          const isOcc = occupied.includes(r.id);
          return (
            <div key={r.id} className="bg-dark-800/50 rounded-2xl border border-white/5 overflow-hidden hover:border-brand-500/20 transition group">
              <div className={`relative h-40 bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center`}>
                <div className="text-center">
                  <div className="w-14 h-14 bg-brand-500/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <BedDouble className="w-7 h-7 text-brand-400" />
                  </div>
                  <p className="text-xs text-slate-400">{r.name}</p>
                </div>
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2.5 py-1 bg-dark-900/80 backdrop-blur-sm rounded-lg text-xs font-medium text-brand-400 border border-brand-500/20">{r.type}</span>
                  <span className={`px-2.5 py-1 backdrop-blur-sm rounded-lg text-xs font-medium border ${isOcc ? 'bg-red-500/20 text-red-400 border-red-500/20' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20'}`}>{isOcc ? 'Occupied' : 'Available'}</span>
                </div>
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-dark-900/80 backdrop-blur-sm rounded-lg text-xs text-slate-300 border border-white/10">Floor {r.floor}</div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold">{r.name}</h3>
                    <p className="text-slate-500 text-xs">{r.id} &middot; {r.beds} &middot; {r.size} sq ft</p>
                  </div>
                  <div className="text-right">
                    <p className="text-brand-400 font-bold">{formatCurrency(r.price)}</p>
                    <p className="text-slate-500 text-[10px]">/night</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {r.amenities.slice(0, 4).map(a => <span key={a} className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-slate-400">{a}</span>)}
                  {r.amenities.length > 4 && <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-slate-500">+{r.amenities.length - 4}</span>}
                </div>
                <div className="flex gap-2 pt-3 border-t border-white/5">
                  <button onClick={() => openEdit(r)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-sm rounded-lg transition flex items-center justify-center gap-1"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                  <button onClick={() => del(r.id)} className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <Modal title={modal === 'edit' ? 'Edit Room' : 'Add Room'} onClose={() => setModal(null)}>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-slate-300 mb-1">Name *</label><input required value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
              <div><label className="block text-sm text-slate-300 mb-1">Type *</label><select value={form.type || ''} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"><option>Standard</option><option>Deluxe</option><option>Suite</option><option>Premium Suite</option><option>Villa</option></select></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-sm text-slate-300 mb-1">Weekday ₹</label><input required type="number" value={form.price || ''} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
              <div><label className="block text-sm text-slate-300 mb-1">Weekend ₹</label><input required type="number" value={form.weekendPrice || ''} onChange={e => setForm({ ...form, weekendPrice: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
              <div><label className="block text-sm text-slate-300 mb-1">Capacity</label><input required type="number" value={form.capacity || ''} onChange={e => setForm({ ...form, capacity: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-sm text-slate-300 mb-1">Beds</label><input required value={form.beds || ''} onChange={e => setForm({ ...form, beds: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
              <div><label className="block text-sm text-slate-300 mb-1">Size sqft</label><input required type="number" value={form.size || ''} onChange={e => setForm({ ...form, size: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
              <div><label className="block text-sm text-slate-300 mb-1">Floor</label><input required type="number" value={form.floor ?? ''} onChange={e => setForm({ ...form, floor: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
            </div>
            <div><label className="block text-sm text-slate-300 mb-1">Description</label><textarea rows={3} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" /></div>
            <div><label className="block text-sm text-slate-300 mb-1">Amenities (comma sep)</label><input value={form.amenities || ''} onChange={e => setForm({ ...form, amenities: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="AC, WiFi, TV..." /></div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold rounded-xl transition">{modal === 'edit' ? 'Update' : 'Add Room'}</button>
              <button type="button" onClick={() => setModal(null)} className="px-6 py-3 bg-white/5 text-slate-300 rounded-xl transition">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
