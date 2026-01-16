const express = require('express');
const tableController = require('../controllers/tableController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get all tables
router.get('/', tableController.getAllTables);

// Admin/Manager only routes
router.post('/', authorize('admin', 'manager'), tableController.createTable);
router.put('/:id', authorize('admin', 'manager'), tableController.updateTable);
router.delete('/:id', authorize('admin', 'manager'), tableController.deleteTable);

// Waiter routes
router.post('/session/open', authorize('waiter'), tableController.openSession);
router.put('/session/:sessionId/close', authorize('cashier'), tableController.closeSession);

// Get table sessions
router.get('/:tableId/sessions', tableController.getTableSessions);

module.exports = router;