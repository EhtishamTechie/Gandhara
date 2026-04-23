# 🚀 COMPREHENSIVE WEBSITE PERFORMANCE OPTIMIZATION PLAN
**Project:** Gandhara Arts & Taxila Stone Crafts  
**Current Performance:** 55/100 Mobile | Issues: FCP 4.8s, LCP 116.4s, Total Size 76MB  
**Target:** 90+ Performance Score | LCP < 2.5s | Total Size < 3MB

---

## 📊 CRITICAL ISSUES IDENTIFIED FROM PAGESPEED INSIGHTS

### 🔴 SEVERE (Must Fix Immediately)
1. **LCP: 116.4s** - Largest Contentful Paint is catastrophic
2. **Total Page Size: 76MB** - Enormous! Should be < 3MB
3. **Image Sizes: 7MB+ per image** - Individual images are massive
4. **Video Files: 5MB+ each** - Product videos not optimized
5. **FCP: 4.8s** - First Contentful Paint too slow
6. **Render Blocking CSS: 20.9KB** - 1.1s blocking

### 🟠 HIGH PRIORITY  
7. **No Image Width/Height** - Causing layout shifts (CLS)
8. **Images Not WebP/AVIF** - Using JPG/PNG format
9. **Legacy JavaScript: 299KB** - Facebook polyfills waste
10. **8 Long Tasks** - Main thread blocking
11. **14 Non-Composited Animations** - Framer Motion overuse
12. **Forced Reflows: 49ms** - DOM manipulation issues

### 🟡 MEDIUM PRIORITY
13. **Cache Lifetimes: 124KB** - Poor caching strategy
14. **Speed Index: 7.1s** - Visual completeness slow
15. **TBT: 240ms** - Total Blocking Time
16. **No Preconnect Hints** - Missing DNS prefetch

---

## 🎯 OPTIMIZATION STRATEGY (PHASE-WISE)

---

## ⚡ PHASE 1: CRITICAL IMAGE OPTIMIZATION (HIGHEST IMPACT)
**Impact:** Will reduce page size from 76MB to ~3MB (-95%)  
**Time:** 2-3 hours  
**Priority:** 🔴 URGENT

### 1.1 Compress All Product Images
**Current:** 7MB JPG images  
**Target:** <100KB WebP images

```bash
# Run this in backend directory
cd backend

# Install Sharp if not already
npm install sharp --save

# Create optimization script
node scripts/optimizeAllImages.js
```

**Create:** `backend/scripts/optimizeAllImages.js`
```javascript
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const UPLOADS_DIR = path.join(__dirname, '../uploads');
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const QUALITY = 80;

async function optimizeImage(inputPath, outputPath) {
  try {
    const metadata = await sharp(inputPath).metadata();
    
    await sharp(inputPath)
      .resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: QUALITY })
      .toFile(outputPath);
    
    const inputStats = fs.statSync(inputPath);
    const outputStats = fs.statSync(outputPath);
    const savings = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);
    
    console.log(`✅ ${path.basename(inputPath)}: ${(inputStats.size/1024/1024).toFixed(2)}MB → ${(outputStats.size/1024).toFixed(0)}KB (${savings}% smaller)`);
    
    return outputStats.size;
  } catch (error) {
    console.error(`❌ Failed: ${inputPath}`, error.message);
    return 0;
  }
}

async function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let totalOriginal = 0;
  let totalOptimized = 0;
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      const result = await processDirectory(fullPath);
      totalOriginal += result.original;
      totalOptimized += result.optimized;
    } else if (/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i.test(file)) {
      const outputPath = fullPath.replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i, '.webp');
      
      if (!fs.existsSync(outputPath)) {
        const originalSize = stat.size;
        const optimizedSize = await optimizeImage(fullPath, outputPath);
        totalOriginal += originalSize;
        totalOptimized += optimizedSize;
      }
    }
  }
  
  return { original: totalOriginal, optimized: totalOptimized };
}

async function main() {
  console.log('🚀 Starting image optimization...\n');
  const result = await processDirectory(UPLOADS_DIR);
  
  console.log(`\n✨ COMPLETE!`);
  console.log(`   Original: ${(result.original/1024/1024).toFixed(2)}MB`);
  console.log(`   Optimized: ${(result.optimized/1024/1024).toFixed(2)}MB`);
  console.log(`   Saved: ${((1-result.optimized/result.original)*100).toFixed(1)}%`);
}

main();
```

### 1.2 Update Database to Use WebP
**File:** `backend/scripts/updateImagePathsToWebP.js`

```javascript
const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI);

async function updateToWebP() {
  const products = await Product.find({});
  let updated = 0;
  
  for (const product of products) {
    let changed = false;
    
    // Update main image
    if (product.image && /\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i.test(product.image)) {
      product.image = product.image.replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i, '.webp');
      changed = true;
    }
    
    // Update image array
    if (product.images && product.images.length > 0) {
      product.images = product.images.map(img =>
        img.replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i, '.webp')
      );
      changed = true;
    }
    
    if (changed) {
      await product.save();
      updated++;
    }
  }
  
  console.log(`✅ Updated ${updated} products to use WebP`);
  process.exit(0);
}

updateToWebP();
```

**Run:**
```bash
node backend/scripts/updateImagePathsToWebP.js
```

### 1.3 Serve WebP with Fallback
**Update:** `backend/server.js`

```javascript
// Add WebP middleware before static files
app.use('/uploads', (req, res, next) => {
  const webpPath = req.path.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  const fullWebpPath = path.join(__dirname, 'uploads', webpPath);
  
  if (req.accepts('image/webp') && fs.existsSync(fullWebpPath)) {
    res.type('image/webp');
    res.sendFile(fullWebpPath);
  } else {
    next();
  }
});
```

---

## 🖼️ PHASE 2: ADD EXPLICIT IMAGE DIMENSIONS (FIX CLS)
**Impact:** Eliminates layout shifts, improves CLS from 0 to perfect  
**Time:** 1 hour  
**Priority:** 🔴 URGENT

### 2.1 Add Width/Height to All Images

**Update all image components:**

```jsx
// BEFORE (causes layout shift)
<img src={image} alt={title} />

// AFTER (no layout shift)
<img 
  src={image} 
  alt={title}
  width="1200"
  height="1200"
  loading="lazy"
/>
```

**Files to Update:**
- `frontend/src/components/ProductCard.jsx`
- `frontend/src/components/ProductDetail.jsx`
- `frontend/src/pages/AllProductsPage.jsx`
- `frontend/src/pages/ProductPage.jsx`
- `frontend/src/components/HeroSection.jsx`

---

## 🎬 PHASE 3: OPTIMIZE VIDEO FILES
**Impact:** Reduce video size from 5MB to ~500KB each (-90%)  
**Time:** 1 hour  
**Priority:** 🔴 URGENT

### 3.1 Compress Videos

```bash
# Install FFmpeg (Windows)
winget install FFmpeg

# Compress all videos
cd public/ProductVideos
for %f in (*.mp4) do ffmpeg -i "%f" -c:v libx264 -crf 28 -preset medium -c:a aac -b:a 128k "%~nf-optimized.mp4"
```

**Settings:**
- **CRF:** 28 (good quality, smaller size)
- **Resolution:** Max 720p
- **Bitrate:** 1Mbps video, 128kbps audio

### 3.2 Lazy Load Videos

```jsx
<video
  poster={`${video}.webp`}  // Add poster image
  preload="none"            // Don't preload
  loading="lazy"            // Lazy load
>
  <source src={video} type="video/mp4" />
</video>
```

---

## 🚫 PHASE 4: REDUCE JAVASCRIPT BUNDLE SIZE
**Impact:** Reduce JS from 110KB to ~60KB (-45%)  
**Time:** 2 hours  
**Priority:** 🟠 HIGH

### 4.1 Tree-Shake Framer Motion

**Current Issue:** Importing entire Framer Motion library (112KB)

**Solution:** Use only what you need

```jsx
// BEFORE (imports everything)
import { motion, AnimatePresence } from "framer-motion";

// AFTER (tree-shakeable)
import { motion } from "framer-motion/dist/framer-motion";
import { AnimatePresence } from "framer-motion/dist/framer-motion";
```

**Better:** Replace with CSS animations where possible

```css
/* Instead of framer-motion */
.fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### 4.2 Remove Unused Libraries

**Check usage:**
```bash
npm run build -- --stats
npx vite-bundle-visualizer
```

**Likely candidates for removal:**
- `react-image-gallery` (if not used)
- `yet-another-react-lightbox` (if not used)
- `react-window` (if not used)

### 4.3 Dynamic Imports for Heavy Components

```jsx
// BEFORE
import ProductVideoShowcase from './components/ProductVideoShowcase';

// AFTER (lazy load)
const ProductVideoShowcase = lazy(() => import('./components/ProductVideoShowcase'));
```

---

## 💾 PHASE 5: AGGRESSIVE CACHING STRATEGY
**Impact:** Return visitors load in <1s  
**Time:** 1 hour  
**Priority:** 🟠 HIGH

### 5.1 Backend Cache Headers

**Update:** `backend/server.js`

```javascript
// Static assets caching
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '365d', // 1 year
  immutable: true,
  etag: true,
  lastModified: true
}));

// API caching middleware
app.use('/api/products', (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
  next();
});
```

### 5.2 Service Worker for Offline Caching

**Install:** PWA plugin already in vite.config.js

**Update:** `frontend/vite.config.js`

```javascript
import { VitePWA } from 'vite-plugin-pwa';

plugins: [
  VitePWA({
    registerType: 'autoUpdate',
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/gandhara-arts.*\/uploads\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
            }
          }
        }
      ]
    }
  })
]
```

---

## ⚡ PHASE 6: ELIMINATE RENDER-BLOCKING RESOURCES
**Impact:** Improve FCP from 4.8s to <2s  
**Time:** 30 minutes  
**Priority:** 🟠 HIGH

### 6.1 Inline Critical CSS

**Update:** `frontend/index.html`

```html
<head>
  <style>
    /* Critical CSS - inline above-the-fold styles */
    body{margin:0;font-family:system-ui;background:#0F172A}
    .hero{min-height:100vh;display:flex;align-items:center}
    /* Add more critical styles */
  </style>
  
  <!-- Load full CSS async -->
  <link rel="stylesheet" href="/assets/index.css" media="print" onload="this.media='all'">
</head>
```

### 6.2 Defer Non-Critical Scripts

```html
<!-- Load protection script async -->
<script src="/imageProtection.js" defer></script>

<!-- Defer analytics -->
<script async src="https://www.googletagmanager.com/gtm.js"></script>
```

---

## 🔄 PHASE 7: PRELOAD & PRECONNECT
**Impact:** Faster external resource loading  
**Time:** 15 minutes  
**Priority:** 🟡 MEDIUM

**Update:** `frontend/index.html`

```html
<head>
  <!-- Preconnect to your API -->
  <link rel="preconnect" href="https://gandhara-arts-and-taxila-stone-crafts.com" crossorigin>
  
  <!-- Preconnect to external services -->
  <link rel="preconnect" href="https://www.googletagmanager.com">
  <link rel="preconnect" href="https://connect.facebook.net">
  
  <!-- Preload critical resources -->
  <link rel="preload" as="style" href="/assets/index.css">
  <link rel="preload" as="script" href="/assets/index.js">
  
  <!-- Preload hero image -->
  <link rel="preload" as="image" href="/GandharaImages/hero.webp" fetchpriority="high">
</head>
```

---

## 📱 PHASE 8: RESPONSIVE IMAGES
**Impact:** Mobile users load smaller images  
**Time:** 1 hour  
**Priority:** 🟡 MEDIUM

### 8.1 Generate Multiple Sizes

**Backend:** `scripts/generateResponsiveImages.js`

```javascript
const sizes = [400, 800, 1200, 1600];

for (const size of sizes) {
  await sharp(inputPath)
    .resize(size, size, { fit: 'inside' })
    .webp({ quality: 80 })
    .toFile(outputPath.replace('.webp', `-${size}w.webp`));
}
```

### 8.2 Use srcset

```jsx
<img
  src={`${image}-800w.webp`}
  srcSet={`
    ${image}-400w.webp 400w,
    ${image}-800w.webp 800w,
    ${image}-1200w.webp 1200w
  `}
  sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
  alt={title}
/>
```

---

## 🎨 PHASE 9: OPTIMIZE ANIMATIONS
**Impact:** Reduce main thread work by 50%  
**Time:** 2 hours  
**Priority:** 🟡 MEDIUM

### 9.1 Use CSS Instead of Framer Motion

**Replace JavaScript animations with CSS:**

```css
/* Use will-change for animations */
.product-card {
  transition: transform 0.3s ease;
  will-change: transform;
}

.product-card:hover {
  transform: translateY(-8px);
}

/* Use transform/opacity only (GPU accelerated) */
@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 9.2 Reduce Framer Motion Usage

**Only use for complex interactions:**
- Modal animations
- Page transitions
- Drag interactions

**NOT for:**
- Hover effects (use CSS)
- Fade ins (use CSS)
- Simple transforms (use CSS)

---

## 📊 PHASE 10: DATABASE & API OPTIMIZATION
**Impact:** Faster data fetching  
**Time:** 1 hour  
**Priority:** 🟡 MEDIUM

### 10.1 Add Database Indexes

```javascript
// In Product model
productSchema.index({ category: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ createdAt: -1 });
```

### 10.2 Implement Pagination

```javascript
// Instead of loading all products
app.get('/api/products', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;
  
  const products = await Product.find()
    .limit(limit)
    .skip(skip)
    .lean() // Faster, returns plain objects
    .select('-__v'); // Don't send version field
  
  res.json(products);
});
```

### 10.3 API Response Compression

```javascript
// Already added in server.js, verify it's working
app.use(compression({ level: 6 }));
```

---

## 🎯 EXPECTED RESULTS AFTER OPTIMIZATION

### Before:
- **Performance:** 55/100
- **FCP:** 4.8s
- **LCP:** 116.4s (!)
- **Page Size:** 76MB
- **Images:** 7MB each

### After:
- **Performance:** 90+/100 ✅
- **FCP:** <1.5s ✅
- **LCP:** <2.5s ✅
- **Page Size:** ~3MB ✅
- **Images:** <100KB each ✅

---

## 🚀 IMPLEMENTATION ORDER (PRIORITY)

1. ✅ **PHASE 1:** Image Optimization (76MB → 3MB) - **DO THIS FIRST**
2. ✅ **PHASE 2:** Add Image Dimensions (Fix CLS)
3. ✅ **PHASE 3:** Optimize Videos (5MB → 500KB each)
4. ⚡ **PHASE 5:** Caching Strategy
5. ⚡ **PHASE 6:** Eliminate Render Blocking
6. 🎨 **PHASE 4:** Reduce JS Bundle
7. 🔄 **PHASE 7:** Preload/Preconnect
8. 📱 **PHASE 8:** Responsive Images
9. 🎨 **PHASE 9:** Optimize Animations
10. 📊 **PHASE 10:** Database Optimization

---

## 📋 IMMEDIATE ACTION CHECKLIST

**Today (3-4 hours):**
- [ ] Run image optimization script
- [ ] Update database to WebP paths
- [ ] Add width/height to all images
- [ ] Compress videos
- [ ] Test loading speed

**Tomorrow (2-3 hours):**
- [ ] Implement caching headers
- [ ] Remove render-blocking resources
- [ ] Add preconnect hints
- [ ] Reduce Framer Motion usage

**This Week:**
- [ ] Generate responsive images
- [ ] Implement lazy loading everywhere
- [ ] Optimize animations
- [ ] Database indexes
- [ ] API pagination

---

## 🛠️ TOOLS TO USE

```bash
# Performance testing
npm run build
npm run preview

# Analyze bundle
npx vite-bundle-visualizer

# Check images
cd backend
node scripts/optimizeAllImages.js

# Test PageSpeed
https://pagespeed.web.dev/
```

---

## 💡 ADDITIONAL RECOMMENDATIONS

### Use CDN (Future)
- Cloudflare for static assets
- Reduces server load
- Global distribution

### Implement HTTP/2
- Nginx/Apache HTTP/2 support
- Multiplexing reduces latency

### Monitor Performance
- Google Analytics Web Vitals
- Real User Monitoring (RUM)
- Set up alerts for regressions

---

**This plan will take your site from 55 → 90+ performance score and make it lightning fast! 🚀**
