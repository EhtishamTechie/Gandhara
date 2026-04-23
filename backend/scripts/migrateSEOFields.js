/**
 * SEO Data Migration Script
 * Migrates existing products and visit places to include SEO fields
 * 
 * Usage: node backend/scripts/migrateSEOFields.js
 */

const mongoose = require('mongoose');
const Product = require('../models/Product');
const VisitPlace = require('../models/VisitPlace');
const { generateProductSlug, generateVisitPlaceSlug, ensureUniqueSlug } = require('../utils/slugGenerator');
const { autoGenerateProductSEO, autoGenerateVisitPlaceSEO } = require('../utils/seoUtils');
require('dotenv').config();

// Track migration progress
let migrationStats = {
  products: {
    total: 0,
    migrated: 0,
    errors: 0
  },
  visitPlaces: {
    total: 0,
    migrated: 0,
    errors: 0
  }
};

/**
 * Migrate Product SEO fields
 */
async function migrateProducts() {
  console.log('\n🔄 Starting Product SEO Migration...');
  
  try {
    // Get all products without SEO fields
    const products = await Product.find({
      $or: [
        { slug: { $exists: false } },
        { slug: null },
        { slug: '' },
        { seoTitle: { $exists: false } },
        { seoDescription: { $exists: false } },
        { imageAlt: { $exists: false } }
      ]
    });

    migrationStats.products.total = products.length;
    console.log(`📊 Found ${products.length} products to migrate`);

    for (const product of products) {
      try {
        console.log(`\n🔧 Migrating product: ${product.title}`);
        
        // Generate slug if missing
        if (!product.slug) {
          const baseSlug = generateProductSlug(product.title, product.categories, product._id);
          product.slug = await ensureUniqueSlug(baseSlug, Product, product._id);
          console.log(`   ✅ Generated slug: ${product.slug}`);
        }

        // Auto-generate SEO fields
        const seoFields = autoGenerateProductSEO(product.toObject());
        
        // Update product with SEO fields
        Object.assign(product, seoFields);
        
        // Validate and save
        await product.save();
        
        migrationStats.products.migrated++;
        console.log(`   ✅ SEO Score: ${product.seoScore}/100`);
        console.log(`   ✅ SEO Title: ${product.seoTitle}`);
        console.log(`   ✅ Image Alt: ${product.imageAlt}`);
        
      } catch (error) {
        migrationStats.products.errors++;
        console.error(`   ❌ Error migrating product ${product.title}:`, error.message);
        
        // Try to save basic fields at least
        try {
          if (!product.slug) {
            const baseSlug = generateProductSlug(product.title, product.categories, product._id);
            product.slug = baseSlug + '-' + product._id.toString().substring(-6);
          }
          product.seoScore = 0;
          product.lastSEOUpdate = new Date();
          await product.save();
          console.log(`   ⚠️  Saved with minimal SEO data`);
        } catch (saveError) {
          console.error(`   ❌ Failed to save even minimal data:`, saveError.message);
        }
      }
    }

    console.log(`\n✅ Product migration completed:`);
    console.log(`   📊 Total: ${migrationStats.products.total}`);
    console.log(`   ✅ Migrated: ${migrationStats.products.migrated}`);
    console.log(`   ❌ Errors: ${migrationStats.products.errors}`);

  } catch (error) {
    console.error('❌ Product migration failed:', error);
    throw error;
  }
}

/**
 * Migrate VisitPlace SEO fields
 */
async function migrateVisitPlaces() {
  console.log('\n🔄 Starting Visit Places SEO Migration...');
  
  try {
    // Get all visit places without SEO fields
    const places = await VisitPlace.find({
      $or: [
        { slug: { $exists: false } },
        { slug: null },
        { slug: '' },
        { seoTitle: { $exists: false } },
        { seoDescription: { $exists: false } },
        { imageAlt: { $exists: false } }
      ]
    });

    migrationStats.visitPlaces.total = places.length;
    console.log(`📊 Found ${places.length} visit places to migrate`);

    for (const place of places) {
      try {
        console.log(`\n🔧 Migrating place: ${place.name}`);
        
        // Generate slug if missing
        if (!place.slug) {
          const locationStr = place.location?.district || place.location?.address || 'taxila';
          const baseSlug = generateVisitPlaceSlug(place.name, locationStr);
          place.slug = await ensureUniqueSlug(baseSlug, VisitPlace, place._id);
          console.log(`   ✅ Generated slug: ${place.slug}`);
        }

        // Set default location if missing
        if (!place.location) {
          place.location = {
            district: 'Taxila',
            province: 'Punjab',
            country: 'Pakistan'
          };
        }

        // Auto-generate SEO fields
        const seoFields = autoGenerateVisitPlaceSEO(place.toObject());
        
        // Update place with SEO fields
        Object.assign(place, seoFields);
        
        // Validate and save
        await place.save();
        
        migrationStats.visitPlaces.migrated++;
        console.log(`   ✅ SEO Score: ${place.seoScore}/100`);
        console.log(`   ✅ SEO Title: ${place.seoTitle}`);
        console.log(`   ✅ Image Alt: ${place.imageAlt}`);
        
      } catch (error) {
        migrationStats.visitPlaces.errors++;
        console.error(`   ❌ Error migrating place ${place.name}:`, error.message);
        
        // Try to save basic fields at least
        try {
          if (!place.slug) {
            const baseSlug = generateVisitPlaceSlug(place.name);
            place.slug = baseSlug + '-' + place._id.toString().substring(-6);
          }
          place.seoScore = 0;
          place.lastSEOUpdate = new Date();
          await place.save();
          console.log(`   ⚠️  Saved with minimal SEO data`);
        } catch (saveError) {
          console.error(`   ❌ Failed to save even minimal data:`, saveError.message);
        }
      }
    }

    console.log(`\n✅ Visit Places migration completed:`);
    console.log(`   📊 Total: ${migrationStats.visitPlaces.total}`);
    console.log(`   ✅ Migrated: ${migrationStats.visitPlaces.migrated}`);
    console.log(`   ❌ Errors: ${migrationStats.visitPlaces.errors}`);

  } catch (error) {
    console.error('❌ Visit Places migration failed:', error);
    throw error;
  }
}

/**
 * Backup existing data before migration
 */
async function createBackup() {
  console.log('\n💾 Creating backup of existing data...');
  
  try {
    const products = await Product.find({});
    const places = await VisitPlace.find({});
    
    const backup = {
      timestamp: new Date().toISOString(),
      products: products.map(p => p.toObject()),
      visitPlaces: places.map(p => p.toObject())
    };
    
    const fs = require('fs');
    const backupFile = `./migration-backup-${Date.now()}.json`;
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    
    console.log(`✅ Backup created: ${backupFile}`);
    console.log(`   📊 Products: ${products.length}`);
    console.log(`   📊 Visit Places: ${places.length}`);
    
    return backupFile;
  } catch (error) {
    console.error('❌ Backup creation failed:', error);
    throw error;
  }
}

/**
 * Validate migration results
 */
async function validateMigration() {
  console.log('\n🔍 Validating migration results...');
  
  try {
    // Check products
    const productsWithoutSlug = await Product.countDocuments({ 
      $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] 
    });
    
    const productsWithSEO = await Product.countDocuments({ 
      slug: { $exists: true, $ne: '' },
      seoTitle: { $exists: true },
      imageAlt: { $exists: true }
    });
    
    // Check visit places
    const placesWithoutSlug = await VisitPlace.countDocuments({ 
      $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] 
    });
    
    const placesWithSEO = await VisitPlace.countDocuments({ 
      slug: { $exists: true, $ne: '' },
      seoTitle: { $exists: true },
      imageAlt: { $exists: true }
    });
    
    console.log(`\n📊 Migration Validation Results:`);
    console.log(`   Products:`);
    console.log(`     ✅ With complete SEO: ${productsWithSEO}`);
    console.log(`     ❌ Missing slugs: ${productsWithoutSlug}`);
    console.log(`   Visit Places:`);
    console.log(`     ✅ With complete SEO: ${placesWithSEO}`);
    console.log(`     ❌ Missing slugs: ${placesWithoutSlug}`);
    
    if (productsWithoutSlug === 0 && placesWithoutSlug === 0) {
      console.log(`\n🎉 Migration completed successfully! All records have SEO fields.`);
    } else {
      console.log(`\n⚠️  Migration incomplete. Some records still missing SEO fields.`);
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
  }
}

/**
 * Main migration function
 */
async function runMigration() {
  console.log('🚀 Starting SEO Fields Migration');
  console.log('=====================================');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Create backup
    const backupFile = await createBackup();
    
    // Run migrations
    await migrateProducts();
    await migrateVisitPlaces();
    
    // Validate results
    await validateMigration();
    
    // Print summary
    console.log('\n🎯 Migration Summary:');
    console.log('=====================');
    console.log(`Products: ${migrationStats.products.migrated}/${migrationStats.products.total} migrated (${migrationStats.products.errors} errors)`);
    console.log(`Visit Places: ${migrationStats.visitPlaces.migrated}/${migrationStats.visitPlaces.total} migrated (${migrationStats.visitPlaces.errors} errors)`);
    console.log(`Backup: ${backupFile}`);
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration();
}

module.exports = {
  runMigration,
  migrateProducts,
  migrateVisitPlaces,
  createBackup,
  validateMigration
};