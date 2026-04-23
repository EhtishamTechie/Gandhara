const Subcategory = require('../models/Subcategory');
const SidebarSettings = require('../models/SidebarSettings');
const CategoryOrder = require('../models/CategoryOrder');
const Product = require('../models/Product');
const apiCache = require('../middleware/apiCacheMiddleware');

// Kept in sync with the defaults used by categoryOrderController.
// We duplicate (rather than import) to avoid cross-controller
// coupling, and to preserve the "non-destructive additions"
// rule — this file never reaches back into existing controllers.
const DEFAULT_TOP_LEVEL_CATEGORIES = [
  'Gandhara Art', 'Antique Products', 'Calligraphy', 'Crockery', 'Home Decor',
  'Garden Decor', 'Fireplaces', 'Building Embellishing', 'Fountains',
  'Ashtray and Mortar', 'Decorative Motive', 'Stone Sanitary', 'Moulded Art',
  'Jewellery', 'Carved Stone', 'Precious Stone', 'Salt',
  'featuredProducts', 'Luxary Collection', 'Raw Stone',
  'Mortar and Pestle', 'Grinding Mills', 'Coin', 'Grave Designs'
];

/**
 * Ensure a CategoryOrder document exists. Mirrors the idempotent
 * seed logic in categoryOrderController.getCategoryOrder so the
 * tree endpoint can be called BEFORE anyone hits /api/category-order.
 * Safe to run many times: only creates the doc if missing, and
 * only appends category names that are not already in the list.
 */
const ensureCategoryOrder = async () => {
  let config = await CategoryOrder.findOne({ configKey: 'main' });
  if (!config) {
    config = await CategoryOrder.create({
      configKey: 'main',
      categories: DEFAULT_TOP_LEVEL_CATEGORIES.map((name) => ({ name, isVisible: true }))
    });
  }

  // Also append any categories that exist on products but aren't
  // listed yet (matches existing getCategoryOrder behaviour).
  try {
    const allDbCategories = await Product.distinct('categories', { isActive: true });
    const existing = new Set(config.categories.map((c) => c.name));
    const missing = (allDbCategories || []).filter((c) => c && !existing.has(c));
    if (missing.length > 0) {
      await CategoryOrder.updateOne(
        { configKey: 'main' },
        { $push: { categories: { $each: missing.map((n) => ({ name: n, isVisible: true })) } } }
      );
    }
  } catch {
    // If Product collection is empty or distinct fails, ignore.
  }

  return CategoryOrder.findOne({ configKey: 'main' }).lean();
};

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

/** Convert a human-readable category/subcategory name to a URL slug. */
const slugify = (str) =>
  String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * Seed the Subcategory collection on first use.
 * Idempotent: returns early if ANY subcategories already exist.
 *
 * Uses the exact tree confirmed by the user for Section 3:
 *   Gandhara Art → Buddha Sculptures, Relief Panels, Friezes
 *   Home Decor   → Vases, Candle Holders
 *   Garden Decor → Planters, Outdoor Statues
 *   Fountains    → Wall Fountains, Floor Fountains
 *   Calligraphy  → Arabic Calligraphy, Urdu Calligraphy
 */
const SEED_TREE = {
  'Gandhara Art': ['Buddha Sculptures', 'Relief Panels', 'Friezes'],
  'Home Decor':   ['Vases', 'Candle Holders'],
  'Garden Decor': ['Planters', 'Outdoor Statues'],
  'Fountains':    ['Wall Fountains', 'Floor Fountains'],
  'Calligraphy':  ['Arabic Calligraphy', 'Urdu Calligraphy']
};

const seedSubcategoriesIfEmpty = async () => {
  const existing = await Subcategory.estimatedDocumentCount();
  if (existing > 0) return { seeded: false, count: existing };

  const docs = [];
  Object.entries(SEED_TREE).forEach(([parent, children]) => {
    children.forEach((child, idx) => {
      docs.push({
        name: child,
        slug: slugify(child),
        parentCategoryName: parent,
        isVisible: true,
        sortOrder: idx
      });
    });
  });

  if (docs.length === 0) return { seeded: false, count: 0 };

  // insertMany with ordered:false so a single collision doesn't
  // block the rest (shouldn't collide on a fresh collection, but
  // be defensive).
  await Subcategory.insertMany(docs, { ordered: false }).catch((err) => {
    // Duplicate-key errors from a race are safe to ignore here.
    if (err?.code !== 11000) throw err;
  });

  return { seeded: true, count: docs.length };
};

// ----------------------------------------------------------------
// Public controllers
// ----------------------------------------------------------------

/**
 * GET /api/categories
 * Returns the list of top-level categories (names + visibility)
 * in the admin-defined order.
 */
const listTopLevelCategories = async (req, res) => {
  try {
    // Ensure the CategoryOrder singleton exists before reading.
    await ensureCategoryOrder();
    const config = await CategoryOrder.findOne({ configKey: 'main' }).lean();
    const cats = config?.categories || [];

    res.json({
      success: true,
      categories: cats.map((c, i) => ({
        name: c.name,
        slug: slugify(c.name),
        isVisible: c.isVisible !== false,
        sortOrder: i
      }))
    });
  } catch (err) {
    console.error('listTopLevelCategories error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/categories/tree
 * Returns the full nested category tree, with SidebarSettings
 * visibility overrides applied. Auto-seeds the Subcategory
 * collection on the very first call.
 */
const getCategoryTree = async (req, res) => {
  try {
    // 1. Seed subcategories + CategoryOrder on first call
    //    (both idempotent — safe to call every request).
    await Promise.all([
      seedSubcategoriesIfEmpty(),
      ensureCategoryOrder()
    ]);

    // 2. Fetch the three source-of-truth documents in parallel.
    const [orderDoc, allSubs, settings] = await Promise.all([
      CategoryOrder.findOne({ configKey: 'main' }).lean(),
      Subcategory.find({}).sort({ parentCategoryName: 1, sortOrder: 1 }).lean(),
      SidebarSettings.findOne({ configKey: 'main' }).lean()
    ]);

    // 3. Build an override map keyed by category name.
    const overrideMap = new Map();
    (settings?.overrides || []).forEach((o) => {
      overrideMap.set(o.categoryName, o);
    });

    // 4. Group subcategories by parent name.
    const childrenByParent = new Map();
    for (const sub of allSubs) {
      if (!childrenByParent.has(sub.parentCategoryName)) {
        childrenByParent.set(sub.parentCategoryName, []);
      }
      childrenByParent.get(sub.parentCategoryName).push({
        _id: sub._id,
        name: sub.name,
        slug: sub.slug,
        isVisible: sub.isVisible,
        sortOrder: sub.sortOrder
      });
    }

    // 5. Assemble the top-level list in admin-defined order,
    //    filter by sidebar visibility, attach children.
    const rawCategories = orderDoc?.categories || [];
    const tree = rawCategories
      .map((cat, idx) => {
        const override = overrideMap.get(cat.name);
        const showInSidebar = override
          ? override.showInSidebar !== false
          : cat.isVisible !== false;

        const sortOrder = override?.sortOrder ?? idx;
        const children = (childrenByParent.get(cat.name) || [])
          .filter((c) => c.isVisible !== false)
          .sort((a, b) => a.sortOrder - b.sortOrder);

        return {
          name: cat.name,
          slug: slugify(cat.name),
          isVisible: showInSidebar,
          sortOrder,
          children
        };
      })
      .filter((c) => c.isVisible)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    res.json({
      success: true,
      tree,
      meta: {
        totalTopLevel: tree.length,
        totalSubcategories: allSubs.length
      }
    });
  } catch (err) {
    console.error('getCategoryTree error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/categories/:parentName/children
 * Returns just the subcategories of one parent (URL-decoded name).
 */
const getSubcategoriesOfCategory = async (req, res) => {
  try {
    const parentName = decodeURIComponent(req.params.parentName || '').trim();
    if (!parentName) {
      return res.status(400).json({ success: false, message: 'parentName is required' });
    }

    const subs = await Subcategory.find({
      parentCategoryName: parentName,
      isVisible: true
    }).sort({ sortOrder: 1 }).lean();

    res.json({
      success: true,
      parentCategoryName: parentName,
      children: subs.map((s) => ({
        _id: s._id,
        name: s.name,
        slug: s.slug,
        isVisible: s.isVisible,
        sortOrder: s.sortOrder
      }))
    });
  } catch (err) {
    console.error('getSubcategoriesOfCategory error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ----------------------------------------------------------------
// Admin controllers (mounted behind authMiddleware)
// ----------------------------------------------------------------

/** GET /api/admin/subcategories — all subcategories, visible or not. */
const adminListSubcategories = async (req, res) => {
  try {
    const subs = await Subcategory
      .find({})
      .sort({ parentCategoryName: 1, sortOrder: 1 })
      .lean();
    res.json({ success: true, subcategories: subs });
  } catch (err) {
    console.error('adminListSubcategories error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/** POST /api/admin/subcategories */
const adminCreateSubcategory = async (req, res) => {
  try {
    const { name, parentCategoryName, isVisible, sortOrder } = req.body;

    if (!name || !parentCategoryName) {
      return res.status(400).json({
        success: false,
        message: 'name and parentCategoryName are required'
      });
    }

    const doc = await Subcategory.create({
      name: String(name).trim(),
      slug: slugify(name),
      parentCategoryName: String(parentCategoryName).trim(),
      isVisible: isVisible !== false,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0
    });

    apiCache.clear();

    res.status(201).json({ success: true, subcategory: doc });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A subcategory with that slug already exists under this parent.'
      });
    }
    console.error('adminCreateSubcategory error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/** PUT /api/admin/subcategories/:id */
const adminUpdateSubcategory = async (req, res) => {
  try {
    const { name, parentCategoryName, isVisible, sortOrder } = req.body;
    const updates = {};
    if (typeof name === 'string') {
      updates.name = name.trim();
      updates.slug = slugify(name);
    }
    if (typeof parentCategoryName === 'string') {
      updates.parentCategoryName = parentCategoryName.trim();
    }
    if (typeof isVisible === 'boolean') updates.isVisible = isVisible;
    if (Number.isFinite(sortOrder)) updates.sortOrder = sortOrder;

    const doc = await Subcategory.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Subcategory not found' });

    apiCache.clear();
    res.json({ success: true, subcategory: doc });
  } catch (err) {
    console.error('adminUpdateSubcategory error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/** DELETE /api/admin/subcategories/:id */
const adminDeleteSubcategory = async (req, res) => {
  try {
    const doc = await Subcategory.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Subcategory not found' });

    apiCache.clear();
    res.json({ success: true, message: 'Subcategory deleted', subcategory: doc });
  } catch (err) {
    console.error('adminDeleteSubcategory error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/admin/subcategories/reorder
 * Body: { items: [{ _id, sortOrder }, ...] }
 * Bulk sortOrder updates. Typically called from the admin UI
 * after a drag-and-drop reorder.
 */
const adminReorderSubcategories = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'items array is required' });
    }

    const ops = items
      .filter((it) => it && it._id && Number.isFinite(it.sortOrder))
      .map((it) => ({
        updateOne: {
          filter: { _id: it._id },
          update: { $set: { sortOrder: it.sortOrder } }
        }
      }));

    if (ops.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid items to reorder' });
    }

    const result = await Subcategory.bulkWrite(ops);
    apiCache.clear();

    res.json({ success: true, updated: result.modifiedCount });
  } catch (err) {
    console.error('adminReorderSubcategories error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  listTopLevelCategories,
  getCategoryTree,
  getSubcategoriesOfCategory,
  adminListSubcategories,
  adminCreateSubcategory,
  adminUpdateSubcategory,
  adminDeleteSubcategory,
  adminReorderSubcategories
};
