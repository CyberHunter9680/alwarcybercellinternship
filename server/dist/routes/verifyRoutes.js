"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyController_js_1 = require("../controllers/verifyController.js");
const router = (0, express_1.Router)();
// Public verification by Application ID
router.get('/:applicationId', verifyController_js_1.VerifyController.verifyApplication);
exports.default = router;
