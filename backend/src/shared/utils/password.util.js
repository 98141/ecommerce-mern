const argon2 = require('argon2');

async function hashPassword(plainPassword) {
  return argon2.hash(plainPassword, { type: argon2.argon2id });
}

async function verifyPassword(passwordHash, plainPassword) {
  return argon2.verify(passwordHash, plainPassword);
}

module.exports = { hashPassword, verifyPassword };
