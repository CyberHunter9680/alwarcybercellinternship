"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load .env from root or server
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env') });
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '../.env') });
exports.ENV = {
    PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/alwar_internship?schema=public',
    AUTH_SECRET: process.env.AUTH_SECRET || 'alwar-police-cyber-internship-2026-super-secret-key-prod',
    ADMIN_EMAIL: (process.env.ADMIN_EMAIL || 'admin@alwarpolice.gov.in').toLowerCase().trim(),
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@AlwarCyber2026!',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    PUBLIC_APP_URL: process.env.PUBLIC_APP_URL || 'http://localhost:5173',
    STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || 'LOCAL', // 'LOCAL' | 'VERCEL_BLOB' | 'S3' | 'DB_BACKUP'
    STORAGE_DIR: process.env.STORAGE_DIR || path_1.default.resolve(process.cwd(), 'uploads/resumes'),
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 mins
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '200', 10),
    LOGIN_RATE_LIMIT_MAX: parseInt(process.env.LOGIN_RATE_LIMIT_MAX || '5', 10),
};
