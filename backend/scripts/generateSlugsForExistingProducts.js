/**
 * Migration Script: Generate Slugs for Existing Products
 * 
 * This script will:
 * 1. Find all products without slugs
 * 2. Generate SEO-friendly slugs based on title and categories
 * 3. Ensure uniqueness
 * 4. Update products in the database
 * 
 * Run: node backend/scripts/generateSlugsForExistingProducts.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { generateProductSlug, ensureUniqueSlug } = require('../utils/slugGenerator');

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MongoDB URI not found in environment variables. Check your .env file.');
    }
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Main migration function
const generateSlugs = async () => {
  try {
    console.log('\n🚀 Starting Slug Generation for Existing Products...\n');
    
    // Find all products without slugs (null or empty string)
    const productsWithoutSlugs = await Product.find({
      $or: [
        { slug: { $exists: false } },
        { slug: null },
        { slug: '' }
      ]
    });
    
    console.log(`📊 Found ${productsWithoutSlugs.length} products without slugs`);
    
    if (productsWithoutSlugs.length === 0) {
      console.log('✅ All products already have slugs!');
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Process products in batches for better performance
    const batchSize = 50;
    for (let i = 0; i < productsWithoutSlugs.length; i += batchSize) {
      const batch = productsWithoutSlugs.slice(i, i + batchSize);
      
      console.log(`\n📦 Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(productsWithoutSlugs.length/batchSize)}`);
      
      for (const product of batch) {
        try {
          // Generate base slug from title and categories (without product ID)
          const baseSlug = generateProductSlug(
            product.title,
            product.categories || []
          );
          
          // Ensure uniqueness (will add -1, -2, etc. if duplicate)
          const uniqueSlug = await ensureUniqueSlug(baseSlug, Product, product._id);
          
          // Update product
          product.slug = uniqueSlug;
          product.lastSEOUpdate = new Date();
          await product.save();
          
          successCount++;
          
          // Show progress every 10 products
          if (successCount % 10 === 0) {
            console.log(`  ✓ Processed ${successCount}/${productsWithoutSlugs.length} products...`);
          }
          
        } catch (error) {
          errorCount++;
          errors.push({
            productId: product._id,
            title: product.title,
            error: error.message
          });
          console.error(`  ✗ Error for product "${product.title}" (${product._id}):`, error.message);
        }
      }
      
      // Small delay between batches to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully generated slugs: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📈 Success rate: ${((successCount / productsWithoutSlugs.length) * 100).toFixed(2)}%`);
    
    if (errors.length > 0) {
      console.log('\n⚠️  Products with errors:');
      errors.slice(0, 10).forEach(err => {
        console.log(`  - ${err.title} (${err.productId}): ${err.error}`);
      });
      
      if (errors.length > 10) {
        console.log(`  ... and ${errors.length - 10} more`);
      }
    }
    
    // Verify results
    const remainingWithoutSlugs = await Product.countDocuments({
      $or: [
        { slug: { $exists: false } },
        { slug: null },
        { slug: '' }
      ]
    });
    
    console.log('\n' + '='.repeat(60));
    console.log(`🔍 Verification: ${remainingWithoutSlugs} products still without slugs`);
    
    if (remainingWithoutSlugs === 0) {
      console.log('✅ All products now have slugs! Migration complete!');
    } else {
      console.log('⚠️  Some products still need slugs. Review errors above.');
    }
    
  } catch (error) {
    console.error('❌ Migration Error:', error);
    throw error;
  }
};

// Run the migration
const runMigration = async () => {
  try {
    await connectDB();
    await generateSlugs();
    
    console.log('\n✨ Migration completed successfully!');
    console.log('💡 You can now use slug-based URLs for all products\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Execute
runMigration();
