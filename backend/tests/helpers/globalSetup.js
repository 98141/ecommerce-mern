const fs = require('fs');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');

const URI_FILE = path.join(__dirname, '.mongo-uri.tmp');

module.exports = async function setup() {
  const mongod = await MongoMemoryServer.create();
  fs.writeFileSync(URI_FILE, mongod.getUri('ecommerce-test'), 'utf8');

  return async function teardown() {
    await mongod.stop();
    if (fs.existsSync(URI_FILE)) fs.unlinkSync(URI_FILE);
  };
};
