const express = require('express');
const router = express.Router();
const { getCategoryOrder, updateCategoryOrder, renameCategory, deleteCategory } = require('../controllers/categoryOrderController');

// GET  /api/category-order  — public (read the order)
router.get('/', getCategoryOrder);

// PUT  /api/category-order  — protected (update the order, auth added in server.js)
router.put('/', updateCategoryOrder);

// PUT  /api/category-order/rename  — protected (rename category in order + all products)
router.put('/rename', renameCategory);

// DELETE /api/admin/category-order/:categoryName — protected (delete category completely)
router.delete('/:categoryName', deleteCategory);
router.delete('/', deleteCategory);

module.exports = router;
