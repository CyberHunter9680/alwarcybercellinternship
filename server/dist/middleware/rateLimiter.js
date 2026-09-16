"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrationLimiter = exports.adminLoginLimiter = exports.generalApiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_js_1 = require("../config/env.js");
/**
 * Standard rate limiter for general API routes
 * Provides generous throughput for browsing while preventing infrastructure abuse
 */
exports.generalApiLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_js_1.ENV.RATE_LIMIT_WINDOW_MS, // 15 minutes
    max: env_js_1.ENV.RATE_LIMIT_MAX_REQUESTS, // 2000 requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false, xForwardedForHeader: false },
    message: {
        success: false,
        message: 'Too many requests received from this network. Please try again after a few minutes.',
    },
});
/**
 * Strict rate limiter for Admin Login attempts
 */
exports.adminLoginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: env_js_1.ENV.LOGIN_RATE_LIMIT_MAX, // 5 attempts
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false, xForwardedForHeader: false },
    message: {
        success: false,
        message: 'Too many failed login attempts. For security reasons, please try again in 15 minutes.',
    },
});
/**
 * Registration rate limiter for abuse / bot flood protection.
 * Configured with a high threshold (1000 registrations / 15 mins) so that
 * hundreds of students sharing the same college Wi-Fi, hostel, or shared ISP
 * can register without issue, while automated DDoS/flooding scripts are mitigated.
 */
exports.registrationLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_js_1.ENV.REGISTRATION_RATE_LIMIT_WINDOW_MS, // 15 minutes
    max: env_js_1.ENV.REGISTRATION_RATE_LIMIT_MAX, // 1000 submissions per 15 minutes per IP
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false, xForwardedForHeader: false },
    message: {
        success: false,
        message: 'Too many registration requests received from this network. Please try again after a few minutes.',
    },
});
