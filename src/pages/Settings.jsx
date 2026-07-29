import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { useToast } from '../components/Toast';
import { RefreshCw, Download, Database, AlertTriangle, MessageCircle } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Settings() {
  const store = useStore();
  const toast = useToast();
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmImport, setConfirmImport] = useState(false);
  const [importData, setImportData] = useState('');
  const [importError, setImportError] = useState('');
  const [adminName, setAdminName] = useState(store.resort?.name || 'resort-demo/admin');
  const [currency, setCurrency] = useState(store.resort?.currency || '₹');
  const [whatsappPhone, setWhatsappPhone] = useState(store.resort?.whatsappPhone || '');

  const saveResort = (e) => {
    e.preventDefault();
    store.updateResort({ ...store.resort, name: adminName, currency, whatsappPhone });
    toast('Settings saved', 'success');
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
      ['rooms', 'guests', 'bookings', 'invoices', 'seasonal', 'resort'].forEach(key => {
        if (data[key]) localStorage.setItem(`rh_${key}`, JSON.stringify(data[key]));
      });
      toast('Data imported. Reloading...', 'success');
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      setImportError('Invalid JSON file');
    }
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setImportData(ev.target.result); setConfirmImport(true); };
    reader.readAsText(file);
  };

  const resetData = () => {
    const keys = ['rh_rooms', 'rh_guests', 'rh_bookings', 'rh_invoices', 'rh_seasonal', 'rh_resort'];
    keys.forEach(k => localStorage.removeItem(k));
    toast('Data cleared. Reloading...', 'info');
    setTimeout(() => window.location.reload(), 500);
  };

  const totalRooms = store.rooms.length;
  const totalBookings = store.bookings.length;
  const totalGuests = store.guests.length;
  const totalInvoices = (store.invoices || []).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <div className="bg-dark-800/50 rounded-lg border border-white/[0.02] p-4 sm:p-5">
          <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-[2px] mb-4">General</h3>
          <form onSubmit={saveResort} className="space-y-3">
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">Admin Display Name</label>
              <input value={adminName} onChange={e => setAdminName(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">Currency Symbol</label>
              <input value={currency} onChange={e => setCurrency(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10" maxLength={3} />
            </div>
            <button type="submit" className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[12px] font-medium rounded transition-colors">Save</button>
          </form>
        </div>

        <div className="bg-dark-800/50 rounded-lg border border-white/[0.02] p-4 sm:p-5">
          <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-[2px] mb-4">System</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-white/[0.02]">
              <span className="text-sm text-slate-500">Total Rooms</span>
              <span className="text-sm text-white font-medium">{totalRooms}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/[0.02]">
              <span className="text-sm text-slate-500">Total Bookings</span>
              <span className="text-sm text-white font-medium">{totalBookings}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/[0.02]">
              <span className="text-sm text-slate-500">Total Guests</span>
              <span className="text-sm text-white font-medium">{totalGuests}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/[0.02]">
              <span className="text-sm text-slate-500">Total Invoices</span>
              <span className="text-sm text-white font-medium">{totalInvoices}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-500">Storage</span>
              <span className="text-sm text-white font-medium">localStorage</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-dark-800/50 rounded-lg border border-white/[0.02] p-4 sm:p-5">
        <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-[2px] mb-4 flex items-center gap-2">
          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp
        </h3>
        <div>
          <label className="block text-[11px] text-slate-600 mb-1">Owner's WhatsApp Number (with country code)</label>
          <input value={whatsappPhone} onChange={e => setWhatsappPhone(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10" placeholder="+9198XXXXXXXX" />
          <p className="text-[10px] text-slate-600 mt-1">Used in quick-send confirmation messages so guests can reach you.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <div className="bg-dark-800/50 rounded-lg border border-white/[0.02] p-4 sm:p-5">
          <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-[2px] mb-2">Export</h3>
          <p className="text-[12px] text-slate-600 mb-3">Download all data as JSON.</p>
          <button onClick={handleExport} className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-slate-400 text-[12px] font-medium rounded transition-colors flex items-center gap-2">
            <Download className="w-3.5 h-3.5" /> Export Backup
          </button>
        </div>

        <div className="bg-dark-800/50 rounded-lg border border-white/[0.02] p-4 sm:p-5">
          <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-[2px] mb-2">Import</h3>
          <p className="text-[12px] text-slate-600 mb-3">Restore from a JSON backup.</p>
          <label className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-slate-400 text-[12px] font-medium rounded transition-colors inline-flex items-center gap-2 cursor-pointer">
            <Database className="w-3.5 h-3.5" /> Choose File
            <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
          </label>
          {importError && <p className="text-[11px] text-red-400/70 mt-2">{importError}</p>}
        </div>
      </div>

      <div className="bg-dark-800/50 rounded-lg border border-white/[0.02] p-4 sm:p-5">
        <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-[2px] mb-2">Reset</h3>
        <p className="text-[12px] text-slate-600 mb-3">Replace all data with demo data.</p>
        <button onClick={() => setConfirmReset(true)} className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-slate-400 text-[12px] font-medium rounded transition-colors flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Load Demo Data
        </button>
      </div>

      {confirmReset && (
        <ConfirmDialog
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
          title="Reset All Data?"
          message="This replaces all bookings, guests, rooms, and invoices with demo data. This cannot be undone."
          confirmText="Reset"
          onConfirm={resetData}
          onCancel={() => setConfirmReset(false)}
        />
      )}

      {confirmImport && (
        <ConfirmDialog
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
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
