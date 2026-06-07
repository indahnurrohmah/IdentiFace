const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const authRepository = require('../repositories/authRepository');
const studentRepository = require('../repositories/studentRepository');


/**
 * Login user and generate JWT token
 * Endpoint: POST /api/auth/login
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // 1. Find the user by email
        const account = await authRepository.findByEmail(email);
        if (!account) {
            return res.status(401).json({ success: false, message: 'Email atau password salah.', error: null });
        }

        // 2. Security Check: Block login if unverified
        if (!account.is_verified) {
            return res.status(403).json({ success: false, message: 'Akun belum diverifikasi. Silakan masukkan kode OTP Anda.', error: null });
        }

        // 3. Compare the passwords
        const isMatch = await bcrypt.compare(password, account.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Email atau password salah.', error: null });
        }

        // 4. Generate the JWT token
        const token = jwt.sign(
            { id_akun: account.id_akun, role: account.role, email: account.email },
            process.env.JWT_SECRET,
            { expiresIn: '8h' } 
        );

        // 5. Simpan Token di HTTP-Only Cookie
        res.cookie('token', token, {
            httpOnly: true, // Tidak bisa diakses oleh JavaScript (Aman dari XSS)
            secure: process.env.NODE_ENV === 'production', // Gunakan true jika sudah HTTPS (Production)
            sameSite: 'none', // Mencegah serangan CSRF
            maxAge: 8 * 60 * 60 * 1000 // Kedaluwarsa dalam 8 jam (dalam milidetik)
        });

        // 6. Kirim respons (Tidak perlu lagi mengirimkan string token di dalam JSON)
        res.json({
            success: true,
            message: 'Login berhasil.',
            data: { 
                role: account.role,
                email: account.email,
                id_akun: account.id_akun
            }
        });
    } catch (error) {
        next(error);
    }
};

const logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'none',
        secure: process.env.NODE_ENV === 'production'
    });
    res.json({ success: true, message: 'Logout berhasil' });
};

module.exports = {login, logout};