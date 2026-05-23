const pool = require('../config/db'); // Adjusted to use the pg pool connection

/**
 * Find mahasiswa by id_akun (from JWT)
 */
const findByIdAkun = async (id_akun) => {
    const result = await pool.query(
        `SELECT m.*, a.email, a.role
         FROM mahasiswa m
         JOIN akun a ON a.id_akun = m.id_akun
         WHERE m.id_akun = $1`,
        [id_akun]
    );
    return result.rows[0] || null;
};

/**
 * Find mahasiswa by NIM
 */
const findByNim = async (nim) => {
    const result = await pool.query(
        `SELECT m.*, a.email
         FROM mahasiswa m
         JOIN akun a ON a.id_akun = m.id_akun
         WHERE m.nim = $1`,
        [nim]
    );
    return result.rows[0] || null;
};

/**
 * Create mahasiswa profile (called after registration + OTP verified)
 */
const create = async ({ id_akun, nim, nama_lengkap, prodi, angkatan }) => {
    const result = await pool.query(
        `INSERT INTO mahasiswa (id_akun, nim, nama_lengkap, prodi, angkatan)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [id_akun, nim, nama_lengkap, prodi, angkatan]
    );
    return result.rows[0];
};

/**
 * Update mahasiswa profile
 */
const updateProfile = async (id_akun, { nama_lengkap, prodi, angkatan }) => {
    const result = await pool.query(
        `UPDATE mahasiswa
         SET nama_lengkap = COALESCE($1, nama_lengkap),
             prodi = COALESCE($2, prodi),
             angkatan = COALESCE($3, angkatan),
             updated_at = NOW()
         WHERE id_akun = $4
         RETURNING *`,
        [nama_lengkap, prodi, angkatan, id_akun]
    );
    return result.rows[0] || null;
};

/**
 * Get all mahasiswa (for admin)
 */
const findAll = async ({ search, prodi, angkatan, limit = 50, offset = 0 } = {}) => {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (search) {
        conditions.push(`(m.nama_lengkap ILIKE $${idx} OR m.nim ILIKE $${idx})`);
        values.push(`%${search}%`);
        idx++;
    }
    if (prodi) {
        conditions.push(`m.prodi = $${idx}`);
        values.push(prodi);
        idx++;
    }
    if (angkatan) {
        conditions.push(`m.angkatan = $${idx}`);
        values.push(parseInt(angkatan, 10));
        idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
        `SELECT COUNT(*) FROM mahasiswa m ${where}`,
        values
    );

    values.push(limit, offset);
    // Use m.data_wajah_embed to check if face is registered instead of a non-existent table
    const result = await pool.query(
        `SELECT m.id_mahasiswa, m.nim, m.nama_lengkap AS nama, m.prodi, m.angkatan, a.email,
                (m.data_wajah_embed IS NOT NULL) AS face_registered
         FROM mahasiswa m
         JOIN akun a ON a.id_akun = m.id_akun
         ${where}
         ORDER BY m.angkatan DESC, m.nama_lengkap ASC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        values
    );

    return {
        total: parseInt(countResult.rows[0].count, 10),
        data: result.rows
    };
};

/**
 * Get today's schedule for a specific student based on their enrolled classes
 * @param {string} nim 
 * @returns {Promise<Array>}
 */
const getTodaySchedule = async (nim) => {
    const query = `
        SELECT 
            sk.id_sesi, 
            mk.nama_mk, 
            sk.waktu_mulai, 
            sk.waktu_selesai, 
            sk.is_active,
            p.status AS status_presensi
        FROM sesi_kelas sk
        JOIN kelas k ON sk.id_kelas = k.id_kelas
        JOIN mata_kuliah mk ON k.id_mk = mk.id_mk
        JOIN kelas_mahasiswa km ON km.id_kelas = k.id_kelas
        LEFT JOIN presensi p ON p.id_sesi = sk.id_sesi AND p.nim = km.nim
        WHERE km.nim = $1 AND sk.tanggal = CURRENT_DATE
        ORDER BY sk.waktu_mulai ASC
    `;
    const result = await pool.query(query, [nim]);
    return result.rows;
};

const getDashboardSummary = async (nim) => {
    const result = await pool.query(`
        SELECT
          (SELECT COUNT(*) FROM sesi_kelas sk
           JOIN kelas k ON sk.id_kelas = k.id_kelas
           JOIN kelas_mahasiswa km ON km.id_kelas = k.id_kelas
           WHERE km.nim = $1 AND sk.tanggal = CURRENT_DATE) AS sesi_hari_ini,
          (SELECT COUNT(DISTINCT k.id_mk) FROM kelas_mahasiswa km
           JOIN kelas k ON k.id_kelas = km.id_kelas WHERE km.nim = $1) AS total_mk,
          ROUND(
            COUNT(p.id_presensi) FILTER (WHERE p.status = 'hadir') * 100.0
            / NULLIF((SELECT COUNT(*) FROM sesi_kelas sk
              JOIN kelas k ON sk.id_kelas = k.id_kelas
              JOIN kelas_mahasiswa km ON km.id_kelas = k.id_kelas
              WHERE km.nim = $1), 0), 1
          ) AS persen_kehadiran,
          COUNT(p.id_presensi) FILTER (WHERE p.status = 'alpha') AS tidak_hadir
        FROM kelas_mahasiswa km
        JOIN kelas k ON k.id_kelas = km.id_kelas
        JOIN sesi_kelas sk ON sk.id_kelas = k.id_kelas
        LEFT JOIN presensi p ON p.id_sesi = sk.id_sesi AND p.nim = km.nim
        WHERE km.nim = $1
    `, [nim]);
    return result.rows[0];
};

module.exports = { 
    findByIdAkun, 
    findByNim, 
    create, 
    updateProfile, 
    findAll, 
    getTodaySchedule,
    getDashboardSummary 
};