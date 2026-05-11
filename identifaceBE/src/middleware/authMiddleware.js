const jwt = require('jsonwebtoken');

/**
 * Verify JWT token and attach decoded payload to req.user
 */
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Akses ditolak. Token tidak ditemukan.',
            error: null
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id_akun, role, iat, exp }
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token sudah kedaluwarsa. Silakan login kembali.',
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