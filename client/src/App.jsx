import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DevoteeHome from './pages/DevoteeHome';
import StaffPanel from './pages/StaffPanel';
import AdminDashboard from './pages/AdminDashboard';

/**
 * ProtectedRoute — redirects to /login if not authenticated.
 * If `allowedRoles` is provided, also enforces role.
 */
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

/**
 * Root redirect — sends user to their role-specific home after login.
 */
function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'staff') return <Navigate to="/staff" replace />;
  return <Navigate to="/devotee" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RoleRedirect />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/devotee"
        element={
          <ProtectedRoute allowedRoles={['devotee']}>
            <DevoteeHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={['staff', 'admin']}>
            <StaffPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
