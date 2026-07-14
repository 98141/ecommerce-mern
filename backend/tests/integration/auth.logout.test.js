const request = require('supertest');
const app = require('../../src/app');
const { createUser } = require('../helpers/factories');
const { RefreshSession } = require('../../src/modules/sessions/refreshSession.model');

async function login(email, password) {
  const res = await request(app).post('/api/v1/auth/login').send({ email, password });
  return { cookie: res.headers['set-cookie'][0], accessToken: res.body.data.accessToken };
}

describe('POST /api/v1/auth/logout', () => {
  it('revokes the current session and clears the cookie', async () => {
    await createUser({ email: 'logout@example.com' });
    const { cookie } = await login('logout@example.com', 'ClaveSegura#123');

    const res = await request(app).post('/api/v1/auth/logout').set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.headers['set-cookie'][0]).toMatch(/refresh_token=;/);

    const sessions = await RefreshSession.find({});
    expect(sessions[0].revokedAt).not.toBeNull();
  });

  it('is idempotent when called without a cookie or twice', async () => {
    const res1 = await request(app).post('/api/v1/auth/logout');
    expect(res1.status).toBe(200);

    await createUser({ email: 'logouttwice@example.com' });
    const { cookie } = await login('logouttwice@example.com', 'ClaveSegura#123');

    await request(app).post('/api/v1/auth/logout').set('Cookie', cookie);
    const res2 = await request(app).post('/api/v1/auth/logout').set('Cookie', cookie);
    expect(res2.status).toBe(200);
  });
});

describe('POST /api/v1/auth/logout-all', () => {
  it('revokes every active session for the user', async () => {
    await createUser({ email: 'logoutall@example.com' });
    const { cookie: cookie1, accessToken } = await login('logoutall@example.com', 'ClaveSegura#123');
    await login('logoutall@example.com', 'ClaveSegura#123');

    const res = await request(app)
      .post('/api/v1/auth/logout-all')
      .set('Cookie', cookie1)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);

    const sessions = await RefreshSession.find({});
    expect(sessions.every((s) => s.revokedAt)).toBe(true);
  });

  it('requires authentication', async () => {
    const res = await request(app).post('/api/v1/auth/logout-all');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });
});
