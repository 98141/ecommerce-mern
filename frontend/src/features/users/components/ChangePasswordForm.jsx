import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { changePasswordSchema } from '../schemas/changePassword.schema';
import { userApi } from '../api/user.api';
import { useAuthStore } from '../../auth/store/auth.store';

const ERROR_MESSAGES = {
  CURRENT_PASSWORD_INCORRECT: 'La contraseña actual es incorrecta.',
  VALIDATION_ERROR: 'La nueva contraseña no puede ser igual a la actual.',
};

export function ChangePasswordForm() {
  const navigate = useNavigate();
  const clearSession = useAuthStore((state) => state.clearSession);
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(changePasswordSchema) });

  const onSubmit = async (values) => {
    setServerError(null);

    try {
      await userApi.changePassword(values);
      clearSession();
      navigate('/login', { replace: true });
    } catch (error) {
      const code = error.response?.data?.error?.code;
      setServerError(ERROR_MESSAGES[code] || 'No se pudo cambiar la contraseña.');
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && (
        <div className="form-alert error" role="alert">
          {serverError}
        </div>
      )}

      <div className="form-field">
        <label htmlFor="currentPassword">Contraseña actual</label>
        <input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          {...register('currentPassword')}
        />
        {errors.currentPassword && <span className="form-error">{errors.currentPassword.message}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="newPassword">Nueva contraseña</label>
        <input id="newPassword" type="password" autoComplete="new-password" {...register('newPassword')} />
        {errors.newPassword && <span className="form-error">{errors.newPassword.message}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="newPasswordConfirmation">Confirmar nueva contraseña</label>
        <input
          id="newPasswordConfirmation"
          type="password"
          autoComplete="new-password"
          {...register('newPasswordConfirmation')}
        />
        {errors.newPasswordConfirmation && (
          <span className="form-error">{errors.newPasswordConfirmation.message}</span>
        )}
      </div>

      <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : 'Cambiar contraseña'}
      </button>
    </form>
  );
}
