import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPasswordSchema } from '../schemas/resetPassword.schema';
import { authService } from '../../../services/auth.service';

const ERROR_MESSAGES = {
  INVALID_RESET_TOKEN: 'El enlace no es válido.',
  EXPIRED_RESET_TOKEN: 'El enlace expiró. Solicita uno nuevo.',
  TOKEN_ALREADY_USED: 'Este enlace ya fue utilizado.',
  PASSWORDS_DO_NOT_MATCH: 'Las contraseñas no coinciden.',
};

export function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = async (values) => {
    setServerError(null);

    try {
      await authService.resetPassword({ token, ...values });
      navigate('/login', { replace: true });
    } catch (error) {
      const code = error.response?.data?.error?.code;
      setServerError(ERROR_MESSAGES[code] || 'No se pudo restablecer la contraseña.');
    }
  };

  if (!token) {
    return <div className="form-alert error">Falta el token de restablecimiento en el enlace.</div>;
  }

  return (
    <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && (
        <div className="form-alert error" role="alert">
          {serverError}
        </div>
      )}

      <div className="form-field">
        <label htmlFor="new-password">Nueva contraseña</label>
        <input id="new-password" type="password" autoComplete="new-password" {...register('password')} />
        {errors.password && <span className="form-error">{errors.password.message}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="new-password-confirmation">Confirmar nueva contraseña</label>
        <input
          id="new-password-confirmation"
          type="password"
          autoComplete="new-password"
          {...register('passwordConfirmation')}
        />
        {errors.passwordConfirmation && <span className="form-error">{errors.passwordConfirmation.message}</span>}
      </div>

      <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : 'Restablecer contraseña'}
      </button>
    </form>
  );
}
