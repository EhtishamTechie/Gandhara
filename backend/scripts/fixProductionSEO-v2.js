/**
 * Production SEO Fix Script - Version 2
 * Handles validation errors from v1 (missing price, long focusKeyword)
 */

const mongoose = require('mongoose');
const Product = require('../models/Product');
const VisitPlace = require('../models/VisitPlace');
const { generateProductSlug, ensureUniqueSlug } = require('../utils/slugGenerator');
const { calculateSEOScore } = require('../utils/seoUtils');
require('dotenv').config();

// Helper: Truncate text to max length
function truncate(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
}

// Helper: Generate optimized SEO title (max 60 chars)
function generateOptimizedSEOTitle(product) {
  const category = (Array.isArray(product.categories) && product.categories.length) ? product.categories[0] : (product.category || 'Stone Art');
  const name = product.title || product.name || 'Product';
  
  let title = `${name} | ${category} | Gandhara Arts`;
  return truncate(title, 60);
}

// Helper: Generate optimized description (max 160 chars)
function generateOptimizedDescription(product) {
  const name = product.title || product.name || 'product';
  const category = (Array.isArray(product.categories) && product.categories.length) ? product.categories[0] : (product.category || 'stone craft');
  const material = product.material || 'stone';
  
  let desc = `Handcrafted ${name.toLowerCase()} in ${material} from Taxila, Pakistan. Authentic ${category.toLowerCase()} with traditional craftsmanship. Shop now at Gandhara Arts.`;
  return truncate(desc, 160);
}

// Helper: Fix focusKeyword array (ensure single string, max 50 chars)
function fixFocusKeyword(product) {
  if (!product.focusKeyword) return null;
  
  // If it's an array, take the first element
  let keyword = Array.isArray(product.focusKeyword) 
    ? product.focusKeyword[0] 
    : product.focusKeyword;
  
  // If still an array or object, convert to string
  if (typeof keyword !== 'string') {
    keyword = String(keyword);
  }
  
  // Remove any array brackets and extra quotes
  keyword = keyword.replace(/[\[\]"]/g, '').trim();
  
  // Truncate to 50 chars
  keyword = truncate(keyword, 50);
  
  return keyword || null;
}

// Helper: Generate standard metaKeywords
function generateStandardKeywords(product) {
  const category = (product.category || 'stone craft').toLowerCase();
  return [
    `${category} taxila`,
    `${category} pakistan`,
    'handmade stone craft',
    'gandhara arts',
    'authentic stone art'
  ];
}

// Fix individual product SEO
async function fixProductSEO(product) {
  let updated = false;
  
  try {
    // 1. Generate slug if missing
    if (!product.slug) {
      // generateProductSlug expects (title, categories, productId)
      const baseSlug = generateProductSlug(product.title || product.name, product.categories || [], product._id);
      product.slug = await ensureUniqueSlug(baseSlug, Product, product._id);
      updated = true;
    }
    
    // 2. Fix SEO title if missing or too long
    if (!product.seoTitle || product.seoTitle.length > 60) {
      product.seoTitle = generateOptimizedSEOTitle(product);
      updated = true;
    }
    
    // 3. Fix SEO description if missing or too long
    if (!product.seoDescription || product.seoDescription.length > 160) {
      product.seoDescription = generateOptimizedDescription(product);
      updated = true;
    }
    
    // 4. Fix focusKeyword (ensure single string, max 50 chars)
    const fixedKeyword = fixFocusKeyword(product);
    if (fixedKeyword && fixedKeyword !== product.focusKeyword) {
      product.focusKeyword = fixedKeyword;
      updated = true;
    }
    
    // 5. Add metaKeywords if missing
    if (!product.metaKeywords || product.metaKeywords.length === 0) {
      product.metaKeywords = generateStandardKeywords(product);
      updated = true;
    }
    
    // 6. Add image alt text if missing
    // Product model uses `image` and `imageAlt` (single image) — add alt text if missing
    if (product.image && (!product.imageAlt || typeof product.imageAlt !== 'string' || product.imageAlt.trim() === '')) {
      product.imageAlt = `${product.title || product.name || 'Product'} | Gandhara Arts`;
      updated = true;
    }
    
    // 7. Calculate and update SEO score
    if (updated) {
      const score = calculateSEOScore(product);
      product.seoScore = score;
    }
    
    // 8. CRITICAL: Set default price if missing (validation requirement)
    // Only set default price if missing (null/undefined)
    if (product.price == null) {
      product.price = 0; // Set to 0 as placeholder - admin should update manually
      updated = true;
    }
    
    // Save only if changes were made
    if (updated) {
      await product.save({ validateBeforeSave: true });
      return { success: true, updated: true };
    }
    
    return { success: true, updated: false };
    
  } catch (error) {
    return { success: false, error: error.message, productId: product._id };
  }
}

// Fix Visit Place SEO
async function fixVisitPlaceSEO(place) {
  let updated = false;
  
  try {
    // 1. Generate slug if missing
    if (!place.slug) {
      const baseSlug = place.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      place.slug = await ensureUniqueSlug(baseSlug, VisitPlace, place._id);
      updated = true;
    }
    
    // 2. Fix SEO title (max 60 chars)
    if (!place.seoTitle || place.seoTitle.length > 60) {
      place.seoTitle = truncate(`${place.name} | Visit Taxila | Gandhara Arts`, 60);
      updated = true;
    }
    
    // 3. Fix SEO description (max 160 chars)
    if (!place.seoDescription || place.seoDescription.length > 160) {
      const desc = place.description 
        ? truncate(place.description, 157) + '...'
        : `Explore ${place.name} in Taxila, Pakistan. Discover ancient Buddhist heritage and Gandhara civilization. Plan your visit today.`;
      place.seoDescription = truncate(desc, 160);
      updated = true;
    }
    
    // 4. Add meta keywords if missing
    if (!place.metaKeywords || place.metaKeywords.length === 0) {
      place.metaKeywords = [
        'taxila heritage',
        'buddhist sites pakistan',
        'gandhara civilization',
        'visit taxila',
        'ancient monuments'
      ];
      updated = true;
    }
    
    // 5. Calculate SEO score
    if (updated) {
      const score = calculateSEOScore(place);
      place.seoScore = score;
    }
    
    if (updated) {
      await place.save({ validateBeforeSave: true });
      return { success: true, updated: true };
    }
    
    return { success: true, updated: false };
    
  } catch (error) {
    return { success: false, error: error.message, placeId: place._id };
  }
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting Production SEO Fix v2...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Fix Products
    console.log('📦 Fixing Products SEO...');
    const products = await Product.find({});
    console.log(`Found ${products.length} products\n`);
    
    const productStats = {
      total: products.length,
      fixed: 0,
      skipped: 0,
      errors: 0,
      errorDetails: []
    };
    
    for (let i = 0; i < products.length; i++) {
      if (i % 100 === 0) {
        console.log(`[${i + 1}/${products.length}] Processing...`);
      }
      
      const result = await fixProductSEO(products[i]);
      
      if (result.success) {
        if (result.updated) {
          productStats.fixed++;
        } else {
          productStats.skipped++;
        }
      } else {
        productStats.errors++;
        if (productStats.errorDetails.length < 10) {
          productStats.errorDetails.push({
            id: result.productId,
            error: result.error
          });
        }
      }
    }
    
    console.log('\n');
    
    // Fix Visit Places
    console.log('🏛️  Fixing Visit Places SEO...');
    const visitPlaces = await VisitPlace.find({});
    console.log(`Found ${visitPlaces.length} visit places\n`);
    
    const placeStats = {
      total: visitPlaces.length,
      fixed: 0,
      skipped: 0,
      errors: 0,
      errorDetails: []
    };
    
    for (const place of visitPlaces) {
      console.log(`Processing: ${place.name}`);
      const result = await fixVisitPlaceSEO(place);
      
      if (result.success) {
        if (result.updated) {
          placeStats.fixed++;
        } else {
          placeStats.skipped++;
        }
      } else {
        placeStats.errors++;
        placeStats.errorDetails.push({
          id: result.placeId,
          error: result.error
        });
      }
    }
    
    // Print summary
    console.log('\n\n📊 === FIX SUMMARY ===\n');
    console.log('Products:');
    console.log(`  Total: ${productStats.total}`);
    console.log(`  Fixed: ${productStats.fixed}`);
    console.log(`  Skipped: ${productStats.skipped}`);
    console.log(`  Errors: ${productStats.errors}`);
    
    console.log('\nVisit Places:');
    console.log(`  Total: ${placeStats.total}`);
    console.log(`  Fixed: ${placeStats.fixed}`);
    console.log(`  Skipped: ${placeStats.skipped}`);
    console.log(`  Errors: ${placeStats.errors}`);
    
    if (productStats.errorDetails.length > 0) {
      console.log('\n⚠️  Product Errors (first 10):');
      productStats.errorDetails.forEach(err => {
        console.log(`  - ${err.id}: ${err.error}`);
      });
    }
    
    if (placeStats.errorDetails.length > 0) {
      console.log('\n⚠️  Visit Place Errors:');
      placeStats.errorDetails.forEach(err => {
        console.log(`  - ${err.id}: ${err.error}`);
      });
    }
    
    console.log('\n🎉 Production SEO Fix v2 Completed!\n');
    
    // Disconnect
    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Fatal Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
main();

module.exports = { fixProductSEO, fixVisitPlaceSEO };
