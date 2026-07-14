const mongoose = require('mongoose');
const { env } = require('./env');
const { logger } = require('./logger');

async function connectDatabase() {
  mongoose.set('strictQuery', true);

  await mongoose.connect(env.MONGO_URI);

  logger.info({ db: mongoose.connection.name }, 'MongoDB conectado');

  return mongoose.connection;
}

async function disconnectDatabase() {
  await mongoose.disconnect();
}

module.exports = { connectDatabase, disconnectDatabase };
