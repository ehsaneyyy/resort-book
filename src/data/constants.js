export const BOOKING_STATUSES = ['Pending', 'Confirmed', 'Checked Out', 'Cancelled'];
export const PAYMENT_STATUSES = ['Pending', 'Paid', 'Refunded'];
export const SOURCES = ['Direct', 'Phone', 'Website', 'Booking.com', 'Walk-in', 'WhatsApp'];
export const ROOM_TYPES = ['Standard', 'Deluxe', 'Suite', 'Premium Suite', 'Villa'];
export const ID_TYPES = ['Aadhaar', 'PAN', 'Passport', 'Driving License'];
export const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const CURRENCIES = [
  { symbol: '\u20B9', label: 'Indian Rupee (INR)' },
  { symbol: '$', label: 'US Dollar (USD)' },
  { symbol: '\u20AC', label: 'Euro (EUR)' },
  { symbol: '\u00A3', label: 'British Pound (GBP)' },
  { symbol: '\u00A5', label: 'Yen (JPY/CNY)' },
  { symbol: 'A$', label: 'Australian Dollar (AUD)' },
  { symbol: '\u20BD', label: 'Russian Ruble (RUB)' },
  { symbol: '\u20A9', label: 'South Korean Won (KRW)' },
  { symbol: 'R$', label: 'Brazilian Real (BRL)' },
  { symbol: '\u20BA', label: 'Turkish Lira (TRY)' },
  { symbol: '\u20A6', label: 'Nigerian Naira (NGN)' },
  { symbol: 'R', label: 'South African Rand (ZAR)' },
  { symbol: 'S$', label: 'Singapore Dollar (SGD)' },
  { symbol: 'RM', label: 'Malaysian Ringgit (MYR)' },
  { symbol: '\u20B1', label: 'Philippine Peso (PHP)' },
  { symbol: '\uFDFC', label: 'Saudi Riyal (SAR)' },
];
export const PHONE_REGEX = /^\+?[\d\s\-()]{7,15}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const COUNTRIES = [
  { code: '+91', label: 'India' },
  { code: '+1', label: 'US / Canada' },
  { code: '+44', label: 'United Kingdom' },
  { code: '+971', label: 'UAE' },
  { code: '+966', label: 'Saudi Arabia' },
  { code: '+974', label: 'Qatar' },
  { code: '+968', label: 'Oman' },
  { code: '+965', label: 'Kuwait' },
  { code: '+973', label: 'Bahrain' },
  { code: '+65', label: 'Singapore' },
  { code: '+60', label: 'Malaysia' },
  { code: '+66', label: 'Thailand' },
  { code: '+61', label: 'Australia' },
  { code: '+49', label: 'Germany' },
  { code: '+33', label: 'France' },
  { code: '+960', label: 'Maldives' },
  { code: '+94', label: 'Sri Lanka' },
  { code: '+977', label: 'Nepal' },
  { code: '+880', label: 'Bangladesh' },
  { code: '+81', label: 'Japan' },
];
