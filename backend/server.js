/**
 * server.js — Entry point for the Resume Upload API
 * Starts Express, connects to MongoDB, and mounts routes.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const resumeRoutes = require('./routes/resumeRoutes');

// Load environment variables from .env file
dotenv.config();

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
// Allow cross-origin requests from the React dev server
app.use(cors({ origin: 'http://localhost:3000' }));

// Parse incoming JSON bodies
app.use(express.json());

// ── Database ────────────────────────────────────────────────────────────────
connectDB();

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/resume', resumeRoutes);

// Health-check endpoint
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Resume Upload API is running.' });
});

// ── Global error handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    data: {},
  });
});

// ── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀  Server listening on http://localhost:${PORT}`);
});
