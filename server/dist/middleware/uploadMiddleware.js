"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadResumeMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// Use memory storage so we can validate and save via StorageService
const storage = multer_1.default.memoryStorage();
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const fileFilter = (req, file, cb) => {
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return cb(new Error('Invalid file format. Only PDF, DOC, and DOCX resume documents are allowed.'));
    }
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype) && file.mimetype !== 'application/octet-stream') {
        return cb(new Error('Invalid file MIME type. Only genuine PDF and Word documents are permitted.'));
    }
    cb(null, true);
};
exports.uploadResumeMiddleware = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 Megabytes
        files: 1,
    },
    fileFilter,
});
