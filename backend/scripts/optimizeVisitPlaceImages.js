const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const UPLOADS_DIR = '/var/www/Gandhara/backend/uploads';
const RESPONSIVE_SIZES = [
  { width: 400, suffix: '-400w' },
  { width: 800, suffix: '-800w' },
  { width: 1200, suffix: '-1200w' }
];
const MAX_WIDTH = 1200;
const AVIF_QUALITY = 75;
const WEBP_QUALITY = 80;

async function optimizeVisitPlaceImages() {
  try {
    console.log('🎯 Optimizing Visit Place Images...\n');
    
    // Get all JPG/JPEG files in uploads directory (not in subdirectories)
    const files = await fs.readdir(UPLOADS_DIR);
    const imageFiles = files.filter(f => 
      /\.(jpg|jpeg|png)$/i.test(f) && 
      /^175[23]\d+\.(jpg|jpeg|png)$/i.test(f) // Match the timestamp pattern
    );
    
    console.log(`Found ${imageFiles.length} visit place images to optimize\n`);
    
    let processed = 0;
    let skipped = 0;
    
    for (const filename of imageFiles) {
      const filePath = path.join(UPLOADS_DIR, filename);
      const ext = path.extname(filename);
      const baseName = filename.replace(ext, '');
      const basePathWithoutExt = path.join(UPLOADS_DIR, baseName);
      
      // Check if AVIF already exists
      const avifPath = `${basePathWithoutExt}.avif`;
      try {
        await fs.access(avifPath);
        console.log(`⊘ Skipping ${filename} (AVIF exists)`);
        skipped++;
        continue;
      } catch {
        // AVIF doesn't exist, proceed with optimization
      }
      
      console.log(`\n📸 Optimizing: ${filename}`);
      
      // Get original file size
      const stats = await fs.stat(filePath);
      const originalSizeMB = (stats.size / 1024 / 1024).toFixed(2);
      console.log(`   Original size: ${originalSizeMB} MB`);
      
      // Load image metadata
      const image = sharp(filePath);
      const metadata = await image.metadata();
      
      let totalOptimized = 0;
      let fileCount = 0;
      
      // Generate responsive sizes
      for (const size of RESPONSIVE_SIZES) {
        if (metadata.width && metadata.width < size.width) continue;
        
        // AVIF
        const avifOutputPath = `${basePathWithoutExt}${size.suffix}.avif`;
        await sharp(filePath)
          .resize(size.width, size.width, { fit: 'inside', withoutEnlargement: true })
          .avif({ quality: AVIF_QUALITY })
          .toFile(avifOutputPath);
        
        const avifStats = await fs.stat(avifOutputPath);
        totalOptimized += avifStats.size;
        fileCount++;
        
        // WebP
        const webpOutputPath = `${basePathWithoutExt}${size.suffix}.webp`;
        await sharp(filePath)
          .resize(size.width, size.width, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: WEBP_QUALITY })
          .toFile(webpOutputPath);
        
        const webpStats = await fs.stat(webpOutputPath);
        totalOptimized += webpStats.size;
        fileCount++;
      }
      
      // Generate base size (no suffix)
      const baseAvifPath = `${basePathWithoutExt}.avif`;
      await sharp(filePath)
        .resize(MAX_WIDTH, MAX_WIDTH, { fit: 'inside', withoutEnlargement: true })
        .avif({ quality: AVIF_QUALITY })
        .toFile(baseAvifPath);
      
      const baseAvifStats = await fs.stat(baseAvifPath);
      totalOptimized += baseAvifStats.size;
      fileCount++;
      
      const baseWebpPath = `${basePathWithoutExt}.webp`;
      await sharp(filePath)
        .resize(MAX_WIDTH, MAX_WIDTH, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(baseWebpPath);
      
      const baseWebpStats = await fs.stat(baseWebpPath);
      totalOptimized += baseWebpStats.size;
      fileCount++;
      
      const avgOptimizedKB = (totalOptimized / fileCount / 1024).toFixed(0);
      const reduction = ((stats.size - (totalOptimized / fileCount)) / stats.size * 100).toFixed(1);
      
      console.log(`   ✓ Generated ${fileCount} files`);
      console.log(`   ✓ ${originalSizeMB} MB → ~${avgOptimizedKB} KB avg (${reduction}% reduction)`);
      
      processed++;
    }
    
    console.log(`\n✅ Complete!`);
    console.log(`   Processed: ${processed}`);
    console.log(`   Skipped: ${skipped}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

optimizeVisitPlaceImages();
