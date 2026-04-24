const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema(
  {
    businessName: { type: String, default: 'Velvet Paws Cattery' },
    logo: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    socialLinks: {
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      tiktok: { type: String, default: '' }
    },
    brandColors: {
      primary: { type: String, default: '#bfa072' },
      accent: { type: String, default: '#f4d7d0' },
      background: { type: String, default: '#fffdf8' }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
