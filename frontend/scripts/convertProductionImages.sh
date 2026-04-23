#!/bin/bash
# Script to convert production images to WebP on server 147.93.108.205
# Usage: bash convertProductionImages.sh

SERVER="147.93.108.205"
PROJECT_PATH="/var/www/gandhara/frontend"  # Adjust this path based on your actual deployment location

echo "🚀 Production Image Optimization Script"
echo "========================================"
echo ""
echo "This script will:"
echo "1. SSH into production server ($SERVER)"
echo "2. Install Sharp if needed"
echo "3. Create backup of original images"
echo "4. Convert all PNG/JPG to WebP format"
echo "5. Update file references if needed"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."

# Create the conversion script that will run on the server
cat > /tmp/convert-images-remote.js << 'EOFSCRIPT'
// Production Image Conversion Script
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration - adjust paths for production
const IMAGE_DIR = path.join(__dirname, 'public', 'GandharaImages');
const QUALITY = 85;
const BACKUP_DIR = path.join(IMAGE_DIR, 'original_backups');
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png'];

// Create backup directory
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`✅ Created backup directory: ${BACKUP_DIR}`);
}

async function convertToWebP(inputPath, outputPath, backupPath) {
  try {
    const metadata = await sharp(inputPath).metadata();
    console.log(`\n📸 Processing: ${path.basename(inputPath)}`);
    console.log(`   Original: ${metadata.format}, ${(metadata.size / 1024).toFixed(2)} KB`);

    await sharp(inputPath)
      .webp({ quality: QUALITY, effort: 6 })
      .toFile(outputPath);

    const stats = fs.statSync(outputPath);
    const originalStats = fs.statSync(inputPath);
    const reduction = ((1 - stats.size / originalStats.size) * 100).toFixed(2);

    console.log(`   ✅ WebP: ${(stats.size / 1024).toFixed(2)} KB (${reduction}% smaller)`);

    // Backup original
    fs.copyFileSync(inputPath, backupPath);
    console.log(`   💾 Backed up original`);

    // Delete original
    fs.unlinkSync(inputPath);

    return {
      original: path.basename(inputPath),
      converted: path.basename(outputPath),
      originalSize: originalStats.size,
      convertedSize: stats.size,
      reduction: parseFloat(reduction)
    };
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function convertAllImages() {
  console.log('🚀 Starting Production Image Conversion...\n');
  console.log(`📁 Image directory: ${IMAGE_DIR}\n`);

  const files = fs.readdirSync(IMAGE_DIR);
  const imagesToConvert = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return SUPPORTED_FORMATS.includes(ext);
  });

  if (imagesToConvert.length === 0) {
    console.log('ℹ️  No PNG/JPG images found to convert. All may already be WebP!');
    return;
  }

  console.log(`📋 Found ${imagesToConvert.length} images to convert:\n`);

  const results = [];
  for (const file of imagesToConvert) {
    const inputPath = path.join(IMAGE_DIR, file);
    const fileName = path.parse(file).name;
    const outputPath = path.join(IMAGE_DIR, `${fileName}.webp`);
    const backupPath = path.join(BACKUP_DIR, file);

    const result = await convertToWebP(inputPath, outputPath, backupPath);
    if (result) results.push(result);
  }

  // Summary
  console.log('\n\n📊 CONVERSION SUMMARY');
  console.log('=====================');
  console.log(`Total images processed: ${results.length}`);
  
  const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalConverted = results.reduce((sum, r) => sum + r.convertedSize, 0);
  const totalSaved = totalOriginal - totalConverted;
  const avgReduction = ((totalSaved / totalOriginal) * 100).toFixed(2);

  console.log(`Original size: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Converted size: ${(totalConverted / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Space saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB (${avgReduction}%)`);
  console.log('\n✅ All images successfully converted to WebP format!');
  console.log(`💾 Original files backed up in: ${BACKUP_DIR}`);
}

convertAllImages().catch(console.error);
EOFSCRIPT

# Upload and run the script on production server
echo ""
echo "📤 Uploading conversion script to production server..."

# Copy the script to production
scp /tmp/convert-images-remote.js root@$SERVER:/tmp/

echo ""
echo "🔧 Running conversion on production server..."
echo ""

# SSH into server and run the conversion
ssh root@$SERVER << 'ENDSSH'
cd /var/www/gandhara/frontend

# Check if Sharp is installed
echo "📦 Checking Sharp installation..."
if ! npm list sharp &> /dev/null; then
    echo "📥 Installing Sharp..."
    npm install sharp --save-dev
else
    echo "✅ Sharp already installed"
fi

# Run the conversion script
echo ""
echo "🎨 Converting images..."
node /tmp/convert-images-remote.js

echo ""
echo "🔄 Restarting application..."
pm2 restart gandhara-frontend || systemctl restart nginx

echo ""
echo "✅ Production image optimization complete!"
ENDSSH

# Cleanup
rm /tmp/convert-images-remote.js

echo ""
echo "================================================"
echo "✅ Production images optimized successfully!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Test your production website"
echo "2. Check image loading performance"
echo "3. Verify all images display correctly"
echo ""
