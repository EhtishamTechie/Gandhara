# Production Deployment Guide for Gandhara Arts

## 🚨 CRITICAL: SPA Routing Configuration Required

Your React app uses client-side routing (React Router). Without proper server configuration, direct URL access will fail.

---

## ✅ Configuration Files Included

### 1. **Netlify** → `public/_redirects`
```
/*    /index.html   200
```

### 2. **Vercel** → `vercel.json` (root)
```json
{
  "rewrites": [{"source": "/(.*)", "destination": "/index.html"}]
}
```

### 3. **Apache/cPanel** → `public/.htaccess`
```apache
RewriteEngine On
RewriteRule ^ index.html [L]
```

---

## 📋 Platform-Specific Instructions

### **Netlify** 🟢 (Recommended - Easiest)

1. Build your app:
   ```bash
   npm run build
   ```

2. Deploy `dist` folder to Netlify

3. Set environment variable in Netlify dashboard:
   - Key: `VITE_API_URL`
   - Value: `https://gandharataxila.com`

4. The `_redirects` file will automatically be copied from `public/` to `dist/`

✅ **Done!** Direct URLs will work.

---

### **Vercel** 🟡

1. Ensure `vercel.json` is in your project root (not in public/)

2. Build:
   ```bash
   npm run build
   ```

3. Deploy using Vercel CLI or dashboard

4. Set environment variable:
   - Key: `VITE_API_URL`
   - Value: `https://gandharataxila.com`

✅ **Done!** Vercel will use the rewrite rules.

---

### **cPanel/Apache Hosting** 🟠

1. Build:
   ```bash
   npm run build
   ```

2. Upload entire `dist` folder contents to `public_html/`

3. The `.htaccess` file will be copied automatically from `public/`

4. If `.htaccess` doesn't work, enable mod_rewrite in Apache:
   ```bash
   sudo a2enmod rewrite
   sudo systemctl restart apache2
   ```

5. Set environment variable via cPanel or `.env` file on server

✅ **Done!** Apache will serve index.html for all routes.

---

### **Cloudflare Pages** 🟢

1. Build:
   ```bash
   npm run build
   ```

2. Deploy `dist` folder

3. Cloudflare automatically handles SPA routing (no config needed!)

4. Set environment variable in Cloudflare Pages dashboard

✅ **Done!** Works out of the box.

---

### **GitHub Pages** 🔴 (Not Recommended)

GitHub Pages doesn't support SPA routing properly without workarounds.

**Workaround**: Use HashRouter instead of BrowserRouter:
```jsx
// Not recommended - breaks SEO
import { HashRouter } from 'react-router-dom';
```

❌ **Better to use Netlify or Vercel instead.**

---

## 🧪 Testing Direct URLs

After deployment, test these URLs directly in browser:

1. ✅ `https://yourdomain.com/` (homepage)
2. ✅ `https://yourdomain.com/products` (all products)
3. ✅ `https://yourdomain.com/product/68936bc49b6f40bce8a24040` (product detail)
4. ✅ `https://yourdomain.com/category/gandhara-art` (category)
5. ✅ `https://yourdomain.com/search` (search page)

**All should load correctly without 404 errors!**

---

## 🔍 Troubleshooting

### Problem: Still getting 404 on direct URLs

**Solution by Platform:**

**Netlify:**
- Check if `_redirects` file exists in deployed site
- Go to Site Settings → Build & Deploy → Post Processing → Disable Asset Optimization (if enabled)

**Vercel:**
- Ensure `vercel.json` is in root directory (next to package.json)
- Redeploy after adding vercel.json

**Apache/cPanel:**
- Check if `.htaccess` is in the root folder (next to index.html)
- Verify mod_rewrite is enabled: `apache2 -M | grep rewrite`
- Check file permissions: `chmod 644 .htaccess`

---

## 🎯 Quick Test Locally

Before deploying, test the production build locally:

```bash
npm run build
npm run preview
```

Then open http://localhost:4173/product/68936bc49b6f40bce8a24040

✅ If it works locally, it will work in production with proper server config!

---

## 📝 Environment Variables Checklist

Make sure these are set in your hosting platform:

```
VITE_API_URL=https://gandharataxila.com
```

**Where to set:**
- **Netlify**: Site Settings → Environment Variables
- **Vercel**: Project Settings → Environment Variables
- **Cloudflare Pages**: Settings → Environment Variables
- **cPanel**: Create `.env` file or use server config

---

## 🚀 Final Deployment Checklist

- [ ] Run slug migration: `node backend/scripts/generateSlugsForExistingProducts.js`
- [ ] Build frontend: `npm run build`
- [ ] Verify videos in build: `.\verify-build.ps1`
- [ ] Test locally: `npm run preview`
- [ ] Deploy dist folder
- [ ] Set VITE_API_URL environment variable
- [ ] Verify server routing config (one of the files above)
- [ ] Test direct URLs in production
- [ ] Check browser console for errors

---

## ✅ Success Indicators

After deployment, you should see:
- ✅ No 404 errors on direct URL access
- ✅ No console errors about data fetching
- ✅ Videos playing on homepage
- ✅ Products loading with proper images
- ✅ Direct product URLs working: `/product/68936bc49b6f40bce8a24040`
- ✅ Slug URLs working: `/product/gandhara-buddha-statue` (after migration)

---

Need help? Check which hosting platform you're using and follow the specific instructions above!
