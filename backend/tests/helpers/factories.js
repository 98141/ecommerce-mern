const { User } = require('../../src/modules/users/user.model');
const { hashPassword } = require('../../src/shared/utils/password.util');
const { ROLES } = require('../../src/shared/constants/roles');
const { USER_STATUS } = require('../../src/shared/constants/userStatus');

const DEFAULT_PASSWORD = 'ClaveSegura#123';

async function createUser(overrides = {}) {
  const { password = DEFAULT_PASSWORD, ...rest } = overrides;
  const passwordHash = await hashPassword(password);

  const user = await User.create({
    firstName: 'Test',
    lastName: 'User',
    email: `user${Date.now()}${Math.random().toString(16).slice(2)}@example.com`,
    passwordHash,
    role: ROLES.CUSTOMER,
    status: USER_STATUS.ACTIVE,
    emailVerified: true,
    emailVerifiedAt: new Date(),
    ...rest,
  });

  return { user, password };
}

async function createAdmin(overrides = {}) {
  return createUser({ role: ROLES.ADMIN, ...overrides });
}

module.exports = { createUser, createAdmin, DEFAULT_PASSWORD };
