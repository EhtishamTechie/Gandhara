// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Detailed logging middleware for auth routes
router.use((req, res, next) => {
  console.log('\n🔐 AUTH ROUTE HIT');
  console.log('Full Path:', req.path);
  console.log('Method:', req.method);
  console.log('Original URL:', req.originalUrl);
  console.log('Base URL:', req.baseUrl);
  console.log('Headers:', {
    'content-type': req.headers['content-type'],
    'origin': req.headers.origin,
    'referer': req.headers.referer,
    'user-agent': req.headers['user-agent']?.substring(0, 50) + '...'
  });
  console.log('Body:', req.body);
  console.log('Query:', req.query);
  console.log('================\n');
  next();
});

// Public routes
router.post('/login', authController.loginAdmin);
router.post('/setup', authController.createInitialAdmin);

// Protected routes (require authentication)
router.get('/profile', authMiddleware, authController.getAdminProfile);
router.put('/change-password', authMiddleware, authController.changePassword);

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Auth routes working',
    timestamp: new Date().toISOString(),
    endpoint: '/api/auth/test'
  });
});

// Another test route for debugging
router.post('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Auth POST test endpoint working',
    timestamp: new Date().toISOString(),
    endpoint: '/api/auth/test',
    receivedBody: req.body
  });
});

module.exports = router;