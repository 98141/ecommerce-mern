import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from '../../../src/features/auth/components/RegisterForm';

vi.mock('../../../src/services/auth.service', () => ({
  authService: {
    register: vi.fn(),
  },
}));

const { authService } = await import('../../../src/services/auth.service');

describe('RegisterForm validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows required-field errors on empty submit', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    expect(await screen.findByText('El nombre es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('El apellido es obligatorio')).toBeInTheDocument();
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('shows an error when passwords do not match', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText('Nombre'), 'Armando');
    await user.type(screen.getByLabelText('Apellido'), 'Mora');
    await user.type(screen.getByLabelText('Email'), 'armando@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'ClaveSegura#123');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'Distinta#456');
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    expect(await screen.findByText('Las contraseñas no coinciden')).toBeInTheDocument();
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('rejects a weak password', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText('Nombre'), 'Armando');
    await user.type(screen.getByLabelText('Apellido'), 'Mora');
    await user.type(screen.getByLabelText('Email'), 'armando@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'abc');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'abc');
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    expect(await screen.findByText('Debe tener al menos 10 caracteres')).toBeInTheDocument();
  });
});
