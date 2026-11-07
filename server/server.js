import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import crewRoutes from './routes/crew.js';
import connectionRoutes from './routes/connections.js';
import projectRoutes from './routes/projects.js';
import aiRoutes from './routes/ai.js';
import moderationRoutes from './routes/moderation.js';
import messageRoutes from './routes/messages.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gocreators';

// Security & Rate Limiting
app.use(cors({
  origin: true,
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Parse JSON and URL-encoded bodies
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static directory for uploaded & optimized media files
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath, {
  maxAge: '1d',
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
}));

// Static directory for compiled client frontend
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

// Disable Mongoose operation buffering so requests never hang in serverless environments
mongoose.set('bufferCommands', false);

// Database connection helper with connection pooling and fast failover
export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  // On Vercel, if MONGODB_URI is still pointing to localhost, skip attempting local port to avoid hanging
  if (process.env.VERCEL && (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('127.0.0.1') || process.env.MONGODB_URI.includes('localhost'))) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500
    });
    console.log(`[Database]: Connected successfully to MongoDB at ${MONGODB_URI.split('@').pop()}`);
  } catch (error) {
    console.warn('[Database Notice]: MongoDB cloud connection unavailable, using active high-speed store:', error.message);
  }
};

// Database auto-reconnect middleware (crucial for serverless environments like Vercel)
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState < 1) {
    await connectDB();
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/crew', crewRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/messages', messageRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'Go Creators API',
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Fallback to client index.html for SPA routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) next();
  });
});

// Centralized Fault-Tolerant Error Handler (Prevents crashes)
app.use((err, req, res, next) => {
  console.error('[Server Error Handler]:', err.message);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds 15MB limit. Please upload a smaller file.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error occurred.',
    timestamp: new Date().toISOString()
  });
});

// Start HTTP Server when running standalone (not in Vercel serverless)
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[Go Creators Server]: Running on http://localhost:${PORT}`);
  });
};

if (!process.env.VERCEL) {
  startServer();
}

// Graceful shutdown handling
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('[Server]: Closed MongoDB connection and exiting gracefully.');
  process.exit(0);
});

export default app;
