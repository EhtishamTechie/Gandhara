const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gandhara');

const Product = mongoose.model('Product', new mongoose.Schema({
  image: String,
  title: String,
}));

async function deleteProductsWithMissingImages() {
  console.log('🗑️  DELETING PRODUCTS WITH MISSING IMAGES\n');
  console.log('=' .repeat(60));
  
  const productsWithCompressed = await Product.find({
    image: /products\/compressed/
  });
  
  console.log(`\nFound ${productsWithCompressed.length} products with old paths\n`);
  
  let deleted = 0;
  
  for (const product of productsWithCompressed) {
    const sourcePath = path.join(__dirname, '..', product.image.replace('uploads/', ''));
    
    // Check if file exists
    if (!fs.existsSync(sourcePath)) {
      console.log(`  🗑️  Deleting: ${product.title}`);
      await Product.deleteOne({ _id: product._id });
      deleted++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`✨ CLEANUP COMPLETE - Deleted ${deleted} products with missing images\n`);
  
  await mongoose.disconnect();
}

deleteProductsWithMissingImages().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
