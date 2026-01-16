const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

// Import routes
const authRoutes = require('./routes/authRoutes');
const tableRoutes = require('./routes/tableRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const userRoutes = require('./routes/userRoutes');

// Import models for socket events
const Order = require('./models/Order');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io available in routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join room based on role
  socket.on('join', (role) => {
    socket.join(role);
    console.log(`User joined ${role} room`);
  });

  // Join specific table room
  socket.on('join-table', (tableId) => {
    socket.join(`table-${tableId}`);
    console.log(`User joined table-${tableId} room`);
  });

  // Handle order updates
  socket.on('order-update', async (data) => {
    try {
      const order = await Order.findById(data.orderId).populate('sessionId');
      if (order) {
        // Notify kitchen
        io.to('kitchen').emit('order-updated', order);
        
        // Notify waiters for this table
        io.to(`table-${order.sessionId.tableId}`).emit('order-status-changed', order);
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  });

  // Handle new orders
  socket.on('new-order', async (data) => {
    try {
      const order = await Order.findById(data.orderId).populate('sessionId');
      if (order) {
        // Notify kitchen
        io.to('kitchen').emit('new-order', order);
      }
    } catch (error) {
      console.error('Error handling new order:', error);
    }
  });

  // Handle session closure
  socket.on('session-closed', (data) => {
    io.to(`table-${data.tableId}`).emit('session-closed', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = { app, server, io };