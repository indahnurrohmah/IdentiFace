const aiService = require('../services/aiService');
const fs = require('fs');

/**
 * Register student face data to the AI system
 * Endpoint: POST /api/admin/face-data/:nim/register
 */
const registerFaceData = async (req, res, next) => {
    try {
        const { nim } = req.params;

        // 1. Check if a file was uploaded via Multer
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'Foto wajah wajib diunggah.',
                error: null
            });
        }

        // 2. Send the uploaded file to the Python API using aiService
        const aiResponse = await aiService.registerFace(nim, req.file.path);

        // 3. Clean up the temporary file in Node.js 
        // We use a small try-catch block to prevent server crashes if deletion fails
        try {
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        } catch (cleanupErr) {
            console.error('[Admin Controller] Failed to delete temporary file:', cleanupErr.message);
        }

        // 4. Handle rejection from the AI service (e.g., no face detected, multiple faces)
        if (!aiResponse.success) {
            return res.status(400).json({
                success: false,
                message: aiResponse.message || 'Gagal mendaftarkan wajah.',
                error: aiResponse.raw
            });
        }

        // 5. If registration is fully successful
        res.json({
            success: true,
            message: 'Data wajah berhasil didaftarkan dan disimpan ke database!',
            data: { nim: nim }
        });

    } catch (error) {
        // Pass the error to the global errorHandler 
        // (which will also automatically clean up req.file if it still exists)
        next(error); 
    }
};

/**
 * Update attendance status manually and upload proof
 * Endpoint: PATCH /api/admin/attendance/:id_presensi/status
 */
const updateAttendanceManual = async (req, res, next) => {
    try {
        const { id_presensi } = req.params;
        const { status } = req.body;
        // File path jika ada upload bukti
        const bukti_url = req.file ? `/uploads/bukti/${req.file.filename}` : null;

        const updated = await attendanceRepository.updateAttendanceStatus(id_presensi, { status, bukti_url });

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Data presensi tidak ditemukan.', error: null });
        }

        res.json({
            success: true,
            message: 'Status presensi berhasil diperbarui.',
            data: updated
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all students with pagination and optional filters
 * Endpoint: GET /api/admin/students
 */
const getAllStudents = async (req, res, next) => {
    try {
        const { search, prodi, angkatan, limit, page } = req.query;
        
        const parsedLimit = parseInt(limit, 10) || 50;
        const parsedPage = parseInt(page, 10) || 1;
        const offset = (parsedPage - 1) * parsedLimit;

        const students = await studentRepository.findAll({
            search,
            prodi,
            angkatan,
            limit: parsedLimit,
            offset
        });

        res.json({ success: true, message: 'Data mahasiswa berhasil diambil.', data: students });
    } catch (error) {
        next(error);
    }
};

/**
 * Get detailed attendance report timeline for admin
 * Endpoint: GET /api/admin/attendance/report
 */
const getAttendanceReport = async (req, res, next) => {
    try {
        const { prodi, angkatan, id_mk, from_date, to_date, limit, page } = req.query;
        
        const parsedLimit = parseInt(limit, 10) || 100;
        const offset = ((parseInt(page, 10) || 1) - 1) * parsedLimit;

        const report = await attendanceRepository.getAdminReport({
            prodi, angkatan, id_mk, from_date, to_date, limit: parsedLimit, offset
        });

        res.json({ success: true, message: 'Laporan presensi berhasil diambil.', data: report });
    } catch (error) {
        next(error);
    }
};

/**
 * Get summarized attendance stats per student for admin
 * Endpoint: GET /api/admin/attendance/summary
 */
const getAttendanceSummary = async (req, res, next) => {
    try {
        const { prodi, angkatan, id_mk } = req.query;

        const summary = await attendanceRepository.getAdminSummary({ prodi, angkatan, id_mk });

        res.json({ success: true, message: 'Ringkasan presensi berhasil diambil.', data: summary });
    } catch (error) {
        next(error);
    }
};

module.exports = { 
    registerFaceData, 
    updateAttendanceManual, 
    getAllStudents, 
    getAttendanceReport, 
    getAttendanceSummary 
};