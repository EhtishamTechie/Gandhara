const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const CONFIG = {
  SOURCE_DIR: '/var/www/Gandhara/frontend/public/TourImages',
  RESPONSIVE_SIZES: [400, 800, 1200],
  FORMATS: ['avif', 'webp'],
  AVIF_QUALITY: 75,
  WEBP_QUALITY: 80,
  BACKUP: true,
};

async function optimizeTourImages() {
  console.log('🖼️  Optimizing Tour Images...\n');
  
  const files = await fs.readdir(CONFIG.SOURCE_DIR);
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f));
  
  console.log(`Found ${imageFiles.length} images to optimize\n`);
  
  for (const file of imageFiles) {
    const filePath = path.join(CONFIG.SOURCE_DIR, file);
    const basename = path.basename(file, path.extname(file));
    
    try {
      const stats = await fs.stat(filePath);
      const originalSize = (stats.size / 1024).toFixed(1);
      
      console.log(`📸 ${file} (${originalSize} KB)`);
      
      // Backup original
      if (CONFIG.BACKUP) {
        const backupPath = path.join(CONFIG.SOURCE_DIR, 'originals', file);
        await fs.mkdir(path.join(CONFIG.SOURCE_DIR, 'originals'), { recursive: true });
        await fs.copyFile(filePath, backupPath);
      }
      
      const image = sharp(filePath);
      const metadata = await image.metadata();
      
      let totalGenerated = 0;
      
      // Generate responsive sizes in AVIF and WebP
      for (const width of CONFIG.RESPONSIVE_SIZES) {
        for (const format of CONFIG.FORMATS) {
          const outputPath = path.join(
            CONFIG.SOURCE_DIR,
            `${basename}-${width}w.${format}`
          );
          
          const quality = format === 'avif' ? CONFIG.AVIF_QUALITY : CONFIG.WEBP_QUALITY;
          
          await sharp(filePath)
            .resize(width, null, { withoutEnlargement: true })
            [format]({ quality })
            .toFile(outputPath);
          
          const outStats = await fs.stat(outputPath);
          totalGenerated++;
          console.log(`  ✓ ${basename}-${width}w.${format} (${(outStats.size / 1024).toFixed(1)} KB)`);
        }
      }
      
      // Generate base AVIF and WebP (full size but optimized)
      for (const format of CONFIG.FORMATS) {
        const outputPath = path.join(CONFIG.SOURCE_DIR, `${basename}.${format}`);
        const quality = format === 'avif' ? CONFIG.AVIF_QUALITY : CONFIG.WEBP_QUALITY;
        
        await sharp(filePath)
          .resize(1200, null, { withoutEnlargement: true })
          [format]({ quality })
          .toFile(outputPath);
        
        const outStats = await fs.stat(outputPath);
        totalGenerated++;
        console.log(`  ✓ ${basename}.${format} (${(outStats.size / 1024).toFixed(1)} KB)`);
      }
      
      console.log(`  Generated ${totalGenerated} optimized files\n`);
      
    } catch (error) {
      console.error(`  ✗ Error processing ${file}:`, error.message);
    }
  }
  
  console.log('✅ Tour images optimization complete!');
}

optimizeTourImages().catch(console.error);
