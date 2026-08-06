import { useState } from 'react';
import { useChangePassword } from '../api/hooks';
import { useToast } from './useToast';
import { Lock } from 'lucide-react';

export function ChangePasswordForm({ onSuccess }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const change = useChangePassword();
  const toast = useToast();

  const inputClass = 'w-full px-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (next.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (next !== confirm) { setError('Passwords do not match'); return; }
    change.mutate({ currentPassword: current, newPassword: next }, {
      onSuccess: () => {
        toast('Password updated', 'success');
        onSuccess?.();
      },
      onError: (err) => {
        const status = err?.response?.status;
        if (status === 401) setError('Current password is incorrect');
        else if (status === 400) setError('New password must be different from current');
        else setError('Could not update password');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Current Password</label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="password" value={current} onChange={e => setCurrent(e.target.value)} placeholder="Current password" className={`${inputClass} pl-9`} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">New Password</label>
        <input type="password" value={next} onChange={e => setNext(e.target.value)} placeholder="At least 8 characters" className={inputClass} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-[1.5px] mb-1.5">Confirm New Password</label>
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat new password" className={inputClass} />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button type="submit" className="w-full min-h-[44px] bg-amber-500 hover:bg-amber-400 text-dark-900 text-sm font-semibold rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50" disabled={change.isPending}>
        {change.isPending ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
}
