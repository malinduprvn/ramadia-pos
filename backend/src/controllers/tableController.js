const Table = require('../models/Table');
const TableSession = require('../models/TableSession');

exports.getAllTables = async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createTable = async (req, res) => {
  try {
    const { tableNumber } = req.body;

    const existingTable = await Table.findOne({ tableNumber });
    if (existingTable) {
      return res.status(400).json({ message: 'Table number already exists' });
    }

    const table = await Table.create({ tableNumber });
    res.status(201).json(table);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const { tableNumber, status } = req.body;

    const table = await Table.findByIdAndUpdate(
      id,
      { tableNumber, status },
      { new: true, runValidators: true }
    );

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.json(table);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteTable = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if table has active sessions
    const activeSession = await TableSession.findOne({ 
      tableId: id, 
      status: 'open' 
    });

    if (activeSession) {
      return res.status(400).json({ message: 'Cannot delete table with active session' });
    }

    const table = await Table.findByIdAndDelete(id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.openSession = async (req, res) => {
  try {
    const { tableId } = req.body;
    const waiterId = req.user._id;

    // Check if table exists and is free
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    if (table.status === 'occupied') {
      return res.status(400).json({ message: 'Table is already occupied' });
    }

    // Check if there's already an open session for this table
    const existingSession = await TableSession.findOne({ 
      tableId, 
      status: 'open' 
    });

    if (existingSession) {
      return res.status(400).json({ message: 'Table already has an open session' });
    }

    // Create new session
    const session = await TableSession.create({
      tableId,
      openedBy: waiterId
    });

    // Update table status
    await Table.findByIdAndUpdate(tableId, { status: 'occupied' });

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.closeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await TableSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.status === 'closed') {
      return res.status(400).json({ message: 'Session is already closed' });
    }

    // Close session
    session.status = 'closed';
    session.endTime = new Date();
    await session.save();

    // Update table status to free
    await Table.findByIdAndUpdate(session.tableId, { status: 'free' });

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTableSessions = async (req, res) => {
  try {
    const { tableId } = req.params;
    
    const sessions = await TableSession.find({ tableId })
      .populate('openedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};