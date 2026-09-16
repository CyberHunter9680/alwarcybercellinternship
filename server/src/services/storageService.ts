import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { ENV } from '../config/env.js';

// Ensure local upload directory exists safely
try {
  if (!fs.existsSync(ENV.STORAGE_DIR)) {
    fs.mkdirSync(ENV.STORAGE_DIR, { recursive: true });
  }
} catch (err) {
  // Serverless environment may have read-only root; ignore
}

export interface StoredFileInfo {
  originalFilename: string;
  savedFilename: string;
  mimeType: string;
  size: number;
  url: string;
}

export class StorageService {
  /**
   * Saves an uploaded resume buffer.
   * Generates a persistent Data URI stored directly in the database, ensuring zero file loss
   * on ephemeral serverless platforms (Vercel Lambda), while also caching a local copy to disk.
   */
  static async saveResume(
    fileBuffer: Buffer,
    originalFilename: string,
    mimeType: string
  ): Promise<StoredFileInfo> {
    const ext = path.extname(originalFilename).toLowerCase();
    const hash = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const sanitizedBase = path.basename(originalFilename, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const savedFilename = `resume_${timestamp}_${sanitizedBase}_${hash}${ext}`;

    // 1. Generate persistent base64 Data URI
    const dataUri = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

    // 2. Best-effort local filesystem caching
    try {
      const candidateDirs = [
        ENV.STORAGE_DIR,
        path.join(os.tmpdir(), 'resumes'),
      ];

      for (const dir of candidateDirs) {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        const filePath = path.join(dir, savedFilename);
        await fs.promises.writeFile(filePath, fileBuffer);
      }
    } catch (fsErr) {
      // Local caching failure in serverless is non-fatal since Data URI is safely stored
    }

    return {
      originalFilename,
      savedFilename,
      mimeType,
      size: fileBuffer.length,
      url: dataUri,
    };
  }

  /**
   * Retrieves resume buffer for viewing/downloading with multi-tier resolution:
   * 1. Direct Base64 Data URI decoding
   * 2. Remote HTTP/HTTPS fetch
   * 3. Comprehensive filesystem candidate search across serverless /tmp and local dirs
   */
  static async getResumeBuffer(
    reference: string,
    fallbackFilename?: string
  ): Promise<{ buffer: Buffer; mimeType: string } | null> {
    if (!reference) return null;

    // Case 1: Base64 Data URI (Persistent DB Storage)
    if (reference.startsWith('data:')) {
      try {
        const matches = reference.match(/^data:([^;]+);base64,(.+)$/);
        if (matches && matches[2]) {
          const mimeType = matches[1] || 'application/pdf';
          const buffer = Buffer.from(matches[2], 'base64');
          return { buffer, mimeType };
        }
      } catch {
        // Continue to other strategies if parsing fails
      }
    }

    // Case 2: Remote Cloud Storage URL (S3 / Vercel Blob / Supabase)
    if (reference.startsWith('http://') || reference.startsWith('https://')) {
      try {
        const response = await fetch(reference);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const mimeType = response.headers.get('content-type') || this.getMimeType(fallbackFilename || reference);
          return { buffer, mimeType };
        }
      } catch {
        // Continue to disk check
      }
    }

    // Case 3: Local Filesystem Resolution across all possible directory candidates
    const safeFilename = path.basename(reference);
    const candidateDirs = [
      ENV.STORAGE_DIR,
      path.join(os.tmpdir(), 'resumes'),
      os.tmpdir(),
      path.resolve(process.cwd(), 'uploads/resumes'),
      path.resolve(process.cwd(), 'server/uploads/resumes'),
      path.resolve(process.cwd(), '../uploads/resumes'),
      path.resolve(process.cwd(), 'uploads'),
    ];

    for (const dir of candidateDirs) {
      try {
        const filePath = path.join(dir, safeFilename);
        if (fs.existsSync(filePath)) {
          const buffer = await fs.promises.readFile(filePath);
          const mimeType = this.getMimeType(safeFilename || fallbackFilename || '');
          return { buffer, mimeType };
        }
      } catch {
        // Check next directory
      }
    }

    return null;
  }

  /**
   * Helper to derive standard MIME type from filename extension
   */
  static getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    if (ext === '.pdf') return 'application/pdf';
    if (ext === '.doc') return 'application/msword';
    if (ext === '.docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    return 'application/pdf';
  }

  /**
   * Deletes a file if needed
   */
  static async deleteResume(savedFilename: string): Promise<boolean> {
    try {
      const safeFilename = path.basename(savedFilename);
      const filePath = path.join(ENV.STORAGE_DIR, safeFilename);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

