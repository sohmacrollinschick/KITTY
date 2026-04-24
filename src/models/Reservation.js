const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: '' },
    kitten: { type: mongoose.Schema.Types.ObjectId, ref: 'Kitten', required: true },
    depositStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Cancelled'],
      default: 'Pending'
    },
    reservationStatus: { type: String, trim: true, default: 'Open' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reservation', reservationSchema);
