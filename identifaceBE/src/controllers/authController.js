const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const authRepository = require('../repositories/authRepository');
const studentRepository = require('../repositories/studentRepository');

// ==========================================
// EMAIL CONFIGURATION
// ==========================================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS 
    }
});

/**
 * Register a new user account and send OTP
 * Endpoint: POST /api/auth/register
 */
const register = async (req, res, next) => {
    try {
        const { email, password, role, nim, nama_lengkap, prodi, angkatan } = req.body;

        // 1. Security Check: Enforce UGM institutional emails only
        if (!email.endsWith('@ugm.ac.id') && !email.endsWith('@mail.ugm.ac.id')) {
            return res.status(403).json({ success: false, message: 'Hanya email institusi UGM yang diizinkan.', error: null });
        }

        // 2. Check if email already exists proactively
        const existingUser = await authRepository.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email tersebut sudah terdaftar.', error: null });
        }

        // 3. Hash password securely
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Generate a 6-digit OTP and set 15 minutes expiration
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // 5. Save the new unverified user to the database via repository
        const newAccount = await authRepository.createAccount({
            email,
            password: hashedPassword,
            role,
            verificationToken: otpCode,
            tokenExpiresAt
        });

        // 6. Send the OTP to the user's email
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
        
        // 7. Store temporary profile data for students (Optional advancement)
        // Note: For best practice, we hold off creating the student profile until OTP is verified.
        // The frontend should pass nim, nama_lengkap, etc., again during the verify-email step.

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil! Silakan cek email Anda untuk kode verifikasi.',
            data: { email: newAccount.email, role: newAccount.role }
        });
    } catch (error) {
        // Fallback for Postgres unique constraint violation
        if (error.code === '23505') {
            return res.status(400).json({ success: false, message: 'Email tersebut sudah terdaftar.', error: null });
        }
        next(error);
    }
};

/**
 * Verify user email using OTP and finalize profile creation
 * Endpoint: POST /api/auth/verify-email
 */
const verifyEmail = async (req, res, next) => {
    try {
        const { email, code, nim, nama_lengkap, prodi, angkatan } = req.body; 

        // 1. Find the specific user
        const account = await authRepository.findByEmail(email);
        if (!account) {
            return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.', error: null });
        }

        // 2. Check if they are already verified
        if (account.is_verified) {
            return res.status(400).json({ success: false, message: 'Akun ini sudah terverifikasi.', error: null });
        }

        // 3. Security Check: Does the code match?
        if (account.verification_token !== code) {
            return res.status(400).json({ success: false, message: 'Kode verifikasi salah.', error: null });
        }

        // 4. Security Check: Is the token expired?
        if (new Date() > new Date(account.token_expires_at)) {
            return res.status(400).json({ success: false, message: 'Kode verifikasi sudah kedaluwarsa. Silakan minta kode baru.', error: null });
        }

        // 5. Update the user's status and delete the used OTP in DB
        const verifiedAccount = await authRepository.verifyAccount(email);

        // 6. Advancement: Automatically create student profile after successful verification
        if (verifiedAccount.role === 'mahasiswa') {
            // Check if profile already exists to prevent duplicate key errors
            const existingStudent = await studentRepository.findByIdAkun(verifiedAccount.id_akun);
            if (!existingStudent && nim && nama_lengkap) {
                await studentRepository.create({
                    id_akun: verifiedAccount.id_akun,
                    nim,
                    nama_lengkap,
                    prodi,
                    angkatan
                });
            }
        }

        res.json({
            success: true, 
            message: 'Verifikasi berhasil! Akun Anda kini aktif dan siap digunakan.',
            data: { email: verifiedAccount.email }
        });
    } catch (error) {
        next(error);
    }
};

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

module.exports = { register, verifyEmail, login, logout };