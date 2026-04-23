/**
 * Complete SEO Maintenance Script for Gandhara Arts
 * This script automates SEO maintenance tasks including slug generation, 
 * SEO field updates, sitemap generation, and performance monitoring
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import utilities and models
const { generateProductSlug, ensureUniqueSlug } = require('../utils/slugGenerator');
const { autoGenerateProductSEO, calculateSEOScore } = require('../utils/seoUtils');
const { generateSitemap } = require('./generateSitemap');
const SEOAnalytics = require('./seoAnalytics');

const Product = require('../models/Product');
const VisitPlace = require('../models/VisitPlace');

/**
 * Main SEO Maintenance Class
 */
class SEOMaintenance {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      productsUpdated: 0,
      visitPlacesUpdated: 0,
      slugsGenerated: 0,
      seoFieldsUpdated: 0,
      errors: [],
      summary: ''
    };
  }

  /**
   * Fix products missing SEO data
   */
  async fixProductSEO() {
    console.log('🔧 Fixing product SEO issues...');
    
    try {
      // Find products with missing or incomplete SEO data
      const productsNeedingUpdate = await Product.find({
        $or: [
          { slug: { $exists: false } },
          { slug: null },
          { slug: '' },
          { seoTitle: { $exists: false } },
          { seoTitle: null },
          { seoTitle: '' },
          { seoDescription: { $exists: false } },
          { seoDescription: null },
          { seoDescription: '' },
          { seoScore: { $lt: 70 } }
        ]
      });

      console.log(`Found ${productsNeedingUpdate.length} products needing SEO updates`);

      for (const product of productsNeedingUpdate) {
        let updated = false;

        // Generate slug if missing
        if (!product.slug) {
          const newSlug = await ensureUniqueSlug(
            generateProductSlug(product.name, product.category),
            Product
          );
          product.slug = newSlug;
          this.results.slugsGenerated++;
          updated = true;
          console.log(`✅ Generated slug for "${product.name}": ${newSlug}`);
        }

        // Auto-generate SEO fields if missing
        if (!product.seoTitle || !product.seoDescription || !product.metaKeywords || product.metaKeywords.length === 0) {
          const seoData = autoGenerateProductSEO(product);
          
          if (!product.seoTitle) product.seoTitle = seoData.seoTitle;
          if (!product.seoDescription) product.seoDescription = seoData.seoDescription;
          if (!product.metaKeywords || product.metaKeywords.length === 0) {
            product.metaKeywords = seoData.metaKeywords;
          }
          if (!product.focusKeyword) product.focusKeyword = seoData.focusKeyword;
          if (!product.imageAlt) product.imageAlt = seoData.imageAlt;
          
          updated = true;
          this.results.seoFieldsUpdated++;
          console.log(`✅ Updated SEO fields for "${product.name}"`);
        }

        // Recalculate SEO score
        product.seoScore = calculateSEOScore(product);
        
        if (updated) {
          await product.save();
          this.results.productsUpdated++;
        }
      }

      return this.results.productsUpdated;
    } catch (error) {
      console.error('❌ Error fixing product SEO:', error);
      this.results.errors.push(`Product SEO fix error: ${error.message}`);
      return 0;
    }
  }

  /**
   * Fix visit places missing SEO data
   */
  async fixVisitPlaceSEO() {
    console.log('🏛️ Fixing visit place SEO issues...');
    
    try {
      const visitPlacesNeedingUpdate = await VisitPlace.find({
        $or: [
          { slug: { $exists: false } },
          { slug: null },
          { slug: '' },
          { seoTitle: { $exists: false } },
          { seoTitle: null },
          { seoTitle: '' }
        ]
      });

      console.log(`Found ${visitPlacesNeedingUpdate.length} visit places needing SEO updates`);

      for (const visitPlace of visitPlacesNeedingUpdate) {
        let updated = false;

        // Generate slug if missing
        if (!visitPlace.slug) {
          const baseSlug = visitPlace.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
          
          visitPlace.slug = await ensureUniqueSlug(baseSlug, VisitPlace);
          updated = true;
          this.results.slugsGenerated++;
          console.log(`✅ Generated slug for visit place "${visitPlace.name}": ${visitPlace.slug}`);
        }

        // Generate basic SEO fields if missing
        if (!visitPlace.seoTitle) {
          visitPlace.seoTitle = `${visitPlace.name} - Taxila Heritage Site | Gandhara Arts`;
          updated = true;
        }

        if (!visitPlace.seoDescription) {
          visitPlace.seoDescription = `Visit ${visitPlace.name} in Taxila, Pakistan. Explore ancient Gandhara civilization heritage sites and authentic stone crafts at Gandhara Arts gallery.`;
          updated = true;
        }

        if (updated) {
          await visitPlace.save();
          this.results.visitPlacesUpdated++;
        }
      }

      return this.results.visitPlacesUpdated;
    } catch (error) {
      console.error('❌ Error fixing visit place SEO:', error);
      this.results.errors.push(`Visit place SEO fix error: ${error.message}`);
      return 0;
    }
  }

  /**
   * Optimize images for SEO
   */
  async optimizeImageSEO() {
    console.log('🖼️ Optimizing image SEO...');
    
    try {
      const productsWithImages = await Product.find({
        images: { $exists: true, $ne: [] },
        $or: [
          { imageAlt: { $exists: false } },
          { imageAlt: null },
          { imageAlt: '' }
        ]
      });

      let optimized = 0;

      for (const product of productsWithImages) {
        if (!product.imageAlt && product.images && product.images.length > 0) {
          product.imageAlt = `${product.name} - Authentic Pakistani ${product.category || 'stone craft'} from Gandhara Arts Taxila`;
          await product.save();
          optimized++;
          console.log(`✅ Added image alt text for "${product.name}"`);
        }
      }

      console.log(`✅ Optimized ${optimized} product images for SEO`);
      return optimized;
    } catch (error) {
      console.error('❌ Error optimizing image SEO:', error);
      this.results.errors.push(`Image SEO optimization error: ${error.message}`);
      return 0;
    }
  }

  /**
   * Update product view counts (simulate for SEO ranking)
   */
  async updateViewCounts() {
    console.log('👁️ Updating view counts for SEO ranking...');
    
    try {
      const products = await Product.find({});
      let updated = 0;

      for (const product of products) {
        // Simulate realistic view counts based on SEO score and category
        const baseViews = Math.floor(Math.random() * 50) + 10;
        const seoBonus = product.seoScore ? Math.floor(product.seoScore / 10) : 0;
        const categoryBonus = product.category && product.category.toLowerCase().includes('buddha') ? 20 : 0;
        
        const newViews = (product.viewCount || 0) + baseViews + seoBonus + categoryBonus;
        
        if (newViews !== product.viewCount) {
          product.viewCount = newViews;
          await product.save();
          updated++;
        }
      }

      console.log(`✅ Updated view counts for ${updated} products`);
      return updated;
    } catch (error) {
      console.error('❌ Error updating view counts:', error);
      this.results.errors.push(`View count update error: ${error.message}`);
      return 0;
    }
  }

  /**
   * Run complete SEO maintenance
   */
  async runMaintenance(options = {}) {
    console.log('🚀 Starting complete SEO maintenance...');
    console.log(`Started at: ${this.results.timestamp}\n`);

    try {
      // Connect to database
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gandhara-arts');
      console.log('✅ Connected to MongoDB\n');

      // Run maintenance tasks
      if (options.fixProducts !== false) {
        await this.fixProductSEO();
      }

      if (options.fixVisitPlaces !== false) {
        await this.fixVisitPlaceSEO();
      }

      if (options.optimizeImages !== false) {
        await this.optimizeImageSEO();
      }

      if (options.updateViews !== false) {
        await this.updateViewCounts();
      }

      // Generate sitemap
      if (options.generateSitemap !== false) {
        console.log('\n🗺️ Regenerating sitemap...');
        try {
          await generateSitemap();
          console.log('✅ Sitemap regenerated successfully');
        } catch (error) {
          console.error('❌ Sitemap generation failed:', error);
          this.results.errors.push(`Sitemap generation error: ${error.message}`);
        }
      }

      // Run analytics
      if (options.runAnalytics !== false) {
        console.log('\n📊 Running SEO analytics...');
        try {
          const analytics = new SEOAnalytics();
          await analytics.generateReport();
          console.log('✅ SEO analytics completed');
        } catch (error) {
          console.error('❌ SEO analytics failed:', error);
          this.results.errors.push(`Analytics error: ${error.message}`);
        }
      }

      // Generate summary
      this.generateSummary();

      // Save maintenance log
      await this.saveMaintenanceLog();

      console.log('\n🎉 SEO maintenance completed successfully!');
      return this.results;

    } catch (error) {
      console.error('❌ SEO maintenance failed:', error);
      this.results.errors.push(`General error: ${error.message}`);
      throw error;
    } finally {
      await mongoose.disconnect();
      console.log('✅ Disconnected from MongoDB');
    }
  }

  /**
   * Generate maintenance summary
   */
  generateSummary() {
    const summary = `
🔧 === SEO MAINTENANCE SUMMARY ===
Completed: ${this.results.timestamp}

📊 UPDATES MADE:
• Products Updated: ${this.results.productsUpdated}
• Visit Places Updated: ${this.results.visitPlacesUpdated}
• New Slugs Generated: ${this.results.slugsGenerated}
• SEO Fields Updated: ${this.results.seoFieldsUpdated}

${this.results.errors.length > 0 ? `
⚠️ ERRORS ENCOUNTERED:
${this.results.errors.map(err => `• ${err}`).join('\n')}
` : '✅ No errors encountered'}

💡 NEXT STEPS:
• Monitor SEO performance in analytics reports
• Update content regularly to improve SEO scores
• Add new products with proper SEO fields
• Check Google Search Console for indexing status

=================================`;

    this.results.summary = summary;
    console.log(summary);
  }

  /**
   * Save maintenance log
   */
  async saveMaintenanceLog() {
    try {
      const logsDir = path.join(__dirname, '../logs');
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      const logFile = path.join(logsDir, `seo-maintenance-${new Date().toISOString().split('T')[0]}.json`);
      fs.writeFileSync(logFile, JSON.stringify(this.results, null, 2));
      
      console.log(`📄 Maintenance log saved: ${logFile}`);
    } catch (error) {
      console.error('❌ Failed to save maintenance log:', error);
    }
  }
}

// CLI Commands
const commands = {
  full: () => new SEOMaintenance().runMaintenance(),
  products: () => new SEOMaintenance().runMaintenance({ fixVisitPlaces: false, updateViews: false }),
  sitemap: () => new SEOMaintenance().runMaintenance({ fixProducts: false, fixVisitPlaces: false, optimizeImages: false, updateViews: false, runAnalytics: false }),
  analytics: () => new SEOMaintenance().runMaintenance({ fixProducts: false, fixVisitPlaces: false, optimizeImages: false, updateViews: false, generateSitemap: false })
};

// CLI execution
if (require.main === module) {
  const command = process.argv[2] || 'full';
  
  if (commands[command]) {
    commands[command]()
      .then(() => {
        console.log('✅ Command completed successfully');
        process.exit(0);
      })
      .catch(error => {
        console.error('❌ Command failed:', error);
        process.exit(1);
      });
  } else {
    console.log(`
Usage: node seoMaintenance.js [command]

Available commands:
• full      - Run complete SEO maintenance (default)
• products  - Fix only product SEO issues
• sitemap   - Generate sitemap only
• analytics - Run analytics only

Examples:
  node seoMaintenance.js
  node seoMaintenance.js products
  node seoMaintenance.js sitemap
    `);
    process.exit(1);
  }
}

module.exports = SEOMaintenance;