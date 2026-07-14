import { Link } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  return (
    <div className="auth-page">
      <div className="card">
        <h1>Iniciar sesión</h1>
        <LoginForm />
        <p className="muted">
          ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
        </p>
        <p className="muted">
          <Link to="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link>
        </p>
      </div>
    </div>
  );
}
