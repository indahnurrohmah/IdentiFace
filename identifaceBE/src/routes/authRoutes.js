const express = require('express');
const { register, verifyEmail, login } = require('../controllers/authController');
const { otpLimiter } = require('../middleware/rateLimiter'); 

const router = express.Router();

/**
 * Register a new user account and send OTP
 * Endpoint: POST /api/auth/register
 */
router.post('/register', register);

/**
 * Login user and generate JWT token
 * Endpoint: POST /api/auth/login
 */
router.post('/login', login);

/**
 * Verify user email using OTP and finalize profile creation
 * Endpoint: POST /api/auth/verify-email
 */
// Terapkan otpLimiter khusus di sini agar kebal dari serangan brute-force (tebak-tebak OTP)
router.post('/verify-email', otpLimiter, verifyEmail);

module.exports = router;