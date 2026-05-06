const connectDB = require('./db');
const ensureDefaults = require('../seed/defaultContent');
const ensureAdminAccount = require('../seed/ensureAdminAccount');

let bootstrapPromise;

const ensureAppReady = async () => {
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

module.exports = ensureAppReady;
