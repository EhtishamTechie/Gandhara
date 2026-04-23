const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const PRODUCTS_DIR = '/var/www/Gandhara/backend/uploads/products';
const ORIGINAL_DIR = path.join(PRODUCTS_DIR, 'original');
const RESPONSIVE_SIZES = [400, 800, 1200, 1600];
const AVIF_QUALITY = 75;
const WEBP_QUALITY = 80;

async function generateMissingAVIF() {
  console.log('🔍 Scanning for images without AVIF versions...\n');
  
  let processed = 0;
  let skipped = 0;
  let errors = 0;
  
  try {
    // Get all source images from original directory
    const files = await fs.readdir(ORIGINAL_DIR);
    const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
    
    console.log(`Found ${imageFiles.length} source images\n`);
    
    for (const filename of imageFiles) {
      const ext = path.extname(filename);
      const baseName = filename.replace(ext, '');
      const sourcePath = path.join(ORIGINAL_DIR, filename);
      
      // Check if base AVIF exists in root products directory
      const baseAvifPath = path.join(PRODUCTS_DIR, `${baseName}.avif`);
      
      try {
        await fs.access(baseAvifPath);
        // AVIF exists, skip
        skipped++;
        continue;
      } catch {
        // AVIF doesn't exist, generate it
      }
      
      console.log(`📸 Generating AVIF for: ${filename}`);
      
      try {
        // Get source file stats
        const stats = await fs.stat(sourcePath);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
        
        // Load image metadata
        const image = sharp(sourcePath);
        const metadata = await image.metadata();
        
        let totalSize = 0;
        let fileCount = 0;
        
        // Generate responsive AVIF sizes
        for (const width of RESPONSIVE_SIZES) {
          if (metadata.width && metadata.width < width) continue;
          
          const outputPath = path.join(PRODUCTS_DIR, `${baseName}-${width}w.avif`);
          
          await sharp(sourcePath)
            .resize(width, width, { fit: 'inside', withoutEnlargement: true })
            .avif({ quality: AVIF_QUALITY })
            .toFile(outputPath);
          
          const outStats = await fs.stat(outputPath);
          totalSize += outStats.size;
          fileCount++;
        }
        
        // Generate base AVIF (no size suffix)
        await sharp(sourcePath)
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
          .avif({ quality: AVIF_QUALITY })
          .toFile(baseAvifPath);
        
        const baseStats = await fs.stat(baseAvifPath);
        totalSize += baseStats.size;
        fileCount++;
        
        // Also generate WebP versions
        for (const width of RESPONSIVE_SIZES) {
          if (metadata.width && metadata.width < width) continue;
          
          const outputPath = path.join(PRODUCTS_DIR, `${baseName}-${width}w.webp`);
          
          try {
            await fs.access(outputPath);
            // WebP exists, skip
          } catch {
            await sharp(sourcePath)
              .resize(width, width, { fit: 'inside', withoutEnlargement: true })
              .webp({ quality: WEBP_QUALITY })
              .toFile(outputPath);
          }
        }
        
        // Generate base WebP
        const baseWebpPath = path.join(PRODUCTS_DIR, `${baseName}.webp`);
        try {
          await fs.access(baseWebpPath);
        } catch {
          await sharp(sourcePath)
            .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: WEBP_QUALITY })
            .toFile(baseWebpPath);
        }
        
        const avgSizeKB = (totalSize / fileCount / 1024).toFixed(0);
        const reduction = ((stats.size - (totalSize / fileCount)) / stats.size * 100).toFixed(1);
        
        console.log(`   ✓ ${fileCount} AVIF files generated`);
        console.log(`   ✓ ${sizeMB} MB → ~${avgSizeKB} KB avg (${reduction}% reduction)\n`);
        
        processed++;
        
      } catch (error) {
        console.error(`   ✗ Error: ${error.message}\n`);
        errors++;
      }
    }
    
    console.log('\n✅ Complete!');
    console.log(`   Generated: ${processed}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Errors: ${errors}`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

generateMissingAVIF();
