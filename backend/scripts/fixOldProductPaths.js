const mongoose = require('mongoose');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gandhara');

const Product = mongoose.model('Product', new mongoose.Schema({
  image: String,
  images: [String],
  title: String,
}));

async function processOldProducts() {
  console.log('🔧 FIXING OLD PRODUCT IMAGE PATHS\n');
  console.log('=' .repeat(60));
  
  // Find all products with old format paths
  const oldProducts = await Product.find({
    image: /products\/compressed/
  });
  
  console.log(`\nFound ${oldProducts.length} products with old paths\n`);
  
  let fixed = 0;
  let errors = 0;
  let generated = 0;
  
  for (const product of oldProducts) {
    try {
      // Extract filename from old path
      // uploads/products/compressed/home-decor-gandhara-art-decorative-motive-689360b19b6f40bce8a24012.webp
      const oldPath = product.image;
      const filename = path.basename(oldPath, path.extname(oldPath)); // Remove extension
      
      // Full path to source file - files are in uploads/products/compressed/
      const sourcePath = path.join(__dirname, '..', 'uploads', 'products', 'compressed', filename + '.webp');
      
      // Check if source exists
      try {
        await fs.access(sourcePath);
      } catch {
        console.log(`  ⚠️  Source not found: ${sourcePath}`);
        errors++;
        continue;
      }
      
      // Generate 400w AVIF in uploads/ root (not in products/compressed/)
      const targetDir = path.join(__dirname, '..', 'uploads');
      const avif400Path = path.join(targetDir, `${filename}-400w.avif`);
      const avifBasePath = path.join(targetDir, `${filename}.avif`);
      
      // Check if already exists
      const avif400Exists = await fs.access(avif400Path).then(() => true).catch(() => false);
      
      if (!avif400Exists) {
        // Generate 400w AVIF from WebP
        await sharp(sourcePath)
          .resize(400, null, { fit: 'inside', withoutEnlargement: true })
          .avif({ quality: 75 })
          .toFile(avif400Path);
        
        // Also generate base AVIF
        await sharp(sourcePath)
          .avif({ quality: 75 })
          .toFile(avifBasePath);
        
        generated++;
      }
      
      // Update database to point to new location (uploads/filename.webp)
      product.image = `uploads/${filename}.webp`;
      await product.save();
      
      fixed++;
      
      if (fixed % 50 === 0) {
        console.log(`  ✅ Processed ${fixed}/${oldProducts.length}...`);
      }
      
    } catch (err) {
      console.error(`  ❌ Error processing ${product.title}:`, err.message);
      errors++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✨ MIGRATION COMPLETE\n');
  console.log(`  ✅ Fixed: ${fixed} products`);
  console.log(`  🎨 Generated: ${generated} AVIF files`);
  console.log(`  ❌ Errors: ${errors}`);
  
  await mongoose.disconnect();
}

processOldProducts().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
