import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { ToastProvider } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SkeletonCard } from './components/Skeleton';
import client from './api/client';
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

  useEffect(() => {
    (async () => {
      await Promise.all(
        Object.entries(prefetch).map(([key, fn]) =>
          qc.prefetchQuery({ queryKey: [key], queryFn: async () => toCamelCase(await fn()) })
        )
      );
    })();
  }, [qc]);

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

function AuthLoading() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <img src="/favicon.svg" alt="DoGuest" className="w-10 h-10 animate-pulse" />
        <p className="text-xs text-slate-500">Checking session...</p>
      </div>
    </div>
  );
}

export function App() {
  const location = useLocation();
  const [authTick, setAuthTick] = useState(0);
  const { data: me, isLoading } = useQuery({
    queryKey: ['me', authTick],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/auth/me');
      return toCamelCase(data);
    },
    retry: false,
  });

  const handleSessionChange = () => setAuthTick((t) => t + 1);

  if (isLoading) {
    return (
      <ToastProvider>
        <AuthLoading />
      </ToastProvider>
    );
  }

  if (!me) {
    return (
      <ErrorBoundary>
        <ToastProvider>
          <Login onLoggedIn={handleSessionChange} />
        </ToastProvider>
      </ErrorBoundary>
    );
  }

  if (location.pathname === '/login') {
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
