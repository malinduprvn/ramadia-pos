const express = require('express');
const orderController = require('../controllers/orderController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Create order (waiter)
router.post('/', authorize('waiter'), orderController.createOrder);

// Get orders by session
router.get('/session/:sessionId', orderController.getOrdersBySession);

// Get all orders (kitchen, cashier, admin)
router.get('/', authorize('kitchen', 'cashier', 'admin', 'manager'), orderController.getAllOrders);

// Update order status (kitchen)
router.put('/:id/status', authorize('kitchen'), orderController.updateOrderStatus);

// Get single order
router.get('/:id', orderController.getOrder);

module.exports = router;