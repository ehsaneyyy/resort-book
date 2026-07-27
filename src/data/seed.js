const ROOMS = [
  { id: "STD-001", name: "Standard Double", type: "Standard", floor: 1, price: 3500, weekendPrice: 4000, capacity: 2, beds: "1 Queen Bed", size: 280, status: "available", amenities: ["AC", "WiFi", "TV", "Hot Water", "Desk"], description: "Cozy room with queen bed, perfect for couples." },
  { id: "DLX-001", name: "Deluxe Double", type: "Deluxe", floor: 2, price: 5500, weekendPrice: 6500, capacity: 4, beds: "1 King Bed", size: 380, status: "available", amenities: ["AC", "WiFi", "TV", "Balcony", "Mini Bar", "Desk"], description: "Spacious deluxe room with king bed and private balcony." },
  { id: "DLX-002", name: "Deluxe Sea View", type: "Deluxe", floor: 2, price: 6500, weekendPrice: 7500, capacity: 3, beds: "1 King Bed", size: 400, status: "available", amenities: ["AC", "WiFi", "TV", "Balcony", "Mini Bar", "Sea View"], description: "Deluxe room with stunning sea views." },
  { id: "SUT-001", name: "Premium Suite", type: "Suite", floor: 3, price: 7500, weekendPrice: 9000, capacity: 4, beds: "1 King Bed", size: 520, status: "available", amenities: ["AC", "WiFi", "TV", "Balcony", "Mini Bar", "Hot Tub", "Sitting Area"], description: "Luxurious suite with separate living area." },
  { id: "SUT-002", name: "Executive Suite", type: "Premium Suite", floor: 3, price: 9500, weekendPrice: 11000, capacity: 4, beds: "1 King Bed", size: 650, status: "available", amenities: ["AC", "WiFi", "TV", "Balcony", "Mini Bar", "Jacuzzi", "Sitting Area", "Dining"], description: "Ultra-luxurious suite with private jacuzzi." },
  { id: "VIL-001", name: "Beachfront Villa", type: "Villa", floor: 0, price: 11000, weekendPrice: 13000, capacity: 6, beds: "2 King Beds", size: 900, status: "available", amenities: ["AC", "WiFi", "Pool Access", "Kitchen", "2 Bedrooms", "Living Room", "Patio"], description: "Spacious 2-bedroom villa with beachfront access." },
];

const GUESTS = [
  { id: "G001", name: "Rajesh Kumar", email: "rajesh.kumar@email.com", phone: "9876543210", city: "Mumbai", totalBookings: 3, totalSpent: 34650, lastStay: "2026-08-15", vip: true, notes: "Prefers sea-facing rooms. Anniversary guest." },
  { id: "G002", name: "Priya Sharma", email: "priya.sharma@email.com", phone: "9876543211", city: "Bangalore", totalBookings: 2, totalSpent: 15750, lastStay: "2026-08-18", vip: false, notes: "" },
  { id: "G003", name: "Amit Patel", email: "amit.patel@email.com", phone: "9876543212", city: "Delhi", totalBookings: 5, totalSpent: 89200, lastStay: "2026-08-22", vip: true, notes: "Corporate guest. Always books villas." },
  { id: "G004", name: "Neha Singh", email: "neha.singh@email.com", phone: "9876543213", city: "Pune", totalBookings: 1, totalSpent: 11550, lastStay: "2026-08-28", vip: false, notes: "" },
  { id: "G005", name: "Vikram Bhat", email: "vikram.bhat@email.com", phone: "9876543214", city: "Chennai", totalBookings: 4, totalSpent: 52800, lastStay: "2026-09-01", vip: true, notes: "Loyal customer since 2024." },
  { id: "G006", name: "Anjali Gupta", email: "anjali.gupta@email.com", phone: "9876543215", city: "Kolkata", totalBookings: 2, totalSpent: 29925, lastStay: "2026-09-05", vip: false, notes: "Requested early check-in last time." },
  { id: "G007", name: "Sarah Williams", email: "sarah.w@email.com", phone: "+44 7700 123456", city: "London, UK", totalBookings: 1, totalSpent: 15000, lastStay: "2026-07-20", vip: false, notes: "International guest. Needs airport transfer." },
  { id: "G008", name: "Deepa Menon", email: "deepa.m@email.com", phone: "9876543216", city: "Kochi", totalBookings: 6, totalSpent: 78400, lastStay: "2026-07-15", vip: true, notes: "Longest staying guest." },
];

const BOOKINGS = [
  { id: "RB001", guestId: "G001", roomId: "DLX-001", checkIn: "2026-08-15", checkOut: "2026-08-17", nights: 2, adults: 2, children: 0, total: 11550, status: "Confirmed", paymentStatus: "Pending", paymentMethod: "Pay at Hotel", source: "Direct", specialRequests: "Late check-in please", createdAt: "2026-07-20" },
  { id: "RB002", guestId: "G002", roomId: "SUT-001", checkIn: "2026-08-18", checkOut: "2026-08-20", nights: 2, adults: 2, children: 0, total: 15750, status: "Confirmed", paymentStatus: "Paid", paymentMethod: "Online", source: "Website", specialRequests: "", createdAt: "2026-07-18" },
  { id: "RB003", guestId: "G003", roomId: "VIL-001", checkIn: "2026-08-22", checkOut: "2026-08-25", nights: 3, adults: 4, children: 1, total: 34650, status: "Confirmed", paymentStatus: "Paid", paymentMethod: "Online", source: "Direct", specialRequests: "Need extra towels", createdAt: "2026-07-15" },
  { id: "RB004", guestId: "G004", roomId: "DLX-001", checkIn: "2026-08-28", checkOut: "2026-08-30", nights: 2, adults: 2, children: 0, total: 11550, status: "Pending", paymentStatus: "Pending", paymentMethod: "Pay at Hotel", source: "Phone", specialRequests: "Anniversary celebration", createdAt: "2026-07-22" },
  { id: "RB005", guestId: "G005", roomId: "STD-001", checkIn: "2026-09-01", checkOut: "2026-09-03", nights: 2, adults: 2, children: 0, total: 7350, status: "Confirmed", paymentStatus: "Paid", paymentMethod: "Online", source: "Website", specialRequests: "", createdAt: "2026-07-10" },
  { id: "RB006", guestId: "G006", roomId: "SUT-002", checkIn: "2026-09-05", checkOut: "2026-09-08", nights: 3, adults: 2, children: 1, total: 29925, status: "Cancelled", paymentStatus: "Refunded", paymentMethod: "Online", source: "Website", specialRequests: "Early check-in", createdAt: "2026-07-05" },
  { id: "RB007", guestId: "G007", roomId: "SUT-001", checkIn: "2026-07-20", checkOut: "2026-07-23", nights: 3, adults: 2, children: 0, total: 22500, status: "Checked Out", paymentStatus: "Paid", paymentMethod: "Online", source: "Booking.com", specialRequests: "Airport transfer", createdAt: "2026-06-25" },
  { id: "RB008", guestId: "G008", roomId: "VIL-001", checkIn: "2026-07-15", checkOut: "2026-07-18", nights: 3, adults: 3, children: 0, total: 33000, status: "Checked Out", paymentStatus: "Paid", paymentMethod: "Cash", source: "Direct", specialRequests: "", createdAt: "2026-06-20" },
  { id: "RB009", guestId: "G001", roomId: "SUT-002", checkIn: "2026-06-10", checkOut: "2026-06-12", nights: 2, adults: 2, children: 0, total: 19000, status: "Checked Out", paymentStatus: "Paid", paymentMethod: "Online", source: "Direct", specialRequests: "", createdAt: "2026-05-28" },
  { id: "RB010", guestId: "G003", roomId: "VIL-001", checkIn: "2026-05-20", checkOut: "2026-05-24", nights: 4, adults: 5, children: 1, total: 44000, status: "Checked Out", paymentStatus: "Paid", paymentMethod: "Online", source: "Direct", specialRequests: "Conference setup", createdAt: "2026-05-01" },
];

const SEASONAL = [
  { id: "SP001", name: "Peak Season", startDate: "2026-03-01", endDate: "2026-06-30", adjustment: 30, type: "percentage", roomTypes: [], isActive: true },
  { id: "SP002", name: "Festive Season", startDate: "2026-10-15", endDate: "2026-12-31", adjustment: 20, type: "percentage", roomTypes: [], isActive: true },
  { id: "SP003", name: "Monsoon Discount", startDate: "2026-06-15", endDate: "2026-09-30", adjustment: -15, type: "percentage", roomTypes: [], isActive: true },
  { id: "SP004", name: "Weekend Premium", startDate: "2026-01-01", endDate: "2026-12-31", adjustment: 15, type: "percentage", roomTypes: [], isActive: true },
];

const RESORT = {
  name: "Coastal Haven Resort",
  tagline: "Where the Ocean Meets Luxury",
  phone: "+91 98765 43210",
  email: "info@coastalhaven.com",
  address: "123, Coastal Road, Palolem, South Goa 403702",
  checkInTime: "14:00",
  checkOutTime: "11:00",
  taxRate: 5,
  totalRooms: 6,
};

export { ROOMS, GUESTS, BOOKINGS, SEASONAL, RESORT };
