"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const applicationController_js_1 = require("../controllers/applicationController.js");
const uploadMiddleware_js_1 = require("../middleware/uploadMiddleware.js");
const rateLimiter_js_1 = require("../middleware/rateLimiter.js");
const router = (0, express_1.Router)();
// Student submission endpoint with rate limiting & resume upload
router.post('/', rateLimiter_js_1.registrationLimiter, uploadMiddleware_js_1.uploadResumeMiddleware.single('resume'), applicationController_js_1.ApplicationController.submitApplication);
// Download PDF Registration Slip
router.get('/:idOrAppId/registration-slip', applicationController_js_1.ApplicationController.downloadRegistrationSlip);
// Application details
router.get('/:idOrAppId', applicationController_js_1.ApplicationController.getApplicationDetails);
// Stream/view uploaded resume
router.get('/resume/:filename', applicationController_js_1.ApplicationController.getResume);
exports.default = router;
