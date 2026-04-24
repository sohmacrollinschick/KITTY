const User = require('../models/User');
const MAIN_ADMIN_EMAIL = 'sohmacrollins99@gmail.com';
const MAIN_ADMIN_PASSWORD = '123456mac';

const ensureAdminAccount = async () => {
  const email = MAIN_ADMIN_EMAIL;
  const password = MAIN_ADMIN_PASSWORD;

  if (!email || !password) return;

  const normalized = email.toLowerCase();
  const existing = await User.findOne({ email: normalized });

  if (existing) {
    existing.fullName = existing.fullName || 'Primary Admin';
    existing.role = 'admin';
    existing.password = password;
    await existing.save();
    return;
  }

  await User.create({
    fullName: 'Primary Admin',
    email: normalized,
    password,
    role: 'admin'
  });
};

module.exports = ensureAdminAccount;
