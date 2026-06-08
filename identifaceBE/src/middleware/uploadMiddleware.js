const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Use /tmp on Azure (always writable), fallback for local dev
const uploadDir = process.env.TEMP_UPLOAD_DIR || 
    (process.platform === 'win32' 
        ? path.join(process.cwd(), 'uploads', 'tmp')  // Windows local dev
        : '/tmp/uploads');                              // Linux/Azure

// Ensure temp upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `face-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedMimes = (process.env.UPLOAD_ALLOWED_TYPES || 'image/jpeg,image/png,image/jpg')
        .split(',')
        .map(t => t.trim());

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Tipe file tidak diizinkan. Hanya ${allowedMimes.join(', ')} yang diterima.`), false);
    }
};

const maxSizeBytes = (parseInt(process.env.UPLOAD_MAX_SIZE_MB, 10) || 5) * 1024 * 1024;

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: maxSizeBytes,
        files: 1
    }
});

module.exports = upload;