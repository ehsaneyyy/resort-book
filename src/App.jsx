import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { ToastProvider, useToast } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SkeletonCard } from './components/Skeleton';
import client, { getToken } from './api/client';
import { toCamelCase } from './api/transform';
import { Login } from './pages/Login';

const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Rooms = lazy(() => import('./pages/Rooms').then(m => ({ default: m.Rooms })));
const Bookings = lazy(() => import('./pages/Bookings').then(m => ({ default: m.Bookings })));
const Guests = lazy(() => import('./pages/Guests').then(m => ({ default: m.Guests })));
const Calendar = lazy(() => import('./pages/Calendar').then(m => ({ default: m.Calendar })));
const Reports = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));
const Pricing = lazy(() => import('./pages/Pricing').then(m => ({ default: m.Pricing })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));

const prefetch = {
  rooms: async () => (await client.get('/api/v1/rooms')).data,
  guests: async () => (await client.get('/api/v1/guests')).data,
  bookings: async () => (await client.get('/api/v1/bookings')).data,
  stats: async () => (await client.get('/api/v1/stats')).data,
};

function Bootstrap() {
  const qc = useQueryClient();
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let seeded = false;
      try {
        await client.get('/api/v1/resort');
      } catch (err) {
        if (err.response?.status === 404 && !cancelled) {
          await client.post('/api/v1/seed');
          seeded = true;
        }
      }
      if (cancelled) return;
      await Promise.all(
        Object.entries(prefetch).map(([key, fn]) =>
          qc.prefetchQuery({ queryKey: [key], queryFn: async () => toCamelCase(await fn()) })
        )
      );
      if (seeded && !cancelled) toast('Demo data loaded', 'success');
    })();
    return () => { cancelled = true; };
  }, [qc, toast]);

  return null;
}

function PageFallback() {
  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}

export function App() {
  const location = useLocation();
  const authed = Boolean(getToken());

  if (!authed && location.pathname !== '/login') {
    return (
      <ErrorBoundary>
        <ToastProvider>
          <Login />
        </ToastProvider>
      </ErrorBoundary>
    );
  }

  if (authed && location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <Bootstrap />
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/guests" element={<Guests />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </ToastProvider>
    </ErrorBoundary>
  );
}
