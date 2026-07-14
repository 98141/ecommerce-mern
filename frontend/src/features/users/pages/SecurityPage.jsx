import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChangePasswordForm } from '../components/ChangePasswordForm';
import { authService } from '../../../services/auth.service';
import { useAuthStore } from '../../auth/store/auth.store';

export function SecurityPage() {
  const navigate = useNavigate();
  const clearSession = useAuthStore((state) => state.clearSession);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  const handleLogoutAll = async () => {
    setIsLoggingOutAll(true);
    try {
      await authService.logoutAll();
    } finally {
      clearSession();
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="card">
      <h1>Seguridad</h1>

      <section>
        <h2>Cambiar contraseña</h2>
        <ChangePasswordForm />
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>Sesiones</h2>
        <p className="muted">Cierra la sesión en todos los dispositivos donde hayas iniciado sesión.</p>
        <button className="btn btn-primary" type="button" onClick={handleLogoutAll} disabled={isLoggingOutAll}>
          {isLoggingOutAll ? 'Cerrando sesiones...' : 'Cerrar todas las sesiones'}
        </button>
      </section>
    </div>
  );
}
