import { Outlet } from 'react-router-dom';
import { NavBar } from '../navigation/NavBar';
import { useBootstrapSession } from '../../features/auth/hooks/useBootstrapSession';

export function RootLayout() {
  useBootstrapSession();

  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
}
