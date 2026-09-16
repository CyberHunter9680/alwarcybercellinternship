"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const env_js_1 = require("../config/env.js");
// Ensure local upload directory exists safely
try {
    if (!fs_1.default.existsSync(env_js_1.ENV.STORAGE_DIR)) {
        fs_1.default.mkdirSync(env_js_1.ENV.STORAGE_DIR, { recursive: true });
    }
}
catch (err) {
    console.warn('⚠️ Could not create STORAGE_DIR on startup (expected in serverless):', err);
}
class StorageService {
    /**
     * Saves an uploaded buffer to the configured storage engine
     */
    static async saveResume(fileBuffer, originalFilename, mimeType) {
        const ext = path_1.default.extname(originalFilename).toLowerCase();
        const hash = crypto_1.default.randomBytes(16).toString('hex');
        const timestamp = Date.now();
        const sanitizedBase = path_1.default.basename(originalFilename, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        const savedFilename = `resume_${timestamp}_${sanitizedBase}_${hash}${ext}`;
        const filePath = path_1.default.join(env_js_1.ENV.STORAGE_DIR, savedFilename);
        // Save to disk
        await fs_1.default.promises.writeFile(filePath, fileBuffer);
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
    static async getResumeBuffer(savedFilename) {
        const safeFilename = path_1.default.basename(savedFilename);
        const filePath = path_1.default.join(env_js_1.ENV.STORAGE_DIR, safeFilename);
        if (!fs_1.default.existsSync(filePath)) {
            return null;
        }
        const buffer = await fs_1.default.promises.readFile(filePath);
        const ext = path_1.default.extname(safeFilename).toLowerCase();
        let mimeType = 'application/octet-stream';
        if (ext === '.pdf')
            mimeType = 'application/pdf';
        else if (ext === '.doc')
            mimeType = 'application/msword';
        else if (ext === '.docx')
            mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        return { buffer, mimeType };
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
