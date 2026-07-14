import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/auth.store';
import { authService } from '../../services/auth.service';

export function NavBar() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      clearSession();
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="app-nav">
      <div className="app-nav-inner">
        <Link to="/">
          <strong>Ecommerce MERN</strong>
        </Link>
        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {isAuthenticated ? (
            <>
              {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
              <Link to="/mi-cuenta">Mi cuenta</Link>
              <button className="btn-link" type="button" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Iniciar sesión</Link>
              <Link to="/registro">Crear cuenta</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
