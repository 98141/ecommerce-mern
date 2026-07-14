const request = require('supertest');
const app = require('../../src/app');
const emailService = require('../../src/modules/notifications/email/email.service');
const { User } = require('../../src/modules/users/user.model');

const VALID_BODY = {
  firstName: 'Armando',
  lastName: 'Mora',
  email: 'verificar@example.com',
  password: 'ClaveSegura#123',
  passwordConfirmation: 'ClaveSegura#123',
};

async function registerAndGetToken(overrides = {}) {
  await request(app)
    .post('/api/v1/auth/register')
    .send({ ...VALID_BODY, ...overrides });

  const [, rawToken] = emailService.sendVerificationEmail.mock.calls.at(-1);
  return rawToken;
}

describe('POST /api/v1/auth/verify-email', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(emailService, 'sendVerificationEmail').mockResolvedValue(undefined);
    vi.spyOn(emailService, 'sendPasswordResetEmail').mockResolvedValue(undefined);
  });

  it('activates the account with a valid token', async () => {
    const rawToken = await registerAndGetToken();

    const res = await request(app).post('/api/v1/auth/verify-email').send({ token: rawToken });

    expect(res.status).toBe(200);

    const user = await User.findOne({ email: VALID_BODY.email });
    expect(user.emailVerified).toBe(true);
    expect(user.status).toBe('active');
    expect(user.emailVerifiedAt).not.toBeNull();
  });

  it('rejects an invalid token', async () => {
    const res = await request(app).post('/api/v1/auth/verify-email').send({ token: 'no-existe' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_VERIFICATION_TOKEN');
  });

  it('rejects a token that was already used', async () => {
    const rawToken = await registerAndGetToken({ email: 'reutilizado@example.com' });

    await request(app).post('/api/v1/auth/verify-email').send({ token: rawToken });
    const res = await request(app).post('/api/v1/auth/verify-email').send({ token: rawToken });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('TOKEN_ALREADY_USED');
  });
});

describe('POST /api/v1/auth/resend-verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(emailService, 'sendVerificationEmail').mockResolvedValue(undefined);
    vi.spyOn(emailService, 'sendPasswordResetEmail').mockResolvedValue(undefined);
  });

  it('always returns a generic response, even for unknown emails', async () => {
    const res = await request(app)
      .post('/api/v1/auth/resend-verification')
      .send({ email: 'no-existe@example.com' });

    expect(res.status).toBe(200);
    expect(emailService.sendVerificationEmail).not.toHaveBeenCalled();
  });

  it('issues a new token and invalidates the previous one', async () => {
    const firstToken = await registerAndGetToken({ email: 'reenvio@example.com' });

    await request(app).post('/api/v1/auth/resend-verification').send({ email: 'reenvio@example.com' });

    const res = await request(app).post('/api/v1/auth/verify-email').send({ token: firstToken });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('TOKEN_ALREADY_USED');
  });
});
