import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { loginSchema } from '../schemas/login.schema';
import { authService } from '../../../services/auth.service';
import { useAuthStore } from '../store/auth.store';

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Email o contraseña incorrectos.',
  ACCOUNT_BLOCKED: 'Tu cuenta está bloqueada. Contacta a soporte.',
  ACCOUNT_TEMPORARILY_LOCKED: 'Demasiados intentos fallidos. Inténtalo de nuevo más tarde.',
  EMAIL_NOT_VERIFIED: 'Tu cuenta todavía no ha sido verificada.',
};

export function LoginForm() {
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const [serverError, setServerError] = useState(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values) => {
    setServerError(null);
    setNeedsVerification(false);

    try {
      const { data } = await authService.login(values);
      setAccessToken(data.accessToken);
      setUser(data.user);
      navigate('/mi-cuenta', { replace: true });
    } catch (error) {
      const code = error.response?.data?.error?.code;
      setServerError(ERROR_MESSAGES[code] || 'No se pudo iniciar sesión. Inténtalo de nuevo.');
      setNeedsVerification(code === 'EMAIL_NOT_VERIFIED');
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && (
        <div className="form-alert error" role="alert">
          {serverError}
          {needsVerification && (
            <>
              {' '}
              <a href="/verificar-correo">Reenviar verificación</a>
            </>
          )}
        </div>
      )}

      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="email" {...register('email')} />
        {errors.email && <span className="form-error">{errors.email.message}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="password">Contraseña</label>
        <input id="password" type="password" autoComplete="current-password" {...register('password')} />
        {errors.password && <span className="form-error">{errors.password.message}</span>}
      </div>

      <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
      </button>
    </form>
  );
}
