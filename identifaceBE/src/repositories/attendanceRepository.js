const pool = require('../config/supabase');

/**
 * Get active sesi (ongoing presensi) for a given kelas
 * A sesi is active when is_active=true AND today is its date
 */
const findActiveSesi = async (id_kelas) => {
    const result = await pool.query(
        `SELECT s.*, k.id_mk, mk.nama_mk, mk.kode_mk
         FROM sesi_kelas s
         JOIN kelas k ON k.id_kelas = s.id_kelas
         JOIN mata_kuliah mk ON mk.id_mk = k.id_mk
         WHERE s.id_kelas = $1
           AND s.is_active = TRUE
           AND s.tanggal = CURRENT_DATE`,
        [id_kelas]
    );
    return result.rows[0] || null;
};

/**
 * Find any active sesi for mahasiswa enrolled in
 * (used during scan to find which kelas is open)
 */
const findActiveSesiForMahasiswa = async (nim) => {
    const result = await pool.query(
        `SELECT s.*, k.id_mk, mk.nama_mk, mk.kode_mk, k.id_kelas
         FROM sesi_kelas s
         JOIN kelas k ON k.id_kelas = s.id_kelas
         JOIN mata_kuliah mk ON mk.id_mk = k.id_mk
         JOIN kelas_mahasiswa km ON km.id_kelas = k.id_kelas
         WHERE km.nim = $1
           AND s.is_active = TRUE
           AND s.tanggal = CURRENT_DATE
         LIMIT 1`,
        [nim]
    );
    return result.rows[0] || null;
};

/**
 * Get today's attendance record for a mahasiswa in a sesi
 */
const findByNimAndSesi = async (nim, id_sesi) => {
    const result = await pool.query(
        'SELECT * FROM attendance WHERE nim = $1 AND id_sesi = $2',
        [nim, id_sesi]
    );
    return result.rows[0] || null;
};

/**
 * Insert or update attendance record
 */
const upsertAttendance = async ({ id_sesi, nim, status, waktu_scan, foto_scan_url }) => {
    const result = await pool.query(
        `INSERT INTO attendance (id_sesi, nim, status, waktu_scan, foto_scan_url)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id_sesi, nim) DO UPDATE
         SET status = $3, waktu_scan = $4, foto_scan_url = $5
         RETURNING *`,
        [id_sesi, nim, status, waktu_scan, foto_scan_url]
    );
    return result.rows[0];
};

/**
 * Get attendance history for a mahasiswa
 * with optional filters
 */
const getHistoryByNim = async (nim, { id_mk, from_date, to_date, limit = 50, offset = 0 } = {}) => {
    const conditions = ['a.nim = $1'];
    const values = [nim];
    let idx = 2;

    if (id_mk) {
        conditions.push(`k.id_mk = $${idx}`);
        values.push(id_mk);
        idx++;
    }
    if (from_date) {
        conditions.push(`s.tanggal >= $${idx}`);
        values.push(from_date);
        idx++;
    }
    if (to_date) {
        conditions.push(`s.tanggal <= $${idx}`);
        values.push(to_date);
        idx++;
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await pool.query(
        `SELECT COUNT(*)
         FROM attendance a
         JOIN sesi_kelas s ON s.id_sesi = a.id_sesi
         JOIN kelas k ON k.id_kelas = s.id_kelas
         ${where}`,
        values
    );

    values.push(limit, offset);
    const result = await pool.query(
        `SELECT
           a.id_attendance,
           a.status,
           a.waktu_scan,
           s.tanggal,
           s.waktu_mulai,
           s.waktu_selesai,
           mk.kode_mk,
           mk.nama_mk,
           mk.sks,
           d.nama AS nama_dosen
         FROM attendance a
         JOIN sesi_kelas s ON s.id_sesi = a.id_sesi
         JOIN kelas k ON k.id_kelas = s.id_kelas
         JOIN mata_kuliah mk ON mk.id_mk = k.id_mk
         JOIN dosen d ON d.id_dosen = k.id_dosen
         ${where}
         ORDER BY s.tanggal DESC, s.waktu_mulai DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        values
    );

    return {
        total: parseInt(countResult.rows[0].count, 10),
        data: result.rows
    };
};

/**
 * Get attendance summary stats for a mahasiswa
 */
const getSummaryByNim = async (nim) => {
    const result = await pool.query(
        `SELECT
           mk.nama_mk,
           mk.kode_mk,
           COUNT(a.id_attendance) FILTER (WHERE a.status = 'hadir') AS hadir,
           COUNT(a.id_attendance) FILTER (WHERE a.status = 'izin')  AS izin,
           COUNT(a.id_attendance) FILTER (WHERE a.status = 'alpha') AS alpha,
           COUNT(s.id_sesi) AS total_sesi
         FROM kelas_mahasiswa km
         JOIN kelas k ON k.id_kelas = km.id_kelas
         JOIN mata_kuliah mk ON mk.id_mk = k.id_mk
         JOIN sesi_kelas s ON s.id_kelas = k.id_kelas
         LEFT JOIN attendance a ON a.id_sesi = s.id_sesi AND a.nim = km.nim
         WHERE km.nim = $1
         GROUP BY mk.id_mk, mk.nama_mk, mk.kode_mk
         ORDER BY mk.nama_mk`,
        [nim]
    );
    return result.rows;
};

/**
 * Get attendance report for admin
 * with filters: prodi, angkatan, id_mk, from_date, to_date
 */
const getAdminReport = async ({ prodi, angkatan, id_mk, from_date, to_date, limit = 100, offset = 0 } = {}) => {
    const conditions = [];
    const values = [];
    let idx = 1;

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
    if (id_mk) {
        conditions.push(`mk.id_mk = $${idx}`);
        values.push(parseInt(id_mk, 10));
        idx++;
    }
    if (from_date) {
        conditions.push(`s.tanggal >= $${idx}`);
        values.push(from_date);
        idx++;
    }
    if (to_date) {
        conditions.push(`s.tanggal <= $${idx}`);
        values.push(to_date);
        idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
        `SELECT COUNT(DISTINCT m.nim)
         FROM mahasiswa m
         JOIN kelas_mahasiswa km ON km.nim = m.nim
         JOIN kelas k ON k.id_kelas = km.id_kelas
         JOIN mata_kuliah mk ON mk.id_mk = k.id_mk
         JOIN sesi_kelas s ON s.id_kelas = k.id_kelas
         LEFT JOIN attendance a ON a.id_sesi = s.id_sesi AND a.nim = m.nim
         ${where}`,
        values
    );

    values.push(limit, offset);
    const result = await pool.query(
        `SELECT
           m.nim,
           m.nama,
           m.prodi,
           m.angkatan,
           mk.kode_mk,
           mk.nama_mk,
           s.tanggal,
           a.status,
           a.waktu_scan,
           d.nama AS nama_dosen
         FROM mahasiswa m
         JOIN kelas_mahasiswa km ON km.nim = m.nim
         JOIN kelas k ON k.id_kelas = km.id_kelas
         JOIN mata_kuliah mk ON mk.id_mk = k.id_mk
         JOIN dosen d ON d.id_dosen = k.id_dosen
         JOIN sesi_kelas s ON s.id_kelas = k.id_kelas
         LEFT JOIN attendance a ON a.id_sesi = s.id_sesi AND a.nim = m.nim
         ${where}
         ORDER BY s.tanggal DESC, m.nama ASC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        values
    );

    return {
        total: parseInt(countResult.rows[0].count, 10),
        data: result.rows
    };
};

/**
 * Get attendance summary per mahasiswa per mk (for admin export / summary view)
 */
const getAdminSummary = async ({ prodi, angkatan, id_mk } = {}) => {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (prodi) {
        conditions.push(`m.prodi = $${idx++}`);
        values.push(prodi);
    }
    if (angkatan) {
        conditions.push(`m.angkatan = $${idx++}`);
        values.push(parseInt(angkatan, 10));
    }
    if (id_mk) {
        conditions.push(`mk.id_mk = $${idx++}`);
        values.push(parseInt(id_mk, 10));
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await pool.query(
        `SELECT
           m.nim,
           m.nama,
           m.prodi,
           m.angkatan,
           mk.kode_mk,
           mk.nama_mk,
           COUNT(s.id_sesi) AS total_pertemuan,
           COUNT(a.id_attendance) FILTER (WHERE a.status = 'hadir') AS hadir,
           COUNT(a.id_attendance) FILTER (WHERE a.status = 'izin')  AS izin,
           COUNT(s.id_sesi) - COUNT(a.id_attendance) FILTER (WHERE a.status IN ('hadir','izin')) AS alpha,
           ROUND(
             COUNT(a.id_attendance) FILTER (WHERE a.status = 'hadir') * 100.0
             / NULLIF(COUNT(s.id_sesi), 0), 1
           ) AS persentase_kehadiran
         FROM mahasiswa m
         JOIN kelas_mahasiswa km ON km.nim = m.nim
         JOIN kelas k ON k.id_kelas = km.id_kelas
         JOIN mata_kuliah mk ON mk.id_mk = k.id_mk
         JOIN sesi_kelas s ON s.id_kelas = k.id_kelas
         LEFT JOIN attendance a ON a.id_sesi = s.id_sesi AND a.nim = m.nim
         ${where}
         GROUP BY m.nim, m.nama, m.prodi, m.angkatan, mk.id_mk, mk.kode_mk, mk.nama_mk
         ORDER BY m.angkatan DESC, m.nama ASC, mk.nama_mk ASC`,
        values
    );

    return result.rows;
};

module.exports = {
    findActiveSesi,
    findActiveSesiForMahasiswa,
    findByNimAndSesi,
    upsertAttendance,
    getHistoryByNim,
    getSummaryByNim,
    getAdminReport,
    getAdminSummary
};