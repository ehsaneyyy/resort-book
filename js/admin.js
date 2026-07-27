function renderAdminStats() {
  const bookings = getStoredBookings();
  const confirmed = bookings.filter(b => b.status === "Confirmed");
  const pending = bookings.filter(b => b.status === "Pending");
  const cancelled = bookings.filter(b => b.status === "Cancelled");
  const totalRevenue = confirmed.reduce((sum, b) => sum + b.totalPrice, 0);
  const occupancy = Math.min(100, Math.round((confirmed.length / 6) * 100));

  const stats = [
    { id: "stat-total", value: bookings.length, label: "Total Bookings", color: "text-white" },
    { id: "stat-confirmed", value: confirmed.length, label: "Confirmed", color: "text-emerald-400" },
    { id: "stat-pending", value: pending.length, label: "Pending", color: "text-yellow-400" },
    { id: "stat-cancelled", value: cancelled.length, label: "Cancelled", color: "text-red-400" },
    { id: "stat-revenue", value: formatPrice(totalRevenue), label: "Revenue", color: "text-amber-400" },
  ];

  stats.forEach(s => {
    const el = document.getElementById(s.id);
    if (el) {
      el.textContent = s.value;
      el.className = `text-2xl lg:text-3xl font-bold ${s.color}`;
    }
  });
}

function renderBookingsTable(filter) {
  const bookings = getStoredBookings();
  const filtered = filter && filter !== "all" ? bookings.filter(b => b.status === filter) : bookings;
  const tbody = document.getElementById("bookings-tbody");
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="py-16 text-center text-slate-500">
      <div class="flex flex-col items-center gap-3">
        <svg class="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
        <p>No ${filter !== "all" ? filter.toLowerCase() : ""} bookings found</p>
      </div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(b => {
    const room = getRoomById(b.room);
    const statusClass = b.status === "Confirmed" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
      b.status === "Pending" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
      "bg-red-500/20 text-red-400 border-red-500/30";

    return `<tr class="border-b border-slate-700/50 hover:bg-white/[0.02] transition-colors">
      <td class="py-4 px-4 lg:px-6">
        <div class="font-medium text-white">${b.guestName}</div>
        <div class="text-xs text-slate-500 mt-0.5">${b.email}</div>
      </td>
      <td class="py-4 px-4 lg:px-6">
        <div class="text-sm text-slate-300">${room ? room.name : b.room}</div>
      </td>
      <td class="py-4 px-4 lg:px-6 text-sm text-slate-300">${formatDateShort(b.checkIn)}</td>
      <td class="py-4 px-4 lg:px-6 text-sm text-slate-300">${formatDateShort(b.checkOut)}</td>
      <td class="py-4 px-4 lg:px-6 text-sm text-slate-300">${b.nights}N</td>
      <td class="py-4 px-4 lg:px-6 text-sm font-medium text-amber-400">${formatPrice(b.totalPrice)}</td>
      <td class="py-4 px-4 lg:px-6">
        <span class="inline-flex px-2.5 py-1 text-xs rounded-full font-medium border ${statusClass}">${b.status}</span>
      </td>
      <td class="py-4 px-4 lg:px-6">
        <div class="flex gap-2">
          ${b.status === "Pending" ? `
            <button onclick="updateStatus('${b.id}','Confirmed')" class="px-3 py-1.5 text-xs font-medium bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition border border-emerald-500/20">Confirm</button>
            <button onclick="updateStatus('${b.id}','Cancelled')" class="px-3 py-1.5 text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition border border-red-500/20">Cancel</button>
          ` : b.status === "Confirmed" ? `
            <button onclick="updateStatus('${b.id}','Cancelled')" class="px-3 py-1.5 text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition border border-red-500/20">Cancel</button>
          ` : `
            <button onclick="deleteBooking('${b.id}')" class="px-3 py-1.5 text-xs font-medium bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 rounded-lg transition border border-slate-500/20">Delete</button>
          `}
        </div>
      </td>
    </tr>`;
  }).join("");
}

function updateStatus(id, newStatus) {
  const bookings = getStoredBookings();
  const b = bookings.find(x => x.id === id);
  if (b) {
    b.status = newStatus;
    saveBookings(bookings);
    const currentFilter = document.querySelector("[data-filter].bg-white\\/10")?.dataset?.filter || "all";
    renderAdminStats();
    renderBookingsTable(currentFilter);
    showToast(`Booking ${newStatus.toLowerCase()} successfully`, newStatus === "Confirmed" ? "success" : "warning");
  }
}

function deleteBooking(id) {
  if (!confirm("Are you sure you want to delete this booking?")) return;
  let bookings = getStoredBookings();
  bookings = bookings.filter(x => x.id !== id);
  saveBookings(bookings);
  const currentFilter = document.querySelector("[data-filter].bg-white\\/10")?.dataset?.filter || "all";
  renderAdminStats();
  renderBookingsTable(currentFilter);
  showToast("Booking deleted", "info");
}

function filterBookings(filter) {
  document.querySelectorAll("[data-filter]").forEach(btn => {
    btn.classList.remove("bg-white/10", "text-white");
    btn.classList.add("text-slate-400", "hover:text-white");
  });
  const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
  if (activeBtn) {
    activeBtn.classList.add("bg-white/10", "text-white");
    activeBtn.classList.remove("text-slate-400", "hover:text-white");
  }
  renderBookingsTable(filter);
}
