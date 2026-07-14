const request = require('supertest');
const app = require('../../src/app');
const emailService = require('../../src/modules/notifications/email/email.service');
const { createUser } = require('../helpers/factories');
const { RefreshSession } = require('../../src/modules/sessions/refreshSession.model');

describe('POST /api/v1/auth/forgot-password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(emailService, 'sendVerificationEmail').mockResolvedValue(undefined);
    vi.spyOn(emailService, 'sendPasswordResetEmail').mockResolvedValue(undefined);
  });

  it('returns a generic response for an existing email and sends a token', async () => {
    await createUser({ email: 'recuperar@example.com' });

    const res = await request(app).post('/api/v1/auth/forgot-password').send({ email: 'recuperar@example.com' });

    expect(res.status).toBe(200);
    expect(emailService.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
  });

  it('returns the exact same generic response for a non-existent email', async () => {
    const existingRes = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'no-existe-2@example.com' });

    expect(existingRes.status).toBe(200);
    expect(existingRes.body.message).toBe('Si existe una cuenta asociada, enviaremos instrucciones.');
    expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
  });
});

describe('POST /api/v1/auth/reset-password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(emailService, 'sendVerificationEmail').mockResolvedValue(undefined);
    vi.spyOn(emailService, 'sendPasswordResetEmail').mockResolvedValue(undefined);
  });

  it('resets the password with a valid token and revokes existing sessions', async () => {
    const { user } = await createUser({ email: 'reset@example.com' });

    await request(app).post('/api/v1/auth/login').send({ email: 'reset@example.com', password: 'ClaveSegura#123' });

    await request(app).post('/api/v1/auth/forgot-password').send({ email: 'reset@example.com' });
    const [, rawToken] = emailService.sendPasswordResetEmail.mock.calls.at(-1);

    const res = await request(app).post('/api/v1/auth/reset-password').send({
      token: rawToken,
      password: 'NuevaClave#456',
      passwordConfirmation: 'NuevaClave#456',
    });

    expect(res.status).toBe(200);

    const sessions = await RefreshSession.find({ userId: user._id });
    expect(sessions.every((s) => s.revokedAt)).toBe(true);

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'reset@example.com', password: 'NuevaClave#456' });
    expect(loginRes.status).toBe(200);
  });

  it('rejects an expired or already used token', async () => {
    await createUser({ email: 'resetusado@example.com' });
    await request(app).post('/api/v1/auth/forgot-password').send({ email: 'resetusado@example.com' });
    const [, rawToken] = emailService.sendPasswordResetEmail.mock.calls.at(-1);

    await request(app).post('/api/v1/auth/reset-password').send({
      token: rawToken,
      password: 'NuevaClave#456',
      passwordConfirmation: 'NuevaClave#456',
    });

    const res = await request(app).post('/api/v1/auth/reset-password').send({
      token: rawToken,
      password: 'OtraClave#789',
      passwordConfirmation: 'OtraClave#789',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('TOKEN_ALREADY_USED');
  });

  it('rejects mismatched password confirmation', async () => {
    const res = await request(app).post('/api/v1/auth/reset-password').send({
      token: 'cualquiera',
      password: 'NuevaClave#456',
      passwordConfirmation: 'Distinta#789',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('PASSWORDS_DO_NOT_MATCH');
  });
});
