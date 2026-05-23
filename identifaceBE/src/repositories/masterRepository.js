const pool = require('../config/db');

/**
 * Repository handling CRUD operations for Courses, Classes, and Sessions
 */
const masterRepository = {
    // --- MATA KULIAH CRUD ---
    createCourse: async ({ kode_mk, nama_mk, sks }) => {
        const result = await pool.query(
            'INSERT INTO mata_kuliah (kode_mk, nama_mk, sks) VALUES ($1, $2, $3) RETURNING *',
            [kode_mk, nama_mk, sks]
        );
        return result.rows[0];
    },

    findAllCourses: async () => {
        const result = await pool.query('SELECT * FROM mata_kuliah ORDER BY nama_mk ASC');
        return result.rows;
    },

    updateCourse: async (id_mk, { kode_mk, nama_mk, sks }) => {
        const result = await pool.query(
            `UPDATE mata_kuliah 
             SET kode_mk = COALESCE($1, kode_mk), nama_mk = COALESCE($2, nama_mk), sks = COALESCE($3, sks) 
             WHERE id_mk = $4 RETURNING *`,
            [kode_mk, nama_mk, sks, id_mk]
        );
        return result.rows[0] || null;
    },

    deleteCourse: async (id_mk) => {
        const result = await pool.query('DELETE FROM mata_kuliah WHERE id_mk = $1 RETURNING id_mk', [id_mk]);
        return result.rows[0] || null;
    },

    // --- KELAS CRUD ---
    createClass: async ({ id_mk, id_dosen, tahun_ajaran, semester }) => {
        const result = await pool.query(
            'INSERT INTO kelas (id_mk, id_dosen, tahun_ajaran, semester) VALUES ($1, $2, $3, $4) RETURNING *',
            [id_mk, id_dosen, tahun_ajaran, semester]
        );
        return result.rows[0];
    },

    findAllClasses: async () => {
        const query = `
            SELECT k.id_kelas, k.tahun_ajaran, k.semester, mk.nama_mk, mk.kode_mk, d.nama AS nama_dosen
            FROM kelas k
            JOIN mata_kuliah mk ON k.id_mk = mk.id_mk
            JOIN dosen d ON k.id_dosen = d.id_dosen
            ORDER BY k.tahun_ajaran DESC, mk.nama_mk ASC
        `;
        const result = await pool.query(query);
        return result.rows;
    },

    // --- SESI KELAS CRUD ---
    createSession: async ({ id_kelas, tanggal, waktu_mulai, waktu_selesai }) => {
        const result = await pool.query(
            'INSERT INTO sesi_kelas (id_kelas, tanggal, waktu_mulai, waktu_selesai, is_active) VALUES ($1, $2, $3, $4, FALSE) RETURNING *',
            [id_kelas, tanggal, waktu_mulai, waktu_selesai]
        );
        return result.rows[0];
    },

    deleteSession: async (id_sesi) => {
        const result = await pool.query('DELETE FROM sesi_kelas WHERE id_sesi = $1 RETURNING id_sesi', [id_sesi]);
        return result.rows[0] || null;
    }
};

module.exports = masterRepository;