const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    keywords: { type: [String], required: true },  // Changed from String to Array
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    categories: [{ type: String, required: true }],
    
    // SEO Core Fields
    slug: { 
        type: String, 
        unique: true, 
        lowercase: true,
        trim: true,
        match: /^[a-z0-9-]+$/,
        maxlength: 100
    },
    seoTitle: { 
        type: String, 
        maxlength: 60,
        trim: true
    },
    seoDescription: { 
        type: String, 
        maxlength: 160,
        trim: true
    },
    imageAlt: { 
        type: String, 
        trim: true,
        maxlength: 125
    },
    
    // Meta Fields
    metaKeywords: [{ 
        type: String, 
        lowercase: true, 
        trim: true 
    }],
    canonicalUrl: { 
        type: String,
        trim: true
    },
    focusKeyword: { 
        type: String, 
        lowercase: true, 
        trim: true,
        maxlength: 50
    },
    
    // Enhanced Content
    shortDescription: { 
        type: String, 
        maxlength: 200,
        trim: true
    },
    
    // SEO Analytics & Status
    seoScore: { 
        type: Number, 
        default: 0, 
        min: 0, 
        max: 100 
    },
    lastSEOUpdate: { 
        type: Date, 
        default: Date.now 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    isFeatured: { 
        type: Boolean, 
        default: false 
    },
    // Home Featured spotlight controls (admin-managed)
    // - featuredUntil: when set to a future date, this product is eligible to be highlighted prominently.
    // - isSoldOut: when true, the product should appear as sold out and yield the spotlight to the next.
    featuredUntil: {
        type: Date,
        default: null
    },
    isSoldOut: {
        type: Boolean,
        default: false
    },
    soldOutAt: {
        type: Date,
        default: null
    },
    viewCount: { 
        type: Number, 
        default: 0 
    }
  }, {
    timestamps: true
  });

// ============================================
// PERFORMANCE INDEXES - Critical for speed!
// ============================================

// 1. Category searches (most common query) - speeds up category pages
productSchema.index({ categories: 1, createdAt: -1 });

// 2. Slug lookups (SEO-friendly URLs) - speeds up product detail pages
productSchema.index({ slug: 1, isActive: 1 });

// 3. Active/Featured products - speeds up homepage and featured sections
productSchema.index({ isActive: 1, isFeatured: 1, createdAt: -1 });

// 3b. Spotlight/sold-out queue - speeds up homepage featured rotation
productSchema.index({ isActive: 1, featuredUntil: -1, isSoldOut: 1, createdAt: -1 });

// 4. Search and filtering - speeds up product searches
productSchema.index({ title: 'text', description: 'text', keywords: 'text' });

// 5. View count sorting - speeds up popular products queries
productSchema.index({ viewCount: -1, isActive: 1 });

// Define the Product model using the schema
const Product = mongoose.model('Product', productSchema);

// Export the Product model
module.exports = Product;
