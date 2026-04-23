const express = require('express');
const multer = require('multer');
const path = require('path');

const {
  listPublicSlots,
  getPublicSlot,
  adminListSlots,
  adminGetSlot,
  adminAddItem,
  adminUpdateItem,
  adminDeleteItem,
  adminReorderItems,
  adminUpdateSlotSettings
} = require('../controllers/siteMediaController');

/**
 * Site Media routes (Section 4 + media-admin expansion)
 *
 * Mounted in server.js as:
 *   app.use('/api/site-media', apiCache(...), siteMediaPublicRouter);
 *   app.use('/api/admin/site-media', authMiddleware, siteMediaAdminRouter);
 */

// -------------------------------------------------------------
// Multer: disk storage under backend/uploads, SEO-friendly names.
// Accepts image/* and video/* up to 100MB.
// -------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads/'),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    cb(null, `sm-${timestamp}-${base}${extension}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image or video files are allowed'), false);
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB — videos can be large
  }
});

// -------------------------------------------------------------
// Public router  /api/site-media
// -------------------------------------------------------------
const publicRouter = express.Router();
publicRouter.get('/', listPublicSlots);
publicRouter.get('/:slotKey', getPublicSlot);

// -------------------------------------------------------------
// Admin router  /api/admin/site-media   (authMiddleware in server.js)
// -------------------------------------------------------------
const adminRouter = express.Router();
adminRouter.get('/', adminListSlots);
adminRouter.get('/:slotKey', adminGetSlot);

// Add item — optional multer field "media" (image OR video).
adminRouter.post('/:slotKey/items', upload.single('media'), adminAddItem);

// Update slot-level settings (e.g. hero slideshow timing).
adminRouter.put('/:slotKey/settings', adminUpdateSlotSettings);

adminRouter.put('/:slotKey/items/:itemId', adminUpdateItem);
adminRouter.delete('/:slotKey/items/:itemId', adminDeleteItem);
adminRouter.put('/:slotKey/reorder', adminReorderItems);

module.exports = publicRouter;
module.exports.adminRouter = adminRouter;
