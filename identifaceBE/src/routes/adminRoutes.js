const express = require('express');
const { 
    registerFaceData, 
    getAllStudents, 
    getAttendanceReport, 
    getAttendanceSummary,
    updateAttendanceManual 
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');


const router = express.Router();

// Protect routes: Logged-in 'admin' only
router.use(authenticate);
router.use(authorize('admin'));

/**
 * Get all students with pagination and optional filters
 * Endpoint: GET /api/admin/students
 */
router.get('/students', getAllStudents);

/**
 * Register student face data to the AI system
 * Endpoint: POST /api/admin/face-data/:nim/register
 */
router.post('/face-data/:nim/register', upload.single('file'), registerFaceData);

/**
 * Get detailed attendance report timeline for admin
 * Endpoint: GET /api/admin/attendance/report
 */
router.get('/attendance/report', getAttendanceReport);

/**
 * Get summarized attendance stats per student for admin
 * Endpoint: GET /api/admin/attendance/summary
 */
router.get('/attendance/summary', getAttendanceSummary);

/**
 * Manual update attendance status by Admin (tombol +/- di UI)
 * Endpoint: PATCH /api/admin/attendance/:id_presensi/status
 */
router.patch('/attendance/:id_presensi/status', upload.single('bukti'), updateAttendanceManual);

module.exports = router;