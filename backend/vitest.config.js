const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    environment: 'node',
    globals: true,
    hookTimeout: 30000,
    testTimeout: 30000,
    setupFiles: ['./tests/helpers/setup.js'],
    globalSetup: ['./tests/helpers/globalSetup.js'],
    fileParallelism: false,
  },
});
