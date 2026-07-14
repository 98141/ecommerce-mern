import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm';

export function RegisterPage() {
  const [registeredEmail, setRegisteredEmail] = useState(null);

  if (registeredEmail) {
    return (
      <div className="auth-page">
        <div className="card">
          <h1>Cuenta creada</h1>
          <p>
            Enviamos un enlace de verificación a <strong>{registeredEmail}</strong>. Revisa tu correo para activar tu
            cuenta.
          </p>
          <p className="muted">
            <Link to="/verificar-correo">¿No recibiste el correo? Reenviar verificación</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="card">
        <h1>Crear cuenta</h1>
        <RegisterForm onSuccess={setRegisteredEmail} />
        <p className="muted">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
