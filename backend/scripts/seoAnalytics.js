/**
 * SEO Monitoring and Analytics Script for Gandhara Arts
 * Monitors SEO performance, generates reports, and provides optimization suggestions
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import models
const Product = require('../models/Product');
const VisitPlace = require('../models/VisitPlace');

/**
 * SEO Analytics Class
 */
class SEOAnalytics {
  constructor() {
    this.reportData = {
      generated: new Date().toISOString(),
      products: {},
      visitPlaces: {},
      overall: {},
      recommendations: []
    };
  }

  /**
   * Analyze product SEO performance
   */
  async analyzeProducts() {
    console.log('📊 Analyzing product SEO performance...');
    
    try {
      const products = await Product.find({})
        .select('name slug seoTitle seoDescription metaKeywords focusKeyword imageAlt seoScore viewCount category images')
        .lean();

      const analysis = {
        total: products.length,
        withSlugs: products.filter(p => p.slug).length,
        withSEOTitles: products.filter(p => p.seoTitle).length,
        withSEODescriptions: products.filter(p => p.seoDescription).length,
        withMetaKeywords: products.filter(p => p.metaKeywords && p.metaKeywords.length > 0).length,
        withFocusKeywords: products.filter(p => p.focusKeyword).length,
        withImageAlt: products.filter(p => p.imageAlt).length,
        averageSEOScore: products.reduce((sum, p) => sum + (p.seoScore || 0), 0) / products.length,
        byScoreRange: {
          excellent: products.filter(p => (p.seoScore || 0) >= 90).length,
          good: products.filter(p => (p.seoScore || 0) >= 70 && (p.seoScore || 0) < 90).length,
          needsWork: products.filter(p => (p.seoScore || 0) >= 50 && (p.seoScore || 0) < 70).length,
          poor: products.filter(p => (p.seoScore || 0) < 50).length
        },
        topPerformers: products
          .filter(p => p.seoScore >= 80)
          .sort((a, b) => (b.seoScore || 0) - (a.seoScore || 0))
          .slice(0, 5)
          .map(p => ({ name: p.name, slug: p.slug, score: p.seoScore, views: p.viewCount || 0 })),
        needsImprovement: products
          .filter(p => (p.seoScore || 0) < 70)
          .sort((a, b) => (a.seoScore || 0) - (b.seoScore || 0))
          .slice(0, 10)
          .map(p => ({ 
            name: p.name, 
            slug: p.slug, 
            score: p.seoScore || 0,
            issues: this.identifyProductIssues(p)
          }))
      };

      this.reportData.products = analysis;
      console.log(`✅ Analyzed ${products.length} products`);
      
      return analysis;
    } catch (error) {
      console.error('❌ Error analyzing products:', error);
      return null;
    }
  }

  /**
   * Identify specific SEO issues for a product
   */
  identifyProductIssues(product) {
    const issues = [];
    
    if (!product.slug) issues.push('Missing slug');
    if (!product.seoTitle) issues.push('Missing SEO title');
    if (!product.seoDescription) issues.push('Missing SEO description');
    if (!product.metaKeywords || product.metaKeywords.length === 0) issues.push('Missing meta keywords');
    if (!product.focusKeyword) issues.push('Missing focus keyword');
    if (!product.imageAlt) issues.push('Missing image alt text');
    if (!product.images || product.images.length === 0) issues.push('No images');
    
    // SEO title length check
    if (product.seoTitle && (product.seoTitle.length < 30 || product.seoTitle.length > 60)) {
      issues.push('SEO title length not optimal (30-60 chars)');
    }
    
    // SEO description length check
    if (product.seoDescription && (product.seoDescription.length < 120 || product.seoDescription.length > 160)) {
      issues.push('SEO description length not optimal (120-160 chars)');
    }
    
    return issues;
  }

  /**
   * Analyze visit places SEO performance
   */
  async analyzeVisitPlaces() {
    console.log('🏛️ Analyzing visit places SEO performance...');
    
    try {
      const visitPlaces = await VisitPlace.find({})
        .select('name slug seoTitle seoDescription metaKeywords seoScore viewCount')
        .lean();

      const analysis = {
        total: visitPlaces.length,
        withSlugs: visitPlaces.filter(vp => vp.slug).length,
        withSEOTitles: visitPlaces.filter(vp => vp.seoTitle).length,
        withSEODescriptions: visitPlaces.filter(vp => vp.seoDescription).length,
        averageSEOScore: visitPlaces.reduce((sum, vp) => sum + (vp.seoScore || 0), 0) / visitPlaces.length || 0
      };

      this.reportData.visitPlaces = analysis;
      console.log(`✅ Analyzed ${visitPlaces.length} visit places`);
      
      return analysis;
    } catch (error) {
      console.error('❌ Error analyzing visit places:', error);
      return null;
    }
  }

  /**
   * Generate SEO recommendations
   */
  generateRecommendations() {
    console.log('💡 Generating SEO recommendations...');
    
    const recommendations = [];
    const { products, visitPlaces } = this.reportData;

    // Product-specific recommendations
    if (products.withSlugs < products.total) {
      recommendations.push({
        type: 'critical',
        category: 'Products',
        issue: 'Missing slugs',
        description: `${products.total - products.withSlugs} products are missing SEO-friendly slugs`,
        action: 'Run slug generation script for products without slugs'
      });
    }

    if (products.withSEOTitles < products.total * 0.9) {
      recommendations.push({
        type: 'high',
        category: 'Products',
        issue: 'Missing SEO titles',
        description: `${products.total - products.withSEOTitles} products are missing SEO titles`,
        action: 'Generate SEO titles for products using auto-generation script'
      });
    }

    if (products.withSEODescriptions < products.total * 0.9) {
      recommendations.push({
        type: 'high',
        category: 'Products',
        issue: 'Missing SEO descriptions',
        description: `${products.total - products.withSEODescriptions} products are missing SEO descriptions`,
        action: 'Generate SEO descriptions for products'
      });
    }

    if (products.averageSEOScore < 70) {
      recommendations.push({
        type: 'medium',
        category: 'Overall',
        issue: 'Low average SEO score',
        description: `Average SEO score is ${products.averageSEOScore.toFixed(1)}, should be above 70`,
        action: 'Focus on improving SEO scores for products with scores below 70'
      });
    }

    if (products.withImageAlt < products.total * 0.8) {
      recommendations.push({
        type: 'medium',
        category: 'Accessibility',
        issue: 'Missing image alt text',
        description: `${products.total - products.withImageAlt} products are missing image alt text`,
        action: 'Add descriptive alt text to all product images'
      });
    }

    // Performance recommendations
    if (products.byScoreRange.poor > 0) {
      recommendations.push({
        type: 'high',
        category: 'Performance',
        issue: 'Products with poor SEO scores',
        description: `${products.byScoreRange.poor} products have SEO scores below 50`,
        action: 'Prioritize improving these products as they significantly impact overall SEO'
      });
    }

    // Technical recommendations
    recommendations.push({
      type: 'low',
      category: 'Technical',
      issue: 'Regular sitemap updates',
      description: 'Ensure sitemap is updated regularly with new products',
      action: 'Set up automated sitemap generation on product additions'
    });

    recommendations.push({
      type: 'low',
      category: 'Technical',
      issue: 'Schema markup',
      description: 'Ensure all pages have proper structured data',
      action: 'Verify schema markup is correctly implemented on all pages'
    });

    this.reportData.recommendations = recommendations;
    return recommendations;
  }

  /**
   * Generate keyword analysis
   */
  async analyzeKeywords() {
    console.log('🔍 Analyzing keyword usage...');
    
    try {
      const products = await Product.find({})
        .select('name seoTitle seoDescription metaKeywords focusKeyword category')
        .lean();

      const keywordAnalysis = {
        totalUniqueKeywords: new Set(),
        categoryKeywords: {},
        commonKeywords: {},
        focusKeywordUsage: {}
      };

      products.forEach(product => {
        // Collect all keywords
        if (product.metaKeywords) {
          product.metaKeywords.forEach(keyword => {
            keywordAnalysis.totalUniqueKeywords.add(keyword.toLowerCase());
            
            // Count keyword frequency
            if (!keywordAnalysis.commonKeywords[keyword.toLowerCase()]) {
              keywordAnalysis.commonKeywords[keyword.toLowerCase()] = 0;
            }
            keywordAnalysis.commonKeywords[keyword.toLowerCase()]++;
          });
        }

        // Focus keyword analysis
        if (product.focusKeyword) {
          const focusKey = product.focusKeyword.toLowerCase();
          if (!keywordAnalysis.focusKeywordUsage[focusKey]) {
            keywordAnalysis.focusKeywordUsage[focusKey] = 0;
          }
          keywordAnalysis.focusKeywordUsage[focusKey]++;
        }

        // Category-based keywords
        if (product.category) {
          if (!keywordAnalysis.categoryKeywords[product.category]) {
            keywordAnalysis.categoryKeywords[product.category] = new Set();
          }
          if (product.metaKeywords) {
            product.metaKeywords.forEach(keyword => {
              keywordAnalysis.categoryKeywords[product.category].add(keyword.toLowerCase());
            });
          }
        }
      });

      // Convert sets to arrays for reporting
      keywordAnalysis.totalUniqueKeywords = keywordAnalysis.totalUniqueKeywords.size;
      
      Object.keys(keywordAnalysis.categoryKeywords).forEach(category => {
        keywordAnalysis.categoryKeywords[category] = Array.from(keywordAnalysis.categoryKeywords[category]);
      });

      // Top keywords
      keywordAnalysis.topKeywords = Object.entries(keywordAnalysis.commonKeywords)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20)
        .map(([keyword, count]) => ({ keyword, count }));

      this.reportData.keywords = keywordAnalysis;
      return keywordAnalysis;
    } catch (error) {
      console.error('❌ Error analyzing keywords:', error);
      return null;
    }
  }

  /**
   * Generate comprehensive report
   */
  async generateReport() {
    console.log('📋 Generating comprehensive SEO report...');
    
    try {
      // Connect to database
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gandhara-arts');
      console.log('✅ Connected to MongoDB');

      // Run all analyses
      await Promise.all([
        this.analyzeProducts(),
        this.analyzeVisitPlaces(),
        this.analyzeKeywords()
      ]);

      // Generate recommendations
      this.generateRecommendations();

      // Calculate overall metrics
      this.reportData.overall = {
        totalSEOScore: this.reportData.products.averageSEOScore,
        seoHealthGrade: this.calculateSEOGrade(this.reportData.products.averageSEOScore),
        criticalIssues: this.reportData.recommendations.filter(r => r.type === 'critical').length,
        highPriorityIssues: this.reportData.recommendations.filter(r => r.type === 'high').length,
        totalRecommendations: this.reportData.recommendations.length
      };

      // Save report
      const reportPath = path.join(__dirname, '../reports');
      if (!fs.existsSync(reportPath)) {
        fs.mkdirSync(reportPath, { recursive: true });
      }

      const reportFile = path.join(reportPath, `seo-report-${new Date().toISOString().split('T')[0]}.json`);
      fs.writeFileSync(reportFile, JSON.stringify(this.reportData, null, 2));

      console.log(`✅ SEO report generated: ${reportFile}`);
      
      // Generate human-readable summary
      this.generateSummary();

      return this.reportData;
    } catch (error) {
      console.error('❌ Error generating report:', error);
      throw error;
    } finally {
      await mongoose.disconnect();
    }
  }

  /**
   * Calculate SEO grade based on score
   */
  calculateSEOGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }

  /**
   * Generate human-readable summary
   */
  generateSummary() {
    console.log('\n🎯 === SEO PERFORMANCE SUMMARY ===');
    console.log(`Generated: ${this.reportData.generated}`);
    console.log(`\n📊 OVERALL PERFORMANCE:`);
    console.log(`   SEO Health Grade: ${this.reportData.overall.seoHealthGrade}`);
    console.log(`   Average SEO Score: ${this.reportData.products.averageSEOScore.toFixed(1)}/100`);
    console.log(`   Critical Issues: ${this.reportData.overall.criticalIssues}`);
    console.log(`   High Priority Issues: ${this.reportData.overall.highPriorityIssues}`);

    console.log(`\n📦 PRODUCTS (${this.reportData.products.total} total):`);
    console.log(`   With SEO Slugs: ${this.reportData.products.withSlugs}/${this.reportData.products.total} (${((this.reportData.products.withSlugs/this.reportData.products.total)*100).toFixed(1)}%)`);
    console.log(`   With SEO Titles: ${this.reportData.products.withSEOTitles}/${this.reportData.products.total} (${((this.reportData.products.withSEOTitles/this.reportData.products.total)*100).toFixed(1)}%)`);
    console.log(`   With SEO Descriptions: ${this.reportData.products.withSEODescriptions}/${this.reportData.products.total} (${((this.reportData.products.withSEODescriptions/this.reportData.products.total)*100).toFixed(1)}%)`);

    console.log(`\n📈 SCORE DISTRIBUTION:`);
    console.log(`   Excellent (90+): ${this.reportData.products.byScoreRange.excellent}`);
    console.log(`   Good (70-89): ${this.reportData.products.byScoreRange.good}`);
    console.log(`   Needs Work (50-69): ${this.reportData.products.byScoreRange.needsWork}`);
    console.log(`   Poor (<50): ${this.reportData.products.byScoreRange.poor}`);

    console.log(`\n🏆 TOP PERFORMERS:`);
    this.reportData.products.topPerformers.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - Score: ${product.score} (Views: ${product.views})`);
    });

    console.log(`\n⚠️  PRIORITY RECOMMENDATIONS:`);
    const criticalAndHigh = this.reportData.recommendations.filter(r => r.type === 'critical' || r.type === 'high');
    criticalAndHigh.slice(0, 5).forEach((rec, index) => {
      console.log(`   ${index + 1}. [${rec.type.toUpperCase()}] ${rec.issue}: ${rec.description}`);
    });

    if (this.reportData.keywords) {
      console.log(`\n🔍 KEYWORD INSIGHTS:`);
      console.log(`   Total Unique Keywords: ${this.reportData.keywords.totalUniqueKeywords}`);
      console.log(`   Top Keywords: ${this.reportData.keywords.topKeywords.slice(0, 5).map(k => `${k.keyword} (${k.count})`).join(', ')}`);
    }

    console.log(`\n📊 Full report saved to backend/reports/`);
    console.log('🎯 === END SUMMARY ===\n');
  }
}

// CLI execution
if (require.main === module) {
  const analytics = new SEOAnalytics();
  
  analytics.generateReport()
    .then(() => {
      console.log('🎉 SEO analysis completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ SEO analysis failed:', error);
      process.exit(1);
    });
}

module.exports = SEOAnalytics;