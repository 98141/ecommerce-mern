import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../../../src/features/auth/components/LoginForm';
import { useAuthStore } from '../../../src/features/auth/store/auth.store';

vi.mock('../../../src/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
  },
}));

const { authService } = await import('../../../src/services/auth.service');

function renderLoginForm() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/mi-cuenta" element={<div>cuenta destino</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false, isInitializing: false });
  });

  it('renders the email and password fields', () => {
    renderLoginForm();

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('redirects to /mi-cuenta after a successful login', async () => {
    const user = userEvent.setup();
    authService.login.mockResolvedValue({
      data: {
        accessToken: 'token-123',
        user: { id: '1', firstName: 'Armando', role: 'customer' },
      },
    });

    renderLoginForm();

    await user.type(screen.getByLabelText('Email'), 'armando@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'ClaveSegura#123');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => expect(screen.getByText('cuenta destino')).toBeInTheDocument());
    expect(useAuthStore.getState().accessToken).toBe('token-123');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('shows a message and a resend link when the email is not verified', async () => {
    const user = userEvent.setup();
    authService.login.mockRejectedValue({
      response: { data: { error: { code: 'EMAIL_NOT_VERIFIED' } } },
    });

    renderLoginForm();

    await user.type(screen.getByLabelText('Email'), 'armando@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'ClaveSegura#123');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(await screen.findByText(/todavía no ha sido verificada/i)).toBeInTheDocument();
    expect(screen.getByText(/reenviar verificación/i)).toBeInTheDocument();
  });

  it('shows a generic message when the account is blocked', async () => {
    const user = userEvent.setup();
    authService.login.mockRejectedValue({
      response: { data: { error: { code: 'ACCOUNT_BLOCKED' } } },
    });

    renderLoginForm();

    await user.type(screen.getByLabelText('Email'), 'armando@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'ClaveSegura#123');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(await screen.findByText(/tu cuenta está bloqueada/i)).toBeInTheDocument();
  });

  it('shows a lockout message without revealing account details', async () => {
    const user = userEvent.setup();
    authService.login.mockRejectedValue({
      response: { data: { error: { code: 'ACCOUNT_TEMPORARILY_LOCKED' } } },
    });

    renderLoginForm();

    await user.type(screen.getByLabelText('Email'), 'armando@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'Incorrecta#123');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(await screen.findByText(/demasiados intentos fallidos/i)).toBeInTheDocument();
  });
});
