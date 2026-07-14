import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChangePasswordForm } from '../../../src/features/users/components/ChangePasswordForm';
import { useAuthStore } from '../../../src/features/auth/store/auth.store';

vi.mock('../../../src/features/users/api/user.api', () => ({
  userApi: {
    changePassword: vi.fn(),
  },
}));

const { userApi } = await import('../../../src/features/users/api/user.api');

function renderForm() {
  return render(
    <MemoryRouter initialEntries={['/mi-cuenta/seguridad']}>
      <Routes>
        <Route path="/mi-cuenta/seguridad" element={<ChangePasswordForm />} />
        <Route path="/login" element={<div>login page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ChangePasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: { id: '1', firstName: 'Armando' },
      accessToken: 'token',
      isAuthenticated: true,
      isInitializing: false,
    });
  });

  it('changes the password and redirects to login clearing the session', async () => {
    const user = userEvent.setup();
    userApi.changePassword.mockResolvedValue({ success: true });

    renderForm();

    await user.type(screen.getByLabelText('Contraseña actual'), 'ClaveSegura#123');
    await user.type(screen.getByLabelText('Nueva contraseña'), 'NuevaClave#456');
    await user.type(screen.getByLabelText('Confirmar nueva contraseña'), 'NuevaClave#456');
    await user.click(screen.getByRole('button', { name: /cambiar contraseña/i }));

    await waitFor(() => expect(screen.getByText('login page')).toBeInTheDocument());
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('shows an error when the current password is incorrect', async () => {
    const user = userEvent.setup();
    userApi.changePassword.mockRejectedValue({
      response: { data: { error: { code: 'CURRENT_PASSWORD_INCORRECT' } } },
    });

    renderForm();

    await user.type(screen.getByLabelText('Contraseña actual'), 'Incorrecta#000');
    await user.type(screen.getByLabelText('Nueva contraseña'), 'NuevaClave#456');
    await user.type(screen.getByLabelText('Confirmar nueva contraseña'), 'NuevaClave#456');
    await user.click(screen.getByRole('button', { name: /cambiar contraseña/i }));

    expect(await screen.findByText('La contraseña actual es incorrecta.')).toBeInTheDocument();
  });
});
