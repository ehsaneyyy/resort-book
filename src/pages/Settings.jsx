import { useState, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { useToast } from '../components/Toast';
import { RESORT } from '../data/seed';
import { Settings, Download, Upload, Trash2, RotateCcw, Bell } from 'lucide-react';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function SettingsPage() {
  const { rooms, bookings, guests, seasonal, resetStore } = useStore();
  const toast = useToast();
  const [formData, setFormData] = useState(RESORT);

  useEffect(() => {
    const saved = localStorage.getItem('resortSettings');
    if (saved) setFormData(JSON.parse(saved));
  }, []);

  const saveSettings = () => {
    localStorage.setItem('resortSettings', JSON.stringify(formData));
    toast('Settings saved', 'success');
  };

  const exportData = () => {
    const data = { resort: formData, rooms, bookings, guests, seasonal, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `resort-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    toast('Data exported', 'success');
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.rooms) localStorage.setItem('resortRooms', JSON.stringify(data.rooms));
        if (data.bookings) localStorage.setItem('resortBookings', JSON.stringify(data.bookings));
        if (data.guests) localStorage.setItem('resortGuests', JSON.stringify(data.guests));
        if (data.seasonal) localStorage.setItem('resortSeasonal', JSON.stringify(data.seasonal));
        if (data.resort) { localStorage.setItem('resortSettings', JSON.stringify(data.resort)); setFormData(data.resort); }
        window.location.reload();
      } catch (err) { toast('Import failed', 'error'); }
    };
    reader.readAsText(file);
  };

  const resetAll = () => {
    if (confirm('This will delete all data and reload. Are you sure?')) {
      localStorage.removeItem('resortRooms');
      localStorage.removeItem('resortBookings');
      localStorage.removeItem('resortGuests');
      localStorage.removeItem('resortSeasonal');
      localStorage.removeItem('resortSettings');
      window.location.reload();
    }
  };

  const totalNights = bookings.filter(b => b.status !== 'Cancelled').reduce((s, b) => s + b.nights, 0);
  const maxStorage = 5 * 1024 * 1024;
  const usedStorage = new Blob([JSON.stringify({ rooms, bookings, guests, seasonal })]).size;
  const pct = Math.round((usedStorage / maxStorage) * 100);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-dark-800/50 rounded-2xl border border-white/5 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Resort Info</h3>
        <div className="space-y-4">
          <div><label className="block text-sm text-slate-300 mb-1">Resort Name</label><input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
          <div><label className="block text-sm text-slate-300 mb-1">Contact Phone</label><input value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
          <div><label className="block text-sm text-slate-300 mb-1">Email</label><input value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
          <div><label className="block text-sm text-slate-300 mb-1">Address</label><textarea rows={3} value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" /></div>
          <div><label className="block text-sm text-slate-300 mb-1">Website</label><input value={formData.website || ''} onChange={e => setFormData({ ...formData, website: e.target.value })} className="w-full px-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
        </div>
        <button onClick={saveSettings} className="w-full mt-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold rounded-xl transition hover:from-brand-400 hover:to-brand-500">Save Settings</button>
      </div>

      <div className="bg-dark-800/50 rounded-2xl border border-white/5 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
        <div className="space-y-3">
          {[
            { label: 'New Booking Alert', sub: 'Get notified for new bookings', checked: true },
            { label: 'Check-in Reminder', sub: 'Daily check-in/check-out alerts', checked: true },
            { label: 'Payment Due', sub: 'Pending payment notifications', checked: true },
          ].map((n, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-dark-700/50 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-slate-400" />
                <div><p className="text-sm text-white">{n.label}</p><p className="text-xs text-slate-500">{n.sub}</p></div>
              </div>
              <input type="checkbox" defaultChecked={n.checked} className="w-4 h-4 accent-brand-500" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-dark-800/50 rounded-2xl border border-white/5 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Data Management</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Rooms', value: rooms.length },
              { label: 'Bookings', value: bookings.length },
              { label: 'Guests', value: guests.length },
              { label: 'Total Nights', value: totalNights },
            ].map((s, i) => (
              <div key={i} className="bg-dark-700/50 rounded-xl p-3 text-center border border-white/5">
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-[10px] text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Local Storage Used</span>
              <span>{Math.round(usedStorage / 1024)}KB of {Math.round(maxStorage / 1024 / 1024)}MB</span>
            </div>
            <div className="h-2 bg-dark-700/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button onClick={exportData} className="py-3 px-4 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-sm font-medium rounded-xl transition flex items-center justify-center gap-2"><Download className="w-4 h-4" /> Export</button>
            <label className="py-3 px-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm font-medium rounded-xl transition flex items-center justify-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" /> Import
              <input type="file" accept=".json" onChange={importData} className="hidden" />
            </label>
            <button onClick={resetAll} className="py-3 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium rounded-xl transition flex items-center justify-center gap-2"><Trash2 className="w-4 h-4" /> Reset</button>
          </div>
        </div>
      </div>

      <div className="bg-dark-800/50 rounded-2xl border border-white/5 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">About</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Resort Booking System</span><span className="text-white">v1.0.0</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Last Updated</span><span className="text-white">{MONTH_NAMES[new Date().getMonth()]} {new Date().getDate()}, {new Date().getFullYear()}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Storage</span><span className="text-white">Local</span></div>
        </div>
      </div>
    </div>
  );
}
