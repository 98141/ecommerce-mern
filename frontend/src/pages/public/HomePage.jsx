import { Link } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/auth.store';

export function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="page">
      <h1>Ecommerce MERN</h1>
      <p className="muted">El catálogo de productos se incorporará en un próximo sprint.</p>
      {isAuthenticated ? (
        <Link to="/mi-cuenta">Ir a mi cuenta</Link>
      ) : (
        <p>
          <Link to="/login">Iniciar sesión</Link> · <Link to="/registro">Crear cuenta</Link>
        </p>
      )}
    </div>
  );
}
