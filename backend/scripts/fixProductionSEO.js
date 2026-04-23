/**
 * Production SEO Fix Script - Handles 1828+ products with data quality issues
 * Fixes: missing slugs, long descriptions, missing titles, etc.
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../models/Product');
const VisitPlace = require('../models/VisitPlace');
const { generateProductSlug, generateSlug, ensureUniqueSlug } = require('../utils/slugGenerator');
const { calculateSEOScore } = require('../utils/seoUtils');

const stats = {
  products: { total: 0, fixed: 0, skipped: 0, errors: [] },
  visitPlaces: { total: 0, fixed: 0, skipped: 0, errors: [] }
};

/**
 * Truncate text to max length with ellipsis
 */
function truncate(text, maxLength) {
  if (!text) return '';
  text = String(text).trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Generate optimized SEO title
 */
function generateOptimizedSEOTitle(title, category = '') {
  if (!title) return 'Gandhara Arts - Stone Craft';
  
  let seoTitle = title;
  const brand = 'Gandhara Arts';
  
  if (category && seoTitle.length + category.length + 3 < 50) {
    seoTitle = `${title} - ${category}`;
  }
  
  if (seoTitle.length + brand.length + 3 <= 60) {
    seoTitle = `${seoTitle} | ${brand}`;
  }
  
  return truncate(seoTitle, 60);
}

/**
 * Generate optimized SEO description
 */
function generateOptimizedDescription(product) {
  const title = product.title || product.name || 'Stone craft';
  const desc = product.description || '';
  const category = product.categories?.[0] || product.category || 'handcrafted item';
  
  let seoDesc = '';
  
  if (desc.length > 100) {
    // Use first sentence or first 100 chars from description
    seoDesc = desc.substring(0, 140) + '...';
  } else {
    // Generate from title and category
    seoDesc = `Authentic ${title} - ${category} from Taxila, Pakistan. Handcrafted stone art with worldwide shipping. Premium quality guaranteed.`;
  }
  
  return truncate(seoDesc, 160);
}

/**
 * Fix a single product's SEO
 */
async function fixProductSEO(product) {
  try {
    let updated = false;
    const titleField = product.title || product.name;
    
    // Skip if no title at all
    if (!titleField || titleField.trim() === '') {
      console.log(`⚠️  Skipping product ${product._id}: No title/name`);
      stats.products.skipped++;
      return false;
    }
    
    // Ensure title field exists (normalize name to title)
    if (!product.title && product.name) {
      product.title = product.name;
      updated = true;
    }
    
    // Generate slug if missing
    if (!product.slug) {
      try {
        const categories = product.categories || [product.category] || [];
        const baseSlug = generateProductSlug(titleField, categories, product._id);
        product.slug = await ensureUniqueSlug(baseSlug, Product, product._id);
        updated = true;
        console.log(`   ✅ Slug: ${product.slug}`);
      } catch (error) {
        // Fallback slug generation
        const fallbackSlug = generateSlug(titleField + '-' + product._id.toString().slice(-6));
        product.slug = await ensureUniqueSlug(fallbackSlug, Product, product._id);
        updated = true;
        console.log(`   ✅ Fallback Slug: ${product.slug}`);
      }
    }
    
    // Fix SEO title (generate or truncate)
    if (!product.seoTitle || product.seoTitle.length > 60) {
      const category = product.categories?.[0] || product.category || '';
      product.seoTitle = generateOptimizedSEOTitle(titleField, category);
      updated = true;
      console.log(`   ✅ SEO Title: ${product.seoTitle.substring(0, 50)}...`);
    }
    
    // Fix SEO description (generate or truncate)
    if (!product.seoDescription || product.seoDescription.length > 160) {
      product.seoDescription = generateOptimizedDescription(product);
      updated = true;
      console.log(`   ✅ SEO Desc: ${product.seoDescription.substring(0, 50)}...`);
    }
    
    // Generate meta keywords if missing
    if (!product.metaKeywords || product.metaKeywords.length === 0) {
      product.metaKeywords = [
        'taxila pakistan stone craft',
        'handmade stone craft pakistan',
        'authentic gandhara art tradition',
        'buddhist heritage pakistan stone',
        'traditional stone carving pakistan'
      ];
      updated = true;
    }
    
    // Generate focus keyword if missing
    if (!product.focusKeyword) {
      product.focusKeyword = (product.keywords?.[0] || titleField.split(' ')[0] || 'gandhara').toLowerCase();
      updated = true;
    }
    
    // Generate image alt if missing
    if (!product.imageAlt) {
      const category = product.categories?.[0] || product.category || 'stone craft';
      product.imageAlt = truncate(`${titleField} - ${category} from Gandhara Arts Taxila`, 125);
      updated = true;
    }
    
    // Calculate SEO score
    product.seoScore = calculateSEOScore(product);
    product.lastSEOUpdate = new Date();
    
    if (updated) {
      await product.save();
      stats.products.fixed++;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    stats.products.errors.push({ id: product._id, error: error.message });
    return false;
  }
}

/**
 * Fix a single visit place's SEO
 */
async function fixVisitPlaceSEO(place) {
  try {
    let updated = false;
    
    if (!place.name || place.name.trim() === '') {
      console.log(`⚠️  Skipping place ${place._id}: No name`);
      stats.visitPlaces.skipped++;
      return false;
    }
    
    // Generate slug if missing
    if (!place.slug) {
      const baseSlug = generateSlug(place.name);
      place.slug = await ensureUniqueSlug(baseSlug, VisitPlace, place._id);
      updated = true;
      console.log(`   ✅ Slug: ${place.slug}`);
    }
    
    // Fix SEO title (truncate if too long)
    if (!place.seoTitle || place.seoTitle.length > 60) {
      place.seoTitle = truncate(`${place.name} - Heritage Site | Gandhara Arts`, 60);
      updated = true;
      console.log(`   ✅ SEO Title: ${place.seoTitle}`);
    }
    
    // Fix SEO description (truncate if too long)
    if (!place.seoDescription || place.seoDescription.length > 160) {
      const desc = place.description || '';
      place.seoDescription = desc.length > 100 
        ? truncate(desc, 160)
        : truncate(`Visit ${place.name} in Taxila. Explore ancient Gandhara heritage and stone crafts at Gandhara Arts.`, 160);
      updated = true;
      console.log(`   ✅ SEO Desc: ${place.seoDescription.substring(0, 50)}...`);
    }
    
    // Generate image alt if missing
    if (!place.imageAlt) {
      place.imageAlt = truncate(`${place.name} - Heritage Site in Taxila, Pakistan`, 125);
      updated = true;
    }
    
    // Calculate SEO score
    place.seoScore = calculateSEOScore(place);
    place.lastSEOUpdate = new Date();
    
    if (updated) {
      await place.save();
      stats.visitPlaces.fixed++;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    stats.visitPlaces.errors.push({ id: place._id, error: error.message });
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Production SEO Fix...\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Fix products
    console.log('📦 Fixing Products SEO...');
    const products = await Product.find({});
    stats.products.total = products.length;
    console.log(`Found ${products.length} products\n`);
    
    let processedCount = 0;
    for (const product of products) {
      processedCount++;
      if (processedCount % 100 === 0 || processedCount === 1) {
        console.log(`\n[${processedCount}/${products.length}] Processing: ${product.title || product.name || product._id}`);
      }
      await fixProductSEO(product);
    }
    
    console.log('\n\n🏛️  Fixing Visit Places SEO...');
    const places = await VisitPlace.find({});
    stats.visitPlaces.total = places.length;
    console.log(`Found ${places.length} visit places\n`);
    
    for (const place of places) {
      console.log(`\nProcessing: ${place.name}`);
      await fixVisitPlaceSEO(place);
    }
    
    // Print summary
    console.log('\n\n📊 === FIX SUMMARY ===');
    console.log(`\nProducts:`);
    console.log(`  Total: ${stats.products.total}`);
    console.log(`  Fixed: ${stats.products.fixed}`);
    console.log(`  Skipped: ${stats.products.skipped}`);
    console.log(`  Errors: ${stats.products.errors.length}`);
    
    console.log(`\nVisit Places:`);
    console.log(`  Total: ${stats.visitPlaces.total}`);
    console.log(`  Fixed: ${stats.visitPlaces.fixed}`);
    console.log(`  Skipped: ${stats.visitPlaces.skipped}`);
    console.log(`  Errors: ${stats.visitPlaces.errors.length}`);
    
    if (stats.products.errors.length > 0) {
      console.log(`\n⚠️  Product Errors (first 10):`);
      stats.products.errors.slice(0, 10).forEach(err => {
        console.log(`  - ${err.id}: ${err.error}`);
      });
    }
    
    if (stats.visitPlaces.errors.length > 0) {
      console.log(`\n⚠️  Visit Place Errors:`);
      stats.visitPlaces.errors.forEach(err => {
        console.log(`  - ${err.id}: ${err.error}`);
      });
    }
    
    console.log('\n🎉 Production SEO Fix Completed!');
    
  } catch (error) {
    console.error('\n❌ Fatal Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { fixProductSEO, fixVisitPlaceSEO };
