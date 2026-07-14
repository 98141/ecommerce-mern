import { useQuery } from '@tanstack/react-query';
import { userApi } from '../api/user.api';
import { useAuthStore } from '../../auth/store/auth.store';

export function useProfile() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => userApi.getMe().then((res) => res.data.user),
    enabled: isAuthenticated,
  });
}
