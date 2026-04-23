const express = require('express');
const router = express.Router();

const {
  listTopLevelCategories,
  getCategoryTree,
  getSubcategoriesOfCategory,
  adminListSubcategories,
  adminCreateSubcategory,
  adminUpdateSubcategory,
  adminDeleteSubcategory,
  adminReorderSubcategories
} = require('../controllers/subcategoryController');

// ----------------------------------------------------------------
// PUBLIC routes (mounted at /api/categories in server.js)
// ----------------------------------------------------------------
// Order matters: specific paths before parameter paths.
router.get('/tree', getCategoryTree);
router.get('/:parentName/children', getSubcategoriesOfCategory);
router.get('/', listTopLevelCategories);

// ----------------------------------------------------------------
// ADMIN routes (mounted at /api/admin/subcategories in server.js,
// behind authMiddleware). We expose them as a second small router
// so the auth is applied at the mount point, not per-route.
// ----------------------------------------------------------------
const adminRouter = express.Router();
// Specific paths first.
adminRouter.put('/reorder', adminReorderSubcategories);
adminRouter.get('/', adminListSubcategories);
adminRouter.post('/', adminCreateSubcategory);
adminRouter.put('/:id', adminUpdateSubcategory);
adminRouter.delete('/:id', adminDeleteSubcategory);

module.exports = router;
module.exports.adminRouter = adminRouter;
