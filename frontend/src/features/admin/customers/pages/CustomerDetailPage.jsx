import { useParams, Link } from 'react-router-dom';
import { useCustomer } from '../hooks/useCustomer';
import { UpdateStatusForm } from '../components/UpdateStatusForm';

export function CustomerDetailPage() {
  const { id } = useParams();
  const { data: customer, isLoading, isError } = useCustomer(id);

  if (isLoading) return <p className="page">Cargando cliente...</p>;
  if (isError || !customer) return <p className="page form-error">No se pudo cargar el cliente.</p>;

  return (
    <div className="page">
      <p>
        <Link to="/admin/clientes">← Volver al listado</Link>
      </p>
      <h1>
        {customer.firstName} {customer.lastName}
      </h1>
      <p className="muted">{customer.email}</p>
      <p>
        Estado: <span className={`badge ${customer.status}`}>{customer.status}</span>
      </p>
      <p>Correo verificado: {customer.emailVerified ? 'Sí' : 'No'}</p>
      <p>Último acceso: {customer.lastLoginAt ? new Date(customer.lastLoginAt).toLocaleString() : 'Nunca'}</p>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2>Cambiar estado</h2>
        <UpdateStatusForm customer={customer} />
      </div>
    </div>
  );
}
