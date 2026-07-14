const { generateRawToken, hashToken } = require('../../src/shared/utils/token.util');

describe('token.util', () => {
  it('generates a random raw token of sufficient length', () => {
    const token = generateRawToken();
    expect(token).toHaveLength(64);
  });

  it('generates different tokens on each call', () => {
    expect(generateRawToken()).not.toBe(generateRawToken());
  });

  it('hashes a token deterministically', () => {
    const raw = generateRawToken();
    expect(hashToken(raw)).toBe(hashToken(raw));
  });

  it('produces different hashes for different tokens', () => {
    expect(hashToken(generateRawToken())).not.toBe(hashToken(generateRawToken()));
  });
});
