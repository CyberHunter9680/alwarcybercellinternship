import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ENV } from '../config/env.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('💥 Server Error:', err);

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return res.status(400).json({
      success: false,
      message: formattedErrors[0]?.message || 'Input validation failed',
      errors: formattedErrors,
    });
  }

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Resume file exceeds the maximum allowed limit of 5 MB.',
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
    });
  }

  // Handle Custom file filter errors
  if (err.message && (err.message.includes('Invalid file format') || err.message.includes('Invalid file MIME type'))) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Handle Database / Duplicate Errors
  if (err.message && err.message.includes('already been registered')) {
    return res.status(409).json({
      success: false,
      message: err.message,
    });
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    success: false,
    message: ENV.NODE_ENV === 'production' && statusCode === 500 ? 'An unexpected server error occurred. Please try again later.' : message,
    ...(ENV.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}
