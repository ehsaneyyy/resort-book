export function safeString(val, fallback = '\u2014') {
  if (val === null || val === undefined) return fallback;
  return String(val);
}

export function formatCurrency(n, symbol) {
  return (symbol || '\u20B9') + n.toLocaleString('en-IN');
}

function pad(n) { return String(n).padStart(2, '0'); }

export function formatDate(d) {
  const dt = new Date(d + 'T00:00:00');
  return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`;
}

export function today() {
  return new Date().toISOString().split('T')[0];
}

function nightBase(room, d) {
  return (d.getDay() === 5 || d.getDay() === 6) && room.weekendPrice ? room.weekendPrice : room.price;
}

export function nightPrice(room, checkIn, nights) {
  let total = 0;
  for (let i = 0; i < nights; i++) {
    const d = new Date(checkIn + 'T00:00:00');
    d.setDate(d.getDate() + i);
    total += nightBase(room, d);
  }
  return total;
}

function ymd(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function seasonalAdjustment(room, d, rules) {
  let adjustment = 0;
  for (const rule of rules) {
    if (!rule.isActive) continue;
    if (rule.roomTypes?.length && !rule.roomTypes.includes(room.type)) continue;
    if (rule.startDate <= ymd(d) && ymd(d) <= rule.endDate) adjustment += Number(rule.adjustment) || 0;
  }
  return adjustment;
}

export function computeBookingTotal(room, checkIn, nights, taxRate, seasonal = []) {
  let base = 0;
  for (let i = 0; i < nights; i++) {
    const d = new Date(checkIn + 'T00:00:00');
    d.setDate(d.getDate() + i);
    base += nightBase(room, d) * (1 + seasonalAdjustment(room, d, seasonal) / 100);
  }
  return Math.round(base * (1 + (Number(taxRate) || 0) / 100));
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
