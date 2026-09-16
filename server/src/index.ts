import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
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
    contentSecurityPolicy: false, // allow modern React frontend dynamic resources
    crossOriginEmbedderPolicy: false,
    xContentTypeOptions: true,
    xFrameOptions: { action: 'sameorigin' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    dnsPrefetchControl: { allow: false },
  })
);

// CORS configuration with strict origin whitelist validation
const rawAllowedOrigins = [
  ENV.FRONTEND_URL,
  ENV.PUBLIC_APP_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];
const allowedOrigins = rawAllowedOrigins.filter(Boolean).map((url) => url.replace(/\/$/, ''));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      const cleanOrigin = origin.replace(/\/$/, '');
      const isAllowed = allowedOrigins.includes(cleanOrigin);

      if (isAllowed || ENV.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} is not allowed by CORS policy`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-slip-token'],
  })
);

// Middlewares
app.use(morgan(ENV.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to API routes
app.use('/api', generalApiLimiter);
app.use(generalApiLimiter);

// Mount API routes
app.use('/api', apiRouter);
app.use(apiRouter);

// Serve static frontend assets if built
const possibleDistPaths = [
  path.resolve(process.cwd(), 'dist'),
  path.resolve(process.cwd(), '../dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(__dirname, '../../dist'),
  path.resolve(__dirname, '../dist'),
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../../../dist'),
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

// Fallback root handler if static files not found in serverless environment
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Alwar Police Internship Programme 2026 API Server',
    endpoints: {
      health: '/api/health',
      applications: '/api/applications',
      verify: '/api/verify/:applicationId',
    },
  });
});

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

const isMainModule = process.argv[1] && (
  process.argv[1].endsWith('index.ts') ||
  process.argv[1].endsWith('index.js')
);

if (!process.env.VERCEL && isMainModule) {
  startServer();
} else if (process.env.VERCEL) {
  // Connect DB on serverless initialization
  connectDB().catch(console.error);
}

export default app;

