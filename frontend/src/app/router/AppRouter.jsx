import { Routes, Route } from 'react-router-dom';
import { RootLayout } from '../../components/layout/RootLayout';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { AdminRoute } from './guards/AdminRoute';
import { PublicOnlyRoute } from './guards/PublicOnlyRoute';

import { HomePage } from '../../pages/public/HomePage';
import { NotFoundPage } from '../../pages/errors/NotFoundPage';
import { AdminDashboardPage } from '../../pages/admin/AdminDashboardPage';

import { LoginPage } from '../../features/auth/pages/LoginPage';
import { RegisterPage } from '../../features/auth/pages/RegisterPage';
import { VerifyEmailPage } from '../../features/auth/pages/VerifyEmailPage';
import { ForgotPasswordPage } from '../../features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../../features/auth/pages/ResetPasswordPage';

import { AccountLayout } from '../../features/users/pages/AccountLayout';
import { AccountOverviewPage } from '../../features/users/pages/AccountOverviewPage';
import { ProfilePage } from '../../features/users/pages/ProfilePage';
import { SecurityPage } from '../../features/users/pages/SecurityPage';

import { CustomersListPage } from '../../features/admin/customers/pages/CustomersListPage';
import { CustomerDetailPage } from '../../features/admin/customers/pages/CustomerDetailPage';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<HomePage />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
        </Route>

        <Route path="/verificar-correo" element={<VerifyEmailPage />} />
        <Route path="/recuperar-contrasena" element={<ForgotPasswordPage />} />
        <Route path="/restablecer-contrasena" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/mi-cuenta" element={<AccountLayout />}>
            <Route index element={<AccountOverviewPage />} />
            <Route path="perfil" element={<ProfilePage />} />
            <Route path="seguridad" element={<SecurityPage />} />
          </Route>
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/clientes" element={<CustomersListPage />} />
          <Route path="/admin/clientes/:id" element={<CustomerDetailPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
