const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/tasks');
const db = require('./db');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check endpoint (vital for CI/CD container health probes and readiness checks)
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    const result = await db.query('SELECT 1 + 1 AS solution');
    if (result.rows && result.rows.length > 0) {
      dbStatus = 'connected';
    }
  } catch (err) {
    dbStatus = 'error: ' + err.message;
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'pern-backend-api',
    database: dbStatus,
  });
});

// API Routes
app.use('/api/tasks', taskRoutes);

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'API route not found' });
});

module.exports = app;
