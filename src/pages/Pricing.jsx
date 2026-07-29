import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { Calendar, Plus, Edit3, Trash2 } from 'lucide-react';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatPeriod(start, end) {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  return `${MONTHS_SHORT[s.getMonth()]} ${s.getDate()} → ${MONTHS_SHORT[e.getMonth()]} ${e.getDate()}`;
}

function getMonthRange(months) {
  const now = new Date();
  const y = now.getFullYear();
  const start = new Date(y, months[0], 1);
  const end = new Date(y, months[months.length - 1] + 1, 0);
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { start: fmt(start), end: fmt(end) };
}

export default function Pricing() {
  const { seasonal, updateSeasonal } = useStore();
  const toast = useToast();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [confirmId, setConfirmId] = useState(null);

  const presets = [
    { name: 'Peak Season', months: [2, 3, 4, 5, 6], adjustment: 30 },
    { name: 'Festive', months: [9, 10, 11], adjustment: 20 },
    { name: 'Monsoon', months: [6, 7, 8], adjustment: -15 },
    { name: 'Year End', months: [11], adjustment: 25 },
    { name: 'Weekend', months: [], adjustment: 15 },
  ];

  const openAdd = () => { setForm({ name: '', startDate: '', endDate: '', adjustment: 0, type: 'percentage', roomTypes: [], isActive: true }); setModal('add'); };
  const openEdit = (rule) => { setForm({ ...rule }); setModal('edit'); };
  const openPreset = (p) => {
    const { start, end } = getMonthRange(p.months);
    setForm({ name: p.name, startDate: start, endDate: end, adjustment: p.adjustment, type: 'percentage', roomTypes: [], isActive: true });
    setModal('add');
  };

  const save = (e) => {
    e.preventDefault();
    const data = { ...form, adjustment: Number(form.adjustment) };
    if (modal === 'edit') {
      updateSeasonal(prev => prev.map(r => r.id === form.id ? { ...r, ...data } : r));
      toast('Rule updated', 'success');
    } else {
      data.id = 'SE' + String(Date.now()).slice(-4);
      updateSeasonal(prev => [...prev, data]);
      toast('Rule created', 'success');
    }
    setModal(null);
  };

  const del = (id) => setConfirmId(id);
  const toggle = (rule) => {
    updateSeasonal(prev => prev.map(r => r.id === rule.id ? { ...r, isActive: !r.isActive } : r));
    toast(rule.isActive ? 'Deactivated' : 'Activated', 'info');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-[12px] text-slate-500">{seasonal.length} rules · {seasonal.filter(s => s.isActive).length} active</p>
        <button onClick={openAdd} className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-[12px] font-medium rounded transition-colors flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add Rule
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {presets.map((p, i) => (
          <button key={i} onClick={() => openPreset(p)} className="bg-dark-800 border border-white/5 p-3 text-left hover:border-white/10 transition-colors">
            <h3 className="text-[12px] text-white font-medium mb-0.5">{p.name}</h3>
            <p className="text-[10px] text-slate-500">{p.adjustment > 0 ? '+' : ''}{p.adjustment}%</p>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {seasonal.map(rule => (
          <div key={rule.id} className="bg-dark-800 border border-white/5 p-3 hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded flex items-center justify-center ${rule.isActive ? 'bg-emerald-500/10' : 'bg-dark-700'}`}>
                  <Calendar className={`w-4 h-4 ${rule.isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[12px] text-white font-medium">{rule.name}</h3>
                    <span className={`text-[9px] font-medium ${rule.isActive ? 'text-emerald-400' : 'text-slate-600'}`}>{rule.isActive ? 'Active' : 'Off'}</span>
                  </div>
                  <p className="text-[10px] text-slate-600">{formatPeriod(rule.startDate, rule.endDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className={`text-sm font-semibold ${rule.adjustment >= 0 ? 'text-white' : 'text-red-400'}`}>{rule.adjustment > 0 ? '+' : ''}{rule.adjustment}%</p>
                <div className="flex gap-1">
                  <button onClick={() => toggle(rule)} className={`px-2 py-1 text-[10px] font-medium rounded transition-colors ${rule.isActive ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}>{rule.isActive ? 'Off' : 'On'}</button>
                  <button onClick={() => openEdit(rule)} className="p-1 text-slate-500 hover:text-white transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => del(rule.id)} className="p-1 text-slate-600 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title={modal === 'edit' ? 'Edit Rule' : 'Add Rule'} onClose={() => setModal(null)}>
          <form onSubmit={save} className="space-y-4">
            <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Name</label><input required value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-white/20" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Start</label><input required type="date" value={form.startDate || ''} onChange={e => setForm({ ...form, startDate: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-white/20" /></div>
              <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">End</label><input required type="date" value={form.endDate || ''} onChange={e => setForm({ ...form, endDate: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-white/20" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Adjustment</label><input required type="number" value={form.adjustment ?? ''} onChange={e => setForm({ ...form, adjustment: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-white/20" placeholder="+20 or -10" /></div>
              <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Type</label><select value={form.type || ''} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 bg-dark-700 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-white/20"><option value="percentage">Percentage (%)</option><option value="fixed">Fixed (₹)</option></select></div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="active" checked={form.isActive ?? true} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-3.5 h-3.5 accent-brand-500" />
              <label htmlFor="active" className="text-[12px] text-slate-300">Active</label>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" className="flex-1 py-2 bg-brand-600 hover:bg-brand-500 text-white text-[12px] font-medium rounded transition-colors">{modal === 'edit' ? 'Update' : 'Create'}</button>
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 bg-dark-700 text-slate-300 text-[12px] rounded transition-colors">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {confirmId && (
        <ConfirmDialog
          title="Delete Rule"
          message="This will remove this pricing rule."
          onConfirm={() => { updateSeasonal(prev => prev.filter(r => r.id !== confirmId)); toast('Deleted', 'info'); setConfirmId(null); }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
