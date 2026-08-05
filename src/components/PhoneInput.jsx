import { COUNTRIES } from '../data/constants';

function parsePhone(value) {
  if (!value) return { code: '+91', local: '' };
  const match = COUNTRIES.find(c => value.startsWith(c.code));
  if (match) return { code: match.code, local: value.slice(match.code.length) };
  return { code: '+91', local: value };
}

export function PhoneInput({ value = '', onChange, required, placeholder = 'Phone number' }) {
  const { code, local } = parsePhone(value);
  return (
    <div className="flex w-full rounded bg-dark-700 border border-white/[0.03] focus-within:border-white/10 focus-within:ring-1 focus-within:ring-amber-500/50">
      <select
        value={code}
        onChange={e => onChange(e.target.value + local)}
        aria-label="Country code"
        className="px-2 py-2 min-h-[44px] bg-transparent text-white text-sm focus:outline-none border-r border-white/[0.03]"
      >
        {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label} {c.code}</option>)}
      </select>
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
