import { useState, useRef } from 'react';
import { useResort, useUpdateResort, useSeedDemo, useStats } from '../api/hooks';
import { useToast } from '../components/useToast';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CURRENCIES, PHONE_REGEX, EMAIL_REGEX } from '../data/constants';
import { RefreshCw, Download, Database, MessageCircle, Building2, Globe, Loader2 } from 'lucide-react';
import { Skeleton } from '../components/Skeleton';

const CURRENCY_OPTIONS = CURRENCIES;

export function Settings() {
  const { data: resort, isLoading: resortLoading } = useResort();
  const { data: stats } = useStats();
  const updateResort = useUpdateResort();
  const seedDemo = useSeedDemo();
  const toast = useToast();
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmImport, setConfirmImport] = useState(false);
  const [importData, setImportData] = useState('');
  const [importError, setImportError] = useState('');

  const initial = useRef({ resortName: '', currency: '\u20B9', phone: '', email: '', address: '', checkInTime: '14:00', checkOutTime: '11:00', taxRate: 0, whatsappPhone: '' });

  const [resortName, setResortName] = useState('');
  const [currency, setCurrency] = useState('\u20B9');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [checkInTime, setCheckInTime] = useState('14:00');
  const [checkOutTime, setCheckOutTime] = useState('11:00');
  const [taxRate, setTaxRate] = useState(0);
  const [whatsappPhone, setWhatsappPhone] = useState('');

  if (resort && initial.current.resortName === '') {
    const r = resort;
    initial.current = { resortName: r.name || '', currency: r.currency || '\u20B9', phone: r.phone || '', email: r.email || '', address: r.address || '', checkInTime: r.checkInTime || '14:00', checkOutTime: r.checkOutTime || '11:00', taxRate: r.taxRate ?? 0, whatsappPhone: r.whatsappPhone || '' };
    if (resortName === '') {
      setResortName(initial.current.resortName);
      setCurrency(initial.current.currency);
      setPhone(initial.current.phone);
      setEmail(initial.current.email);
      setAddress(initial.current.address);
      setCheckInTime(initial.current.checkInTime);
      setCheckOutTime(initial.current.checkOutTime);
      setTaxRate(initial.current.taxRate);
      setWhatsappPhone(initial.current.whatsappPhone);
    }
  }

  const hasChanges = resortName !== initial.current.resortName || currency !== initial.current.currency || phone !== initial.current.phone || email !== initial.current.email || address !== initial.current.address || checkInTime !== initial.current.checkInTime || checkOutTime !== initial.current.checkOutTime || taxRate !== initial.current.taxRate || whatsappPhone !== initial.current.whatsappPhone;

  const saveResort = (e) => {
    e.preventDefault();
    if (phone && !PHONE_REGEX.test(phone)) { toast('Invalid phone format', 'warning'); return; }
    if (email && !EMAIL_REGEX.test(email)) { toast('Invalid email format', 'warning'); return; }
    if (whatsappPhone && !PHONE_REGEX.test(whatsappPhone)) { toast('Invalid WhatsApp number format', 'warning'); return; }
    updateResort.mutate({ name: resortName, currency, phone, email, address, checkInTime, checkOutTime, taxRate: Number(taxRate), whatsappPhone }, {
      onSuccess: () => {
        initial.current = { resortName, currency, phone, email, address, checkInTime, checkOutTime, taxRate: Number(taxRate), whatsappPhone };
        toast('Settings saved', 'success');
      },
      onError: () => toast('Failed to save', 'error'),
    });
  };

  const handleExport = () => {
    const data = {};
    ['rooms', 'guests', 'bookings', 'invoices', 'seasonal', 'resort'].forEach(key => {
      const val = localStorage.getItem(`rh_${key}`);
      if (val) data[key] = JSON.parse(val);
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resort-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Exported', 'success');
  };

  const handleImport = () => {
    setImportError('');
    try {
      const data = JSON.parse(importData);
      if (!data || typeof data !== 'object') throw new Error('Invalid JSON structure');
      const validKeys = ['rooms', 'guests', 'bookings', 'invoices', 'seasonal', 'resort'];
      for (const key of validKeys) {
        if (data[key] !== undefined) {
          if (key === 'resort') {
            if (!data[key].name) throw new Error(`Invalid ${key} data`);
          } else if (!Array.isArray(data[key]) || !data[key].every(item => item.id)) {
            throw new Error(`Invalid ${key} data`);
          }
        }
      }
      validKeys.forEach(key => {
        if (data[key]) localStorage.setItem(`rh_${key}`, JSON.stringify(data[key]));
      });
      toast('Data imported. Reloading...', 'success');
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      setImportError(err.message || 'Invalid JSON file');
    }
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setImportError('File too large (max 5MB)'); return; }
    setImportError('');
    const reader = new FileReader();
    reader.onload = (ev) => { setImportData(ev.target.result); setConfirmImport(true); };
    reader.readAsText(file);
  };

  const resetData = () => {
    seedDemo.mutate(undefined, {
      onSuccess: (result) => {
        toast(`Demo data loaded: ${result.counts.rooms} rooms, ${result.counts.guests} guests, ${result.counts.bookings} bookings`, 'success');
        setConfirmReset(false);
      },
      onError: () => toast('Failed to load demo data', 'error'),
    });
  };

  if (resortLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="bg-dark-800/50 rounded-lg border border-white/[0.02] p-5 space-y-4">
          <Skeleton className="h-4 w-36" />
          <div className="grid grid-cols-2 gap-4"><Skeleton className="h-[88px] rounded" /><Skeleton className="h-[88px] rounded" /></div>
          <div className="grid grid-cols-3 gap-4"><Skeleton className="h-[88px] rounded" /><Skeleton className="h-[88px] rounded" /><Skeleton className="h-[88px] rounded" /></div>
          <Skeleton className="h-[88px] rounded" />
          <div className="grid grid-cols-3 gap-4"><Skeleton className="h-[88px] rounded" /><Skeleton className="h-[88px] rounded" /><Skeleton className="h-[88px] rounded" /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="bg-dark-800/50 rounded-lg border border-white/[0.02]">
        <div className="px-5 py-3.5 border-b border-white/[0.02] flex items-center gap-2.5">
          <Building2 className="w-4 h-4 text-amber-400/70" />
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-[2px]">Property Profile</h2>
        </div>
        <form onSubmit={saveResort} className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Resort Name</label>
              <input value={resortName} onChange={e => setResortName(e.target.value)} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50">
                {CURRENCY_OPTIONS.map(c => <option key={c.symbol} value={c.symbol}>{c.symbol} — {c.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50" placeholder="+91 99999 99999" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Address</label>
            <textarea rows={2} value={address} onChange={e => setAddress(e.target.value)} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50 resize-none" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Check-in Time</label>
              <input type="time" value={checkInTime} onChange={e => setCheckInTime(e.target.value)} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Check-out Time</label>
              <input type="time" value={checkOutTime} onChange={e => setCheckOutTime(e.target.value)} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Tax Rate (%)</label>
              <input type="number" min="0" max="100" step="0.1" value={taxRate} onChange={e => setTaxRate(e.target.value)} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50" />
            </div>
          </div>
          {hasChanges && <div className="flex justify-end pt-2">
            <button type="submit" className="px-5 py-2 min-h-[44px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-medium rounded focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors">{updateResort.isPending ? 'Saving...' : 'Save Settings'}</button>
          </div>}
        </form>
      </div>

      <div className="bg-dark-800/50 rounded-lg border border-white/[0.02]">
        <div className="px-5 py-3.5 border-b border-white/[0.02] flex items-center gap-2.5">
          <MessageCircle className="w-4 h-4 text-emerald-400/70" />
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-[2px]">WhatsApp</h2>
        </div>
        <div className="p-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Owner's WhatsApp Number</label>
            <input value={whatsappPhone} onChange={e => setWhatsappPhone(e.target.value)} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50" placeholder="+9198XXXXXXXX" />
            <p className="text-xs text-slate-500 mt-1.5">This number appears in confirmation messages so guests can reach you on WhatsApp.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-dark-800/50 rounded-lg border border-white/[0.02]">
          <div className="px-5 py-3.5 border-b border-white/[0.02] flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-slate-500" />
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-[2px]">System</h2>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-white/[0.02]">
              <span className="text-sm text-slate-500">Rooms</span>
              <span className="text-sm text-white font-medium">{stats?.totalRooms ?? 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/[0.02]">
              <span className="text-sm text-slate-500">Bookings</span>
              <span className="text-sm text-white font-medium">{stats?.totalBookings ?? 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/[0.02]">
              <span className="text-sm text-slate-500">Guests</span>
              <span className="text-sm text-white font-medium">{stats?.totalGuests ?? 0}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-500">Storage</span>
              <span className="text-sm text-white font-medium">API + localStorage</span>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-dark-800/50 rounded-lg border border-white/[0.02] p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-[2px] mb-3">Export</h3>
            <p className="text-xs text-slate-500 mb-3">Download all data as a JSON file.</p>
            <button onClick={handleExport} className="px-4 py-2 min-h-[44px] bg-dark-700 hover:bg-dark-600 text-slate-400 text-xs font-medium rounded focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" /> Export Backup
            </button>
          </div>

          <div className="bg-dark-800/50 rounded-lg border border-white/[0.02] p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-[2px] mb-3">Import</h3>
            <p className="text-xs text-slate-500 mb-3">Restore data from a JSON backup.</p>
            <label className="px-4 py-2 min-h-[44px] bg-dark-700 hover:bg-dark-600 text-slate-400 text-xs font-medium rounded focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors inline-flex items-center gap-2 cursor-pointer">
              <Database className="w-4 h-4" /> Choose File
              <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
            </label>
            {importError && <p className="text-xs text-red-400/70 mt-2">{importError}</p>}
          </div>

          <div className="bg-dark-800/50 rounded-lg border border-white/[0.02] p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-[2px] mb-3">Reset</h3>
            <p className="text-xs text-slate-500 mb-3">Replace all data with fresh demo data.</p>
            <button onClick={() => setConfirmReset(true)} disabled={seedDemo.isPending} className="px-4 py-2 min-h-[44px] bg-dark-700 hover:bg-dark-600 disabled:opacity-50 text-slate-400 text-xs font-medium rounded focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors flex items-center gap-2">
              {seedDemo.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} {seedDemo.isPending ? 'Loading...' : 'Load Demo Data'}
            </button>
          </div>
        </div>
      </div>

      {confirmReset && (
        <ConfirmDialog
          icon={<RefreshCw className="w-5 h-5 text-amber-400" />}
          title="Reset All Data?"
          message="This replaces all bookings, guests, rooms, and invoices with demo data. This cannot be undone."
          confirmText="Reset"
          onConfirm={resetData}
          onCancel={() => setConfirmReset(false)}
        />
      )}

      {confirmImport && (
        <ConfirmDialog
          icon={<Database className="w-5 h-5 text-amber-400" />}
          title="Import Data?"
          message="This replaces all current data with the imported file."
          confirmText="Import"
          onConfirm={handleImport}
          onCancel={() => { setConfirmImport(false); setImportData(''); }}
        />
      )}
    </div>
  );
}
