const express = require('express');
const { login, logout } = require('../controllers/authController');
const { otpLimiter } = require('../middleware/rateLimiter'); 

const router = express.Router();


/**
 * Login user and generate JWT token
 * Endpoint: POST /api/auth/login
 */
router.post('/login', login);

router.post('/logout', logout);

module.exports = router;