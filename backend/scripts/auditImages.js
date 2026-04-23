const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

mongoose.connect('mongodb://localhost:27017/gandhara').then(async () => {
  const Product = require('./models/Product');
  const products = await Product.find({}).select('image title').lean();
  let missing = 0, total = products.length;
  for (const p of products) {
    if (p.image == null) continue;
    const fp = path.resolve('/var/www/Gandhara/backend', p.image);
    const exists = fs.existsSync(fp);
    if (exists === false) {
      missing++;
      if (missing <= 10) console.log('MISSING:', p.image);
    }
  }
  console.log('Total:', total, 'Missing source files:', missing);
  
  const webpProducts = products.filter(p => p.image && p.image.endsWith('.webp'));
  let webpMissing = 0;
  webpProducts.forEach(p => {
    const fp = path.resolve('/var/www/Gandhara/backend', p.image);
    if (fs.existsSync(fp) === false) webpMissing++;
  });
  console.log('WebP in DB:', webpProducts.length, 'Missing:', webpMissing);

  const jpgProducts = products.filter(p => p.image && p.image.endsWith('.jpg'));
  let jpgMissing = 0;
  jpgProducts.forEach(p => {
    const fp = path.resolve('/var/www/Gandhara/backend', p.image);
    if (fs.existsSync(fp) === false) jpgMissing++;
  });
  console.log('JPG in DB:', jpgProducts.length, 'Missing:', jpgMissing);
  
  // Check for 800w avif availability for products with .webp image in DB
  let has800w = 0, no800w = 0;
  for (const p of products) {
    if (p.image == null) continue;
    const baseName = p.image.replace(/\.(jpg|jpeg|png|webp|avif)$/i, '');
    const avif800 = path.resolve('/var/www/Gandhara/backend', baseName + '-800w.avif');
    if (fs.existsSync(avif800)) {
      has800w++;
    } else {
      no800w++;
      if (no800w <= 5) console.log('NO 800w AVIF:', baseName);
    }
  }
  console.log('Has 800w AVIF:', has800w, 'Missing 800w AVIF:', no800w);
  
  // Check WebP 800w
  let hasWebp800 = 0, noWebp800 = 0;
  for (const p of products) {
    if (p.image == null) continue;
    const baseName = p.image.replace(/\.(jpg|jpeg|png|webp|avif)$/i, '');
    const webp800 = path.resolve('/var/www/Gandhara/backend', baseName + '-800w.webp');
    if (fs.existsSync(webp800)) {
      hasWebp800++;
    } else {
      noWebp800++;
    }
  }
  console.log('Has 800w WebP:', hasWebp800, 'Missing 800w WebP:', noWebp800);
  
  mongoose.disconnect();
});
