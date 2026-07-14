import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UpdateProfileForm } from '../../../src/features/users/components/UpdateProfileForm';
import { useAuthStore } from '../../../src/features/auth/store/auth.store';

vi.mock('../../../src/features/users/api/user.api', () => ({
  userApi: {
    updateMe: vi.fn(),
  },
}));

const { userApi } = await import('../../../src/features/users/api/user.api');

const profile = {
  id: '1',
  firstName: 'Armando',
  lastName: 'Mora',
  email: 'armando@example.com',
  phone: '3001234567',
  role: 'customer',
};

function renderForm() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <UpdateProfileForm profile={profile} />
    </QueryClientProvider>,
  );
}

describe('UpdateProfileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: profile, accessToken: 'token', isAuthenticated: true, isInitializing: false });
  });

  it('updates allowed profile fields', async () => {
    const user = userEvent.setup();
    userApi.updateMe.mockResolvedValue({
      data: { user: { ...profile, firstName: 'Armando Javier' } },
    });

    renderForm();

    const firstNameInput = screen.getByLabelText('Nombre');
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Armando Javier');
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    expect(await screen.findByText('Perfil actualizado correctamente.')).toBeInTheDocument();
    expect(userApi.updateMe).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: 'Armando Javier', lastName: 'Mora' }),
    );
  });
});
