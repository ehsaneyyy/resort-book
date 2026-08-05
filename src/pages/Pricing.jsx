import { useState } from 'react';
import { useSeasonalRules, useCreateSeasonalRule, useUpdateSeasonalRule, useDeleteSeasonalRule } from '../api/hooks';
import { useToast } from '../components/useToast';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Calendar, Plus, Edit3, Trash2 } from 'lucide-react';
import { Skeleton } from '../components/Skeleton';
import { MONTHS_SHORT } from '../data/constants';

function formatPeriod(start, end) {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  return `${MONTHS_SHORT[s.getMonth()]} ${s.getDate()} \u2192 ${MONTHS_SHORT[e.getMonth()]} ${e.getDate()}`;
}

function getMonthRange(months) {
  const now = new Date();
  const y = now.getFullYear();
  const start = new Date(y, months[0], 1);
  const end = new Date(y, months[months.length - 1] + 1, 0);
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { start: fmt(start), end: fmt(end) };
}

export function Pricing() {
  const { data: seasonal = [], isLoading } = useSeasonalRules();
  const createRule = useCreateSeasonalRule();
  const updateRule = useUpdateSeasonalRule();
  const deleteRule = useDeleteSeasonalRule();
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
      updateRule.mutate({ id: form.id, ...data }, {
        onSuccess: () => { toast('Rule updated', 'success'); setModal(null); },
        onError: () => toast('Failed to update', 'error'),
      });
    } else {
      createRule.mutate(data, {
        onSuccess: () => { toast('Rule created', 'success'); setModal(null); },
        onError: () => toast('Failed to create', 'error'),
      });
    }
  };

  const del = (id) => setConfirmId(id);
  const toggle = (rule) => {
    updateRule.mutate({ id: rule.id, isActive: !rule.isActive }, {
      onSuccess: () => toast(rule.isActive ? 'Deactivated' : 'Activated', 'info'),
      onError: () => toast('Failed to toggle', 'error'),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between"><Skeleton className="h-4 w-24" /><Skeleton className="h-11 w-28 rounded" /></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-dark-800/50 rounded-lg border border-white/[0.02] p-4">
              <div className="flex items-center justify-between"><Skeleton className="h-5 w-40" /><Skeleton className="h-5 w-20" /></div>
              <Skeleton className="h-3 w-48 mt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">{seasonal.length} rules &middot; {seasonal.filter(s => s.isActive).length} active</p>
        <button onClick={openAdd} className="px-3 py-2 min-h-[44px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-medium rounded focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Rule
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {presets.map((p, i) => (
          <button key={i} onClick={() => openPreset(p)} className="bg-dark-800/50 rounded-lg border border-white/[0.02] p-4 text-left hover:border-white/[0.05] focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors">
            <h3 className="text-sm text-white font-medium mb-0.5">{p.name}</h3>
            <p className="text-xs text-slate-500">{p.adjustment > 0 ? '+' : ''}{p.adjustment}%</p>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {seasonal.map(rule => (
          <div key={rule.id} className="bg-dark-800/50 rounded-lg border border-white/[0.02] p-4 hover:border-white/[0.05] focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors">
            <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${rule.isActive ? 'bg-emerald-500/10' : 'bg-dark-700/50'}`}>
                  <Calendar className={`w-4 h-4 ${rule.isActive ? 'text-emerald-400/70' : 'text-slate-500'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm text-white font-medium">{rule.name}</h3>
                    <span className={`text-[9px] font-medium ${rule.isActive ? 'text-emerald-400/70' : 'text-slate-500'}`}>{rule.isActive ? 'Active' : 'Off'}</span>
                  </div>
                  <p className="text-xs text-slate-500">{formatPeriod(rule.startDate, rule.endDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <p className={`text-base font-medium ${rule.adjustment >= 0 ? 'text-white' : 'text-red-400/70'}`}>{rule.adjustment > 0 ? '+' : ''}{rule.adjustment}%</p>
                <div className="flex gap-1">
                  <button onClick={() => toggle(rule)} className={`px-3 py-1.5 text-xs font-medium rounded focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors ${rule.isActive ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}>{rule.isActive ? 'Off' : 'On'}</button>
                  <button onClick={() => openEdit(rule)} className="p-2 text-slate-500 hover:text-amber-400 focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => del(rule.id)} className="p-2 text-slate-500 hover:text-red-400 focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title={modal === 'edit' ? 'Edit Rule' : 'Add Rule'} onClose={() => setModal(null)}>
          <form onSubmit={save} className="space-y-4">
            <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Name</label><input required value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Start</label><input required type="date" value={form.startDate || ''} onChange={e => setForm({ ...form, startDate: e.target.value })} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50" /></div>
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">End</label><input required type="date" min={form.startDate || ''} value={form.endDate || ''} onChange={e => setForm({ ...form, endDate: e.target.value })} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Adjustment</label><input required type="number" value={form.adjustment ?? ''} onChange={e => setForm({ ...form, adjustment: e.target.value })} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50" placeholder="+20 or -10" /></div>
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Type</label><select value={form.type || ''} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50"><option value="percentage">Percentage (%)</option><option value="fixed">Fixed (₹)</option></select></div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="active" checked={form.isActive ?? true} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-amber-500" />
              <label htmlFor="active" className="text-sm text-slate-400">Active</label>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 py-2 min-h-[44px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-medium rounded focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors">{modal === 'edit' ? 'Update' : 'Create'}</button>
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 min-h-[44px] bg-dark-700 text-slate-400 text-xs rounded focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {confirmId && (
        <ConfirmDialog
          title="Delete Rule"
          message="This will remove this pricing rule."
          onConfirm={() => { deleteRule.mutate(confirmId); toast('Deleted', 'info'); setConfirmId(null); }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
