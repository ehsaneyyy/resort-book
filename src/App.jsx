import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ToastProvider } from './components/Toast';
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Dashboard } from './pages/Dashboard';
import { Rooms } from './pages/Rooms';
import { Bookings } from './pages/Bookings';
import { Guests } from './pages/Guests';
import { Calendar } from './pages/Calendar';
import { Reports } from './pages/Reports';
import { Pricing } from './pages/Pricing';
import { Settings } from './pages/Settings';
import client from './api/client';

export function App() {
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('Connecting to server...');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await client.get('/api/v1/health');
        if (cancelled) return;
        setMessage('Loading data...');
        try {
          await client.get('/api/v1/resort');
        } catch {
          if (cancelled) return;
          setMessage('Setting up demo data...');
          await client.post('/api/v1/seed');
        }
        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) setReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!ready) return <LoadingScreen message={message} />;

  return (
    <ErrorBoundary>
      <ToastProvider>
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
      </ToastProvider>
    </ErrorBoundary>
  );
}
