import { createContext, useContext, useState, useCallback } from 'react';
import { ROOMS, GUESTS, BOOKINGS, SEASONAL, RESORT, SEED_VERSION } from '../data/seed';

function load(key, fallback) {
  try {
    const s = localStorage.getItem('rh_' + key);
    return s ? JSON.parse(s) : JSON.parse(JSON.stringify(fallback));
  } catch { return JSON.parse(JSON.stringify(fallback)); }
}

function save(key, data) {
  try { localStorage.setItem('rh_' + key, JSON.stringify(data)); } catch {}
}

const VERSION_KEY = 'rh_seed_version';

function initSeed() {
  try {
    const stored = localStorage.getItem(VERSION_KEY);
    if (stored !== String(SEED_VERSION)) {
      localStorage.clear();
      localStorage.setItem(VERSION_KEY, String(SEED_VERSION));
    }
  } catch {}
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  initSeed();

  const [rooms, setRooms] = useState(() => load('rooms', ROOMS));
  const [bookings, setBookings] = useState(() => load('bookings', BOOKINGS));
  const [guests, setGuests] = useState(() => load('guests', GUESTS));
  const [seasonal, setSeasonal] = useState(() => load('seasonal', SEASONAL));
  const [resort, setResort] = useState(() => load('resort', RESORT));

  const persist = useCallback((setter, key) => (updater) => {
    setter(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      save(key, next);
      return next;
    });
  }, []);

  const updateRooms = persist(setRooms, 'rooms');
  const updateBookings = persist(setBookings, 'bookings');
  const updateGuests = persist(setGuests, 'guests');
  const updateSeasonal = persist(setSeasonal, 'seasonal');
  const updateResort = persist(setResort, 'resort');

  const getGuest = (id) => guests.find(g => g.id === id);
  const getRoom = (id) => rooms.find(r => r.id === id);
  const getBooking = (id) => bookings.find(b => b.id === id);

  const resetAll = () => {
    try { localStorage.clear(); } catch {}
    setRooms(JSON.parse(JSON.stringify(ROOMS)));
    setBookings(JSON.parse(JSON.stringify(BOOKINGS)));
    setGuests(JSON.parse(JSON.stringify(GUESTS)));
    setSeasonal(JSON.parse(JSON.stringify(SEASONAL)));
    setResort(JSON.parse(JSON.stringify(RESORT)));
  };

  const value = { rooms, bookings, guests, seasonal, resort, getGuest, getRoom, getBooking, updateRooms, updateBookings, updateGuests, updateSeasonal, updateResort, resetAll };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
