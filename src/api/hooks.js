import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from './client';
import { toCamelCase, toSnakeCase } from './transform';

export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/rooms');
      return toCamelCase(data);
    },
  });
}

export function useRoom(id) {
  return useQuery({
    queryKey: ['rooms', id],
    queryFn: async () => {
      const { data } = await client.get(`/api/v1/rooms/${id}`);
      return toCamelCase(data);
    },
    enabled: !!id,
  });
}

export function useCreateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (room) => {
      const { data } = await client.post('/api/v1/rooms', toSnakeCase(room));
      return toCamelCase(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rooms'] }),
  });
}

export function useUpdateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...room }) => {
      const { data } = await client.put(`/api/v1/rooms/${id}`, toSnakeCase(room));
      return toCamelCase(data);
    },
    onMutate: async ({ id, ...room }) => {
      await qc.cancelQueries({ queryKey: ['rooms'] });
      const prev = qc.getQueryData(['rooms']);
      qc.setQueryData(['rooms'], (old) =>
        Array.isArray(old) ? old.map((r) => (r.id === id ? { ...r, ...room } : r)) : old
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(['rooms'], ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: ['rooms'] }),
  });
}

export function useDeleteRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => { await client.delete(`/api/v1/rooms/${id}`); },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['rooms'] });
      const prev = qc.getQueryData(['rooms']);
      qc.setQueryData(['rooms'], (old) =>
        Array.isArray(old) ? old.filter((r) => r.id !== id) : old
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(['rooms'], ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: ['rooms'] }),
  });
}

export function useGuests() {
  return useQuery({
    queryKey: ['guests'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/guests');
      return toCamelCase(data);
    },
  });
}

export function useGuest(id) {
  return useQuery({
    queryKey: ['guests', id],
    queryFn: async () => {
      const { data } = await client.get(`/api/v1/guests/${id}`);
      return toCamelCase(data);
    },
    enabled: !!id,
  });
}

export function useGuestBookings(id) {
  return useQuery({
    queryKey: ['guests', id, 'bookings'],
    queryFn: async () => {
      const { data } = await client.get(`/api/v1/guests/${id}/bookings`);
      return toCamelCase(data);
    },
    enabled: !!id,
  });
}

export function useCreateGuest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (guest) => {
      const { data } = await client.post('/api/v1/guests', toSnakeCase(guest));
      return toCamelCase(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['guests'] }),
  });
}

export function useUpdateGuest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...guest }) => {
      const { data } = await client.put(`/api/v1/guests/${id}`, toSnakeCase(guest));
      return toCamelCase(data);
    },
    onMutate: async ({ id, ...guest }) => {
      await qc.cancelQueries({ queryKey: ['guests'] });
      const prev = qc.getQueryData(['guests']);
      qc.setQueryData(['guests'], (old) =>
        Array.isArray(old) ? old.map((g) => (g.id === id ? { ...g, ...guest } : g)) : old
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(['guests'], ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: ['guests'] }),
  });
}

export function useDeleteGuest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => { await client.delete(`/api/v1/guests/${id}`); },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['guests'] });
      const prev = qc.getQueryData(['guests']);
      qc.setQueryData(['guests'], (old) =>
        Array.isArray(old) ? old.filter((g) => g.id !== id) : old
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(['guests'], ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: ['guests'] }),
  });
}

export function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/bookings');
      return toCamelCase(data);
    },
  });
}

export function useBooking(id) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: async () => {
      const { data } = await client.get(`/api/v1/bookings/${id}`);
      return toCamelCase(data);
    },
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (booking) => {
      const { data } = await client.post('/api/v1/bookings', toSnakeCase(booking));
      return toCamelCase(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useUpdateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...booking }) => {
      const { data } = await client.put(`/api/v1/bookings/${id}`, toSnakeCase(booking));
      return toCamelCase(data);
    },
    onMutate: async ({ id, ...booking }) => {
      await qc.cancelQueries({ queryKey: ['bookings'] });
      const prev = qc.getQueryData(['bookings']);
      qc.setQueryData(['bookings'], (old) =>
        Array.isArray(old) ? old.map((b) => (b.id === id ? { ...b, ...booking } : b)) : old
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(['bookings'], ctx.prev); },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const { data } = await client.patch(`/api/v1/bookings/${id}/status`, { status });
      return toCamelCase(data);
    },
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ['bookings'] });
      const prev = qc.getQueryData(['bookings']);
      qc.setQueryData(['bookings'], (old) =>
        Array.isArray(old) ? old.map((b) => (b.id === id ? { ...b, status } : b)) : old
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(['bookings'], ctx.prev); },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useDeleteBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => { await client.delete(`/api/v1/bookings/${id}`); },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['bookings'] });
      const prev = qc.getQueryData(['bookings']);
      qc.setQueryData(['bookings'], (old) =>
        Array.isArray(old) ? old.filter((b) => b.id !== id) : old
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(['bookings'], ctx.prev); },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useSeasonalRules() {
  return useQuery({
    queryKey: ['seasonal'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/seasonal-rules');
      return toCamelCase(data);
    },
  });
}

export function useCreateSeasonalRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rule) => {
      const { data } = await client.post('/api/v1/seasonal-rules', toSnakeCase(rule));
      return toCamelCase(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['seasonal'] }),
  });
}

export function useUpdateSeasonalRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...rule }) => {
      const { data } = await client.put(`/api/v1/seasonal-rules/${id}`, toSnakeCase(rule));
      return toCamelCase(data);
    },
    onMutate: async ({ id, ...rule }) => {
      await qc.cancelQueries({ queryKey: ['seasonal'] });
      const prev = qc.getQueryData(['seasonal']);
      qc.setQueryData(['seasonal'], (old) =>
        Array.isArray(old) ? old.map((r) => (r.id === id ? { ...r, ...rule } : r)) : old
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(['seasonal'], ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: ['seasonal'] }),
  });
}

export function useDeleteSeasonalRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => { await client.delete(`/api/v1/seasonal-rules/${id}`); },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['seasonal'] });
      const prev = qc.getQueryData(['seasonal']);
      qc.setQueryData(['seasonal'], (old) =>
        Array.isArray(old) ? old.filter((r) => r.id !== id) : old
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(['seasonal'], ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: ['seasonal'] }),
  });
}

export function useResort() {
  return useQuery({
    queryKey: ['resort'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/resort');
      return toCamelCase(data);
    },
    retry: 1,
  });
}

export function useUpdateResort() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (resort) => {
      const { data } = await client.put('/api/v1/resort', toSnakeCase(resort));
      return toCamelCase(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resort'] }),
  });
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/stats');
      return toCamelCase(data);
    },
  });
}

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/auth/me');
      return toCamelCase(data);
    },
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: async ({ email, password }) => {
      const { data } = await client.post('/api/v1/auth/login', { email, password });
      return toCamelCase(data);
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      await client.post('/api/v1/auth/logout');
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }) => {
      const { data } = await client.post('/api/v1/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      return data;
    },
  });
}
