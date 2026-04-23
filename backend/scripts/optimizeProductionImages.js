const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  // Update this to your production path: /var/www/Gandhara/frontend/uploads
  UPLOADS_DIR: path.join(__dirname, '../../uploads'),
  // Generate responsive image sizes for mobile and desktop
  RESPONSIVE_SIZES: [
    { width: 400, suffix: '-400w' },   // Mobile portrait
    { width: 800, suffix: '-800w' },   // Mobile landscape / Tablet
    { width: 1200, suffix: '-1200w' }, // Desktop
    { width: 1600, suffix: '-1600w' }, // Large desktop / Retina
  ],
  // Original size (no suffix)
  MAX_WIDTH: 1200,
  MAX_HEIGHT: 1200,
  // Generate both AVIF (better compression) and WebP (fallback)
  FORMATS: ['avif', 'webp'],
  AVIF_QUALITY: 75,  // AVIF at 75% ≈ WebP at 80%
  WEBP_QUALITY: 80,
  BACKUP_ORIGINALS: true,
  BACKUP_DIR: path.join(__dirname, '../../uploads-backup-original'),
};

// Statistics tracking
const stats = {
  totalProcessed: 0,
  totalSkipped: 0,
  totalErrors: 0,
  originalSize: 0,
  optimizedSize: 0,
  startTime: Date.now(),
};

/**
 * Get all image files recursively from a directory
 */
async function getAllImageFiles(dir, fileList = []) {
  try {
    const files = await fs.readdir(dir, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        await getAllImageFiles(filePath, fileList);
      } else if (file.isFile()) {
        const ext = path.extname(file.name).toLowerCase();
        // Only process JPG, JPEG, PNG (skip existing WebP files)
        if (['.jpg', '.jpeg', '.png'].includes(ext)) {
          fileList.push(filePath);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return fileList;
}

/**
 * Get file size in bytes
 */
async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

/**
 * Backup original file before optimization
 */
async function backupOriginal(filePath) {
  if (!CONFIG.BACKUP_ORIGINALS) return;
  
  try {
    const relativePath = path.relative(CONFIG.UPLOADS_DIR, filePath);
    const backupPath = path.join(CONFIG.BACKUP_DIR, relativePath);
    const backupDir = path.dirname(backupPath);
    
    // Create backup directory if it doesn't exist
    await fs.mkdir(backupDir, { recursive: true });
    
    // Copy original file to backup
    await fs.copyFile(filePath, backupPath);
    console.log(`✓ Backed up: ${relativePath}`);
  } catch (error) {
    console.error(`⚠ Backup failed for ${filePath}:`, error.message);
  }
}

/**
 * Optimize a single image file to multiple responsive sizes and formats
 */
async function optimizeImage(filePath) {
  const relativePath = path.relative(CONFIG.UPLOADS_DIR, filePath);
  const ext = path.extname(filePath);
  const basePathWithoutExt = filePath.replace(ext, '');
  
  try {
    // Get original size
    const originalSize = await getFileSize(filePath);
    stats.originalSize += originalSize;
    
    // Check if any optimized versions already exist
    const avifPath = `${basePathWithoutExt}.avif`;
    const webpPath = `${basePathWithoutExt}.webp`;
    
    try {
      await fs.access(avifPath);
      await fs.access(webpPath);
      console.log(`⊘ Skipping (optimized versions exist): ${relativePath}`);
      stats.totalSkipped++;
      return;
    } catch {
      // Optimized versions don't exist, proceed
    }
    
    // Backup original file (once)
    if (CONFIG.BACKUP_ORIGINALS) {
      await backupOriginal(filePath);
    }
    
    let totalOptimizedSize = 0;
    const generatedFiles = [];
    
    // Load image once for metadata
    const image = sharp(filePath);
    const metadata = await image.metadata();
    
    // Generate responsive sizes
    for (const size of CONFIG.RESPONSIVE_SIZES) {
      // Skip if original is smaller than target size
      if (metadata.width && metadata.width < size.width) continue;
      
      for (const format of CONFIG.FORMATS) {
        const outputPath = `${basePathWithoutExt}${size.suffix}.${format}`;
        
        try {
          if (format === 'avif') {
            await sharp(filePath)
              .resize(size.width, size.width, {
                fit: 'inside',
                withoutEnlargement: true,
              })
              .avif({ quality: CONFIG.AVIF_QUALITY })
              .toFile(outputPath);
          } else if (format === 'webp') {
            await sharp(filePath)
              .resize(size.width, size.width, {
                fit: 'inside',
                withoutEnlargement: true,
              })
              .webp({ quality: CONFIG.WEBP_QUALITY })
              .toFile(outputPath);
          }
          
          const fileSize = await getFileSize(outputPath);
          totalOptimizedSize += fileSize;
          generatedFiles.push({ path: outputPath, size: fileSize });
          
        } catch (err) {
          console.error(`  ⚠ Failed to generate ${size.suffix}.${format}:`, err.message);
        }
      }
    }
    
    // Generate original size in both formats (no size suffix)
    for (const format of CONFIG.FORMATS) {
      const outputPath = `${basePathWithoutExt}.${format}`;
      
      try {
        if (format === 'avif') {
          await sharp(filePath)
            .resize(CONFIG.MAX_WIDTH, CONFIG.MAX_HEIGHT, {
              fit: 'inside',
              withoutEnlargement: true,
            })
            .avif({ quality: CONFIG.AVIF_QUALITY })
            .toFile(outputPath);
        } else if (format === 'webp') {
          await sharp(filePath)
            .resize(CONFIG.MAX_WIDTH, CONFIG.MAX_HEIGHT, {
              fit: 'inside',
              withoutEnlargement: true,
            })
            .webp({ quality: CONFIG.WEBP_QUALITY })
            .toFile(outputPath);
        }
        
        const fileSize = await getFileSize(outputPath);
        totalOptimizedSize += fileSize;
        generatedFiles.push({ path: outputPath, size: fileSize });
        
      } catch (err) {
        console.error(`  ⚠ Failed to generate .${format}:`, err.message);
      }
    }
    
    stats.optimizedSize += totalOptimizedSize;
    
    // Calculate reduction (comparing original vs all generated files)
    const avgOptimizedSize = totalOptimizedSize / generatedFiles.length;
    const reduction = ((originalSize - avgOptimizedSize) / originalSize * 100).toFixed(1);
    const originalMB = (originalSize / 1024 / 1024).toFixed(2);
    const avgOptimizedKB = (avgOptimizedSize / 1024).toFixed(0);
    
    console.log(`✓ ${relativePath}`);
    console.log(`  Generated ${generatedFiles.length} files (${CONFIG.RESPONSIVE_SIZES.length} sizes × ${CONFIG.FORMATS.length} formats)`);
    console.log(`  ${originalMB}MB → ~${avgOptimizedKB}KB avg (${reduction}% reduction)`);
    
    stats.totalProcessed++;
    
  } catch (error) {
    console.error(`✗ Error processing ${relativePath}:`, error.message);
    stats.totalErrors++;
  }
}

/**
 * Process images in batches to avoid memory issues
 */
async function processInBatches(files, batchSize = 10) {
  const batches = [];
  for (let i = 0; i < files.length; i += batchSize) {
    batches.push(files.slice(i, i + batchSize));
  }
  
  console.log(`\n📦 Processing ${files.length} images in ${batches.length} batches (${batchSize} images per batch)\n`);
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`\n🔄 Batch ${i + 1}/${batches.length} (${batch.length} images)\n`);
    
    await Promise.all(batch.map(file => optimizeImage(file)));
    
    // Progress update
    const progress = ((stats.totalProcessed + stats.totalSkipped + stats.totalErrors) / files.length * 100).toFixed(1);
    console.log(`\n📊 Progress: ${progress}% | Processed: ${stats.totalProcessed} | Skipped: ${stats.totalSkipped} | Errors: ${stats.totalErrors}\n`);
  }
}

/**
 * Format bytes to human readable size
 */
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
}

/**
 * Print final statistics
 */
function printStats() {
  const duration = ((Date.now() - stats.startTime) / 1000).toFixed(1);
  const reduction = stats.originalSize > 0 
    ? ((stats.originalSize - stats.optimizedSize) / stats.originalSize * 100).toFixed(1)
    : 0;
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 IMAGE OPTIMIZATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`✓ Successfully processed: ${stats.totalProcessed} images`);
  console.log(`⊘ Skipped (already WebP): ${stats.totalSkipped} images`);
  console.log(`✗ Failed: ${stats.totalErrors} images`);
  console.log(`⏱ Duration: ${duration} seconds`);
  console.log('');
  console.log(`📦 Original total size: ${formatBytes(stats.originalSize)}`);
  console.log(`📦 Optimized total size: ${formatBytes(stats.optimizedSize)}`);
  console.log(`💾 Space saved: ${formatBytes(stats.originalSize - stats.optimizedSize)} (${reduction}% reduction)`);
  console.log('='.repeat(60) + '\n');
}

/**
 * Main execution function
 */
async function main() {
  console.log('\n🚀 Starting Image Optimization for Production Server\n');
  console.log('Configuration:');
  console.log(`  📁 Uploads directory: ${CONFIG.UPLOADS_DIR}`);
  console.log(`  📏 Max dimensions: ${CONFIG.MAX_WIDTH}x${CONFIG.MAX_HEIGHT}px`);
  console.log(`  🎨 WebP quality: ${CONFIG.WEBP_QUALITY}%`);
  console.log(`  💾 Backup originals: ${CONFIG.BACKUP_ORIGINALS ? 'Yes' : 'No'}`);
  if (CONFIG.BACKUP_ORIGINALS) {
    console.log(`  📂 Backup directory: ${CONFIG.BACKUP_DIR}`);
  }
  console.log('');
  
  // Check if uploads directory exists
  try {
    await fs.access(CONFIG.UPLOADS_DIR);
  } catch {
    console.error(`❌ Error: Uploads directory not found: ${CONFIG.UPLOADS_DIR}`);
    console.error('Please update CONFIG.UPLOADS_DIR in the script to point to your uploads folder.');
    process.exit(1);
  }
  
  // Create backup directory if needed
  if (CONFIG.BACKUP_ORIGINALS) {
    await fs.mkdir(CONFIG.BACKUP_DIR, { recursive: true });
    console.log(`✓ Backup directory ready: ${CONFIG.BACKUP_DIR}\n`);
  }
  
  // Get all image files
  console.log('🔍 Scanning for images...\n');
  const imageFiles = await getAllImageFiles(CONFIG.UPLOADS_DIR);
  
  if (imageFiles.length === 0) {
    console.log('⚠ No JPG/PNG images found to optimize.');
    process.exit(0);
  }
  
  console.log(`✓ Found ${imageFiles.length} images to process\n`);
  
  // Confirm before starting (uncomment for production safety)
  // console.log('Press Ctrl+C to cancel, or wait 5 seconds to start...');
  // await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Process images in batches
  await processInBatches(imageFiles, 10);
  
  // Print final statistics
  printStats();
  
  console.log('✅ IUpdate frontend to use OptimizedImage component with srcset');
  console.log('2. Test responsive images on mobile and desktop');
  console.log('3. Run PageSpeed Insights to verify performance improvement\n');
  console.log('Note: Generated files include:');
  console.log('  - Multiple sizes: 400w, 800w, 1200w, 1600w');
  console.log('  - AVIF format (best compression, modern browsers)');
  console.log('  - WebP format (fallback for older browsers)');
  console.log('2. Test website to ensure images load correctly');
  console.log('3. Run PageSpeed Insights to verify performance improvement\n');
}

// Run the script
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
