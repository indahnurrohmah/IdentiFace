const express = require('express');
const { 
    getTodaySessions, 
    toggleSessionStatus, 
    getLiveAttendance, 
    getDashboardStats 
} = require('../controllers/lecturerController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authenticate);
router.use(authorize('dosen'));

router.get('/sessions/today', getTodaySessions);
router.patch('/session/:id_sesi/status', toggleSessionStatus);
router.get('/dashboard/summary', getDashboardStats);
router.get('/session/:id_sesi/attendance', getLiveAttendance);

module.exports = router;