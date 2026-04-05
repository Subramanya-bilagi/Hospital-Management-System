const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// --- Security Middleware ---

// CORS: restrict to frontend origin in production
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parsers with size limits to prevent payload attacks
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Database Connection
const db = require('./config/db');

// Health Check Route
app.get('/api/health', async (req, res) => {
  try {
    const conn = await db.getConnection();
    conn.release();
    res.status(200).json({ success: true, message: 'Backend is running, DB is online' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Backend is running, DB is offline' });
  }
});

// Central API Routes
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// Global Error Handlers (must be at the bottom after all routes)
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Port Configuration
const PORT = process.env.PORT || 5001;

// Test DB and start server
db.getConnection()
  .then((connection) => {
    console.log('Database connected successfully');
    connection.release();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is warmly bound to 0.0.0.0 on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is warmly bound to 0.0.0.0 on port ${PORT} (DB Offline)`);
    });
  });
