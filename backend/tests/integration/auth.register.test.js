const request = require('supertest');
const app = require('../../src/app');
const emailService = require('../../src/modules/notifications/email/email.service');
const { User } = require('../../src/modules/users/user.model');
const { createUser } = require('../helpers/factories');

const VALID_BODY = {
  firstName: 'Armando',
  lastName: 'Mora',
  email: 'armando@example.com',
  phone: '3001234567',
  password: 'ClaveSegura#123',
  passwordConfirmation: 'ClaveSegura#123',
};

describe('POST /api/v1/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(emailService, 'sendVerificationEmail').mockResolvedValue(undefined);
    vi.spyOn(emailService, 'sendPasswordResetEmail').mockResolvedValue(undefined);
  });

  it('registers a new customer with pending_verification status', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(VALID_BODY);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toMatchObject({
      firstName: 'Armando',
      lastName: 'Mora',
      email: 'armando@example.com',
      role: 'customer',
      status: 'pending_verification',
      emailVerified: false,
    });
    expect(res.body.data.user.passwordHash).toBeUndefined();

    const stored = await User.findOne({ email: 'armando@example.com' }).select('+passwordHash');
    expect(stored.passwordHash).not.toBe(VALID_BODY.password);
    expect(emailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
  });

  it('ignores a role sent in the body and forces customer', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...VALID_BODY, email: 'hacker@example.com', role: 'admin' });

    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('customer');
  });

  it('rejects a duplicate email (case-insensitive)', async () => {
    await createUser({ email: 'duplicado@example.com' });

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...VALID_BODY, email: 'Duplicado@Example.com' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_ALREADY_REGISTERED');
  });

  it('rejects mismatched password confirmation', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...VALID_BODY, email: 'otro@example.com', passwordConfirmation: 'Otra#12345' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('PASSWORDS_DO_NOT_MATCH');
  });

  it('rejects a weak password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...VALID_BODY, email: 'debil@example.com', password: 'abc', passwordConfirmation: 'abc' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
