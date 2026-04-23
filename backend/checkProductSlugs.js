/**
 * Quick Check: Do products have slugs?
 * Run: node backend/checkProductSlugs.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const checkSlugs = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get total products
    const totalProducts = await Product.countDocuments();
    console.log(`📊 Total Products: ${totalProducts}`);

    // Count products with slugs
    const productsWithSlugs = await Product.countDocuments({
      slug: { $exists: true, $ne: null, $ne: '' }
    });
    console.log(`✅ Products with slugs: ${productsWithSlugs}`);

    // Count products without slugs
    const productsWithoutSlugs = await Product.countDocuments({
      $or: [
        { slug: { $exists: false } },
        { slug: null },
        { slug: '' }
      ]
    });
    console.log(`❌ Products without slugs: ${productsWithoutSlugs}\n`);

    // Show sample products
    console.log('📦 Sample Products (first 5):');
    const sampleProducts = await Product.find().limit(5);
    sampleProducts.forEach((p, i) => {
      console.log(`\n${i + 1}. ${p.title}`);
      console.log(`   ID: ${p._id}`);
      console.log(`   Slug: ${p.slug || 'NO SLUG ❌'}`);
      console.log(`   Categories: ${p.categories?.join(', ') || 'N/A'}`);
    });

    // Check featured products specifically
    console.log('\n\n🌟 Featured Products:');
    const featuredProducts = await Product.find({
      categories: { $regex: /featuredProducts/i }
    });
    console.log(`Total Featured Products: ${featuredProducts.length}`);
    featuredProducts.forEach((p, i) => {
      console.log(`${i + 1}. ${p.title} - Slug: ${p.slug || 'NO SLUG ❌'}`);
    });

    // Check luxury products specifically
    console.log('\n\n💎 Luxury Collection Products:');
    const luxuryProducts = await Product.find({
      categories: { $regex: /Luxary Collection/i }
    });
    console.log(`Total Luxury Products: ${luxuryProducts.length}`);
    luxuryProducts.forEach((p, i) => {
      console.log(`${i + 1}. ${p.title} - Slug: ${p.slug || 'NO SLUG ❌'}`);
    });

    if (productsWithoutSlugs > 0) {
      console.log('\n\n⚠️  ACTION REQUIRED:');
      console.log('Run this command to generate slugs for all products:');
      console.log('node backend/scripts/generateSlugsForExistingProducts.js');
    } else {
      console.log('\n\n✅ All products have slugs! You\'re good to go!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkSlugs();
