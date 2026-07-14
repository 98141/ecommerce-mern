import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { updateProfileSchema } from '../schemas/updateProfile.schema';
import { userApi } from '../api/user.api';
import { useAuthStore } from '../../auth/store/auth.store';

export function UpdateProfileForm({ profile }) {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const [feedback, setFeedback] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone || '',
    },
  });

  const onSubmit = async (values) => {
    setFeedback(null);

    try {
      const { data } = await userApi.updateMe(values);
      setUser(data.user);
      queryClient.setQueryData(['profile', 'me'], data.user);
      setFeedback({ type: 'success', message: 'Perfil actualizado correctamente.' });
    } catch {
      setFeedback({ type: 'error', message: 'No se pudo actualizar el perfil.' });
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {feedback && (
        <div className={`form-alert ${feedback.type}`} role={feedback.type === 'error' ? 'alert' : 'status'}>
          {feedback.message}
        </div>
      )}

      <div className="form-field">
        <label htmlFor="profile-firstName">Nombre</label>
        <input id="profile-firstName" {...register('firstName')} />
        {errors.firstName && <span className="form-error">{errors.firstName.message}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="profile-lastName">Apellido</label>
        <input id="profile-lastName" {...register('lastName')} />
        {errors.lastName && <span className="form-error">{errors.lastName.message}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="profile-phone">Teléfono</label>
        <input id="profile-phone" {...register('phone')} />
      </div>

      <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  );
}
