import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { formatCurrency, today } from '../data/utils';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { Plus, Edit3, Trash2, BedDouble } from 'lucide-react';

const iconColors = ['text-brand-400', 'text-emerald-400', 'text-blue-400', 'text-purple-400', 'text-rose-400', 'text-amber-400'];

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
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-[12px] text-slate-500">{rooms.length} rooms · {occupied.length} occupied</p>
        <button onClick={openAdd} className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-[12px] font-medium rounded transition-colors flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add Room
        </button>
      </div>

      <div className="flex gap-1">
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1.5 rounded text-[12px] font-medium transition-colors ${filter === t ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}>{t === 'all' ? 'All' : t}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((r, i) => {
          const isOcc = occupied.includes(r.id);
          return (
            <div key={r.id} className="bg-dark-800 border border-white/5 hover:border-white/10 transition-colors">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-dark-700 rounded-lg flex items-center justify-center">
                      <BedDouble className={`w-4 h-4 ${iconColors[i % iconColors.length]}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white">{r.name}</h3>
                      <p className="text-[11px] text-slate-500">{r.id} · {r.type} · Floor {r.floor}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${isOcc ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{isOcc ? 'Occupied' : 'Available'}</span>
                </div>

                <p className="text-[12px] text-slate-400 mb-3">{r.description}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {r.amenities.map(a => <span key={a} className="px-1.5 py-0.5 bg-dark-700 rounded text-[10px] text-slate-400">{a}</span>)}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3">
                  <span>{r.beds} · {r.size} sqft · Up to {r.capacity}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div>
                    <span className="text-sm font-semibold text-white">{formatCurrency(r.price)}</span>
                    <span className="text-[10px] text-slate-500">/night</span>
                    {r.weekendPrice !== r.price && <span className="text-[10px] text-slate-600 ml-2">Weekend: {formatCurrency(r.weekendPrice)}</span>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(r)} className="p-1.5 text-slate-500 hover:text-white transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => del(r.id)} className="p-1.5 text-slate-600 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <Modal title={modal === 'edit' ? 'Edit Room' : 'Add Room'} onClose={() => setModal(null)}>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Name</label><input required value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-white/20" /></div>
              <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Type</label><select value={form.type || ''} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-white/20"><option>Standard</option><option>Deluxe</option><option>Suite</option><option>Premium Suite</option><option>Villa</option></select></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Weekday ₹</label><input required type="number" value={form.price || ''} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-white/20" /></div>
              <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Weekend ₹</label><input required type="number" value={form.weekendPrice || ''} onChange={e => setForm({ ...form, weekendPrice: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-white/20" /></div>
              <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Capacity</label><input required type="number" value={form.capacity || ''} onChange={e => setForm({ ...form, capacity: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-white/20" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Beds</label><input required value={form.beds || ''} onChange={e => setForm({ ...form, beds: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-white/20" /></div>
              <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Size sqft</label><input required type="number" value={form.size || ''} onChange={e => setForm({ ...form, size: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-white/20" /></div>
              <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Floor</label><input required type="number" value={form.floor ?? ''} onChange={e => setForm({ ...form, floor: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-white/20" /></div>
            </div>
            <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Description</label><textarea rows={2} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-white/20 resize-none" /></div>
            <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Amenities (comma sep)</label><input value={form.amenities || ''} onChange={e => setForm({ ...form, amenities: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-white/20" placeholder="AC, WiFi, TV..." /></div>
            <div className="flex gap-2 pt-1">
              <button type="submit" className="flex-1 py-2 bg-brand-600 hover:bg-brand-500 text-white text-[12px] font-medium rounded transition-colors">{modal === 'edit' ? 'Update' : 'Add Room'}</button>
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 bg-dark-700 text-slate-300 text-[12px] rounded transition-colors">Cancel</button>
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
