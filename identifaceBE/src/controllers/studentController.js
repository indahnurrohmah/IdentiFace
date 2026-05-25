const studentRepository = require('../repositories/studentRepository');
const attendanceRepository = require('../repositories/attendanceRepository');
const aiService = require('../services/aiService');
const fs = require('fs');
/**
 * Get today's class schedule for the logged-in student
 * Endpoint: GET /api/student/dashboard/today
 */
const getStudentTodaySessions = async (req, res, next) => {
    try {
        const student = await studentRepository.findByIdAkun(req.user.id_akun);
        if (!student) return res.status(404).json({ success: false, message: 'Profil tidak ditemukan.' });

        const schedule = await studentRepository.getTodaySchedule(student.nim);
        res.json({ success: true, message: 'Jadwal hari ini diambil.', data: schedule });
    } catch (error) {
        next(error);
    }
};

/**
 * Get attendance history timeline
 */
const getAttendanceHistory = async (req, res, next) => {
    try {
        const student = await studentRepository.findByIdAkun(req.user.id_akun);
        const history = await attendanceRepository.getHistoryByNim(student.nim);
        res.json({ success: true, data: history });
    } catch (error) {
        next(error);
    }
};

/**
 * Get attendance summary stats
 */
const getAttendanceSummary = async (req, res, next) => {
    try {
        const student = await studentRepository.findByIdAkun(req.user.id_akun);
        const summary = await attendanceRepository.getSummaryByNim(student.nim);
        res.json({ success: true, data: summary });
    } catch (error) {
        next(error);
    }
};

/**
 * Scan face for attendance
 * Endpoint: POST /api/student/attendance/scan
 */
const scanAttendance = async (req, res, next) => {
    try {
        const { latitude, longitude, id_sesi } = req.body;
        const id_akun = req.user.id_akun;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Foto wajah wajib diunggah.' });
        }

        // 1. Get student profile by account ID
        const student = await studentRepository.findByIdAkun(id_akun);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Profil mahasiswa tidak ditemukan.' });
        }

        // 2. Call AI service for face recognition
        const aiResponse = await aiService.verifyFace(student.nim, req.file.path);
        
        // Clean up temp file
        try { if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path); } catch (err) {}

        if (!aiResponse.success) {
            return res.status(400).json({ success: false, message: aiResponse.message || 'Wajah tidak dikenali.' });
        }

        // 3. Save attendance record to database
        const attendance = await attendanceRepository.saveAttendance({
            nim: student.nim,
            id_sesi,
            status: 'hadir',
            kordinat: `${latitude},${longitude}`
        });

        res.json({
            success: true,
            message: 'Presensi berhasil dicatat!',
            data: attendance
        });
    } catch (error) {
        next(error);
    }
};

const getStudentDashboardSummary = async (req, res, next) => {
    try {
        const student = await studentRepository.findByIdAkun(req.user.id_akun);
        if (!student) return res.status(404).json({ success: false, message: 'Profil tidak ditemukan.' });
        const summary = await studentRepository.getDashboardSummary(student.nim);
        res.json({ success: true, data: summary });
    } catch (error) { next(error); }
};
/**
 * Get logged-in student profile (NIM, Nama, Prodi)
 * Endpoint: GET /api/student/profile
 */
const getStudentProfile = async (req, res, next) => {
    try {
        const student = await studentRepository.findByIdAkun(req.user.id_akun);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Profil tidak ditemukan.' });
        }
        res.json({ success: true, data: student });
    } catch (error) {
        next(error);
    }
};

module.exports = { 
    getStudentTodaySessions, 
    getAttendanceHistory, 
    getAttendanceSummary,
    scanAttendance,
    getStudentDashboardSummary,
    getStudentProfile
};