import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { ENV } from '../config/env.js';
import { Admin } from '@prisma/client';

export interface AdminTokenPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

export class AdminService {
  /**
   * Hashes a plaintext password using bcrypt with 12 salt rounds
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  /**
   * Verifies password against stored hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generates JWT token for authenticated admin
   */
  static generateToken(admin: Admin): string {
    const payload: AdminTokenPayload = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };

    return jwt.sign(payload, ENV.AUTH_SECRET, {
      expiresIn: '8h',
    });
  }

  /**
   * Verifies and decodes JWT token
   */
  static verifyToken(token: string): AdminTokenPayload | null {
    try {
      return jwt.verify(token, ENV.AUTH_SECRET) as AdminTokenPayload;
    } catch {
      return null;
    }
  }

  /**
   * Authenticates admin with email and password
   */
  static async login(email: string, password: string): Promise<{ admin: Admin; token: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    const admin = await prisma.admin.findUnique({
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
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const token = this.generateToken(admin);
    return { admin, token };
  }

  /**
   * Updates admin password after verifying current password
   */
  static async changePassword(adminId: string, currentPassword: string, newPassword: string): Promise<void> {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin || !admin.isActive) {
      throw new Error('Admin account not found');
    }

    const isMatch = await this.comparePassword(currentPassword, admin.passwordHash);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    const newHash = await this.hashPassword(newPassword);
    await prisma.admin.update({
      where: { id: adminId },
      data: { passwordHash: newHash },
    });
  }

  /**
   * Seeds default admin if not existing
   */
  static async seedDefaultAdmin(): Promise<void> {
    const count = await prisma.admin.count();
    if (count === 0) {
      const passwordHash = await this.hashPassword(ENV.ADMIN_PASSWORD);
      await prisma.admin.create({
        data: {
          name: 'Chief Cyber Officer',
          email: ENV.ADMIN_EMAIL,
          passwordHash,
          role: 'SUPER_ADMIN',
          isActive: true,
        },
      });
      console.log(`👑 Initial Admin account created: ${ENV.ADMIN_EMAIL}`);
    }
  }
}
