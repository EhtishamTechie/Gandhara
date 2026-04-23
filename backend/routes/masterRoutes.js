// Save this as: backend/routes/masterRoutes.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  addMaster,
  getMasters,
  getMasterById,
  updateMaster,
  deleteMaster,
  getMastersBySpecialty
} = require('../controllers/masterController');

const router = express.Router();

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/masters/'); // Separate folder for master images
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'master-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Routes with REAL controller functions
router.post('/add', upload.single('image'), addMaster);              // Add new master
router.get('/all', getMasters);                                      // Get all masters (supports pagination)
router.get('/', getMasters);                                         // Alternative route for paginated masters
router.get('/specialty/:specialty', getMastersBySpecialty);          // Get masters by specialty
router.get('/:id', getMasterById);                                   // Get single master
router.put('/:id', upload.single('image'), updateMaster);           // Update master
router.delete('/:id', deleteMaster);                                // Delete master

module.exports = router;