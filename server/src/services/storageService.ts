import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ENV } from '../config/env.js';

// Ensure local upload directory exists safely
try {
  if (!fs.existsSync(ENV.STORAGE_DIR)) {
    fs.mkdirSync(ENV.STORAGE_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('⚠️ Could not create STORAGE_DIR on startup (expected in serverless):', err);
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
   * Saves an uploaded buffer to the configured storage engine
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

    const filePath = path.join(ENV.STORAGE_DIR, savedFilename);

    // Save to disk
    await fs.promises.writeFile(filePath, fileBuffer);

    // Generate local URL reference
    const url = `/api/applications/resume/${savedFilename}`;

    return {
      originalFilename,
      savedFilename,
      mimeType,
      size: fileBuffer.length,
      url,
    };
  }

  /**
   * Retrieves resume buffer for viewing/downloading
   */
  static async getResumeBuffer(savedFilename: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    const safeFilename = path.basename(savedFilename);
    const filePath = path.join(ENV.STORAGE_DIR, safeFilename);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const buffer = await fs.promises.readFile(filePath);
    const ext = path.extname(safeFilename).toLowerCase();
    let mimeType = 'application/octet-stream';

    if (ext === '.pdf') mimeType = 'application/pdf';
    else if (ext === '.doc') mimeType = 'application/msword';
    else if (ext === '.docx') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    return { buffer, mimeType };
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
