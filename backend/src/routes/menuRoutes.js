const express = require('express');
const menuController = require('../controllers/menuController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes (for customers/waiters)
router.get('/', menuController.getAllMenuItems);
router.get('/categories', menuController.getCategories);
router.get('/:id', menuController.getMenuItem);

// Admin/Manager only routes
router.use(auth);
router.use(authorize('admin', 'manager'));

router.post('/', menuController.createMenuItem);
router.put('/:id', menuController.updateMenuItem);
router.delete('/:id', menuController.deleteMenuItem);

module.exports = router;