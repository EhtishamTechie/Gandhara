const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SIZES = [
  { suffix: '-400w', width: 400, quality: 80 },
  { suffix: '-800w', width: 800, quality: 82 },
];

/**
 * Auto-generate optimized AVIF variants after product image upload.
 * Generates base, 400w, and 800w in AVIF format only.
 * Runs in background (fire-and-forget) so it doesn't block the upload response.
 */
async function generateImageVariants(imagePath) {
  try {
    // imagePath is like "uploads/1234-product-name.jpg"
    const fullPath = path.resolve(__dirname, '..', imagePath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`[ImageProcessor] Source not found: ${fullPath}`);
      return;
    }

    const dir = path.dirname(fullPath);
    const ext = path.extname(fullPath);
    const baseName = path.basename(fullPath, ext);

    let generated = 0;

    for (const size of SIZES) {
      // AVIF variant only (no WebP needed — frontend uses AVIF exclusively)
      const avifOut = path.join(dir, `${baseName}${size.suffix}.avif`);
      if (!fs.existsSync(avifOut)) {
        try {
          await sharp(fullPath)
            .resize(size.width, size.width, { fit: 'inside', withoutEnlargement: true })
            .avif({ quality: size.quality, effort: 4 })
            .toFile(avifOut);
          generated++;
        } catch (e) {
          console.error(`[ImageProcessor] AVIF ${size.suffix} failed for ${baseName}: ${e.message}`);
        }
      }
    }

    // Also generate base AVIF (no resize, just format conversion)
    const baseAvif = path.join(dir, `${baseName}.avif`);
    if (!fs.existsSync(baseAvif)) {
      try {
        await sharp(fullPath)
          .avif({ quality: 82, effort: 4 })
          .toFile(baseAvif);
        generated++;
      } catch (e) {
        console.error(`[ImageProcessor] Base AVIF failed for ${baseName}: ${e.message}`);
      }
    }

    if (generated > 0) {
      console.log(`[ImageProcessor] Generated ${generated} variants for ${baseName}`);
    }
  } catch (err) {
    console.error(`[ImageProcessor] Error processing ${imagePath}:`, err.message);
  }
}

module.exports = { generateImageVariants };
