const request = require('supertest');
const app = require('../../src/app');
const { createUser } = require('../helpers/factories');

async function login(email, password) {
  const res = await request(app).post('/api/v1/auth/login').send({ email, password });
  return res.body.data.accessToken;
}

describe('GET /api/v1/users/me', () => {
  it('returns the authenticated profile without sensitive fields', async () => {
    await createUser({ email: 'perfil@example.com' });
    const token = await login('perfil@example.com', 'ClaveSegura#123');

    const res = await request(app).get('/api/v1/users/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('perfil@example.com');
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });
});

describe('PATCH /api/v1/users/me', () => {
  it('updates allowed profile fields', async () => {
    await createUser({ email: 'update@example.com' });
    const token = await login('update@example.com', 'ClaveSegura#123');

    const res = await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Armando Javier', lastName: 'Mora Bastidas', phone: '3009999999' });

    expect(res.status).toBe(200);
    expect(res.body.data.user.firstName).toBe('Armando Javier');
  });

  it('ignores attempts to change role or status', async () => {
    await createUser({ email: 'noescalada@example.com' });
    const token = await login('noescalada@example.com', 'ClaveSegura#123');

    const res = await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Nombre', role: 'admin', status: 'active', emailVerified: false });

    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe('customer');
  });
});

describe('PATCH /api/v1/users/me/password', () => {
  it('changes the password and revokes existing sessions', async () => {
    await createUser({ email: 'cambiarpass@example.com' });
    const token = await login('cambiarpass@example.com', 'ClaveSegura#123');

    const res = await request(app)
      .patch('/api/v1/users/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'ClaveSegura#123',
        newPassword: 'NuevaClave#456',
        newPasswordConfirmation: 'NuevaClave#456',
      });

    expect(res.status).toBe(200);

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'cambiarpass@example.com', password: 'NuevaClave#456' });
    expect(loginRes.status).toBe(200);
  });

  it('rejects an incorrect current password', async () => {
    await createUser({ email: 'passincorrecto@example.com' });
    const token = await login('passincorrecto@example.com', 'ClaveSegura#123');

    const res = await request(app)
      .patch('/api/v1/users/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'Incorrecta#000',
        newPassword: 'NuevaClave#456',
        newPasswordConfirmation: 'NuevaClave#456',
      });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('CURRENT_PASSWORD_INCORRECT');
  });
});
