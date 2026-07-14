import { ResetPasswordForm } from '../components/ResetPasswordForm';

export function ResetPasswordPage() {
  return (
    <div className="auth-page">
      <div className="card">
        <h1>Restablecer contraseña</h1>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
