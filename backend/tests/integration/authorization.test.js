const request = require('supertest');
const app = require('../../src/app');
const { createUser, createAdmin } = require('../helpers/factories');
const { USER_STATUS } = require('../../src/shared/constants/userStatus');

async function login(email, password) {
  const res = await request(app).post('/api/v1/auth/login').send({ email, password });
  return res.body.data.accessToken;
}

describe('authenticate / authorize middlewares', () => {
  it('allows a customer to access a customer route', async () => {
    await createUser({ email: 'cliente@example.com' });
    const token = await login('cliente@example.com', 'ClaveSegura#123');

    const res = await request(app).get('/api/v1/users/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('blocks a customer from an admin-only route', async () => {
    await createUser({ email: 'clienteadmin@example.com' });
    const token = await login('clienteadmin@example.com', 'ClaveSegura#123');

    const res = await request(app).get('/api/v1/admin/customers').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('allows an admin to access an admin-only route', async () => {
    await createAdmin({ email: 'admin@example.com' });
    const token = await login('admin@example.com', 'ClaveSegura#123');

    const res = await request(app).get('/api/v1/admin/customers').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('rejects an invalid access token', async () => {
    const res = await request(app).get('/api/v1/users/me').set('Authorization', 'Bearer no-es-un-jwt');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_ACCESS_TOKEN');
  });

  it('rejects requests without a token', async () => {
    const res = await request(app).get('/api/v1/users/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  it('rejects a blocked user even with a previously valid token', async () => {
    const { user } = await createUser({ email: 'bloqueadoauth@example.com' });
    const token = await login('bloqueadoauth@example.com', 'ClaveSegura#123');

    user.status = USER_STATUS.BLOCKED;
    await user.save();

    const res = await request(app).get('/api/v1/users/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('ACCOUNT_BLOCKED');
  });
});
