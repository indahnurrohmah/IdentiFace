const pool = require('../config/supabase');

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
const create = async ({ id_akun, nim, nama, prodi, angkatan }) => {
    const result = await pool.query(
        `INSERT INTO mahasiswa (id_akun, nim, nama, prodi, angkatan)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [id_akun, nim, nama, prodi, angkatan]
    );
    return result.rows[0];
};

/**
 * Update mahasiswa profile
 */
const updateProfile = async (id_akun, { nama, prodi, angkatan }) => {
    const result = await pool.query(
        `UPDATE mahasiswa
         SET nama = COALESCE($1, nama),
             prodi = COALESCE($2, prodi),
             angkatan = COALESCE($3, angkatan),
             updated_at = NOW()
         WHERE id_akun = $4
         RETURNING *`,
        [nama, prodi, angkatan, id_akun]
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
        conditions.push(`(m.nama ILIKE $${idx} OR m.nim ILIKE $${idx})`);
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
    const result = await pool.query(
        `SELECT m.id_mahasiswa, m.nim, m.nama, m.prodi, m.angkatan, a.email,
                fr.is_registered AS face_registered
         FROM mahasiswa m
         JOIN akun a ON a.id_akun = m.id_akun
         LEFT JOIN face_registrations fr ON fr.nim = m.nim
         ${where}
         ORDER BY m.angkatan DESC, m.nama ASC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        values
    );

    return {
        total: parseInt(countResult.rows[0].count, 10),
        data: result.rows
    };
};

module.exports = { findByIdAkun, findByNim, create, updateProfile, findAll };