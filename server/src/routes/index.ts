import { Router } from 'express';
import applicationRoutes from './applicationRoutes.js';
import adminRoutes from './adminRoutes.js';
import verifyRoutes from './verifyRoutes.js';

const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Alwar Police Cyber Security Internship 2026 API',
  });
});

// Mount modules
apiRouter.use('/applications', applicationRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/verify', verifyRoutes);

export default apiRouter;
