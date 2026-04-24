const express = require('express');
const Kitten = require('../../models/Kitten');
const Inquiry = require('../../models/Inquiry');
const Reservation = require('../../models/Reservation');
const Testimonial = require('../../models/Testimonial');
const PageContent = require('../../models/PageContent');
const SiteSettings = require('../../models/SiteSettings');
const User = require('../../models/User');
const { requireAuth, requireAdmin } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const {
  kittenValidation,
  idParamValidation,
  reservationValidation,
  inquiryValidation
} = require('../../middleware/validators');
const upload = require('../../middleware/upload');

const router = express.Router();
const MAIN_ADMIN_EMAIL = 'sohmacrollins99@gmail.com';

router.use(requireAuth, requireAdmin);

router.get('/dashboard', async (_req, res) => {
  const [total, available, reserved, sold, recentInquiries] = await Promise.all([
    Kitten.countDocuments(),
    Kitten.countDocuments({ status: 'Available' }),
    Kitten.countDocuments({ status: 'Reserved' }),
    Kitten.countDocuments({ status: 'Sold' }),
    Inquiry.find({}).sort({ createdAt: -1 }).limit(6).lean()
  ]);

  res.json({ total, available, reserved, sold, recentInquiries });
});

router.get('/users', async (_req, res) => {
  const users = await User.find({}).select('fullName email role createdAt').sort({ createdAt: -1 }).lean();
  res.json(users);
});

router.delete('/users/:id', idParamValidation, validate, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (user.email.toLowerCase() === MAIN_ADMIN_EMAIL) {
    return res.status(400).json({ message: 'Main admin account cannot be deleted' });
  }

  if (user.role !== 'user') {
    return res.status(400).json({ message: 'Only normal users can be deleted here' });
  }

  await User.findByIdAndDelete(user._id);
  return res.json({ message: 'User deleted' });
});

router.get('/kittens', async (_req, res) => {
  const kittens = await Kitten.find({}).sort({ createdAt: -1 }).lean();
  res.json(kittens);
});

router.post('/kittens', upload.array('images', 6), kittenValidation, validate, async (req, res) => {
  const imagePaths = (req.files || []).map((file) => `/uploads/${file.filename}`);

  const kitten = await Kitten.create({
    ...req.body,
    images: imagePaths,
    visible: req.body.visible === 'true' || req.body.visible === true,
    featured: req.body.featured === 'true' || req.body.featured === true,
    price: Number(req.body.price)
  });

  res.status(201).json(kitten);
});

router.put('/kittens/:id', idParamValidation, upload.array('images', 6), kittenValidation, validate, async (req, res) => {
  const kitten = await Kitten.findById(req.params.id);
  if (!kitten) return res.status(404).json({ message: 'Kitten not found' });

  const newImages = (req.files || []).map((file) => `/uploads/${file.filename}`);

  kitten.name = req.body.name;
  kitten.dob = req.body.dob || null;
  kitten.age = req.body.age;
  kitten.breed = req.body.breed;
  kitten.gender = req.body.gender;
  kitten.price = Number(req.body.price);
  kitten.status = req.body.status;
  kitten.temperament = req.body.temperament || '';
  kitten.description = req.body.description || '';
  kitten.videoUrl = req.body.videoUrl || '';
  kitten.visible = req.body.visible === 'true' || req.body.visible === true;
  kitten.featured = req.body.featured === 'true' || req.body.featured === true;

  if (newImages.length > 0) kitten.images = newImages;

  await kitten.save();
  return res.json(kitten);
});

router.delete('/kittens/:id', idParamValidation, validate, async (req, res) => {
  const kitten = await Kitten.findByIdAndDelete(req.params.id);
  if (!kitten) return res.status(404).json({ message: 'Kitten not found' });
  return res.json({ message: 'Kitten deleted' });
});

router.get('/inquiries', async (_req, res) => {
  const inquiries = await Inquiry.find({}).sort({ createdAt: -1 }).lean();
  res.json(inquiries);
});

router.put('/inquiries/:id', idParamValidation, inquiryValidation, validate, async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id);
  if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

  inquiry.name = req.body.name;
  inquiry.email = req.body.email;
  inquiry.phone = req.body.phone || '';
  inquiry.message = req.body.message;
  inquiry.kittenInterestedIn = req.body.kittenInterestedIn || '';
  inquiry.status = req.body.status || inquiry.status;

  await inquiry.save();
  res.json(inquiry);
});

router.patch('/inquiries/:id/status', idParamValidation, validate, async (req, res) => {
  const inquiry = await Inquiry.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
  res.json(inquiry);
});

router.delete('/inquiries/:id', idParamValidation, validate, async (req, res) => {
  const deleted = await Inquiry.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Inquiry not found' });
  res.json({ message: 'Inquiry deleted' });
});

router.get('/reservations', async (_req, res) => {
  const reservations = await Reservation.find({})
    .populate('kitten', 'name status')
    .sort({ createdAt: -1 })
    .lean();
  res.json(reservations);
});

router.post('/reservations', reservationValidation, validate, async (req, res) => {
  const reservation = await Reservation.create(req.body);
  res.status(201).json(reservation);
});

router.put('/reservations/:id', idParamValidation, reservationValidation, validate, async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

  reservation.customerName = req.body.customerName;
  reservation.email = req.body.email;
  reservation.phone = req.body.phone || '';
  reservation.kitten = req.body.kitten;
  reservation.depositStatus = req.body.depositStatus || 'Pending';
  reservation.reservationStatus = req.body.reservationStatus || 'Open';

  await reservation.save();
  res.json(reservation);
});

router.delete('/reservations/:id', idParamValidation, validate, async (req, res) => {
  const deleted = await Reservation.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Reservation not found' });
  res.json({ message: 'Reservation deleted' });
});

router.get('/testimonials', async (_req, res) => {
  const testimonials = await Testimonial.find({}).sort({ createdAt: -1 }).lean();
  res.json(testimonials);
});

router.post('/testimonials', upload.single('customerPhoto'), async (req, res) => {
  const testimonial = await Testimonial.create({
    customerName: req.body.customerName,
    message: req.body.message,
    rating: Number(req.body.rating || 5),
    approved: req.body.approved === 'true' || req.body.approved === true,
    customerPhoto: req.file ? `/uploads/${req.file.filename}` : ''
  });

  res.status(201).json(testimonial);
});

router.put('/testimonials/:id', idParamValidation, upload.single('customerPhoto'), validate, async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });

  testimonial.customerName = req.body.customerName;
  testimonial.message = req.body.message;
  testimonial.rating = Number(req.body.rating || 5);
  testimonial.approved = req.body.approved === 'true' || req.body.approved === true;
  if (req.file) testimonial.customerPhoto = `/uploads/${req.file.filename}`;

  await testimonial.save();
  res.json(testimonial);
});

router.delete('/testimonials/:id', idParamValidation, validate, async (req, res) => {
  const deleted = await Testimonial.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Testimonial not found' });
  res.json({ message: 'Testimonial deleted' });
});

router.get('/content', async (_req, res) => {
  const content = await PageContent.find({}).sort({ slug: 1 }).lean();
  res.json(content);
});

router.put('/content/:slug', async (req, res) => {
  const updated = await PageContent.findOneAndUpdate(
    { slug: req.params.slug },
    {
      title: req.body.title,
      body: req.body.body,
      blocks: req.body.blocks || {}
    },
    { new: true, upsert: true }
  );

  res.json(updated);
});

router.get('/settings', async (_req, res) => {
  const settings = await SiteSettings.findOne({}).lean();
  res.json(settings || {});
});

router.put('/settings', upload.single('logo'), async (req, res) => {
  const payload = {
    businessName: req.body.businessName,
    contactEmail: req.body.contactEmail,
    phone: req.body.phone,
    address: req.body.address,
    socialLinks: {
      instagram: req.body.instagram || '',
      facebook: req.body.facebook || '',
      tiktok: req.body.tiktok || ''
    },
    brandColors: {
      primary: req.body.primary || '#bfa072',
      accent: req.body.accent || '#f4d7d0',
      background: req.body.background || '#fffdf8'
    }
  };

  if (req.file) payload.logo = `/uploads/${req.file.filename}`;

  const updated = await SiteSettings.findOneAndUpdate({}, payload, { upsert: true, new: true });
  res.json(updated);
});

module.exports = router;
