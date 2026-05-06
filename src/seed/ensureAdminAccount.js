const User = require('../models/User');
const { mainAdminEmail, mainAdminPassword } = require('../utils/authState');

const ensureAdminAccount = async () => {
  const email = mainAdminEmail;
  const password = mainAdminPassword;

  if (!email || !password) return;

  const normalized = email.toLowerCase();
  const existing = await User.findOne({ email: normalized });

  if (existing) {
    existing.fullName = existing.fullName || 'Primary Admin';
    existing.role = 'admin';
    existing.password = password;
    existing.isVerified = true;
    existing.otp = '';
    existing.otpExpires = null;
    existing.otpPurpose = '';
    await existing.save();
    return;
  }

  await User.create({
    fullName: 'Primary Admin',
    email: normalized,
    password,
    role: 'admin',
    isVerified: true
  });
};

module.exports = ensureAdminAccount;
