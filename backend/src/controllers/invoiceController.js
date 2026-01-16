const Invoice = require('../models/Invoice');
const Order = require('../models/Order');
const TableSession = require('../models/TableSession');
const Payment = require('../models/Payment');

exports.createInvoice = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const createdBy = req.user._id;

    // Validate session exists and is open
    const session = await TableSession.findById(sessionId);
    if (!session || session.status !== 'open') {
      return res.status(400).json({ message: 'Invalid or closed session' });
    }

    // Get all orders for this session
    const orders = await Order.find({ sessionId });
    if (orders.length === 0) {
      return res.status(400).json({ message: 'No orders found for this session' });
    }

    // Calculate total amount
    const totalAmount = orders.reduce((total, order) => total + order.totalAmount, 0);

    // Create invoice
    const invoice = await Invoice.create({
      sessionId,
      orders: orders.map(order => order._id),
      totalAmount,
      createdBy
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id)
      .populate('sessionId')
      .populate('orders')
      .populate('createdBy', 'name');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getInvoicesBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const invoices = await Invoice.find({ sessionId })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { tax, discount } = req.body;

    const invoice = await Invoice.findByIdAndUpdate(
      id,
      { tax, discount },
      { new: true, runValidators: true }
    );

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.processPayment = async (req, res) => {
  try {
    const { invoiceId, method, amount } = req.body;
    const processedBy = req.user._id;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Invoice is already paid' });
    }

    // Create payment
    const payment = await Payment.create({
      invoiceId,
      method,
      amount,
      processedBy
    });

    // Update invoice status
    invoice.paymentStatus = 'paid';
    await invoice.save();

    res.status(201).json({ payment, invoice });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const payments = await Payment.find({ invoiceId })
      .populate('processedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};