const { hydrateUserFromRequest } = require('../utils/authState');

const requireAuth = async (req, res, next) => {
  try {
    const user = await hydrateUserFromRequest(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    return next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

const requireAdmin = (req, res, next) => {
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
