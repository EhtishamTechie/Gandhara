// Create this file: routes/sitemapRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');

// Serve main sitemap.xml from frontend/public
router.get('/sitemap.xml', (req, res) => {
  try {
    const sitemapPath = path.join(__dirname, '../../frontend/public/sitemap.xml');
    
    // Check if file exists
    if (!fs.existsSync(sitemapPath)) {
      console.error('Sitemap file not found at:', sitemapPath);
      return res.status(404).send('Sitemap not found. Please run generateSitemap.js script.');
    }
    
    // Read and send the file
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    res.set('Content-Type', 'application/xml');
    res.send(sitemapContent);
  } catch (error) {
    console.error('Error serving sitemap:', error);
    res.status(500).send('Error serving sitemap');
  }
});

// Generate Image Sitemap
router.get('/image-sitemap.xml', async (req, res) => {
  try {
    const products = await Product.find({}).select('title seoDescription image categories seoTitle imageAlt createdAt');
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

    products.forEach(product => {
      const productUrl = `https://gandhara-arts-and-taxila-stone-crafts.com/product/${product._id}`;
      const imageUrl = `https://gandhara-arts-and-taxila-stone-crafts.com${product.image}`;
      const imageTitle = product.seoTitle || product.title;
      const imageCaption = product.seoDescription || product.title;
      const imageAlt = product.imageAlt || `${product.title} - Authentic Pakistani stone craft`;

      xml += `
  <url>
    <loc>${productUrl}</loc>
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title><![CDATA[${imageTitle}]]></image:title>
      <image:caption><![CDATA[${imageCaption}]]></image:caption>
      <image:geo_location>Taxila, Punjab, Pakistan</image:geo_location>
      <image:license>https://gandhara-arts-and-taxila-stone-crafts.com/terms</image:license>
    </image:image>
    <lastmod>${product.createdAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating image sitemap:', error);
    res.status(500).send('Error generating image sitemap');
  }
});

// Generate robots.txt with image sitemap reference
router.get('/robots.txt', (req, res) => {
  const robotsTxt = `User-agent: *
Allow: /

# Image optimization
Allow: /uploads/
Allow: *.jpg
Allow: *.jpeg  
Allow: *.png
Allow: *.webp

# Sitemaps
Sitemap: https://gandhara-arts-and-taxila-stone-crafts.com/sitemap.xml
Sitemap: https://gandhara-arts-and-taxila-stone-crafts.com/image-sitemap.xml

# Block admin areas
Disallow: /admin/
Disallow: /api/admin/`;

  res.set('Content-Type', 'text/plain');
  res.send(robotsTxt);
});

module.exports = router;
