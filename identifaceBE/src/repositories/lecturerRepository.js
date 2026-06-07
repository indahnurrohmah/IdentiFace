const pool = require('../config/db');

/**
 * Repository handling all database operations for Lecturers
 */
const lecturerRepository = {
    /**
     * Find lecturer profile by their linked account ID
     * @param {number} id_akun 
     * @returns {Promise<object|null>}
     */
    findByAccountId: async (id_akun) => {
        const result = await pool.query('SELECT * FROM dosen WHERE id_akun = $1', [id_akun]);
        return result.rows[0] || null;
    },
};

/**
 * Get daily dashboard summary statistics for a lecturer
 * @param {number} id_dosen 
 * @returns {Promise<object>}
 */
const getDashboardSummary = async (id_dosen) => {
    const query = `
        WITH today_sessions AS (
            SELECT sk.id_sesi, k.id_kelas
            FROM sesi_kelas sk
            JOIN kelas k ON sk.id_kelas = k.id_kelas
            WHERE k.id_dosen = $1 AND sk.tanggal = CURRENT_DATE
        ),
        student_count AS (
            SELECT COUNT(km.nim) AS total_mahasiswa
            FROM kelas_mahasiswa km
            JOIN today_sessions ts ON km.id_kelas = ts.id_kelas
        ),
        attendance_stats AS (
            SELECT 
                COUNT(p.id_presensi) FILTER (WHERE p.status = 'hadir') AS hadir,
                -- Kita hitung total yang sudah absen (hadir/izin/alpha)
                COUNT(p.id_presensi) FILTER (WHERE p.status IN ('alpha', 'izin')) AS tidak_hadir
            FROM today_sessions ts
            LEFT JOIN presensi p ON p.id_sesi = ts.id_sesi
        )
        SELECT 
            (SELECT COUNT(*) FROM today_sessions) AS sesi_hari_ini,
            COALESCE((SELECT total_mahasiswa FROM student_count), 0) AS total_mahasiswa,
            COALESCE((SELECT hadir FROM attendance_stats), 0) AS hadir,
            COALESCE((SELECT tidak_hadir FROM attendance_stats), 0) AS tidak_hadir
    `;
    const result = await pool.query(query, [id_dosen]);
    return result.rows[0];
};

module.exports = { ...lecturerRepository, getDashboardSummary };