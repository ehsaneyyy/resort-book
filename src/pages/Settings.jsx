import { useState, useRef } from 'react';
import { useResort, useUpdateResort, useRooms, useGuests, useBookings, useSeasonalRules, useStats } from '../api/hooks';
import { useToast } from '../components/useToast';
import { CURRENCIES, PHONE_REGEX, EMAIL_REGEX } from '../data/constants';
import { Building2, Globe, MessageCircle, Download, Check } from 'lucide-react';
import { Skeleton } from '../components/Skeleton';

const CURRENCY_OPTIONS = CURRENCIES;

const ICON_TONES = {
  amber: 'text-amber-400/80',
  emerald: 'text-emerald-400/80',
  sky: 'text-sky-400/80',
  slate: 'text-slate-500',
};

function SectionCard({ icon: Icon, title, tone = 'amber', children }) {
  return (
    <section className="bg-dark-800/50 rounded-lg border border-white/[0.02] overflow-hidden">
      <header className="px-5 py-3.5 border-b border-white/[0.02] flex items-center gap-2.5">
        <Icon className={`w-4 h-4 ${ICON_TONES[tone]}`} />
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-[2px]">{title}</h2>
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Settings() {
  const { data: resort, isLoading: resortLoading } = useResort();
  const { data: rooms = [], isLoading: roomsLoading } = useRooms();
  const { data: guests = [], isLoading: guestsLoading } = useGuests();
  const { data: bookings = [], isLoading: bookingsLoading } = useBookings();
  const { data: seasonal = [], isLoading: seasonalLoading } = useSeasonalRules();
  const { data: stats } = useStats();
  const updateResort = useUpdateResort();
  const toast = useToast();
  const [saved, setSaved] = useState(false);

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
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        toast('Settings saved', 'success');
      },
      onError: () => toast('Failed to save', 'error'),
    });
  };

  const backupLoading = resortLoading || roomsLoading || guestsLoading || bookingsLoading || seasonalLoading;

  const handleExport = () => {
    const slug = (resort?.name || 'resort').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const payload = { exportedAt: new Date().toISOString(), resort, rooms, guests, bookings, seasonal };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Backup downloaded', 'success');
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
      <SectionCard icon={Building2} title="Property Profile" tone="amber">
        <form onSubmit={saveResort} className="space-y-4">
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
          <div className="flex items-center justify-end gap-3 pt-2">
            {saved && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            )}
            {hasChanges && (
              <button type="submit" className="px-5 py-2 min-h-[44px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-medium rounded focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors">{updateResort.isPending ? 'Saving...' : 'Save Settings'}</button>
            )}
          </div>
        </form>
      </SectionCard>

      <SectionCard icon={MessageCircle} title="WhatsApp" tone="emerald">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Owner's WhatsApp Number</label>
          <input value={whatsappPhone} onChange={e => setWhatsappPhone(e.target.value)} className="w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50" placeholder="+9198XXXXXXXX" />
          <p className="text-xs text-slate-500 mt-1.5">This number appears in confirmation messages so guests can reach you on WhatsApp.</p>
        </div>
      </SectionCard>

      <SectionCard icon={Download} title="Data & Backup" tone="sky">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">Download all property data as a JSON backup.</p>
            <p className="text-xs text-slate-500 mt-1.5">Keep a copy somewhere safe — this is your manual backup.</p>
          </div>
          <button onClick={handleExport} disabled={backupLoading} className="px-4 py-2 min-h-[44px] bg-dark-700 hover:bg-dark-600 disabled:opacity-50 text-slate-400 text-xs font-medium rounded focus-visible:ring-1 focus-visible:ring-amber-500/50 transition-colors flex items-center gap-2 flex-shrink-0">
            <Download className="w-4 h-4" /> {backupLoading ? 'Loading...' : 'Export Backup'}
          </button>
        </div>
      </SectionCard>

      <SectionCard icon={Globe} title="System" tone="slate">
        <div className="space-y-3">
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
            <span className="text-sm text-white font-medium">API + Neon Postgres</span>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
