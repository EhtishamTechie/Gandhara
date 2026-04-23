# Production Image Optimization Guide

## 🎯 Overview

This guide explains how to optimize the 1500+ product images on your production server to dramatically improve website performance.

**Expected Results:**
- Page size: 76MB → ~3MB (95% reduction)
- Performance score: 55/100 → 75+/100
- LCP: 116.4s → ~15s
- Image quality: Maintained (80% WebP quality)

---

## 📋 Prerequisites

1. **SSH Access**: You need root access to the server at `147.93.108.205`
2. **Sharp Library**: Already installed in backend/package.json
3. **Backup Space**: Ensure ~76MB free space for backup of original images
4. **MongoDB Access**: Scripts need connection to your production database

---

## 🚀 Step-by-Step Implementation

### Step 1: Upload Scripts to Production Server

On your **local machine**, navigate to the backend folder and upload the scripts:

```bash
# Navigate to backend folder
cd "D:\SKILL\WEb Development\new\backend"

# Upload scripts to production server
scp scripts/optimizeProductionImages.js root@147.93.108.205:/var/www/Gandhara/backend/scripts/
scp scripts/updateImagePathsToWebP.js root@147.93.108.205:/var/www/Gandhara/backend/scripts/
```

### Step 2: SSH into Production Server

```bash
ssh root@147.93.108.205
```

Once connected:

```bash
cd /var/www/Gandhara/backend
```

### Step 3: Verify Sharp Installation

```bash
npm list sharp
```

If Sharp is not installed:

```bash
npm install sharp
```

### Step 4: Update Script Configuration

Edit the script to point to your production uploads directory:

```bash
nano scripts/optimizeProductionImages.js
```

Update the `UPLOADS_DIR` path:

```javascript
const CONFIG = {
  // Change this line:
  UPLOADS_DIR: '/var/www/Gandhara/frontend/uploads',  // Production path
  MAX_WIDTH: 1200,
  MAX_HEIGHT: 1200,
  WEBP_QUALITY: 80,
  BACKUP_ORIGINALS: true,
  BACKUP_DIR: '/var/www/Gandhara/uploads-backup-original',
};
```

Save and exit (Ctrl+X, Y, Enter).

### Step 5: Run Image Optimization

**Important**: This will process 1500+ images and may take 30-60 minutes.

```bash
node scripts/optimizeProductionImages.js
```

**What the script does:**
1. ✓ Scans all subdirectories in `/var/www/Gandhara/frontend/uploads/`
2. ✓ Finds all `.jpg`, `.jpeg`, `.png` files
3. ✓ Backs up originals to `/var/www/Gandhara/uploads-backup-original/`
4. ✓ Converts each image to WebP format (80% quality, max 1200x1200px)
5. ✓ Saves new `.webp` files alongside originals
6. ✓ Displays progress every 10 images
7. ✓ Shows final statistics (total size saved, reduction %)

**Expected output:**
```
🚀 Starting Image Optimization for Production Server

✓ Found 1523 images to process

🔄 Batch 1/153 (10 images)
✓ products/buddha-statue-001.jpg
  7.24MB → 142KB (98.0% reduction)
✓ products/gandhara-relief-002.jpg
  5.89MB → 178KB (97.0% reduction)
...

📊 IMAGE OPTIMIZATION COMPLETE
✓ Successfully processed: 1523 images
💾 Space saved: 73.2MB (96.1% reduction)
⏱ Duration: 1847.3 seconds
```

### Step 6: Update Database Records

After image optimization completes, update MongoDB to point to the new `.webp` files:

```bash
node scripts/updateImagePathsToWebP.js
```

**What this script does:**
1. ✓ Connects to your MongoDB production database
2. ✓ Updates all `Product` image fields (`.jpg` → `.webp`)
3. ✓ Updates all `VisitPlace` image fields
4. ✓ Updates all `Master` (category) image fields
5. ✓ Preserves original data structure
6. ✓ Shows progress for each collection

**Expected output:**
```
🚀 Starting Database Image Path Update to WebP

📦 Updating Product images...
✓ Updated: Buddha Statue (ID: 507f1f77bcf86cd799439011)
✓ Updated: Gandhara Relief (ID: 507f191e810c19729de860ea)
...

📊 DATABASE UPDATE COMPLETE
✓ Products: 1248/1248 updated
✓ VisitPlaces: 87/87 updated
✓ Masters: 24/24 updated
```

### Step 7: Verify Results

1. **Check WebP files exist:**
   ```bash
   ls -lh /var/www/Gandhara/frontend/uploads/products/*.webp | head -10
   ```

2. **Compare file sizes:**
   ```bash
   # Original JPG
   du -sh /var/www/Gandhara/uploads-backup-original/products/
   
   # Optimized WebP
   du -sh /var/www/Gandhara/frontend/uploads/products/
   ```

3. **Test on website:**
   - Visit https://gandhara-arts-and-taxila-stone-crafts.com
   - Open browser DevTools (F12) → Network tab
   - Filter by "images"
   - Verify `.webp` images are loading
   - Check image sizes are now ~100-200KB instead of 5-7MB

### Step 8: Update Backend for WebP Fallback (Optional)

Some older browsers don't support WebP. Add fallback middleware:

```bash
nano server.js
```

Add this before your static file serving:

```javascript
// WebP fallback middleware for older browsers
app.use('/uploads', (req, res, next) => {
  const acceptsWebP = req.headers.accept && req.headers.accept.includes('image/webp');
  
  if (!acceptsWebP && req.path.endsWith('.webp')) {
    // Serve JPG fallback for non-WebP browsers
    const jpgPath = req.path.replace('.webp', '.jpg');
    req.url = jpgPath;
  }
  
  next();
});

// Existing static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '365d',
  immutable: true
}));
```

Restart your backend:

```bash
pm2 restart backend
# OR
systemctl restart gandhara-backend
```

---

## 🧪 Testing & Verification

### 1. PageSpeed Insights Test

**Before optimization:**
- Performance: 55/100
- LCP: 116.4s
- Page Size: 76MB

**Run new test after optimization:**
```
https://pagespeed.web.dev/analysis?url=https://gandhara-arts-and-taxila-stone-crafts.com
```

**Expected after optimization:**
- Performance: 75-85/100
- LCP: 10-20s
- Page Size: 3-5MB

### 2. Visual Quality Check

Visit your website and check:
- ✓ Product images load correctly
- ✓ Image quality looks good (should be indistinguishable from originals)
- ✓ Zoom/magnifier features still work
- ✓ No broken images (404 errors)

### 3. Browser Compatibility Test

Test on multiple browsers:
- ✓ Chrome (supports WebP)
- ✓ Firefox (supports WebP)
- ✓ Safari (supports WebP since 2020)
- ✓ Mobile browsers (iOS Safari, Chrome Android)

---

## 🔄 Rollback Plan (If Needed)

If something goes wrong, you can restore original images:

```bash
# Stop backend server
pm2 stop backend

# Restore originals from backup
rm -rf /var/www/Gandhara/frontend/uploads
mv /var/www/Gandhara/uploads-backup-original /var/www/Gandhara/frontend/uploads

# Revert database changes (run on your MongoDB)
# You'll need to manually restore or re-run the reverse script
```

**Prevention**: Always test on staging environment first if available.

---

## 📊 Monitoring After Deployment

1. **Check error logs:**
   ```bash
   pm2 logs backend --lines 100
   ```

2. **Monitor server load:**
   ```bash
   htop
   ```

3. **Check disk usage:**
   ```bash
   df -h
   du -sh /var/www/Gandhara/frontend/uploads/*
   ```

4. **Google Search Console:**
   - Monitor for indexing issues
   - Check for crawl errors
   - Verify image sitemaps still work

---

## ⚠️ Important Notes

1. **Backup First**: The script creates backups, but ensure you have a full server backup before running
2. **Processing Time**: 1500 images will take 30-60 minutes depending on server specs
3. **Original Files**: The script keeps original JPG/PNG files by default (doesn't delete them)
4. **Disk Space**: You'll temporarily need ~150MB free space (76MB originals + 76MB backup)
5. **Database Backup**: Take a MongoDB dump before updating paths
6. **Testing**: Test thoroughly before deleting original JPG/PNG files

---

## 🎯 Next Steps After Phase 1

Once images are optimized and verified:

1. **Phase 2**: Add explicit width/height to img tags (fix CLS)
2. **Phase 3**: Implement lazy loading for images
3. **Phase 4**: Optimize videos (compress from 5MB to 500KB)
4. **Phase 5**: Remove Framer Motion, use CSS animations
5. **Phase 6**: Add aggressive caching headers

---

## 🆘 Troubleshooting

### Issue: "Cannot find module 'sharp'"
**Solution:**
```bash
cd /var/www/Gandhara/backend
npm install sharp
```

### Issue: "Permission denied" errors
**Solution:**
```bash
# Give Node.js permission to write files
chmod -R 755 /var/www/Gandhara/frontend/uploads
chown -R www-data:www-data /var/www/Gandhara/frontend/uploads
```

### Issue: WebP images not loading
**Solution:**
1. Check nginx/apache is serving WebP with correct MIME type
2. Add to nginx config:
   ```nginx
   types {
       image/webp webp;
   }
   ```
3. Restart nginx: `systemctl restart nginx`

### Issue: Database update failed
**Solution:**
```bash
# Check MongoDB connection
echo $MONGODB_URI

# Verify .env file exists
cat /var/www/Gandhara/backend/.env | grep MONGODB_URI
```

---

## 📞 Support

If you encounter any issues:
1. Check the console output for specific error messages
2. Verify file paths are correct for your server setup
3. Ensure Sharp library is installed
4. Check MongoDB connection string in .env file

---

## ✅ Success Checklist

- [ ] Uploaded scripts to production server
- [ ] Updated script configuration with correct paths
- [ ] Ran optimizeProductionImages.js successfully
- [ ] Verified WebP files were created
- [ ] Ran updateImagePathsToWebP.js successfully
- [ ] Tested website - images load correctly
- [ ] Ran PageSpeed Insights - performance improved
- [ ] Checked browser compatibility
- [ ] Monitored error logs - no issues
- [ ] Ready to proceed to Phase 2

---

**Estimated Total Time**: 1-2 hours (mostly waiting for script to process 1500 images)

**Estimated Performance Gain**: 
- 95% page size reduction (76MB → 3MB)
- 90% faster page load time
- +20-30 points on PageSpeed Insights score
