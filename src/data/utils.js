export function formatCurrency(n) {
  return '\u20B9' + n.toLocaleString('en-IN');
}

export function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateFull(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function daysBetween(a, b) {
  return Math.ceil((new Date(b) - new Date(a)) / 864e5);
}

export function today() {
  return new Date().toISOString().split('T')[0];
}

export function statusColor(status) {
  switch (status) {
    case 'Confirmed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'Pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'Cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'Checked Out': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
}
