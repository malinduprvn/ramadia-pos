const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true,
    unique: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['free', 'occupied'],
    default: 'free'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Table', tableSchema);