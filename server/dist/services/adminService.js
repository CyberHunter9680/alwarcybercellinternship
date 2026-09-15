"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_js_1 = require("../config/db.js");
const env_js_1 = require("../config/env.js");
class AdminService {
    /**
     * Hashes a plaintext password using bcrypt with 12 salt rounds
     */
    static async hashPassword(password) {
        return bcryptjs_1.default.hash(password, 12);
    }
    /**
     * Verifies password against stored hash
     */
    static async comparePassword(password, hash) {
        return bcryptjs_1.default.compare(password, hash);
    }
    /**
     * Generates JWT token for authenticated admin
     */
    static generateToken(admin) {
        const payload = {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
        };
        return jsonwebtoken_1.default.sign(payload, env_js_1.ENV.AUTH_SECRET, {
            expiresIn: '8h',
        });
    }
    /**
     * Verifies and decodes JWT token
     */
    static verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, env_js_1.ENV.AUTH_SECRET);
        }
        catch {
            return null;
        }
    }
    /**
     * Authenticates admin with email and password
     */
    static async login(email, password) {
        const normalizedEmail = email.toLowerCase().trim();
        const admin = await db_js_1.prisma.admin.findUnique({
            where: { email: normalizedEmail },
        });
        if (!admin || !admin.isActive) {
            throw new Error('Invalid email or password');
        }
        const isMatch = await this.comparePassword(password, admin.passwordHash);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }
        // Update last login timestamp
        await db_js_1.prisma.admin.update({
            where: { id: admin.id },
            data: { lastLoginAt: new Date() },
        });
        const token = this.generateToken(admin);
        return { admin, token };
    }
    /**
     * Seeds default admin if not existing
     */
    static async seedDefaultAdmin() {
        const count = await db_js_1.prisma.admin.count();
        if (count === 0) {
            const passwordHash = await this.hashPassword(env_js_1.ENV.ADMIN_PASSWORD);
            await db_js_1.prisma.admin.create({
                data: {
                    name: 'Chief Cyber Officer',
                    email: env_js_1.ENV.ADMIN_EMAIL,
                    passwordHash,
                    role: 'SUPER_ADMIN',
                    isActive: true,
                },
            });
            console.log(`👑 Initial Admin account created: ${env_js_1.ENV.ADMIN_EMAIL}`);
        }
    }
}
exports.AdminService = AdminService;
