import { Router } from 'express';
import { VerifyController } from '../controllers/verifyController.js';
import { ApplicationController } from '../controllers/applicationController.js';
import { whatsappVerificationLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// WhatsApp Group verification
router.post('/whatsapp', whatsappVerificationLimiter, ApplicationController.verifyWhatsAppApplication);
router.get('/whatsapp', whatsappVerificationLimiter, ApplicationController.verifyWhatsAppApplication);

// Public verification by Application ID
router.get('/:applicationId', VerifyController.verifyApplication);

export default router;

