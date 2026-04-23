const sharp = require('/var/www/Gandhara/backend/node_modules/sharp');
const fs = require('fs');
const path = require('path');

async function compress() {
  const dir = '/var/www/Gandhara/frontend/dist/TourImages';
  const files = fs.readdirSync(dir);
  let fixed = 0;
  
  function isNotSized(name) {
    if (name.indexOf('-400w.') >= 0) return false;
    if (name.indexOf('-800w.') >= 0) return false;
    if (name.indexOf('-1200w.') >= 0) return false;
    return true;
  }
  
  const baseAvifs = files.filter(function(f) { return f.endsWith('.avif') && isNotSized(f); });
  
  for (const f of baseAvifs) {
    const fp = path.join(dir, f);
    const stat = fs.statSync(fp);
    if (stat.size > 150000) {
      const baseName = f.replace('.avif', '');
      const jpgPath = path.join(dir, baseName + '.jpg');
      if (fs.existsSync(jpgPath)) {
        try {
          await sharp(jpgPath).resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }).avif({ quality: 50, effort: 6 }).toFile(fp + '.tmp');
          fs.renameSync(fp + '.tmp', fp);
          
          const f800path = path.join(dir, baseName + '-800w.avif');
          await sharp(jpgPath).resize(800, 800, { fit: 'inside', withoutEnlargement: true }).avif({ quality: 50, effort: 6 }).toFile(f800path + '.tmp');
          fs.renameSync(f800path + '.tmp', f800path);

          const f400path = path.join(dir, baseName + '-400w.avif');
          await sharp(jpgPath).resize(400, 400, { fit: 'inside', withoutEnlargement: true }).avif({ quality: 48, effort: 6 }).toFile(f400path + '.tmp');
          fs.renameSync(f400path + '.tmp', f400path);
          
          fixed++;
          const newSize = fs.statSync(fp).size;
          console.log(baseName + '.avif: ' + Math.round(stat.size/1024) + 'K -> ' + Math.round(newSize/1024) + 'K');
        } catch(e) { console.error('ERR', baseName, e.message); }
      }
    }
  }
  
  const baseWebps = files.filter(function(f) { return f.endsWith('.webp') && isNotSized(f); });
  for (const f of baseWebps) {
    const fp = path.join(dir, f);
    const stat = fs.statSync(fp);
    if (stat.size > 150000) {
      const baseName = f.replace('.webp', '');
      const jpgPath = path.join(dir, baseName + '.jpg');
      if (fs.existsSync(jpgPath)) {
        try {
          await sharp(jpgPath).resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 60 }).toFile(fp + '.tmp');
          fs.renameSync(fp + '.tmp', fp);

          const f800path = path.join(dir, baseName + '-800w.webp');
          await sharp(jpgPath).resize(800, 800, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 55 }).toFile(f800path + '.tmp');
          fs.renameSync(f800path + '.tmp', f800path);

          const f400path = path.join(dir, baseName + '-400w.webp');
          await sharp(jpgPath).resize(400, 400, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 50 }).toFile(f400path + '.tmp');
          fs.renameSync(f400path + '.tmp', f400path);
          
          console.log(baseName + '.webp: ' + Math.round(stat.size/1024) + 'K -> ' + Math.round(fs.statSync(fp).size/1024) + 'K');
        } catch(e) { console.error('ERR webp', baseName, e.message); }
      }
    }
  }
  
  console.log('Done. Compressed ' + fixed + ' AVIF image sets');
}
compress().catch(console.error);
