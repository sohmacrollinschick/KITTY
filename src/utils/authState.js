const jwt = require('jsonwebtoken');
const User = require('../models/User');

const AUTH_COOKIE_NAME = 'kitten.auth';
const SESSION_COOKIE_NAME = 'kitten.sid';
const DEFAULT_ADMIN_EMAIL = 'sohmacrollins99@gmail.com';
const DEFAULT_ADMIN_PASSWORD = '123456mac';

const isProduction = process.env.NODE_ENV === 'production';
const mainAdminEmail = (process.env.ADMIN_SEED_EMAIL || DEFAULT_ADMIN_EMAIL).toLowerCase();
const mainAdminPassword = process.env.ADMIN_SEED_PASSWORD || DEFAULT_ADMIN_PASSWORD;

const getTokenSecret = () =>
  process.env.JWT_SECRET || process.env.SESSION_SECRET || 'dev-jwt-secret';

const getCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 1000 * 60 * 60 * 6,
  path: '/'
});

const getClearCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/'
});

const parseCookies = (cookieHeader = '') =>
  cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const separatorIndex = part.indexOf('=');
      if (separatorIndex === -1) return acc;
      const key = part.slice(0, separatorIndex).trim();
      const value = decodeURIComponent(part.slice(separatorIndex + 1).trim());
      acc[key] = value;
      return acc;
    }, {});

const buildAuthUser = (user) => ({
  id: user._id?.toString?.() || user.id?.toString?.(),
  fullName: user.fullName,
  email: user.email,
  role: user.email?.toLowerCase?.() === mainAdminEmail ? 'admin' : user.role
});

const signAuthToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    getTokenSecret(),
    { expiresIn: '6h' }
  );

const persistAuth = (req, res, user) => {
  const authUser = buildAuthUser(user);
  const token = signAuthToken(authUser);

  if (req.session) {
    req.session.user = authUser;
  }

  res.cookie(AUTH_COOKIE_NAME, token, getCookieOptions());
  req.user = authUser;

  return { authUser, token };
};

const clearAuth = (req, res, callback) => {
  res.clearCookie(AUTH_COOKIE_NAME, getClearCookieOptions());
  res.clearCookie(SESSION_COOKIE_NAME, getClearCookieOptions());

  if (!req.session) {
    if (callback) callback();
    return;
  }

  req.session.destroy(() => {
    if (callback) callback();
  });
};

const hydrateUserFromRequest = async (req) => {
  if (req.user?.id) return req.user;

  if (req.session?.user?.id) {
    const dbUser = await User.findById(req.session.user.id).select('fullName email role').lean();
    if (dbUser) {
      const authUser = buildAuthUser(dbUser);
      req.session.user = authUser;
      req.user = authUser;
      return authUser;
    }
  }

  const cookies = parseCookies(req.headers.cookie || '');
  const token = cookies[AUTH_COOKIE_NAME];
  if (!token) return null;

  const decoded = jwt.verify(token, getTokenSecret());
  const dbUser = await User.findById(decoded.id).select('fullName email role').lean();
  if (!dbUser) return null;

  const authUser = buildAuthUser(dbUser);
  if (req.session) req.session.user = authUser;
  req.user = authUser;
  return authUser;
};

module.exports = {
  AUTH_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  clearAuth,
  getTokenSecret,
  hydrateUserFromRequest,
  mainAdminEmail,
  mainAdminPassword,
  persistAuth,
  signAuthToken
};
