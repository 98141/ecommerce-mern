import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../schemas/register.schema';
import { authService } from '../../../services/auth.service';

const ERROR_MESSAGES = {
  EMAIL_ALREADY_REGISTERED: 'Ese email ya está registrado.',
  PASSWORDS_DO_NOT_MATCH: 'Las contraseñas no coinciden.',
};

export function RegisterForm({ onSuccess }) {
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values) => {
    setServerError(null);

    try {
      await authService.register(values);
      onSuccess?.(values.email);
    } catch (error) {
      const code = error.response?.data?.error?.code;
      setServerError(ERROR_MESSAGES[code] || 'No se pudo completar el registro. Inténtalo de nuevo.');
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
        <label htmlFor="firstName">Nombre</label>
        <input id="firstName" {...register('firstName')} />
        {errors.firstName && <span className="form-error">{errors.firstName.message}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="lastName">Apellido</label>
        <input id="lastName" {...register('lastName')} />
        {errors.lastName && <span className="form-error">{errors.lastName.message}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="email" {...register('email')} />
        {errors.email && <span className="form-error">{errors.email.message}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="phone">Teléfono (opcional)</label>
        <input id="phone" {...register('phone')} />
      </div>

      <div className="form-field">
        <label htmlFor="password">Contraseña</label>
        <input id="password" type="password" autoComplete="new-password" {...register('password')} />
        {errors.password && <span className="form-error">{errors.password.message}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="passwordConfirmation">Confirmar contraseña</label>
        <input
          id="passwordConfirmation"
          type="password"
          autoComplete="new-password"
          {...register('passwordConfirmation')}
        />
        {errors.passwordConfirmation && <span className="form-error">{errors.passwordConfirmation.message}</span>}
      </div>

      <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>
    </form>
  );
}
