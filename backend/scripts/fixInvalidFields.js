/**
 * Targeted fixer for lingering validation issues:
 * - Set price to 0 when null
 * - Clean keywords array elements (remove stray brackets/quotes)
 * - Truncate seoDescription > 160
 * - Ensure title/description are strings
 */

const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

function cleanKeyword(str) {
  if (!str) return null;
  try {
    let s = typeof str === 'string' ? str : String(str);
    // remove outer brackets/quotes and stray quotes
    s = s.replace(/^[\[\]\s\"]+|[\[\]\s\"]+$/g, '');
    // collapse multiple spaces
    s = s.replace(/\s{2,}/g, ' ').trim();
    // remove trailing punctuation like '.'
    s = s.replace(/[\.\,\;\:]+$/g, '').trim();
    return s;
  } catch (e) { return null; }
}

function truncate(text, max) {
  if (!text) return text;
  text = typeof text === 'string' ? text : String(text);
  return text.length > max ? text.substring(0, max - 3) + '...' : text;
}

async function fixDoc(doc) {
  let changed = false;

  // price
  if (doc.price == null || typeof doc.price !== 'number' || Number.isNaN(doc.price)) {
    doc.price = 0;
    changed = true;
  }

  // keywords
  if (Array.isArray(doc.keywords)) {
    const cleaned = doc.keywords.map(k => cleanKeyword(k)).filter(Boolean);
    if (JSON.stringify(cleaned) !== JSON.stringify(doc.keywords)) {
      doc.keywords = cleaned.length ? cleaned : ['gandhara art'];
      changed = true;
    }
  } else if (typeof doc.keywords === 'string') {
    doc.keywords = doc.keywords.split(/[,;|]+/).map(k => cleanKeyword(k)).filter(Boolean);
    changed = true;
  }

  // seoDescription
  if (doc.seoDescription) {
    const sd = typeof doc.seoDescription === 'string' ? doc.seoDescription : String(doc.seoDescription);
    if (sd.length > 160) {
      doc.seoDescription = truncate(sd, 160);
      changed = true;
    }
  }

  // title/description
  if (!doc.title || typeof doc.title !== 'string') {
    doc.title = `Unnamed product ${doc._id}`;
    changed = true;
  }
  if (!doc.description || typeof doc.description !== 'string') {
    doc.description = `Description for product ${doc._id}`;
    changed = true;
  }

  if (!changed) return { updated: false };
  try {
    await doc.save();
    return { updated: true };
  } catch (err) {
    return { updated: false, error: err.message };
  }
}

async function main() {
  try {
    console.log('🛠️  Starting targeted fixer...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    let total = 0, updated = 0, errors = 0;
    const errorDetails = [];

    for (let i = 0; i < products.length; i++) {
      if (i % 200 === 0) console.log(`Processing ${i+1}/${products.length}`);
      total++;
      const res = await fixDoc(products[i]);
      if (res.updated) updated++;
      if (res.error) {
        errors++;
        if (errorDetails.length < 20) errorDetails.push({ id: products[i]._id, error: res.error });
      }
    }

    console.log('\n📊 Targeted fixer summary');
    console.log(`  Scanned: ${total}`);
    console.log(`  Updated: ${updated}`);
    console.log(`  Errors: ${errors}`);
    if (errorDetails.length) {
      console.log('\n  Sample errors:');
      errorDetails.forEach(e => console.log(`   - ${e.id}: ${e.error}`));
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Fatal:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

main();
