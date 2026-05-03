import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedLayout } from './components/layout/ProtectedLayout';
import { HomePage } from './pages/HomePage';
import { Dashboard } from './pages/Dashboard';
import { StudentDetail } from './pages/StudentDetail';
import { AlertsPage } from './pages/AlertsPage';
import { StudentDashboard } from './pages/StudentDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />

            {/* Admin-only routes */}
            <Route element={<ProtectedLayout allowedRole="admin" />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/student/:id" element={<StudentDetail />} />
              <Route path="/alerts" element={<AlertsPage />} />
            </Route>

            {/* Student-only routes */}
            <Route element={<ProtectedLayout allowedRole="student" />}>
              <Route path="/my-dashboard" element={<StudentDashboard />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}