const SidebarSettings = require('../models/SidebarSettings');
const apiCache = require('../middleware/apiCacheMiddleware');

/**
 * GET /api/sidebar-settings
 * Public. Returns the current overrides doc (empty overrides
 * array if none have been configured yet). The frontend can live
 * without this — the /api/categories/tree endpoint already
 * applies overrides server-side — but we expose it for the
 * admin UI in Section 7.
 */
const getSidebarSettings = async (req, res) => {
  try {
    let settings = await SidebarSettings.findOne({ configKey: 'main' }).lean();

    if (!settings) {
      // Lazy-create an empty document so the admin UI has
      // something to PUT against.
      settings = await SidebarSettings.create({
        configKey: 'main',
        overrides: []
      });
      settings = settings.toObject();
    }

    res.json({
      success: true,
      overrides: settings.overrides || [],
      updatedAt: settings.updatedAt
    });
  } catch (err) {
    console.error('getSidebarSettings error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/admin/sidebar-settings
 * Body: { overrides: [{ categoryName, showInSidebar, sortOrder }] }
 * Fully replaces the overrides array (simplest + safest for an
 * admin drag-and-drop UI).
 */
const updateSidebarSettings = async (req, res) => {
  try {
    const { overrides } = req.body;
    if (!Array.isArray(overrides)) {
      return res.status(400).json({
        success: false,
        message: 'overrides must be an array'
      });
    }

    // Normalise every entry.
    const clean = overrides
      .filter((o) => o && typeof o.categoryName === 'string' && o.categoryName.trim())
      .map((o) => ({
        categoryName: o.categoryName.trim(),
        showInSidebar: o.showInSidebar !== false,
        sortOrder: Number.isFinite(o.sortOrder) ? o.sortOrder : null
      }));

    const doc = await SidebarSettings.findOneAndUpdate(
      { configKey: 'main' },
      { overrides: clean },
      { new: true, upsert: true, lean: true }
    );

    apiCache.clear();

    res.json({
      success: true,
      overrides: doc.overrides,
      updatedAt: doc.updatedAt
    });
  } catch (err) {
    console.error('updateSidebarSettings error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getSidebarSettings, updateSidebarSettings };
