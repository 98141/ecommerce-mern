const request = require('supertest');
const app = require('../../src/app');
const { createUser, createAdmin } = require('../helpers/factories');
const { RefreshSession } = require('../../src/modules/sessions/refreshSession.model');

async function login(email, password) {
  const res = await request(app).post('/api/v1/auth/login').send({ email, password });
  return res.body.data.accessToken;
}

describe('GET /api/v1/admin/customers', () => {
  it('lists customers with pagination and never exposes sensitive fields', async () => {
    await createAdmin({ email: 'admin1@example.com' });
    await createUser({ email: 'clienteuno@example.com' });
    await createUser({ email: 'clientedos@example.com' });
    const token = await login('admin1@example.com', 'ClaveSegura#123');

    const res = await request(app)
      .get('/api/v1/admin/customers?page=1&limit=20')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBeGreaterThanOrEqual(2);
    expect(res.body.data.pagination).toMatchObject({ page: 1, limit: 20 });
    expect(res.body.data.items[0].passwordHash).toBeUndefined();
  });

  it('never includes admin accounts in the customer list', async () => {
    await createAdmin({ email: 'admin1b@example.com' });
    const token = await login('admin1b@example.com', 'ClaveSegura#123');

    const res = await request(app)
      .get('/api/v1/admin/customers?page=1&limit=50')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items.some((item) => item.email === 'admin1b@example.com')).toBe(false);
  });

  it('filters by search term', async () => {
    await createAdmin({ email: 'admin2@example.com' });
    await createUser({ email: 'unicorio@example.com', firstName: 'Unicorio' });
    const token = await login('admin2@example.com', 'ClaveSegura#123');

    const res = await request(app)
      .get('/api/v1/admin/customers?search=Unicorio')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items.some((item) => item.email === 'unicorio@example.com')).toBe(true);
  });
});

describe('GET /api/v1/admin/customers/:id', () => {
  it('returns the customer detail', async () => {
    await createAdmin({ email: 'admin3@example.com' });
    const { user: customer } = await createUser({ email: 'detalle@example.com' });
    const token = await login('admin3@example.com', 'ClaveSegura#123');

    const res = await request(app)
      .get(`/api/v1/admin/customers/${customer._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('detalle@example.com');
  });

  it('returns USER_NOT_FOUND for a non-existent id', async () => {
    await createAdmin({ email: 'admin4@example.com' });
    const token = await login('admin4@example.com', 'ClaveSegura#123');

    const res = await request(app)
      .get('/api/v1/admin/customers/64b64b64b64b64b64b64b64b')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('USER_NOT_FOUND');
  });

  it('returns USER_NOT_FOUND when the target is another admin, not a customer', async () => {
    await createAdmin({ email: 'admin4b@example.com' });
    const { user: otherAdmin } = await createAdmin({ email: 'admin4c@example.com' });
    const token = await login('admin4b@example.com', 'ClaveSegura#123');

    const res = await request(app)
      .get(`/api/v1/admin/customers/${otherAdmin._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('USER_NOT_FOUND');
  });
});

describe('PATCH /api/v1/admin/customers/:id/status', () => {
  it('blocks a customer and revokes their active sessions', async () => {
    await createAdmin({ email: 'admin5@example.com' });
    const { user: customer } = await createUser({ email: 'bloquear@example.com' });
    await login('bloquear@example.com', 'ClaveSegura#123');
    const adminToken = await login('admin5@example.com', 'ClaveSegura#123');

    const res = await request(app)
      .patch(`/api/v1/admin/customers/${customer._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'blocked', reason: 'Actividad sospechosa' });

    expect(res.status).toBe(200);
    expect(res.body.data.user.status).toBe('blocked');

    const sessions = await RefreshSession.find({ userId: customer._id });
    expect(sessions.every((s) => s.revokedAt)).toBe(true);

    const blockedLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'bloquear@example.com', password: 'ClaveSegura#123' });
    expect(blockedLogin.status).toBe(403);
    expect(blockedLogin.body.error.code).toBe('ACCOUNT_BLOCKED');
  });

  it('unblocks a customer', async () => {
    await createAdmin({ email: 'admin6@example.com' });
    const { user: customer } = await createUser({ email: 'desbloquear@example.com', status: 'blocked' });
    const adminToken = await login('admin6@example.com', 'ClaveSegura#123');

    const res = await request(app)
      .patch(`/api/v1/admin/customers/${customer._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'active', reason: 'Validación completada' });

    expect(res.status).toBe(200);
    expect(res.body.data.user.status).toBe('active');
  });

  it('prevents an admin from blocking themselves', async () => {
    const { user: admin } = await createAdmin({ email: 'admin7@example.com' });
    const adminToken = await login('admin7@example.com', 'ClaveSegura#123');

    const res = await request(app)
      .patch(`/api/v1/admin/customers/${admin._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'blocked' });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('CANNOT_BLOCK_SELF');
  });
});
