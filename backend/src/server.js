import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { waitForDatabase, pool } from './config/db.js';
import { errorHandler } from './middlewares/errorHandler.js';

import healthRoutes from './routes/healthRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import kamarRoutes from './routes/kamarRoutes.js';
import penghuniRoutes from './routes/penghuniRoutes.js';
import pembayaranRoutes from './routes/pembayaranRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Microservice Probes
app.use('/', healthRoutes);

// Root API Endpoint (So visiting / doesn't show 404 Route Not Found)
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'KosMate REST API Microservice is operational',
    version: '2.0.0',
    endpoints: {
      health: '/health',
      ready: '/ready',
      stats: '/api/dashboard/stats',
      kamar: '/api/kamar',
      penghuni: '/api/penghuni',
      pembayaran: '/api/pembayaran',
      maintenance: '/api/maintenance',
    },
  });
});

// API Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/kamar', kamarRoutes);
app.use('/api/penghuni', penghuniRoutes);
app.use('/api/pembayaran', pembayaranRoutes);
app.use('/api/maintenance', maintenanceRoutes);

// Fallback: If frontend static build is present, serve it
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health' || req.path === '/ready') {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  // If no static frontend, provide friendly API root
  app.get('/', (req, res) => {
    res.json({
      success: true,
      service: 'KosMate Backend Microservice',
      message: 'Backend is running. Visit Frontend Web at port 8080 (http://localhost:8080)',
      endpoints: {
        health: '/health',
        ready: '/ready',
        dashboard: '/api/dashboard/stats',
        kamar: '/api/kamar',
        penghuni: '/api/penghuni',
        pembayaran: '/api/pembayaran',
        maintenance: '/api/maintenance',
      },
    });
  });
}

// 404 Handler for unmatched API routes
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Centralized Error Handling
app.use(errorHandler);

let server;

// Start Server after Database is Ready
async function bootstrap() {
  try {
    console.log('[KosMate Backend] Waiting for database connection...');
    await waitForDatabase();

    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 [KosMate Backend] Microservice running on port ${PORT}`);
      console.log(`   Healthcheck: http://localhost:${PORT}/health`);
      console.log(`   Readiness:   http://localhost:${PORT}/ready`);
      console.log(`   API Root:    http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('Fatal initialization error:', err.message);
    process.exit(1);
  }
}

// Graceful Shutdown for Container Life-Cycle
const gracefulShutdown = (signal) => {
  console.log(`\n[Shutdown] Received ${signal}. Gracefully stopping microservice...`);
  if (server) {
    server.close(async () => {
      console.log('[Shutdown] Closed active HTTP connections.');
      try {
        await pool.end();
        console.log('[Shutdown] PostgreSQL connection pool closed.');
      } catch (err) {
        console.error('[Shutdown] Error closing pool:', err.message);
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

bootstrap();
