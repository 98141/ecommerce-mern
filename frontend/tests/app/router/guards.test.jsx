import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from '../../../src/app/router/guards/ProtectedRoute';
import { AdminRoute } from '../../../src/app/router/guards/AdminRoute';
import { PublicOnlyRoute } from '../../../src/app/router/guards/PublicOnlyRoute';
import { useAuthStore } from '../../../src/features/auth/store/auth.store';

function resetStore(overrides = {}) {
  useAuthStore.setState({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isInitializing: false,
    ...overrides,
  });
}

function renderWithRoute(guardElement, protectedPageText, initialEntry = '/private') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route element={guardElement}>
          <Route path="/private" element={<div>{protectedPageText}</div>} />
        </Route>
        <Route path="/mi-cuenta" element={<div>cuenta</div>} />
        <Route path="/login" element={<div>login page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to /login', () => {
    resetStore({ isAuthenticated: false });

    renderWithRoute(<ProtectedRoute />, 'contenido privado');

    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('renders the child route for authenticated users', () => {
    resetStore({ isAuthenticated: true, user: { role: 'customer' } });

    renderWithRoute(<ProtectedRoute />, 'contenido privado');

    expect(screen.getByText('contenido privado')).toBeInTheDocument();
  });
});

describe('AdminRoute', () => {
  it('blocks a customer from an admin-only route', () => {
    resetStore({ isAuthenticated: true, user: { role: 'customer' } });

    renderWithRoute(<AdminRoute />, 'panel admin');

    expect(screen.getByText('cuenta')).toBeInTheDocument();
  });

  it('allows an admin to access an admin-only route', () => {
    resetStore({ isAuthenticated: true, user: { role: 'admin' } });

    renderWithRoute(<AdminRoute />, 'panel admin');

    expect(screen.getByText('panel admin')).toBeInTheDocument();
  });
});

describe('PublicOnlyRoute', () => {
  it('redirects an authenticated user away from public-only routes', () => {
    resetStore({ isAuthenticated: true, user: { role: 'customer' } });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<div>login form</div>} />
          </Route>
          <Route path="/mi-cuenta" element={<div>cuenta</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('cuenta')).toBeInTheDocument();
  });

  it('renders the public route for unauthenticated users', () => {
    resetStore({ isAuthenticated: false });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<div>login form</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('login form')).toBeInTheDocument();
  });
});
