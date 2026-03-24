import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
dotenv.config();

import path from 'path';
import connectDB from './config/db.js';

import { generalRateLimiter, loginRateLimiter, forgotPasswordRateLimiter } from './middleware/rateLimiter.js';

import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import adRoutes from './routes/adRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import subcategoryRoutes from './routes/subcategoryRoutes.js';
import cityRoutes from './routes/cityRoutes.js';
import seoContentRoutes from './routes/seoContentRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import viewRoutes from './routes/viewRoutes.js';
import imageRoutes from './routes/imageRoutes.js';

connectDB();

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'", "https://accounts.google.com/gsi/client"],
        "frame-src": ["'self'", "https://accounts.google.com"],
        "connect-src": ["'self'", "https://accounts.google.com"],
        "img-src": ["'self'", "data:", "blob:", "https:", "http:"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(cors());
app.use(express.json());
app.use(generalRateLimiter);

// Serve uploaded files with caching
const __dirname2 = path.resolve();
app.use('/uploads', express.static(path.join(__dirname2, 'uploads'), {
  maxAge: '30d',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.includes('.cache')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/seo', seoContentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/views', viewRoutes);
app.use('/api/images', imageRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const frontendDistPath = path.join(__dirname2, '../frontend/dist');
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(frontendDistPath, 'index.html'))
  );
} else {
  // Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'OLX Marketplace API is running' });
});
}

// Error Handlers
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`OLX Marketplace API running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
