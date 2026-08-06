import { ChangePasswordForm } from '../components/ChangePasswordForm';
import { ShieldCheck } from 'lucide-react';

export function ChangePassword({ onDone }) {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
            <ShieldCheck className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-xl font-semibold text-white">Set your admin password</h1>
          <p className="text-sm text-slate-500 mt-1 text-center">You're signed in with the bootstrap password. Choose a new one to continue.</p>
        </div>
        <div className="bg-dark-800 border border-white/[0.02] rounded-lg p-6">
          <ChangePasswordForm onSuccess={onDone} />
        </div>
      </div>
    </div>
  );
}
