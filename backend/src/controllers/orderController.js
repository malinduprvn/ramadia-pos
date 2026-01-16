const Order = require('../models/Order');
const TableSession = require('../models/TableSession');
const MenuItem = require('../models/MenuItem');

exports.createOrder = async (req, res) => {
  try {
    const { sessionId, items } = req.body;
    const createdBy = req.user._id;

    // Validate session exists and is open
    const session = await TableSession.findById(sessionId);
    if (!session || session.status !== 'open') {
      return res.status(400).json({ message: 'Invalid or closed session' });
    }

    // Validate menu items and get current prices
    const validatedItems = [];
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem || !menuItem.available) {
        return res.status(400).json({ message: `Menu item ${item.name} is not available` });
      }
      
      validatedItems.push({
        menuItemId: item.menuItemId,
        name: menuItem.name,
        qty: item.qty,
        price: menuItem.price
      });
    }

    // Create order
    const order = await Order.create({
      sessionId,
      items: validatedItems,
      createdBy
    });

    // Populate the order
    await order.populate('createdBy', 'name');
    await order.populate('sessionId');

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      // Notify kitchen of new order
      io.to('kitchen').emit('new-order', order);
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getOrdersBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const orders = await Order.find({ sessionId })
      .populate('createdBy', 'name')
      .sort({ createdAt: 1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('sessionId', 'tableId')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'preparing', 'ready', 'served'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('createdBy', 'name').populate('sessionId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      // Notify kitchen of order update
      io.to('kitchen').emit('order-updated', order);
      
      // Notify waiters for this table
      if (order.sessionId && order.sessionId.tableId) {
        io.to(`table-${order.sessionId.tableId}`).emit('order-status-changed', order);
      }
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('sessionId')
      .populate('createdBy', 'name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};