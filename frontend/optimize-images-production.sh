#!/bin/bash

# Production Image Optimization Script
# Converts PNG/JPG images to WebP format for better performance
# Usage: bash optimize-images-production.sh

echo "🚀 Starting Production Image Optimization..."
echo ""

# Navigate to frontend directory
cd /var/www/Gandhara/frontend || exit 1

# Check if Sharp is installed
if ! node -e "require('sharp')" 2>/dev/null; then
    echo "📦 Installing Sharp package..."
    npm install --save-dev sharp --legacy-peer-deps
    echo ""
fi

# Check if conversion script exists
if [ ! -f "scripts/convertToWebP.js" ]; then
    echo "❌ Error: scripts/convertToWebP.js not found!"
    echo "Please upload the script first."
    exit 1
fi

# Run the conversion
echo "🖼️  Converting images to WebP format..."
echo ""
node scripts/convertToWebP.js

# Check if conversion was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Image optimization complete!"
    echo ""
    echo "📊 Checking results..."
    echo "WebP files in GandharaImages:"
    ls -1 public/GandharaImages/*.webp 2>/dev/null | wc -l
    echo ""
    echo "💾 Original files backed up to:"
    echo "   public/GandharaImages/original_backups/"
    echo ""
    echo "🔄 Next steps:"
    echo "   1. Rebuild frontend: npm run build"
    echo "   2. Restart web server: sudo systemctl restart nginx"
else
    echo ""
    echo "❌ Image conversion failed. Check errors above."
    exit 1
fi
