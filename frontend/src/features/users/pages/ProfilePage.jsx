import { useProfile } from '../hooks/useProfile';
import { UpdateProfileForm } from '../components/UpdateProfileForm';

export function ProfilePage() {
  const { data: profile, isLoading, isError } = useProfile();

  if (isLoading) return <p>Cargando perfil...</p>;
  if (isError || !profile) return <p className="form-error">No se pudo cargar tu perfil.</p>;

  return (
    <div className="card">
      <h1>Mi perfil</h1>
      <p className="muted">{profile.email}</p>
      <UpdateProfileForm profile={profile} />
    </div>
  );
}
