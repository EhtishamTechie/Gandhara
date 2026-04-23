/**
 * ADVANCED SEO SITEMAP GENERATOR for Gandhara Arts
 * Features:
 * - Product images with titles and captions
 * - Dynamic category pages
 * - Visit places with images
 * - Mobile-friendly URLs
 * - Proper priority and frequency
 * - Image optimization for Google Image Search
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import models
const Product = require('../models/Product');
const VisitPlace = require('../models/VisitPlace');

// Configuration
const config = {
  baseUrl: 'https://gandhara-arts-and-taxila-stone-crafts.com',
  outputPath: path.join(__dirname, '../../frontend/public/sitemap.xml'),
  backupPath: path.join(__dirname, '../../frontend/public/sitemap-backup.xml'),
  robotsPath: path.join(__dirname, '../../frontend/public/robots.txt')
};

// Helper function to get full image URL
function getImageUrl(imagePath) {
  if (!imagePath) return null;
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Remove leading slash if present
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  
  // Construct full URL
  return `${config.baseUrl}/${cleanPath}`;
}

// Helper function to escape XML special characters
function escapeXml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Static pages with their priorities and change frequencies
const staticPages = [
  {
    url: '/',
    lastmod: new Date().toISOString(),
    changefreq: 'weekly',
    priority: '1.0'
  },
  {
    url: '/about',
    lastmod: new Date().toISOString(),
    changefreq: 'monthly',
    priority: '0.8'
  },
  {
    url: '/contact',
    lastmod: new Date().toISOString(),
    changefreq: 'monthly',
    priority: '0.8'
  },
  {
    url: '/visit-taxila',
    lastmod: new Date().toISOString(),
    changefreq: 'monthly',
    priority: '0.9'
  }
];

// Product categories with their priorities
const productCategories = [
  { slug: 'buddha-statues', priority: '0.9' },
  { slug: 'gandhara-sculptures', priority: '0.9' },
  { slug: 'stone-carvings', priority: '0.8' },
  { slug: 'antique-pieces', priority: '0.8' },
  { slug: 'decorative-items', priority: '0.7' },
  { slug: 'religious-artifacts', priority: '0.8' }
];

/**
 * Generate XML sitemap entry with optional images
 */
function generateSitemapEntry(url, lastmod, changefreq, priority, images = []) {
  let entry = `  <url>
    <loc>${config.baseUrl}${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>`;
  
  // Add images if provided
  if (images && images.length > 0) {
    images.forEach(image => {
      if (image.url) {
        entry += `
    <image:image>
      <image:loc>${image.url}</image:loc>`;
        
        if (image.title) {
          entry += `
      <image:title><![CDATA[${escapeXml(image.title)}]]></image:title>`;
        }
        
        if (image.caption) {
          entry += `
      <image:caption><![CDATA[${escapeXml(image.caption)}]]></image:caption>`;
        }
        
        entry += `
    </image:image>`;
      }
    });
  }
  
  entry += `
  </url>`;
  
  return entry;
}

/**
 * Generate sitemap for products with images
 */
async function generateProductSitemap() {
  console.log('📦 Generating product sitemap entries with images...');
  
  try {
    const products = await Product.find({ 
      slug: { $exists: true, $ne: null, $ne: '' } 
    })
    .select('slug updatedAt seoScore title seoTitle description seoDescription image images categories imageAlt')
    .lean();

    console.log(`✅ Found ${products.length} products with slugs`);

    const productEntries = products.map(product => {
      // Determine priority based on SEO score and category
      let priority = '0.6';
      if (product.seoScore >= 80) priority = '0.8';
      else if (product.seoScore >= 70) priority = '0.7';
      
      // Buddha statues and Gandhara sculptures get higher priority
      const categoriesStr = Array.isArray(product.categories) 
        ? product.categories.join(' ').toLowerCase() 
        : (product.categories || '').toLowerCase();
      
      if (categoriesStr.includes('buddha') || 
          categoriesStr.includes('gandhara') ||
          categoriesStr.includes('featuredproducts') ||
          categoriesStr.includes('luxary collection')) {
        priority = '0.9';
      }

      // Prepare product images
      const productImages = [];
      
      // Add main image
      if (product.image) {
        const imageUrl = getImageUrl(product.image);
        if (imageUrl) {
          productImages.push({
            url: imageUrl,
            title: product.seoTitle || product.title || 'Product Image',
            caption: product.imageAlt || product.seoDescription?.substring(0, 100) || product.description?.substring(0, 100) || 'Handcrafted Pakistani stone art from Taxila'
          });
        }
      }
      
      // Add additional images (up to 3 more for total of 4)
      if (product.images && Array.isArray(product.images)) {
        product.images.slice(0, 3).forEach(img => {
          const imageUrl = getImageUrl(img);
          if (imageUrl && imageUrl !== productImages[0]?.url) {
            productImages.push({
              url: imageUrl,
              title: `${product.seoTitle || product.title} - Additional View`,
              caption: product.imageAlt || 'Authentic Gandhara art from Taxila, Pakistan'
            });
          }
        });
      }

      return generateSitemapEntry(
        `/product/${product.slug}`,
        product.updatedAt ? product.updatedAt.toISOString() : new Date().toISOString(),
        'weekly',
        priority,
        productImages
      );
    });

    return productEntries;
  } catch (error) {
    console.error('❌ Error generating product sitemap:', error);
    return [];
  }
}

/**
 * Generate sitemap for visit places with images
 */
async function generateVisitPlacesSitemap() {
  console.log('🏛️ Generating visit places sitemap entries with images...');
  
  try {
    const visitPlaces = await VisitPlace.find({ 
      slug: { $exists: true, $ne: null, $ne: '' } 
    })
    .select('slug updatedAt name description image images')
    .lean();

    console.log(`✅ Found ${visitPlaces.length} visit places with slugs`);

    const visitPlaceEntries = visitPlaces.map(place => {
      // Prepare place images
      const placeImages = [];
      
      // Add main image
      if (place.image) {
        const imageUrl = getImageUrl(place.image);
        if (imageUrl) {
          placeImages.push({
            url: imageUrl,
            title: `${place.name} - Historic Site in Taxila`,
            caption: place.description?.substring(0, 100) || `Visit ${place.name} - UNESCO World Heritage Site in Taxila, Pakistan`
          });
        }
      }
      
      // Add additional images
      if (place.images && Array.isArray(place.images)) {
        place.images.slice(0, 2).forEach(img => {
          const imageUrl = getImageUrl(img);
          if (imageUrl && imageUrl !== placeImages[0]?.url) {
            placeImages.push({
              url: imageUrl,
              title: `${place.name} - Taxila Heritage Site`,
              caption: 'Ancient Gandhara civilization heritage site in Taxila, Pakistan'
            });
          }
        });
      }
      
      return generateSitemapEntry(
        `/visit/${place.slug}`,
        place.updatedAt ? place.updatedAt.toISOString() : new Date().toISOString(),
        'monthly',
        '0.7',
        placeImages
      );
    });

    return visitPlaceEntries;
  } catch (error) {
    console.error('❌ Error generating visit places sitemap:', error);
    return [];
  }
}

/**
 * Generate category pages sitemap
 */
function generateCategorySitemap() {
  console.log('📂 Generating category sitemap entries...');
  
  const categoryEntries = productCategories.map(category => {
    return generateSitemapEntry(
      `/products/${category.slug}`,
      new Date().toISOString(),
      'weekly',
      category.priority
    );
  });

  return categoryEntries;
}

/**
 * Generate static pages sitemap
 */
function generateStaticPagesSitemap() {
  console.log('📄 Generating static pages sitemap entries...');
  
  const staticEntries = staticPages.map(page => {
    return generateSitemapEntry(
      page.url,
      page.lastmod,
      page.changefreq,
      page.priority
    );
  });

  return staticEntries;
}

/**
 * Generate complete XML sitemap
 */
async function generateSitemap() {
  console.log('🗺️ Starting sitemap generation...');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gandhara-arts');
    console.log('✅ Connected to MongoDB');

    // Backup existing sitemap
    if (fs.existsSync(config.outputPath)) {
      fs.copyFileSync(config.outputPath, config.backupPath);
      console.log('✅ Backed up existing sitemap');
    }

    // Generate all sitemap sections
    const [productEntries, visitPlaceEntries, categoryEntries, staticEntries] = await Promise.all([
      generateProductSitemap(),
      generateVisitPlacesSitemap(),
      generateCategorySitemap(),
      generateStaticPagesSitemap()
    ]);

    // Combine all entries
    const allEntries = [
      ...staticEntries,
      ...categoryEntries,
      ...productEntries,
      ...visitPlaceEntries
    ];

    // Generate XML sitemap
    const sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allEntries.join('\n')}
</urlset>`;

    // Write sitemap to file
    fs.writeFileSync(config.outputPath, sitemapXML);
    
    console.log(`✅ Sitemap generated successfully!`);
    console.log(`📊 Total URLs: ${allEntries.length}`);
    console.log(`   - Static pages: ${staticEntries.length}`);
    console.log(`   - Category pages: ${categoryEntries.length}`);
    console.log(`   - Product pages: ${productEntries.length}`);
    console.log(`   - Visit place pages: ${visitPlaceEntries.length}`);
    console.log(`📁 Saved to: ${config.outputPath}`);

    // Generate robots.txt
    generateRobotsTxt();

  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    
    // Restore backup if exists
    if (fs.existsSync(config.backupPath)) {
      fs.copyFileSync(config.backupPath, config.outputPath);
      console.log('✅ Restored sitemap from backup');
    }
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

/**
 * Generate robots.txt file
 */
function generateRobotsTxt() {
  console.log('🤖 Generating robots.txt...');
  
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /uploads/temp/
Disallow: /*.json$
Disallow: /*?*utm_*
Disallow: /*?*fbclid*
Disallow: /*?*gclid*

# Allow access to CSS and JS files
Allow: /assets/
Allow: /static/
Allow: /*.css$
Allow: /*.js$
Allow: /*.jpg$
Allow: /*.png$
Allow: /*.gif$
Allow: /*.webp$

# Sitemap location
Sitemap: ${config.baseUrl}/sitemap.xml

# Crawl delay (be respectful)
Crawl-delay: 1

# Block common bad bots
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: SemrushBot
Disallow: /
`;

  fs.writeFileSync(config.robotsPath, robotsTxt);
  console.log(`✅ robots.txt generated at: ${config.robotsPath}`);
}

/**
 * Validate sitemap XML
 */
function validateSitemap() {
  try {
    const sitemapContent = fs.readFileSync(config.outputPath, 'utf8');
    
    // Basic XML validation
    if (!sitemapContent.includes('<?xml') || !sitemapContent.includes('</urlset>')) {
      throw new Error('Invalid XML structure');
    }
    
    // Count URLs
    const urlCount = (sitemapContent.match(/<url>/g) || []).length;
    
    if (urlCount === 0) {
      throw new Error('No URLs found in sitemap');
    }
    
    if (urlCount > 50000) {
      console.warn('⚠️  Warning: Sitemap contains more than 50,000 URLs. Consider splitting into multiple sitemaps.');
    }
    
    console.log(`✅ Sitemap validation passed - ${urlCount} URLs found`);
    return true;
    
  } catch (error) {
    console.error('❌ Sitemap validation failed:', error.message);
    return false;
  }
}

// Run the sitemap generation
if (require.main === module) {
  generateSitemap()
    .then(() => {
      if (validateSitemap()) {
        console.log('🎉 Sitemap generation completed successfully!');
        process.exit(0);
      } else {
        console.error('❌ Sitemap validation failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Sitemap generation failed:', error);
      process.exit(1);
    });
}

module.exports = {
  generateSitemap,
  validateSitemap,
  generateRobotsTxt
};