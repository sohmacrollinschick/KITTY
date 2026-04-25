require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const MAIN_ADMIN_EMAIL = 'sohmacrollins99@gmail.com';
const MAIN_ADMIN_PASSWORD = '123456mac';

const run = async () => {
  await connectDB();

  const email = MAIN_ADMIN_EMAIL;
  const password = MAIN_ADMIN_PASSWORD;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    existing.fullName = existing.fullName || 'Primary Admin';
    existing.role = 'admin';
    existing.password = password;
    existing.isVerified = true;
    existing.otp = '';
    existing.otpExpires = null;
    existing.otpPurpose = '';
    await existing.save();
    console.log('Existing account synced as admin (role and password updated)');
    process.exit(0);
  }

  await User.create({
    fullName: 'Primary Admin',
    email,
    password,
    role: 'admin',
    isVerified: true
  });

  console.log(`Admin created: ${email}`);
  process.exit(0);
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
