// Create this file: backend/scripts/optimizeImagesForSEO.js
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp'); // We'll install this
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

const Product = require('../models/Product');

// Function to generate SEO-friendly filename
function generateSEOFilename(title, categories, productId) {
  // Clean title for filename
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  
  // Get primary category
  const primaryCategory = categories[0] ? categories[0].toLowerCase().replace(/\s+/g, '-') : 'stone-craft';
  
  return `${primaryCategory}-${cleanTitle}-${productId}`;
}

// Function to add metadata to images
async function addImageMetadata(imagePath, metadata) {
  try {
    const buffer = fs.readFileSync(imagePath);
    
    await sharp(buffer)
      .jpeg({
        quality: 85,
        progressive: true,
        mozjpeg: true
      })
      .withMetadata({
        exif: {
          0: {
            270: metadata.description, // ImageDescription
            315: 'Gandhara Arts & Taxila Stone Crafts', // Artist
            33432: metadata.copyright || '© Gandhara Arts & Taxila Stone Crafts' // Copyright
          }
        }
      })
      .toFile(imagePath + '_optimized.jpg');
    
    // Replace original with optimized
    fs.renameSync(imagePath + '_optimized.jpg', imagePath);
    
    console.log(`✅ Optimized: ${path.basename(imagePath)}`);
  } catch (error) {
    console.error(`❌ Failed to optimize ${imagePath}:`, error.message);
  }
}

// Main function to optimize all product images
async function optimizeAllImages() {
  try {
    console.log('🚀 Starting image SEO optimization...');
    
    const products = await Product.find({});
    let processedCount = 0;
    
    for (const product of products) {
      if (!product.image) continue;
      
      const currentPath = path.join(__dirname, '..', product.image);
      
      // Check if image exists
      if (!fs.existsSync(currentPath)) {
        console.log(`⚠️ Image not found: ${currentPath}`);
        continue;
      }
      
      // Generate SEO-friendly filename
      const seoFilename = generateSEOFilename(product.title, product.categories, product._id);
      const fileExtension = path.extname(product.image);
      const newFilename = seoFilename + fileExtension;
      const newPath = path.join(path.dirname(currentPath), newFilename);
      
      try {
        // Only rename if different
        if (currentPath !== newPath) {
          fs.renameSync(currentPath, newPath);
          console.log(`📝 Renamed: ${path.basename(currentPath)} → ${newFilename}`);
          
          // Update database with new path
          const newImagePath = product.image.replace(path.basename(product.image), newFilename);
          await Product.findByIdAndUpdate(product._id, {
            image: newImagePath,
            // Add SEO fields if they don't exist
            imageAlt: product.imageAlt || `${product.title} - Authentic Pakistani stone craft from Taxila heritage region`,
            seoTitle: product.seoTitle || `Handmade Stone ${product.title} Pakistan | Gandhara Arts`
          });
        }
        
        // Add metadata to image
        const metadata = {
          description: product.seoDescription || product.description,
          title: product.title,
          keywords: product.keywords ? product.keywords.join(', ') : '',
          copyright: '© Gandhara Arts & Taxila Stone Crafts'
        };
        
        await addImageMetadata(newPath, metadata);
        processedCount++;
        
      } catch (error) {
        console.error(`❌ Error processing ${product.title}:`, error.message);
      }
    }
    
    console.log(`🎉 Successfully processed ${processedCount} images`);
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    mongoose.disconnect();
  }
}

// Run the script
if (require.main === module) {
  optimizeAllImages();
}

module.exports = { optimizeAllImages, generateSEOFilename };

