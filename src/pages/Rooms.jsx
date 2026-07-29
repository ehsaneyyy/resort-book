import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { formatCurrency, today } from '../data/utils';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { Plus, Edit3, Trash2, BedDouble } from 'lucide-react';

export default function Rooms() {
  const { rooms, updateRooms, bookings } = useStore();
  const toast = useToast();
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [confirmId, setConfirmId] = useState(null);
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
      const maxNum = rooms.reduce((max, r) => { const n = parseInt(r.id.replace(/\D/g, ''), 10); return n > max ? n : max; }, 0);
      data.id = 'RM' + String(maxNum + 1).padStart(3, '0');
      data.status = 'available';
      updateRooms(prev => [...prev, data]);
      toast('Room added', 'success');
    }
    setModal(null);
  };
  const del = (id) => setConfirmId(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">{rooms.length} rooms · {occupied.length} occupied</p>
        <button onClick={openAdd} className="px-3 py-2 min-h-[44px] bg-amber-500/10 text-amber-400 text-xs font-medium rounded hover:bg-amber-500/20 focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Room
        </button>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)} className={`px-3 py-2 min-h-[44px] rounded text-xs font-medium focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors whitespace-nowrap ${filter === t ? 'text-white bg-amber-500/10' : 'text-slate-500 hover:text-slate-400'}`}>{t === 'all' ? 'All' : t}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-dark-800/50 rounded-lg border border-white/[0.02] py-12 text-center text-sm text-slate-500">No rooms found</div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((r) => {
          const isOcc = occupied.includes(r.id);
          return (
            <div key={r.id} className="bg-dark-800/50 rounded-lg border border-white/[0.02] hover:border-white/[0.05] focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/10 to-amber-600/5 flex items-center justify-center flex-shrink-0">
                      <BedDouble className="w-4 h-4 text-amber-400/60" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white">{r.name}</h3>
                      <p className="text-xs text-slate-500">{r.type} · Floor {r.floor}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded ${isOcc ? 'bg-red-500/8 text-red-400/70' : 'bg-emerald-500/8 text-emerald-400/70'}`}>{isOcc ? 'Occupied' : 'Available'}</span>
                </div>

                <p className="text-sm text-slate-500 mb-4 leading-relaxed">{r.description}</p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {r.amenities.map(a => <span key={a} className="px-2 py-0.5 bg-dark-700/50 rounded text-xs text-slate-500">{a}</span>)}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                  <span>{r.beds} &middot; {r.size} sqft &middot; Up to {r.capacity}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/[0.02]">
                  <div>
                    <span className="text-base font-medium text-white">{formatCurrency(r.price)}</span>
                    <span className="text-xs text-slate-500">/night</span>
                    {r.weekendPrice !== r.price && <span className="text-xs text-slate-500 ml-2">Wknd {formatCurrency(r.weekendPrice)}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(r)} className="p-2 text-slate-500 hover:text-amber-400 focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => del(r.id)} className="p-2 text-slate-500 hover:text-red-400 focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {modal && (
        <Modal title={modal === 'edit' ? 'Edit Room' : 'Add Room'} onClose={() => setModal(null)}>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Name</label><input required value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50" /></div>
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Type</label><select value={form.type || ''} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50"><option>Standard</option><option>Deluxe</option><option>Suite</option><option>Premium Suite</option><option>Villa</option></select></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Weekday (₹)</label><input required type="number" value={form.price || ''} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50" /></div>
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Weekend (₹)</label><input required type="number" value={form.weekendPrice || ''} onChange={e => setForm({ ...form, weekendPrice: e.target.value })} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50" /></div>
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Capacity</label><input required type="number" value={form.capacity || ''} onChange={e => setForm({ ...form, capacity: e.target.value })} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Beds</label><input required value={form.beds || ''} onChange={e => setForm({ ...form, beds: e.target.value })} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50" /></div>
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Size (sqft)</label><input required type="number" value={form.size || ''} onChange={e => setForm({ ...form, size: e.target.value })} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50" /></div>
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Floor</label><input required type="number" value={form.floor ?? ''} onChange={e => setForm({ ...form, floor: e.target.value })} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50" /></div>
            </div>
            <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Description</label><textarea rows={2} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50 resize-none" /></div>
            <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Amenities (comma separated)</label><input value={form.amenities || ''} onChange={e => setForm({ ...form, amenities: e.target.value })} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50" placeholder="AC, WiFi, TV..." /></div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 py-2 min-h-[44px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-medium rounded focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors">{modal === 'edit' ? 'Update Room' : 'Add Room'}</button>
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 min-h-[44px] bg-dark-700 text-slate-400 text-xs rounded focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {confirmId && (
        <ConfirmDialog
          title="Delete Room"
          message="This will permanently remove this room."
          onConfirm={() => { updateRooms(prev => prev.filter(r => r.id !== confirmId)); toast('Room deleted', 'info'); setConfirmId(null); }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
