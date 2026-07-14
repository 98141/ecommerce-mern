import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { updateStatusSchema } from '../schemas/updateStatus.schema';
import { customersApi } from '../api/customers.api';

const ERROR_MESSAGES = {
  CANNOT_BLOCK_SELF: 'No puedes cambiar tu propio estado desde aquí.',
  INVALID_USER_STATUS: 'Estado no permitido.',
};

export function UpdateStatusForm({ customer }) {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: { status: customer.status === 'blocked' ? 'active' : 'blocked', reason: '' },
  });

  const onSubmit = async (values) => {
    setFeedback(null);

    try {
      const { data } = await customersApi.updateStatus(customer.id, values);
      queryClient.setQueryData(['admin', 'customers', customer.id], data.user);
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] });
      setFeedback({ type: 'success', message: 'Estado actualizado correctamente.' });
    } catch (error) {
      const code = error.response?.data?.error?.code;
      setFeedback({ type: 'error', message: ERROR_MESSAGES[code] || 'No se pudo actualizar el estado.' });
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
        <label htmlFor="status-select">Nuevo estado</label>
        <select id="status-select" {...register('status')}>
          <option value="active">Activo</option>
          <option value="blocked">Bloqueado</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="status-reason">Motivo (opcional)</label>
        <input id="status-reason" {...register('reason')} />
      </div>

      <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : 'Actualizar estado'}
      </button>
    </form>
  );
}
