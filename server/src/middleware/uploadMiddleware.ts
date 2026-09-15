import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Use memory storage so we can validate and save via StorageService
const storage = multer.memoryStorage();

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(
      new Error('Invalid file format. Only PDF, DOC, and DOCX resume documents are allowed.')
    );
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype) && file.mimetype !== 'application/octet-stream') {
    return cb(
      new Error('Invalid file MIME type. Only genuine PDF and Word documents are permitted.')
    );
  }

  cb(null, true);
};

export const uploadResumeMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes
    files: 1,
  },
  fileFilter,
});
