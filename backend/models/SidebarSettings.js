const mongoose = require('mongoose');

/**
 * SidebarSettings
 * ---------------------------------------------------------------
 * Singleton document (configKey: 'main') that stores per-category
 * OVERRIDES for the right-side category sidebar.
 *
 * Why a separate doc instead of extending CategoryOrder?
 *  - CategoryOrder.isVisible already drives the homepage grouped-
 *    products section. Reusing that field would tangle two
 *    concerns (homepage visibility vs sidebar visibility).
 *  - This document is purely a thin override layer. If a category
 *    is NOT listed in `overrides`, it falls back to
 *    `showInSidebar = true` and inherits its sortOrder from
 *    CategoryOrder. Nothing existing is changed.
 */
const sidebarSettingsSchema = new mongoose.Schema({
  configKey: {
    type: String,
    default: 'main',
    unique: true
  },
  overrides: [{
    categoryName: { type: String, required: true, trim: true },
    showInSidebar: { type: Boolean, default: true },
    // Optional override on the order. If null/undefined, the order
    // from CategoryOrder is used.
    sortOrder: { type: Number, default: null }
  }]
}, { timestamps: true });

module.exports = mongoose.model('SidebarSettings', sidebarSettingsSchema);
