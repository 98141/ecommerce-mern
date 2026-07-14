const parseDurationToMs = require('../../src/shared/utils/duration.util');

describe('duration.util', () => {
  it('parses minutes', () => {
    expect(parseDurationToMs('15m')).toBe(15 * 60 * 1000);
  });

  it('parses days', () => {
    expect(parseDurationToMs('7d')).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('throws on invalid format', () => {
    expect(() => parseDurationToMs('abc')).toThrow();
  });
});
