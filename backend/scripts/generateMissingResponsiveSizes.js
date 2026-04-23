const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const CONFIG = {
  UPLOADS_DIR: '/var/www/Gandhara/backend/uploads',
  SIZES: [
    { width: 800, suffix: '-800w' },
    { width: 1200, suffix: '-1200w' },
    { width: 1600, suffix: '-1600w' },
  ],
  FORMATS: ['avif', 'webp'],
  AVIF_QUALITY: 75,
  WEBP_QUALITY: 80,
  BATCH_SIZE: 20, // Process in batches to avoid memory issues
};

const stats = {
  checked: 0,
  generated: 0,
  skipped: 0,
  errors: 0,
  totalSize: 0,
};

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function generateMissingSizes(baseFile) {
  const ext = path.extname(baseFile);
  const baseName = baseFile.replace(ext, '');
  const baseFilePath = path.join(CONFIG.UPLOADS_DIR, baseFile);
  
  // Check if this is already a sized/optimized file
  if (/-\d+w\.(avif|webp)$/i.test(baseFile)) {
    return; // Skip already processed files
  }
  
  stats.checked++;
  
  try {
    // Get image metadata
    const image = sharp(baseFilePath);
    const metadata = await image.metadata();
    const originalWidth = metadata.width;
    
    let generatedCount = 0;
    
    // Generate each missing size
    for (const size of CONFIG.SIZES) {
      // Skip if original is smaller than target
      if (originalWidth < size.width) {
        continue;
      }
      
      for (const format of CONFIG.FORMATS) {
        const outputPath = path.join(CONFIG.UPLOADS_DIR, `${baseName}${size.suffix}.${format}`);
        
        // Check if file already exists
        if (await fileExists(outputPath)) {
          continue; // Skip existing files
        }
        
        try {
          const quality = format === 'avif' ? CONFIG.AVIF_QUALITY : CONFIG.WEBP_QUALITY;
          
          await sharp(baseFilePath)
            .resize(size.width, null, {
              fit: 'inside',
              withoutEnlargement: true,
            })
            [format]({ quality })
            .toFile(outputPath);
          
          const fileSize = (await fs.stat(outputPath)).size;
          stats.totalSize += fileSize;
          generatedCount++;
          
        } catch (err) {
          console.error(`  ❌ Failed ${baseName}${size.suffix}.${format}:`, err.message);
          stats.errors++;
        }
      }
    }
    
    if (generatedCount > 0) {
      stats.generated += generatedCount;
      console.log(`  ✅ ${baseName}: generated ${generatedCount} files`);
    } else {
      stats.skipped++;
    }
    
    // Show progress every 50 files
    if (stats.checked % 50 === 0) {
      console.log(`\n📊 Progress: ${stats.checked} checked, ${stats.generated} generated, ${stats.skipped} skipped`);
    }
    
  } catch (err) {
    stats.errors++;
    console.error(`  ❌ Error processing ${baseFile}:`, err.message);
  }
}

async function processBatch(files) {
  const promises = files.map(file => generateMissingSizes(file));
  await Promise.all(promises);
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   GENERATE MISSING RESPONSIVE SIZES (800w, 1200w, 1600w)  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  const startTime = Date.now();
  
  try {
    // Get all original images (PNG, JPG, JPEG)
    const allFiles = await fs.readdir(CONFIG.UPLOADS_DIR);
    const sourceFiles = allFiles.filter(f => 
      /\.(png|jpg|jpeg)$/i.test(f) && 
      !/-\d+w\./i.test(f) // Exclude already sized files
    );
    
    console.log(`Found ${sourceFiles.length} source images\n`);
    console.log('Checking for missing responsive sizes...\n');
    
    // Process in batches to avoid memory issues
    for (let i = 0; i < sourceFiles.length; i += CONFIG.BATCH_SIZE) {
      const batch = sourceFiles.slice(i, i + CONFIG.BATCH_SIZE);
      await processBatch(batch);
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    const sizeMB = (stats.totalSize / 1024 / 1024).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 GENERATION COMPLETE!');
    console.log('='.repeat(60));
    console.log(`\n📊 SUMMARY:`);
    console.log(`  ✅ Files Checked: ${stats.checked}`);
    console.log(`  🆕 Files Generated: ${stats.generated}`);
    console.log(`  ⏭️  Already Existed: ${stats.skipped}`);
    console.log(`  ❌ Errors: ${stats.errors}`);
    console.log(`  💾 Total Size: ${sizeMB} MB`);
    console.log(`  ⏱️  Time: ${duration} minutes`);
    
    // Verify counts
    console.log('\n📈 VERIFICATION:');
    const files400 = allFiles.filter(f => /-400w\.avif$/i.test(f)).length;
    const files800 = allFiles.filter(f => /-800w\.avif$/i.test(f)).length;
    const files1200 = allFiles.filter(f => /-1200w\.avif$/i.test(f)).length;
    const files1600 = allFiles.filter(f => /-1600w\.avif$/i.test(f)).length;
    
    console.log(`  400w AVIF: ${files400}`);
    console.log(`  800w AVIF: ${files800} (was 211)`);
    console.log(`  1200w AVIF: ${files1200} (was 45)`);
    console.log(`  1600w AVIF: ${files1600} (was 28)`);
    
    console.log('\n✨ All responsive sizes generated! 🚀\n');
    
  } catch (err) {
    console.error('\n❌ Fatal error:', err);
    process.exit(1);
  }
}

main().catch(console.error);
