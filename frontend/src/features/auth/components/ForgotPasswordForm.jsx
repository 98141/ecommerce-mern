import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema } from '../schemas/forgotPassword.schema';
import { authService } from '../../../services/auth.service';

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (values) => {
    await authService.forgotPassword(values);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="form-alert success" role="status">
        Si existe una cuenta asociada, enviaremos instrucciones a tu correo.
      </div>
    );
  }

  return (
    <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-field">
        <label htmlFor="forgot-email">Email</label>
        <input id="forgot-email" type="email" autoComplete="email" {...register('email')} />
        {errors.email && <span className="form-error">{errors.email.message}</span>}
      </div>

      <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Enviar instrucciones'}
      </button>
    </form>
  );
}
