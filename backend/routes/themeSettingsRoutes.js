const express = require('express');

const {
  getThemeSettings,
  updateThemeSettings,
  resetThemeSettings
} = require('../controllers/themeSettingsController');

// Public: read current theme overrides.
const publicRouter = express.Router();
publicRouter.get('/', getThemeSettings);

// Admin: write / reset. authMiddleware is applied in server.js.
const adminRouter = express.Router();
adminRouter.put('/', updateThemeSettings);
adminRouter.post('/reset', resetThemeSettings);

module.exports = { publicRouter, adminRouter };
