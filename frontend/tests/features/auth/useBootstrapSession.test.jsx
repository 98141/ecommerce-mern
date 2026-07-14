import { render, screen } from '@testing-library/react';
import { useBootstrapSession } from '../../../src/features/auth/hooks/useBootstrapSession';
import { useAuthStore } from '../../../src/features/auth/store/auth.store';

vi.mock('../../../src/services/auth.service', () => ({
  authService: {
    refresh: vi.fn(),
  },
}));

vi.mock('../../../src/features/users/api/user.api', () => ({
  userApi: {
    getMe: vi.fn(),
  },
}));

const { authService } = await import('../../../src/services/auth.service');
const { userApi } = await import('../../../src/features/users/api/user.api');

function TestComponent() {
  useBootstrapSession();
  const { isInitializing, isAuthenticated, user } = useAuthStore();

  return (
    <div>
      <span>initializing:{String(isInitializing)}</span>
      <span>authenticated:{String(isAuthenticated)}</span>
      <span>user:{user?.firstName ?? 'none'}</span>
    </div>
  );
}

describe('useBootstrapSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false, isInitializing: true });
  });

  it('recovers the session when refresh and profile succeed', async () => {
    authService.refresh.mockResolvedValue({ data: { accessToken: 'new-token' } });
    userApi.getMe.mockResolvedValue({ data: { user: { firstName: 'Armando', role: 'customer' } } });

    render(<TestComponent />);

    expect(await screen.findByText('authenticated:true')).toBeInTheDocument();
    expect(screen.getByText('user:Armando')).toBeInTheDocument();
    expect(screen.getByText('initializing:false')).toBeInTheDocument();
  });

  it('clears the session when refresh fails', async () => {
    authService.refresh.mockRejectedValue(new Error('no refresh cookie'));

    render(<TestComponent />);

    expect(await screen.findByText('initializing:false')).toBeInTheDocument();
    expect(screen.getByText('authenticated:false')).toBeInTheDocument();
    expect(screen.getByText('user:none')).toBeInTheDocument();
    expect(userApi.getMe).not.toHaveBeenCalled();
  });
});
