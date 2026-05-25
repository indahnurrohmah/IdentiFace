const lecturerRepository = require("../repositories/lecturerRepository");
const classRepository = require("../repositories/classRepository");
const attendanceRepository = require("../repositories/attendanceRepository");

/**
 * Fetch today's class sessions for the logged-in lecturer
 * Endpoint: GET /api/lecturer/sessions/today
 */
const getTodaySessions = async (req, res, next) => {
  try {
    const id_akun = req.user.id_akun;

    // 1. Fetch lecturer profile
    const lecturer = await lecturerRepository.findByAccountId(id_akun);
    if (!lecturer) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Profil dosen tidak ditemukan.",
          error: null,
        });
    }

    // 2. Fetch sessions via classRepository
    const sessions = await classRepository.getTodaySessionsByLecturer(
      lecturer.id_dosen,
    );

    res.json({
      success: true,
      message: "Jadwal sesi hari ini berhasil diambil.",
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Start or End a class session
 * Endpoint: PATCH /api/lecturer/session/:id_sesi/status
 */
const toggleSessionStatus = async (req, res, next) => {
  try {
    const { id_sesi } = req.params;
    const { is_active, tipe_sesi, latitude, longitude } = req.body;

    if (typeof is_active !== "boolean") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Status is_active harus berupa boolean.",
        });
    }

    if (is_active && tipe_sesi === "offline" && (!latitude || !longitude)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Koordinat lokasi wajib ada untuk sesi offline.",
        });
    }

    const updatedSession = await classRepository.toggleSessionStatus(
      id_sesi,
      is_active,
      is_active ? tipe_sesi || "offline" : null,
      is_active ? latitude : null,
      is_active ? longitude : null,
    );

    if (!updatedSession) {
      return res
        .status(404)
        .json({ success: false, message: "Sesi kelas tidak ditemukan." });
    }

    res.json({
      success: true,
      message: is_active
        ? `Sesi berhasil dimulai! Mode: ${tipe_sesi === "online" ? "Online" : "Offline"}.`
        : "Sesi kelas telah ditutup.",
      data: updatedSession,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get the live attendance list for a specific class session
 * Endpoint: GET /api/lecturer/session/:id_sesi/attendance
 */
const getLiveAttendance = async (req, res, next) => {
  try {
    const { id_sesi } = req.params;
    const id_akun = req.user.id_akun;

    // 1. Security check: Ensure session belongs to this lecturer
    const isAuthorized = await classRepository.verifySessionLecturer(
      id_sesi,
      id_akun,
    );
    if (!isAuthorized) {
      return res
        .status(403)
        .json({
          success: false,
          message:
            "Akses ditolak. Anda tidak memiliki akses ke sesi kelas ini.",
          error: null,
        });
    }

    // 2. Fetch live attendance data
    const attendanceList =
      await attendanceRepository.getLiveAttendanceBySesi(id_sesi);

    res.json({
      success: true,
      message: "Data presensi berhasil diambil.",
      data: attendanceList,
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const id_akun = req.user.id_akun;
    const lecturer = await lecturerRepository.findByAccountId(id_akun);
    if (!lecturer)
      return res
        .status(404)
        .json({ success: false, message: "Profil dosen tidak ditemukan." });

    const stats = await lecturerRepository.getDashboardSummary(
      lecturer.id_dosen,
    );
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

/**
 * Get logged-in lecturer profile
 * Endpoint: GET /api/lecturer/profile
 */
const getLecturerProfile = async (req, res, next) => {
  try {
    const lecturer = await lecturerRepository.findByAccountId(req.user.id_akun);
    if (!lecturer) {
      return res
        .status(404)
        .json({ success: false, message: "Profil dosen tidak ditemukan." });
    }
    res.json({ success: true, data: lecturer });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTodaySessions,
  toggleSessionStatus,
  getLiveAttendance,
  getDashboardStats,
  getLecturerProfile,
};
