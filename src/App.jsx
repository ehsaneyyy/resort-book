import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ToastProvider } from './components/Toast';
import { StoreProvider } from './hooks/useStore';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Dashboard } from './pages/Dashboard';
import { Rooms } from './pages/Rooms';
import { Bookings } from './pages/Bookings';
import { Guests } from './pages/Guests';
import { Calendar } from './pages/Calendar';
import { Reports } from './pages/Reports';
import { Pricing } from './pages/Pricing';
import { Settings } from './pages/Settings';

export function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
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
      </StoreProvider>
    </ErrorBoundary>
  );
}
