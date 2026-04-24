const express = require('express');
const Kitten = require('../../models/Kitten');
const Testimonial = require('../../models/Testimonial');
const Inquiry = require('../../models/Inquiry');
const Reservation = require('../../models/Reservation');
const PageContent = require('../../models/PageContent');
const SiteSettings = require('../../models/SiteSettings');
const validate = require('../../middleware/validate');
const {
  inquiryValidation,
  reservationValidation,
  idParamValidation,
  kittenFilterValidation
} = require('../../middleware/validators');
const { contactLimiter } = require('../../middleware/rateLimiters');
const { requireUser } = require('../../middleware/auth');

const router = express.Router();

router.use(requireUser);

router.get('/settings', async (_req, res) => {
  const settings = await SiteSettings.findOne({}).lean();
  res.json(settings || {});
});

router.get('/content/:slug', async (req, res) => {
  const page = await PageContent.findOne({ slug: req.params.slug }).lean();
  if (!page) return res.status(404).json({ message: 'Content not found' });
  return res.json(page);
});

router.get('/kittens', kittenFilterValidation, validate, async (req, res) => {
  const { age, gender, status, maxPrice, featured } = req.query;

  const query = { visible: true };
  if (age) query.age = new RegExp(age, 'i');
  if (gender) query.gender = gender;
  if (status) query.status = status;
  if (maxPrice) query.price = { $lte: Number(maxPrice) };
  if (featured === 'true') query.featured = true;

  const kittens = await Kitten.find(query).sort({ createdAt: -1 }).lean();
  res.json(kittens);
});

router.get('/kittens/:id', idParamValidation, validate, async (req, res) => {
  const kitten = await Kitten.findById(req.params.id).lean();
  if (!kitten || !kitten.visible) return res.status(404).json({ message: 'Kitten not found' });
  res.json(kitten);
});

router.get('/testimonials', async (_req, res) => {
  const testimonials = await Testimonial.find({ approved: true }).sort({ createdAt: -1 }).lean();
  res.json(testimonials);
});

router.post('/inquiries', contactLimiter, inquiryValidation, validate, async (req, res) => {
  await Inquiry.create(req.body);
  res.status(201).json({ message: 'Inquiry submitted successfully' });
});

router.post('/reservations', contactLimiter, reservationValidation, validate, async (req, res) => {
  const reservation = await Reservation.create(req.body);
  res.status(201).json({ message: 'Reservation submitted', reservation });
});

module.exports = router;
