const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// Cache for optimized images
const imageCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

class ImageOptimizationMiddleware {
  constructor() {
    this.supportedFormats = ['jpg', 'jpeg', 'png', 'webp'];
    this.qualitySettings = {
      thumbnail: { width: 150, height: 150, quality: 70 },
      small: { width: 300, height: 300, quality: 75 },
      medium: { width: 600, height: 600, quality: 80 },
      large: { width: 1200, height: 1200, quality: 85 },
      original: { quality: 90 }
    };
  }

  // Check if browser supports WebP
  supportsWebP(req) {
    const acceptHeader = req.headers.accept || '';
    return acceptHeader.includes('image/webp');
  }

  // Generate cache key
  getCacheKey(filepath, size, format) {
    return `${filepath}_${size}_${format}`;
  }

  // Get optimized image path
  getOptimizedPath(originalPath, size, format) {
    const parsed = path.parse(originalPath);
    const dir = path.join(parsed.dir, 'optimized');
    return path.join(dir, `${parsed.name}_${size}.${format}`);
  }

  // Ensure optimized directory exists
  async ensureOptimizedDir(originalPath) {
    const optimizedDir = path.join(path.dirname(originalPath), 'optimized');
    try {
      await fs.access(optimizedDir);
    } catch {
      await fs.mkdir(optimizedDir, { recursive: true });
    }
    return optimizedDir;
  }

  // Optimize image
  async optimizeImage(inputPath, outputPath, options) {
    const { width, height, quality } = options;
    const format = path.extname(outputPath).substring(1);

    let pipeline = sharp(inputPath)
      .resize(width, height, { 
        fit: 'inside',
        withoutEnlargement: true 
      });

    // Apply format-specific optimizations
    switch (format) {
      case 'webp':
        pipeline = pipeline.webp({ quality, effort: 4 });
        break;
      case 'jpg':
      case 'jpeg':
        pipeline = pipeline.jpeg({ 
          quality, 
          progressive: true,
          mozjpeg: true 
        });
        break;
      case 'png':
        pipeline = pipeline.png({ 
          quality, 
          compressionLevel: 8,
          progressive: true 
        });
        break;
      default:
        pipeline = pipeline.jpeg({ quality, progressive: true });
    }

    await pipeline.toFile(outputPath);
    return outputPath;
  }

  // Main middleware function
  async processImage(req, res, next) {
    try {
      const requestedPath = req.path;
      const size = req.query.size || 'medium';
      const originalPath = path.join(__dirname, '..', 'uploads', requestedPath);

      // Check if file exists
      try {
        await fs.access(originalPath);
      } catch {
        return next(); // File doesn't exist, let Express handle 404
      }

      // Get file extension
      const ext = path.extname(originalPath).toLowerCase().substring(1);
      if (!this.supportedFormats.includes(ext)) {
        return next(); // Not an image, continue normally
      }

      // Determine output format (prefer WebP if supported)
      const outputFormat = this.supportsWebP(req) ? 'webp' : ext;
      const cacheKey = this.getCacheKey(originalPath, size, outputFormat);

      // Check cache
      const cached = imageCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        return res.sendFile(cached.path);
      }

      // Ensure optimized directory exists
      await this.ensureOptimizedDir(originalPath);

      // Get optimized path
      const optimizedPath = this.getOptimizedPath(originalPath, size, outputFormat);

      // Check if optimized version already exists
      let shouldOptimize = true;
      try {
        const [originalStat, optimizedStat] = await Promise.all([
          fs.stat(originalPath),
          fs.stat(optimizedPath)
        ]);
        
        // Only re-optimize if original is newer
        shouldOptimize = originalStat.mtime > optimizedStat.mtime;
      } catch {
        // Optimized version doesn't exist
        shouldOptimize = true;
      }

      if (shouldOptimize) {
        const options = this.qualitySettings[size] || this.qualitySettings.medium;
        await this.optimizeImage(originalPath, optimizedPath, options);
      }

      // Cache the result
      imageCache.set(cacheKey, {
        path: optimizedPath,
        timestamp: Date.now()
      });

      // Set caching headers
      res.set({
        'Cache-Control': 'public, max-age=31536000', // 1 year
        'ETag': `"${cacheKey}"`,
        'Content-Type': `image/${outputFormat}`,
        'Vary': 'Accept'
      });

      // Send optimized image
      res.sendFile(path.resolve(optimizedPath));

    } catch (error) {
      console.error('Image optimization error:', error);
      next(); // Fallback to original image
    }
  }

  // Clean old cache entries
  cleanCache() {
    const now = Date.now();
    for (const [key, value] of imageCache.entries()) {
      if (now - value.timestamp > CACHE_DURATION) {
        imageCache.delete(key);
      }
    }
  }
}

// Create singleton instance
const imageOptimizer = new ImageOptimizationMiddleware();

// Clean cache every hour
setInterval(() => {
  imageOptimizer.cleanCache();
}, 60 * 60 * 1000);

// Export middleware function
module.exports = (req, res, next) => {
  imageOptimizer.processImage(req, res, next);
};