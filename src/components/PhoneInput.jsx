import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { COUNTRIES } from '../data/constants';

function parsePhone(value) {
  if (!value) return { code: '+91', local: '' };
  const match = COUNTRIES.find(c => value.startsWith(c.code));
  if (match) return { code: match.code, local: value.slice(match.code.length) };
  return { code: '+91', local: value };
}

export function PhoneInput({ value = '', onChange, required, placeholder = 'Phone number' }) {
  const { code, local } = parsePhone(value);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="flex w-full rounded bg-dark-700 border border-white/[0.03] focus-within:border-white/10 focus-within:ring-1 focus-within:ring-amber-500/50">
      <div ref={wrapRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex items-center gap-1 px-2 py-2 min-h-[44px] bg-transparent text-white text-sm focus:outline-none border-r border-white/[0.03]"
        >
          {code}
          <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div role="listbox" className="absolute z-50 top-full left-0 mt-1 min-w-[190px] max-h-64 overflow-auto bg-dark-800 border border-white/[0.05] rounded-lg shadow-xl shadow-black/40 py-1">
            {COUNTRIES.map(c => {
              const active = c.code === code;
              return (
                <button
                  key={c.code}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => { onChange(c.code + local); setOpen(false); }}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-left text-sm whitespace-nowrap transition-colors ${active ? 'text-amber-400 bg-amber-500/10' : 'text-white hover:bg-dark-600'}`}
                >
                  <span>{c.label} <span className="text-slate-500">{c.code}</span></span>
                  {active && <Check className="w-4 h-4 shrink-0 text-amber-400" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <input
        type="tel"
        required={required}
        value={local}
        onChange={e => onChange(code + e.target.value.replace(/\D/g, ''))}
        placeholder={placeholder}
        className="w-full min-h-[44px] bg-transparent px-3 text-white text-sm focus:outline-none"
      />
    </div>
  );
}
