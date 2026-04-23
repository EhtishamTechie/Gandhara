const express = require('express');
const multer = require('multer');
const AdmZip = require('adm-zip');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const Product = require('../models/Product'); // Uses your existing Product model
const { generateImageVariants } = require('../utils/imageProcessor');

const router = express.Router();

// Configure multer for BULK uploads (separate from your existing single upload)
const storage = multer.memoryStorage();
const bulkUpload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 50 // Maximum 50 files at once
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip' ||
        file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files and images are allowed'), false);
    }
  }
});

// Helper function to generate title from filename
const generateTitle = (filename) => {
  const nameWithoutExt = path.parse(filename).name;

  // Remove common separators and convert to words
  const words = nameWithoutExt
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

  return words.join(' ');
};

// Helper function to generate keywords from filename
const generateKeywords = (filename) => {
  const nameWithoutExt = path.parse(filename).name;

  const keywords = nameWithoutExt
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(' ')
    .filter(word => word.length > 2); // Remove short words

  return keywords;
};

// Helper function to optimize image
const optimizeImage = async (buffer, filename) => {
  try {
    const optimized = await sharp(buffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 85,
        progressive: true
      })
      .toBuffer();

    return optimized;
  } catch (error) {
    console.error(`Error optimizing image ${filename}:`, error);
    return buffer; // Return original if optimization fails
  }
};

// Helper function to save image file (using your existing uploads structure)
const saveImageFile = async (buffer, filename, timestamp) => {
  const uploadsDir = path.join(__dirname, '../uploads');

  // Ensure uploads directory exists
  await fs.mkdir(uploadsDir, { recursive: true });

  // Generate unique filename (similar to your existing pattern)
  const ext = path.extname(filename);
  const uniqueFilename = `bulk_${timestamp}_${path.parse(filename).name}${ext}`;
  const filePath = path.join(uploadsDir, uniqueFilename);

  await fs.writeFile(filePath, buffer);

  // Fire-and-forget: generate AVIF/WebP variants
  const { generateImageVariants } = require('../utils/imageProcessor');
  generateImageVariants(`uploads/${uniqueFilename}`).catch(err => 
    console.error('Bulk image processing failed:', err.message)
  );

  // Return path format similar to your existing system
  return `uploads/${uniqueFilename}`;
};

// ROUTE 1: Upload multiple images directly (SEPARATE from your existing /add route)
router.post('/bulk-images', bulkUpload.array('images', 50), async (req, res) => {
  try {
    const { files } = req;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Get user-selected categories from request
    let userSelectedCategories = [];
    try {
      userSelectedCategories = JSON.parse(req.body.categories || '[]');
    } catch (error) {
      console.error('Error parsing categories:', error);
      userSelectedCategories = [];
    }

    if (!userSelectedCategories.length) {
      return res.status(400).json({ error: 'Please select at least one category' });
    }

    const results = [];
    const errors = [];

    for (const file of files) {
      try {
        // Generate product data from filename using YOUR schema
        const title = generateTitle(file.originalname);
        const keywords = generateKeywords(file.originalname);
        const description = `${title} - High quality handcrafted product from Gandhara Arts`;
        const price = 0; // Default price - will need manual update

        // Use USER-SELECTED categories instead of auto-detecting
        const categories = userSelectedCategories;

        // FIXED: Process and save image FIRST, then create product with image path
        const timestamp = Date.now();
        const optimizedBuffer = await optimizeImage(file.buffer, file.originalname);
        const imagePath = await saveImageFile(optimizedBuffer, file.originalname, timestamp);

        // Create product using YOUR existing Product model WITH image path
        const product = new Product({
          title,
          keywords,
          description,
          price,
          categories,
          image: imagePath // FIXED: Set image path before saving
        });

        const savedProduct = await product.save();

        results.push({
          id: savedProduct._id,
          title: savedProduct.title,
          categories: savedProduct.categories,
          keywords: savedProduct.keywords,
          imagePath,
          originalFilename: file.originalname
        });

      } catch (error) {
        console.error(`Error processing ${file.originalname}:`, error);
        errors.push({
          filename: file.originalname,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Processed ${results.length} products successfully`,
      results,
      errors,
      total: files.length,
      successful: results.length,
      failed: errors.length
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ error: 'Server error during bulk upload' });
  }
});

// ROUTE 2: Upload ZIP file containing images (SEPARATE feature)
router.post('/bulk-zip', bulkUpload.single('zipFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No ZIP file uploaded' });
    }

    // Get user-selected categories from request
    let userSelectedCategories = [];
    try {
      userSelectedCategories = JSON.parse(req.body.categories || '[]');
    } catch (error) {
      console.error('Error parsing categories:', error);
      userSelectedCategories = [];
    }

    if (!userSelectedCategories.length) {
      return res.status(400).json({ error: 'Please select at least one category' });
    }

    const zip = new AdmZip(req.file.buffer);
    const entries = zip.getEntries();

    const results = [];
    const errors = [];
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

    for (const entry of entries) {
      if (entry.isDirectory) continue;

      const ext = path.extname(entry.entryName).toLowerCase();
      if (!imageExtensions.includes(ext)) continue;

      try {
        const imageBuffer = entry.getData();
        const filename = path.basename(entry.entryName);

        // Generate product data using YOUR schema
        const title = generateTitle(filename);
        const keywords = generateKeywords(filename);
        const description = `${title} - High quality handcrafted product from Gandhara Arts`;
        const price = 0; // Default price

        // Use USER-SELECTED categories instead of auto-detecting
        const categories = userSelectedCategories;

        // FIXED: Process and save image FIRST, then create product with image path
        const timestamp = Date.now();
        const optimizedBuffer = await optimizeImage(imageBuffer, filename);
        const imagePath = await saveImageFile(optimizedBuffer, filename, timestamp);

        // Create product using YOUR existing model WITH image path
        const product = new Product({
          title,
          keywords,
          description,
          price,
          categories,
          image: imagePath // FIXED: Set image path before saving
        });

        const savedProduct = await product.save();

        results.push({
          id: savedProduct._id,
          title: savedProduct.title,
          categories: savedProduct.categories,
          keywords: savedProduct.keywords,
          imagePath,
          originalPath: entry.entryName
        });

      } catch (error) {
        console.error(`Error processing ${entry.entryName}:`, error);
        errors.push({
          filename: entry.entryName,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Processed ${results.length} products from ZIP file`,
      results,
      errors,
      total: entries.filter(e => !e.isDirectory && imageExtensions.includes(path.extname(e.entryName).toLowerCase())).length,
      successful: results.length,
      failed: errors.length
    });

  } catch (error) {
    console.error('ZIP upload error:', error);
    res.status(500).json({ error: 'Server error during ZIP processing' });
  }
});

// ROUTE 3: Get bulk upload status (for future job queue implementation)
router.get('/status/:jobId', (req, res) => {
  res.json({
    jobId: req.params.jobId,
    status: 'completed',
    message: 'Bulk upload completed'
  });
});

module.exports = router;

