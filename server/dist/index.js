"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_js_1 = require("./config/env.js");
const db_js_1 = require("./config/db.js");
const adminService_js_1 = require("./services/adminService.js");
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const rateLimiter_js_1 = require("./middleware/rateLimiter.js");
const index_js_1 = __importDefault(require("./routes/index.js"));
const app = (0, express_1.default)();
// Security Headers
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // allow modern React frontend embed
    crossOriginEmbedderPolicy: false,
}));
// CORS configuration
const allowedOrigins = [
    env_js_1.ENV.FRONTEND_URL,
    env_js_1.ENV.PUBLIC_APP_URL,
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(null, true); // Permissive in dev/staging to prevent CORS issues
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
// Middlewares
app.use((0, morgan_1.default)(env_js_1.ENV.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Apply rate limiting to API routes
app.use('/api', rateLimiter_js_1.generalApiLimiter);
// Mount API routes
app.use('/api', index_js_1.default);
// Global Error Handler
app.use(errorHandler_js_1.errorHandler);
// Start Server
async function startServer() {
    await (0, db_js_1.connectDB)();
    await adminService_js_1.AdminService.seedDefaultAdmin();
    app.listen(env_js_1.ENV.PORT, () => {
        console.log(`
  🛡️ ======================================================= 🛡️
     ALWAR POLICE INTERNSHIP PROGRAMME 2026 API SERVER
     Cyber Security Internship Registration & Admin Portal
  🛡️ ======================================================= 🛡️
     Status     : ONLINE
     Port       : ${env_js_1.ENV.PORT}
     Environment: ${env_js_1.ENV.NODE_ENV}
     API Root   : http://localhost:${env_js_1.ENV.PORT}/api
     Health     : http://localhost:${env_js_1.ENV.PORT}/api/health
  🛡️ ======================================================= 🛡️
    `);
    });
}
startServer();
exports.default = app;
