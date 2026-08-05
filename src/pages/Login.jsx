import { useState } from 'react';
import { setToken } from '../api/client';
import { useToast } from '../components/Toast';
import { KeyRound, ArrowRight } from 'lucide-react';

export function Login() {
  const [token, setTokenInput] = useState('');
  const [error, setError] = useState('');
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = token.trim();
    if (!value) {
      setError('Enter the admin key to continue');
      return;
    }
    setToken(value);
    toast('Welcome back', 'success');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img src="/favicon.svg" alt="DoGuest" className="w-14 h-14 mb-4" />
          <h1 className="text-xl font-semibold text-white">DoGuest</h1>
          <p className="text-sm text-slate-500 mt-1">Your resort, one screen.</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-dark-800 border border-white/[0.02] rounded-lg p-6 space-y-4">
          <label className="block">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Admin key</span>
            <div className="relative mt-2">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={token}
                onChange={(e) => { setTokenInput(e.target.value); setError(''); }}
                placeholder="••••••••"
                autoFocus
                className="w-full pl-9 pr-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50 placeholder:text-slate-600"
              />
            </div>
          </label>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" className="w-full min-h-[44px] bg-amber-500 hover:bg-amber-400 text-dark-900 text-sm font-semibold rounded flex items-center justify-center gap-2 transition-colors">
            Enter <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
