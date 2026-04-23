const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// Import models
const Product = require('../models/Product');
const VisitPlace = require('../models/VisitPlace');
const Master = require('../models/Master');

// Statistics tracking
const stats = {
  products: { total: 0, updated: 0, skipped: 0, errors: 0 },
  visitPlaces: { total: 0, updated: 0, skipped: 0, errors: 0 },
  masters: { total: 0, updated: 0, skipped: 0, errors: 0 },
  startTime: Date.now(),
};

/**
 * Convert image paths from JPG/PNG to WebP
 */
function convertPathToWebP(imagePath) {
  if (!imagePath || typeof imagePath !== 'string') return imagePath;
  
  // Skip if already WebP
  if (imagePath.endsWith('.webp')) return imagePath;
  
  // Replace extension with .webp
  return imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
}

/**
 * Update Product images to WebP
 */
async function updateProducts() {
  console.log('\n📦 Updating Product images...\n');
  
  try {
    const products = await Product.find({});
    stats.products.total = products.length;
    
    for (const product of products) {
      try {
        let updated = false;
        
        // Update main image
        if (product.image && !product.image.endsWith('.webp')) {
          const newPath = convertPathToWebP(product.image);
          if (newPath !== product.image) {
            product.image = newPath;
            updated = true;
          }
        }
        
        // Update images array
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
          const newImages = product.images.map(img => convertPathToWebP(img));
          if (JSON.stringify(newImages) !== JSON.stringify(product.images)) {
            product.images = newImages;
            updated = true;
          }
        }
        
        if (updated) {
          await product.save();
          console.log(`✓ Updated: ${product.name} (ID: ${product._id})`);
          stats.products.updated++;
        } else {
          stats.products.skipped++;
        }
        
      } catch (error) {
        console.error(`✗ Error updating product ${product._id}:`, error.message);
        stats.products.errors++;
      }
    }
    
    console.log(`\n✓ Products: ${stats.products.updated} updated, ${stats.products.skipped} skipped, ${stats.products.errors} errors`);
    
  } catch (error) {
    console.error('❌ Error fetching products:', error);
  }
}

/**
 * Update VisitPlace images to WebP
 */
async function updateVisitPlaces() {
  console.log('\n🏛️ Updating VisitPlace images...\n');
  
  try {
    const visitPlaces = await VisitPlace.find({});
    stats.visitPlaces.total = visitPlaces.length;
    
    for (const place of visitPlaces) {
      try {
        let updated = false;
        
        // Update main image
        if (place.image && !place.image.endsWith('.webp')) {
          const newPath = convertPathToWebP(place.image);
          if (newPath !== place.image) {
            place.image = newPath;
            updated = true;
          }
        }
        
        // Update images array
        if (place.images && Array.isArray(place.images) && place.images.length > 0) {
          const newImages = place.images.map(img => convertPathToWebP(img));
          if (JSON.stringify(newImages) !== JSON.stringify(place.images)) {
            place.images = newImages;
            updated = true;
          }
        }
        
        if (updated) {
          await place.save();
          console.log(`✓ Updated: ${place.name} (ID: ${place._id})`);
          stats.visitPlaces.updated++;
        } else {
          stats.visitPlaces.skipped++;
        }
        
      } catch (error) {
        console.error(`✗ Error updating visit place ${place._id}:`, error.message);
        stats.visitPlaces.errors++;
      }
    }
    
    console.log(`\n✓ VisitPlaces: ${stats.visitPlaces.updated} updated, ${stats.visitPlaces.skipped} skipped, ${stats.visitPlaces.errors} errors`);
    
  } catch (error) {
    console.error('❌ Error fetching visit places:', error);
  }
}

/**
 * Update Master (categories) images to WebP
 */
async function updateMasters() {
  console.log('\n📂 Updating Master (category) images...\n');
  
  try {
    const masters = await Master.find({});
    stats.masters.total = masters.length;
    
    for (const master of masters) {
      try {
        let updated = false;
        
        // Update main image
        if (master.image && !master.image.endsWith('.webp')) {
          const newPath = convertPathToWebP(master.image);
          if (newPath !== master.image) {
            master.image = newPath;
            updated = true;
          }
        }
        
        if (updated) {
          await master.save();
          console.log(`✓ Updated: ${master.name} (ID: ${master._id})`);
          stats.masters.updated++;
        } else {
          stats.masters.skipped++;
        }
        
      } catch (error) {
        console.error(`✗ Error updating master ${master._id}:`, error.message);
        stats.masters.errors++;
      }
    }
    
    console.log(`\n✓ Masters: ${stats.masters.updated} updated, ${stats.masters.skipped} skipped, ${stats.masters.errors} errors`);
    
  } catch (error) {
    console.error('❌ Error fetching masters:', error);
  }
}

/**
 * Print final statistics
 */
function printStats() {
  const duration = ((Date.now() - stats.startTime) / 1000).toFixed(1);
  const totalUpdated = stats.products.updated + stats.visitPlaces.updated + stats.masters.updated;
  const totalSkipped = stats.products.skipped + stats.visitPlaces.skipped + stats.masters.skipped;
  const totalErrors = stats.products.errors + stats.visitPlaces.errors + stats.masters.errors;
  const totalRecords = stats.products.total + stats.visitPlaces.total + stats.masters.total;
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 DATABASE UPDATE COMPLETE');
  console.log('='.repeat(60));
  console.log(`📦 Products: ${stats.products.updated}/${stats.products.total} updated`);
  console.log(`🏛️ VisitPlaces: ${stats.visitPlaces.updated}/${stats.visitPlaces.total} updated`);
  console.log(`📂 Masters: ${stats.masters.updated}/${stats.masters.total} updated`);
  console.log('');
  console.log(`✓ Total updated: ${totalUpdated} records`);
  console.log(`⊘ Total skipped: ${totalSkipped} records`);
  console.log(`✗ Total errors: ${totalErrors} records`);
  console.log(`📊 Total processed: ${totalRecords} records`);
  console.log(`⏱ Duration: ${duration} seconds`);
  console.log('='.repeat(60) + '\n');
}

/**
 * Main execution function
 */
async function main() {
  console.log('\n🚀 Starting Database Image Path Update to WebP\n');
  
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB\n');
    
    // Update all collections
    await updateProducts();
    await updateVisitPlaces();
    await updateMasters();
    
    // Print final statistics
    printStats();
    
    console.log('✅ Database update complete!\n');
    console.log('Next steps:');
    console.log('1. Clear frontend browser cache');
    console.log('2. Test website to ensure images load correctly');
    console.log('3. Run PageSpeed Insights to verify performance improvement\n');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed\n');
  }
}

// Run the script
main().catch(error => {
  console.error('\n❌ Unhandled error:', error);
  process.exit(1);
});
