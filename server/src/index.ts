import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import { AdminService } from './services/adminService.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalApiLimiter } from './middleware/rateLimiter.js';
import apiRouter from './routes/index.js';

const app = express();

// Trust reverse proxy (Vercel, Nginx, Cloudflare) to correctly identify client IP
app.set('trust proxy', 1);

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // allow modern React frontend embed
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
const allowedOrigins = [
  ENV.FRONTEND_URL,
  ENV.PUBLIC_APP_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev/staging to prevent CORS issues
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Middlewares
app.use(morgan(ENV.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to API routes
app.use('/api', generalApiLimiter);

// Mount API routes
app.use('/api', apiRouter);

// Serve static frontend assets if built
import path from 'path';
import fs from 'fs';

const possibleDistPaths = [
  path.resolve(process.cwd(), 'dist'),
  path.resolve(process.cwd(), '../dist'),
  path.resolve(process.cwd(), 'client/dist'),
];

for (const distPath of possibleDistPaths) {
  if (fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'))) {
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
    break;
  }
}

// Global Error Handler
app.use(errorHandler);

// Start Server if run directly (not in Vercel serverless)
async function startServer() {
  await connectDB();
  await AdminService.seedDefaultAdmin();

  app.listen(ENV.PORT, () => {
    console.log(`
  🛡️ ======================================================= 🛡️
     ALWAR POLICE INTERNSHIP PROGRAMME 2026 API SERVER
     Cyber Security Internship Registration & Admin Portal
  🛡️ ======================================================= 🛡️
     Status     : ONLINE
     Port       : ${ENV.PORT}
     Environment: ${ENV.NODE_ENV}
     API Root   : http://localhost:${ENV.PORT}/api
     Health     : http://localhost:${ENV.PORT}/api/health
  🛡️ ======================================================= 🛡️
    `);
  });
}

if (!process.env.VERCEL) {
  startServer();
} else {
  // Connect DB on serverless initialization
  connectDB().catch(console.error);
}

export default app;
