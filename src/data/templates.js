import { formatCurrency } from './utils';

function encode(t) { return encodeURIComponent(t); }

export function whatsappLink(phone, message) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return '#';
  const full = digits.length === 10 ? '91' + digits : digits;
  return `https://wa.me/${full}?text=${encode(message)}`;
}

export function confirmationMsg(booking, guest, room, resort) {
  const lines = [
    `Hi ${guest?.name || 'Guest'}! Your booking at ${room?.name || 'the resort'} is confirmed.`,
    ``,
    `📅 ${booking.checkIn} → ${booking.checkOut} (${booking.nights} night${booking.nights > 1 ? 's' : ''})`,
    `💰 Total: ${formatCurrency(booking.total)}`,
    `🕑 Check-in: ${resort?.checkInTime || '2PM'} · Check-out: ${resort?.checkOutTime || '11AM'}`,
  ];
  if (resort?.address) lines.push(`📍 ${resort.address}`);
  lines.push(``, `Need anything? Reply here or call ${resort?.phone || 'the resort'}.`);
  return lines.join('\n');
}

export function preArrivalMsg(booking, guest, room, resort) {
  const lines = [
    `Hi ${guest?.name || 'Guest'}! See you tomorrow at ${resort?.name || 'the resort'} 😊`,
    ``,
    `A few things:`,
    `• Check-in is at ${resort?.checkInTime || '2PM'}`,
    `• Let us know your expected arrival time`,
    `• Need pickup from the airport/station? We can arrange.`,
    `• WiFi is complimentary`,
    ``,
    `Travel safe! 🛬`,
  ];
  return lines.join('\n');
}

export function postStayMsg(guest, resort) {
  const lines = [
    `Hi ${guest?.name || 'Guest'}! Hope you enjoyed your stay at ${resort?.name || 'the resort'} 🏡`,
    ``,
    `We'd love to hear your feedback. If you had a good time, a Google review would mean the world to us 🌟`,
    ``,
    `Come back soon! 🌴`,
  ];
  return lines.join('\n');
}
