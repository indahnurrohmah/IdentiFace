const jwt = require('jsonwebtoken');

/**
 * Verify JWT token from Cookie (or Header fallback) and attach decoded payload to req.user
 */
const authenticate = (req, res, next) => {
    // 1. Coba ambil token dari HTTP-Only Cookie terlebih dahulu
    let token = req.cookies?.token;

    // 2. Fallback: Jika tidak ada di cookie, coba cari di Header 
    // (Berguna jika kamu sedang testing di Postman pakai Bearer Token)
    const authHeader = req.headers['authorization'];
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    // Jika token benar-benar tidak ada di keduanya
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Akses ditolak. Token tidak ditemukan.',
            error: null
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id_akun, role, email, iat, exp }
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token sudah kadaluarsa. Silakan login kembali.',
                error: null
            });
        }
        return res.status(401).json({
            success: false,
            message: 'Token tidak valid.',
            error: null
        });
    }
};

/**
 * Role-based access control
 * @param {...string} roles - allowed roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Autentikasi diperlukan.',
                error: null
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Akses ditolak. Hanya role [${roles.join(', ')}] yang diizinkan.`,
                error: null
            });
        }

        next();
    };
};

module.exports = { authenticate, authorize };