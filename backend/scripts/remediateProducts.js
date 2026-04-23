/**
 * Automated remediation for products with invalid/missing text fields
 * - Ensures required fields (title, description, keywords, image, categories, price) are valid types
 * - Converts arrays/objects to strings where safe, or sets fallback defaults
 * - Records failed IDs for manual follow-up
 */

const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

function ensureString(value, fallback) {
  if (typeof value === 'string') return value.trim();
  if (value == null) return fallback;
  try {
    if (Array.isArray(value)) return String(value[0] || fallback).trim();
    return String(value).trim();
  } catch (e) {
    return fallback;
  }
}

function ensureStringArray(value, fallbackArray) {
  if (Array.isArray(value)) return value.map(v => ensureString(v, '')).filter(Boolean);
  if (typeof value === 'string') {
    // split common separators
    const parts = value.split(/[,|;]+/).map(p => p.trim()).filter(Boolean);
    return parts.length > 0 ? parts : fallbackArray;
  }
  return fallbackArray;
}

async function remediateProduct(prod) {
  let changed = false;

  // title (required)
  const origTitle = prod.title;
  prod.title = ensureString(prod.title, `Unnamed product ${prod._id}`);
  if (prod.title !== origTitle) changed = true;

  // description (required)
  const origDesc = prod.description;
  prod.description = ensureString(prod.description, `Description for product ${prod._id}`);
  if (prod.description !== origDesc) changed = true;

  // keywords -> ensure array
  const origKeywords = prod.keywords;
  prod.keywords = ensureStringArray(prod.keywords, ['gandhara art']);
  if (JSON.stringify(prod.keywords) !== JSON.stringify(origKeywords)) changed = true;

  // price (required) - keep existing if valid number
  if (prod.price == null || typeof prod.price !== 'number' || Number.isNaN(prod.price)) {
    prod.price = 0; // placeholder
    changed = true;
  }

  // image (required)
  const origImage = prod.image;
  prod.image = ensureString(prod.image, '/GandharaImages/placeholder.jpg');
  if (prod.image !== origImage) changed = true;

  // categories (required array)
  const origCategories = prod.categories;
  prod.categories = ensureStringArray(prod.categories, ['uncategorized']);
  if (JSON.stringify(prod.categories) !== JSON.stringify(origCategories)) changed = true;

  // focusKeyword (string, max 50) - coerce and truncate
  if (prod.focusKeyword != null) {
    const fk = ensureString(prod.focusKeyword, 'gandhara');
    if (fk.length > 50) {
      prod.focusKeyword = fk.substring(0, 47) + '...';
      changed = true;
    }
  }

  // imageAlt -> ensure string
  if (prod.imageAlt == null || typeof prod.imageAlt !== 'string' || prod.imageAlt.trim() === '') {
    prod.imageAlt = `${prod.title} | Gandhara Arts`;
    changed = true;
  }

  // shortDescription
  if (prod.shortDescription == null || typeof prod.shortDescription !== 'string' || prod.shortDescription.trim() === '') {
    prod.shortDescription = prod.description.substring(0, 180);
    changed = true;
  }

  if (!changed) return { updated: false };

  try {
    await prod.save({ validateBeforeSave: true });
    return { updated: true };
  } catch (err) {
    return { updated: false, error: err.message };
  }
}

async function main() {
  try {
    console.log('🔧 Starting remediation script...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    const stats = { total: products.length, updated: 0, errors: 0, errorDetails: [] };

    for (let i = 0; i < products.length; i++) {
      if (i % 100 === 0) console.log(`[${i + 1}/${products.length}] scanning`);
      const prod = products[i];
      const res = await remediateProduct(prod);
      if (res.updated) stats.updated++;
      if (res.error) {
        stats.errors++;
        if (stats.errorDetails.length < 20) stats.errorDetails.push({ id: prod._id, error: res.error });
      }
    }

    console.log('\n📊 Remediation Summary');
    console.log(`  Total scanned: ${stats.total}`);
    console.log(`  Updated: ${stats.updated}`);
    console.log(`  Errors: ${stats.errors}`);
    if (stats.errorDetails.length) {
      console.log('\n  Error details (sample):');
      stats.errorDetails.forEach(e => console.log(`   - ${e.id}: ${e.error}`));
    }

    await mongoose.disconnect();
    console.log('\n🔧 Remediation completed.');
    process.exit(0);
  } catch (err) {
    console.error('Fatal:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

main();
