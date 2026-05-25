const express = require('express');
const { 
    getTodaySessions, 
    toggleSessionStatus, 
    getLiveAttendance, 
    getDashboardStats 
} = require('../controllers/lecturerController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
// Tambahkan di lecturerRoutes.js Backend
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();
router.use(authenticate);
router.use(authorize('dosen'));

router.get('/sessions/today', getTodaySessions);
router.patch('/session/:id_sesi/status', toggleSessionStatus);
router.get('/dashboard/summary', getDashboardStats);
router.get('/session/:id_sesi/attendance', getLiveAttendance);
// router.patch('/session/:id_sesi/attendance', upload.single('file'), updateAttendanceManual);


module.exports = router;