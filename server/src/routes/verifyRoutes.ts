import { Router } from 'express';
import { VerifyController } from '../controllers/verifyController.js';

const router = Router();

// Public verification by Application ID
router.get('/:applicationId', VerifyController.verifyApplication);

export default router;
