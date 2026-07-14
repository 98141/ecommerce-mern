const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const URI_FILE = path.join(__dirname, '.mongo-uri.tmp');

process.env.NODE_ENV = 'test';
process.env.MONGO_URI = fs.readFileSync(URI_FILE, 'utf8').trim();
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test-only-access-secret-0123456789';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-only-refresh-secret-0123456789';
process.env.AUTH_MAX_FAILED_ATTEMPTS = process.env.AUTH_MAX_FAILED_ATTEMPTS || '5';
process.env.AUTH_LOCK_MINUTES = process.env.AUTH_LOCK_MINUTES || '15';
process.env.COOKIE_SECURE = 'false';
process.env.COOKIE_SAME_SITE = 'lax';

beforeAll(async () => {
  const { connectDatabase } = require('../../src/config/database');
  await connectDatabase();
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
});
