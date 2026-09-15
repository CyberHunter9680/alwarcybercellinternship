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
 */
exports.generalApiLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_js_1.ENV.RATE_LIMIT_WINDOW_MS, // 15 minutes
    max: env_js_1.ENV.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests received from this IP, please try again after 15 minutes.',
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
    message: {
        success: false,
        message: 'Too many failed login attempts. For security reasons, please try again in 15 minutes.',
    },
});
/**
 * Registration rate limiter to prevent bot floods
 */
exports.registrationLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 15, // max 15 submissions per IP per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Registration submission limit reached for this network. Please try again later.',
    },
});
