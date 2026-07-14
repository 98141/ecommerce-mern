import { NavLink, Outlet } from 'react-router-dom';

export function AccountLayout() {
  return (
    <div className="page account-layout">
      <nav className="account-nav">
        <NavLink to="/mi-cuenta/perfil" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Perfil
        </NavLink>
        <NavLink to="/mi-cuenta/seguridad" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Seguridad
        </NavLink>
      </nav>
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
}
