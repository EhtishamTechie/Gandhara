# Commit the image loader fixes
git add frontend\src\utils\imageLoader.js frontend\src\components\OptimizedImage.jsx
git commit -m "Fix: Auto-detect bulk product dimensions (565px) to prevent 404 errors on 800w/1200w AVIF requests"
git push origin main
