const app = require('./app');
const { env } = require('./config/env');
const { connectDatabase } = require('./config/database');
const { logger } = require('./config/logger');

let server;

async function start() {
  await connectDatabase();

  server = app.listen(env.PORT, () => {
    logger.info(`Servidor escuchando en el puerto ${env.PORT}`);
  });
}

function shutdown(signal) {
  logger.info(`Recibida señal ${signal}, cerrando servidor...`);

  if (server) {
    server.close(() => process.exit(0));
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled rejection');
});

start().catch((error) => {
  logger.error({ error }, 'Error al iniciar el servidor');
  process.exit(1);
});
