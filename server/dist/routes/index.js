"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const applicationRoutes_js_1 = __importDefault(require("./applicationRoutes.js"));
const adminRoutes_js_1 = __importDefault(require("./adminRoutes.js"));
const verifyRoutes_js_1 = __importDefault(require("./verifyRoutes.js"));
const apiRouter = (0, express_1.Router)();
// Health check endpoint
apiRouter.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'Alwar Police Cyber Security Internship 2026 API',
    });
});
// Mount modules
apiRouter.use('/applications', applicationRoutes_js_1.default);
apiRouter.use('/admin', adminRoutes_js_1.default);
apiRouter.use('/verify', verifyRoutes_js_1.default);
exports.default = apiRouter;
