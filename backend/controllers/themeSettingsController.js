const ThemeSettings = require('../models/ThemeSettings');
const apiCache = require('../middleware/apiCacheMiddleware');

/**
 * ThemeSettings controller (Section 7 — admin theme overrides)
 *
 * Contract:
 *   GET  /api/theme-settings        → public. returns { colors: {...} }
 *   PUT  /api/admin/theme-settings  → admin. body { colors: {...} }
 *                                      fully replaces `colors` map
 *   POST /api/admin/theme-settings/reset → admin. clears all overrides
 */

// Allow-list of editable CSS custom property names. Anything outside
// this set is silently dropped so a rogue admin can't inject arbitrary
// CSS or attempt an XSS via unexpected property names.
const ALLOWED_KEYS = new Set([
  '--color-bg-primary',
  '--color-bg-secondary',
  '--color-bg-card',
  '--color-bg-sidebar',
  '--color-bg-footer',
  '--color-accent-gold',
  '--color-accent-gold-dark',
  '--color-accent-gold-soft',
  '--color-text-primary',
  '--color-text-secondary',
  '--color-border',
  '--color-border-active'
]);

// Accepts #rgb / #rrggbb / #rrggbbaa / rgb()/rgba()/hsl()/hsla().
// Intentionally conservative: we do NOT accept arbitrary strings
// like "red" (named colors), var(), or calc() to avoid surprises.
const COLOR_RE = /^(?:#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|(?:rgb|rgba|hsl|hsla)\s*\([^)]+\))$/;

const sanitizeColors = (input = {}) => {
  const out = {};
  for (const [rawKey, rawVal] of Object.entries(input || {})) {
    if (!ALLOWED_KEYS.has(rawKey)) continue;
    if (typeof rawVal !== 'string') continue;
    const val = rawVal.trim();
    if (!val) continue;
    if (!COLOR_RE.test(val)) continue;
    out[rawKey] = val;
  }
  return out;
};

const toPlainObject = (mapOrObj) => {
  if (!mapOrObj) return {};
  if (mapOrObj instanceof Map) return Object.fromEntries(mapOrObj);
  // Mongoose lean() returns plain objects, but Maps come back as
  // either plain {} or Map depending on version. Normalise both.
  return typeof mapOrObj === 'object' ? { ...mapOrObj } : {};
};

// GET /api/theme-settings
exports.getThemeSettings = async (req, res) => {
  try {
    let doc = await ThemeSettings.findOne({ configKey: 'main' });
    if (!doc) {
      doc = await ThemeSettings.create({ configKey: 'main', colors: {} });
    }
    res.json({
      success: true,
      colors: toPlainObject(doc.colors),
      updatedAt: doc.updatedAt
    });
  } catch (err) {
    console.error('getThemeSettings error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/theme-settings
exports.updateThemeSettings = async (req, res) => {
  try {
    const { colors } = req.body || {};
    if (colors && typeof colors !== 'object') {
      return res
        .status(400)
        .json({ success: false, message: 'colors must be an object' });
    }
    const clean = sanitizeColors(colors || {});

    const doc = await ThemeSettings.findOneAndUpdate(
      { configKey: 'main' },
      { $set: { colors: clean } },
      { new: true, upsert: true }
    );

    if (typeof apiCache?.clear === 'function') apiCache.clear();

    res.json({
      success: true,
      colors: toPlainObject(doc.colors),
      updatedAt: doc.updatedAt
    });
  } catch (err) {
    console.error('updateThemeSettings error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/theme-settings/reset
exports.resetThemeSettings = async (req, res) => {
  try {
    const doc = await ThemeSettings.findOneAndUpdate(
      { configKey: 'main' },
      { $set: { colors: {} } },
      { new: true, upsert: true }
    );
    if (typeof apiCache?.clear === 'function') apiCache.clear();
    res.json({
      success: true,
      colors: toPlainObject(doc.colors),
      updatedAt: doc.updatedAt
    });
  } catch (err) {
    console.error('resetThemeSettings error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.ALLOWED_KEYS = ALLOWED_KEYS;
