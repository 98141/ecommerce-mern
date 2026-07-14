import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/auth.store';

export function AdminRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const role = useAuthStore((state) => state.user?.role);

  if (isInitializing) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== 'admin') {
    return <Navigate to="/mi-cuenta" replace />;
  }

  return <Outlet />;
}
