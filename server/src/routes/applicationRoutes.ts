import { Router } from 'express';
import { ApplicationController } from '../controllers/applicationController.js';
import { uploadResumeMiddleware } from '../middleware/uploadMiddleware.js';
import { registrationLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Student submission endpoint with rate limiting & resume upload
router.post(
  '/',
  registrationLimiter,
  uploadResumeMiddleware.single('resume'),
  ApplicationController.submitApplication
);

// Download PDF Registration Slip
router.get('/:idOrAppId/registration-slip', ApplicationController.downloadRegistrationSlip);

// Application details
router.get('/:idOrAppId', ApplicationController.getApplicationDetails);

// Stream/view uploaded resume
router.get('/resume/:filename', ApplicationController.getResume);

export default router;
