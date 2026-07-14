const UNIT_MS = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

function parseDurationToMs(duration) {
  const match = /^(\d+)(ms|s|m|h|d)$/.exec(duration.trim());

  if (!match) {
    throw new Error(`Formato de duración inválido: ${duration}`);
  }

  const [, amount, unit] = match;
  return Number(amount) * UNIT_MS[unit];
}

module.exports = parseDurationToMs;
