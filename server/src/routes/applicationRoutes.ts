import { Router } from 'express';
import { ApplicationController } from '../controllers/applicationController.js';
import { uploadResumeMiddleware } from '../middleware/uploadMiddleware.js';
import { registrationLimiter } from '../middleware/rateLimiter.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Public registration open/closed status
router.get('/status', ApplicationController.getPublicRegistrationStatus);

// Student submission endpoint with rate limiting & resume upload
router.post(
  '/',
  registrationLimiter,
  uploadResumeMiddleware.single('resume'),
  ApplicationController.submitApplication
);

// Download PDF Registration Slip (Authorized for Admin or Candidate with signed slip token)
router.get('/:idOrAppId/registration-slip', ApplicationController.downloadRegistrationSlip);

// Application details (Authorized for Admin or Candidate with signed slip token)
router.get('/:idOrAppId', ApplicationController.getApplicationDetails);

// Stream/view uploaded resume (Strictly Protected: Admin Authentication Required)
router.get('/resume/:filename', requireAdminAuth, ApplicationController.getResume);

export default router;

