const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const dir = '/var/www/Gandhara/backend/uploads';

(async () => {
  const files = (await fs.readdir(dir)).filter(f => /pattern.*\.(jpg|png|webp)$/i.test(f) && !/-\d+w\./i.test(f));
  console.log('Found', files.length, 'pattern files to optimize');
  
  let count = 0;
  for (const file of files) {
    const fp = path.join(dir, file);
    const bn = path.basename(file, path.extname(file));
    
    try {
      for (const w of [400, 800]) {
        await sharp(fp).resize(w, null, {withoutEnlargement: true}).avif({quality: 75}).toFile(path.join(dir, bn + '-' + w + 'w.avif'));
        await sharp(fp).resize(w, null, {withoutEnlargement: true}).webp({quality: 80}).toFile(path.join(dir, bn + '-' + w + 'w.webp'));
      }
      
      await sharp(fp).resize(1200, null, {withoutEnlargement: true}).avif({quality: 75}).toFile(path.join(dir, bn + '.avif'));
      await sharp(fp).resize(1200, null, {withoutEnlargement: true}).webp({quality: 80}).toFile(path.join(dir, bn + '.webp'));
      
      count++;
      console.log('Optimized:', bn);
    } catch (e) {
      console.error('Error:', file, e.message);
    }
  }
  
  console.log('Complete! Optimized', count, 'patterns');
})().catch(console.error);
