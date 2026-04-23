const express = require('express');
const router = express.Router();

const {
  getSidebarSettings,
  updateSidebarSettings
} = require('../controllers/sidebarSettingsController');

// ----------------------------------------------------------------
// PUBLIC routes (mounted at /api/sidebar-settings in server.js)
// ----------------------------------------------------------------
router.get('/', getSidebarSettings);

// ----------------------------------------------------------------
// ADMIN routes (mounted at /api/admin/sidebar-settings in
// server.js, behind authMiddleware)
// ----------------------------------------------------------------
const adminRouter = express.Router();
adminRouter.put('/', updateSidebarSettings);

module.exports = router;
module.exports.adminRouter = adminRouter;
