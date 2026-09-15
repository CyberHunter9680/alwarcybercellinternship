"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskEmail = maskEmail;
exports.maskMobile = maskMobile;
exports.sanitizeString = sanitizeString;
/**
 * Masks an email for safe verification display (e.g. j***e@gmail.com)
 */
function maskEmail(email) {
    if (!email || !email.includes('@'))
        return '*****@***.com';
    const [user, domain] = email.split('@');
    if (user.length <= 2) {
        return `${user[0]}***@${domain}`;
    }
    return `${user[0]}***${user[user.length - 1]}@${domain}`;
}
/**
 * Masks a mobile number for safe display (e.g. 98******12)
 */
function maskMobile(mobile) {
    if (!mobile || mobile.length < 10)
        return 'XXXXXXXXXX';
    return `${mobile.slice(0, 2)}******${mobile.slice(-2)}`;
}
/**
 * Sanitizes generic user input string to prevent XSS / control character injection
 */
function sanitizeString(input) {
    if (typeof input !== 'string')
        return '';
    return input
        .trim()
        .replace(/[<>]/g, '') // remove HTML angle brackets
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // remove control chars
}
