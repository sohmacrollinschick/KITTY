const mongoose = require('mongoose');

const kittenSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    dob: { type: Date },
    age: { type: String, required: true, trim: true },
    breed: { type: String, required: true, trim: true },
    gender: { type: String, enum: ['Male', 'Female'], required: true },
    price: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['Available', 'Reserved', 'Sold'],
      default: 'Available'
    },
    temperament: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    images: { type: [String], default: [] },
    videoUrl: { type: String, trim: true, default: '' },
    visible: { type: Boolean, default: true },
    featured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Kitten', kittenSchema);
