require('dotenv').config();
const ensureAppReady = require('./config/bootstrap');
const app = require('./app');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await ensureAppReady();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start().catch((error) => {
  console.error('Startup error:', error.message);
  process.exit(1);
});
