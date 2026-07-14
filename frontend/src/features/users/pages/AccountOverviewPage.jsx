import { useAuthStore } from '../../auth/store/auth.store';

export function AccountOverviewPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="card">
      <h1>Hola, {user?.firstName}</h1>
      <p className="muted">Desde aquí puedes administrar tu perfil y tu seguridad.</p>
    </div>
  );
}
