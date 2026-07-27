function getAdminLayout(activePage) {
  const resort = getResortSettings();
  const pendingCount = getAdminBookings().filter(b => b.status === "Pending").length;

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>', href: "index.html" },
    { id: "rooms", label: "Rooms", icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>', href: "rooms.html" },
    { id: "bookings", label: "Bookings", icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>', href: "bookings.html", badge: pendingCount },
    { id: "guests", label: "Guests", icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>', href: "guests.html" },
    { id: "calendar", label: "Calendar", icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>', href: "calendar.html" },
    { id: "reports", label: "Reports", icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>', href: "reports.html" },
    { id: "pricing", label: "Pricing", icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>', href: "pricing.html" },
    { id: "settings", label: "Settings", icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>', href: "settings.html" },
  ];

  const sidebar = `
    <aside id="sidebar" class="fixed top-0 left-0 bottom-0 w-64 bg-dark-800 border-r border-white/5 z-40 transform -translate-x-full lg:translate-x-0 transition-transform">
      <div class="flex items-center gap-3 px-6 h-16 border-b border-white/5">
        <div class="w-9 h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
        </div>
        <div class="min-w-0">
          <h1 class="text-sm font-bold text-white truncate">${resort.name}</h1>
          <p class="text-[10px] text-slate-500 uppercase tracking-wider">Admin Panel</p>
        </div>
      </div>
      <nav class="px-3 py-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
        ${navItems.map(item => `
          <a href="${item.href}" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${activePage === item.id ? "bg-brand-500/10 text-brand-400 font-medium border border-brand-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"}">
            ${item.icon}
            <span>${item.label}</span>
            ${item.badge ? `<span class="ml-auto px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold rounded-full">${item.badge}</span>` : ""}
          </a>
        `).join("")}
      </nav>
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
        <a href="../index.html" class="flex items-center gap-2 text-xs text-slate-500 hover:text-white transition px-2 py-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Back to Website
        </a>
      </div>
    </aside>
  `;

  const header = `
    <header class="sticky top-0 z-30 bg-dark-900/80 backdrop-blur-xl border-b border-white/5 lg:ml-64">
      <div class="flex items-center justify-between h-16 px-4 sm:px-6">
        <div class="flex items-center gap-4">
          <button onclick="toggleSidebar()" class="lg:hidden p-2 text-slate-400 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <h2 class="text-lg font-semibold text-white capitalize">${activePage}</h2>
        </div>
        <div class="flex items-center gap-4">
          <div class="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            System Online
          </div>
          <div class="w-9 h-9 bg-brand-500/20 rounded-xl flex items-center justify-center text-brand-400 text-sm font-bold">CH</div>
        </div>
      </div>
    </header>
  `;

  return { sidebar, header };
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.classList.toggle("-translate-x-full");
    sidebar.classList.toggle("translate-x-0");
  }
}

function initAdminLayout(activePage) {
  const layout = getAdminLayout(activePage);
  document.body.insertAdjacentHTML("afterbegin", layout.sidebar + `<div class="lg:ml-64 min-h-screen">${layout.header}<main id="admin-content" class="p-4 sm:p-6 lg:p-8"></main></div>`);
}
