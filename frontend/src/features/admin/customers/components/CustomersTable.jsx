import { Link } from 'react-router-dom';

export function CustomersTable({ items }) {
  if (items.length === 0) {
    return <p className="muted">No se encontraron clientes.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Email</th>
          <th>Estado</th>
          <th>Correo verificado</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {items.map((customer) => (
          <tr key={customer.id}>
            <td>
              {customer.firstName} {customer.lastName}
            </td>
            <td>{customer.email}</td>
            <td>
              <span className={`badge ${customer.status}`}>{customer.status}</span>
            </td>
            <td>{customer.emailVerified ? 'Sí' : 'No'}</td>
            <td>
              <Link to={`/admin/clientes/${customer.id}`}>Ver detalle</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
