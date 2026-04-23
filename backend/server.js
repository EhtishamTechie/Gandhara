const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const compression = require('compression'); // PERFORMANCE: Add compression

dotenv.config();

const app = express();

// PERFORMANCE: Enable gzip/brotli compression for all responses
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Compression level (0-9, 6 is good balance)
  threshold: 1024 // Only compress responses larger than 1KB
}));

// Request logging middleware - only log API routes, skip static files
app.use((req, res, next) => {
  // Skip logging for static file requests (images, fonts, css, js, etc.)
  if (req.url.startsWith('/uploads/') || req.url.match(/\.(avif|webp|jpg|jpeg|png|gif|svg|ico|css|js|woff2?|ttf|otf|mp4|webm|map)(\?.*)?$/i)) {
    return next();
  }

  const timestamp = new Date().toISOString();
  console.log(`🌐 [${timestamp}] ${req.method} ${req.url}`);
  
  next();
});

// Middleware with increased limits
app.use(express.json({ 
    limit: '100mb',
    parameterLimit: 50000
}));
app.use(express.urlencoded({ 
    extended: true, 
    limit: '100mb',
    parameterLimit: 50000
}));

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'https://gandhara-arts-and-taxila-stone-crafts.com'],
  credentials: true
}));

// Import routes
const productRoutes = require('./routes/productRoutes');
const visitPlaceRoutes = require('./routes/visitplaceRoutes');
const masterRoutes = require('./routes/masterRoutes');
const authRoutes = require('./routes/authRoutes');
const sitemapRoutes = require('./routes/sitemapRoutes');
const bulkUploadRoutes = require('./routes/bulkUploadRoutes'); // NEW: Add bulk upload routes
const categoryOrderRoutes = require('./routes/categoryOrderRoutes');
// Section 3: category tree + sidebar settings (non-destructive additions)
const subcategoryRoutesModule = require('./routes/subcategoryRoutes');
const subcategoryRoutes = subcategoryRoutesModule;                // public router
const subcategoryAdminRoutes = subcategoryRoutesModule.adminRouter; // admin router
const sidebarSettingsRoutesModule = require('./routes/sidebarSettingsRoutes');
const sidebarSettingsRoutes = sidebarSettingsRoutesModule;                 // public router
const sidebarSettingsAdminRoutes = sidebarSettingsRoutesModule.adminRouter; // admin router
// Section 4: generic admin-controlled site media (hero slideshow,
// tour slides, about gallery, founder portrait, home product videos)
const siteMediaRoutesModule = require('./routes/siteMediaRoutes');
const siteMediaRoutes = siteMediaRoutesModule;                 // public router
const siteMediaAdminRoutes = siteMediaRoutesModule.adminRouter; // admin router

// Section 7: theme overrides (admin-editable CSS custom properties)
const themeSettingsRoutesModule = require('./routes/themeSettingsRoutes');
const themeSettingsRoutes = themeSettingsRoutesModule.publicRouter;      // public
const themeSettingsAdminRoutes = themeSettingsRoutesModule.adminRouter;  // admin

// Private tour booking form (tokenized links + admin inbox)
const tourInquiryRoutesModule = require('./routes/tourInquiryRoutes');

// Import auth middleware
const authMiddleware = require('./middleware/authMiddleware');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
const mastersDir = path.join(uploadsDir, 'masters');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(mastersDir)) {
  fs.mkdirSync(mastersDir, { recursive: true });
}

// Import image optimization middleware
const imageOptimizationMiddleware = require('./middleware/imageOptimizationMiddleware');
const apiCache = require('./middleware/apiCacheMiddleware');

// Serve static files with image optimization and aggressive caching
app.use('/uploads', imageOptimizationMiddleware, express.static(uploadsDir, {
  maxAge: '1y', // Cache for 1 year
  etag: true,
  lastModified: true,
  immutable: true,
  setHeaders: (res, path) => {
    // Set aggressive caching for images
    if (path.endsWith('.webp') || path.endsWith('.jpg') || path.endsWith('.png')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    // Cache videos for 1 month
    if (path.endsWith('.mp4')) {
      res.setHeader('Cache-Control', 'public, max-age=2592000');
    }
  }
}));

// SEO Routes (robots.txt, sitemaps) - Add these before other routes
app.use('/', sitemapRoutes);
console.log('SEO sitemap routes mounted');

// Public Routes (NO AUTH REQUIRED) - WITH CACHING
app.use('/api/products', apiCache(5 * 60 * 1000), productRoutes); // Cache for 5 minutes
console.log('Public product routes mounted at /api/products (cached)');

app.use('/api/visit-places', apiCache(10 * 60 * 1000), visitPlaceRoutes); // Cache for 10 minutes
console.log('Public visit place routes mounted at /api/visit-places (cached)');

app.use('/api/masters', apiCache(10 * 60 * 1000), masterRoutes); // Cache for 10 minutes
console.log('Public master routes mounted at /api/masters (cached)');

// Category Order (public GET, cached)
app.use('/api/category-order', apiCache(5 * 60 * 1000), categoryOrderRoutes);
console.log('Public category order routes mounted at /api/category-order');

// Section 3: public category tree + subcategories (cached 5 min)
app.use('/api/categories', apiCache(5 * 60 * 1000), subcategoryRoutes);
console.log('Public category tree routes mounted at /api/categories');

// Section 3: public sidebar settings (cached 5 min)
app.use('/api/sidebar-settings', apiCache(5 * 60 * 1000), sidebarSettingsRoutes);
console.log('Public sidebar settings route mounted at /api/sidebar-settings');

// Section 4: public site media (cached 5 min) — hero slides, tour
// slides, about gallery, founder portrait, home product videos.
app.use('/api/site-media', apiCache(5 * 60 * 1000), siteMediaRoutes);
console.log('Public site media routes mounted at /api/site-media');

// Section 7: public theme overrides (read-only)
app.use('/api/theme-settings', apiCache(5 * 60 * 1000), themeSettingsRoutes);
console.log('Public theme settings routes mounted at /api/theme-settings');

// Public: private tour booking form (validate token + submit — no cache)
app.use('/api/public/tour-booking', tourInquiryRoutesModule.publicRouter);
console.log('Public tour booking routes mounted at /api/public/tour-booking');

// Auth Routes (Login, Setup, Profile, etc.)
app.use('/api/auth', authRoutes);
console.log('Auth routes mounted at /api/auth');

// NEW: Bulk Upload Routes (AUTH REQUIRED) - Separate from existing product routes
app.use('/api/bulk-upload', authMiddleware, bulkUploadRoutes);
console.log('Protected bulk upload routes mounted at /api/bulk-upload');

// Protected Admin Routes (AUTH REQUIRED)
app.use('/api/admin/category-order', authMiddleware, categoryOrderRoutes);
console.log('Protected admin category order routes mounted at /api/admin/category-order');

app.use('/api/admin/products', authMiddleware, productRoutes);
console.log('Protected admin product routes mounted at /api/admin/products');

app.use('/api/admin/visit-places', authMiddleware, visitPlaceRoutes);
console.log('Protected admin visit place routes mounted at /api/admin/visit-places');

app.use('/api/admin/masters', authMiddleware, masterRoutes);
console.log('Protected admin master routes mounted at /api/admin/masters');

// Section 3: protected admin routes for subcategories + sidebar settings
app.use('/api/admin/subcategories', authMiddleware, subcategoryAdminRoutes);
console.log('Protected admin subcategory routes mounted at /api/admin/subcategories');

app.use('/api/admin/sidebar-settings', authMiddleware, sidebarSettingsAdminRoutes);
console.log('Protected admin sidebar settings routes mounted at /api/admin/sidebar-settings');

// Section 4: protected admin site media (upload/edit/reorder/delete)
app.use('/api/admin/site-media', authMiddleware, siteMediaAdminRoutes);
console.log('Protected admin site media routes mounted at /api/admin/site-media');

// Section 7: protected admin theme settings (update / reset)
app.use('/api/admin/theme-settings', authMiddleware, themeSettingsAdminRoutes);
console.log('Protected admin theme settings routes mounted at /api/admin/theme-settings');

// Private tour links + submission inbox
app.use('/api/admin/tour-inquiries', authMiddleware, tourInquiryRoutesModule.adminRouter);
console.log('Protected admin tour inquiries mounted at /api/admin/tour-inquiries');

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Gandhara API running successfully',
    timestamp: new Date().toISOString(),
    services: {
      products: 'active',
      visitPlaces: 'active',
      masters: 'active',
      auth: 'active',
      seo: 'active',
      bulkUpload: 'active' // NEW: Add bulk upload service status
    },
    endpoints: {
      auth: 'POST /api/auth/login, POST /api/auth/setup, GET /api/auth/profile',
      public: 'GET /api/products, /api/visit-places, /api/masters',
      protected: 'POST /api/admin/products/add, GET /api/admin/products, /api/admin/visit-places, /api/admin/masters',
      bulkUpload: 'POST /api/bulk-upload/bulk-images, POST /api/bulk-upload/bulk-zip (protected)', // NEW: Add bulk upload endpoints
      seo: 'GET /robots.txt, GET /image-sitemap.xml, GET /sitemap.xml'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler - must be LAST
app.use(/.*/, (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /api/health',
      'GET /robots.txt',
      'GET /image-sitemap.xml',
      'GET /sitemap.xml',
      'POST /api/auth/login',
      'POST /api/auth/setup',
      'GET /api/auth/profile',
      'GET /api/products',
      'GET /api/visit-places',
      'GET /api/masters',
      'POST /api/admin/products/add (protected)',
      'GET /api/admin/products (protected)',
      'GET /api/admin/visit-places (protected)',
      'GET /api/admin/masters (protected)',
      'POST /api/bulk-upload/bulk-images (protected)', // NEW: Add bulk upload routes to available routes
      'POST /api/bulk-upload/bulk-zip (protected)'
    ]
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected');
    console.log('Collections: products, visitplaces, masters, admins');

    // Visit places: E11000 duplicate { slug: null } — sparse unique still indexes null.
    // Fix data, drop old index, apply partial unique index (see VisitPlace model).
    try {
      const VisitPlace = require('./models/VisitPlace');

      const slugify = (str) => {
        const s = String(str || '')
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 80);
        return s || 'place';
      };

      const isValidSlug = (s) => typeof s === 'string' && /^[a-z0-9-]+$/.test(s) && s.length > 0;

      try {
        await VisitPlace.collection.dropIndex('slug_1');
      } catch (dropErr) {
        if (!String(dropErr.message || '').includes('index not found')) {
          console.warn('VisitPlace dropIndex slug_1:', dropErr.message);
        }
      }

      await VisitPlace.updateMany(
        { $or: [{ slug: null }, { slug: '' }] },
        { $unset: { slug: 1 } }
      );

      const allPlaces = await VisitPlace.find({});
      let assigned = 0;
      for (const p of allPlaces) {
        if (isValidSlug(p.slug)) {
          // eslint-disable-next-line no-continue
          continue;
        }
        let base = slugify(p.name);
        let slug = base;
        let n = 0;
        // eslint-disable-next-line no-await-in-loop
        while (await VisitPlace.findOne({ slug, _id: { $ne: p._id } })) {
          n += 1;
          slug = `${base}-${n}`;
        }
        p.slug = slug;
        // eslint-disable-next-line no-await-in-loop
        await p.save();
        assigned += 1;
      }
      if (assigned) {
        console.log(`VisitPlace: ensured unique slug for ${assigned} record(s)`);
      }

      await VisitPlace.syncIndexes();
      console.log('VisitPlace indexes synced (partial unique on slug)');
    } catch (e) {
      console.warn('VisitPlace startup migration:', e.message);
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '127.0.0.1', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Static files: /uploads`);
      console.log(`Admin Auth: /api/admin`);
      console.log(`Public: /api/products | /api/visit-places | /api/masters`);
      console.log(`Protected Admin: /api/admin/products | /api/admin/visit-places | /api/admin/masters`);
      console.log(`Bulk Upload: /api/bulk-upload (protected)`);
      console.log(`SEO: /robots.txt | /image-sitemap.xml | /sitemap.xml`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  });
