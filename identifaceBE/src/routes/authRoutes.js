const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, verifyEmail } = require('../controllers/authController');

const router = express.Router();

// Create a rate limiter for the OTP verification endpoint
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: { error: 'Terlalu banyak percobaan yang salah. Silakan coba lagi setelah 15 menit.' }
});

router.post('/register', register);
router.post('/login', login);

// Apply the limiter ONLY to the verify route
router.post('/verify-email', otpLimiter, verifyEmail);

module.exports = router;