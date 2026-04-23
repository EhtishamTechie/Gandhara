// Convert original product images to WebP
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ORIGINAL_DIR = path.join(__dirname, '..', 'uploads', 'products', 'original');
const BACKUP_DIR = path.join(__dirname, '..', 'uploads', 'products', 'original_backups');
const QUALITY = 85;
const BATCH_SIZE = 50; // Process 50 images at a time

// Create backup directory
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`✅ Created backup directory: ${BACKUP_DIR}`);
}

async function convertImage(inputPath, outputPath, backupPath) {
  try {
    const originalSize = fs.statSync(inputPath).size;
    
    await sharp(inputPath)
      .webp({ quality: QUALITY, effort: 6 })
      .toFile(outputPath);

    const newSize = fs.statSync(outputPath).size;
    const reduction = ((1 - newSize / originalSize) * 100).toFixed(1);

    // Backup original
    fs.copyFileSync(inputPath, backupPath);
    
    // Delete original
    fs.unlinkSync(inputPath);

    return { originalSize, convertedSize: newSize, reduction: parseFloat(reduction) };
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function convertBatch(files, startIndex) {
  const batch = files.slice(startIndex, startIndex + BATCH_SIZE);
  const results = [];

  for (const file of batch) {
    const inputPath = path.join(ORIGINAL_DIR, file);
    const fileName = path.parse(file).name;
    const outputPath = path.join(ORIGINAL_DIR, `${fileName}.webp`);
    const backupPath = path.join(BACKUP_DIR, file);

    process.stdout.write(`\r[${startIndex + results.length + 1}/${files.length}] Converting: ${file}...`);

    const result = await convertImage(inputPath, outputPath, backupPath);
    if (result) results.push(result);
  }

  console.log(''); // New line after batch
  return results;
}

async function convertAllProducts() {
  console.log('🚀 Converting Product Images to WebP\n');
  console.log(`📁 Directory: ${ORIGINAL_DIR}\n`);

  const files = fs.readdirSync(ORIGINAL_DIR)
    .filter(f => /\.(jpg|jpeg|png)$/i.test(f));

  if (files.length === 0) {
    console.log('ℹ️  No JPG/PNG images found. Already converted or none exist.');
    return;
  }

  console.log(`📋 Found ${files.length} images to convert\n`);
  console.log(`⚙️  Processing in batches of ${BATCH_SIZE}...\n`);

  const allResults = [];
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batchResults = await convertBatch(files, i);
    allResults.push(...batchResults);
    
    // Show progress
    const percent = ((i + BATCH_SIZE) / files.length * 100).toFixed(1);
    console.log(`   ✅ Batch complete (${Math.min(i + BATCH_SIZE, files.length)}/${files.length} - ${percent}%)\n`);
  }

  // Summary
  const totalOriginal = allResults.reduce((s, r) => s + r.originalSize, 0);
  const totalConverted = allResults.reduce((s, r) => s + r.convertedSize, 0);
  const totalSaved = totalOriginal - totalConverted;

  console.log('\n' + '='.repeat(50));
  console.log('📊 CONVERSION SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Images converted: ${allResults.length}`);
  console.log(`📦 Original size: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📦 Converted size: ${(totalConverted / 1024 / 1024).toFixed(2)} MB`);
  console.log(`💾 Space saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB (${((totalSaved/totalOriginal)*100).toFixed(1)}%)`);
  console.log(`🗂️  Originals backed up in: ${path.basename(BACKUP_DIR)}/`);
  console.log('='.repeat(50));
  console.log('\n✅ Conversion complete!');
}

convertAllProducts().catch(console.error);
