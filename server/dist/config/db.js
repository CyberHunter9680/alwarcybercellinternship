"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.connectDB = connectDB;
const client_1 = require("@prisma/client");
const env_js_1 = require("./env.js");
exports.prisma = globalThis.prisma ||
    new client_1.PrismaClient({
        log: env_js_1.ENV.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
if (env_js_1.ENV.NODE_ENV !== 'production') {
    globalThis.prisma = exports.prisma;
}
async function connectDB() {
    try {
        await exports.prisma.$connect();
        console.log('✅ PostgreSQL / Neon Database connected successfully via Prisma');
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        // Don't kill process immediately to allow friendly API error responses
    }
}
