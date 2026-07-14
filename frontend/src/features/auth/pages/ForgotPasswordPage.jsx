import { Link } from 'react-router-dom';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';

export function ForgotPasswordPage() {
  return (
    <div className="auth-page">
      <div className="card">
        <h1>Recuperar contraseña</h1>
        <ForgotPasswordForm />
        <p className="muted">
          <Link to="/login">Volver a iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}
