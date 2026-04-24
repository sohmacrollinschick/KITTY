const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    customerPhoto: { type: String, trim: true, default: '' },
    approved: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Testimonial', testimonialSchema);
