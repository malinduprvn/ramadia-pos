require('dotenv').config();
const { server } = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 5001;

// Connect to database
connectDB();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});