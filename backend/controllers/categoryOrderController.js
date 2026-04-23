const CategoryOrder = require('../models/CategoryOrder');
const Product = require('../models/Product');
const apiCache = require('../middleware/apiCacheMiddleware');

// Default categories (used to seed the first time)
const DEFAULT_CATEGORIES = [
  "Gandhara Art", "Antique Products", "Calligraphy", "Crockery", "Home Decor", "Garden Decor",
  "Fireplaces", "Building Embellishing", "Fountains", "Ashtray and Mortar", "Decorative Motive",
  "Stone Sanitary", "Moulded Art", "Jewellery", "Carved Stone", "Precious Stone", "Salt",
  "featuredProducts", "Luxary Collection", "Raw Stone", "Mortar and Pestle", "Grinding Mills", "Coin",
  "Grave Designs"
];

/**
 * GET /api/category-order
 * Returns the current category ordering. Auto-seeds if none exists.
 */
const getCategoryOrder = async (req, res) => {
  try {
    let config = await CategoryOrder.findOne({ configKey: 'main' }).lean();

    if (!config) {
      // First-time: seed with default categories
      config = await CategoryOrder.create({
        configKey: 'main',
        categories: DEFAULT_CATEGORIES.map(name => ({ name, isVisible: true }))
      });
      config = config.toObject();
    }

    // Detect any NEW categories in the products collection that aren't in the order yet
    const allDbCategories = await Product.distinct('categories', { isActive: true });
    const existingNames = new Set(config.categories.map(c => c.name));
    const newCategories = allDbCategories.filter(c => !existingNames.has(c));

    if (newCategories.length > 0) {
      // Append new categories to the end
      const newEntries = newCategories.map(name => ({ name, isVisible: true }));
      config = await CategoryOrder.findOneAndUpdate(
        { configKey: 'main' },
        { $push: { categories: { $each: newEntries } } },
        { new: true, lean: true }
      );
    }

    res.json({
      success: true,
      categories: config.categories,
      updatedAt: config.updatedAt
    });
  } catch (error) {
    console.error('getCategoryOrder error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/category-order
 * Updates the full category order. Body: { categories: [{ name, isVisible }] }
 */
const updateCategoryOrder = async (req, res) => {
  try {
    const { categories } = req.body;

    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ success: false, message: 'categories array is required' });
    }

    // Validate each entry
    for (const cat of categories) {
      if (!cat.name || typeof cat.name !== 'string') {
        return res.status(400).json({ success: false, message: 'Each category must have a name string' });
      }
    }

    const config = await CategoryOrder.findOneAndUpdate(
      { configKey: 'main' },
      {
        categories: categories.map(c => ({
          name: c.name.trim(),
          isVisible: c.isVisible !== false // default true
        }))
      },
      { new: true, upsert: true, lean: true }
    );

    // Clear API cache so public routes serve fresh data immediately
    apiCache.clear();

    res.json({
      success: true,
      message: 'Category order updated successfully',
      categories: config.categories,
      updatedAt: config.updatedAt
    });
  } catch (error) {
    console.error('updateCategoryOrder error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/products/grouped
 * Returns products grouped by category in the admin-defined order.
 * Each group has: { category, products[] }
 * Query params: ?limit=8 (products per category)
 */
const getProductsGrouped = async (req, res) => {
  try {
    const limitPerCategory = parseInt(req.query.limit) || 8;

    // Get category order
    let config = await CategoryOrder.findOne({ configKey: 'main' }).lean();
    if (!config) {
      // Fallback: create default
      config = await CategoryOrder.create({
        configKey: 'main',
        categories: DEFAULT_CATEGORIES.map(name => ({ name, isVisible: true }))
      });
      config = config.toObject();
    }

    // Only visible categories
    const visibleCategories = config.categories.filter(c => c.isVisible);

    // Fetch products for each category in parallel
    const groupedResults = await Promise.all(
      visibleCategories.map(async (cat) => {
        const categoryRegex = new RegExp(`^${cat.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
        const products = await Product.find({
          categories: categoryRegex,
          isActive: true
        })
          .select('title slug image images categories price seoTitle seoDescription imageAlt shortDescription createdAt')
          .sort({ createdAt: -1 })
          .limit(limitPerCategory)
          .lean();

        const total = await Product.countDocuments({
          categories: categoryRegex,
          isActive: true
        });

        return {
          category: cat.name,
          products,
          total,
          hasMore: total > limitPerCategory
        };
      })
    );

    // Filter out empty categories
    const nonEmpty = groupedResults.filter(g => g.products.length > 0);

    res.set({ 'Cache-Control': 'public, max-age=300' });
    res.json({
      success: true,
      groups: nonEmpty,
      totalCategories: nonEmpty.length
    });
  } catch (error) {
    console.error('getProductsGrouped error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/admin/category-order/rename
 * Renames a category everywhere: CategoryOrder doc + all Product documents.
 * Body: { oldName: string, newName: string }
 */
const renameCategory = async (req, res) => {
  try {
    const { oldName, newName } = req.body;

    if (!oldName || !newName || typeof oldName !== 'string' || typeof newName !== 'string') {
      return res.status(400).json({ success: false, message: 'oldName and newName are required strings' });
    }

    const trimmedOld = oldName.trim();
    const trimmedNew = newName.trim();

    if (trimmedOld === trimmedNew) {
      return res.json({ success: true, message: 'Names are identical, nothing to update', productsUpdated: 0 });
    }

    // 1. Update the name in the CategoryOrder document
    await CategoryOrder.updateOne(
      { configKey: 'main', 'categories.name': trimmedOld },
      { $set: { 'categories.$.name': trimmedNew } }
    );

    // 2. Rename the category in ALL products that have the old name
    const result = await Product.updateMany(
      { categories: trimmedOld },
      { $set: { 'categories.$[elem]': trimmedNew } },
      { arrayFilters: [{ elem: trimmedOld }] }
    );

    // 3. Clear API cache
    apiCache.clear();

    console.log(`Category renamed: "${trimmedOld}" → "${trimmedNew}" (${result.modifiedCount} products updated)`);

    res.json({
      success: true,
      message: `Category renamed from "${trimmedOld}" to "${trimmedNew}"`,
      productsUpdated: result.modifiedCount
    });
  } catch (error) {
    console.error('renameCategory error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCategoryOrder, updateCategoryOrder, getProductsGrouped, renameCategory };
