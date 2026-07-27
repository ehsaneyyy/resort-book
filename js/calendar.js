let calInstances = {};

function createCalendar(containerId, onChange) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  const state = { year: new Date().getFullYear(), month: new Date().getMonth(), start: null, end: null };
  const booked = generateBookedDates();
  calInstances[containerId] = state;

  function render() {
    const { year: y, month: m, start, end } = state;
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let h = `<div class="flex items-center justify-between mb-4">
      <button onclick="calNav('${containerId}',-1)" class="p-2 hover:bg-white/10 rounded-lg transition text-white">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      </button>
      <h3 class="text-lg font-semibold text-white">${months[m]} ${y}</h3>
      <button onclick="calNav('${containerId}',1)" class="p-2 hover:bg-white/10 rounded-lg transition text-white">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
      </button>
    </div>`;

    h += `<div class="grid grid-cols-7 gap-1 mb-2">${["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => `<div class="text-center text-xs font-medium text-slate-400 py-1">${d}</div>`).join("")}</div>`;
    h += `<div class="grid grid-cols-7 gap-1">`;

    for (let i = 0; i < firstDay; i++) h += `<div></div>`;

    for (let day = 1; day <= daysInMonth; day++) {
      const ds = `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dObj = new Date(y, m, day);
      const past = dObj < today;
      const isBooked = booked.includes(ds);
      const isStart = start === ds;
      const isEnd = end === ds;
      const inRange = start && end && ds > start && ds < end;

      let c = "text-center py-2 text-sm rounded-lg transition-all select-none ";
      if (past) {
        c += "text-slate-600 cursor-not-allowed ";
      } else if (isBooked) {
        c += "bg-red-500/10 text-red-400/60 cursor-not-allowed line-through ";
      } else if (isStart || isEnd) {
        c += "bg-amber-500 text-white font-bold shadow-lg shadow-amber-500/30 cursor-pointer ";
      } else if (inRange) {
        c += "bg-amber-500/20 text-amber-200 cursor-pointer ";
      } else {
        c += "hover:bg-white/10 text-slate-200 cursor-pointer ";
      }

      const click = (!past && !isBooked) ? ` onclick="calPick('${containerId}','${ds}')"` : "";
      h += `<div class="${c}"${click}>${day}</div>`;
    }

    h += `</div>`;

    if (start && end) {
      const nights = Math.ceil((new Date(end) - new Date(start)) / 864e5);
      h += `<div class="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
        <p class="text-sm text-amber-200 font-medium">${nights} night${nights > 1 ? "s" : ""} selected</p>
        <p class="text-xs text-slate-400 mt-1">${formatDateShort(start)} &rarr; ${formatDateShort(end)}</p>
      </div>`;
    } else if (start && !end) {
      h += `<div class="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p class="text-sm text-blue-200">Select check-out date</p>
        <p class="text-xs text-slate-400 mt-1">Check-in: ${formatDateShort(start)}</p>
      </div>`;
    }

    h += `<div class="flex gap-4 mt-3 text-xs text-slate-400">
      <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-amber-500 inline-block"></span>Selected</span>
      <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-amber-500/20 inline-block"></span>In Range</span>
      <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-red-500/10 border border-red-500/30 inline-block"></span>Booked</span>
    </div>`;

    container.innerHTML = h;
    if (onChange) onChange(start, end);
  }

  window["calNav"] = (id, dir) => {
    const s = calInstances[id];
    s.month += dir;
    if (s.month > 11) { s.month = 0; s.year++; }
    else if (s.month < 0) { s.month = 11; s.year--; }
    render();
  };

  window["calPick"] = (id, ds) => {
    const s = calInstances[id];
    if (!s.start || (s.start && s.end)) {
      s.start = ds;
      s.end = null;
    } else if (ds > s.start) {
      s.end = ds;
    } else {
      s.start = ds;
      s.end = null;
    }
    render();
  };

  render();

  return {
    getDates: () => ({ start: state.start, end: state.end }),
    setDates: (s, e) => { state.start = s; state.end = e; render(); },
    reset: () => { state.start = null; state.end = null; render(); },
  };
}

function generateBookedDates() {
  const booked = [];
  SAMPLE_BOOKINGS.forEach(b => {
    if (b.status === "Cancelled") return;
    const start = new Date(b.checkIn);
    const end = new Date(b.checkOut);
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      booked.push(d.toISOString().split("T")[0]);
    }
  });
  const today = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + Math.floor(Math.random() * 30) + 10);
    booked.push(d.toISOString().split("T")[0]);
  }
  return [...new Set(booked)];
}

function formatDateShort(d) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}
