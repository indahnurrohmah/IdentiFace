const rateLimit = require('express-rate-limit');

// General rate limiter for all API endpoints
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Maximum 500 requests per IP
    message: { 
        success: false, 
        message: 'Terlalu banyak permintaan dari IP ini, silakan coba lagi dalam 15 menit.', 
        error: null 
    }
});

// Stricter rate limiter specifically for Login / Register attempts
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, // Maximum 100 attempts per IP
    message: { 
        success: false, 
        message: 'Terlalu banyak percobaan login/register, silakan coba lagi dalam 15 menit.', 
        error: null 
    }
});

// Strictest rate limiter specifically for OTP verification
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, // Maximum 5 OTP attempts per IP
    message: { 
        success: false, 
        message: 'Terlalu banyak percobaan OTP yang salah. Silakan coba lagi setelah 15 menit.', 
        error: null 
    }
});

module.exports = { apiLimiter, authLimiter, otpLimiter };