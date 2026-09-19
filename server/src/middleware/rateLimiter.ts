import rateLimit from 'express-rate-limit';
import { ENV } from '../config/env.js';

/**
 * Standard rate limiter for general API routes
 * Provides generous throughput for browsing while preventing infrastructure abuse
 */
export const generalApiLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: ENV.RATE_LIMIT_MAX_REQUESTS, // 2000 requests per 15 minutes
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
export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: ENV.LOGIN_RATE_LIMIT_MAX, // 5 attempts
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
export const registrationLimiter = rateLimit({
  windowMs: ENV.REGISTRATION_RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: ENV.REGISTRATION_RATE_LIMIT_MAX, // 1000 submissions per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false, xForwardedForHeader: false },
  message: {
    success: false,
    message: 'Too many registration requests received from this network. Please try again after a few minutes.',
  },
});

/**
 * Rate limiter for WhatsApp application verification attempts
 * Prevents automated ID enumeration / brute-force attacks while allowing legitimate candidate lookups
 */
export const whatsappVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 verification checks per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false, xForwardedForHeader: false },
  message: {
    success: false,
    verified: false,
    message: 'Too many verification attempts from this network. Please try again after 15 minutes.',
  },
});

