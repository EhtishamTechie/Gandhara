const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  addVisitPlace,
  getVisitPlaces,
  getVisitPlaceById,
  updateVisitPlace,
  deleteVisitPlace
} = require('../controllers/visitplaceController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  limits: { fileSize: 120 * 1024 * 1024 }, // 120MB — tour videos
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'image') {
      return /^image\//.test(file.mimetype)
        ? cb(null, true)
        : cb(new Error('Please upload a valid image file'));
    }
    // Video: accept any MIME — clients vary (MOV, MKV, etc.)
    cb(null, true);
  }
});

const uploadMedia = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]);

// Routes — register /all before /:id so "all" is not parsed as an id
router.post('/add', uploadMedia, addVisitPlace);
router.get('/all', getVisitPlaces);                          // Supports pagination via query params
router.get('/', getVisitPlaces);                             // Alternative route for paginated places
router.get('/:id', getVisitPlaceById);                       // Single tour / visit place
router.put('/:id', uploadMedia, updateVisitPlace);
router.delete('/:id', deleteVisitPlace);

module.exports = router;
