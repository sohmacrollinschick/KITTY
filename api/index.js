require('dotenv').config();

const app = require('../src/app');
const connectDB = require('../src/config/db');
const ensureDefaults = require('../src/seed/defaultContent');
const ensureAdminAccount = require('../src/seed/ensureAdminAccount');

let bootstrapPromise;

const bootstrap = async () => {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      await connectDB();
      await ensureDefaults();
      await ensureAdminAccount();
    })().catch((error) => {
      bootstrapPromise = null;
      throw error;
    });
  }

  return bootstrapPromise;
};

module.exports = async (req, res) => {
  await bootstrap();
  return app(req, res);
};
