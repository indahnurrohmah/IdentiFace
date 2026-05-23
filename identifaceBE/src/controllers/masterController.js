const masterRepository = require('../repositories/masterRepository');

/**
 * Create a new course
 * Endpoint: POST /api/admin/master/courses
 */
const addCourse = async (req, res, next) => {
    try {
        const { kode_mk, nama_mk, sks } = req.body;
        if (!kode_mk || !nama_mk || !sks) {
            return res.status(400).json({ success: false, message: 'Data mata kuliah tidak lengkap.', error: null });
        }
        const course = await masterRepository.createCourse({ kode_mk, nama_mk, sks });
        res.status(201).json({ success: true, message: 'Mata kuliah berhasil ditambahkan.', data: course });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all courses
 * Endpoint: GET /api/admin/master/courses
 */
const getCourses = async (req, res, next) => {
    try {
        const courses = await masterRepository.findAllCourses();
        res.json({ success: true, message: 'Daftar mata kuliah berhasil diambil.', data: courses });
    } catch (error) {
        next(error);
    }
};

/**
 * Update a course
 * Endpoint: PUT /api/admin/master/courses/:id_mk
 */
const editCourse = async (req, res, next) => {
    try {
        const { id_mk } = req.params;
        const updated = await masterRepository.updateCourse(id_mk, req.body);
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Mata kuliah tidak ditemukan.', error: null });
        }
        res.json({ success: true, message: 'Mata kuliah berhasil diperbarui.', data: updated });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a course
 * Endpoint: DELETE /api/admin/master/courses/:id_mk
 */
const removeCourse = async (req, res, next) => {
    try {
        const { id_mk } = req.params;
        const deleted = await masterRepository.deleteCourse(id_mk);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Mata kuliah tidak ditemukan.', error: null });
        }
        res.json({ success: true, message: 'Mata kuliah berhasil dihapus.', data: deleted });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new class assignment
 * Endpoint: POST /api/admin/master/classes
 */
const addClass = async (req, res, next) => {
    try {
        const { id_mk, id_dosen, tahun_ajaran, semester } = req.body;
        if (!id_mk || !id_dosen || !tahun_ajaran || !semester) {
            return res.status(400).json({ success: false, message: 'Data kelas tidak lengkap.', error: null });
        }
        const newClass = await masterRepository.createClass({ id_mk, id_dosen, tahun_ajaran, semester });
        res.status(201).json({ success: true, message: 'Kelas berhasil dibuat.', data: newClass });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a specific class schedule session
 * Endpoint: POST /api/admin/master/sessions
 */
const addSession = async (req, res, next) => {
    try {
        const { id_kelas, tanggal, waktu_mulai, waktu_selesai } = req.body;
        if (!id_kelas || !tanggal || !waktu_mulai || !waktu_selesai) {
            return res.status(400).json({ success: false, message: 'Data sesi tidak lengkap.', error: null });
        }
        const session = await masterRepository.createSession({ id_kelas, tanggal, waktu_mulai, waktu_selesai });
        res.status(201).json({ success: true, message: 'Sesi kelas berhasil dijadwalkan.', data: session });
    } catch (error) {
        next(error);
    }
};

module.exports = { addCourse, getCourses, editCourse, removeCourse, addClass, addSession };