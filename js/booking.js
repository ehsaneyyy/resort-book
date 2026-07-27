function getStoredBookings() {
  const stored = localStorage.getItem("resortbook_bookings");
  if (stored) return JSON.parse(stored);
  localStorage.setItem("resortbook_bookings", JSON.stringify(SAMPLE_BOOKINGS));
  return [...SAMPLE_BOOKINGS];
}

function saveBookings(bookings) {
  localStorage.setItem("resortbook_bookings", JSON.stringify(bookings));
}

function addBooking(data) {
  const bookings = getStoredBookings();
  const id = "RB" + String(bookings.length + 1).padStart(3, "0");
  const room = ROOMS.find(r => r.id === data.room);
  const nights = Math.ceil((new Date(data.checkOut) - new Date(data.checkIn)) / 864e5);
  const subtotal = nights * room.pricePerNight;
  const tax = Math.round(subtotal * 0.05);

  const booking = {
    id,
    guestName: data.guestName,
    email: data.email,
    phone: data.phone,
    room: data.room,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    nights,
    guests: parseInt(data.guests),
    totalPrice: subtotal + tax,
    status: "Pending",
    specialRequests: data.specialRequests || "",
    createdDate: new Date().toISOString().split("T")[0],
  };

  bookings.push(booking);
  saveBookings(bookings);
  return booking;
}

function getBookingById(id) {
  return getStoredBookings().find(b => b.id === id);
}

function getRoomById(id) {
  return ROOMS.find(r => r.id === id);
}

function calculatePrice(roomId, checkIn, checkOut) {
  const room = getRoomById(roomId);
  if (!room || !checkIn || !checkOut) return null;
  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / 864e5);
  if (nights <= 0) return null;
  const subtotal = nights * room.pricePerNight;
  const tax = Math.round(subtotal * 0.05);
  return { nights, subtotal, tax, total: subtotal + tax, pricePerNight: room.pricePerNight };
}

function formatPrice(amount) {
  return "\u20B9" + amount.toLocaleString("en-IN");
}

function formatDateLong(d) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function showToast(message, type = "success") {
  const existing = document.getElementById("toast");
  if (existing) existing.remove();

  const colors = {
    success: "bg-emerald-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    warning: "bg-yellow-500",
  };

  const icons = {
    success: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>',
    error: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>',
    info: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    warning: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>',
  };

  const toast = document.createElement("div");
  toast.id = "toast";
  toast.className = `fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl ${colors[type]} text-white shadow-2xl transform translate-x-full opacity-0 transition-all duration-300`;
  toast.innerHTML = `${icons[type]}<span class="text-sm font-medium">${message}</span>`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove("translate-x-full", "opacity-0");
    toast.classList.add("translate-x-0", "opacity-100");
  });

  setTimeout(() => {
    toast.classList.add("translate-x-full", "opacity-0");
    toast.classList.remove("translate-x-0", "opacity-100");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
