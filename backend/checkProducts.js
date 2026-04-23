const mongoose = require('mongoose');
const Product = require('./models/Product');
const VisitPlace = require('./models/VisitPlace');
const Master = require('./models/Master');

async function checkDatabase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/gandhara');
    console.log('✅ Connected to MongoDB\n');

    // Check Products
    const productCount = await Product.countDocuments();
    const products = await Product.find().select('title categories isActive isFeatured createdAt').sort({ createdAt: -1 });
    console.log(`📦 PRODUCTS: ${productCount} total`);
    products.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.title}`);
      console.log(`     Categories: ${p.categories.join(', ')}`);
      console.log(`     Active: ${p.isActive}, Featured: ${p.isFeatured}`);
      console.log(`     Created: ${p.createdAt}`);
      console.log('');
    });

    // Check Visit Places
    const visitPlaceCount = await VisitPlace.countDocuments();
    const visitPlaces = await VisitPlace.find().select('title isActive createdAt');
    console.log(`\n🏛️ VISIT PLACES: ${visitPlaceCount} total`);
    visitPlaces.forEach((v, i) => {
      console.log(`  ${i + 1}. ${v.title} (Active: ${v.isActive})`);
    });

    // Check Masters
    const masterCount = await Master.countDocuments();
    const masters = await Master.find().select('name isActive createdAt');
    console.log(`\n👨‍🎨 MASTERS: ${masterCount} total`);
    masters.forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.name} (Active: ${m.isActive})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDatabase();
