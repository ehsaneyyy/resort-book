import { useState } from 'react';
import { useLogin } from '../api/hooks';
import { useToast } from '../components/useToast';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export function Login({ onLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useLogin();
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Enter your email and password');
      return;
    }
    login.mutate({ email, password }, {
      onSuccess: () => {
        toast('Welcome back', 'success');
        onLoggedIn?.();
      },
      onError: (err) => {
        const status = err?.response?.status;
        if (status === 503) setError('Admin credentials are not configured on the server');
        else if (status === 401) setError('Invalid email or password');
        else setError('Could not reach the server');
      },
    });
  };

  const inputClass = 'w-full pl-9 pr-3 py-2 min-h-[44px] bg-dark-700 border border-white/[0.03] rounded text-white text-sm focus:outline-none focus:border-white/10 focus-visible:ring-1 focus-visible:ring-amber-500/50 placeholder:text-slate-600';

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
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Email</span>
            <div className="relative mt-2">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="you@yourresort.com"
                autoComplete="username"
                autoFocus
                className={inputClass}
              />
            </div>
          </label>
          <label className="block">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Password</span>
            <div className="relative mt-2">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                autoComplete="current-password"
                className={inputClass}
              />
            </div>
          </label>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" disabled={login.isPending} className="w-full min-h-[44px] bg-amber-500 hover:bg-amber-400 text-dark-900 text-sm font-semibold rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
            {login.isPending ? 'Signing in...' : 'Sign in'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
