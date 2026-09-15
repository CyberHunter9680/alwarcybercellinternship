"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdminAuth = requireAdminAuth;
const adminService_js_1 = require("../services/adminService.js");
const responseHelper_js_1 = require("../utils/responseHelper.js");
function requireAdminAuth(req, res, next) {
    try {
        // 1. Check HTTP-only cookie first, then Bearer Authorization header
        let token = req.cookies?.admin_token;
        if (!token && req.headers.authorization) {
            const parts = req.headers.authorization.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                token = parts[1];
            }
        }
        if (!token) {
            return (0, responseHelper_js_1.sendError)(res, 'Authentication required. Please sign in to the Admin Portal.', 401);
        }
        const payload = adminService_js_1.AdminService.verifyToken(token);
        if (!payload) {
            return (0, responseHelper_js_1.sendError)(res, 'Session has expired or is invalid. Please sign in again.', 401);
        }
        req.admin = payload;
        next();
    }
    catch (error) {
        return (0, responseHelper_js_1.sendError)(res, 'Authentication verification failed', 401);
    }
}
