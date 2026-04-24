require('dotenv').config();
const connectDB = require('./config/db');
const ensureDefaults = require('./seed/defaultContent');
const ensureAdminAccount = require('./seed/ensureAdminAccount');
const app = require('./app');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  await ensureDefaults();
  await ensureAdminAccount();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start().catch((error) => {
  console.error('Startup error:', error.message);
  process.exit(1);
});
