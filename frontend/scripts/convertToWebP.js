// Script to convert PNG and JPG images to WebP format for better performance
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const IMAGE_DIR = path.join(__dirname, '..', 'public', 'GandharaImages');
const QUALITY = 85; // WebP quality (0-100)
const BACKUP_DIR = path.join(IMAGE_DIR, 'original_backups');

// Supported input formats
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png'];

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`✅ Created backup directory: ${BACKUP_DIR}`);
}

/**
 * Convert a single image to WebP format
 */
async function convertToWebP(inputPath, outputPath, backupPath) {
  try {
    // Read image metadata
    const metadata = await sharp(inputPath).metadata();
    console.log(`\n📸 Processing: ${path.basename(inputPath)}`);
    console.log(`   Original format: ${metadata.format}, size: ${(metadata.size / 1024).toFixed(2)} KB`);

    // Convert to WebP
    await sharp(inputPath)
      .webp({ quality: QUALITY, effort: 6 })
      .toFile(outputPath);

    // Get converted file size
    const stats = fs.statSync(outputPath);
    const originalStats = fs.statSync(inputPath);
    const reduction = ((1 - stats.size / originalStats.size) * 100).toFixed(2);

    console.log(`   ✅ Converted to WebP: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   📉 Size reduction: ${reduction}%`);

    // Backup original file
    fs.copyFileSync(inputPath, backupPath);
    console.log(`   💾 Backed up original to: ${path.basename(backupPath)}`);

    // Delete original file
    fs.unlinkSync(inputPath);
    console.log(`   🗑️  Deleted original file`);

    return {
      original: path.basename(inputPath),
      converted: path.basename(outputPath),
      originalSize: originalStats.size,
      convertedSize: stats.size,
      reduction: parseFloat(reduction)
    };
  } catch (error) {
    console.error(`   ❌ Error converting ${path.basename(inputPath)}:`, error.message);
    return null;
  }
}

/**
 * Main conversion function
 */
async function convertAllImages() {
  console.log('🚀 Starting image conversion to WebP format...\n');

  // Get all files in the directory
  const files = fs.readdirSync(IMAGE_DIR);
  
  // Filter for supported image formats
  const imagesToConvert = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return SUPPORTED_FORMATS.includes(ext);
  });

  if (imagesToConvert.length === 0) {
    console.log('✅ No images to convert! All images are already in WebP format.');
    return;
  }

  console.log(`📊 Found ${imagesToConvert.length} images to convert:\n`);
  imagesToConvert.forEach(file => console.log(`   - ${file}`));
  console.log('');

  const results = [];
  let totalOriginalSize = 0;
  let totalConvertedSize = 0;

  // Convert each image
  for (const file of imagesToConvert) {
    const inputPath = path.join(IMAGE_DIR, file);
    const nameWithoutExt = path.parse(file).name;
    const outputPath = path.join(IMAGE_DIR, `${nameWithoutExt}.webp`);
    const backupPath = path.join(BACKUP_DIR, file);

    const result = await convertToWebP(inputPath, outputPath, backupPath);
    
    if (result) {
      results.push(result);
      totalOriginalSize += result.originalSize;
      totalConvertedSize += result.convertedSize;
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 CONVERSION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully converted: ${results.length} images`);
  console.log(`📦 Total original size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📦 Total converted size: ${(totalConvertedSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📉 Total space saved: ${((totalOriginalSize - totalConvertedSize) / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📉 Average reduction: ${((1 - totalConvertedSize / totalOriginalSize) * 100).toFixed(2)}%`);
  console.log('='.repeat(60));
  console.log(`\n💾 Original files backed up to: ${BACKUP_DIR}`);
  console.log('✅ Conversion complete!');
}

// Run the conversion
convertAllImages().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
