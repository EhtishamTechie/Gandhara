const mongoose = require('mongoose');

/**
 * Shareable private link for the tour booking form (not linked from public nav).
 */
const tourInquiryLinkSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    label: { type: String, default: 'Private tour request', trim: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('TourInquiryLink', tourInquiryLinkSchema);
