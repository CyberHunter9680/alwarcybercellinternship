"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const crypto_1 = __importDefault(require("crypto"));
const env_js_1 = require("../config/env.js");
// Ensure local upload directory exists safely
try {
    if (!fs_1.default.existsSync(env_js_1.ENV.STORAGE_DIR)) {
        fs_1.default.mkdirSync(env_js_1.ENV.STORAGE_DIR, { recursive: true });
    }
}
catch (err) {
    // Serverless environment may have read-only root; ignore
}
class StorageService {
    /**
     * Saves an uploaded resume buffer.
     * Generates a persistent Data URI stored directly in the database, ensuring zero file loss
     * on ephemeral serverless platforms (Vercel Lambda), while also caching a local copy to disk.
     */
    static async saveResume(fileBuffer, originalFilename, mimeType) {
        const ext = path_1.default.extname(originalFilename).toLowerCase();
        const hash = crypto_1.default.randomBytes(16).toString('hex');
        const timestamp = Date.now();
        const sanitizedBase = path_1.default.basename(originalFilename, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        const savedFilename = `resume_${timestamp}_${sanitizedBase}_${hash}${ext}`;
        // 1. Generate persistent base64 Data URI
        const dataUri = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
        // 2. Best-effort local filesystem caching
        try {
            const candidateDirs = [
                env_js_1.ENV.STORAGE_DIR,
                path_1.default.join(os_1.default.tmpdir(), 'resumes'),
            ];
            for (const dir of candidateDirs) {
                if (!fs_1.default.existsSync(dir)) {
                    fs_1.default.mkdirSync(dir, { recursive: true });
                }
                const filePath = path_1.default.join(dir, savedFilename);
                await fs_1.default.promises.writeFile(filePath, fileBuffer);
            }
        }
        catch (fsErr) {
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
    static async getResumeBuffer(reference, fallbackFilename) {
        if (!reference)
            return null;
        // Case 1: Base64 Data URI (Persistent DB Storage)
        if (reference.startsWith('data:')) {
            try {
                const matches = reference.match(/^data:([^;]+);base64,(.+)$/);
                if (matches && matches[2]) {
                    const mimeType = matches[1] || 'application/pdf';
                    const buffer = Buffer.from(matches[2], 'base64');
                    return { buffer, mimeType };
                }
            }
            catch {
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
            }
            catch {
                // Continue to disk check
            }
        }
        // Case 3: Local Filesystem Resolution across all possible directory candidates
        const safeFilename = path_1.default.basename(reference);
        const candidateDirs = [
            env_js_1.ENV.STORAGE_DIR,
            path_1.default.join(os_1.default.tmpdir(), 'resumes'),
            os_1.default.tmpdir(),
            path_1.default.resolve(process.cwd(), 'uploads/resumes'),
            path_1.default.resolve(process.cwd(), 'server/uploads/resumes'),
            path_1.default.resolve(process.cwd(), '../uploads/resumes'),
            path_1.default.resolve(process.cwd(), 'uploads'),
        ];
        for (const dir of candidateDirs) {
            try {
                const filePath = path_1.default.join(dir, safeFilename);
                if (fs_1.default.existsSync(filePath)) {
                    const buffer = await fs_1.default.promises.readFile(filePath);
                    const mimeType = this.getMimeType(safeFilename || fallbackFilename || '');
                    return { buffer, mimeType };
                }
            }
            catch {
                // Check next directory
            }
        }
        return null;
    }
    /**
     * Helper to derive standard MIME type from filename extension
     */
    static getMimeType(filename) {
        const ext = path_1.default.extname(filename).toLowerCase();
        if (ext === '.pdf')
            return 'application/pdf';
        if (ext === '.doc')
            return 'application/msword';
        if (ext === '.docx')
            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        return 'application/pdf';
    }
    /**
     * Deletes a file if needed
     */
    static async deleteResume(savedFilename) {
        try {
            const safeFilename = path_1.default.basename(savedFilename);
            const filePath = path_1.default.join(env_js_1.ENV.STORAGE_DIR, safeFilename);
            if (fs_1.default.existsSync(filePath)) {
                await fs_1.default.promises.unlink(filePath);
                return true;
            }
            return false;
        }
        catch {
            return false;
        }
    }
}
exports.StorageService = StorageService;
