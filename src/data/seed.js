const SEED_VERSION = 3;

function fmt(d) { return d.toISOString().split('T')[0]; }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
const now = new Date();
const today = fmt(now);

const ROOMS = [
  { id: "STD-001", name: "Standard Double", type: "Standard", floor: 1, price: 3500, weekendPrice: 4000, capacity: 2, beds: "1 Queen Bed", size: 280, status: "available", amenities: ["AC", "WiFi", "TV", "Hot Water", "Desk"], description: "Cozy room with queen bed, perfect for couples." },
  { id: "DLX-001", name: "Deluxe Double", type: "Deluxe", floor: 2, price: 5500, weekendPrice: 6500, capacity: 4, beds: "1 King Bed", size: 380, status: "available", amenities: ["AC", "WiFi", "TV", "Balcony", "Mini Bar", "Desk"], description: "Spacious deluxe room with king bed and private balcony." },
  { id: "DLX-002", name: "Deluxe Sea View", type: "Deluxe", floor: 2, price: 6500, weekendPrice: 7500, capacity: 3, beds: "1 King Bed", size: 400, status: "available", amenities: ["AC", "WiFi", "TV", "Balcony", "Mini Bar", "Sea View"], description: "Deluxe room with stunning sea views." },
  { id: "SUT-001", name: "Premium Suite", type: "Suite", floor: 3, price: 7500, weekendPrice: 9000, capacity: 4, beds: "1 King Bed", size: 520, status: "available", amenities: ["AC", "WiFi", "TV", "Balcony", "Mini Bar", "Hot Tub", "Sitting Area"], description: "Luxurious suite with separate living area." },
  { id: "SUT-002", name: "Executive Suite", type: "Premium Suite", floor: 3, price: 9500, weekendPrice: 11000, capacity: 4, beds: "1 King Bed", size: 650, status: "available", amenities: ["AC", "WiFi", "TV", "Balcony", "Mini Bar", "Jacuzzi", "Sitting Area", "Dining"], description: "Ultra-luxurious suite with private jacuzzi." },
  { id: "VIL-001", name: "Beachfront Villa", type: "Villa", floor: 0, price: 11000, weekendPrice: 13000, capacity: 6, beds: "2 King Beds", size: 900, status: "available", amenities: ["AC", "WiFi", "Pool Access", "Kitchen", "2 Bedrooms", "Living Room", "Patio"], description: "Spacious 2-bedroom villa with beachfront access." },
];

const GUESTS = [
  { id: "G001", name: "Demo Guest 1", email: "g1@demo.com", phone: "1111111111", city: "Demo City 1", totalBookings: 3, totalSpent: 34650, lastStay: today, vip: true, notes: "" },
  { id: "G002", name: "Demo Guest 2", email: "g2@demo.com", phone: "2222222222", city: "Demo City 2", totalBookings: 2, totalSpent: 15750, lastStay: fmt(addDays(now, -2)), vip: false, notes: "" },
  { id: "G003", name: "Demo Guest 3", email: "g3@demo.com", phone: "3333333333", city: "Demo City 3", totalBookings: 5, totalSpent: 89200, lastStay: fmt(addDays(now, -5)), vip: true, notes: "" },
  { id: "G004", name: "Demo Guest 4", email: "g4@demo.com", phone: "4444444444", city: "Demo City 4", totalBookings: 1, totalSpent: 11550, lastStay: fmt(addDays(now, 3)), vip: false, notes: "" },
  { id: "G005", name: "Demo Guest 5", email: "g5@demo.com", phone: "5555555555", city: "Demo City 5", totalBookings: 4, totalSpent: 52800, lastStay: fmt(addDays(now, 2)), vip: true, notes: "" },
  { id: "G006", name: "Demo Guest 6", email: "g6@demo.com", phone: "6666666666", city: "Demo City 6", totalBookings: 2, totalSpent: 29925, lastStay: fmt(addDays(now, -10)), vip: false, notes: "" },
  { id: "G007", name: "Demo Guest 7", email: "g7@demo.com", phone: "7777777777", city: "Demo City 7", totalBookings: 1, totalSpent: 15000, lastStay: fmt(addDays(now, 1)), vip: false, notes: "" },
  { id: "G008", name: "Demo Guest 8", email: "g8@demo.com", phone: "8888888888", city: "Demo City 8", totalBookings: 6, totalSpent: 78400, lastStay: fmt(addDays(now, -1)), vip: true, notes: "" },
];

const BOOKINGS = [
  { id: "RB001", guestId: "G001", roomId: "DLX-001", checkIn: today, checkOut: fmt(addDays(now, 2)), nights: 2, adults: 2, children: 0, total: 11550, status: "Confirmed", paymentStatus: "Pending", paymentMethod: "Pay at Hotel", source: "Direct", specialRequests: "Late check-in please", createdAt: fmt(addDays(now, -7)) },
  { id: "RB002", guestId: "G002", roomId: "SUT-001", checkIn: today, checkOut: fmt(addDays(now, 2)), nights: 2, adults: 2, children: 0, total: 15750, status: "Confirmed", paymentStatus: "Paid", paymentMethod: "Online", source: "Website", specialRequests: "", createdAt: fmt(addDays(now, -10)) },
  { id: "RB003", guestId: "G003", roomId: "VIL-001", checkIn: fmt(addDays(now, -2)), checkOut: fmt(addDays(now, 1)), nights: 3, adults: 4, children: 1, total: 34650, status: "Confirmed", paymentStatus: "Paid", paymentMethod: "Online", source: "Direct", specialRequests: "Need extra towels", createdAt: fmt(addDays(now, -14)) },
  { id: "RB004", guestId: "G004", roomId: "DLX-001", checkIn: fmt(addDays(now, 3)), checkOut: fmt(addDays(now, 5)), nights: 2, adults: 2, children: 0, total: 11550, status: "Pending", paymentStatus: "Pending", paymentMethod: "Pay at Hotel", source: "Phone", specialRequests: "Anniversary celebration", createdAt: fmt(addDays(now, -2)) },
  { id: "RB005", guestId: "G005", roomId: "STD-001", checkIn: fmt(addDays(now, 2)), checkOut: fmt(addDays(now, 4)), nights: 2, adults: 2, children: 0, total: 7350, status: "Confirmed", paymentStatus: "Paid", paymentMethod: "Online", source: "Website", specialRequests: "", createdAt: fmt(addDays(now, -5)) },
  { id: "RB006", guestId: "G006", roomId: "SUT-002", checkIn: fmt(addDays(now, 7)), checkOut: fmt(addDays(now, 10)), nights: 3, adults: 2, children: 1, total: 29925, status: "Cancelled", paymentStatus: "Refunded", paymentMethod: "Online", source: "Website", specialRequests: "Early check-in", createdAt: fmt(addDays(now, -20)) },
  { id: "RB007", guestId: "G007", roomId: "SUT-001", checkIn: fmt(addDays(now, 1)), checkOut: fmt(addDays(now, 4)), nights: 3, adults: 2, children: 0, total: 22500, status: "Confirmed", paymentStatus: "Paid", paymentMethod: "Online", source: "Booking.com", specialRequests: "Airport transfer", createdAt: fmt(addDays(now, -12)) },
  { id: "RB008", guestId: "G008", roomId: "VIL-001", checkIn: fmt(addDays(now, -3)), checkOut: today, nights: 3, adults: 3, children: 0, total: 33000, status: "Confirmed", paymentStatus: "Paid", paymentMethod: "Cash", source: "Direct", specialRequests: "", createdAt: fmt(addDays(now, -15)) },
  { id: "RB009", guestId: "G001", roomId: "SUT-002", checkIn: fmt(addDays(now, -20)), checkOut: fmt(addDays(now, -18)), nights: 2, adults: 2, children: 0, total: 19000, status: "Checked Out", paymentStatus: "Paid", paymentMethod: "Online", source: "Direct", specialRequests: "", createdAt: fmt(addDays(now, -30)) },
  { id: "RB010", guestId: "G003", roomId: "VIL-001", checkIn: fmt(addDays(now, -30)), checkOut: fmt(addDays(now, -26)), nights: 4, adults: 5, children: 1, total: 44000, status: "Checked Out", paymentStatus: "Paid", paymentMethod: "Online", source: "Direct", specialRequests: "Conference setup", createdAt: fmt(addDays(now, -40)) },
];

const SEASONAL = [
  { id: "SP001", name: "Peak Season", startDate: "2026-03-01", endDate: "2026-06-30", adjustment: 30, type: "percentage", roomTypes: [], isActive: true },
  { id: "SP002", name: "Festive Season", startDate: "2026-10-15", endDate: "2026-12-31", adjustment: 20, type: "percentage", roomTypes: [], isActive: true },
  { id: "SP003", name: "Monsoon Discount", startDate: "2026-06-15", endDate: "2026-09-30", adjustment: -15, type: "percentage", roomTypes: [], isActive: true },
  { id: "SP004", name: "Weekend Premium", startDate: "2026-01-01", endDate: "2026-12-31", adjustment: 15, type: "percentage", roomTypes: [], isActive: true },
];

const RESORT = {
  name: "resort-demo/admin",
  currency: "\u20B9",
  phone: "+91 11111 11111",
  whatsappPhone: "+919999999999",
  email: "resort@demo.com",
  address: "123, Demo Road, Demo City",
  checkInTime: "14:00",
  checkOutTime: "11:00",
  taxRate: 5,
  totalRooms: 6,
};

export { ROOMS, GUESTS, BOOKINGS, SEASONAL, RESORT, SEED_VERSION };
