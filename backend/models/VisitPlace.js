const mongoose = require('mongoose');

const visitPlaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  /** Primary image path (uploads/...) — required unless `video` is set */
  image: { type: String, required: false },
  /** Optional tour promo video path (uploads/...) */
  video: { type: String, required: false },
  /** Featured / Cultural / Historical / Adventure (UI filter) */
  tourCategory: { type: String, trim: true, default: '' },
  
  // SEO: unique slug only when non-empty (see partial index below — NOT field-level unique:
  // MongoDB sparse indexes still index slug:null, causing E11000 duplicate { slug: null })
  slug: {
    type: String,
    lowercase: true,
    trim: true,
    maxlength: 100,
    validate: {
      validator(v) {
        return v == null || v === '' || /^[a-z0-9-]+$/.test(String(v));
      },
      message: 'invalid slug',
    },
    default: undefined,
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
  metaKeywords: [{ 
    type: String, 
    lowercase: true, 
    trim: true 
  }],
  
  // Location & Content Enhancement
  attractions: [String],
  location: {
    coordinates: [Number],
    address: String,
    district: String,
    province: String,
    country: { type: String, default: 'Pakistan' }
  },
  
  // SEO Analytics
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
  }
}, { timestamps: true });

visitPlaceSchema.pre('validate', function validateMedia(next) {
  if (!this.image && !this.video) {
    this.invalidate('image', 'Either image or video is required');
  }
  next();
});

// Never persist empty/null slug (avoids duplicate null in unique index)
visitPlaceSchema.pre('save', function stripEmptySlug(next) {
  if (this.slug === null || this.slug === undefined || String(this.slug).trim() === '') {
    this.set('slug', undefined);
  }
  next();
});

// Unique only for real slug strings — multiple docs may omit `slug` entirely
visitPlaceSchema.index(
  { slug: 1 },
  {
    unique: true,
    partialFilterExpression: {
      slug: { $exists: true, $type: 'string', $gt: '' },
    },
  }
);

module.exports = mongoose.model('VisitPlace', visitPlaceSchema);
