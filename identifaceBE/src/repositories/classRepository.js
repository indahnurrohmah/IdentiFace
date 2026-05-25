const pool = require("../config/db");

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
                sk.tanggal,
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
  toggleSessionStatus: async (
    id_sesi,
    isActive,
    tipeSesi = null,
    latitude = null,
    longitude = null,
  ) => {
    let query, params;
    if (isActive && tipeSesi) {
      query = `UPDATE sesi_kelas 
                 SET is_active = $1, tipe_sesi = $2, latitude_dosen = $3, longitude_dosen = $4 
                 WHERE id_sesi = $5 
                 RETURNING id_sesi, is_active, tipe_sesi`;
      params = [isActive, tipeSesi, latitude, longitude, id_sesi];
    } else {
      query = `UPDATE sesi_kelas SET is_active = $1 WHERE id_sesi = $2 RETURNING id_sesi, is_active, tipe_sesi`;
      params = [isActive, id_sesi];
    }
    const result = await pool.query(query, params);
    return result.rows[0] || null;
  },

  getSessionById: async (id_sesi) => {
    const result = await pool.query(
      "SELECT id_sesi, is_active, tipe_sesi, latitude_dosen, longitude_dosen FROM sesi_kelas WHERE id_sesi = $1",
      [id_sesi],
    );
    return result.rows[0] || null;
  },

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
  },
};

module.exports = classRepository;
