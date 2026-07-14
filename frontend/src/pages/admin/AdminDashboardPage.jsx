import { Link } from 'react-router-dom';

export function AdminDashboardPage() {
  return (
    <div className="page">
      <h1>Panel de administración</h1>
      <p className="muted">Este panel se irá completando en próximos sprints.</p>
      <p>
        <Link to="/admin/clientes">Gestionar clientes</Link>
      </p>
    </div>
  );
}
