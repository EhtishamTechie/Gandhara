# 🚀 Complete Production Deployment Guide

## ✅ Current Status (What's Done)

### Code Fixes Completed:
- ✅ All API URLs fixed with environment variables
- ✅ Route order fixed (product detail routes work now)
- ✅ WordPress redirect logic updated to detect MongoDB IDs
- ✅ API response handling fixed (products/masters/tours)
- ✅ Videos included in build (143 MB total)
- ✅ SPA routing config files created (_redirects, .htaccess, vercel.json)

### Build Verification:
- ✅ Frontend built successfully
- ✅ All videos copied to dist (116.91 MB)
- ✅ All images copied to dist
- ✅ Redirect config files present

---

## 📋 Deployment Steps (DO THIS ON YOUR SERVER)

### Step 1: Upload the Build to Your Server

**Option A: Upload via FTP/SFTP**
1. Connect to your server via FileZilla/WinSCP
2. Navigate to your website root (usually `public_html` or `www`)
3. Upload everything from `frontend/dist/` folder
4. Make sure these files are in your website root:
   - `index.html`
   - `_redirects` (for Netlify)
   - `.htaccess` (for Apache/cPanel)
   - `assets/` folder
   - `GandharaImages/` folder
   - `ProductVideos/` folder
   - `TourImages/` folder

**Option B: Upload via Git (if using GitHub + hosting platform)**
1. Commit all changes:
   ```bash
   git add .
   git commit -m "Fix production routing and API issues"
   git push
   ```
2. Your hosting platform will auto-deploy

---

### Step 2: Set Environment Variable on Server

**For Netlify:**
1. Go to: Site Settings → Environment Variables
2. Add new variable:
   - Key: `VITE_API_URL`
   - Value: `https://gandharataxila.com` (or your actual domain)
3. Redeploy site

**For Vercel:**
1. Go to: Project Settings → Environment Variables
2. Add:
   - Key: `VITE_API_URL`
   - Value: `https://gandharataxila.com`
3. Redeploy

**For cPanel/Apache:**
1. Create `.env` file in website root (next to index.html)
2. Add: `VITE_API_URL=https://gandharataxila.com`
3. Or add to your server's environment variables via cPanel

**For Cloudflare Pages:**
1. Go to: Settings → Environment Variables
2. Add: `VITE_API_URL=https://gandharataxila.com`
3. Redeploy

---

### Step 3: Run Slug Migration on Server

**IMPORTANT:** This must run on the server where your database is!

**Option A: Via SSH (Recommended)**
```bash
ssh your-username@your-server.com
cd /path/to/your/backend
node scripts/generateSlugsForExistingProducts.js
```

**Option B: Via cPanel Terminal**
1. Open cPanel → Terminal
2. Navigate to backend folder
3. Run: `node scripts/generateSlugsForExistingProducts.js`

**Option C: Via hosting platform terminal (Heroku/Railway/Render)**
```bash
# For Heroku:
heroku run node scripts/generateSlugsForExistingProducts.js

# For Railway/Render:
# Use their web terminal interface
```

**Expected Output:**
```
✅ MongoDB Connected Successfully
🚀 Starting Slug Generation for Existing Products...
📊 Found 1500 products without slugs
📦 Processing batch 1 of 30
  ✓ Processed 10/1500 products...
  ✓ Processed 20/1500 products...
...
✅ Successfully generated slugs: 1500
✅ All products now have slugs! Migration complete!
```

---

### Step 4: Verify Your Backend is Running

Make sure your backend API is accessible:

**Test these URLs in browser:**
1. `https://gandharataxila.com/api/products` → Should return JSON
2. `https://gandharataxila.com/api/masters/all` → Should return JSON
3. `https://gandharataxila.com/api/visit-places/all` → Should return JSON

If you get errors:
- Check if backend is running
- Check if backend port is correct
- Check if backend has correct CORS settings

---

### Step 5: Test Direct URLs in Production

After deploying, test these URLs by **pasting directly in browser**:

1. ✅ `https://yourdomain.com/`
2. ✅ `https://yourdomain.com/products`
3. ✅ `https://yourdomain.com/product/68936bc49b6f40bce8a24040` ← MongoDB ID
4. ✅ `https://yourdomain.com/category/gandhara-art`
5. ✅ `https://yourdomain.com/search`

**All should work without 404 errors!**

After slug migration:
6. ✅ `https://yourdomain.com/product/buddha-gandhara-statue` ← Slug URL

---

## 🔍 Troubleshooting

### Problem: Direct URLs still show 404

**Solution by Platform:**

**Netlify:**
- Check if `_redirects` file is in the deployed site
- Go to: Deploys → Click latest deploy → Check "Deploy log"
- Should see: "Processing redirects file"

**Vercel:**
- Check if `vercel.json` exists in project root
- Redeploy after confirming file is there

**Apache/cPanel:**
- Check if `.htaccess` is in website root (next to index.html)
- Some hosts block `.htaccess` - contact support to enable
- Check file permissions: Should be 644

**Cloudflare Pages:**
- No config needed - works automatically
- If not working, check "Build settings" → "Build command" should be `npm run build`

---

### Problem: API calls failing (console errors)

**Check:**
1. Is `VITE_API_URL` set correctly?
2. Is backend running and accessible?
3. Does backend have correct CORS settings?

**Fix CORS in backend:**
```javascript
// backend/server.js
app.use(cors({
  origin: ['https://gandharataxila.com', 'https://www.gandharataxila.com'],
  credentials: true
}));
```

---

### Problem: Videos not playing

**Check:**
1. Are videos in the deployed site? Check: `https://yourdomain.com/ProductVideos/Gandhara%20Art%20Artisans.mp4`
2. If 404, videos weren't uploaded - upload them manually
3. If size limit issue, use CDN (Cloudinary/Bunny.net)

---

## 🎯 Quick Deployment Checklist

Before deploying:
- [x] Frontend built (`npm run build`)
- [x] Build verified (videos/images included)
- [x] All code fixes committed

On server:
- [ ] Upload `dist` folder contents to website root
- [ ] Set `VITE_API_URL` environment variable
- [ ] Verify SPA routing config (check platform above)
- [ ] Run slug migration script on server
- [ ] Test direct URLs
- [ ] Check browser console for errors

---

## 🎉 Success Indicators

After deployment, you should have:
- ✅ No 404 errors on direct URL access
- ✅ No console errors about API fetching
- ✅ Videos playing on homepage
- ✅ Products showing with images
- ✅ Direct product URLs working: `/product/68936bc49b6f40bce8a24040`
- ✅ After migration: Slug URLs working `/product/gandhara-buddha-statue`
- ✅ All pages accessible via direct URLs

---

## 📞 Need Help?

**Common Issues:**

1. **"MongoDB connection failed" when running migration**
   - Make sure you're running it on the server where DB is
   - Check .env file has correct MONGODB_URI

2. **"Module not found" errors**
   - Run `npm install` in backend folder first
   - Make sure all dependencies are installed

3. **"Videos too large to upload"**
   - Use Cloudinary (free 25GB): https://cloudinary.com/
   - Or compress videos with ffmpeg

4. **"Routes not working even after deployment"**
   - Double-check hosting platform config
   - See platform-specific instructions above

---

## 🚀 You're Ready!

Everything is prepared. Just follow the steps above on your server and you're done!

The build is ready in `frontend/dist/` - upload it and set the environment variable! 🎉
