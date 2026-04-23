const crypto = require('crypto');
const TourInquiry = require('../models/TourInquiry');
const TourInquiryLink = require('../models/TourInquiryLink');
const apiCache = require('../middleware/apiCacheMiddleware');

// GET /api/public/tour-booking/:token
exports.validateTourBookingToken = async (req, res) => {
  try {
    const { token } = req.params;
    const link = await TourInquiryLink.findOne({ token, isActive: true });
    if (!link) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive link' });
    }
    res.json({
      success: true,
      label: link.label,
      token: link.token
    });
  } catch (err) {
    console.error('validateTourBookingToken:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/public/tour-booking/:token
exports.submitTourBooking = async (req, res) => {
  try {
    const { token } = req.params;
    const link = await TourInquiryLink.findOne({ token, isActive: true });
    if (!link) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive link' });
    }

    const { name, email, phone, message, preferredDate, partySize } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!phone || !String(phone).trim()) {
      return res.status(400).json({ success: false, message: 'Phone is required' });
    }

    const doc = await TourInquiry.create({
      linkToken: token,
      name: String(name).trim(),
      email: email ? String(email).trim() : '',
      phone: String(phone).trim(),
      message: message ? String(message).trim() : '',
      preferredDate: preferredDate ? String(preferredDate).trim() : '',
      partySize: partySize ? String(partySize).trim() : ''
    });

    res.status(201).json({ success: true, id: doc._id, message: 'Thank you — we will contact you soon.' });
  } catch (err) {
    console.error('submitTourBooking:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: list links
exports.adminListLinks = async (req, res) => {
  try {
    const links = await TourInquiryLink.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, links });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: create link
exports.adminCreateLink = async (req, res) => {
  try {
    const { label } = req.body || {};
    const token = crypto.randomBytes(24).toString('hex');
    const link = await TourInquiryLink.create({
      token,
      label: label ? String(label).trim() : 'Private tour request'
    });
    if (typeof apiCache?.clear === 'function') apiCache.clear();
    res.status(201).json({ success: true, link });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: toggle link
exports.adminUpdateLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, label } = req.body || {};
    const link = await TourInquiryLink.findByIdAndUpdate(
      id,
      {
        ...(typeof isActive === 'boolean' ? { isActive } : {}),
        ...(label !== undefined ? { label: String(label).trim() } : {})
      },
      { new: true }
    );
    if (!link) return res.status(404).json({ success: false, message: 'Link not found' });
    if (typeof apiCache?.clear === 'function') apiCache.clear();
    res.json({ success: true, link });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: list inquiries
exports.adminListInquiries = async (req, res) => {
  try {
    const items = await TourInquiry.find().sort({ createdAt: -1 }).limit(500).lean();
    res.json({ success: true, inquiries: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: update inquiry status
exports.adminUpdateInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!['new', 'contacted', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const doc = await TourInquiry.findByIdAndUpdate(id, { status }, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, inquiry: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
