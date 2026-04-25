const User = require('../models/User');
const jwt = require('jsonwebtoken');

const MAIN_ADMIN_EMAIL = 'sohmacrollins99@gmail.com';

const hydrateUserFromSession = async (req) => {
  if (!req.session?.user?.id) return null;

  const dbUser = await User.findById(req.session.user.id)
    .select('fullName email role')
    .lean();

  if (!dbUser) return null;

  const effectiveRole = dbUser.email?.toLowerCase() === MAIN_ADMIN_EMAIL ? 'admin' : dbUser.role;

  const user = {
    id: dbUser._id.toString(),
    fullName: dbUser.fullName,
    email: dbUser.email,
    role: effectiveRole
  };

  req.session.user = user;
  req.user = user;
  return user;
};

const hydrateUserFromBearer = async (req) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7).trim();
  if (!token) return null;

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET || process.env.SESSION_SECRET || 'dev-jwt-secret'
  );

  const dbUser = await User.findById(decoded.id).select('fullName email role').lean();
  if (!dbUser) return null;

  const effectiveRole = dbUser.email?.toLowerCase() === MAIN_ADMIN_EMAIL ? 'admin' : dbUser.role;

  const user = {
    id: dbUser._id.toString(),
    fullName: dbUser.fullName,
    email: dbUser.email,
    role: effectiveRole
  };

  req.user = user;
  return user;
};

const requireAuth = async (req, res, next) => {
  try {
    let user = await hydrateUserFromSession(req);
    if (!user) user = await hydrateUserFromBearer(req);
    console.log('Decoded user:', user);
    console.log('User role:', user?.role);
    console.log('Route:', req.originalUrl);

    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    return next();
  } catch (error) {
    console.log('[auth] requireAuth error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

const requireAdmin = (req, res, next) => {
  console.log('Decoded user:', req.user);
  console.log('User role:', req.user?.role);
  console.log('Route:', req.originalUrl);

  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  return next();
};

const requireRole = (role) => [
  requireAuth,
  (req, res, next) => {
    if (req.user?.role !== role) return res.status(403).json({ message: 'Access denied' });
    return next();
  }
];

const requireUser = requireRole('user');

module.exports = {
  requireAuth,
  requireAdmin,
  requireRole,
  requireUser
};
