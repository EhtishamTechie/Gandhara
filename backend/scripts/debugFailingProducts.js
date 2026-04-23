/**
 * Debug script to inspect failing products
 */

const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const failingIds = [
  '6865ca34a3ded8dd4b2f5869',
  '6865cacda3ded8dd4b2f586f',
  '6865cb17a3ded8dd4b2f5873',
  '6865cb7da3ded8dd4b2f5877',
  '6865cbdfa3ded8dd4b2f5881'
];

async function debugProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    for (const id of failingIds) {
      const product = await Product.findById(id).lean();
      
      if (product) {
        console.log(`\n📦 Product ID: ${id}`);
        console.log(`   Name: ${typeof product.name} = "${product.name}"`);
        console.log(`   Description: ${typeof product.description} = "${product.description?.substring(0, 50)}..."`);
        console.log(`   Title: ${typeof product.title} = "${product.title}"`);
        console.log(`   Price: ${typeof product.price} = ${product.price}`);
        console.log(`   Category: ${typeof product.category} = "${product.category}"`);
        console.log(`   Slug: ${typeof product.slug} = "${product.slug}"`);
        console.log(`   SEO Title: ${typeof product.seoTitle} = "${product.seoTitle}"`);
        console.log(`   SEO Description: ${typeof product.seoDescription} = "${product.seoDescription?.substring(0, 50)}..."`);
        console.log(`   Focus Keyword: ${typeof product.focusKeyword} = ${JSON.stringify(product.focusKeyword)}`);
        console.log(`   Meta Keywords: ${Array.isArray(product.metaKeywords)} = ${product.metaKeywords?.length} items`);
        console.log(`   Images: ${Array.isArray(product.images)} = ${product.images?.length} items`);
      } else {
        console.log(`❌ Product ${id} not found`);
      }
    }

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugProducts();
