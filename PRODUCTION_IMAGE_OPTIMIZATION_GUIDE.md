# 🖼️ Production Image Optimization Guide

## Quick Reference: SSH into Production Server

**Production Server:** `147.93.108.205`

```bash
ssh root@147.93.108.205
```

---

## Option 1: Automated Script (Recommended)

### Run from Local Machine:

```bash
cd frontend/scripts
bash convertProductionImages.sh
```

This will:
1. ✅ SSH into production server
2. ✅ Install Sharp if needed
3. ✅ Create backups of originals
4. ✅ Convert all PNG/JPG → WebP
5. ✅ Restart services

---

## Option 2: Manual Steps on Production Server

### Step 1: SSH into Production

```bash
ssh root@147.93.108.205
```

### Step 2: Navigate to Project

```bash
cd /var/www/gandhara/frontend  # Adjust path as needed
```

### Step 3: Check Current Image Sizes

```bash
cd public/GandharaImages
ls -lh *.png *.jpg 2>/dev/null | awk '{print $5 "\t" $9}'
```

### Step 4: Install Sharp (if not installed)

```bash
cd /var/www/gandhara/frontend
npm install sharp --save-dev
```

### Step 5: Create Conversion Script

```bash
cat > /tmp/convert-prod-images.js << 'EOF'
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IMAGE_DIR = '/var/www/gandhara/frontend/public/GandharaImages';  // ADJUST THIS PATH
const QUALITY = 85;
const BACKUP_DIR = path.join(IMAGE_DIR, 'original_backups');

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

async function convertToWebP(inputPath, outputPath, backupPath) {
  try {
    const metadata = await sharp(inputPath).metadata();
    console.log(`\n📸 ${path.basename(inputPath)}: ${(fs.statSync(inputPath).size / 1024).toFixed(2)} KB`);

    await sharp(inputPath).webp({ quality: QUALITY, effort: 6 }).toFile(outputPath);

    const originalSize = fs.statSync(inputPath).size;
    const newSize = fs.statSync(outputPath).size;
    const reduction = ((1 - newSize / originalSize) * 100).toFixed(2);

    console.log(`   ✅ WebP: ${(newSize / 1024).toFixed(2)} KB (${reduction}% smaller)`);

    fs.copyFileSync(inputPath, backupPath);
    fs.unlinkSync(inputPath);

    return { originalSize, convertedSize: newSize, reduction: parseFloat(reduction) };
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function convertAllImages() {
  console.log('🚀 Converting Production Images to WebP...\n');

  const files = fs.readdirSync(IMAGE_DIR);
  const imagesToConvert = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f));

  if (imagesToConvert.length === 0) {
    console.log('ℹ️  No images to convert (already WebP or none found)');
    return;
  }

  console.log(`📋 Found ${imagesToConvert.length} images\n`);

  const results = [];
  for (const file of imagesToConvert) {
    const inputPath = path.join(IMAGE_DIR, file);
    const fileName = path.parse(file).name;
    const outputPath = path.join(IMAGE_DIR, `${fileName}.webp`);
    const backupPath = path.join(BACKUP_DIR, file);

    const result = await convertToWebP(inputPath, outputPath, backupPath);
    if (result) results.push(result);
  }

  const totalOriginal = results.reduce((s, r) => s + r.originalSize, 0);
  const totalConverted = results.reduce((s, r) => s + r.convertedSize, 0);
  const totalSaved = totalOriginal - totalConverted;

  console.log('\n\n📊 SUMMARY');
  console.log('==========');
  console.log(`Images: ${results.length}`);
  console.log(`Original: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Converted: ${(totalConverted / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB (${((totalSaved/totalOriginal)*100).toFixed(2)}%)`);
  console.log('\n✅ Done! Originals backed up in: original_backups/');
}

convertAllImages().catch(console.error);
EOF
```

### Step 6: Run Conversion

```bash
node /tmp/convert-prod-images.js
```

### Step 7: Verify Results

```bash
cd /var/www/gandhara/frontend/public/GandharaImages
ls -lh *.webp | awk '{print $5 "\t" $9}'

# Check backups
ls -lh original_backups/
```

### Step 8: Restart Application

```bash
# If using PM2:
pm2 restart gandhara-frontend

# If using systemd:
systemctl restart nginx
```

---

## Option 3: PowerShell Script (Run from Windows)

Save as `Optimize-ProductionImages.ps1`:

```powershell
$SERVER = "root@147.93.108.205"
$PROJECT_PATH = "/var/www/gandhara/frontend"

Write-Host "🚀 Production Image Optimization" -ForegroundColor Green
Write-Host ""

# Create conversion script
$conversionScript = @'
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const IMAGE_DIR = '/var/www/gandhara/frontend/public/GandharaImages';
const QUALITY = 85;
const BACKUP_DIR = path.join(IMAGE_DIR, 'original_backups');

if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

async function convert(input, output, backup) {
  try {
    const origSize = fs.statSync(input).size;
    await sharp(input).webp({ quality: QUALITY }).toFile(output);
    const newSize = fs.statSync(output).size;
    fs.copyFileSync(input, backup);
    fs.unlinkSync(input);
    return { origSize, newSize };
  } catch (e) {
    console.error(e.message);
    return null;
  }
}

async function main() {
  const files = fs.readdirSync(IMAGE_DIR).filter(f => /\.(jpg|jpeg|png)$/i.test(f));
  console.log(`Converting ${files.length} images...`);
  
  const results = [];
  for (const file of files) {
    const input = path.join(IMAGE_DIR, file);
    const output = path.join(IMAGE_DIR, path.parse(file).name + '.webp');
    const backup = path.join(BACKUP_DIR, file);
    const result = await convert(input, output, backup);
    if (result) results.push(result);
  }
  
  const saved = results.reduce((s, r) => s + (r.origSize - r.newSize), 0);
  console.log(`Saved ${(saved/1024/1024).toFixed(2)} MB`);
}

main().catch(console.error);
'@

# Save script locally
$conversionScript | Out-File -FilePath "convert-temp.js" -Encoding UTF8

# Upload to server
Write-Host "📤 Uploading script..." -ForegroundColor Yellow
scp convert-temp.js ${SERVER}:/tmp/convert-prod.js

# Run on server
Write-Host "🔧 Converting images on production..." -ForegroundColor Yellow
ssh $SERVER @"
cd $PROJECT_PATH
npm install sharp --save-dev 2>/dev/null
node /tmp/convert-prod.js
pm2 restart gandhara-frontend 2>/dev/null || systemctl restart nginx
rm /tmp/convert-prod.js
"@

# Cleanup
Remove-Item convert-temp.js

Write-Host ""
Write-Host "✅ Production images optimized!" -ForegroundColor Green
```

Run:
```powershell
powershell -ExecutionPolicy Bypass -File Optimize-ProductionImages.ps1
```

---

## Verification Commands

### Check Image Sizes After Conversion

```bash
ssh root@147.93.108.205 "ls -lh /var/www/gandhara/frontend/public/GandharaImages/*.webp"
```

### Compare Before/After

```bash
ssh root@147.93.108.205 "du -sh /var/www/gandhara/frontend/public/GandharaImages"
```

### Test Website Loading

```bash
curl -s -o /dev/null -w "Time: %{time_total}s\n" http://147.93.108.205
```

---

## Troubleshooting

### Issue: Sharp Installation Fails

```bash
# Try with legacy peer deps
npm install sharp --save-dev --legacy-peer-deps

# Or use specific version
npm install sharp@0.34.3 --save-dev
```

### Issue: Permission Denied

```bash
# Fix permissions
chmod 755 /var/www/gandhara/frontend/public/GandharaImages
chown -R www-data:www-data /var/www/gandhara/frontend/public/GandharaImages
```

### Issue: Node Version Too Old

```bash
# Check Node version
node --version

# Update if needed (example for Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
```

---

## Expected Results

**Before Optimization:**
- PNG/JPG images: ~10-50 MB total
- Load time: 3-5 seconds
- Bandwidth: High

**After Optimization:**
- WebP images: ~2-10 MB total (60-80% reduction)
- Load time: 1-2 seconds
- Bandwidth: 60-80% lower

---

## Next Steps After Optimization

1. ✅ Test website thoroughly
2. ✅ Monitor loading performance
3. ✅ Check browser console for 404s
4. ✅ Verify all images display correctly
5. ✅ Run Lighthouse audit
6. ✅ Update DNS/CDN if using one

---

## Rollback (If Needed)

```bash
ssh root@147.93.108.205
cd /var/www/gandhara/frontend/public/GandharaImages

# Remove WebP files
rm *.webp

# Restore originals
cp original_backups/* .

# Restart
pm2 restart gandhara-frontend
```
