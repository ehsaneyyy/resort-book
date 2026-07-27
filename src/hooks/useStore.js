import { useState, useCallback } from 'react';
import { ROOMS, GUESTS, BOOKINGS, SEASONAL, RESORT } from '../data/seed';

function load(key, fallback) {
  try {
    const s = localStorage.getItem('rh_' + key);
    return s ? JSON.parse(s) : JSON.parse(JSON.stringify(fallback));
  } catch { return JSON.parse(JSON.stringify(fallback)); }
}

function save(key, data) {
  localStorage.setItem('rh_' + key, JSON.stringify(data));
}

export function useStore() {
  const [rooms, setRooms] = useState(() => load('rooms', ROOMS));
  const [bookings, setBookings] = useState(() => load('bookings', BOOKINGS));
  const [guests, setGuests] = useState(() => load('guests', GUESTS));
  const [seasonal, setSeasonal] = useState(() => load('seasonal', SEASONAL));
  const [resort] = useState(() => load('resort', RESORT));

  const persist = useCallback((setter) => (updater) => {
    setter(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const key = setter === setRooms ? 'rooms' : setter === setBookings ? 'bookings' : setter === setGuests ? 'guests' : 'seasonal';
      save(key, next);
      return next;
    });
  }, []);

  const updateRooms = persist(setRooms);
  const updateBookings = persist(setBookings);
  const updateGuests = persist(setGuests);
  const updateSeasonal = persist(setSeasonal);

  const getGuest = (id) => guests.find(g => g.id === id);
  const getRoom = (id) => rooms.find(r => r.id === id);
  const getBooking = (id) => bookings.find(b => b.id === id);

  const resetAll = () => {
    localStorage.clear();
    setRooms(JSON.parse(JSON.stringify(ROOMS)));
    setBookings(JSON.parse(JSON.stringify(BOOKINGS)));
    setGuests(JSON.parse(JSON.stringify(GUESTS)));
    setSeasonal(JSON.parse(JSON.stringify(SEASONAL)));
  };

  return { rooms, bookings, guests, seasonal, resort, getGuest, getRoom, getBooking, updateRooms, updateBookings, updateGuests, updateSeasonal, resetAll };
}
