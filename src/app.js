const express = require('express');
const session = require('express-session');
const path = require('path');
const morgan = require('morgan');

const publicApi = require('./routes/api/publicApi');
const adminApi = require('./routes/api/adminApi');
const authApi = require('./routes/api/auth');
const pages = require('./routes/pages');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    // Session secret is loaded from env in production; fallback is only for local boot convenience.
    secret: process.env.SESSION_SECRET || 'dev-only-change-this-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 6
    }
  })
);

app.use('/assets', express.static(path.join(__dirname, '../public/assets')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.use('/api/auth', authApi);
app.use('/api', publicApi);
app.use('/api/admin', adminApi);
app.use('/', pages);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Server error' });
});

module.exports = app;
