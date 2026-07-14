const request = require('supertest');
const app = require('../../src/app');
const { createUser } = require('../helpers/factories');
const { RefreshSession } = require('../../src/modules/sessions/refreshSession.model');
const { User } = require('../../src/modules/users/user.model');
const { USER_STATUS } = require('../../src/shared/constants/userStatus');

describe('POST /api/v1/auth/login', () => {
  it('logs in successfully and sets an HttpOnly refresh cookie', async () => {
    const { user, password } = await createUser({ email: 'login@example.com' });

    const res = await request(app).post('/api/v1/auth/login').send({ email: 'login@example.com', password });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.user.email).toBe('login@example.com');
    expect(res.body.data.refreshToken).toBeUndefined();

    const cookieHeader = res.headers['set-cookie'][0];
    expect(cookieHeader).toMatch(/refresh_token=/);
    expect(cookieHeader).toMatch(/HttpOnly/i);

    const sessions = await RefreshSession.find({ userId: user._id });
    expect(sessions).toHaveLength(1);
    expect(sessions[0].tokenHash).not.toBe(cookieHeader);
  });

  it('rejects an incorrect password without revealing which field failed', async () => {
    await createUser({ email: 'wrongpass@example.com' });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'wrongpass@example.com', password: 'Incorrecta#123' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('rejects a non-existent email with the same generic error', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'no-existe@example.com', password: 'ClaveSegura#123' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('rejects a non-verified user', async () => {
    const { password } = await createUser({
      email: 'noverificado@example.com',
      status: USER_STATUS.PENDING_VERIFICATION,
      emailVerified: false,
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'noverificado@example.com', password });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('EMAIL_NOT_VERIFIED');
  });

  it('rejects a blocked user', async () => {
    const { password } = await createUser({ email: 'bloqueado@example.com', status: USER_STATUS.BLOCKED });

    const res = await request(app).post('/api/v1/auth/login').send({ email: 'bloqueado@example.com', password });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('ACCOUNT_BLOCKED');
  });

  it('locks the account after too many failed attempts and resets the counter after success', async () => {
    const { password } = await createUser({ email: 'intentos@example.com' });

    for (let i = 0; i < 5; i += 1) {
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'intentos@example.com', password: 'Incorrecta#123' });
    }

    const lockedRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'intentos@example.com', password });

    expect(lockedRes.status).toBe(403);
    expect(lockedRes.body.error.code).toBe('ACCOUNT_TEMPORARILY_LOCKED');

    await User.updateOne({ email: 'intentos@example.com' }, { lockUntil: null, failedLoginAttempts: 0 });

    const successRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'intentos@example.com', password });

    expect(successRes.status).toBe(200);

    const user = await User.findOne({ email: 'intentos@example.com' }).select('+failedLoginAttempts');
    expect(user.failedLoginAttempts).toBe(0);
  });
});
