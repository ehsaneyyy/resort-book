import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { Calendar, Plus, Edit3, Trash2 } from 'lucide-react';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
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
  const { seasonal, rooms, updateSeasonal } = useStore();
  const toast = useToast();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [confirmId, setConfirmId] = useState(null);

  const presets = [
    { name: 'Peak Season (Summer)', months: [2, 3, 4, 5, 6], adjustment: 30, icon: '☀️' },
    { name: 'Festive Season', months: [9, 10, 11], adjustment: 20, icon: '🎉' },
    { name: 'Monsoon', months: [6, 7, 8], adjustment: -15, icon: '🌧️' },
    { name: 'Year End', months: [11], adjustment: 25, icon: '🎄' },
    { name: 'Weekend Surcharge', months: [], adjustment: 15, icon: '📅' },
  ];

  const openAdd = () => {
    setForm({ name: '', startDate: '', endDate: '', adjustment: 0, type: 'percentage', roomTypes: [], isActive: true });
    setModal('add');
  };
  const openEdit = (rule) => {
    setForm({ ...rule });
    setModal('edit');
  };
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
    toast(rule.isActive ? 'Rule deactivated' : 'Rule activated', 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-slate-400 text-sm">{seasonal.length} pricing rules &middot; {seasonal.filter(s => s.isActive).length} active</p>
        <button onClick={openAdd} className="px-5 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-brand-500/25 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Rule
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {presets.map((p, i) => (
          <button key={i} onClick={() => openPreset(p)} className="bg-dark-800/50 rounded-2xl border border-white/5 p-5 text-left hover:border-brand-500/20 transition group">
            <div className="text-3xl mb-3">{p.icon}</div>
            <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-brand-400 transition">{p.name}</h3>
            <p className="text-xs text-slate-500">Adjustment: {p.adjustment > 0 ? '+' : ''}{p.adjustment}%</p>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {seasonal.map(rule => (
          <div key={rule.id} className="bg-dark-800/50 rounded-2xl border border-white/5 p-5 hover:border-brand-500/20 transition">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${rule.isActive ? 'bg-emerald-500/20' : 'bg-slate-500/20'}`}>
                  <Calendar className={`w-6 h-6 ${rule.isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold">{rule.name}</h3>
                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium border ${rule.isActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/20 text-slate-400 border-slate-500/20'}`}>{rule.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <p className="text-xs text-slate-500">{formatPeriod(rule.startDate, rule.endDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className={`text-xl font-bold ${rule.adjustment >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{rule.adjustment > 0 ? '+' : ''}{rule.adjustment}%</p>
                  <p className="text-[10px] text-slate-500">{rule.type === 'percentage' ? 'Percentage' : 'Fixed'}</p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => toggle(rule)} className={`px-2.5 py-1.5 text-[10px] font-medium rounded-lg transition ${rule.isActive ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}`}>{rule.isActive ? 'Deactivate' : 'Activate'}</button>
                  <button onClick={() => openEdit(rule)} className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => del(rule.id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title={modal === 'edit' ? 'Edit Rule' : 'Add Rule'} onClose={() => setModal(null)}>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Rule Name *</label>
              <input required value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Start Date *</label>
                <input required type="date" value={form.startDate || ''} onChange={e => setForm({ ...form, startDate: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">End Date *</label>
                <input required type="date" value={form.endDate || ''} onChange={e => setForm({ ...form, endDate: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Adjustment *</label>
                <input required type="number" value={form.adjustment ?? ''} onChange={e => setForm({ ...form, adjustment: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="+20 or -10" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Type</label>
                <select value={form.type || ''} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (₹)</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="active" checked={form.isActive ?? true} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-brand-500" />
              <label htmlFor="active" className="text-sm text-slate-300">Active</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold rounded-xl transition">{modal === 'edit' ? 'Update' : 'Create Rule'}</button>
              <button type="button" onClick={() => setModal(null)} className="px-6 py-3 bg-white/5 text-slate-300 rounded-xl transition">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {confirmId && (
        <ConfirmDialog
          title="Delete Pricing Rule"
          message="This will remove this pricing rule. Rooms will no longer use this adjustment."
          onConfirm={() => { updateSeasonal(prev => prev.filter(r => r.id !== confirmId)); toast('Rule deleted', 'info'); setConfirmId(null); }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
