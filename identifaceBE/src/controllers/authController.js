const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const pool = require('../config/supabase'); // Your direct PostgreSQL connection pool

// --- EMAIL CONFIGURATION ---
// This sets up the service that will send the OTP emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Use a Gmail App Password, not your normal password
    }
});

// --- 1. REGISTER FUNCTION ---
const register = async (req, res) => {
    const { email, password, role } = req.body;

    // Security Check 1: Enforce UGM institutional emails only
    if (!email.endsWith('@ugm.ac.id') && !email.endsWith('@mail.ugm.ac.id')) {
        return res.status(403).json({ error: 'Hanya email institusi UGM yang diizinkan.' });
    }

    try {
        // Automatically generates a salt and hashes the password securely
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate a 6-digit OTP (One Time Password)
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Calculate expiration time (15 minutes from exactly right now)
        const tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Save the new user to the database as unverified
        const result = await pool.query(
            `INSERT INTO akun (email, password, role, verification_token, token_expires_at) 
             VALUES ($1, $2, $3, $4, $5) RETURNING id_akun, email, role`,
            [email, hashedPassword, role, otpCode, tokenExpiresAt]
        );

        // Send the OTP to the user's email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Kode Verifikasi Akun IdentiFace Anda',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h3>Selamat datang di IdentiFace!</h3>
                    <p>Kode verifikasi Anda adalah:</p>
                    <h1 style="font-size: 36px; letter-spacing: 5px; color: #4F46E5; background: #f3f4f6; padding: 10px; display: inline-block; border-radius: 5px;">${otpCode}</h1>
                    <p>Kode ini berlaku selama <strong>15 menit</strong>. Jangan bagikan kode ini kepada siapa pun.</p>
                </div>
            `
        });

        res.status(201).json({ message: 'Registrasi berhasil! Silakan cek email Anda untuk kode verifikasi.' });
    } catch (error) {
        // Postgres error code 23505 means unique violation (email already exists)
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Email tersebut sudah terdaftar.' });
        }
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server saat registrasi.' });
    }
};

// --- 2. VERIFY OTP FUNCTION ---
const verifyEmail = async (req, res) => {
    const { email, code } = req.body; 

    try {
        // Find the specific user trying to verify
        const result = await pool.query('SELECT * FROM akun WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
        }

        // Check if they are already verified
        if (user.is_verified) {
            return res.status(400).json({ error: 'Akun ini sudah terverifikasi.' });
        }

        // Security Check 2: Does the code match?
        if (user.verification_token !== code) {
            return res.status(400).json({ error: 'Kode verifikasi salah.' });
        }

        // Security Check 3: Is the time right now past the expiration time?
        if (new Date() > new Date(user.token_expires_at)) {
            return res.status(400).json({ error: 'Kode verifikasi sudah kedaluwarsa. Silakan minta kode baru.' });
        }

        // Success! Update the user's status and delete the used OTP
        await pool.query(
            'UPDATE akun SET is_verified = TRUE, verification_token = NULL, token_expires_at = NULL WHERE email = $1',
            [email]
        );

        res.json({ message: 'Verifikasi berhasil! Akun Anda kini aktif dan siap digunakan.' });
    } catch (error) {
        console.error('Verification Error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server saat verifikasi.' });
    }
};

// --- 3. LOGIN FUNCTION ---
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const result = await pool.query('SELECT * FROM akun WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Email atau password salah.' });
        }

        // Security Check 4: Block login if the account hasn't been verified with an OTP
        if (!user.is_verified) {
            return res.status(403).json({ error: 'Akun belum diverifikasi. Silakan masukkan kode OTP Anda.' });
        }

        // Compare the submitted password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Email atau password salah.' });
        }

        // Generate the JWT token (The digital "ticket" for accessing protected routes)
        const token = jwt.sign(
            { id_akun: user.id_akun, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' } // Token automatically expires after 8 hours
        );

        res.json({ message: 'Login berhasil', token, role: user.role });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server saat login.' });
    }
};

module.exports = { register, verifyEmail, login };