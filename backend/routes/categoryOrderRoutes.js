const express = require('express');
const router = express.Router();
const { getCategoryOrder, updateCategoryOrder, renameCategory } = require('../controllers/categoryOrderController');

// GET  /api/category-order  — public (read the order)
router.get('/', getCategoryOrder);

// PUT  /api/category-order  — protected (update the order, auth added in server.js)
router.put('/', updateCategoryOrder);

// PUT  /api/category-order/rename  — protected (rename category in order + all products)
router.put('/rename', renameCategory);

module.exports = router;
