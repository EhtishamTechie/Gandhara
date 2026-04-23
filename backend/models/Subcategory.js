const mongoose = require('mongoose');

/**
 * Subcategory
 * ---------------------------------------------------------------
 * Non-destructive addition for the right-side category sidebar.
 *
 * Design notes:
 *  - `parentCategoryName` is a PLAIN STRING, matching the existing
 *    flat-string category system (Product.categories is [String]
 *    and CategoryOrder stores category names). We intentionally do
 *    NOT use a foreign key — that would require migrating every
 *    Product document.
 *  - `slug` is a URL-safe identifier used for deep-linking
 *    /category/<parent-slug>?sub=<child-slug>.
 *  - Compound unique index on (parentCategoryName, slug) allows
 *    the same child name under different parents (e.g. "Small" as
 *    a child of two different categories).
 *  - `isVisible` and `sortOrder` drive sidebar rendering without
 *    touching the existing CategoryOrder isVisible flag (which
 *    controls the homepage grouped-products section).
 */
const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: /^[a-z0-9-]+$/,
    maxlength: 100
  },
  parentCategoryName: {
    type: String,
    required: true,
    trim: true
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// One slug per parent — but the same slug can exist under a
// different parent, which is why this is a COMPOUND unique index.
subcategorySchema.index({ parentCategoryName: 1, slug: 1 }, { unique: true });

// Speeds up the common "list children of this parent" query.
subcategorySchema.index({ parentCategoryName: 1, sortOrder: 1 });

module.exports = mongoose.model('Subcategory', subcategorySchema);
