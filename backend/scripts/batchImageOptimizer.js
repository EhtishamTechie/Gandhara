const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

class BatchImageOptimizer {
  constructor(uploadsDir) {
    this.uploadsDir = uploadsDir;
    this.supportedExtensions = ['.jpg', '.jpeg', '.png'];
    this.sizes = {
      thumbnail: { width: 150, height: 150, quality: 70 },
      small: { width: 300, height: 300, quality: 75 },
      medium: { width: 600, height: 600, quality: 80 },
      large: { width: 1200, height: 1200, quality: 85 }
    };
  }

  async getAllImages() {
    const images = [];
    const supportedExtensions = this.supportedExtensions;
    
    async function scanDirectory(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && entry.name !== 'optimized') {
          await scanDirectory(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (supportedExtensions.includes(ext)) {
            images.push(fullPath);
          }
        }
      }
    }
    
    await scanDirectory(this.uploadsDir);
    return images;
  }

  async optimizeImage(inputPath, outputPath, options) {
    const { width, height, quality } = options;
    const outputExt = path.extname(outputPath).toLowerCase();

    try {
      let pipeline = sharp(inputPath)
        .resize(width, height, { 
          fit: 'inside',
          withoutEnlargement: true 
        });

      // WebP version
      await pipeline
        .webp({ quality, effort: 4 })
        .toFile(outputPath.replace(outputExt, '.webp'));

      // JPEG version (fallback)
      await pipeline
        .jpeg({ quality, progressive: true, mozjpeg: true })
        .toFile(outputPath.replace(outputExt, '.jpg'));

      return true;
    } catch (error) {
      console.error(`Error optimizing ${inputPath}:`, error.message);
      return false;
    }
  }

  async processImage(imagePath) {
    const dir = path.dirname(imagePath);
    const name = path.parse(imagePath).name;
    const optimizedDir = path.join(dir, 'optimized');

    // Ensure optimized directory exists
    try {
      await fs.access(optimizedDir);
    } catch {
      await fs.mkdir(optimizedDir, { recursive: true });
    }

    const results = [];

    // Generate all sizes
    for (const [sizeName, options] of Object.entries(this.sizes)) {
      const outputPath = path.join(optimizedDir, `${name}_${sizeName}.jpg`);
      
      // Skip if already exists and is newer
      try {
        const [inputStat, outputStat] = await Promise.all([
          fs.stat(imagePath),
          fs.stat(outputPath)
        ]);
        
        if (outputStat.mtime >= inputStat.mtime) {
          results.push({ size: sizeName, status: 'skipped', path: outputPath });
          continue;
        }
      } catch {
        // File doesn't exist, proceed with optimization
      }

      const success = await this.optimizeImage(imagePath, outputPath, options);
      results.push({ 
        size: sizeName, 
        status: success ? 'optimized' : 'failed', 
        path: outputPath 
      });
    }

    return results;
  }

  async optimizeAll() {
    console.log('🔍 Scanning for images...');
    const images = await this.getAllImages();
    console.log(`📸 Found ${images.length} images to process`);

    let processed = 0;
    let optimized = 0;
    let skipped = 0;
    let failed = 0;

    const startTime = Date.now();

    for (const imagePath of images) {
      console.log(`\n📷 Processing: ${path.relative(this.uploadsDir, imagePath)}`);
      
      const results = await this.processImage(imagePath);
      
      for (const result of results) {
        if (result.status === 'optimized') optimized++;
        else if (result.status === 'skipped') skipped++;
        else failed++;
        
        console.log(`  ${result.size}: ${result.status}`);
      }
      
      processed++;
      
      // Progress indicator
      const progress = Math.round((processed / images.length) * 100);
      console.log(`Progress: ${progress}% (${processed}/${images.length})`);
    }

    const duration = Math.round((Date.now() - startTime) / 1000);

    console.log('\n🎉 Batch optimization complete!');
    console.log(`📊 Results:`);
    console.log(`   • Images processed: ${processed}`);
    console.log(`   • Variants optimized: ${optimized}`);
    console.log(`   • Variants skipped: ${skipped}`);
    console.log(`   • Variants failed: ${failed}`);
    console.log(`   • Time taken: ${duration} seconds`);

    // Calculate space savings
    await this.calculateSavings();
  }

  async calculateSavings() {
    try {
      console.log('\n💾 Calculating storage impact...');
      
      const originalImages = await this.getAllImages();
      let originalSize = 0;
      
      for (const imagePath of originalImages) {
        const stat = await fs.stat(imagePath);
        originalSize += stat.size;
      }

      // Calculate optimized size
      let optimizedSize = 0;
      const optimizedDir = path.join(this.uploadsDir, '**', 'optimized');
      
      async function calculateOptimizedSize(dir) {
        try {
          const entries = await fs.readdir(dir, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
              await calculateOptimizedSize(fullPath);
            } else {
              const stat = await fs.stat(fullPath);
              optimizedSize += stat.size;
            }
          }
        } catch {
          // Directory doesn't exist yet
        }
      }

      // Check all optimized subdirectories
      const scanDirs = await fs.readdir(this.uploadsDir, { withFileTypes: true });
      for (const entry of scanDirs) {
        if (entry.isDirectory()) {
          const optimizedPath = path.join(this.uploadsDir, entry.name, 'optimized');
          await calculateOptimizedSize(optimizedPath);
        }
      }

      const savings = originalSize - (optimizedSize / 4); // Approximate since we create 4 variants
      const savingsPercent = Math.round((savings / originalSize) * 100);

      console.log(`   • Original size: ${Math.round(originalSize / 1024 / 1024)} MB`);
      console.log(`   • Optimized size: ${Math.round(optimizedSize / 1024 / 1024)} MB`);
      console.log(`   • Estimated savings: ${Math.round(savings / 1024 / 1024)} MB (${savingsPercent}%)`);
      
    } catch (error) {
      console.log('   • Could not calculate savings:', error.message);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const optimizer = new BatchImageOptimizer(uploadsDir);
  
  console.log('🚀 Starting batch image optimization...');
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  
  optimizer.optimizeAll().catch(console.error);
}

module.exports = BatchImageOptimizer;