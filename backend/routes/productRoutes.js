const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  addProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  getProductsByCategory,
  searchProducts,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { getProductsGrouped } = require('../controllers/categoryOrderController');

// Multer config for image uploads with SEO-friendly filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    // Generate SEO-friendly filename
    const timestamp = Date.now();
    const originalName = file.originalname.toLowerCase();
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension)
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    cb(null, `${timestamp}-${baseName}${extension}`);
  },
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// ✅ FIXED: Specific routes MUST come before generic parameter routes
router.post('/add', upload.single('image'), addProduct);
router.get('/search', searchProducts);                        // Server-side search endpoint
router.get('/grouped', getProductsGrouped);                   // Products grouped by category order
router.get('/all', getAllProducts); // Now supports pagination via query params
router.get('/', getAllProducts);    // Alternative route for paginated products  
router.get('/category/:categoryName', getProductsByCategory);  // Category-based listing
router.get('/slug/:slug', getProductBySlug);                  // NEW: Slug-based lookup
router.get('/:id', getProductById);                           // ID or slug-based lookup (fallback)
router.put('/:id', upload.single('image'), updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;