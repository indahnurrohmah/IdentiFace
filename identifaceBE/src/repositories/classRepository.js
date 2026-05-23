const pool = require('../config/db');

/**
 * Repository handling all database operations for Classes, Courses, and Sessions
 */
const classRepository = {
    /**
     * Fetch today's class sessions for a specific lecturer
     * @param {number} id_dosen 
     * @returns {Promise<Array>}
     */
    getTodaySessionsByLecturer: async (id_dosen) => {
        const query = `
            SELECT 
                sk.id_sesi, 
                mk.nama_mk, 
                mk.kode_mk,
                k.tahun_ajaran, 
                k.semester, 
                sk.waktu_mulai, 
                sk.waktu_selesai, 
                sk.is_active
            FROM sesi_kelas sk
            JOIN kelas k ON sk.id_kelas = k.id_kelas
            JOIN mata_kuliah mk ON k.id_mk = mk.id_mk
            WHERE k.id_dosen = $1 AND sk.tanggal = CURRENT_DATE
            ORDER BY sk.waktu_mulai ASC
        `;
        const result = await pool.query(query, [id_dosen]);
        return result.rows;
    },

    /**
     * Start or End a class session (Toggle is_active)
     */
    toggleSessionStatus: async (id_sesi, isActive) => {
        const result = await pool.query(
            'UPDATE sesi_kelas SET is_active = $1 WHERE id_sesi = $2 RETURNING id_sesi, is_active',
            [isActive, id_sesi]
        );
        return result.rows[0] || null;
    },

    /**
     * Security Check: Verify if the class session belongs to the logged-in lecturer account
     */
    verifySessionLecturer: async (id_sesi, id_akun) => {
        const query = `
            SELECT sk.id_sesi 
            FROM sesi_kelas sk
            JOIN kelas k ON sk.id_kelas = k.id_kelas
            JOIN dosen d ON k.id_dosen = d.id_dosen
            WHERE sk.id_sesi = $1 AND d.id_akun = $2
        `;
        const result = await pool.query(query, [id_sesi, id_akun]);
        return result.rows[0] || null;
    }
};

module.exports = classRepository;