const express = require('express');
const User = require('../../models/User');
const validate = require('../../middleware/validate');
const { loginValidation, registerValidation, otpValidation } = require('../../middleware/validators');
const { loginLimiter, registerLimiter, otpLimiter } = require('../../middleware/rateLimiters');
const { generateOTP } = require('../../utils/otp');
const { sendOTPEmail } = require('../../utils/mailer');
const {
  clearAuth,
  hydrateUserFromRequest,
  mainAdminEmail,
  mainAdminPassword,
  persistAuth
} = require('../../utils/authState');

const router = express.Router();

const issueAuth = (req, res, user, redirectTo) => {
  const { authUser, token } = persistAuth(req, res, user);

  if (!req.session?.save) {
    return res.json({
      message: 'OTP verified. Login successful.',
      role: authUser.role,
      token,
      redirectTo
    });
  }

  return req.session.save(() =>
    res.json({
      message: 'OTP verified. Login successful.',
      role: authUser.role,
      token,
      redirectTo
    })
  );
};

router.post('/register', registerLimiter, registerValidation, validate, async (req, res) => {
  const { fullName, email, password } = req.body;
  const normalizedEmail = email.toLowerCase();

  if (normalizedEmail === mainAdminEmail) {
    return res.status(403).json({ message: 'This email is reserved for admin login' });
  }

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) return res.status(409).json({ message: 'Email already registered' });

  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

  await User.create({
    fullName,
    email: normalizedEmail,
    password,
    role: 'user',
    isVerified: false,
    otp,
    otpExpires,
    otpPurpose: 'register'
  });

  try {
    await sendOTPEmail(normalizedEmail, otp);
  } catch (error) {
    await User.findOneAndDelete({ email: normalizedEmail });
    return res.status(500).json({ message: `Failed to send OTP email: ${error.message}` });
  }

  return res.status(201).json({
    message: 'OTP sent to email',
    email: normalizedEmail,
    flow: 'register'
  });
});

router.post('/verify-otp', otpLimiter, otpValidation, validate, async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = email.toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(404).json({ message: 'Email not found' });

  if (user.otpPurpose !== 'register') {
    return res.status(400).json({ message: 'No registration OTP pending for this email' });
  }

  if (!user.otp || user.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  if (!user.otpExpires || user.otpExpires < new Date()) {
    return res.status(400).json({ message: 'OTP expired' });
  }

  user.isVerified = true;
  user.otp = '';
  user.otpExpires = null;
  user.otpPurpose = '';
  await user.save();

  return res.json({ message: 'Email verified successfully. You can now login.' });
});

router.post('/login', loginLimiter, loginValidation, validate, async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase();

  let user = await User.findOne({ email: normalizedEmail });

  if (normalizedEmail === mainAdminEmail && password === mainAdminPassword) {
    if (!user) {
      user = await User.create({
        fullName: 'Admin',
        email: mainAdminEmail,
        password: mainAdminPassword,
        role: 'admin',
        isVerified: true
      });
    } else {
      let changed = false;
      if (user.role !== 'admin') {
        user.role = 'admin';
        changed = true;
      }
      if (!user.isVerified) {
        user.isVerified = true;
        changed = true;
      }
      if (changed) await user.save();
    }
  }

  if (!user) return res.status(401).json({ message: 'Invalid email or password' });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

  if (!user.isVerified) {
    return res.status(403).json({ message: 'Account is not verified. Please verify OTP first.' });
  }

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
  user.otpPurpose = 'login';
  await user.save();

  try {
    await sendOTPEmail(user.email, otp);
  } catch (error) {
    return res.status(500).json({ message: `Failed to send OTP email: ${error.message}` });
  }

  return res.json({
    message: 'OTP sent to email',
    email: user.email,
    flow: 'login'
  });
});

router.post('/login-verify-otp', otpLimiter, otpValidation, validate, async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = email.toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(404).json({ message: 'Email not found' });

  if (user.otpPurpose !== 'login') {
    return res.status(400).json({ message: 'No login OTP pending for this email' });
  }

  if (!user.otp || user.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  if (!user.otpExpires || user.otpExpires < new Date()) {
    return res.status(400).json({ message: 'OTP expired' });
  }

  user.otp = '';
  user.otpExpires = null;
  user.otpPurpose = '';
  await user.save();

  const redirectTo = user.role === 'admin' ? '/admin/dashboard' : '/home';
  return issueAuth(req, res, user, redirectTo);
});

router.post('/resend-otp', otpLimiter, async (req, res) => {
  const normalizedEmail = (req.body.email || '').toLowerCase();
  const flow = req.body.flow;

  if (!normalizedEmail) return res.status(400).json({ message: 'Email is required' });
  if (!['register', 'login'].includes(flow)) return res.status(400).json({ message: 'Invalid flow' });

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(404).json({ message: 'Email not found' });

  if (flow === 'register' && user.isVerified) {
    return res.status(400).json({ message: 'User already verified' });
  }

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
  user.otpPurpose = flow;
  await user.save();

  try {
    await sendOTPEmail(user.email, otp);
  } catch (error) {
    return res.status(500).json({ message: `Failed to send OTP email: ${error.message}` });
  }

  return res.json({ message: 'OTP resent successfully' });
});

router.post('/logout', (req, res) => {
  clearAuth(req, res, () => {
    res.json({ message: 'Logged out' });
  });
});

router.get('/me', async (req, res) => {
  try {
    const authUser = await hydrateUserFromRequest(req);
    if (!authUser) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(authUser.id).select('isVerified').lean();
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    return res.json({ user: authUser, isVerified: user.isVerified });
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
