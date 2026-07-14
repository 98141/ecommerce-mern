const { hashPassword, verifyPassword } = require('../../src/shared/utils/password.util');

describe('password.util', () => {
  it('hashes a password using argon2id', async () => {
    const hash = await hashPassword('ClaveSegura#123');
    expect(hash).toMatch(/^\$argon2id\$/);
  });

  it('verifies a correct password against its hash', async () => {
    const hash = await hashPassword('ClaveSegura#123');
    await expect(verifyPassword(hash, 'ClaveSegura#123')).resolves.toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword('ClaveSegura#123');
    await expect(verifyPassword(hash, 'OtraClave#456')).resolves.toBe(false);
  });
});
