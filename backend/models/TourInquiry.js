const mongoose = require('mongoose');

const tourInquirySchema = new mongoose.Schema(
  {
    linkToken: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: '' },
    phone: { type: String, required: true, trim: true },
    message: { type: String, trim: true, default: '' },
    preferredDate: { type: String, trim: true, default: '' },
    partySize: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['new', 'contacted', 'closed'],
      default: 'new'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('TourInquiry', tourInquirySchema);
