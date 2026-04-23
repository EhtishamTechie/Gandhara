/**
 * Generate missing 800w AVIF variants for all product images.
 * Scans the uploads directory and generates 800w AVIF from whatever source exists:
 * - Original .jpg/.jpeg/.png
 * - Base .avif
 * - 400w .avif (upscale if nothing else)
 * 
 * Usage: node scripts/generateMissing800wAvif.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const UPLOADS_DIR = path.resolve(__dirname, '..', 'uploads');

async function findAndGenerate() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    console.error('Uploads directory not found:', UPLOADS_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(UPLOADS_DIR);
  
  // Find all unique base names (strip -400w, -800w suffixes and extensions)
  const baseNames = new Set();
  for (const file of files) {
    // Skip directories and non-image files
    const filePath = path.join(UPLOADS_DIR, file);
    if (fs.statSync(filePath).isDirectory()) continue;
    if (!/\.(jpg|jpeg|png|webp|avif)$/i.test(file)) continue;
    
    // Extract base name without size suffix and extension
    const baseName = file
      .replace(/-(400|800|1200)w\.(jpg|jpeg|png|webp|avif)$/i, '')
      .replace(/\.(jpg|jpeg|png|webp|avif)$/i, '');
    
    baseNames.add(baseName);
  }

  console.log(`Found ${baseNames.size} unique image base names`);
  
  let generated = 0;
  let skipped = 0;
  let failed = 0;
  let alsoGeneratedBase = 0;

  for (const baseName of baseNames) {
    const target800 = path.join(UPLOADS_DIR, `${baseName}-800w.avif`);
    
    // Skip if 800w AVIF already exists
    if (fs.existsSync(target800)) {
      skipped++;
      continue;
    }

    // Find the best source file to generate from (prefer original, then base avif, then 400w)
    const candidates = [
      `${baseName}.jpg`,
      `${baseName}.jpeg`,
      `${baseName}.png`,
      `${baseName}.webp`,
      `${baseName}.avif`,
      `${baseName}-400w.avif`,
    ];

    let sourceFile = null;
    for (const candidate of candidates) {
      const candidatePath = path.join(UPLOADS_DIR, candidate);
      if (fs.existsSync(candidatePath)) {
        sourceFile = candidatePath;
        break;
      }
    }

    if (!sourceFile) {
      console.warn(`[SKIP] No source found for: ${baseName}`);
      failed++;
      continue;
    }

    try {
      await sharp(sourceFile)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .avif({ quality: 82, effort: 4 })
        .toFile(target800);
      generated++;

      // Also generate base .avif if missing
      const baseAvif = path.join(UPLOADS_DIR, `${baseName}.avif`);
      if (!fs.existsSync(baseAvif) && !sourceFile.endsWith('.avif')) {
        try {
          await sharp(sourceFile)
            .avif({ quality: 82, effort: 4 })
            .toFile(baseAvif);
          alsoGeneratedBase++;
        } catch (e) {
          // Non-critical
        }
      }

      // Also generate 400w if missing
      const target400 = path.join(UPLOADS_DIR, `${baseName}-400w.avif`);
      if (!fs.existsSync(target400)) {
        try {
          await sharp(sourceFile)
            .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
            .avif({ quality: 80, effort: 4 })
            .toFile(target400);
        } catch (e) {
          // Non-critical
        }
      }

      if (generated % 50 === 0) {
        console.log(`Progress: ${generated} generated, ${skipped} skipped, ${failed} failed`);
      }
    } catch (err) {
      console.error(`[FAIL] ${baseName} from ${path.basename(sourceFile)}: ${err.message}`);
      failed++;
    }
  }

  console.log('\n=== Generation Complete ===');
  console.log(`Generated 800w AVIF: ${generated}`);
  console.log(`Also generated base AVIF: ${alsoGeneratedBase}`);
  console.log(`Already existed (skipped): ${skipped}`);
  console.log(`Failed / no source: ${failed}`);
  console.log(`Total base names: ${baseNames.size}`);
}

findAndGenerate().catch(console.error);
