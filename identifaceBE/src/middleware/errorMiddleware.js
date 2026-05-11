const multer = require('multer');

/**
 * Centralized error handling middleware.
 * Must be registered LAST in Express app (after all routes).
 */
const errorHandler = (err, req, res, next) => {
    // Clean up temp file if upload failed mid-request
    if (req.file && req.file.path) {
        const fs = require('fs');
        fs.unlink(req.file.path, () => {});
    }

    // Multer file size limit exceeded
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: `Ukuran file terlalu besar. Maksimum ${process.env.UPLOAD_MAX_SIZE_MB || 5}MB.`,
                error: null
            });
        }
        return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`,
            error: null
        });
    }

    // File type validation error (thrown by multer fileFilter)
    if (err.message && err.message.includes('Tipe file tidak diizinkan')) {
        return res.status(400).json({
            success: false,
            message: err.message,
            error: null
        });
    }

    // PostgreSQL unique violation
    if (err.code === '23505') {
        return res.status(409).json({
            success: false,
            message: 'Data sudah ada (duplikat).',
            error: null
        });
    }

    // PostgreSQL foreign key violation
    if (err.code === '23503') {
        return res.status(400).json({
            success: false,
            message: 'Referensi data tidak valid.',
            error: null
        });
    }

    // Log full error in development only
    if (process.env.NODE_ENV !== 'production') {
        console.error('[Error Handler]', err);
    }

    // Generic server error
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Terjadi kesalahan pada server.',
        error: process.env.NODE_ENV === 'development' ? {
            stack: err.stack,
            code: err.code
        } : null
    });
};

/**
 * 404 handler for unmatched routes
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} tidak ditemukan.`,
        error: null
    });
};

module.exports = { errorHandler, notFoundHandler };