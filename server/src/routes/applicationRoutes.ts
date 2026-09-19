import { Router } from 'express';
import { ApplicationController } from '../controllers/applicationController.js';
import { uploadResumeMiddleware } from '../middleware/uploadMiddleware.js';
import { registrationLimiter, whatsappVerificationLimiter } from '../middleware/rateLimiter.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Public registration open/closed status
router.get('/status', ApplicationController.getPublicRegistrationStatus);

// Verify Application ID for Official WhatsApp Group Access (Rate-limited, Public, Zero PII)
router.post('/verify-whatsapp', whatsappVerificationLimiter, ApplicationController.verifyWhatsAppApplication);
router.get('/verify-whatsapp', whatsappVerificationLimiter, ApplicationController.verifyWhatsAppApplication);

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

