const express = require('express');
const { addCourse, getCourses, editCourse, removeCourse, addClass, addSession } = require('../controllers/masterController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes: Logged-in 'admin' only
router.use(authenticate);
router.use(authorize('admin'));

/**
 * Manage course master data
 * Endpoints: GET/POST/PUT/DELETE /api/admin/master/courses
 */
router.post('/courses', addCourse);
router.get('/courses', getCourses);
router.put('/courses/:id_mk', editCourse);
router.delete('/courses/:id_mk', removeCourse);

/**
 * Create a new class linked to a course and lecturer
 * Endpoint: POST /api/admin/master/classes
 */
router.post('/classes', addClass);

/**
 * Schedule a new class session
 * Endpoint: POST /api/admin/master/sessions
 */
router.post('/sessions', addSession);

module.exports = router;