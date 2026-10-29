import { Router } from 'express';
import { pool } from '../config/db.js';

const router = Router();

// Liveness Probe: Checks if Node process is responsive
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'kosmate-backend',
  });
});

// Readiness Probe: Checks if Database connectivity is healthy
router.get('/ready', async (req, res) => {
  try {
    const dbRes = await pool.query('SELECT 1');
    if (dbRes) {
      return res.status(200).json({
        status: 'READY',
        database: 'CONNECTED',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err) {
    return res.status(503).json({
      status: 'NOT_READY',
      database: 'DISCONNECTED',
      error: err.message,
    });
  }
});

export default router;

