const { env } = require('../config/env');
const { logger } = require('../config/logger');
const { connectDatabase, disconnectDatabase } = require('../config/database');
const userRepository = require('../modules/users/user.repository');
const { hashPassword } = require('../shared/utils/password.util');
const { ROLES } = require('../shared/constants/roles');
const { USER_STATUS } = require('../shared/constants/userStatus');

async function seedAdmin() {
  if (!env.SEED_ADMIN_EMAIL || !env.SEED_ADMIN_PASSWORD) {
    logger.warn('SEED_ADMIN_EMAIL o SEED_ADMIN_PASSWORD no están definidos, se omite el seed del administrador');
    return;
  }

  const existing = await userRepository.findByEmail(env.SEED_ADMIN_EMAIL);

  if (existing) {
    logger.info('El administrador ya existe, no se crea de nuevo');
    return;
  }

  const passwordHash = await hashPassword(env.SEED_ADMIN_PASSWORD);

  await userRepository.createUser({
    firstName: env.SEED_ADMIN_FIRST_NAME,
    lastName: env.SEED_ADMIN_LAST_NAME,
    email: env.SEED_ADMIN_EMAIL,
    passwordHash,
    role: ROLES.ADMIN,
    status: USER_STATUS.ACTIVE,
    emailVerified: true,
    emailVerifiedAt: new Date(),
  });

  logger.info('Administrador creado correctamente');
}

async function run() {
  await connectDatabase();
  await seedAdmin();
  await disconnectDatabase();
}

if (require.main === module) {
  run()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error({ error }, 'Error al ejecutar el seed del administrador');
      process.exit(1);
    });
}

module.exports = { seedAdmin };
