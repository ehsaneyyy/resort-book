const ADMIN_RESORT = {
  name: "Coastal Haven Resort",
  tagline: "Where the Ocean Meets Luxury",
  phone: "+91 98765 43210",
  email: "info@coastalhaven.com",
  address: "123, Coastal Road, Palolem, South Goa 403702",
  checkInTime: "14:00",
  checkOutTime: "11:00",
  taxRate: 5,
  currency: "INR",
  timezone: "Asia/Kolkata",
  totalRooms: 6,
  establishedYear: 2018,
};

const ADMIN_ROOMS = [
  {
    id: "STD-001",
    name: "Standard Double",
    type: "Standard",
    floor: 1,
    price: 3500,
    weekendPrice: 4000,
    capacity: 2,
    beds: "1 Queen Bed",
    size: 280,
    status: "available",
    amenities: ["AC", "WiFi", "TV", "Hot Water", "Desk"],
    description: "Cozy room with queen bed, perfect for couples seeking a comfortable and affordable stay.",

  },
  {
    id: "DLX-001",
    name: "Deluxe Double",
    type: "Deluxe",
    floor: 2,
    price: 5500,
    weekendPrice: 6500,
    capacity: 4,
    beds: "1 King Bed",
    size: 380,
    status: "available",
    amenities: ["AC", "WiFi", "TV", "Balcony", "Mini Bar", "Desk"],
    description: "Spacious deluxe room with king bed and private balcony overlooking the tropical gardens.",

  },
  {
    id: "DLX-002",
    name: "Deluxe Sea View",
    type: "Deluxe",
    floor: 2,
    price: 6500,
    weekendPrice: 7500,
    capacity: 3,
    beds: "1 King Bed",
    size: 400,
    status: "available",
    amenities: ["AC", "WiFi", "TV", "Balcony", "Mini Bar", "Sea View"],
    description: "Deluxe room with stunning sea views and modern amenities.",

  },
  {
    id: "SUT-001",
    name: "Premium Suite",
    type: "Suite",
    floor: 3,
    price: 7500,
    weekendPrice: 9000,
    capacity: 4,
    beds: "1 King Bed",
    size: 520,
    status: "available",
    amenities: ["AC", "WiFi", "TV", "Balcony", "Mini Bar", "Hot Tub", "Sitting Area"],
    description: "Luxurious suite with separate living area, premium furnishings, and stunning views.",

  },
  {
    id: "SUT-002",
    name: "Executive Suite",
    type: "Premium Suite",
    floor: 3,
    price: 9500,
    weekendPrice: 11000,
    capacity: 4,
    beds: "1 King Bed",
    size: 650,
    status: "available",
    amenities: ["AC", "WiFi", "TV", "Balcony", "Mini Bar", "Jacuzzi", "Sitting Area", "Dining"],
    description: "Ultra-luxurious suite with premium amenities, private jacuzzi, and panoramic views.",

  },
  {
    id: "VIL-001",
    name: "Beachfront Villa",
    type: "Villa",
    floor: 0,
    price: 11000,
    weekendPrice: 13000,
    capacity: 6,
    beds: "2 King Beds",
    size: 900,
    status: "available",
    amenities: ["AC", "WiFi", "Pool Access", "Kitchen", "2 Bedrooms", "Living Room", "Patio"],
    description: "Spacious 2-bedroom villa with direct beachfront access and private patio.",

  },
];

const ADMIN_GUESTS = [
  { id: "G001", name: "Rajesh Kumar", email: "rajesh.kumar@email.com", phone: "9876543210", city: "Mumbai", totalBookings: 3, totalSpent: 34650, lastVisit: "2026-08-15", vip: true, notes: "Prefers sea-facing rooms. Anniversary guest." },
  { id: "G002", name: "Priya Sharma", email: "priya.sharma@email.com", phone: "9876543211", city: "Bangalore", totalBookings: 2, totalSpent: 15750, lastVisit: "2026-08-18", vip: false, notes: "" },
  { id: "G003", name: "Amit Patel", email: "amit.patel@email.com", phone: "9876543212", city: "Delhi", totalBookings: 5, totalSpent: 89200, lastVisit: "2026-08-22", vip: true, notes: "Corporate guest. Always books villas." },
  { id: "G004", name: "Neha Singh", email: "neha.singh@email.com", phone: "9876543213", city: "Pune", totalBookings: 1, totalSpent: 11550, lastVisit: "2026-08-28", vip: false, notes: "" },
  { id: "G005", name: "Vikram Bhat", email: "vikram.bhat@email.com", phone: "9876543214", city: "Chennai", totalBookings: 4, totalSpent: 52800, lastVisit: "2026-09-01", vip: true, notes: "Loyal customer since 2024." },
  { id: "G006", name: "Anjali Gupta", email: "anjali.gupta@email.com", phone: "9876543215", city: "Kolkata", totalBookings: 2, totalSpent: 29925, lastVisit: "2026-09-05", vip: false, notes: "Requested early check-in last time." },
  { id: "G007", name: "Sarah Williams", email: "sarah.w@email.com", phone: "+44 7700 123456", city: "London, UK", totalBookings: 1, totalSpent: 15000, lastVisit: "2026-07-20", vip: false, notes: "International guest. Needs airport transfer." },
  { id: "G008", name: "Deepa Menon", email: "deepa.m@email.com", phone: "9876543216", city: "Kochi", totalBookings: 6, totalSpent: 78400, lastVisit: "2026-07-15", vip: true, notes: "Longest staying guest. loves the heritage bungalow." },
];

const ADMIN_BOOKINGS = [
  { id: "RB001", guestId: "G001", roomId: "DLX-001", checkIn: "2026-08-15", checkOut: "2026-08-17", nights: 2, adults: 2, children: 0, total: 11550, status: "Confirmed", paymentStatus: "Pending", paymentMethod: "Pay at Hotel", source: "Direct", specialRequests: "Late check-in please", createdAt: "2026-07-20" },
  { id: "RB002", guestId: "G002", roomId: "SUT-001", checkIn: "2026-08-18", checkOut: "2026-08-20", nights: 2, adults: 2, children: 0, total: 15750, status: "Confirmed", paymentStatus: "Paid", paymentMethod: "Online", source: "Website", specialRequests: "", createdAt: "2026-07-18" },
  { id: "RB003", guestId: "G003", roomId: "VIL-001", checkIn: "2026-08-22", checkOut: "2026-08-25", nights: 3, adults: 4, children: 1, total: 34650, status: "Confirmed", paymentStatus: "Paid", paymentMethod: "Online", source: "Direct", specialRequests: "Need extra towels and pillows", createdAt: "2026-07-15" },
  { id: "RB004", guestId: "G004", roomId: "DLX-001", checkIn: "2026-08-28", checkOut: "2026-08-30", nights: 2, adults: 2, children: 0, total: 11550, status: "Pending", paymentStatus: "Pending", paymentMethod: "Pay at Hotel", source: "Phone", specialRequests: "Anniversary celebration", createdAt: "2026-07-22" },
  { id: "RB005", guestId: "G005", roomId: "STD-001", checkIn: "2026-09-01", checkOut: "2026-09-03", nights: 2, adults: 2, children: 0, total: 7350, status: "Confirmed", paymentStatus: "Paid", paymentMethod: "Online", source: "Website", specialRequests: "", createdAt: "2026-07-10" },
  { id: "RB006", guestId: "G006", roomId: "SUT-002", checkIn: "2026-09-05", checkOut: "2026-09-08", nights: 3, adults: 2, children: 1, total: 29925, status: "Cancelled", paymentStatus: "Refunded", paymentMethod: "Online", source: "Website", specialRequests: "Early check-in if possible", createdAt: "2026-07-05" },
  { id: "RB007", guestId: "G007", roomId: "SUT-001", checkIn: "2026-07-20", checkOut: "2026-07-23", nights: 3, adults: 2, children: 0, total: 22500, status: "Checked Out", paymentStatus: "Paid", paymentMethod: "Online", source: "Booking.com", specialRequests: "Airport transfer needed", createdAt: "2026-06-25" },
  { id: "RB008", guestId: "G008", roomId: "VIL-001", checkIn: "2026-07-15", checkOut: "2026-07-18", nights: 3, adults: 3, children: 0, total: 33000, status: "Checked Out", paymentStatus: "Paid", paymentMethod: "Cash", source: "Direct", specialRequests: "", createdAt: "2026-06-20" },
  { id: "RB009", guestId: "G001", roomId: "SUT-002", checkIn: "2026-06-10", checkOut: "2026-06-12", nights: 2, adults: 2, children: 0, total: 19000, status: "Checked Out", paymentStatus: "Paid", paymentMethod: "Online", source: "Direct", specialRequests: "", createdAt: "2026-05-28" },
  { id: "RB010", guestId: "G003", roomId: "VIL-001", checkIn: "2026-05-20", checkOut: "2026-05-24", nights: 4, adults: 5, children: 1, total: 44000, status: "Checked Out", paymentStatus: "Paid", paymentMethod: "Online", source: "Direct", specialRequests: "Conference setup needed", createdAt: "2026-05-01" },
];

const SEASONAL_PRICING = [
  { id: "SP001", name: "Peak Season", months: ["Dec", "Jan"], multiplier: 1.5, active: true },
  { id: "SP002", name: "Holiday Season", months: ["Nov"], multiplier: 1.3, active: true },
  { id: "SP003", name: "Monsoon Offer", months: ["Jun", "Jul", "Aug", "Sep"], multiplier: 0.8, active: true },
  { id: "SP004", name: "Weekend Premium", days: ["Fri", "Sat"], multiplier: 1.2, active: true },
];

function getAdminData(key, fallback) {
  const stored = localStorage.getItem("resortbook_" + key);
  if (stored) return JSON.parse(stored);
  localStorage.setItem("resortbook_" + key, JSON.stringify(fallback));
  return JSON.parse(JSON.stringify(fallback));
}

function saveAdminData(key, data) {
  localStorage.setItem("resortbook_" + key, JSON.stringify(data));
}

function getAdminBookings() { return getAdminData("admin_bookings", ADMIN_BOOKINGS); }
function getAdminRooms() { return getAdminData("admin_rooms", ADMIN_ROOMS); }
function getAdminGuests() { return getAdminData("admin_guests", ADMIN_GUESTS); }
function getResortSettings() { return getAdminData("resort_settings", ADMIN_RESORT); }
function getSeasonalPricing() { return getAdminData("seasonal_pricing", SEASONAL_PRICING); }

function getGuestById(id) { return getAdminGuests().find(g => g.id === id); }
function getRoomById(id) { return getAdminRooms().find(r => r.id === id); }
function getBookingById(id) { return getAdminBookings().find(b => b.id === id); }

function formatCurrency(n) { return "\u20B9" + n.toLocaleString("en-IN"); }
function formatDate(d) { return new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
function formatDateFull(d) { return new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); }
function daysBetween(a, b) { return Math.ceil((new Date(b) - new Date(a)) / 864e5); }
function today() { return new Date().toISOString().split("T")[0]; }

function showToast(message, type) {
  const existing = document.getElementById("admin-toast");
  if (existing) existing.remove();
  const colors = { success: "bg-emerald-500", error: "bg-red-500", info: "bg-blue-500", warning: "bg-yellow-500" };
  const icons = {
    success: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>',
    error: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>',
    info: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    warning: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01"/></svg>',
  };
  const toast = document.createElement("div");
  toast.id = "admin-toast";
  toast.className = `fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl ${colors[type] || colors.info} text-white shadow-2xl transform translate-x-full opacity-0 transition-all duration-300`;
  toast.innerHTML = `${icons[type] || icons.info}<span class="text-sm font-medium">${message}</span>`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.classList.remove("translate-x-full", "opacity-0"); toast.classList.add("translate-x-0", "opacity-100"); });
  setTimeout(() => { toast.classList.add("translate-x-full", "opacity-0"); setTimeout(() => toast.remove(), 300); }, 3000);
}
