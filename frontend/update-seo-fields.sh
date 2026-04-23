#!/bin/bash

echo "🚀 Starting automated SEO field updates..."

# Backup the original files first
echo "📦 Creating backups..."
cp src/components/ProductCard.jsx src/components/ProductCard.jsx.backup
cp src/components/ProductDetail.jsx src/components/ProductDetail.jsx.backup
cp src/pages/ProductPage.jsx src/pages/ProductPage.jsx.backup
cp src/pages/AllProductsPage.jsx src/pages/AllProductsPage.jsx.backup

echo "✅ Backups created"

# Update ProductCard.jsx - Replace title usage
echo "🔄 Updating ProductCard.jsx..."
sed -i 's/{product\.title}/{product.seoTitle || product.title}/g' src/components/ProductCard.jsx
sed -i 's/{product\.description}/{product.seoDescription || product.description}/g' src/components/ProductCard.jsx
sed -i 's/alt={product\.title}/alt={product.imageAlt || product.title}/g' src/components/ProductCard.jsx

# Update ProductDetail.jsx - Replace title and description usage
echo "🔄 Updating ProductDetail.jsx..."
sed -i 's/{product\.title}/{product.seoTitle || product.title}/g' src/components/ProductDetail.jsx
sed -i 's/{product\.description}/{product.seoDescription || product.description}/g' src/components/ProductDetail.jsx

# Update ProductPage.jsx - Replace title and description usage
echo "🔄 Updating ProductPage.jsx..."
sed -i 's/{product\.title}/{product.seoTitle || product.title}/g' src/pages/ProductPage.jsx
sed -i 's/{product\.description}/{product.seoDescription || product.description}/g' src/pages/ProductPage.jsx

# Update AllProductsPage.jsx - Replace title and description usage
echo "🔄 Updating AllProductsPage.jsx..."
sed -i 's/{product\.title}/{product.seoTitle || product.title}/g' src/pages/AllProductsPage.jsx
sed -i 's/{product\.description}/{product.seoDescription || product.description}/g' src/pages/AllProductsPage.jsx

echo "✅ All files updated successfully!"
echo ""
echo "📋 Updated components:"
echo "   • ProductCard.jsx - Now uses seoTitle, seoDescription, imageAlt"
echo "   • ProductDetail.jsx - Now uses seoTitle, seoDescription, imageAlt"  
echo "   • ProductPage.jsx - Now uses seoTitle, seoDescription, imageAlt"
echo "   • AllProductsPage.jsx - Now uses seoTitle, seoDescription, imageAlt"
echo ""
echo "🔗 Next steps:"
echo "   1. Install react-helmet-async: npm install react-helmet-async"
echo "   2. Build the project: npm run build"
echo "   3. Test your website to see SEO optimized content!"
echo ""
echo "💾 Original files backed up with .backup extension"
