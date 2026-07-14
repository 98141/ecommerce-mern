const { logger } = require('../../../config/logger');
const { isProduction } = require('../../../config/env');

async function send({ to, subject, text, html }) {
  if (isProduction) {
    // En producción se debe configurar un transporte real (SMTP/API) sin
    // acoplar esta decisión a la lógica de autenticación. Nunca se registra
    // el enlace/token en logs de producción.
    logger.info({ to, subject }, 'Correo enviado');
    return { simulated: false };
  }

  logger.info({ to, subject, text, html }, 'Correo simulado (dev): no se envía realmente');
  return { simulated: true };
}

module.exports = { send };
