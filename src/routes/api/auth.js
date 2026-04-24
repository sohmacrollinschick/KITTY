const express = require('express');
const User = require('../../models/User');
const validate = require('../../middleware/validate');
const { loginValidation, registerValidation } = require('../../middleware/validators');
const { loginLimiter, registerLimiter } = require('../../middleware/rateLimiters');

const router = express.Router();
const MAIN_ADMIN_EMAIL = 'sohmacrollins99@gmail.com';
const MAIN_ADMIN_PASSWORD = '123456mac';

router.post('/register', registerLimiter, registerValidation, validate, async (req, res) => {
  const { fullName, email, password } = req.body;
  const normalizedEmail = email.toLowerCase();

  if (normalizedEmail === MAIN_ADMIN_EMAIL) {
    return res.status(403).json({ message: 'This email is reserved for admin login' });
  }

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) return res.status(409).json({ message: 'Email already registered' });

  await User.create({ fullName, email: normalizedEmail, password, role: 'user' });
  return res.status(201).json({ message: 'Registration successful. Please login.' });
});

router.post('/login', loginLimiter, loginValidation, validate, async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase();

  // Always honor main admin credentials and ensure role consistency.
  if (normalizedEmail === MAIN_ADMIN_EMAIL && password === MAIN_ADMIN_PASSWORD) {
    let admin = await User.findOne({ email: MAIN_ADMIN_EMAIL });
    if (!admin) {
      admin = await User.create({
        fullName: 'Primary Admin',
        email: MAIN_ADMIN_EMAIL,
        password: MAIN_ADMIN_PASSWORD,
        role: 'admin'
      });
    } else if (admin.role !== 'admin') {
      admin.role = 'admin';
      admin.password = MAIN_ADMIN_PASSWORD;
      await admin.save();
    }

    req.session.user = {
      id: admin._id.toString(),
      fullName: admin.fullName,
      email: admin.email,
      role: 'admin'
    };
    console.log('[auth][login] admin login success', {
      email: admin.email,
      role: 'admin'
    });
    return req.session.save((err) => {
      if (err) return res.status(500).json({ message: 'Session save failed' });
      return res.json({ message: 'Login successful', role: 'admin', redirectTo: '/admin/dashboard' });
    });
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

  req.session.user = {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    role: user.role
  };

  const redirectTo = user.role === 'admin' ? '/admin/dashboard' : '/home';
  console.log('[auth][login] user login success', {
    email: user.email,
    role: user.role,
    redirectTo
  });
  return req.session.save((err) => {
    if (err) return res.status(500).json({ message: 'Session save failed' });
    return res.json({ message: 'Login successful', role: user.role, redirectTo });
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

router.get('/me', (req, res) => {
  if (!req.session?.user?.id) return res.status(401).json({ message: 'Unauthorized' });

  return User.findById(req.session.user.id)
    .select('fullName email role')
    .lean()
    .then((user) => {
      if (!user) return res.status(401).json({ message: 'Unauthorized' });

      const effectiveRole = user.email?.toLowerCase() === MAIN_ADMIN_EMAIL ? 'admin' : user.role;
      req.session.user = {
        id: req.session.user.id,
        fullName: user.fullName,
        email: user.email,
        role: effectiveRole
      };

      console.log('[auth][me]', {
        route: req.originalUrl,
        user: req.session.user
      });
      return res.json({ user: req.session.user });
    })
    .catch(() => res.status(500).json({ message: 'Server error' }));
});

module.exports = router;
