import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resendVerificationSchema } from '../schemas/forgotPassword.schema';
import { authService } from '../../../services/auth.service';

export function ResendVerificationForm() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(resendVerificationSchema) });

  const onSubmit = async (values) => {
    await authService.resendVerification(values);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="form-alert success" role="status">
        Si la cuenta requiere verificación, enviaremos un nuevo enlace.
      </div>
    );
  }

  return (
    <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-field">
        <label htmlFor="resend-email">Email</label>
        <input id="resend-email" type="email" autoComplete="email" {...register('email')} />
        {errors.email && <span className="form-error">{errors.email.message}</span>}
      </div>

      <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Reenviar verificación'}
      </button>
    </form>
  );
}
