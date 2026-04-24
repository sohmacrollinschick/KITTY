const User = require('../models/User');

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

const requireAuth = async (req, res, next) => {
  try {
    const user = await hydrateUserFromSession(req);
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
