import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/auth.store';

export function PublicOnlyRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  if (isInitializing) return null;

  if (isAuthenticated) {
    return <Navigate to="/mi-cuenta" replace />;
  }

  return <Outlet />;
}
