const mongoose = require('mongoose');

const pageContentSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, trim: true, default: '' },
    body: { type: String, trim: true, default: '' },
    blocks: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PageContent', pageContentSchema);
