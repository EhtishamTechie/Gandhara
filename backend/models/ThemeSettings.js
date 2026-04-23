const mongoose = require('mongoose');

/**
 * ThemeSettings
 * ---------------------------------------------------------------
 * Singleton document (configKey: 'main') storing admin-overridable
 * Section-2 theme tokens. Anything not present falls back to the
 * compiled defaults in /frontend/src/styles/theme.css — i.e. this
 * model is a pure OVERRIDE layer, identical in spirit to
 * SidebarSettings.
 *
 * Only a curated subset of tokens is writable. We intentionally
 * do NOT let admins edit every variable (e.g. borders, status
 * colors) — they seldom need to, and restricting the surface keeps
 * the pickers UX focused.
 *
 * The allowed keys are enforced in the controller, not the schema,
 * so adding new pickers later is a one-line change.
 */
const themeSettingsSchema = new mongoose.Schema(
  {
    configKey: {
      type: String,
      default: 'main',
      unique: true
    },
    // Map of CSS-custom-property name -> CSS color string.
    // e.g. { '--color-accent-gold': '#C9A84C' }
    colors: {
      type: Map,
      of: String,
      default: {}
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ThemeSettings', themeSettingsSchema);
