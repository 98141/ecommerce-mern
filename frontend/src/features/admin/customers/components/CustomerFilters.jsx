import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerFilterSchema } from '../schemas/filter.schema';

export function CustomerFilters({ initialValues, onSubmit }) {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(customerFilterSchema),
    defaultValues: initialValues,
  });

  return (
    <form
      className="form"
      style={{ flexDirection: 'row', alignItems: 'flex-end', gap: '1rem' }}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="form-field">
        <label htmlFor="filter-search">Buscar</label>
        <input id="filter-search" placeholder="Nombre, apellido o email" {...register('search')} />
      </div>

      <div className="form-field">
        <label htmlFor="filter-status">Estado</label>
        <select id="filter-status" {...register('status')}>
          <option value="">Todos</option>
          <option value="active">Activo</option>
          <option value="blocked">Bloqueado</option>
          <option value="pending_verification">Pendiente de verificación</option>
        </select>
      </div>

      <button className="btn btn-primary" type="submit">
        Filtrar
      </button>
    </form>
  );
}
