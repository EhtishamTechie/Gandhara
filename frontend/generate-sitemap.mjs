import fs from 'fs';
import axios from 'axios';

const generateSitemap = async () => {
  const baseUrl = 'https://gandhara-arts-and-taxila-stone-crafts.com';
  
  try {
    console.log('🔄 Generating sitemap...');
    
    // Fetch all products
    const productsRes = await axios.get('http://localhost:5000/api/products/all');
    const products = productsRes.data;
    
    // Extract unique categories
    const categories = [...new Set(products.flatMap(p => p.categories || []))];
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/products</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;

    // Add category pages
    categories.forEach(category => {
      const categorySlug = category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      sitemap += `
  <url>
    <loc>${baseUrl}/category/${categorySlug}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    sitemap += '\n</urlset>';
    
    // Write to public directory
    fs.writeFileSync('public/sitemap.xml', sitemap);
    
    console.log('✅ Sitemap generated successfully!');
    console.log(`📊 Generated URLs:`);
    console.log(`   • Homepage: 1`);
    console.log(`   • Products page: 1`);
    console.log(`   • Category pages: ${categories.length}`);
    console.log(`   • Total URLs: ${categories.length + 2}`);
    
    // Also copy to dist for immediate use
    if (fs.existsSync('dist')) {
      fs.writeFileSync('dist/sitemap.xml', sitemap);
      console.log('✅ Sitemap copied to dist/ directory');
    }
    
  } catch (error) {
    console.error('❌ Error generating sitemap:', error.message);
    console.log('💡 Make sure your backend server is running on localhost:5000');
  }
};

generateSitemap();
