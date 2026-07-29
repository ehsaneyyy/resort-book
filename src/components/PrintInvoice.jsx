import { useEffect, useRef } from 'react';
import { formatCurrency, formatDate } from '../data/utils';

export function PrintInvoice({ booking, guest, room, resort, onClose }) {
  const printed = useRef(false);

  useEffect(() => {
    if (printed.current) return;
    printed.current = true;
    setTimeout(() => window.print(), 100);
  }, []);

  useEffect(() => {
    const after = () => onClose();
    window.addEventListener('afterprint', after);
    return () => window.removeEventListener('afterprint', after);
  }, [onClose]);

  const taxAmount = Math.round(booking.total * (resort.taxRate / (100 + resort.taxRate)));
  const subtotal = booking.total - taxAmount;
  const initials = resort.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="print-overlay fixed inset-0 z-[9999] bg-white overflow-auto" style={{ display: 'none' }}>
      <div className="max-w-lg mx-auto p-10 text-[#1a1a2e] font-sans">
        <div className="text-center mb-6 border-b-2 border-[#c9995a] pb-4">
          <div className="w-10 h-10 bg-[#c9995a] rounded mx-auto mb-1.5 flex items-center justify-center text-white text-sm font-bold">{initials}</div>
          <h1 className="text-base font-semibold mb-0.5">{resort.name}</h1>
          <p className="text-[11px] text-[#888]">{resort.address}</p>
          <p className="text-[11px] text-[#888]">{resort.phone} &middot; {resort.email}</p>
        </div>

        <div className="mb-4">
          <h3 className="text-[10px] uppercase tracking-[1.5px] text-[#999] mb-2 pb-1 border-b border-[#eee]">Booking</h3>
          <div className="flex justify-between py-0.5 text-[12px]"><span className="text-[#888]">ID</span><span className="font-medium">{booking.id}</span></div>
          <div className="flex justify-between py-0.5 text-[12px]"><span className="text-[#888]">Status</span><span className="font-medium">{booking.status}</span></div>
          <div className="flex justify-between py-0.5 text-[12px]"><span className="text-[#888]">Source</span><span className="font-medium">{booking.source}</span></div>
        </div>

        <div className="mb-4">
          <h3 className="text-[10px] uppercase tracking-[1.5px] text-[#999] mb-2 pb-1 border-b border-[#eee]">Guest</h3>
          <div className="flex justify-between py-0.5 text-[12px]"><span className="text-[#888]">Name</span><span className="font-medium">{guest?.name || 'N/A'}</span></div>
          <div className="flex justify-between py-0.5 text-[12px]"><span className="text-[#888]">Phone</span><span className="font-medium">{guest?.phone || 'N/A'}</span></div>
          <div className="flex justify-between py-0.5 text-[12px]"><span className="text-[#888]">Email</span><span className="font-medium">{guest?.email || 'N/A'}</span></div>
        </div>

        <div className="mb-4">
          <h3 className="text-[10px] uppercase tracking-[1.5px] text-[#999] mb-2 pb-1 border-b border-[#eee]">Stay</h3>
          <div className="flex justify-between py-0.5 text-[12px]"><span className="text-[#888]">Room</span><span className="font-medium">{room?.name || booking.roomId}</span></div>
          <div className="flex justify-between py-0.5 text-[12px]"><span className="text-[#888]">Check-in</span><span className="font-medium">{formatDate(booking.checkIn)} at {resort.checkInTime}</span></div>
          <div className="flex justify-between py-0.5 text-[12px]"><span className="text-[#888]">Check-out</span><span className="font-medium">{formatDate(booking.checkOut)} at {resort.checkOutTime}</span></div>
          <div className="flex justify-between py-0.5 text-[12px]"><span className="text-[#888]">Nights</span><span className="font-medium">{booking.nights}</span></div>
          <div className="flex justify-between py-0.5 text-[12px]"><span className="text-[#888]">Guests</span><span className="font-medium">{booking.adults}A{booking.children ? `, ${booking.children}C` : ''}</span></div>
        </div>

        <div className="mb-4">
          <h3 className="text-[10px] uppercase tracking-[1.5px] text-[#999] mb-2 pb-1 border-b border-[#eee]">Billing</h3>
          <div className="flex justify-between py-0.5 text-[12px]"><span className="text-[#888]">Room charges</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
          <div className="flex justify-between py-0.5 text-[12px]"><span className="text-[#888]">Tax ({resort.taxRate}%)</span><span className="font-medium">{formatCurrency(taxAmount)}</span></div>
          <div className="text-right text-sm font-semibold mt-3 pt-2.5 border-t-2 border-[#c9995a] text-[#c9995a]">Total: {formatCurrency(booking.total)}</div>
          <div className="flex justify-between py-0.5 text-[12px] mt-1"><span className="text-[#888]">Payment</span><span className="font-medium">{booking.paymentStatus} ({booking.paymentMethod})</span></div>
        </div>

        {booking.specialRequests && (
          <div className="mb-4">
            <h3 className="text-[10px] uppercase tracking-[1.5px] text-[#999] mb-2 pb-1 border-b border-[#eee]">Special Requests</h3>
            <p className="text-[12px] text-[#555]">{booking.specialRequests}</p>
          </div>
        )}

        <div className="text-center mt-6 pt-3 border-t border-[#eee] text-[10px] text-[#aaa]">
          <p>{resort.name} &middot; Generated {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
    </div>
  );
}
