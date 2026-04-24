const express = require('express');
const AdminUser = require('../../models/AdminUser');
const validate = require('../../middleware/validate');
const { loginValidation } = require('../../middleware/validators');
const { loginLimiter } = require('../../middleware/rateLimiters');

const router = express.Router();

router.post('/login', loginLimiter, loginValidation, validate, async (req, res) => {
  const { email, password } = req.body;

  const admin = await AdminUser.findOne({ email: email.toLowerCase() });
  if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

  req.session.adminId = admin._id.toString();
  req.session.adminEmail = admin.email;

  return res.json({ message: 'Login successful', admin: { email: admin.email, name: admin.name } });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

router.get('/me', (req, res) => {
  if (!req.session?.adminId) return res.status(401).json({ message: 'Unauthorized' });
  return res.json({ admin: { id: req.session.adminId, email: req.session.adminEmail } });
});

module.exports = router;
