const request = require('supertest');
const app = require('../../src/app');
const { createUser } = require('../helpers/factories');
const { RefreshSession } = require('../../src/modules/sessions/refreshSession.model');
const { User } = require('../../src/modules/users/user.model');
const { USER_STATUS } = require('../../src/shared/constants/userStatus');

async function loginAndGetCookie(email, password) {
  const res = await request(app).post('/api/v1/auth/login').send({ email, password });
  return res.headers['set-cookie'][0];
}

describe('POST /api/v1/auth/refresh', () => {
  it('rotates the refresh token and issues a new access token', async () => {
    await createUser({ email: 'refresh@example.com' });
    const cookie = await loginAndGetCookie('refresh@example.com', 'ClaveSegura#123');

    const res = await request(app).post('/api/v1/auth/refresh').set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.headers['set-cookie'][0]).not.toBe(cookie);

    const sessions = await RefreshSession.find({});
    expect(sessions).toHaveLength(2);
    expect(sessions.filter((s) => s.revokedAt).length).toBe(1);
  });

  it('fails when no cookie is sent', async () => {
    const res = await request(app).post('/api/v1/auth/refresh');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('REFRESH_TOKEN_MISSING');
  });

  it('fails with an unknown refresh token', async () => {
    const res = await request(app).post('/api/v1/auth/refresh').set('Cookie', 'refresh_token=no-existe');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_REFRESH_TOKEN');
  });

  it('detects reuse of a rotated token and revokes the whole family', async () => {
    await createUser({ email: 'reuse@example.com' });
    const originalCookie = await loginAndGetCookie('reuse@example.com', 'ClaveSegura#123');

    const rotateRes = await request(app).post('/api/v1/auth/refresh').set('Cookie', originalCookie);
    const rotatedCookie = rotateRes.headers['set-cookie'][0];

    const reuseRes = await request(app).post('/api/v1/auth/refresh').set('Cookie', originalCookie);
    expect(reuseRes.status).toBe(403);
    expect(reuseRes.body.error.code).toBe('SESSION_REUSE_DETECTED');

    const afterReuse = await request(app).post('/api/v1/auth/refresh').set('Cookie', rotatedCookie);
    expect(afterReuse.status).toBe(403);
    expect(afterReuse.body.error.code).toBe('SESSION_REUSE_DETECTED');
  });

  it('fails when the refresh token expired', async () => {
    await createUser({ email: 'expirado@example.com' });
    const cookie = await loginAndGetCookie('expirado@example.com', 'ClaveSegura#123');

    await RefreshSession.updateMany({}, { expiresAt: new Date(Date.now() - 1000) });

    const res = await request(app).post('/api/v1/auth/refresh').set('Cookie', cookie);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('EXPIRED_REFRESH_TOKEN');
  });

  it('fails and revokes sessions when the user is blocked', async () => {
    await createUser({ email: 'bloqueorefresh@example.com' });
    const cookie = await loginAndGetCookie('bloqueorefresh@example.com', 'ClaveSegura#123');

    await User.updateOne({ email: 'bloqueorefresh@example.com' }, { status: USER_STATUS.BLOCKED });

    const res = await request(app).post('/api/v1/auth/refresh').set('Cookie', cookie);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('ACCOUNT_BLOCKED');
  });
});
