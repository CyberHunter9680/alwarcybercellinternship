import rateLimit from 'express-rate-limit';
import { ENV } from '../config/env.js';

/**
 * Standard rate limiter for general API routes
 */
export const generalApiLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: ENV.RATE_LIMIT_MAX_REQUESTS,
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
export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: ENV.LOGIN_RATE_LIMIT_MAX, // 5 attempts
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
export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15, // max 15 submissions per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Registration submission limit reached for this network. Please try again later.',
  },
});
