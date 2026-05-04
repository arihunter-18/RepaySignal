import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider, useSession } from './context/SessionContext';
import { Shell } from './components/layout/Shell';
import { AdminDashboard } from './pages/AdminDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentDetailPage } from './pages/StudentDetailPage';
import { AlertsPage } from './pages/AlertsPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

function AppRoutes() {
  const { role } = useSession();

  return (
    <Shell>
      <Routes>
        <Route path="/" element={
          <Navigate to={role === 'admin' ? '/dashboard' : '/my'} replace />
        } />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/student/:id" element={<StudentDetailPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/my" element={<StudentDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </SessionProvider>
    </QueryClientProvider>
  );
}