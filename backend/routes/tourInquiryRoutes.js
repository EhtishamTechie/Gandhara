const express = require('express');
const {
  validateTourBookingToken,
  submitTourBooking,
  adminListLinks,
  adminCreateLink,
  adminUpdateLink,
  adminListInquiries,
  adminUpdateInquiry
} = require('../controllers/tourInquiryController');

const publicRouter = express.Router();
publicRouter.get('/:token', validateTourBookingToken);
publicRouter.post('/:token', express.json(), submitTourBooking);

const adminRouter = express.Router();
adminRouter.get('/links', adminListLinks);
adminRouter.post('/links', adminCreateLink);
adminRouter.patch('/links/:id', adminUpdateLink);
adminRouter.get('/inquiries', adminListInquiries);
adminRouter.patch('/inquiries/:id', adminUpdateInquiry);

module.exports = { publicRouter, adminRouter };
