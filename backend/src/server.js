import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { waitForDatabase, pool } from './config/db.js';
import { errorHandler } from './middlewares/errorHandler.js';

import healthRoutes from './routes/healthRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import kamarRoutes from './routes/kamarRoutes.js';
import penghuniRoutes from './routes/penghuniRoutes.js';
import pembayaranRoutes from './routes/pembayaranRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*', // For microservices or internal reverse proxy
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Microservice Probes (Root level for k8s/docker health checks)
app.use('/', healthRoutes);

// API Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/kamar', kamarRoutes);
app.use('/api/penghuni', penghuniRoutes);
app.use('/api/pembayaran', pembayaranRoutes);
app.use('/api/maintenance', maintenanceRoutes);

// 404 Handler
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
      console.log(`   API Root:    http://localhost:${PORT}/api/dashboard/stats`);
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

