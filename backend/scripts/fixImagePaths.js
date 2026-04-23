const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);
const Product = require('./models/Product');

async function fixImagePaths() {
  try {
    console.log('🔧 Fixing image paths...');
    
    const products = await Product.find({});
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const product of products) {
      if (!product.image) continue;
      
      const expectedPath = path.join(__dirname, '..', product.image);
      const uploadsDir = path.join(__dirname, '..', 'uploads');
      
      // Check if expected file exists
      if (fs.existsSync(expectedPath)) {
        console.log(`✅ File exists: ${path.basename(expectedPath)}`);
        continue;
      }
      
      console.log(`❌ Missing: ${path.basename(expectedPath)}`);
      
      // Look for timestamp files that might match this product
      const files = fs.readdirSync(uploadsDir);
      const timestampFiles = files.filter(f => f.match(/^\d{13}/));
      
      if (timestampFiles.length > 0) {
        // For now, let's revert the database to use timestamp files
        const potentialFile = timestampFiles[0]; // Use first available timestamp file
        const newPath = `uploads/${potentialFile}`;
        
        await Product.findByIdAndUpdate(product._id, {
          image: newPath
        });
        
        console.log(`🔄 Updated ${product.title} to use ${potentialFile}`);
        fixedCount++;
      } else {
        errorCount++;
      }
    }
    
    console.log(`🎉 Fixed ${fixedCount} products, ${errorCount} still have issues`);
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    mongoose.disconnect();
  }
}

fixImagePaths();
