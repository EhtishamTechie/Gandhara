const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../uploads');
const SIZES = [400, 800, 1200, 1600];

async function generateAVIFForFile(filePath, fileName) {
  const baseName = fileName.replace(/\.[^.]+$/, '');
  const baseAVIF = path.join(UPLOADS_DIR, `${baseName}.avif`);
  
  // Skip if 800w AVIF exists (indicator that all sizes exist)
  const avif800 = path.join(UPLOADS_DIR, `${baseName}-800w.avif`);
  if (fs.existsSync(avif800)) {
    return { skipped: true };
  }
  
  try {
    // Generate base AVIF if it doesn't exist
    if (!fs.existsSync(baseAVIF)) {
      await sharp(filePath)
        .avif({ quality: 75 })
        .toFile(baseAVIF);
      console.log(`  ✓ Generated base: ${baseName}.avif`);
    }
    
    // Generate responsive sizes
    for (const width of SIZES) {
      const outputPath = path.join(UPLOADS_DIR, `${baseName}-${width}w.avif`);
      if (!fs.existsSync(outputPath)) {
        await sharp(filePath)
          .resize(width)
          .avif({ quality: 75 })
          .toFile(outputPath);
        console.log(`  ✓ Generated: ${baseName}-${width}w.avif`);
      }
    }
    
    return { generated: true };
  } catch (error) {
    console.error(`  ✗ Failed: ${fileName}`, error.message);
    return { error: true, message: error.message };
  }
}

async function main() {
  console.log('🎯 Generating AVIF files for bulk uploads...\n');
  
  const files = fs.readdirSync(UPLOADS_DIR);
  const bulkFiles = files.filter(f => 
    /^bulk_.*\.(jpg|jpeg|png|webp)$/i.test(f)
  );
  
  console.log(`Found ${bulkFiles.length} bulk upload files\n`);
  
  let generated = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const file of bulkFiles) {
    const filePath = path.join(UPLOADS_DIR, file);
    console.log(`Processing: ${file}`);
    
    const result = await generateAVIFForFile(filePath, file);
    
    if (result.generated) generated++;
    else if (result.skipped) skipped++;
    else if (result.error) errors++;
  }
  
  console.log('\n✅ Complete!');
  console.log(`   Generated: ${generated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors: ${errors}`);
}

main().catch(console.error);
