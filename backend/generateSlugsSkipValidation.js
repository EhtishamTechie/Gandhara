/**
 * Generate Slugs - Skip Validation Version
 * This script generates slugs for products without triggering model validation
 * Run: node backend/generateSlugsSkipValidation.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const { generateProductSlug, ensureUniqueSlug } = require('./utils/slugGenerator');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MongoDB URI not found in environment variables.');
    }
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected\n');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const generateSlugs = async () => {
  try {
    console.log('🚀 Starting Slug Generation (Skip Validation Mode)...\n');
    
    // Find products without slugs
    const productsWithoutSlugs = await Product.find({
      $or: [
        { slug: { $exists: false } },
        { slug: null },
        { slug: '' }
      ]
    });
    
    console.log(`📊 Found ${productsWithoutSlugs.length} products without slugs\n`);
    
    if (productsWithoutSlugs.length === 0) {
      console.log('✅ All products already have slugs!');
      return;
    }

    // Check for validation issues
    console.log('🔍 Analyzing products without slugs...\n');
    
    let missingPrice = 0;
    let longDescription = 0;
    let otherIssues = 0;

    productsWithoutSlugs.forEach(product => {
      if (!product.price || product.price === 0) {
        missingPrice++;
      }
      if (product.seoDescription && product.seoDescription.length > 160) {
        longDescription++;
      }
    });

    console.log('📋 Issues Found:');
    console.log(`   ❌ Missing/Zero Price: ${missingPrice}`);
    console.log(`   ❌ SEO Description > 160 chars: ${longDescription}`);
    console.log('');

    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    console.log('🔧 Generating slugs using direct DB update (bypassing validation)...\n');
    
    for (const product of productsWithoutSlugs) {
      try {
        // Generate base slug
        const baseSlug = generateProductSlug(
          product.title,
          product.categories || []
        );
        
        // Ensure uniqueness
        const uniqueSlug = await ensureUniqueSlug(baseSlug, Product, product._id);
        
        // Update directly using updateOne to bypass validation
        await Product.updateOne(
          { _id: product._id },
          { 
            $set: { 
              slug: uniqueSlug,
              lastSEOUpdate: new Date()
            } 
          }
        );
        
        successCount++;
        
        if (successCount % 50 === 0) {
          console.log(`  ✓ Processed ${successCount}/${productsWithoutSlugs.length} products...`);
        }
        
      } catch (error) {
        errorCount++;
        errors.push({
          productId: product._id,
          title: product.title,
          error: error.message
        });
        console.error(`  ✗ Error for "${product.title}": ${error.message}`);
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SLUG GENERATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully generated slugs: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📈 Success rate: ${((successCount / productsWithoutSlugs.length) * 100).toFixed(2)}%`);
    
    if (errors.length > 0) {
      console.log('\n⚠️  Products with errors (first 10):');
      errors.slice(0, 10).forEach(err => {
        console.log(`  - ${err.title} (${err.productId}): ${err.error}`);
      });
      if (errors.length > 10) {
        console.log(`  ... and ${errors.length - 10} more`);
      }
    }
    
    // Verify
    const stillMissing = await Product.countDocuments({
      $or: [
        { slug: { $exists: false } },
        { slug: null },
        { slug: '' }
      ]
    });
    
    console.log('\n' + '='.repeat(60));
    console.log(`🔍 Verification: ${stillMissing} products still without slugs`);
    
    if (stillMissing === 0) {
      console.log('✅ SUCCESS! All products now have slugs!');
    }
    
    // Show Featured and Luxury products status
    console.log('\n' + '='.repeat(60));
    console.log('🌟 FEATURED PRODUCTS STATUS:');
    const featured = await Product.find({
      categories: { $regex: /featuredProducts/i }
    }).select('title slug');
    
    console.log(`Total: ${featured.length}`);
    featured.forEach((p, i) => {
      console.log(`${i + 1}. ${p.title} - Slug: ${p.slug || 'NO SLUG ❌'}`);
    });
    
    console.log('\n💎 LUXURY COLLECTION STATUS:');
    const luxury = await Product.find({
      categories: { $regex: /Luxary Collection/i }
    }).select('title slug');
    
    console.log(`Total: ${luxury.length}`);
    luxury.forEach((p, i) => {
      console.log(`${i + 1}. ${p.title} - Slug: ${p.slug || 'NO SLUG ❌'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
};

const run = async () => {
  try {
    await connectDB();
    await generateSlugs();
    
    console.log('\n✨ Slug generation completed!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
};

run();
