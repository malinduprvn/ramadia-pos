const express = require('express');
const invoiceController = require('../controllers/invoiceController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Create invoice (cashier)
router.post('/', authorize('cashier'), invoiceController.createInvoice);

// Get invoice
router.get('/:id', invoiceController.getInvoice);

// Get invoices by session
router.get('/session/:sessionId', invoiceController.getInvoicesBySession);

// Update invoice (cashier)
router.put('/:id', authorize('cashier'), invoiceController.updateInvoice);

// Process payment (cashier)
router.post('/:invoiceId/payment', authorize('cashier'), invoiceController.processPayment);

// Get payments for invoice
router.get('/:invoiceId/payments', invoiceController.getPayments);

module.exports = router;