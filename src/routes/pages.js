const express = require('express');
const path = require('path');
const User = require('../models/User');

const router = express.Router();
const MAIN_ADMIN_EMAIL = 'sohmacrollins99@gmail.com';

const guestPages = {
  '/login': 'login.html',
  '/register': 'register.html'
};

const userPages = {
  '/': 'index.html',
  '/home': 'index.html',
  '/kittens': 'kittens.html',
  '/about': 'about.html',
  '/adoption-process': 'process.html',
  '/testimonials': 'testimonials.html',
  '/faq': 'faq.html',
  '/contact': 'contact.html'
};

const adminPages = {
  '/admin': 'admin/dashboard.html',
  '/admin/dashboard': 'admin/dashboard.html',
  '/admin/kittens': 'admin/kittens.html',
  '/admin/inquiries': 'admin/inquiries.html',
  '/admin/reservations': 'admin/reservations.html',
  '/admin/testimonials': 'admin/testimonials.html',
  '/admin/cms': 'admin/cms.html',
  '/admin/settings': 'admin/settings.html',
  '/admin/users': 'admin/users.html'
};

const sendPage = (res, file) => res.sendFile(path.join(__dirname, '../../public', file));

const getEffectiveRole = async (sessionUser) => {
  if (!sessionUser?.id) return null;
  const user = await User.findById(sessionUser.id).select('email role fullName').lean();
  if (!user) return null;
  const role = user.email?.toLowerCase() === MAIN_ADMIN_EMAIL ? 'admin' : user.role;
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    role
  };
};

const ensureGuest = (req, res, next) => {
  const role = req.session?.user?.role;
  if (!role) return next();
  if (role === 'admin') return res.redirect('/admin/dashboard');
  return res.redirect('/home');
};

const ensureUser = async (req, res, next) => {
  try {
    const effectiveUser = await getEffectiveRole(req.session?.user);
    if (!effectiveUser) return res.redirect('/login');
    req.session.user = effectiveUser;
    if (effectiveUser.role === 'admin') return res.redirect('/admin/dashboard');
    if (effectiveUser.role !== 'user') return res.redirect('/login');
    return next();
  } catch {
    return res.redirect('/login');
  }
};

const ensureAdmin = async (req, res, next) => {
  try {
    const effectiveUser = await getEffectiveRole(req.session?.user);
    if (!effectiveUser) return res.redirect('/login');
    req.session.user = effectiveUser;
    if (effectiveUser.role !== 'admin') return res.redirect('/home');
    return next();
  } catch {
    return res.redirect('/login');
  }
};

Object.entries(guestPages).forEach(([route, file]) => {
  router.get(route, ensureGuest, (_req, res) => sendPage(res, file));
});

Object.entries(userPages).forEach(([route, file]) => {
  router.get(route, ensureUser, (_req, res) => sendPage(res, file));
});

router.get('/kittens/:id', ensureUser, (_req, res) => sendPage(res, 'kitten-profile.html'));
router.get('/kitten-profile', ensureUser, (req, res) => {
  if (req.query.id) return res.redirect(`/kittens/${req.query.id}`);
  return res.redirect('/kittens');
});

Object.entries(adminPages).forEach(([route, file]) => {
  router.get(route, ensureAdmin, (_req, res) => sendPage(res, file));
});

module.exports = router;
