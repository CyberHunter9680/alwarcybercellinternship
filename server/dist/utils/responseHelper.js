"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
function sendSuccess(res, data, message = 'Success', statusCode = 200, meta) {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        ...(meta ? { meta } : {}),
    });
}
function sendError(res, message = 'An error occurred', statusCode = 500, errors) {
    return res.status(statusCode).json({
        success: false,
        message,
        ...(errors ? { errors } : {}),
    });
}
