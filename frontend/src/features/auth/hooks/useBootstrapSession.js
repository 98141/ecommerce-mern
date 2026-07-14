import { useEffect } from 'react';
import { authService } from '../../../services/auth.service';
import { userApi } from '../../users/api/user.api';
import { useAuthStore } from '../store/auth.store';

export function useBootstrapSession() {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const setInitializing = useAuthStore((state) => state.setInitializing);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const { data } = await authService.refresh();
        if (cancelled) return;
        setAccessToken(data.accessToken);

        const meResponse = await userApi.getMe();
        if (cancelled) return;
        setUser(meResponse.data.user);
      } catch {
        if (!cancelled) clearSession();
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
