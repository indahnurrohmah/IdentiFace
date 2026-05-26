const pool = require('../config/db'); // Adjusted to use the pg pool connection

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
        'SELECT * FROM presensi WHERE nim = $1 AND id_sesi = $2',
        [nim, id_sesi]
    );
    return result.rows[0] || null;
};

/**
 * Insert or update attendance record
 * NOTE: Ensure you have a UNIQUE(id_sesi, nim) constraint on the presensi table!
 */
const upsertAttendance = async ({ id_sesi, nim, status, waktu_scan, similarity, latitude, longitude }) => {
    const result = await pool.query(
        `INSERT INTO presensi (id_sesi, nim, status, waktu_scan, similarity, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id_sesi, nim) DO UPDATE
         SET status = $3, waktu_scan = $4, similarity = $5, latitude = $6, longitude = $7
         RETURNING *`,
        [id_sesi, nim, status, waktu_scan, similarity, latitude, longitude]
    );
    return result.rows[0];
};

/**
 * Get attendance history for a mahasiswa with optional filters
 */
const getHistoryByNim = async (nim, { id_mk, from_date, to_date, limit = 50, offset = 0 } = {}) => {
    const conditions = ['p.nim = $1'];
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
         FROM presensi p
         JOIN sesi_kelas s ON s.id_sesi = p.id_sesi
         JOIN kelas k ON k.id_kelas = s.id_kelas
         ${where}`,
        values
    );

    values.push(limit, offset);
    const result = await pool.query(
        `SELECT
           p.id_presensi,
           p.status,
           p.waktu_scan,
           s.tanggal,
           s.waktu_mulai,
           s.waktu_selesai,
           mk.kode_mk,
           mk.nama_mk,
           mk.sks,
           d.nama AS nama_dosen
         FROM presensi p
         JOIN sesi_kelas s ON s.id_sesi = p.id_sesi
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
           COUNT(p.id_presensi) FILTER (WHERE p.status = 'hadir') AS hadir,
           COUNT(p.id_presensi) FILTER (WHERE p.status = 'izin')  AS izin,
           COUNT(p.id_presensi) FILTER (WHERE p.status = 'alpha') AS alpha,
           COUNT(s.id_sesi) AS total_sesi
         FROM kelas_mahasiswa km
         JOIN kelas k ON k.id_kelas = km.id_kelas
         JOIN mata_kuliah mk ON mk.id_mk = k.id_mk
         JOIN sesi_kelas s ON s.id_kelas = k.id_kelas
         LEFT JOIN presensi p ON p.id_sesi = s.id_sesi AND p.nim = km.nim
         WHERE km.nim = $1
         GROUP BY mk.id_mk, mk.nama_mk, mk.kode_mk
         ORDER BY mk.nama_mk`,
        [nim]
    );
    return result.rows;
};

/**
 * Get attendance report for admin with filters
 */
/**
 * Get attendance report for admin with filters (Mendukung Pencarian Nama & Status)
 */
/**
 * Get attendance report for admin with filters
 */
const getAdminReport = async ({ search, prodi, angkatan, id_mk, status, from_date, to_date, limit = 50, offset = 0 } = {}) => {
    const conditions = [];
    const values = [];
    let idx = 1;

    // Menambahkan filter pencarian
    if (search) {
        conditions.push(`(m.nim ILIKE $${idx} OR m.nama_lengkap ILIKE $${idx})`);
        values.push(`%${search}%`);
        idx++;
    }
    if (prodi) { conditions.push(`m.prodi = $${idx}`); values.push(prodi); idx++; }
    if (angkatan) { conditions.push(`m.angkatan = $${idx}`); values.push(parseInt(angkatan, 10)); idx++; }
    if (id_mk) { conditions.push(`mk.id_mk = $${idx}`); values.push(parseInt(id_mk, 10)); idx++; }
    if (status) { conditions.push(`p.status = $${idx}`); values.push(status); idx++; }
    if (from_date) { conditions.push(`s.tanggal >= $${idx}`); values.push(from_date); idx++; }
    if (to_date) { conditions.push(`s.tanggal <= $${idx}`); values.push(to_date); idx++; }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // 🌟 PERBAIKAN: Ubah COUNT(DISTINCT m.nim) menjadi COUNT(*)
    const countResult = await pool.query(
        `SELECT COUNT(*)
         FROM mahasiswa m
         JOIN kelas_mahasiswa km ON km.nim = m.nim
         JOIN kelas k ON k.id_kelas = km.id_kelas
         JOIN mata_kuliah mk ON mk.id_mk = k.id_mk
         JOIN sesi_kelas s ON s.id_kelas = k.id_kelas
         LEFT JOIN presensi p ON p.id_sesi = s.id_sesi AND p.nim = m.nim
         ${where}`,
        values
    );

    values.push(limit, offset);
    const result = await pool.query(
        `SELECT
           p.id_presensi,       
           s.id_sesi,
           p.bukti_url,         
           m.nim,
           m.nama_lengkap AS nama,
           m.prodi,
           m.angkatan,
           mk.kode_mk,
           mk.nama_mk,
           s.tanggal,
           p.status,
           p.waktu_scan,
           d.nama AS nama_dosen
         FROM mahasiswa m
         JOIN kelas_mahasiswa km ON km.nim = m.nim
         JOIN kelas k ON k.id_kelas = km.id_kelas
         JOIN mata_kuliah mk ON mk.id_mk = k.id_mk
         JOIN dosen d ON d.id_dosen = k.id_dosen
         JOIN sesi_kelas s ON s.id_kelas = k.id_kelas
         LEFT JOIN presensi p ON p.id_sesi = s.id_sesi AND p.nim = m.nim
         ${where}
         ORDER BY s.tanggal DESC, m.nama_lengkap ASC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        values
    );

    return {
        total: parseInt(countResult.rows[0].count, 10),
        data: result.rows
    };
};

/**
 * Get attendance summary per mata kuliah (for admin export / summary view)
 */
const getAdminSummary = async ({ id_mk } = {}) => {
    const conditions = [];
    const values = [];
    let idx = 1;

    // Untuk rekapitulasi mata kuliah, filter yang relevan hanya id_mk
    if (id_mk) {
        conditions.push(`mk.id_mk = $${idx++}`);
        values.push(parseInt(id_mk, 10));
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await pool.query(
        `SELECT
           mk.nama_mk,
           mk.sks,
           d.nama AS nama_dosen,
           COALESCE(k.nama_kelas, 'Belum diatur') AS kelas,
           COUNT(DISTINCT s.id_sesi) AS pertemuan_terlaksana
         FROM kelas k
         JOIN mata_kuliah mk ON k.id_mk = mk.id_mk
         JOIN dosen d ON k.id_dosen = d.id_dosen
         LEFT JOIN sesi_kelas s ON s.id_kelas = k.id_kelas AND s.is_active = false
         ${where}
         GROUP BY mk.nama_mk, mk.sks, k.nama_kelas, d.nama
         ORDER BY mk.nama_mk ASC`,
        values
    );
    return result.rows;
};

/**
 * Get live attendance list for a specific session
 */
/**
 * Get live attendance list for a specific session (Menampilkan semua mahasiswa terdaftar)
 */
const getLiveAttendanceBySesi = async (id_sesi) => {
    const query = `
        SELECT 
            m.nim, 
            m.nama_lengkap AS nama, 
            p.status, 
            p.waktu_scan, 
            p.similarity
        FROM sesi_kelas sk
        JOIN kelas_mahasiswa km ON sk.id_kelas = km.id_kelas
        JOIN mahasiswa m ON km.nim = m.nim
        LEFT JOIN presensi p ON p.id_sesi = sk.id_sesi AND p.nim = m.nim
        WHERE sk.id_sesi = $1
        ORDER BY m.nama_lengkap ASC
    `;
    const result = await pool.query(query, [id_sesi]);
    return result.rows;
};

/**
 * Update attendance status manually by Admin
 */
// const updateAttendanceStatus = async (id_presensi, { status, bukti_url }) => {
//     const result = await pool.query(
//         `UPDATE presensi 
//          SET status = $1, bukti_url = $2, updated_at = NOW() 
//          WHERE id_presensi = $3 
//          RETURNING *`,
//         [status, bukti_url, id_presensi]
//     );
//     return result.rows[0] || null;
// };
/**
 * Update attendance status manually by Admin (Hanya Status)
 */
const updateAttendanceStatus = async (id_presensi, { status }) => {
    const result = await pool.query(
        `UPDATE presensi 
         SET status = $1, updated_at = NOW() 
         WHERE id_presensi = $2 
         RETURNING *`,
        [status, id_presensi]
    );
    return result.rows[0] || null;
};

module.exports = {
    findActiveSesi,
    findActiveSesiForMahasiswa,
    findByNimAndSesi,
    upsertAttendance,
    getHistoryByNim,
    getSummaryByNim,
    getAdminReport,
    getAdminSummary,
    getLiveAttendanceBySesi,
    updateAttendanceStatus
};