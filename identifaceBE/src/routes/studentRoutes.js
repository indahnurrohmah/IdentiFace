const express = require('express');
const { 
    getStudentTodaySessions, 
    getAttendanceHistory, 
    getAttendanceSummary, 
    scanAttendance,
    getStudentDashboardSummary 
} = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();
router.use(authenticate);
router.use(authorize('mahasiswa'));

router.get('/sessions/today', getStudentTodaySessions);
router.get('/attendance/history', getAttendanceHistory);
router.get('/attendance/summary', getAttendanceSummary);
router.post('/attendance/scan', upload.single('file'), scanAttendance);
router.get('/dashboard/summary', getStudentDashboardSummary);

module.exports = router;