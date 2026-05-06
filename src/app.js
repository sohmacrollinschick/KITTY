const express = require('express');
const session = require('express-session');
const path = require('path');
const morgan = require('morgan');
const ensureAppReady = require('./config/bootstrap');

const publicApi = require('./routes/api/publicApi');
const adminApi = require('./routes/api/adminApi');
const authApi = require('./routes/api/auth');
const pages = require('./routes/pages');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Needed behind proxies (Render/Railway/Vercel/etc.) so secure cookies work.
if (isProduction) {
  app.set('trust proxy', 1);
}

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    // Session secret is loaded from env in production; fallback is only for local boot convenience.
    secret: process.env.SESSION_SECRET || 'dev-only-change-this-secret',
    name: 'kitten.sid',
    resave: false,
    saveUninitialized: false,
    proxy: isProduction,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 6
    }
  })
);

app.use('/assets', express.static(path.join(__dirname, '../public/assets')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

const requireAppReady = async (_req, res, next) => {
  try {
    await ensureAppReady();
    return next();
  } catch (error) {
    console.error('[bootstrap] request init failed:', error.message);
    return res.status(500).json({ message: 'Server configuration error. Check database and environment variables.' });
  }
};

app.use('/api/auth', requireAppReady, authApi);
// Alias endpoints (e.g. /api/verify-otp, /api/login-verify-otp) for simpler client integration.
app.use('/api', requireAppReady, authApi);
app.use('/api', requireAppReady, publicApi);
app.use('/api/admin', requireAppReady, adminApi);
app.use('/', pages);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Server error' });
});

module.exports = app;
